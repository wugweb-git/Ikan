import React from 'react';
import { cn } from '../ui/utils';

// Mobile-responsive utility classes and components for iKan design system

/**
 * Container component that handles mobile-first responsive layout
 * with iKan design tokens and proper safe area support
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: keyof JSX.IntrinsicElements;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  as: Component = 'div'
}: ResponsiveContainerProps) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm': return 'var(--constraint-component-max)';
      case 'md': return 'var(--constraint-card-max)';
      case 'lg': return 'var(--constraint-content-max)';
      case 'xl': return 'var(--breakpoint-xl)';
      case 'full': return '100%';
      default: return 'var(--constraint-content-max)';
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return 'var(--spacing-2) var(--spacing-3)';
      case 'md': return 'var(--spacing-4) var(--spacing-4)';
      case 'lg': return 'var(--spacing-6) var(--spacing-6)';
      default: return 'var(--spacing-4) var(--spacing-4)';
    }
  };

  return (
    <Component
      className={cn('w-full mx-auto', className)}
      style={{
        maxWidth: getMaxWidth(),
        padding: getPadding()
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Mobile-optimized touch target button wrapper
 */
interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function TouchTarget({
  children,
  className,
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
  ...props
}: TouchTargetProps) {
  return (
    <button
      className={cn(
        // Mobile-first touch target
        'touch-manipulation transition-all duration-200',
        // Focus states
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Active states
        'active:scale-95',
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        // Minimum touch target size
        minHeight: '44px',
        minWidth: '44px',
        borderRadius: 'var(--radius-md)',
        // Focus ring
        ringColor: 'var(--color-primary-default)',
        ringOpacity: 0.3
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Responsive grid that adapts to mobile/desktop layouts
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile: 1 | 2 | 3;
    tablet?: 2 | 3 | 4;
    desktop?: 3 | 4 | 5 | 6;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const getGapValue = () => {
    switch (gap) {
      case 'sm': return 'var(--spacing-2)';
      case 'md': return 'var(--spacing-4)';
      case 'lg': return 'var(--spacing-6)';
      default: return 'var(--spacing-4)';
    }
  };

  const getGridCols = () => {
    const mobileClass = `grid-cols-${cols.mobile}`;
    const tabletClass = cols.tablet ? `md:grid-cols-${cols.tablet}` : '';
    const desktopClass = cols.desktop ? `lg:grid-cols-${cols.desktop}` : '';
    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  return (
    <div
      className={cn(
        'grid w-full',
        getGridCols(),
        className
      )}
      style={{
        gap: getGapValue()
      }}
    >
      {children}
    </div>
  );
}

/**
 * Safe area wrapper for mobile screens
 */
interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeAreaWrapper({
  children,
  className,
  edges = ['top', 'bottom']
}: SafeAreaWrapperProps) {
  const getSafeAreaStyle = () => {
    const style: React.CSSProperties = {};
    
    if (edges.includes('top')) {
      style.paddingTop = 'env(safe-area-inset-top, 0px)';
    }
    if (edges.includes('bottom')) {
      style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    }
    if (edges.includes('left')) {
      style.paddingLeft = 'env(safe-area-inset-left, 0px)';
    }
    if (edges.includes('right')) {
      style.paddingRight = 'env(safe-area-inset-right, 0px)';
    }
    
    return style;
  };

  return (
    <div
      className={className}
      style={getSafeAreaStyle()}
    >
      {children}
    </div>
  );
}

/**
 * Utility classes for common responsive patterns
 */
export const responsiveClasses = {
  // Hide/show elements based on screen size
  mobileOnly: 'block md:hidden',
  tabletUp: 'hidden md:block',
  desktopOnly: 'hidden lg:block',
  
  // Text sizing that scales appropriately
  responsiveText: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl'
  },
  
  // Spacing that adapts to screen size
  responsiveSpacing: {
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  },
  
  // Padding that adapts to screen size
  responsivePadding: {
    sm: 'p-2 sm:p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
};

/**
 * Hook to get responsive values based on screen size
 */
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T {
  // For SSR compatibility, always return mobile value
  // In a real implementation, you'd use a media query hook
  return values.mobile;
}

export default {
  ResponsiveContainer,
  TouchTarget,
  ResponsiveGrid,
  SafeAreaWrapper,
  responsiveClasses,
  useResponsiveValue
};