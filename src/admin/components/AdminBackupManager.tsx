import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { apiClient } from '../../shared/api-client';
import { CircleCheck, Loader2, Save, RotateCcw, Clock, Database, CircleAlert } from 'lucide-react';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminHeader } from './AdminHeader';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminLoading } from './AdminLoading';

interface Backup {
  id: string;
  timestamp: string;
}

interface AdminBackupManagerProps {
  onBack?: () => void;
}

export function AdminBackupManager({ onBack }: AdminBackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listBackupCheckpoints();
      setBackups(data);
    } catch (err) {
      setError('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading('create');
    setError(null);
    setSuccess(null);
    try {
      await apiClient.createBackupCheckpoint();
      setSuccess('Checkpoint created successfully');
      loadBackups();
    } catch (err) {
      setError('Failed to create checkpoint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Are you sure you want to restore this checkpoint? Current data will be overwritten.')) return;
    
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.restoreBackupCheckpoint(id);
      setSuccess('System restored successfully');
    } catch (err) {
      setError('Failed to restore checkpoint');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <AdminHeader
        title="System Recovery"
        description="Manage system checkpoints and disaster recovery."
        onBack={onBack}
        actions={
          <Button
            onClick={handleCreateBackup}
            disabled={!!actionLoading}
            style={{
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--ikan-component-border-radius)',
              fontWeight: 'var(--font-weight-medium)',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              gap: 'var(--spacing-2)',
            }}
          >
            {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Checkpoint
          </Button>
        }
      />

      {/* Error State */}
      {error && (
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-danger)', backgroundColor: 'var(--color-status-danger-light)' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <CircleAlert className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-status-danger)' }} />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-status-danger)', fontWeight: 'var(--font-weight-medium)' }}>
              {error}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {success && (
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-status-success)', backgroundColor: 'var(--color-status-success-light)' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <CircleCheck className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-status-success)' }} />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-status-success)', fontWeight: 'var(--font-weight-medium)' }}>
              {success}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Checkpoints List */}
      <Card style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-card)' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5" style={{ color: 'var(--color-primary-default)' }} />
            <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              Available Checkpoints
            </span>
          </div>

          {loading ? (
            <AdminLoading />
          ) : backups.length === 0 ? (
            <AdminEmptyState
              icon={Database}
              title="No Checkpoints"
              description="No checkpoints found. Create one before making major changes."
              actionLabel="Create First Checkpoint"
              onAction={handleCreateBackup}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {backups.map((backup, index) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: 'var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-default)',
                    backgroundColor: 'var(--color-bg-muted)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                    <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                        {backup.id}
                      </span>
                      {index === 0 && (
                        <AdminStatusBadge status="info" label="Latest" />
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Created on {new Date(backup.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(backup.id)}
                    disabled={!!actionLoading}
                    style={{
                      color: 'var(--color-status-warning)',
                      borderColor: 'var(--color-status-warning)',
                      gap: 'var(--spacing-2)',
                    }}
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
    </div>
  );
}