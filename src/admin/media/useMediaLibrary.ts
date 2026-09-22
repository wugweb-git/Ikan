import { useCallback, useState } from 'react';
import { apiClient } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAdminAction, useAdminResource, errorMessageOf } from '../ui/hooks/useAdminResource';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import type { MediaFile } from './media-utils';

/** Media library data: load, delete (with confirmation) and rename. */
export function useMediaLibrary() {
  const { showToast } = useNotifications();
  const confirm = useConfirm();
  const { run } = useAdminAction();
  const [isRenaming, setIsRenaming] = useState(false);

  const { data: files, setData: setFiles, loading, reload } = useAdminResource(
    async () => {
      const response = await apiClient.getMediaFiles();
      return (Array.isArray(response) ? response : response.files || []) as MediaFile[];
    },
    { initialData: [] as MediaFile[], errorTitle: 'Error', errorMessage: 'Failed to load media files' },
  );

  const deleteFile = useCallback(async (file: MediaFile) => {
    const ok = await confirm({
      title: 'Delete File',
      description: `Are you sure you want to delete "${file.fileName}"? This action cannot be undone.`,
      confirmLabel: 'Delete File',
      destructive: true,
    });
    if (!ok) return;
    const res = await run(() => apiClient.deleteMediaFile(file.id), {
      success: ['Success', 'File deleted'],
      errorTitle: 'Error',
      errorMessage: (err) => errorMessageOf(err, 'Failed to delete file'),
    });
    if (res.ok) await reload();
  }, [confirm, run, reload]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.fileName === newName) return;
    try {
      setIsRenaming(true);
      await apiClient.renameMediaFile(fileId, newName);
      setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, fileName: newName } : f)));
      showToast('success', 'Renamed', `File renamed to "${newName}"`);
    } catch (error) {
      console.error('Rename failed:', error);
      showToast('error', 'Error', errorMessageOf(error, 'Failed to rename file'));
    } finally {
      setIsRenaming(false);
    }
  }, [files, setFiles, showToast]);

  return { files, loading, reload, deleteFile, renameFile, isRenaming };
}
