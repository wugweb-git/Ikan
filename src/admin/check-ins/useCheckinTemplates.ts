import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { loadCustomScales, clearScaleCache } from '../ui/lib/emoji-utils';
import type { CheckinStep, CheckinTemplate, StepType } from './checkin-template-types';

/**
 * Data + editing state for the check-in template builder: the template list,
 * the template being edited (a local draft until saved), its step mutations,
 * and the custom-scale cache the Scale/Source dropdown reads.
 */
export function useCheckinTemplates() {
  const { showToast } = useNotifications();
  const confirm = useConfirm();

  const [activeTemplate, setActiveTemplate] = useState<CheckinTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // ── Fetch templates ───────────────────────────────────────────
  const { data: templates, loading, error, reload } = useAdminResource<CheckinTemplate[]>(
    async () => {
      const res = await apiClient.getCheckinTemplates();
      return res?.templates || [];
    },
    {
      initialData: [],
      errorTitle: 'Failed to load templates',
      onSuccess: list => setActiveTemplate(list.find(t => t.is_active) || list[0] || null),
    },
  );

  // ── Custom scales ─────────────────────────────────────────────
  // Load custom scales from KV so the Scale/Source dropdown reflects
  // admin-managed overrides (not just design-token defaults). The dropdown
  // reads a module-level cache, so bump a counter to re-render once it fills.
  const [, setScalesVersion] = useState(0);
  const mounted = useRef(true);
  const toastRef = useRef(showToast);
  toastRef.current = showToast;

  const refreshScales = useCallback(() => {
    const bump = () => { if (mounted.current) setScalesVersion(v => v + 1); };
    loadCustomScales().then(bump, (err: unknown) => {
      console.error('[check-in builder] Failed to load custom scales:', err);
      if (!mounted.current) return;
      toastRef.current('warning', 'Could not load custom scales', 'The Scale / Source list may only show built-in scales.');
      bump();
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    refreshScales();
    return () => { mounted.current = false; };
  }, [refreshScales]);

  const handleScaleCreated = useCallback((_newKey: string) => {
    clearScaleCache();
    refreshScales();
  }, [refreshScales]);

  // ── Template mutations ────────────────────────────────────────
  const selectTemplate = (t: CheckinTemplate) => {
    setActiveTemplate(t);
    setDirty(false);
    setExpandedStepId(null);
  };

  const updateTemplate = (updates: Partial<Pick<CheckinTemplate, 'name' | 'description'>>) => {
    if (!activeTemplate) return;
    setActiveTemplate({ ...activeTemplate, ...updates });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      // Re-order steps
      const ordered = activeTemplate.steps.map((s, i) => ({ ...s, order: i }));
      const payload = { ...activeTemplate, steps: ordered };

      if (templates.find(t => t.id === activeTemplate.id)) {
        await apiClient.updateCheckinTemplate(activeTemplate.id, payload);
      } else {
        await apiClient.createCheckinTemplate(payload);
      }
      showToast('success', 'Template saved');
      setDirty(false);
      await reload();
    } catch (err) {
      console.error('Save template error:', err);
      showToast('error', 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await apiClient.activateCheckinTemplate(id);
      showToast('success', 'Template activated');
      await reload();
    } catch (err) {
      console.error('Activate error:', err);
      showToast('error', 'Failed to activate template');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'default') { showToast('error', 'Cannot delete default template'); return; }
    if (!(await confirm({
      title: 'Delete this template?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    }))) return;
    try {
      await apiClient.deleteCheckinTemplate(id);
      showToast('success', 'Template deleted');
      await reload();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('error', 'Failed to delete template');
    }
  };

  const handleNewTemplate = async () => {
    const name = prompt('Template name:', 'New Check-in');
    if (!name) return;
    try {
      const res = await apiClient.createCheckinTemplate({
        name,
        description: '',
        steps: [],
        is_active: false,
      });
      showToast('success', 'Template created');
      await reload();
      if (res?.template) setActiveTemplate(res.template);
    } catch (err) {
      console.error('Create error:', err);
      showToast('error', 'Failed to create template');
    }
  };

  // ── Step mutations ────────────────────────────────────────────
  const setSteps = (steps: CheckinStep[]) => {
    if (!activeTemplate) return;
    setActiveTemplate({ ...activeTemplate, steps: steps.map((s, i) => ({ ...s, order: i })) });
    setDirty(true);
  };

  const updateStep = (stepId: string, updates: Partial<CheckinStep>) => {
    if (!activeTemplate) return;
    setActiveTemplate({
      ...activeTemplate,
      steps: activeTemplate.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
    });
    setDirty(true);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    if (!activeTemplate) return;
    const steps = [...activeTemplate.steps];
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    [steps[index], steps[target]] = [steps[target], steps[index]];
    setSteps(steps);
  };

  const duplicateStep = (index: number) => {
    if (!activeTemplate) return;
    const orig = activeTemplate.steps[index];
    const dup: CheckinStep = {
      ...orig,
      id: crypto.randomUUID(),
      question: `${orig.question} (copy)`,
      order: activeTemplate.steps.length,
    };
    const steps = [...activeTemplate.steps];
    steps.splice(index + 1, 0, dup);
    setSteps(steps);
    setExpandedStepId(dup.id);
  };

  const deleteStep = (index: number) => {
    if (!activeTemplate) return;
    setSteps(activeTemplate.steps.filter((_, i) => i !== index));
    setExpandedStepId(null);
  };

  const addStep = (type: StepType) => {
    if (!activeTemplate) return;
    const newStep: CheckinStep = {
      id: crypto.randomUUID(),
      order: activeTemplate.steps.length,
      type,
      question: '',
      subtitle: '',
      hero_emoji: type === 'emoji_scale' ? '🤔' : '✏️',
      required: false,
      save_as: '',
    };
    if (type === 'single_choice') newStep.options = ['Option 1', 'Option 2', 'Option 3'];
    if (type === 'slider') { newStep.slider_min = 0; newStep.slider_max = 10; newStep.slider_labels = ['Low', 'High']; }
    setActiveTemplate({ ...activeTemplate, steps: [...activeTemplate.steps, newStep] });
    setDirty(true);
    setExpandedStepId(newStep.id);
  };

  const toggleStep = (stepId: string) =>
    setExpandedStepId(prev => (prev === stepId ? null : stepId));

  return {
    templates,
    loading,
    error,
    reload,
    activeTemplate,
    dirty,
    saving,
    expandedStepId,
    selectTemplate,
    updateTemplate,
    handleSave,
    handleActivate,
    handleDelete,
    handleNewTemplate,
    handleScaleCreated,
    updateStep,
    moveStep,
    duplicateStep,
    deleteStep,
    addStep,
    toggleStep,
  };
}

export type CheckinTemplatesState = ReturnType<typeof useCheckinTemplates>;
