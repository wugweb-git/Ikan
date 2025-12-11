import React from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface ButtonIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'solid';
  'aria-label': string; // Required for accessibility
}

export function ButtonIcon({ 
  icon,
  selected = false,
  size = 'md',
  variant = 'default',
  disabled,
  className,
  onClick,
  ...props 
}: ButtonIconProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Add bounce animation
    const button = e.currentTarget;
    button.style.animation = 'bounce var(--motion-duration-fast) var(--motion-easing-out)';
    setTimeout(() => {
      button.style.animation = '';
    }, 150);
    
    onClick?.(e);
  };

  const getBackgroundColor = () => {
    if (disabled) return 'var(--color-neutral-200)';
    if (variant === 'ghost') return 'transparent';
    if (variant === 'solid') return selected ? 'var(--color-primary-default)' : 'var(--color-accent-default)';
    return selected ? 'var(--color-primary-default)' : 'transparent';
  };

  const getColor = () => {
    if (disabled) return 'var(--color-text-muted)';
    if (variant === 'solid' && selected) return 'var(--color-primary-on)';
    return selected ? 'var(--color-primary-default)' : 'var(--color-text-primary)';
  };

  const getBorderColor = () => {
    if (disabled) return 'var(--color-neutral-300)';
    if (variant === 'ghost') return 'transparent';
    return selected ? 'var(--color-primary-default)' : 'var(--color-border-default)';
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 border",
        "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 animate-scaleIn",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getColor(),
        borderColor: getBorderColor(),
        borderWidth: variant === 'ghost' ? '0' : '1px',
        borderRadius: 'var(--radius-sm)',
        width: '48px', // Consistent size for icon buttons
        height: '48px',
        ringColor: selected ? 'var(--color-primary-default)' : 'var(--color-border-default)',
        ringOpacity: 0.3
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05)';
          if (variant === 'ghost' || (!selected && variant === 'default')) {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = getBackgroundColor();
        }
      }}
    >
      <Icon 
        name={icon}
        size={iconSizes[size]}
        variant={selected ? "filled" : "outline"}
        style={{ color: getColor() }}
      />
    </button>
  );
}