import { useCallback } from 'react';
import { apiClient, apiErrorMessage } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAdminAction, useAdminResource } from '../ui/hooks/useAdminResource';
import type { BroadcastInput, NotifTemplate, QueueItem } from './communication-types';

/**
 * Templates + broadcast queue for the Communication screen.
 * Each list loads (and refreshes) on its own, as before.
 */
export function useCommunicationData() {
  const { showToast } = useNotifications();

  const templates = useAdminResource<NotifTemplate[]>(
    async (signal) => (await apiClient.getCommunicationTemplates(signal)).templates || [],
    { initialData: [], toastOnError: false, errorTitle: 'Failed to fetch templates' },
  );

  const queue = useAdminResource<QueueItem[]>(
    async (signal) => (await apiClient.getCommunicationQueue(signal)).queue || [],
    { initialData: [], toastOnError: false, errorTitle: 'Failed to fetch queue' },
  );

  const { run: runSave, busy: saving } = useAdminAction();
  const { run } = useAdminAction();
  const setTemplates = templates.setData;
  const setQueue = queue.setData;

  /** Resolves true when saved. */
  const saveTemplate = useCallback(async (template: NotifTemplate): Promise<boolean> => {
    if (!template.name.trim()) {
      showToast('error', 'Validation', 'Template name is required');
      return false;
    }
    const res = await runSave(() => apiClient.saveCommunicationTemplate(template), {
      success: ['Saved', 'Template saved successfully'],
      errorTitle: 'Error',
      errorMessage: (err) => apiErrorMessage(err, 'Failed to save template'),
    });
    if (!res.ok) return false;
    const saved = res.result.template as NotifTemplate | undefined;
    if (saved) {
      setTemplates(prev => {
        const idx = prev.findIndex(t => t.id === saved.id);
        if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u; }
        return [...prev, saved];
      });
    }
    return true;
  }, [runSave, setTemplates, showToast]);

  /** Resolves true when deleted. */
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    const res = await run(() => apiClient.deleteCommunicationTemplate(id), {
      success: ['Deleted', 'Template deleted'],
      errorTitle: 'Error',
      errorMessage: 'Failed to delete template',
    });
    if (res.ok) setTemplates(prev => prev.filter(t => t.id !== id));
    return res.ok;
  }, [run, setTemplates]);

  /** Resolves true when queued. */
  const sendBroadcast = useCallback(async (b: BroadcastInput): Promise<boolean> => {
    if (!b.subject.trim() || !b.body.trim()) {
      showToast('error', 'Validation', 'Subject and message are required');
      return false;
    }
    const res = await run(() => apiClient.queueCommunicationBroadcast({
      type: b.type,
      recipient: b.audience === 'all' ? 'all-users' : `segment-${b.audience}`,
      subject: b.subject,
      body: b.body,
    }), {
      success: ['Queued', 'Broadcast message queued for delivery'],
      errorTitle: 'Error',
      errorMessage: 'Failed to queue broadcast',
    });
    if (!res.ok) return false;
    const item = res.result.item as QueueItem | undefined;
    if (item) setQueue(prev => [item, ...prev]);
    return true;
  }, [run, setQueue, showToast]);

  return {
    templates,
    queue,
    saving,
    saveTemplate,
    deleteTemplate,
    sendBroadcast,
  };
}
