import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Icon } from '../../Icon';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { cn } from '../../ui/utils';
import { apiClient } from '../../../lib/api-client';
import { validatePassword, isCommonPassword } from '../../../lib/validation';
import { PasswordStrength } from '../../ui/password-strength';
import { ToggleSwitch } from '../../ui/toggle-switch';

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number; // in minutes
}

export function Security() {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricEnabled: true,
    loginAlerts: true,
    sessionTimeout: 30
  });

  const [sessions, setSessions] = useState<LoginSession[]>([
    {
      id: 'current',
      device: 'Chrome on Windows',
      location: 'Mumbai, India',
      ip: '49.207.xxx.xxx',
      lastActive: new Date().toISOString(),
      current: true
    },
    {
      id: 'session-2',
      device: 'Safari on iPhone',
      location: 'Mumbai, India',
      ip: '49.207.xxx.xxx',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      current: false
    }
  ]);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [show2FASetup, setShow2FASetup] = useState(false);

  const handleToggleSetting = (key: keyof SecuritySettings) => {
    if (key === 'twoFactorEnabled' && !settings.twoFactorEnabled) {
      setShow2FASetup(true);
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast('success', 'Updated', 'Security setting updated');
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'Error', 'New passwords do not match');
      return;
    }
    
    if (!validatePassword(passwordForm.newPassword)) {
      showToast('error', 'Error', 'Password must be at least 8 characters and include a mix of letters, numbers, and symbols');
      return;
    }
    
    if (isCommonPassword(passwordForm.newPassword)) {
      showToast('error', 'Error', 'Password is too common. Please choose a stronger password');
      return;
    }
    
    // In real app, this would call an API
    apiClient.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      .then(() => {
        showToast('success', 'Password Changed', 'Your password has been updated successfully');
        setShowPasswordChange(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }).catch((error) => {
        showToast('error', 'Error', error.message || 'Failed to change password');
      });
  };

  const handleEnable2FA = () => {
    setSettings(prev => ({ ...prev, twoFactorEnabled: true }));
    showToast('success', '2FA Enabled', 'Two-factor authentication has been enabled');
    setShow2FASetup(false);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast('success', 'Session Revoked', 'Device has been logged out');
  };

  const handleRevokeAllSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
    showToast('success', 'All Sessions Revoked', 'All other devices have been logged out');
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="key" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordChange ? (
            <div className="flex items-center justify-between">
              <div>
                <div style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Change Password
                </div>
                <div style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-muted)'
                }}>
                  Last changed 30 days ago
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordChange(true)}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="current-password"
                  style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
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
                  htmlFor="new-password"
                  style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
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
                <PasswordStrength password={passwordForm.newPassword} />
              </div>

              <div>
                <label 
                  htmlFor="confirm-password"
                  style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                    marginBottom: 'var(--spacing-2)'
                  }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
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

              <div className={cn(
                "flex",
                isMobile ? "flex-col gap-2" : "gap-2 justify-end"
              )}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'white'
                  }}
                >
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="shield" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Enable 2FA
                </span>
                {settings.twoFactorEnabled && (
                  <Badge style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                    Active
                  </Badge>
                )}
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Add an extra layer of security with SMS or authenticator app
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.twoFactorEnabled} 
              onChange={() => handleToggleSetting('twoFactorEnabled')}
            />
          </div>

          {show2FASetup && !settings.twoFactorEnabled && (
            <>
              <Separator />
              <div 
                className="p-4 rounded-lg space-y-3"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <h4 style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Setup Two-Factor Authentication
                </h4>
                <p style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-muted)'
                }}>
                  Choose your preferred 2FA method:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2 justify-start"
                    onClick={handleEnable2FA}
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    <Icon name="smartphone" size={16} />
                    SMS Authentication
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 justify-start"
                    onClick={handleEnable2FA}
                    style={{
                      height: 'var(--ikan-component-button-height)',
                      borderRadius: 'var(--ikan-component-border-radius)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    <Icon name="key" size={16} />
                    Authenticator App
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShow2FASetup(false)}
                  className="w-full"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Login Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="logIn" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Login Settings
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
                Biometric Login
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Use fingerprint or face recognition to log in
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.biometricEnabled} 
              onChange={() => handleToggleSetting('biometricEnabled')}
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
                Login Alerts
              </div>
              <div style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)'
              }}>
                Get notified of new login attempts
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.loginAlerts} 
              onChange={() => handleToggleSetting('loginAlerts')}
            />
          </div>

          <Separator />

          <div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-1)'
            }}>
              Session Timeout
            </div>
            <div style={{ 
              fontSize: 'var(--text-xs)', 
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--spacing-3)'
            }}>
              Automatically log out after inactivity
            </div>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
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
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="monitor" size={20} style={{ color: 'var(--color-primary-default)' }} />
              Active Sessions
            </CardTitle>
            {sessions.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevokeAllSessions}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-status-danger)'
                }}
              >
                Revoke All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div 
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: session.current ? 'var(--color-primary-light)' : 'var(--color-bg-muted)'
                      }}
                    >
                      <Icon 
                        name={session.device.includes('iPhone') ? 'smartphone' : 'monitor'} 
                        size={20} 
                        style={{ color: session.current ? 'var(--color-primary-default)' : 'var(--color-text-muted)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)'
                        }}>
                          {session.device}
                        </span>
                        {session.current && (
                          <Badge style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                            Current
                          </Badge>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {session.location} • {session.ip}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {formatLastActive(session.lastActive)}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-status-danger)'
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
                {index < sessions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Tips - DARK THEME */}
      <Card style={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '16px' }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Icon name="alertTriangle" size={20} style={{ color: '#F59E0B' }} /> {/* Warning color kept but brightened/checked */}
            <div>
              <h4 
                style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: '#FFFFFF',
                  marginBottom: 'var(--spacing-2)'
                }}
              >
                Security Tips
              </h4>
              <ul style={{ 
                fontSize: 'var(--text-sm)', 
                color: '#A0A0A0',
                lineHeight: 'var(--line-height-md)',
                paddingLeft: 'var(--spacing-4)',
                listStyle: 'disc'
              }}>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication</li>
                <li>Regularly review your active sessions</li>
                <li>Never share your password or 2FA codes</li>
                <li>Log out from shared or public devices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
