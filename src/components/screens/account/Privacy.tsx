import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Icon } from '../../Icon';
import { Separator } from '../../ui/separator';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { cn } from '../../ui/utils';

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  personalizedContent: boolean;
  thirdPartySharing: boolean;
  marketingEmails: boolean;
  researchParticipation: boolean;
}

interface DataExportStatus {
  isExporting: boolean;
  lastExport?: string;
}

export function Privacy() {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: true,
    personalizedContent: true,
    thirdPartySharing: false,
    marketingEmails: true,
    researchParticipation: false
  });

  const [exportStatus, setExportStatus] = useState<DataExportStatus>({
    isExporting: false,
    lastExport: undefined
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleSetting = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast('success', 'Updated', 'Privacy setting updated successfully');
  };

  const handleExportData = async () => {
    setExportStatus({ ...exportStatus, isExporting: true });
    
    try {
      await apiClient.exportUserData();
      const now = new Date().toISOString();
      setExportStatus({ isExporting: false, lastExport: now });
      showToast('success', 'Export Complete', 'Your data has been exported and sent to your email');
    } catch (error: any) {
      setExportStatus({ ...exportStatus, isExporting: false });
      showToast('error', 'Export Failed', error.message || 'Failed to export data');
    }
  };

  const handleDeleteData = async () => {
    try {
      await apiClient.deleteAccount();
      showToast('success', 'Account Deleted', 'Your account and data have been permanently deleted.');
      setShowDeleteConfirm(false);
      
      // Force reload to trigger sign out and redirect
      window.location.href = '/';
    } catch (error: any) {
      console.error('Delete account error:', error);
      showToast('error', 'Delete Failed', error.message || 'Failed to delete account. Please try again.');
    }
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative inline-flex items-center cursor-pointer"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: enabled ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
        transition: 'background-color 0.2s ease',
        border: 'none',
        padding: '0'
      }}
      aria-label={enabled ? 'Enabled' : 'Disabled'}
    >
      <span
        style={{
          position: 'absolute',
          left: enabled ? '22px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
        }}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Data Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="database" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Data Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Usage Data Collection
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Allow iKan to collect usage data to improve the app experience
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.dataCollection} 
              onChange={() => handleToggleSetting('dataCollection')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Analytics & Performance
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Help us understand how you use iKan to optimize performance
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.analytics} 
              onChange={() => handleToggleSetting('analytics')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Personalized Content
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Use your data to personalize content and recommendations
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.personalizedContent} 
              onChange={() => handleToggleSetting('personalizedContent')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sharing & Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="share2" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Sharing & Communications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Third-Party Sharing
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Allow sharing anonymized data with research partners
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.thirdPartySharing} 
              onChange={() => handleToggleSetting('thirdPartySharing')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Marketing Emails
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Receive updates about new programs and features
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.marketingEmails} 
              onChange={() => handleToggleSetting('marketingEmails')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Research Participation
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Participate in mental health research studies
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.researchParticipation} 
              onChange={() => handleToggleSetting('researchParticipation')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="download" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Export Your Data
              </h4>
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Download a copy of all your personal data stored in iKan
              </p>
              {exportStatus.lastExport && (
                <p style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--spacing-2)'
                }}>
                  Last exported: {new Date(exportStatus.lastExport).toLocaleDateString()}
                </p>
              )}
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={exportStatus.isExporting}
                className="gap-2"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                <Icon name="download" size={16} />
                {exportStatus.isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>

            <Separator />

            <div>
              <h4 style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-status-danger)',
                marginBottom: 'var(--spacing-1)'
              }}>
                Delete Your Data
              </h4>
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Permanently delete all your data from iKan. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-2"
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-status-danger)',
                    borderColor: 'var(--color-status-danger)'
                  }}
                >
                  <Icon name="trash" size={16} />
                  Request Data Deletion
                </Button>
              ) : (
                <div 
                  className="p-4 rounded-lg space-y-3"
                  style={{ 
                    backgroundColor: 'var(--color-status-danger-light)',
                    border: '1px solid var(--color-status-danger)'
                  }}
                >
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-status-danger)'
                  }}>
                    Are you sure you want to delete all your data?
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-primary)'
                  }}>
                    This will permanently delete:
                  </p>
                  <ul style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-primary)',
                    paddingLeft: 'var(--spacing-4)',
                    listStyle: 'disc'
                  }}>
                    <li>Your profile and account information</li>
                    <li>All mood journal entries</li>
                    <li>Assessment history and results</li>
                    <li>Program progress and achievements</li>
                    <li>All saved resources and preferences</li>
                  </ul>
                  <div className={cn(
                    "flex",
                    isMobile ? "flex-col gap-2" : "gap-2"
                  )}>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        flex: isMobile ? 'none' : 1
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteData}
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        backgroundColor: 'var(--color-status-danger)',
                        color: 'white',
                        flex: isMobile ? 'none' : 1
                      }}
                    >
                      Yes, Delete My Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information - DARK THEME */}
      <Card style={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '16px' }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Icon name="info" size={20} style={{ color: '#FFFFFF' }} />
            <div>
              <h4 
                style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: '#FFFFFF',
                  marginBottom: 'var(--spacing-2)'
                }}
              >
                Your Privacy Matters
              </h4>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: '#A0A0A0',
                lineHeight: 'var(--line-height-md)',
                marginBottom: 'var(--spacing-3)'
              }}>
                We take your privacy seriously. All your mental health data is encrypted and stored securely. 
                We never sell your personal information to third parties.
              </p>
              <div className={cn(
                "flex",
                isMobile ? "flex-col gap-2" : "gap-2"
              )}>
                <Button 
                  variant="link" 
                  className="gap-2 p-0"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#FFFFFF',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Icon name="fileText" size={14} />
                  Read Privacy Policy
                </Button>
                <span style={{ color: '#525252' }}>•</span>
                <Button 
                  variant="link" 
                  className="gap-2 p-0"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#FFFFFF',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Icon name="messageCircle" size={14} />
                  Contact Privacy Team
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
