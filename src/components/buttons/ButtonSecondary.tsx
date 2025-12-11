import React from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface ButtonSecondaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  leadingIcon?: string;
  trailingIcon?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ButtonSecondary({ 
  children, 
  leadingIcon, 
  trailingIcon,
  size = 'md',
  fullWidth = false,
  disabled,
  className,
  onClick,
  ...props 
}: ButtonSecondaryProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
        "hover:bg-opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "border transition-colors",
        fullWidth && "w-full",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: disabled ? 'var(--color-neutral-200)' : 'var(--color-accent-default)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-accent-on)',
        borderColor: disabled ? 'var(--color-neutral-300)' : 'var(--color-border-default)',
        borderWidth: 'var(--spacing-1)',
        borderRadius: 'var(--radius-sm)',
        minWidth: fullWidth ? '100%' : 'var(--constraint-component-min)',
        maxWidth: fullWidth ? '100%' : 'var(--constraint-component-max)',
        fontSize: size === 'sm' ? 'var(--text-sm)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        height: '48px', // Consistent height for all buttons
        ringColor: 'var(--color-accent-default)',
        ringOpacity: 0.3
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--color-accent-default)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {leadingIcon && (
        <Icon 
          name={leadingIcon} 
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          variant="roundedOutline"
        />
      )}
      
      <span>{children}</span>
      
      {trailingIcon && (
        <Icon 
          name={trailingIcon} 
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          variant="roundedOutline"
        />
      )}
    </button>
  );
}