import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Icon } from '../../Icon';
import { Separator } from '../../ui/separator';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { cn } from '../../ui/utils';

interface NotificationSettings {
  // Push Notifications
  pushEnabled: boolean;
  moodReminders: boolean;
  assessmentReminders: boolean;
  programUpdates: boolean;
  achievementAlerts: boolean;
  
  // Email Notifications
  emailEnabled: boolean;
  weeklyProgress: boolean;
  newResources: boolean;
  consultantMessages: boolean;
  
  // In-App Notifications
  inAppEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // Quiet Hours
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

export function Notifications() {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    // Push Notifications
    pushEnabled: true,
    moodReminders: true,
    assessmentReminders: true,
    programUpdates: true,
    achievementAlerts: true,
    
    // Email Notifications
    emailEnabled: true,
    weeklyProgress: true,
    newResources: false,
    consultantMessages: true,
    
    // In-App Notifications
    inAppEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Quiet Hours
    quietHoursEnabled: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  // Load settings from user profile
  useEffect(() => {
    if (user?.user_metadata?.notification_settings) {
      setSettings(prev => ({
        ...prev,
        ...user.user_metadata.notification_settings
      }));
    }
  }, [user]);

  const handleToggleSetting = async (key: keyof NotificationSettings) => {
    // Optimistic update
    const newSettings = { ...settings, [key]: !settings[key] };
    
    // Logic for dependent settings
    if (key === 'pushEnabled' && settings.pushEnabled) { // turning off
      newSettings.moodReminders = false;
      newSettings.assessmentReminders = false;
      newSettings.programUpdates = false;
      newSettings.achievementAlerts = false;
    }
    
    if (key === 'emailEnabled' && settings.emailEnabled) { // turning off
      newSettings.weeklyProgress = false;
      newSettings.newResources = false;
      newSettings.consultantMessages = false;
    }

    setSettings(newSettings);
    
    try {
      // Save to backend
      await apiClient.updateProfile({ notification_settings: newSettings });
      showToast('success', 'Updated', 'Notification preference updated');
    } catch (error) {
      // Revert on failure
      setSettings(settings);
      console.error('Failed to update notifications:', error);
      showToast('error', 'Update Failed', 'Could not save notification settings');
    }
  };

  const handleTimeChange = async (key: 'quietStart' | 'quietEnd', value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Debounce this in a real app, but for now just save
    try {
      await apiClient.updateProfile({ notification_settings: newSettings });
    } catch (error) {
      console.error('Failed to update quiet hours:', error);
    }
  };

  const handleTestNotification = () => {
    showToast('info', 'Test Notification', 'This is how your notifications will appear!');
  };

  const ToggleSwitch = ({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex items-center cursor-pointer"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: enabled ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
        transition: 'background-color 0.2s ease',
        border: 'none',
        padding: '0',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
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
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="bell" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Push Notifications
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
                Enable Push Notifications
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Receive notifications on your device
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.pushEnabled} 
              onChange={() => handleToggleSetting('pushEnabled')}
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
                Mood Check-in Reminders
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Daily reminders to log your mood
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.moodReminders} 
              onChange={() => handleToggleSetting('moodReminders')}
              disabled={!settings.pushEnabled}
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
                Assessment Reminders
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Reminders for scheduled assessments
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.assessmentReminders} 
              onChange={() => handleToggleSetting('assessmentReminders')}
              disabled={!settings.pushEnabled}
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
                Program Updates
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                New content in your enrolled programs
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.programUpdates} 
              onChange={() => handleToggleSetting('programUpdates')}
              disabled={!settings.pushEnabled}
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
                Achievement Alerts
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Celebrate your progress milestones
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.achievementAlerts} 
              onChange={() => handleToggleSetting('achievementAlerts')}
              disabled={!settings.pushEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="mail" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Email Notifications
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
                Enable Email Notifications
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Receive updates via email
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.emailEnabled} 
              onChange={() => handleToggleSetting('emailEnabled')}
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
                Weekly Progress Summary
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Weekly email with your progress insights
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.weeklyProgress} 
              onChange={() => handleToggleSetting('weeklyProgress')}
              disabled={!settings.emailEnabled}
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
                New Resources
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Get notified when new resources are added
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.newResources} 
              onChange={() => handleToggleSetting('newResources')}
              disabled={!settings.emailEnabled}
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
                Consultant Messages
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Email alerts for new messages from consultants
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.consultantMessages} 
              onChange={() => handleToggleSetting('consultantMessages')}
              disabled={!settings.emailEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="smartphone" size={20} style={{ color: 'var(--color-primary-default)' }} />
            In-App Settings
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
                In-App Notifications
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Show notifications while using the app
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.inAppEnabled} 
              onChange={() => handleToggleSetting('inAppEnabled')}
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
                Sound
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Play sound for notifications
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.soundEnabled} 
              onChange={() => handleToggleSetting('soundEnabled')}
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
                Vibration
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Vibrate for notifications (mobile only)
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.vibrationEnabled} 
              onChange={() => handleToggleSetting('vibrationEnabled')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="moon" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Quiet Hours
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
                Enable Quiet Hours
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Mute non-urgent notifications during specific hours
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.quietHoursEnabled} 
              onChange={() => handleToggleSetting('quietHoursEnabled')}
            />
          </div>

          {settings.quietHoursEnabled && (
            <>
              <Separator />
              
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}>
                <div>
                  <label 
                    htmlFor="quiet-start"
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}
                  >
                    Start Time
                  </label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={settings.quietStart}
                    onChange={(e) => handleTimeChange('quietStart', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-input)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="quiet-end"
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      display: 'block',
                      marginBottom: 'var(--spacing-2)'
                    }}
                  >
                    End Time
                  </label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={settings.quietEnd}
                    onChange={(e) => handleTimeChange('quietEnd', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-input)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>
              </div>
              
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                fontStyle: 'italic'
              }}>
                Notifications will be muted from {settings.quietStart} to {settings.quietEnd}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Test Notification */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Icon name="zap" size={20} style={{ color: 'var(--color-primary-default)' }} />
            <div className="flex-1">
              <h4 
                style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-2)'
                }}
              >
                Test Your Notifications
              </h4>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)',
                marginBottom: 'var(--spacing-3)'
              }}>
                Send a test notification to see how they'll appear with your current settings.
              </p>
              <Button
                variant="outline"
                onClick={handleTestNotification}
                className="gap-2"
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                <Icon name="send" size={16} />
                Send Test Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
