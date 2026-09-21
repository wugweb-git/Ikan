import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Icon } from '../ui/Icon';
import { LogoFull } from '../ui/Logo';
import { authContent } from '../../lib/content/auth';
import { Input } from '../ui/input';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Shield, Heart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
  reason?: 'session-expired' | 'normal' | 'auth-required' | 'user-initiated';
  redirectRoute?: string;
}

type AuthMode = 'login' | 'signup' | 'forgot';

const REMEMBER_EMAIL_KEY = 'ikan_remembered_email';

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1759951609703-f03171e6f66e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwc3Vuc2V0JTIwbGFrZSUyMG5hdHVyZSUyMG1pbmRmdWxuZXNzJTIwcGVhY2VmdWx8ZW58MXx8fHwxNzczNjY4MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

// ── font helper ─────────────────────────────────────────────────
const f = (size = 'sm', weight: 400 | 500 = 400, color?: string): React.CSSProperties => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  lineHeight: 'var(--line-height-md)',
  ...(color ? { color } : {}),
});

const HERO_FEATURES = [
  { icon: Shield, text: authContent.hero.features.private, desc: 'Your data is encrypted and never shared without consent' },
  { icon: Heart, text: authContent.hero.features.evidence, desc: 'Scientifically validated tools and assessments' },
  { icon: Users, text: authContent.hero.features.support, desc: 'Connect with licensed mental health professionals' },
];

// ════════════════════════════════════════════════════════════════
// HERO SECTION (left panel — desktop)
// ════════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Background */}
      <div aria-hidden="true" className="absolute inset-0">
        <img alt={authContent.hero.imageAlt} className="w-full h-full object-cover" src={HERO_IMAGE_URL} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.75) 60%, rgba(20,20,20,0.9) 100%)',
        }} />
      </div>

      {/* Content — left-aligned, bottom-weighted, no logo */}
      <div className="relative z-10 flex flex-col justify-end h-full" style={{ padding: '48px 40px' }}>
        {/* Title */}
        <h1 style={{
          ...f('3xl', 500, 'white'),
          lineHeight: 1.15,
          margin: '0 0 14px',
          maxWidth: 400,
        }}>
          {authContent.hero.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          ...f('base', 400, 'rgba(255,255,255,0.75)'),
          margin: '0 0 36px',
          maxWidth: 380,
          lineHeight: 1.55,
        }}>
          {authContent.hero.subtitle}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap" style={{ gap: 10 }}>
          {HERO_FEATURES.map((feat) => (
            <div key={feat.text} className="flex items-center" style={{
              gap: 8,
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}>
              <feat.icon size={15} style={{ color: 'rgba(255,255,255,0.9)' }} />
              <span style={{ ...f('xs', 500, 'rgba(255,255,255,0.9)'), whiteSpace: 'nowrap' }}>
                {feat.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// AUTH FORM
// ════════════════════════════════════════════════════════════════
function AuthForm({ mode, onSuccess, onModeChange }: {
  mode: AuthMode;
  onSuccess?: () => void;
  onModeChange: (mode: AuthMode) => void;
}) {
  const { signIn, signUp, signInWithProvider, resetPassword, loading } = useAuth();
  const { showToast } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(() => {
    let savedEmail = '';
    let remembered = false;
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) { savedEmail = saved; remembered = true; }
    } catch { /* ignore */ }
    return { email: savedEmail, password: '', confirmPassword: '', fullName: '', rememberMe: remembered };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      showToast('error', authContent.messages.error.missingEmail.title, authContent.messages.error.missingEmail.description);
      return;
    }

    if (mode === 'forgot') {
      try {
        await resetPassword(formData.email);
        showToast('success', authContent.messages.success.resetSent.title, authContent.messages.success.resetSent.description);
        onModeChange('login');
      } catch (error) {
        console.error('Password reset error:', error);
        showToast('error', authContent.messages.error.resetFailed.title, error instanceof Error ? error.message : authContent.messages.error.resetFailed.description);
      }
      return;
    }

    if (!formData.password) {
      showToast('error', authContent.messages.error.missingPassword.title, authContent.messages.error.missingPassword.description);
      return;
    }

    if (mode === 'signup') {
      if (!formData.fullName) {
        showToast('error', authContent.messages.error.missingName.title, authContent.messages.error.missingName.description);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showToast('error', authContent.messages.error.passwordMismatch.title, authContent.messages.error.passwordMismatch.description);
        return;
      }
      if (formData.password.length < 8) {
        showToast('error', authContent.messages.error.passwordShort.title, authContent.messages.error.passwordShort.description);
        return;
      }
      try {
        await signUp(formData.email, formData.password, formData.fullName);
        showToast('success', authContent.messages.success.accountCreated.title, authContent.messages.success.accountCreated.description);
        onSuccess?.();
      } catch (error: any) {
        console.error('Sign up error:', error);
        if (error?.needsConfirmation) {
          showToast('info', 'Verify your email', error.message || 'Check your inbox to confirm your account, then sign in.');
          return;
        }
        showToast('error', authContent.messages.error.signUpFailed.title, error instanceof Error ? error.message : authContent.messages.error.signUpFailed.description);
      }
    } else {
      try {
        await signIn(formData.email, formData.password);
        if (formData.rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
        showToast('success', authContent.messages.success.welcomeBack.title, authContent.messages.success.welcomeBack.description);
        onSuccess?.();
      } catch (error) {
        console.error('Sign in error:', error);
        showToast('error', authContent.messages.error.signInFailed.title, error instanceof Error ? error.message : authContent.messages.error.signInFailed.description);
      }
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'linkedin_oidc' | 'apple') => {
    try {
      await signInWithProvider(provider);
      const providerName = provider === 'google' ? 'Google' : provider === 'linkedin_oidc' ? 'LinkedIn' : 'Apple';
      const isInIframe = window.self !== window.top;
      if (isInIframe) {
        showToast('info', 'Signing In', `Complete sign-in in the ${providerName} popup window...`);
      } else {
        showToast('success', authContent.messages.success.socialWelcome.title, `Signing in with ${providerName}...`);
        onSuccess?.();
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      showToast('error', authContent.messages.error.socialFailed.title, error instanceof Error ? error.message : `Failed to sign in with ${provider}. Please try again.`);
    }
  };

  const inputStyle: React.CSSProperties = {
    height: 48,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-input)',
    border: '1.5px solid var(--color-border-default)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-family-base)',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Full Name — signup only */}
      {mode === 'signup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="fullName" style={f('sm', 500, 'var(--color-text-primary)')}>
            {authContent.form.labels.fullName}
          </label>
          <Input
            id="fullName" type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
            placeholder={authContent.form.placeholders.fullName}
            disabled={loading}
            startIcon={<User size={18} style={{ color: 'var(--color-text-muted)' }} />}
            style={inputStyle}
          />
        </div>
      )}

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="email" style={f('sm', 500, 'var(--color-text-primary)')}>
          {authContent.form.labels.email}
        </label>
        <Input
          id="email" type="email"
          value={formData.email}
          onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
          placeholder={authContent.form.placeholders.email}
          disabled={loading}
          startIcon={<Mail size={18} style={{ color: 'var(--color-text-muted)' }} />}
          style={inputStyle}
        />
      </div>

      {/* Password — not forgot */}
      {mode !== 'forgot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="password" style={f('sm', 500, 'var(--color-text-primary)')}>
            {authContent.form.labels.password}
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
            placeholder={mode === 'signup' ? authContent.form.placeholders.passwordSignup : authContent.form.placeholders.password}
            disabled={loading}
            startIcon={<Lock size={18} style={{ color: 'var(--color-text-muted)' }} />}
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} style={{ color: 'var(--color-text-muted)' }} /> : <Eye size={18} style={{ color: 'var(--color-text-muted)' }} />}
              </button>
            }
            style={inputStyle}
          />
        </div>
      )}

      {/* Confirm Password — signup only */}
      {mode === 'signup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="confirmPassword" style={f('sm', 500, 'var(--color-text-primary)')}>
            {authContent.form.labels.confirmPassword}
          </label>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
            placeholder={authContent.form.placeholders.confirmPassword}
            disabled={loading}
            startIcon={<Lock size={18} style={{ color: 'var(--color-text-muted)' }} />}
            endIcon={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <EyeOff size={18} style={{ color: 'var(--color-text-muted)' }} /> : <Eye size={18} style={{ color: 'var(--color-text-muted)' }} />}
              </button>
            }
            style={inputStyle}
          />
        </div>
      )}

      {/* Remember + Forgot — login only */}
      {mode === 'login' && (
        <div className="flex items-center justify-between">
          <label className="flex items-center" style={{ gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData(p => ({ ...p, rememberMe: e.target.checked }))}
              style={{
                width: 18, height: 18,
                borderRadius: 4,
                accentColor: 'var(--color-primary-default)',
              }}
            />
            <span style={f('sm', 400, 'var(--color-text-muted)')}>{authContent.form.labels.rememberMe}</span>
          </label>
          <button
            type="button"
            onClick={() => onModeChange('forgot')}
            style={{ ...f('sm', 500, 'var(--color-primary-default)'), background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {authContent.form.buttons.forgotPassword}
          </button>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          height: 52,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-default)',
          color: 'var(--color-text-inverse)',
          ...f('base', 500),
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.15s, transform 0.1s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? (
          <>
            <Icon name="loader2" size={16} className="animate-spin" />
            {authContent.form.buttons.processing}
          </>
        ) : (
          <>
            {mode === 'login' && authContent.form.buttons.signIn}
            {mode === 'signup' && authContent.form.buttons.signUp}
            {mode === 'forgot' && authContent.form.buttons.reset}
          </>
        )}
      </button>

      {/* Back to login — forgot only */}
      {mode === 'forgot' && (
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className="flex items-center justify-center"
          style={{ ...f('sm', 500, 'var(--color-text-muted)'), background: 'none', border: 'none', cursor: 'pointer', gap: 6 }}
        >
          <ArrowLeft size={14} />
          {authContent.form.buttons.backToSignIn}
        </button>
      )}

      {/* Social login divider — not forgot */}
      {mode !== 'forgot' && (
        <>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border-default)' }} />
            <span style={f('xs', 400, 'var(--color-text-muted)')}>
              {authContent.form.social.continuePrefix}
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border-default)' }} />
          </div>

          <div className="grid grid-cols-3" style={{ gap: 12 }}>
            {/* Google */}
            <button type="button" onClick={() => handleSocialSignIn('google')} disabled={loading}
              style={{
                height: 48, borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border-default)',
                backgroundColor: 'var(--color-bg-card)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading ? 0.5 : 1,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-default)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-default)'; }}
              aria-label="Sign in with Google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>

            {/* LinkedIn */}
            <button type="button" onClick={() => handleSocialSignIn('linkedin_oidc')} disabled={loading}
              style={{
                height: 48, borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border-default)',
                backgroundColor: 'var(--color-bg-card)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading ? 0.5 : 1,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-default)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-default)'; }}
              aria-label="Sign in with LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
              </svg>
            </button>

            {/* Apple */}
            <button type="button" onClick={() => handleSocialSignIn('apple')} disabled={loading}
              style={{
                height: 48, borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border-default)',
                backgroundColor: 'var(--color-bg-card)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading ? 0.5 : 1,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-default)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-default)'; }}
              aria-label="Sign in with Apple"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#000000"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </form>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN LOGIN SCREEN
// ════════════════════════════════════════════════════════════════
export default function LoginScreen({ onSuccess, onBack, onNavigate, reason, redirectRoute: _redirectRoute }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { showToast } = useNotifications();
  const handleBack = onBack || (onNavigate ? () => onNavigate('/') : undefined);

  useEffect(() => {
    if (reason === 'session-expired') {
      setTimeout(() => showToast('info', authContent.messages.info.sessionExpired.title, authContent.messages.info.sessionExpired.description), 500);
    } else if (reason === 'auth-required') {
      setTimeout(() => showToast('info', authContent.messages.info.authRequired.title, authContent.messages.info.authRequired.description), 500);
    }
  }, [reason, showToast]);

  const getTitle = () => {
    switch (authMode) {
      case 'login': return authContent.header.welcomeBack;
      case 'signup': return authContent.header.createAccount;
      case 'forgot': return authContent.header.resetPassword;
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'login': return authContent.header.signInSubtitle;
      case 'signup': return authContent.header.signUpSubtitle;
      case 'forgot': return authContent.header.forgotSubtitle;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'var(--color-bg-card)', overflow: 'hidden' }}>
      <div className="flex flex-col md:flex-row" style={{ height: '100%' }}>

        {/* ── LEFT PANEL: Hero (desktop only) ─────────────────────── */}
        <div className="hidden md:flex" style={{ width: '45%', height: '100%', flexShrink: 0 }}>
          <HeroSection />
        </div>

        {/* ── RIGHT PANEL: Auth form (always visible) ─────────────── */}
        <div
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ backgroundColor: 'var(--color-bg-card)', position: 'relative' }}
        >
          {/* Black logo — top right */}
          <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 10 }}>
            <LogoFull height={28} style={{ color: '#2A2A2A' }} />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div style={{ width: '100%', maxWidth: 420, padding: '32px 28px', margin: '0 auto' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={authMode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Back button only — no logo on right side */}
                  {handleBack && (
                    <div style={{ marginBottom: 24 }}>
                      <button
                        onClick={handleBack}
                        className="flex items-center"
                        style={{
                          ...f('sm', 500, 'var(--color-text-muted)'),
                          gap: 6,
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <ArrowLeft size={16} />
                        {authContent.header.back}
                      </button>
                    </div>
                  )}

                  {/* Title + subtitle — left-aligned */}
                  <div style={{ marginBottom: 8 }}>
                    <h1 style={{ ...f('2xl', 500, 'var(--color-text-primary)'), margin: '0 0 8px', lineHeight: 1.2 }}>
                      {getTitle()}
                    </h1>
                    <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '0 0 4px' }}>
                      {getSubtitle()}
                    </p>
                  </div>

                  {/* Mode switcher — left-aligned */}
                  {authMode !== 'forgot' && (
                    <div className="flex items-center" style={{ gap: 4, marginBottom: 24 }}>
                      <span style={f('sm', 400, 'var(--color-text-muted)')}>
                        {authMode === 'login' ? authContent.messages.switch.toSignup : authContent.messages.switch.toLogin}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        style={{
                          ...f('sm', 500, 'var(--color-primary-default)'),
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          textDecoration: 'underline', textUnderlineOffset: 2,
                        }}
                      >
                        {authMode === 'login' ? authContent.messages.switch.toSignupAction : authContent.messages.switch.toLoginAction}
                      </button>
                    </div>
                  )}

                  {authMode === 'forgot' && <div style={{ height: 16 }} />}

                  {/* Form */}
                  <AuthForm mode={authMode} onSuccess={onSuccess} onModeChange={setAuthMode} />

                  {/* Footer */}
                  <p style={{
                    ...f('xs', 400, 'var(--color-text-muted)'),
                    margin: '20px 0 0',
                    lineHeight: 1.5,
                  }}>
                    {authContent.form.footer}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}