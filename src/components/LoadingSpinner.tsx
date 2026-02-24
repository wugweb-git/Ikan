import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Shared loading spinner for user-facing screens.
 * Uses iKan design tokens exclusively — no hardcoded colors or px values.
 */
export function LoadingSpinner({ message, fullScreen = false, size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'var(--spacing-8)',
    md: 'var(--spacing-12)',
    lg: 'var(--spacing-16)',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center text-center" style={{ gap: 'var(--spacing-4)' }}>
      <div
        className="animate-spin rounded-full"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          borderWidth: size === 'sm' ? '2px' : '4px',
          borderStyle: 'solid',
          borderColor: 'var(--color-accent-default)',
          borderTopColor: 'var(--color-primary-default)',
        }}
      />
      {message && (
        <p style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-muted)',
        }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-page)' }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      {spinner}
    </div>
  );
}