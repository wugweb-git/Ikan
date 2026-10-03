import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../shared/api/api';
import type { ProfessionalData } from '../../shared/api/api-types';
import { useNotifications } from '../../shared/state/NotificationContext';
import { EntityEditPage, useEntityEdit } from '../ui/kit/EntityEditPage';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { useAdminAction, useAdminResource } from '../ui/hooks/useAdminResource';
import { AdminActionBar } from '../ui/admin-action-bar';
import {
  type Consultant,
  type ConsultantForm,
  CONSULTANT_SCHEMA,
  EMPTY_CONSULTANT,
  toProfessionalPayload,
  withConsultantDefaults,
} from './consultant-form';
import { ConsultantProfileSections } from './ConsultantProfileSections';
import { ConsultantPracticeSections } from './ConsultantPracticeSections';

export type { Consultant } from './consultant-form';

interface ConsultantEditPageProps {
  consultantId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function ConsultantEditPage({ consultantId, onBack, onSave }: ConsultantEditPageProps) {
  const { showToast } = useNotifications();
  const confirm = useConfirm();
  const edit = useEntityEdit(CONSULTANT_SCHEMA);
  const { errors, validateForm, markAsSaved, markAsUnsaved } = edit;
  const { run, busy: saving } = useAdminAction();

  const [formData, setFormData] = useState<ConsultantForm>(EMPTY_CONSULTANT);
  // The form change caused by loading the record is not an unsaved edit.
  const skipDirty = useRef(false);

  const { loading } = useAdminResource(
    () => apiClient.getProfessional(consultantId!),
    {
      deps: [consultantId],
      enabled: !!consultantId,
      errorTitle: 'Error',
      errorMessage: 'Failed to load consultant data',
      onSuccess: (data: ConsultantForm | undefined) => {
        skipDirty.current = true;
        setFormData(prev => withConsultantDefaults(prev, data || {}));
      },
    },
  );

  useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    if (formData.name || formData.bio || formData.credentials) markAsUnsaved();
  }, [formData, markAsUnsaved]);

  const handleSave = useCallback(async (publish?: boolean) => {
    if (!validateForm(formData)) {
      showToast('error', 'Validation Error', 'Please fix the errors before saving');
      return;
    }
    // ProfessionalData types `pricing` as a number; the consultant form stores per-mode prices.
    const payload = toProfessionalPayload(formData, publish) as unknown as ProfessionalData;
    const res = await run(
      () => (consultantId ? apiClient.updateProfessional(consultantId, payload) : apiClient.createProfessional(payload)),
      {
        success: ['Success', consultantId ? 'Professional updated successfully' : 'Professional created successfully'],
        errorTitle: 'Error',
        errorMessage: 'Failed to save professional',
      },
    );
    if (res.ok) {
      markAsSaved();
      onSave();
    }
  }, [formData, consultantId, validateForm, showToast, run, markAsSaved, onSave]);

  const handleDelete = useCallback(async () => {
    if (!consultantId) return;
    const ok = await confirm({
      title: 'Delete Professional',
      description: `Are you sure you want to delete ${formData.name}? This action cannot be undone.`,
      confirmLabel: 'Delete Professional',
      destructive: true,
    });
    if (!ok) return;
    const res = await run(() => apiClient.deleteProfessional(consultantId), {
      success: ['Success', 'Professional deleted successfully'],
      errorTitle: 'Error',
      errorMessage: 'Failed to delete professional',
    });
    if (res.ok) onSave();
  }, [consultantId, confirm, formData.name, run, onSave]);

  const toggleArray = useCallback((field: keyof Consultant, value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: updated };
    });
  }, []);

  const sectionProps = { formData, setFormData, errors, toggleArray };

  return (
    <EntityEditPage
      edit={edit}
      title={consultantId ? formData.name || 'Edit Professional' : 'New Professional'}
      subtitle={consultantId ? 'Update professional information' : 'Add a new mental health professional'}
      status={formData.available ? { label: 'Available', variant: 'success' } : { label: 'Unavailable', variant: 'warning' }}
      onBack={onBack}
      onSave={() => handleSave()}
      saveLabel={consultantId ? 'Save Changes' : 'Create Professional'}
      saving={saving}
      onDelete={consultantId ? handleDelete : undefined}
      loading={loading}
      loadingMessage="Loading consultant..."
      maxWidth="xl"
    >
      <ConsultantProfileSections {...sectionProps} />
      <ConsultantPracticeSections {...sectionProps} />

      {/* WordPress-Style Action Bar */}
      <AdminActionBar
        onDelete={consultantId ? handleDelete : undefined}
        onCancel={onBack}
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
        isPublished={formData.published || false}
        isSaving={saving}
        showDelete={!!consultantId}
        publishLabel={formData.published ? 'Update' : 'Save and Publish'}
      />
    </EntityEditPage>
  );
}
