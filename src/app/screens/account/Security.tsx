import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../shared/api-client';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { cn } from '../../ui/utils';
import { validatePassword, isCommonPassword, validateEmail } from '../../../shared/validation';
import { PasswordStrength } from '../../ui/password-strength';
import { Key, Mail, Monitor, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Styled input ─────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-default)',
  backgroundColor: 'var(--color-bg-input)',
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--text-sm)',
  fontWeight: 400,
  color: 'var(--color-text-primary)',
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  backgroundColor: 'var(--color-primary-default)',
  cursor: 'pointer',
  ...f('sm', 500, 'white'),
};

const btnOutline: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-default)',
  backgroundColor: 'var(--color-bg-card)',
  cursor: 'pointer',
  ...f('sm', 500),
};

export function Security() {
  const { showToast } = useNotifications();
  const { user, refreshProfile } = useAuth();
  const isMobile = useIsMobile();

  // ─── Password ─────────────────────────────────
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // ─── Email ────────────────────────────────────
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '', token: '' });
  const [emailStep, setEmailStep] = useState<'request' | 'verify'>('request');
  const [changingEmail, setChangingEmail] = useState(false);

  // Computed "last changed" text
  const formatLastChanged = (isoDate?: string) => {
    if (!isoDate) return 'Never changed';
    const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Changed today';
    if (days === 1) return 'Changed yesterday';
    if (days < 30) return `Last changed ${days} days ago`;
    const months = Math.floor(days / 30);
    return `Last changed ${months} month${months > 1 ? 's' : ''} ago`;
  };

  const passwordLastChanged = formatLastChanged(user?.password_changed_at as string | undefined);
  const emailLastChanged = formatLastChanged(user?.email_changed_at as string | undefined);

  // Current session info (from browser)
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Browser';
  };
  const getOSInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Android')) return 'Android';
    return 'Unknown';
  };

  // ─── Handlers ──────────────────────────────────

  const handleChangePassword = async () => {
    if (!passwordForm.current.trim()) {
      showToast('error', 'Error', 'Enter your current password'); return;
    }
    const pwError = validatePassword(passwordForm.newPw);
    if (pwError) { showToast('error', 'Error', pwError.message); return; }
    if (isCommonPassword(passwordForm.newPw)) {
      showToast('error', 'Error', 'Password is too common'); return;
    }
    if (passwordForm.newPw !== passwordForm.confirm) {
      showToast('error', 'Error', 'Passwords do not match'); return;
    }
    try {
      setChangingPassword(true);
      await apiClient.changePassword(passwordForm.current, passwordForm.newPw);
      showToast('success', 'Password Changed', 'Your password has been updated');
      setShowPasswordForm(false);
      setPasswordForm({ current: '', newPw: '', confirm: '' });
      refreshProfile();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!emailForm.newEmail.trim()) { showToast('error', 'Error', 'Enter a new email'); return; }
    const emailErr = validateEmail(emailForm.newEmail);
    if (emailErr) { showToast('error', 'Error', emailErr.message || 'Invalid email'); return; }
    if (!emailForm.password.trim()) { showToast('error', 'Error', 'Enter your password to confirm'); return; }
    try {
      setChangingEmail(true);
      await apiClient.requestEmailChange(emailForm.newEmail, emailForm.password);
      showToast('success', 'Verification Sent', 'Check your new email for a verification token');
      setEmailStep('verify');
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to request email change');
    } finally {
      setChangingEmail(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!emailForm.token.trim()) { showToast('error', 'Error', 'Enter the verification token'); return; }
    try {
      setChangingEmail(true);
      await apiClient.verifyEmailChange(emailForm.token);
      showToast('success', 'Email Changed', 'Your email has been updated');
      setShowEmailForm(false);
      setEmailStep('request');
      setEmailForm({ newEmail: '', password: '', token: '' });
      refreshProfile();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to verify');
    } finally {
      setChangingEmail(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

      {/* ═══ ACCOUNT SECURITY ═══ */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Account Security
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          overflow: 'hidden',
        }}>

          {/* ── Password Row ── */}
          <div style={{ borderBottom: '1px solid var(--color-border-default)' }}>
            <div
              className="flex items-center justify-between"
              style={{ padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              <div className="flex items-center" style={{ gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'var(--color-bg-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-primary)', flexShrink: 0,
                }}>
                  <Key size={18} />
                </div>
                <div>
                  <div style={f('sm', 500)}>Change Password</div>
                  <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>{passwordLastChanged}</div>
                </div>
              </div>
              {showPasswordForm ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />}
            </div>

            {showPasswordForm && (
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>Current Password</label>
                  <input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>New Password</label>
                  <input type="password" value={passwordForm.newPw} onChange={e => setPasswordForm(p => ({ ...p, newPw: e.target.value }))} style={inputStyle} />
                  <PasswordStrength password={passwordForm.newPw} />
                </div>
                <div>
                  <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>Confirm New Password</label>
                  <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} style={inputStyle} />
                </div>
                <div className={cn('flex', isMobile ? 'flex-col gap-2' : 'gap-2 justify-end')}>
                  <button onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: '', newPw: '', confirm: '' }); }} style={btnOutline}>Cancel</button>
                  <button onClick={handleChangePassword} disabled={changingPassword} style={{ ...btnPrimary, opacity: changingPassword ? 0.6 : 1 }}>
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Email Row ── */}
          <div style={{ borderBottom: '1px solid var(--color-border-default)' }}>
            <div
              className="flex items-center justify-between"
              style={{ padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => setShowEmailForm(!showEmailForm)}
            >
              <div className="flex items-center" style={{ gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'var(--color-bg-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-primary)', flexShrink: 0,
                }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={f('sm', 500)}>Change Email</div>
                  <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>
                    {user?.email || 'No email set'} · {emailLastChanged}
                  </div>
                </div>
              </div>
              {showEmailForm ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />}
            </div>

            {showEmailForm && (
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {emailStep === 'request' ? (
                  <>
                    <div>
                      <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>New Email</label>
                      <input type="email" value={emailForm.newEmail} onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>Current Password</label>
                      <input type="password" value={emailForm.password} onChange={e => setEmailForm(p => ({ ...p, password: e.target.value }))} style={inputStyle} />
                    </div>
                    <div className={cn('flex', isMobile ? 'flex-col gap-2' : 'gap-2 justify-end')}>
                      <button onClick={() => { setShowEmailForm(false); setEmailForm({ newEmail: '', password: '', token: '' }); }} style={btnOutline}>Cancel</button>
                      <button onClick={handleRequestEmailChange} disabled={changingEmail} style={{ ...btnPrimary, opacity: changingEmail ? 0.6 : 1 }}>
                        {changingEmail ? 'Sending...' : 'Request Change'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ ...f('xs', 500), display: 'block', marginBottom: 6 }}>Verification Token</label>
                      <input type="text" value={emailForm.token} onChange={e => setEmailForm(p => ({ ...p, token: e.target.value }))} style={inputStyle} placeholder="Enter token from email" />
                    </div>
                    <div className={cn('flex', isMobile ? 'flex-col gap-2' : 'gap-2 justify-end')}>
                      <button onClick={() => { setShowEmailForm(false); setEmailStep('request'); setEmailForm({ newEmail: '', password: '', token: '' }); }} style={btnOutline}>Cancel</button>
                      <button onClick={handleVerifyEmailChange} disabled={changingEmail} style={{ ...btnPrimary, opacity: changingEmail ? 0.6 : 1 }}>
                        {changingEmail ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ ACTIVE SESSION ═══ */}
      <section>
        <div style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Active Session
        </div>
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          padding: '16px 20px',
        }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'var(--color-status-success-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-status-success)', flexShrink: 0,
            }}>
              <Monitor size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={f('sm', 500)}>{getBrowserInfo()} on {getOSInfo()}</span>
                <span style={{
                  ...f('xs', 500, 'var(--color-status-success)'),
                  backgroundColor: 'var(--color-status-success-light)',
                  padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                }}>Current</span>
              </div>
              <div style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>
                Active now
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
