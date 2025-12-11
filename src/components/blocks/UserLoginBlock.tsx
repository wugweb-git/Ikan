import React, { useState } from 'react';
import { TextInput } from '../inputs/TextInput';
import { ButtonPrimary } from '../buttons/ButtonPrimary';
import { ButtonLink } from '../buttons/ButtonLink';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface UserLoginBlockProps {
  onSubmit?: (credentials: { email: string; password: string }) => void;
  onForgotPassword?: () => void;
  onValidate?: (field: string, value: string) => string | null;
  loading?: boolean;
  className?: string;
}

export function UserLoginBlock({ 
  onSubmit, 
  onForgotPassword,
  onValidate,
  loading = false,
  className 
}: UserLoginBlockProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (field: string, value: string): string | null => {
    // Use custom validation if provided
    if (onValidate) {
      return onValidate(field, value);
    }

    // Default validation
    switch (field) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        break;
      default:
        break;
    }
    return null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      onSubmit?.(formData);
    }
  };

  const isFormValid = Object.keys(errors).length === 0 && formData.email && formData.password;

  return (
    <div 
      className={cn("w-full max-w-md mx-auto", className)}
      style={{
        minWidth: 'var(--constraint-input-min)',
        maxWidth: 'var(--constraint-input-max)'
      }}
    >
      <div 
        className="p-8 rounded-lg shadow-sm animate-fadeIn"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="heart" size={24} style={{ color: 'var(--color-primary-default)' }} />
            <span 
              style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary-default)'
              }}
            >
              iKan
            </span>
          </div>
          <h1 
            style={{ 
              fontSize: 'var(--text-2xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-2)'
            }}
          >
            Welcome Back
          </h1>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)'
          }}>
            Sign in to continue your mental health journey
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" style={{ gap: 'var(--spacing-3)' }}>
          <TextInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            leadingIcon="mail"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleInputBlur('email')}
            error={touched.email ? errors.email : undefined}
            disabled={loading}
            fullWidth
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            leadingIcon="lock"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleInputBlur('password')}
            error={touched.password ? errors.password : undefined}
            disabled={loading}
            fullWidth
          />

          <ButtonPrimary
            type="submit"
            disabled={!isFormValid || loading}
            loading={loading}
            trailingIcon="arrowRight"
            fullWidth
            size="lg"
          >
            Sign In
          </ButtonPrimary>

          <div className="text-center">
            <ButtonLink
              onClick={onForgotPassword}
              disabled={loading}
              size="sm"
            >
              Forgot your password?
            </ButtonLink>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border-default)' }}>
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-md)'
          }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}