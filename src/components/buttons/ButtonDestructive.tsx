import React from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface ButtonDestructiveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ButtonDestructive({ 
  children, 
  loading = false, 
  leadingIcon = "delete", // Default destructive icon
  trailingIcon,
  size = 'md',
  fullWidth = false,
  disabled,
  className,
  onClick,
  ...props 
}: ButtonDestructiveProps) {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    // Add ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s var(--motion-easing-out);
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 overflow-hidden",
        "hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        fullWidth && "w-full",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: isDisabled ? 'var(--color-neutral-400)' : 'var(--color-status-danger)',
        color: 'var(--color-text-inverse)',
        borderRadius: 'var(--radius-sm)',
        minWidth: fullWidth ? '100%' : 'var(--constraint-component-min)',
        maxWidth: fullWidth ? '100%' : 'var(--constraint-component-max)',
        fontSize: size === 'sm' ? 'var(--text-sm)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        height: '48px', // Consistent height for all buttons
        ringColor: 'var(--color-status-danger)',
        ringOpacity: 0.3
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.backgroundColor = '#B91C1C'; // Darker red on hover
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.backgroundColor = 'var(--color-status-danger)';
        }
      }}
    >
      {loading && (
        <div 
          className="animate-spin rounded-full h-4 w-4 border-b-2"
          style={{ borderColor: 'var(--color-text-inverse)' }}
        />
      )}
      
      {leadingIcon && !loading && (
        <Icon 
          name={leadingIcon} 
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          variant="outline"
        />
      )}
      
      <span className={cn(loading && "opacity-75")}>
        {children}
      </span>
      
      {trailingIcon && !loading && (
        <Icon 
          name={trailingIcon} 
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          variant="outline"
        />
      )}
    </button>
  );
}