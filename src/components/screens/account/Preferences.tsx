import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Icon } from '../../Icon';
import { Separator } from '../../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { cn } from '../../ui/utils';

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  autoPlayVideos: boolean;
  defaultView: 'grid' | 'list';
  contentRecommendations: boolean;
  showAchievements: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  measurementSystem: 'metric' | 'imperial';
}

export function Preferences() {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // AbortController for async operations cleanup
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: 'light',
    timezone: 'Asia/Kolkata',
    autoPlayVideos: true,
    defaultView: 'grid',
    contentRecommendations: true,
    showAchievements: true,
    compactMode: false,
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    measurementSystem: 'metric'
  });

  useEffect(() => {
    // Check both top-level (from KV profile) and user_metadata (from Supabase auth)
    const savedPrefs = user?.preferences || user?.user_metadata?.preferences;
    if (savedPrefs) {
      setPreferences(prev => ({
        ...prev,
        ...savedPrefs
      }));
    }
  }, [user]);

  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleToggle = (key: keyof UserPreferences) => {
    const currentValue = preferences[key];
    if (typeof currentValue === 'boolean') {
      handlePreferenceChange(key, !currentValue as any);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await apiClient.updateProfile({ preferences });
      showToast('success', 'Preferences Saved', 'Your preferences have been updated');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      showToast('error', 'Save Failed', error.message || 'Failed to save preferences');
    }
  };

  const handleResetPreferences = () => {
    setPreferences({
      language: 'en',
      theme: 'light',
      timezone: 'Asia/Kolkata',
      autoPlayVideos: true,
      defaultView: 'grid',
      contentRecommendations: true,
      showAchievements: true,
      compactMode: false,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      measurementSystem: 'metric'
    });
    setHasChanges(false);
    showToast('info', 'Reset Complete', 'Preferences reset to defaults');
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className="relative inline-flex items-center cursor-pointer touch-none"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: enabled ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
        transition: 'background-color 0.2s ease',
        border: 'none',
        padding: 0
      }}
    >
      <span
        className="block rounded-full shadow-sm"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="settings" size={20} style={{ color: 'var(--color-primary-default)' }} />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label 
              htmlFor="language"
              style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Language
            </label>
            <Select
              value={preferences.language}
              onValueChange={(value) => handlePreferenceChange('language', value)}
            >
              <SelectTrigger className="w-full h-[56px]" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-3">
                  <Icon name="globe" size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <SelectValue placeholder="Select language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <label 
              htmlFor="timezone"
              style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Time Zone
            </label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => handlePreferenceChange('timezone', value)}
            >
              <SelectTrigger className="w-full h-[56px]" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-3">
                  <Icon name="clock" size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <SelectValue placeholder="Select timezone" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                <SelectItem value="Australia/Sydney">Australia/Sydney (AEDT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <label 
              htmlFor="fontSize"
              style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Font Size
            </label>
            <Select
              value={preferences.fontSize}
              onValueChange={(value) => handlePreferenceChange('fontSize', value as any)}
            >
              <SelectTrigger className="w-full h-[56px]" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-3">
                  <Icon name="fileText" size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <SelectValue placeholder="Select font size" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="layout" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Content Preferences
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
                Auto-play Videos
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Automatically play videos when available
              </div>
            </div>
            <ToggleSwitch 
              enabled={preferences.autoPlayVideos} 
              onChange={() => handleToggle('autoPlayVideos')}
            />
          </div>

          <Separator />

          <div>
            <label 
              htmlFor="defaultView"
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Default View
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['grid', 'list'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => handlePreferenceChange('defaultView', view)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    preferences.defaultView === view 
                      ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)]"
                      : "border-[var(--color-border-default)] bg-[var(--color-bg-card)]"
                  )}
                  style={{
                    cursor: 'pointer'
                  }}
                >
                  <Icon 
                    name={view === 'grid' ? 'grid' : 'list'} 
                    size={20} 
                    className="mx-auto mb-1"
                    style={{ 
                      color: preferences.defaultView === view ? 'var(--color-primary-default)' : 'var(--color-text-muted)' 
                    }}
                  />
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: preferences.defaultView === view ? 'var(--color-primary-default)' : 'var(--color-text-muted)',
                    textTransform: 'capitalize'
                  }}>
                    {view}
                  </div>
                </button>
              ))}
            </div>
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
                Content Recommendations
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Show personalized content suggestions
              </div>
            </div>
            <ToggleSwitch 
              enabled={preferences.contentRecommendations} 
              onChange={() => handleToggle('contentRecommendations')}
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
                Show Achievements
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Display progress milestones and badges
              </div>
            </div>
            <ToggleSwitch 
              enabled={preferences.showAchievements} 
              onChange={() => handleToggle('showAchievements')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="eye" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Accessibility
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
                Compact Mode
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Reduce spacing for more content on screen
              </div>
            </div>
            <ToggleSwitch 
              enabled={preferences.compactMode} 
              onChange={() => handleToggle('compactMode')}
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
                Reduced Motion
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Minimize animations and transitions
              </div>
            </div>
            <ToggleSwitch 
              enabled={preferences.reducedMotion} 
              onChange={() => handleToggle('reducedMotion')}
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
                High Contrast
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Increase contrast for better visibility
              </div>
            </div>
            <ToggleSwitch 
              enabled={preferences.highContrast} 
              onChange={() => handleToggle('highContrast')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="globe" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label 
              htmlFor="measurementSystem"
              style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Measurement System
            </label>
            <Select
              value={preferences.measurementSystem}
              onValueChange={(value) => handlePreferenceChange('measurementSystem', value as any)}
            >
              <SelectTrigger className="w-full h-[56px]" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-3">
                  <Icon name="sliders" size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <SelectValue placeholder="Select system" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {hasChanges && (
        <div 
          className={cn(
            "flex gap-3 p-4 rounded-lg border-2",
            isMobile && "flex-col"
          )}
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderColor: 'var(--color-primary-default)'
          }}
        >
          <div className="flex-1">
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              You have unsaved changes
            </p>
            <p style={{ 
              fontSize: 'var(--text-xs)', 
              color: 'var(--color-text-muted)'
            }}>
              Save your preferences to apply the changes
            </p>
          </div>
          <div className={cn(
            "flex gap-2",
            isMobile && "flex-col"
          )}>
            <Button
              variant="outline"
              onClick={handleResetPreferences}
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Reset
            </Button>
            <Button
              onClick={handleSavePreferences}
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'white'
              }}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}