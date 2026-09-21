import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../shared/api-client';
import { ToggleSwitch } from '../../../components/ui/toggle-switch';

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface NotificationSettings {
  moodReminders: boolean;
  assessmentReminders: boolean;
  programUpdates: boolean;
  weeklyProgress: boolean;
  newResources: boolean;
}

// Load from user profile — KV is sole source of truth
export function Notifications() {
  const { showToast } = useNotifications();
  const { user, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);

  // Load from user profile — KV is sole source of truth
  useEffect(() => {
    if (user) {
      setSettings(user.notification_settings ?? {
        moodReminders: false,
        assessmentReminders: false,
        programUpdates: false,
        weeklyProgress: false,
        newResources: false,
      });
    }
  }, [user]);

  const handleToggle = async (key: keyof NotificationSettings) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      setSaving(true);
      await apiClient.updateProfile({ notification_settings: newSettings } as any);
      await refreshProfile();
    } catch (err) {
      // Revert on failure
      setSettings(settings);
      showToast('error', 'Error', 'Failed to save notification setting');
      console.error('Notification setting save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton while user profile loads
  if (!settings) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {[1, 2].map(i => (
          <div key={i}>
            <div className="animate-pulse" style={{ height: 14, width: 100, borderRadius: 4, backgroundColor: 'var(--color-bg-muted)', marginBottom: 10 }} />
            <div className="animate-pulse" style={{ height: i === 1 ? 180 : 120, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

      {/* ── Push Notifications ── */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Push Notifications
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          overflow: 'hidden',
        }}>
          <ToggleRow
            label="Mood Reminders"
            description="Daily reminder to log your mood"
            enabled={settings.moodReminders}
            onChange={() => handleToggle('moodReminders')}
          />
          <ToggleRow
            label="Assessment Reminders"
            description="Periodic prompts to retake assessments"
            enabled={settings.assessmentReminders}
            onChange={() => handleToggle('assessmentReminders')}
          />
          <ToggleRow
            label="Program Updates"
            description="Notifications about your active programs"
            enabled={settings.programUpdates}
            onChange={() => handleToggle('programUpdates')}
            last
          />
        </div>
      </section>

      {/* ── Email Notifications ── */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Email
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          overflow: 'hidden',
        }}>
          <ToggleRow
            label="Weekly Progress"
            description="Summary of your weekly activity and insights"
            enabled={settings.weeklyProgress}
            onChange={() => handleToggle('weeklyProgress')}
          />
          <ToggleRow
            label="New Resources"
            description="Get notified when new articles are published"
            enabled={settings.newResources}
            onChange={() => handleToggle('newResources')}
            last
          />
        </div>
      </section>

      {/* Saving indicator */}
      {saving && (
        <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), textAlign: 'center' }}>
          Saving...
        </div>
      )}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  last?: boolean;
}

function ToggleRow({ label, description, enabled, onChange, last }: ToggleRowProps) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: last ? 'none' : '1px solid var(--color-border-default)',
      }}
    >
      <div className="flex items-center justify-between" style={{ gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={f('sm', 500)}>{label}</div>
          <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2, lineHeight: 1.5 }}>
            {description}
          </div>
        </div>
        <ToggleSwitch enabled={enabled} onChange={onChange} />
      </div>
    </div>
  );
}