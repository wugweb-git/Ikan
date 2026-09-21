import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface AdminErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Standardized error state for admin panels.
 * Shows a muted grey container with error info and optional retry.
 * Use this INSTEAD of falling back to mock/demo data.
 */
export function AdminErrorState({
  title = 'Failed to load data',
  message,
  onRetry,
  compact = false,
}: AdminErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        backgroundColor: 'var(--color-bg-muted, #F0F0F0)',
        border: '1px solid var(--color-border-default, #E0E0E0)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: compact ? 'var(--spacing-6)' : 'var(--spacing-12)',
        minHeight: compact ? '120px' : '300px',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: compact ? 40 : 56,
          height: compact ? 40 : 56,
          borderRadius: 'var(--radius-pill, 50%)',
          backgroundColor: 'var(--color-status-danger-light, #FDE8E8)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        <AlertTriangle
          className={compact ? 'w-5 h-5' : 'w-7 h-7'}
          style={{ color: 'var(--color-status-danger, #DC3545)' }}
        />
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium, 500)',
          color: 'var(--color-text-primary, #151515)',
          marginBottom: 'var(--spacing-1)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: compact ? 'var(--text-xs)' : 'var(--text-sm)',
          fontWeight: 'var(--font-weight-regular, 400)',
          color: 'var(--color-text-muted, #717182)',
          marginBottom: onRetry ? 'var(--spacing-4)' : '0',
          maxWidth: '400px',
          lineHeight: 'var(--line-height-md, 1.5)',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2"
          style={{
            borderRadius: 'var(--radius-md, 12px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Skeleton loader for admin panels.
 * Use as loading state instead of mock data.
 */
export function AdminSkeleton({ rows = 5, compact = false }: { rows?: number; compact?: boolean }) {
  return (
    <div
      className="space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-muted, #F0F0F0)',
        border: '1px solid var(--color-border-default, #E0E0E0)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: compact ? 'var(--spacing-4)' : 'var(--spacing-6)',
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="rounded-lg"
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'var(--color-border-default, #E0E0E0)',
          }}
        />
        <div className="flex-1 space-y-2">
          <div
            className="rounded"
            style={{
              height: 14,
              width: '40%',
              backgroundColor: 'var(--color-border-default, #E0E0E0)',
            }}
          />
          <div
            className="rounded"
            style={{
              height: 10,
              width: '25%',
              backgroundColor: 'var(--color-border-default, #E0E0E0)',
            }}
          />
        </div>
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="rounded"
            style={{
              height: compact ? 32 : 44,
              flex: 1,
              backgroundColor: 'var(--color-border-default, #E0E0E0)',
              opacity: 1 - i * 0.12,
            }}
          />
        </div>
      ))}
    </div>
  );
}