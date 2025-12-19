import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { apiClient } from '../../lib/api-client';
import { useNotifications } from '../../contexts/NotificationContext';
import { AlertCircle, CheckCircle, Shield, User } from 'lucide-react';
import { Badge } from '../ui/badge';

export function AdminDebugPanel() {
  const { showToast } = useNotifications();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const checkStatus = async () => {
    try {
      setChecking(true);
      const response = await apiClient.request('/admin/debug/check-status', {
        method: 'GET'
      }, true, 0);
      setStatus(response);
      console.log('Debug status:', response);
      
      // Auto-show details if not admin
      if (!response.isAdmin) {
        setShowDetails(true);
      }
    } catch (error: any) {
      console.error('Failed to check status:', error);
      showToast('error', 'Check Failed', error.message || 'Could not check admin status');
    } finally {
      setChecking(false);
    }
  };

  const makeAdmin = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/admin/debug/make-admin', {
        method: 'POST'
      }, true, 0);
      
      showToast('success', 'Success', response.message || 'Successfully promoted to admin');
      await checkStatus(); // Refresh status
    } catch (error: any) {
      console.error('Failed to make admin:', error);
      showToast('error', 'Failed', error.message || 'Could not promote to admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card style={{ 
      backgroundColor: 'var(--color-bg-card)', 
      borderRadius: 'var(--radius-lg)',
      border: '2px solid var(--color-warning-default)'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-warning-default)' }} />
          <span style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}>
            Debug Panel
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div style={{ 
          padding: 'var(--spacing-4)', 
          backgroundColor: 'var(--color-bg-muted)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Current User Status
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Refresh'}
            </Button>
          </div>

          {status ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Email:
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  {status.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Admin Status:
                </span>
                {status.isAdmin ? (
                  <Badge variant="default" style={{ backgroundColor: 'var(--color-success-default)' }}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Admin
                  </Badge>
                )}
              </div>

              {status.profile && (
                <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-2)'
                  }}>
                    Profile Data:
                  </div>
                  <pre style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-primary)',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(status.profile, null, 2)}
                  </pre>
                </div>
              )}

              {!status.isAdmin && showDetails && (
                <div className="mt-4">
                  <Button
                    onClick={makeAdmin}
                    disabled={loading}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-warning-default)',
                      color: 'white',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {loading ? 'Promoting...' : 'Promote to Admin'}
                  </Button>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--spacing-2)',
                    textAlign: 'center'
                  }}>
                    This will grant admin access to your current account
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-4)' }}>
              <div className="animate-spin rounded-full border-4 mx-auto mb-2"
                style={{
                  width: '32px',
                  height: '32px',
                  borderColor: 'var(--color-accent-default)',
                  borderTopColor: 'var(--color-primary-default)'
                }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Checking status...
              </span>
            </div>
          )}
        </div>

        <div style={{ 
          padding: 'var(--spacing-3)', 
          backgroundColor: 'var(--color-info-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-info-default)'
        }}>
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-text-primary)',
            lineHeight: '1.5'
          }}>
            <strong>Note:</strong> If you're logged in as demo1@ikan.com and not seeing admin access,
            click "Promote to Admin" above. Then refresh the page and try accessing admin features again.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}