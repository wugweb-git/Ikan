import React from 'react';
import { cn } from '../ui/utils';

interface ConstraintProps {
  minWidth?: string;
  maxWidth?: string;
  children: React.ReactNode;
  className?: string;
}

export function ConstraintContainer({ minWidth, maxWidth, children, className }: ConstraintProps) {
  const style = {
    minWidth: minWidth?.replace(/\{([^}]+)\}/g, (_, path) => `var(--${path.replace(/\./g, '-')})`),
    maxWidth: maxWidth?.replace(/\{([^}]+)\}/g, (_, path) => `var(--${path.replace(/\./g, '-')})`)
  };

  return (
    <div className={cn("w-full mx-auto", className)} style={style}>
      {children}
    </div>
  );
}

interface LayoutProps {
  type: 'row' | 'column' | 'grid';
  gap?: string;
  align?: 'start' | 'center' | 'end';
  columns?: number;
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  children: React.ReactNode;
  className?: string;
}

export function BlockLayout({ 
  type, 
  gap = '{spacing.4}', 
  align, 
  columns, 
  responsive,
  children, 
  className 
}: LayoutProps) {
  // Convert design token references to CSS variables
  const gapValue = gap.replace(/\{([^}]+)\}/g, (_, path) => `var(--${path.replace(/\./g, '-')})`);
  
  const getLayoutClasses = () => {
    const baseClasses = [];
    
    if (type === 'row') {
      baseClasses.push('flex flex-row');
      if (align === 'center') baseClasses.push('items-center justify-center');
      else if (align === 'end') baseClasses.push('items-end justify-end');
      else baseClasses.push('items-start');
    } else if (type === 'column') {
      baseClasses.push('flex flex-col');
      if (align === 'center') baseClasses.push('items-center');
      else if (align === 'end') baseClasses.push('items-end');
    } else if (type === 'grid') {
      baseClasses.push('grid');
      
      if (responsive) {
        if (responsive.xs) baseClasses.push(`grid-cols-${responsive.xs}`);
        if (responsive.sm) baseClasses.push(`sm:grid-cols-${responsive.sm}`);
        if (responsive.md) baseClasses.push(`md:grid-cols-${responsive.md}`);
        if (responsive.lg) baseClasses.push(`lg:grid-cols-${responsive.lg}`);
        if (responsive.xl) baseClasses.push(`xl:grid-cols-${responsive.xl}`);
      } else if (columns) {
        baseClasses.push(`grid-cols-${Math.min(columns, 12)}`);
      }
    }
    
    return baseClasses.join(' ');
  };

  const style = {
    gap: gapValue
  };

  return (
    <div 
      className={cn(getLayoutClasses(), className)} 
      style={style}
    >
      {children}
    </div>
  );
}

interface GridLayoutProps {
  columns?: number;
  gap?: string;
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  children: React.ReactNode;
  className?: string;
}

export function GridLayout({ 
  columns = 3, 
  gap = '{spacing.3}', 
  responsive,
  children, 
  className 
}: GridLayoutProps) {
  return (
    <BlockLayout
      type="grid"
      gap={gap}
      columns={columns}
      responsive={responsive}
      className={className}
    >
      {children}
    </BlockLayout>
  );
}

export default { ConstraintContainer, BlockLayout, GridLayout };