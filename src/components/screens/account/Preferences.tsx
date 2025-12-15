import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Icon } from '../../Icon';
import { Separator } from '../../ui/separator';
import { useNotifications } from '../../../contexts/NotificationContext';
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
  const isMobile = useIsMobile();
  
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

  const handleSavePreferences = () => {
    // In real app, this would save to backend
    showToast('success', 'Preferences Saved', 'Your preferences have been updated');
    setHasChanges(false);
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
      {/* Header */}
      <div>
        <h1 
          style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-lg)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)'
          }}
        >
          Preferences
        </h1>
        <p style={{ 
          fontSize: 'var(--text-base)', 
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-md)'
        }}>
          Customize your experience and set your preferences
        </p>
      </div>

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
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Language
            </label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
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
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>

          <Separator />

          <div>
            <label 
              htmlFor="theme"
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'auto'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handlePreferenceChange('theme', theme)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    preferences.theme === theme 
                      ? "border-[var(--color-primary-default)] bg-[var(--color-primary-light)]"
                      : "border-[var(--color-border-default)] bg-[var(--color-bg-card)]"
                  )}
                  style={{
                    cursor: 'pointer'
                  }}
                >
                  <Icon 
                    name={theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'monitor'} 
                    size={20} 
                    className="mx-auto mb-1"
                    style={{ 
                      color: preferences.theme === theme ? 'var(--color-primary-default)' : 'var(--color-text-muted)' 
                    }}
                  />
                  <div style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: preferences.theme === theme ? 'var(--color-primary-default)' : 'var(--color-text-muted)',
                    textTransform: 'capitalize'
                  }}>
                    {theme}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <label 
              htmlFor="timezone"
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Time Zone
            </label>
            <select
              id="timezone"
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
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
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
            </select>
          </div>

          <Separator />

          <div>
            <label 
              htmlFor="fontSize"
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Font Size
            </label>
            <select
              id="fontSize"
              value={preferences.fontSize}
              onChange={(e) => handlePreferenceChange('fontSize', e.target.value as 'small' | 'medium' | 'large')}
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
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
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
                marginBottom: 'var(--spacing-2)'
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
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                display: 'block',
                marginBottom: 'var(--spacing-2)'
              }}
            >
              Measurement System
            </label>
            <select
              id="measurementSystem"
              value={preferences.measurementSystem}
              onChange={(e) => handlePreferenceChange('measurementSystem', e.target.value as 'metric' | 'imperial')}
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
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lb, in)</option>
            </select>
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
