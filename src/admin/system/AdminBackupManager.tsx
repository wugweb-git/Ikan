import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { apiClient } from '../../shared/api/api';
import { CircleCheck, Loader2, Save, RotateCcw, Clock, Database, CircleAlert } from 'lucide-react';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AdminPageLayout } from '../shell/AdminPageLayout';
import { AdminEmptyState } from '../ui/kit/AdminEmptyState';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { useConfirm } from '../ui/kit/ConfirmDialog';
import { useAdminResource } from '../ui/hooks/useAdminResource';

interface Backup {
  id: string;
  timestamp: string;
}

// Not wired into the shell (owner decision); renders inside its ConfirmProvider if ever wired.
export function AdminBackupManager() {
  const confirm = useConfirm();
  const { data: backups, loading, error: loadError, reload } = useAdminResource<Backup[]>(
    () => apiClient.listBackupCheckpoints(),
    { initialData: [], toastOnError: false, errorTitle: 'Failed to load backups' },
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const error = actionError ?? (loadError ? 'Failed to load backups' : null);

  const handleCreateBackup = async () => {
    setActionLoading('create');
    setActionError(null);
    setSuccess(null);
    try {
      await apiClient.createBackupCheckpoint();
      setSuccess('Checkpoint created successfully');
      void reload();
    } catch {
      setActionError('Failed to create checkpoint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!(await confirm({
      title: 'Are you sure you want to restore this checkpoint?',
      description: 'Current data will be overwritten.',
      confirmLabel: 'Restore',
      destructive: true,
    }))) return;

    setActionLoading(id);
    setActionError(null);
    setSuccess(null);
    try {
      await apiClient.restoreBackupCheckpoint(id);
      setSuccess('System restored successfully');
    } catch {
      setActionError('Failed to restore checkpoint');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminPageLayout
      title="System Recovery"
      description="Manage system checkpoints and disaster recovery."
      maxWidth="none"
      actions={
        <Button
          onClick={handleCreateBackup}
          disabled={!!actionLoading}
          className="h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium gap-2 bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-default)] text-[var(--color-primary-on)]"
        >
          {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Create Checkpoint
        </Button>
      }
    >
      {/* Error State */}
      {error && (
        <Card className="rounded-lg border border-[var(--color-status-danger)] bg-[var(--color-status-danger-light)]">
          <CardContent className="p-4 flex items-center gap-3">
            <CircleAlert className="w-5 h-5 flex-shrink-0 text-[var(--color-status-danger)]" />
            <span className="text-sm font-medium text-[var(--color-status-danger)]">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {success && (
        <Card className="rounded-lg border border-[var(--color-status-success)] bg-[var(--color-status-success-light)]">
          <CardContent className="p-4 flex items-center gap-3">
            <CircleCheck className="w-5 h-5 flex-shrink-0 text-[var(--color-status-success)]" />
            <span className="text-sm font-medium text-[var(--color-status-success)]">{success}</span>
          </CardContent>
        </Card>
      )}

      {/* Checkpoints List */}
      <Card className="rounded-lg bg-[var(--color-bg-card)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-[var(--color-primary-default)]" />
            <span className="text-lg font-medium text-[var(--color-text-primary)]">Available Checkpoints</span>
          </div>

          {loading ? (
            <AdminLoading />
          ) : backups.length === 0 ? (
            <AdminEmptyState
              icon={<Database className="w-8 h-8 text-[var(--color-text-muted)] opacity-50" />}
              title="No Checkpoints"
              description="No checkpoints found. Create one before making major changes."
              actionLabel="Create First Checkpoint"
              onAction={handleCreateBackup}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {backups.map((backup, index) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] transition-colors duration-200"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[var(--color-text-primary)]">{backup.id}</span>
                      {index === 0 && <AdminStatusBadge status="info" label="Latest" />}
                    </div>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      Created on {new Date(backup.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(backup.id)}
                    disabled={!!actionLoading}
                    className="gap-2 text-[var(--color-status-warning)] hover:text-[var(--color-status-warning)] border-[var(--color-status-warning)]"
                  >
                    {actionLoading === backup.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
