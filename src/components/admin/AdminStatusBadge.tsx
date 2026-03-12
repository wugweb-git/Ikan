import type React from 'react';
import { Badge } from '../ui/badge';

/**
 * AdminStatusBadge — Unified status badge for the entire admin ecosystem.
 * Maps semantic status variants to design-system tokens.
 * Eliminates repeated inline style objects across all modules.
 */

export type StatusVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'published'
  | 'draft'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

const STATUS_STYLES: Record<StatusVariant, { bg: string; color: string; border?: string }> = {
  success:   { bg: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  danger:    { bg: 'var(--color-status-danger-light)',  color: 'var(--color-status-danger)' },
  warning:   { bg: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' },
  info:      { bg: 'var(--color-info-light)',            color: 'var(--color-info-default)' },
  neutral:   { bg: 'var(--color-bg-muted)',              color: 'var(--color-text-muted)' },
  primary:   { bg: 'var(--color-primary-default)',       color: 'var(--color-primary-on)' },

  // Semantic aliases
  published:  { bg: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  draft:      { bg: 'var(--color-bg-muted)',              color: 'var(--color-text-muted)' },
  active:     { bg: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  inactive:   { bg: 'var(--color-bg-muted)',              color: 'var(--color-text-muted)' },
  pending:    { bg: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' },
  approved:   { bg: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  rejected:   { bg: 'var(--color-status-danger-light)',  color: 'var(--color-status-danger)' },
  completed:  { bg: 'var(--color-status-success-light)', color: 'var(--color-status-success)' },
  cancelled:  { bg: 'var(--color-status-danger-light)',  color: 'var(--color-status-danger)' },
};

interface AdminStatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AdminStatusBadge({
  status,
  label,
  dot = false,
  className = '',
  children,
}: AdminStatusBadgeProps) {
  const styles = STATUS_STYLES[status as StatusVariant] || STATUS_STYLES.neutral;
  const displayText = children || label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant="outline"
      className={className}
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        borderColor: styles.border || 'transparent',
        fontFamily: 'var(--font-family-base)',
        fontWeight: 'var(--font-weight-medium)' as any,
        fontSize: 'var(--text-xs)',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: styles.color,
            marginRight: 'var(--spacing-2)',
            flexShrink: 0,
          }}
        />
      )}
      {displayText}
    </Badge>
  );
}

/**
 * Utility: resolve a dynamic status string to a StatusVariant.
 * Handles common patterns like 'true'/'false' for published states.
 */
export function resolveStatusVariant(value: string | boolean): StatusVariant {
  if (typeof value === 'boolean') return value ? 'active' : 'inactive';
  const lower = value.toLowerCase();
  if (lower in STATUS_STYLES) return lower as StatusVariant;
  // Common mappings
  if (['live', 'enabled', 'confirmed', 'paid'].includes(lower)) return 'success';
  if (['disabled', 'archived', 'expired'].includes(lower)) return 'neutral';
  if (['failed', 'error', 'blocked', 'denied'].includes(lower)) return 'danger';
  if (['review', 'processing', 'queued', 'scheduled'].includes(lower)) return 'warning';
  if (['new', 'open', 'upcoming'].includes(lower)) return 'info';
  return 'neutral';
}