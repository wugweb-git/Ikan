import { type ReactNode } from 'react';

/**
 * EmptyState — shared empty state component for consistent messaging across the app.
 * Use this when a list/section has no data to display.
 */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        padding: '32px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: 'var(--color-text-muted)',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-primary)',
          margin: '0 0 4px',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 400,
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-text-muted)',
            margin: action ? '0 0 16px' : '0',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center justify-center"
          style={{
            margin: '0 auto',
            padding: '10px 24px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            cursor: 'pointer',
            gap: 8,
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
          }}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
