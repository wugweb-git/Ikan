import React from 'react';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: AdminEmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center text-center p-12 rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        minHeight: '400px'
      }}
    >
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <Icon 
          className="w-8 h-8" 
          style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} 
        />
      </div>
      
      <h3 style={{
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-2)'
      }}>
        {title}
      </h3>
      
      <p style={{
        fontFamily: 'var(--font-family-base)',
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-muted)',
        marginBottom: actionLabel ? 'var(--spacing-6)' : '0',
        maxWidth: '400px'
      }}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          style={{
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            fontWeight: 'var(--font-weight-medium)',
            paddingLeft: 'var(--spacing-6)',
            paddingRight: 'var(--spacing-6)',
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)'
          }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
