import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LogoIcon } from '../ui/Logo';
import { Lock, ArrowLeft, Loader2, CircleAlert, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { Checkbox } from '../ui/checkbox';

const REMEMBER_KEY = 'ikan_admin_remembered_email';

interface AdminLoginScreenProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: () => void;
}

export function AdminLoginScreen({ onNavigate, onLoginSuccess }: AdminLoginScreenProps) {
  const { settings } = usePublicSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { showToast } = useNotifications();

  // Restore remembered email on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch { /* ignore */ }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Missing Credentials', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);

      // Persist or clear remembered email
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      showToast('success', 'Welcome Back', 'Successfully logged into Admin Console');
      onLoginSuccess();
    } catch (error: any) {
      console.error('Admin login failed:', error);
      showToast('error', 'Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const siteName = settings.siteName || 'iKan';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="w-full max-w-[420px] space-y-6">
        {/* Logo + Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className="rounded-2xl p-3 shadow-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-default)' }}
          >
            {settings.logoIconUrl ? (
              <img
                src={settings.logoIconUrl}
                alt={siteName}
                style={{ width: 36, height: 36, objectFit: 'contain' }}
              />
            ) : (
              <LogoIcon size={36} style={{ color: 'var(--color-text-inverse)' }} />
            )}
          </div>
          <div>
            <h1
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                margin: 0,
              }}
            >
              {siteName} Admin
            </h1>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-base)',
                marginTop: 4,
              }}
            >
              Secure access for administrators
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Accent bar */}
          <div style={{ height: 3, backgroundColor: 'var(--color-primary-default)' }} />

          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@ikanhealth.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                startIcon={<Mail size={18} />}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Password
              </Label>
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                startIcon={<Lock size={18} />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:opacity-70 transition-opacity"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="admin-remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <Label
                htmlFor="admin-remember"
                className="cursor-pointer"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 400,
                }}
              >
                Remember my email
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gap-2"
              style={{
                height: 'var(--ikan-component-button-height)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                borderRadius: 'var(--ikan-component-border-radius)',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Back to site */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-medium)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Return to {siteName}
          </button>
        </div>

        {/* Security notice */}
        <div
          className="flex items-center justify-center gap-2 text-xs p-3 rounded-lg"
          style={{
            color: 'var(--color-status-warning)',
            backgroundColor: 'var(--color-status-warning-light)',
            border: '1px solid var(--color-status-warning)',
            fontFamily: 'var(--font-family-base)',
          }}
        >
          <CircleAlert className="w-4 h-4 shrink-0" />
          <span>Authorized personnel only.</span>
        </div>
      </div>
    </div>
  );
}