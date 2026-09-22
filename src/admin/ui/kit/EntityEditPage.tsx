import type React from 'react';
import { useCallback } from 'react';
import { Save } from 'lucide-react';
import { AdminPageLayout } from '../../shell/AdminPageLayout';
import { useFormValidation, type ValidationSchema } from '../hooks/useFormValidation';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { UnsavedChangesDialog } from '../unsaved-changes-dialog';

/**
 * The frame every "edit one thing" admin screen uses (user, resource,
 * consultant…): AdminPageLayout's edit header + validation + unsaved-changes
 * guard (beforeunload and in-app) + Ctrl/⌘-S to save + Esc to leave.
 *
 *   const edit = useEntityEdit(schema);
 *   // call edit.markAsUnsaved() when the form changes, edit.markAsSaved() after a save
 *   return <EntityEditPage edit={edit} title=… onBack={onBack} onSave={handleSave} …>{form}</EntityEditPage>;
 */

export function useEntityEdit(schema: ValidationSchema) {
  const validation = useFormValidation(schema);
  const unsaved = useUnsavedChanges();
  return { ...validation, ...unsaved };
}

export type EntityEditState = ReturnType<typeof useEntityEdit>;

interface EntityEditPageProps {
  edit: EntityEditState;
  title: string;
  subtitle?: string;
  status?: React.ComponentProps<typeof AdminPageLayout>['status'];
  /** Leave the page (after the unsaved-changes check). */
  onBack: () => void;
  onSave: () => void;
  saveLabel: string;
  saving?: boolean;
  /** Opens the screen's delete flow. Omit (e.g. when creating) to disable Delete. */
  onDelete?: () => void;
  onSaveDraft?: () => void;
  toggleActions?: React.ComponentProps<typeof AdminPageLayout>['toggleActions'];
  loading?: boolean;
  loadingMessage?: string;
  maxWidth?: React.ComponentProps<typeof AdminPageLayout>['maxWidth'];
  children: React.ReactNode;
}

export function EntityEditPage({
  edit,
  title,
  subtitle,
  status,
  onBack,
  onSave,
  saveLabel,
  saving = false,
  onDelete,
  onSaveDraft,
  toggleActions,
  loading = false,
  loadingMessage,
  maxWidth,
  children,
}: EntityEditPageProps) {
  const { hasUnsavedChanges, setShowWarning, showWarning, markAsSaved } = edit;

  const leave = useCallback(() => {
    if (hasUnsavedChanges) setShowWarning(true);
    else onBack();
  }, [hasUnsavedChanges, setShowWarning, onBack]);

  useKeyboardShortcuts(
    {
      'ctrl+s': (e) => { e.preventDefault(); if (!saving && !loading) onSave(); },
      'meta+s': (e) => { e.preventDefault(); if (!saving && !loading) onSave(); },
      escape: () => { if (!showWarning) leave(); },
    },
    [onSave, leave, saving, loading, showWarning],
  );

  return (
    <>
      <AdminPageLayout
        title={loading ? 'Loading...' : title}
        subtitle={loading ? undefined : subtitle}
        status={loading ? undefined : status}
        primaryAction={{
          label: saveLabel,
          icon: <Save className="w-4 h-4" />,
          onClick: onSave,
          loading: saving,
          disabled: loading,
        }}
        onCancel={leave}
        onDelete={loading ? undefined : onDelete}
        onSaveDraft={onSaveDraft}
        toggleActions={loading ? undefined : toggleActions}
        loading={loading}
        loadingMessage={loadingMessage}
        maxWidth={maxWidth}
      >
        {children}
      </AdminPageLayout>

      <UnsavedChangesDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={() => {
          markAsSaved();
          setShowWarning(false);
          onBack();
        }}
      />
    </>
  );
}
