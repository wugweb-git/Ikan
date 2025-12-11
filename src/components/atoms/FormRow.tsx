import React from 'react';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';

interface FormRowProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  labelWidth?: string;
  direction?: 'horizontal' | 'vertical';
}

export function FormRow({
  label,
  required = false,
  error,
  children,
  className,
  labelWidth = '140px',
  direction = 'horizontal'
}: FormRowProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <div 
      className={cn(
        "space-y-2",
        isHorizontal && "lg:flex lg:items-start lg:space-y-0 lg:space-x-4",
        className
      )}
    >
      {/* Label */}
      <div 
        className={cn(
          "flex-shrink-0",
          isHorizontal && "lg:pt-2"
        )}
        style={isHorizontal ? { width: labelWidth } : {}}
      >
        <Label 
          className="flex items-center gap-1"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          {label}
          {required && (
            <span 
              style={{ color: 'var(--color-status-danger)' }}
              aria-label="Required field"
            >
              *
            </span>
          )}
        </Label>
      </div>

      {/* Input Container */}
      <div className="flex-1 space-y-1">
        {children}
        
        {/* Error Message */}
        {error && (
          <p 
            className="flex items-center gap-1"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-status-danger)',
              lineHeight: 'var(--line-height-sm)'
            }}
            role="alert"
            aria-live="polite"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default FormRow;