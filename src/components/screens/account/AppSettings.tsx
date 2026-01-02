import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { DatabaseSyncPanel } from '../../DatabaseSyncPanel';
import { useNotifications } from '../../../contexts/NotificationContext';

export function AppSettings() {
  const { showToast } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Database Sync Panel */}
      <DatabaseSyncPanel
        onSyncComplete={(result) => {
          if (result.success) {
            showToast('success', 'Database Synced', 'All assessments and programs are now complete!');
          } else {
            showToast('error', 'Sync Failed', result.message);
          }
        }}
      />
      
      <Card>
        <CardContent className="p-6">
          <p style={{ color: 'var(--color-text-muted)' }}>Additional app settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
