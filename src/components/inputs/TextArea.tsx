import React, { forwardRef, useState } from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  minRows?: number;
  maxRows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  resize = 'vertical',
  minRows = 3,
  maxRows,
  disabled,
  className,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (hasError) return 'var(--color-status-danger)';
    if (isFocused) return 'var(--color-primary-default)';
    return 'var(--color-border-default)';
  };

  const getBackgroundColor = () => {
    if (disabled) return 'var(--color-neutral-200)';
    return 'var(--color-bg-input)';
  };

  return (
    <div 
      className={cn(
        "space-y-2",
        fullWidth && "w-full",
        className
      )}
      style={{
        minWidth: fullWidth ? '100%' : 'var(--constraint-input-min)',
        maxWidth: fullWidth ? '100%' : 'var(--constraint-content-max)'
      }}
    >
      {label && (
        <label 
          className="block"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: hasError ? 'var(--color-status-danger)' : 'var(--color-text-primary)'
          }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          {...props}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={minRows}
          className={cn(
            "w-full transition-all duration-200 outline-none",
            "placeholder:text-muted-foreground animate-fadeIn",
            isFocused && "ring-2",
            disabled && "cursor-not-allowed opacity-50"
          )}
          style={{
            backgroundColor: getBackgroundColor(),
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${getBorderColor()}`,
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            padding: 'var(--spacing-3)',
            resize,
            minHeight: `calc(${minRows} * 1.5em + var(--spacing-6))`,
            maxHeight: maxRows ? `calc(${maxRows} * 1.5em + var(--spacing-6))` : undefined,
            ringColor: hasError ? 'var(--color-status-danger)' : 'var(--color-primary-default)',
            ringOpacity: 0.2,
            fontFamily: 'var(--font-family-base)'
          }}
        />
        
        {/* Article icon indicator */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <Icon 
            name="article"
            size={16}
            variant="outline"
            style={{ 
              color: hasError ? 'var(--color-status-danger)' : 
                     isFocused ? 'var(--color-primary-default)' : 'var(--color-text-muted)',
              opacity: 0.5
            }}
          />
        </div>
      </div>
      
      {(error || helperText) && (
        <div 
          className="text-sm animate-fadeIn"
          style={{
            color: error ? 'var(--color-status-danger)' : 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)'
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});