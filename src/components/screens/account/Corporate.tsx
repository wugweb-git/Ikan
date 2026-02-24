import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Icon } from '../../Icon';

export function Corporate() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="briefcase" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <Icon name="building" size={32} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-2)'
            }}>
              No Organization Connected
            </h3>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)',
              maxWidth: '400px'
            }}>
              You are not currently linked to any corporate organization. Please contact your administrator for an invite code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}