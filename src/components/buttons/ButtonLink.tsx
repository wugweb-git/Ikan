import React from 'react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface ButtonLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  trailingIcon?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ButtonLink({ 
  children,
  href,
  external = false,
  trailingIcon = "arrowRight", // Default trailing icon
  size = 'md',
  disabled,
  className,
  onClick,
  ...props 
}: ButtonLinkProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (href) {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
    
    onClick?.(e);
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      {...(href ? { href, target: external ? '_blank' : undefined, rel: external ? 'noopener noreferrer' : undefined } : props)}
      {...(!href ? { onClick: handleClick, disabled } : {})}
      className={cn(
        "inline-flex items-center gap-1 font-medium transition-all duration-200 cursor-pointer",
        "hover:opacity-80 active:opacity-60 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-sm",
        "underline decoration-1 underline-offset-2 hover:decoration-2",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: 'transparent',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-primary-default)',
        textDecorationColor: 'currentColor',
        maxWidth: 'var(--constraint-component-max)',
        fontSize: size === 'sm' ? 'var(--text-sm)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        ringColor: 'var(--color-primary-default)',
        ringOpacity: 0.3
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.textDecorationThickness = '2px';
          e.currentTarget.style.transform = 'translateX(2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.textDecorationThickness = '1px';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      <span>{children}</span>
      
      {trailingIcon && (
        <Icon 
          name={trailingIcon}
          size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
          variant="outline"
          className="transition-transform duration-200"
          style={{
            transform: 'translateX(0)',
            transition: 'transform 0.2s ease'
          }}
        />
      )}
    </Component>
  );
}