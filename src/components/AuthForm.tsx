import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone, Heart, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { authContent } from '../lib/content/auth';

interface AuthFormProps {
  onSuccess?: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthForm({ onSuccess, defaultTab = 'signin' }: AuthFormProps) {
  const { signIn, signUp, signInWithProvider, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // UI State
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};

    if (!signInData.email) {
      newErrors.email = authContent.validation.required.email;
    } else if (!/\S+@\S+\.\S+/.test(signInData.email)) {
      newErrors.email = authContent.validation.format.email;
    }

    if (!signInData.password) {
      newErrors.password = authContent.validation.required.password;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};

    if (!signUpData.name.trim()) {
      newErrors.name = authContent.validation.required.name;
    }

    if (!signUpData.email) {
      newErrors.email = authContent.validation.required.email;
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = authContent.validation.format.email;
    }

    if (!signUpData.password) {
      newErrors.password = authContent.validation.required.password;
    } else if (signUpData.password.length < 6) {
      newErrors.password = authContent.validation.format.passwordLengthShort;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = authContent.validation.format.passwordMismatch;
    }

    if (signUpData.phone && !/^\+?[\d\s\-\(\)]+$/.test(signUpData.phone)) {
      newErrors.phone = authContent.validation.format.phone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    try {
      await signIn(signInData.email, signInData.password);
      toast.success(authContent.messages.success.welcomeBack.title, {
        description: authContent.messages.success.welcomeBack.description
      });
      onSuccess?.();
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(authContent.messages.error.signInFailed.title, {
        description: error instanceof Error ? error.message : authContent.messages.error.signInFailed.description
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    try {
      await signUp(
        signUpData.email, 
        signUpData.password, 
        signUpData.name,
        signUpData.phone || undefined
      );
      toast.success(authContent.messages.success.accountCreated.titleAlt, {
        description: authContent.messages.success.accountCreated.descriptionAlt
      });
      onSuccess?.();
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(authContent.messages.error.signUpFailed.title, {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'linkedin_oidc' | 'apple') => {
    try {
      await signInWithProvider(provider);
      toast.success(authContent.messages.success.socialWelcome.title, {
        description: `Signing in with ${provider === 'google' ? 'Google' : provider === 'linkedin_oidc' ? 'LinkedIn' : 'Apple'}...`
      });
      onSuccess?.();
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(authContent.messages.error.socialFailed.title, {
        description: error instanceof Error ? error.message : `Failed to sign in with ${provider}. Please try again.`
      });
    }
  };

  const SocialButton = ({ 
    provider, 
    icon, 
    label, 
    color 
  }: { 
    provider: 'google' | 'linkedin_oidc' | 'apple';
    icon: React.ReactNode;
    label: string;
    color: string;
  }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-3 touch-target"
      onClick={() => handleSocialSignIn(provider)}
      disabled={loading}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-default)',
        color: 'var(--color-text-primary)',
        fontWeight: 'var(--font-weight-medium)',
        minHeight: '48px',
        fontSize: 'var(--text-sm)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      <div style={{ color }}>{icon}</div>
      {label}
    </Button>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-primary-default)' }}
          >
            <Heart size={24} style={{ color: 'white' }} />
          </div>
          <CardTitle 
            style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-primary-default)'
            }}
          >
            {authContent.header.brandName}
          </CardTitle>
        </div>
        <p style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-md)'
        }}>
          {authContent.header.brandSubtitle}
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">{authContent.tabs.signIn}</TabsTrigger>
            <TabsTrigger value="signup">{authContent.tabs.signUp}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-2">
                  <Mail size={14} />
                  {authContent.form.labels.email}
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={authContent.form.placeholders.email}
                  disabled={loading}
                  className={errors.email ? 'border-destructive' : ''}
                  style={{
                    backgroundColor: 'var(--color-bg-input)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {errors.email && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-2">
                  <Lock size={14} />
                  {authContent.form.labels.password}
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showSignInPassword ? "text" : "password"}
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={authContent.form.placeholders.password}
                    disabled={loading}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    style={{
                      backgroundColor: 'var(--color-bg-input)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-70 transition-opacity"
                    disabled={loading}
                    style={{
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  disabled={loading}
                />
                <Label 
                  htmlFor="remember-me" 
                  className="cursor-pointer"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-weight-regular)'
                  }}
                >
                  {authContent.form.labels.rememberMe}
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {authContent.form.buttons.signingIn}
                  </>
                ) : (
                  <>
                    <User size={16} />
                    {authContent.form.buttons.signIn}
                  </>
                )}
              </Button>

              {/* Demo Credentials Helper */}
              <button
                type="button"
                onClick={() => {
                  setSignInData({
                    email: 'demo@ikan.health',
                    password: 'password123'
                  });
                }}
                className="w-full text-xs text-center hover:underline opacity-70 mt-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {authContent.form.buttons.demoAccount}
              </button>
            </form>

            {/* Social Sign-In Options */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--color-border-default)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span 
                    className="px-2"
                    style={{ 
                      backgroundColor: 'var(--color-bg-card)', 
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    {authContent.form.social.continuePrefix}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <SocialButton
                  provider="google"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  }
                  label={authContent.form.social.google}
                  color="#4285F4"
                />

                <SocialButton
                  provider="linkedin_oidc"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
                    </svg>
                  }
                  label={authContent.form.social.linkedin}
                  color="#0A66C2"
                />

                <SocialButton
                  provider="apple"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#000"/>
                    </svg>
                  }
                  label={authContent.form.social.apple}
                  color="#000"
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-primary-default)'
                }}
                className="hover:underline"
              >
                {authContent.messages.switch.toSignup}
              </button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center gap-2">
                  <User size={14} />
                  {authContent.form.labels.fullName}
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={authContent.form.placeholders.fullName}
                  disabled={loading}
                  className={errors.name ? 'border-destructive' : ''}
                  style={{
                    backgroundColor: 'var(--color-bg-input)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {errors.name && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail size={14} />
                  {authContent.form.labels.email}
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={authContent.form.placeholders.email}
                  disabled={loading}
                  className={errors.email ? 'border-destructive' : ''}
                  style={{
                    backgroundColor: 'var(--color-bg-input)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {errors.email && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="flex items-center gap-2">
                  <Phone size={14} />
                  {authContent.form.labels.phone}
                </Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={authContent.form.placeholders.phone}
                  disabled={loading}
                  className={errors.phone ? 'border-destructive' : ''}
                  style={{
                    backgroundColor: 'var(--color-bg-input)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                {errors.phone && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock size={14} />
                  {authContent.form.labels.password}
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={authContent.form.placeholders.passwordCreate}
                    disabled={loading}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    style={{
                      backgroundColor: 'var(--color-bg-input)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-70 transition-opacity"
                    disabled={loading}
                    style={{
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                  <Lock size={14} />
                  {authContent.form.labels.confirmPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder={authContent.form.placeholders.confirmPassword}
                    disabled={loading}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                    style={{
                      backgroundColor: 'var(--color-bg-input)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-70 transition-opacity"
                    disabled={loading}
                    style={{
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-danger)'
                  }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {authContent.form.buttons.creatingAccount}
                  </>
                ) : (
                  <>
                    <Heart size={16} />
                    {authContent.form.buttons.signUp}
                  </>
                )}
              </Button>
            </form>

            {/* Social Sign-Up Options */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--color-border-default)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span 
                    className="px-2"
                    style={{ 
                      backgroundColor: 'var(--color-bg-card)', 
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    {authContent.form.social.signUpPrefix}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <SocialButton
                  provider="google"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  }
                  label={authContent.form.social.signupGoogle}
                  color="#4285F4"
                />

                <SocialButton
                  provider="linkedin_oidc"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
                    </svg>
                  }
                  label={authContent.form.social.signupLinkedin}
                  color="#0A66C2"
                />

                <SocialButton
                  provider="apple"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#000"/>
                    </svg>
                  }
                  label={authContent.form.social.signupApple}
                  color="#000"
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-primary-default)'
                }}
                className="hover:underline"
              >
                {authContent.messages.switch.toLogin}
              </button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Demo Credentials Helper */}


      </CardContent>
    </Card>
  );
}