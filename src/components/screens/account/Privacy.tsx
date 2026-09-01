import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { ToggleSwitch } from '../../ui/toggle-switch';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface PrivacySettings {
  analytics: boolean;
  personalizedContent: boolean;
  researchParticipation: boolean;
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
    <div style={{ padding: '16px 20px', borderBottom: last ? 'none' : '1px solid var(--color-border-default)' }}>
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

export function Privacy() {
  const { showToast } = useNotifications();
  const { user, refreshProfile, signOut } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Load from user profile — KV is sole source of truth
  useEffect(() => {
    if (user) {
      setSettings(user.privacy_settings ?? {
        analytics: false,
        personalizedContent: false,
        researchParticipation: false,
      });
    }
  }, [user]);

  const handleToggle = async (key: keyof PrivacySettings) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      setSaving(true);
      await apiClient.updateProfile({ privacy_settings: newSettings } as any);
      await refreshProfile();
    } catch {
      setSettings(settings);
      showToast('error', 'Error', 'Failed to save privacy setting');
    } finally {
      setSaving(false);
    }
  };

  // Both handlers previously called routes that do not exist (`/user/export`,
  // `/user/delete-account`) and swallowed the resulting 404 with `.catch()`,
  // so the toast reported success while nothing happened. These are DPDP
  // §11/§12 obligations — a silent failure here is a compliance failure, not a
  // cosmetic one. Use the real endpoints and let failures surface.
  const handleExportData = async () => {
    try {
      setExporting(true);
      const data: any = await apiClient.exportUserData();
      showToast('success', 'Export Requested', data?.message || 'Your data export is being prepared.');
    } catch (err) {
      showToast('error', 'Export Failed', 'Unable to export your data at this time. Please try again or contact support.');
      console.error('Data export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    try {
      setDeleting(true);
      await apiClient.deleteAccount();
      showToast('info', 'Account Deleted', 'Your account has been deleted.');
      await signOut();
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete account. Please contact support.');
      console.error('Account deletion error:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Loading skeleton while user profile loads
  if (!settings) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {[1, 2].map(i => (
          <div key={i}>
            <div className="animate-pulse" style={{ height: 14, width: 100, borderRadius: 4, backgroundColor: 'var(--color-bg-muted)', marginBottom: 10 }} />
            <div className="animate-pulse" style={{ height: i === 1 ? 180 : 160, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-muted)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

      {/* ── Privacy Controls ── */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Data & Privacy
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          overflow: 'hidden',
        }}>
          <ToggleRow
            label="Usage Analytics"
            description="Help us improve by sharing anonymous usage data"
            enabled={settings.analytics}
            onChange={() => handleToggle('analytics')}
          />
          <ToggleRow
            label="Personalized Content"
            description="Allow tailored recommendations based on your activity"
            enabled={settings.personalizedContent}
            onChange={() => handleToggle('personalizedContent')}
          />
          <ToggleRow
            label="Research Participation"
            description="Contribute anonymized data to mental health research"
            enabled={settings.researchParticipation}
            onChange={() => handleToggle('researchParticipation')}
            last
          />
        </div>
      </section>

      {/* ── Your Data ── */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Your Data
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          overflow: 'hidden',
        }}>
          {/* Export Data */}
          <button
            onClick={handleExportData}
            disabled={exporting}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border-default)',
              border: 'none',
              borderBottomStyle: 'solid',
              borderBottomWidth: 1,
              borderBottomColor: 'var(--color-border-default)',
              background: 'transparent',
              cursor: exporting ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: exporting ? 0.6 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-muted)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <div className="flex items-center" style={{ gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: 'var(--color-bg-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-primary)', flexShrink: 0,
              }}>
                <Download size={18} />
              </div>
              <div>
                <div style={f('sm', 500)}>Export My Data</div>
                <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>
                  {exporting ? 'Preparing your data...' : 'Download a copy of all your data'}
                </div>
              </div>
            </div>
          </button>

          {/* Delete Account */}
          <div style={{ padding: '16px 20px' }}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left', padding: 0,
                }}
              >
                <div className="flex items-center" style={{ gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: 'var(--color-status-danger-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-status-danger)', flexShrink: 0,
                  }}>
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <div style={f('sm', 500, 'var(--color-status-danger)')}>Delete Account</div>
                    <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>
                      Permanently delete your account and all data
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div style={{
                padding: 16, borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-danger-light)',
                border: '1px solid var(--color-status-danger)',
              }}>
                <div className="flex items-start" style={{ gap: 12, marginBottom: 12 }}>
                  <AlertTriangle size={20} style={{ color: 'var(--color-status-danger)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={f('sm', 500, 'var(--color-status-danger)')}>This action cannot be undone</div>
                    <div style={{ ...f('xs', 400, 'var(--color-text-primary)'), marginTop: 4, lineHeight: 1.5 }}>
                      All your data including assessments, journal entries, and program progress will be permanently deleted.
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="DELETE"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-card)',
                      ...f('sm', 400),
                    }}
                  />
                </div>
                <div className="flex" style={{ gap: 8 }}>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-card)',
                      cursor: 'pointer', ...f('sm', 500),
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== 'DELETE'}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: deleteText === 'DELETE' ? 'var(--color-status-danger)' : 'var(--color-bg-muted)',
                      color: deleteText === 'DELETE' ? 'white' : 'var(--color-text-muted)',
                      cursor: deleteText === 'DELETE' ? 'pointer' : 'not-allowed',
                      ...f('sm', 500, deleteText === 'DELETE' ? 'white' : 'var(--color-text-muted)'),
                    }}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {saving && (
        <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), textAlign: 'center' }}>
          Saving...
        </div>
      )}
    </div>
  );
}