import React from 'react';
import { Button } from '../../components/ui/button';

interface AdminEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: { label: string; onClick: () => void } | React.ReactNode;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
}: AdminEmptyStateProps) {
  // Determine if action is a ReactNode or config object
  const isActionNode = React.isValidElement(action);
  const finalLabel = actionLabel || (!isActionNode && action && typeof action === 'object' && 'label' in action ? (action as any).label : undefined);
  const finalHandler = onAction || (!isActionNode && action && typeof action === 'object' && 'onClick' in action ? (action as any).onClick : undefined);

  // Support icon as either ReactNode or LucideIcon component
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    // If it's a component (LucideIcon), render it
    const IconComp = icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    return <IconComp className="w-8 h-8" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />;
  };

  return (
    <div 
      className="flex flex-col items-center justify-center text-center"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-12)',
        minHeight: '400px',
      }}
    >
      <div 
        className="flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-bg-muted)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        {renderIcon()}
      </div>
      
      <h3 style={{
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-2)',
      }}>
        {title}
      </h3>
      
      <p style={{
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-regular)',
        color: 'var(--color-text-muted)',
        marginBottom: finalLabel ? 'var(--spacing-6)' : '0',
        maxWidth: '400px',
      }}>
        {description}
      </p>
      
      {isActionNode && action}

      {!isActionNode && finalLabel && finalHandler && (
        <Button 
          onClick={finalHandler}
          style={{
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)',
            paddingLeft: 'var(--spacing-6)',
            paddingRight: 'var(--spacing-6)',
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
          }}
        >
          {finalLabel}
        </Button>
      )}
    </div>
  );
}