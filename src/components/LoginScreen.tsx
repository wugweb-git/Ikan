import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { cn } from './ui/utils';
import svgPaths from "../imports/svg-850apu7kjy";

interface LoginScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
  reason?: 'session-expired' | 'normal' | 'auth-required' | 'user-initiated';
  redirectRoute?: string;
}

type AuthMode = 'login' | 'signup' | 'forgot';

// Hero section with overlaying text on Unsplash image
function HeroSection() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div aria-hidden="true" className="absolute inset-0">
        <img 
          alt="Peaceful meditation scene representing mental wellness" 
          className="w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1758274538961-fe8f1f24166f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwd2VsbG5lc3MlMjBtZW50YWwlMjBoZWFsdGglMjBwZWFjZWZ1bCUyMHBlcnNvbnxlbnwxfHx8fDE3NTkyOTYyNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60 hidden lg:block" />
      </div>
      
      {/* Overlaying Text Content */}
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-8">
        <h1 
          className="mb-6"
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-sm)',
            color: 'white'
          }}
        >
          Your Mental Health Journey Starts Here
        </h1>
        <p 
          className="mb-8"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: 'var(--line-height-md)',
            color: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          Access evidence-based assessments, personalized insights, and professional support to enhance your wellbeing and resilience.
        </p>
        
        {/* Feature highlights */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <Icon name="shield" size={20} style={{ color: 'white' }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Private & Secure</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="heart" size={20} style={{ color: 'white' }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Evidence-Based</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="users" size={20} style={{ color: 'white' }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Professional Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthHeader({ mode, onModeChange, onBack }: { mode: AuthMode; onModeChange: (mode: AuthMode) => void; onBack?: () => void }) {
  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome Back';
      case 'signup':
        return 'Create Account';
      case 'forgot':
        return 'Reset Password';
      default:
        return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to continue your mental health journey';
      case 'signup':
        return 'Join thousands improving their mental wellbeing';
      case 'forgot':
        return 'Enter your email to receive reset instructions';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button and Logo */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity touch-target"
            style={{ 
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-medium)' 
            }}
          >
            <Icon name="arrowLeft" size={16} />
            Back
          </button>
        )}
        
        {/* Logo centered in remaining space */}
        <div className={cn("flex", onBack ? "flex-1 justify-center" : "justify-center w-full")}>
          <Logo />
        </div>
        
        {/* Spacer to balance back button */}
        {onBack && <div className="w-16" />}
      </div>

      {/* Auth Content */}
      <div className="text-center space-y-3">
        <h1 
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-sm)'
          }}
        >
          {getTitle()}
        </h1>
        <p 
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          {getSubtitle()}
        </p>
        
        {/* Mode Switcher */}
        {mode !== 'forgot' && (
          <div className="flex items-center justify-center gap-1 text-sm mt-4">
            <span style={{ color: 'var(--color-text-muted)' }}>
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              className="font-medium hover:underline"
              style={{ color: 'var(--color-primary-default)' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthForm({ mode, onSuccess, onModeChange }: { 
  mode: AuthMode; 
  onSuccess?: () => void; 
  onModeChange: (mode: AuthMode) => void;
}) {
  const { signIn, signUp, signInWithProvider, resetPassword, loading } = useAuth();
  const { showToast } = useNotifications();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      showToast('error', 'Missing email', 'Please enter your email address');
      return;
    }

    if (mode === 'forgot') {
      try {
        await resetPassword(formData.email);
        showToast('success', 'Reset email sent', 'Check your email for password reset instructions.');
        onModeChange('login');
      } catch (error) {
        console.error('Password reset error:', error);
        showToast('error', 'Reset failed', error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
      }
      return;
    }

    if (!formData.password) {
      showToast('error', 'Missing password', 'Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (!formData.fullName) {
        showToast('error', 'Missing name', 'Please enter your full name');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showToast('error', 'Passwords do not match', 'Please ensure both passwords are identical');
        return;
      }
      if (formData.password.length < 8) {
        showToast('error', 'Password too short', 'Password must be at least 8 characters long');
        return;
      }

      try {
        await signUp(formData.email, formData.password, formData.fullName);
        showToast('success', 'Account created!', 'Welcome to iKan. Your mental health journey begins now.');
        onSuccess?.();
      } catch (error) {
        console.error('Sign up error:', error);
        showToast('error', 'Sign up failed', error instanceof Error ? error.message : 'Failed to create account. Please try again.');
      }
    } else {
      try {
        await signIn(formData.email, formData.password);
        showToast('success', 'Welcome back!', 'You have successfully signed in.');
        onSuccess?.();
      } catch (error) {
        console.error('Sign in error:', error);
        showToast('error', 'Sign in failed', error instanceof Error ? error.message : 'Please check your credentials and try again.');
      }
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'linkedin_oidc' | 'apple') => {
    try {
      await signInWithProvider(provider);
      showToast('success', `Welcome!`, `Signing in with ${provider === 'google' ? 'Google' : provider === 'linkedin_oidc' ? 'LinkedIn' : 'Apple'}...`);
      onSuccess?.();
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      showToast('error', 'Social sign-in failed', error instanceof Error ? error.message : `Failed to sign in with ${provider}. Please try again.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Full Name Input - Only for Sign Up */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <label 
            htmlFor="fullName"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full name"
            disabled={loading}
            className="ikan-input w-full transition-colors focus:border-primary-default focus:ring-2 focus:ring-primary-default/20"
            style={{
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-default)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              padding: '0 var(--spacing-4)',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <label 
          htmlFor="email"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)'
          }}
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email"
          disabled={loading}
          className="ikan-input w-full transition-colors focus:border-primary-default focus:ring-2 focus:ring-primary-default/20"
          style={{
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-bg-input)',
            borderColor: 'var(--color-border-default)',
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
            padding: '0 var(--spacing-4)',
            outline: 'none'
          }}
        />
      </div>

      {/* Password Input - Not for Forgot Password */}
      {mode !== 'forgot' && (
        <div className="space-y-2">
          <label 
            htmlFor="password"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder={mode === 'signup' ? 'Create a secure password (min 8 characters)' : 'Enter your password'}
            disabled={loading}
            className="ikan-input w-full transition-colors focus:border-primary-default focus:ring-2 focus:ring-primary-default/20"
            style={{
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-default)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              padding: '0 var(--spacing-4)',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Confirm Password - Only for Sign Up */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <label 
            htmlFor="confirmPassword"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Confirm your password"
            disabled={loading}
            className="ikan-input w-full transition-colors focus:border-primary-default focus:ring-2 focus:ring-primary-default/20"
            style={{
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-input)',
              borderColor: 'var(--color-border-default)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              padding: '0 var(--spacing-4)',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Remember Me & Forgot Password - Only for Login */}
      {mode === 'login' && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}
            >
              Remember me
            </span>
          </label>
          
          <button
            type="button"
            onClick={() => onModeChange('forgot')}
            className="text-sm hover:underline"
            style={{ color: 'var(--color-primary-default)' }}
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="ikan-button w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        style={{
          height: '48px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-primary-default)',
          color: 'var(--color-primary-on)',
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-family-base)',
          fontWeight: 'var(--font-weight-medium)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Icon name="loader2" size={16} className="animate-spin" />
            Processing...
          </div>
        ) : (
          <>
            {mode === 'login' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Email'}
          </>
        )}
      </button>

      {/* Back to Login - Only for Forgot Password */}
      {mode === 'forgot' && (
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className="w-full text-center text-sm hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Back to sign in
        </button>
      )}

      {/* Social Login - Only for Login and Sign Up */}
      {mode !== 'forgot' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-2 bg-white"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('google')}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5">
                <svg className="block size-full" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
            </button>

            {/* LinkedIn Button */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('linkedin_oidc')}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5">
                <svg className="block size-full" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
                </svg>
              </div>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('apple')}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5">
                <svg className="block size-full" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#000000"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

// Logo component is now imported from ./Logo

export default function LoginScreen({ onSuccess, onBack, reason, redirectRoute }: LoginScreenProps) {
  const isMobile = useIsMobile();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { showToast } = useNotifications();

  // Show appropriate message based on reason
  useEffect(() => {
    if (reason === 'session-expired') {
      setTimeout(() => {
        showToast('info', 'Session Expired', 'Please sign in again to continue using iKan.');
      }, 500);
    } else if (reason === 'auth-required') {
      setTimeout(() => {
        showToast('info', 'Sign In Required', 'Please sign in to access this feature.');
      }, 500);
    }
  }, [reason, showToast]);

  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      {/* Main Content - Standard Auth Screen Layout */}
      <div className={cn("h-full flex", isMobile ? "flex-col" : "flex-row")}>
        {/* Left Side - Hero Section with Image and Text - Desktop Only */}
        <div 
          className={cn(
            "relative flex items-center justify-center hidden lg:flex",
            "w-1/2 h-screen"
          )}
        >
          <HeroSection />
        </div>

        {/* Right Side - Auth Form */}
        <div 
          className={cn(
            "flex items-center justify-center",
            isMobile ? "flex-1 w-full p-6 min-h-screen" : "w-1/2 h-screen p-8"
          )}
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <div className="w-full max-w-md space-y-8">
            {/* Auth Header with Logo and Back Button */}
            <AuthHeader 
              mode={authMode} 
              onModeChange={setAuthMode}
              onBack={onBack}
            />

            {/* Auth Form */}
            <AuthForm 
              mode={authMode} 
              onSuccess={onSuccess} 
              onModeChange={setAuthMode}
            />

            {/* Footer */}
            <div className="text-center">
              <p 
                className="text-xs"
                style={{ 
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}