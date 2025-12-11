import React from 'react';
import { Heart } from 'lucide-react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export function LoadingScreen({ 
  message = 'Loading...', 
  subtitle = 'Please wait while we prepare your experience' 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="flex items-center justify-center mb-4">
          <Logo iconSize={24} />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" 
             style={{ borderColor: 'var(--color-primary-default)' }}></div>
        <div className="space-y-2">
          <p style={{ 
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            {message}
          </p>
          <p style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-xs)',
            lineHeight: 'var(--line-height-md)'
          }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}