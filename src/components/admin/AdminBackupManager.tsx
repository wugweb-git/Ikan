import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { apiClient } from '../../lib/api-client';
import { AlertCircle, CheckCircle, Loader2, Save, RotateCcw, Clock, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Backup {
  id: string;
  timestamp: string;
}

export function AdminBackupManager() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">System Recovery</h2>
           <p className="text-muted-foreground">Manage system checkpoints and disaster recovery.</p>
        </div>
        <Button onClick={handleCreateBackup} disabled={!!actionLoading}>
          {actionLoading === 'create' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Create Checkpoint
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="border-green-500 text-green-700 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Checkpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No checkpoints found. Create one before making major changes.
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <span className="font-mono text-sm">{backup.id}</span>
                         {/* Highlight most recent */}
                         {backups.indexOf(backup) === 0 && <Badge variant="secondary" className="text-xs">Latest</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Created on {new Date(backup.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestore(backup.id)}
                        disabled={!!actionLoading}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                      >
                        {actionLoading === backup.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
