import type React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../utils';

interface AccountPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export function AccountPageHeader({
  title,
  subtitle,
  actions,
  className,
  onBack
}: AccountPageHeaderProps) {
  return (
    <div className={cn("flex flex-col", className)} style={{ gap: '4px', marginBottom: '24px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center" style={{ gap: '8px' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center shrink-0 hover:bg-black/5 active:bg-black/10 transition-colors"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                marginLeft: '-4px'
              }}
              aria-label="Go back"
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: 'var(--color-text-primary)' }} />
            </button>
          )}
          <h1
            className="m-0"
            style={{
              fontSize: '28px',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: '34px',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              letterSpacing: '-0.3px'
            }}
          >
            {title}
          </h1>
        </div>
        {actions && (
          <div className="flex items-center" style={{ gap: '8px' }}>
            {actions}
          </div>
        )}
      </div>
      {subtitle && (
        <p
          className="m-0"
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-regular)',
            paddingLeft: onBack ? '44px' : '0'
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}