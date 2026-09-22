import type React from 'react';
import { X, Trash2, FileText, Save, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { AdminStatusBadge } from '../ui/kit/AdminStatusBadge';
import { AdminErrorState, AdminSkeleton } from '../ui/kit/AdminErrorState';
import { AdminLoading } from '../ui/kit/AdminLoading';
import { useIsMobile } from '../ui/hooks/useIsMobile';
import { AdminHeader, type AdminHeaderProps } from './AdminHeader';

/**
 * The one page frame for admin screens.
 *
 * - **List screens** pass `description` / `actions` / `stats`: an AdminHeader
 *   above the content.
 * - **Edit screens** pass `primaryAction` and/or `onCancel`: a sticky header
 *   with the four square actions (Cancel · Delete · Save Draft · Save).
 *   Prefer `ui/kit/EntityEditPage`, which wires this to unsaved-changes,
 *   validation and keyboard shortcuts.
 *
 * Both get the same loading / error handling: pass `loading` or `error`
 * (+ `onRetry`) and the frame renders the state instead of `children`.
 */

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

interface ToggleAction {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';

interface AdminPageLayoutProps {
  title: string;
  /** Line under the title (edit header). */
  subtitle?: string;
  /** Line under the title (list header). Falls back to `subtitle`. */
  description?: string;
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'info' | 'default';
  };

  // ── List header ──
  actions?: React.ReactNode;
  stats?: AdminHeaderProps['stats'];
  breadcrumbs?: AdminHeaderProps['breadcrumbs'];

  // ── Edit header (any of these switches to the sticky edit header) ──
  primaryAction?: Action;
  onCancel?: () => void;
  /** Omit and the Delete square renders disabled. */
  onDelete?: () => void;
  /** Omit and the Save Draft square is not shown. */
  onSaveDraft?: () => void;
  toggleActions?: ToggleAction[];

  // ── States ──
  loading?: boolean;
  /** Custom loading body (default: skeleton for lists, spinner for edit pages). */
  loadingFallback?: React.ReactNode;
  loadingMessage?: string;
  error?: string | null;
  errorTitle?: string;
  onRetry?: () => void;

  children?: React.ReactNode;
  /** Default: 'xl' for edit pages, '2xl' for lists. 'none' = no max width. */
  maxWidth?: MaxWidth;
  className?: string;
}

const MAX_WIDTH: Record<MaxWidth, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
  none: '',
};

const SQUARE = 'flex items-center justify-center w-14 h-14 rounded-[var(--radius-md)] transition-all disabled:cursor-not-allowed cursor-pointer';

export function AdminPageLayout({
  title,
  subtitle,
  description,
  status,
  actions,
  stats,
  breadcrumbs,
  primaryAction,
  onCancel,
  onDelete,
  onSaveDraft,
  toggleActions = [],
  loading = false,
  loadingFallback,
  loadingMessage,
  error,
  errorTitle,
  onRetry,
  children,
  maxWidth,
  className,
}: AdminPageLayoutProps) {
  const isMobile = useIsMobile();
  const isEdit = Boolean(primaryAction || onCancel);
  const width = MAX_WIDTH[maxWidth ?? (isEdit ? 'xl' : '2xl')];

  const body = loading
    ? (loadingFallback ?? (isEdit
        ? <div className="flex items-center justify-center py-12"><AdminLoading message={loadingMessage} /></div>
        : <AdminSkeleton rows={8} />))
    : error
      ? <AdminErrorState title={errorTitle} message={error} onRetry={onRetry} />
      : children;

  if (!isEdit) {
    return (
      <div className={cn(width, width && 'mx-auto', 'space-y-6', className)}>
        <AdminHeader
          title={title}
          description={description ?? subtitle}
          actions={actions}
          stats={loading || error ? undefined : stats}
          breadcrumbs={breadcrumbs}
        />
        {body}
      </div>
    );
  }

  const busy = Boolean(primaryAction?.loading);

  return (
    <div className={cn(width, width && 'mx-auto', 'px-4 md:px-6 pb-8', isMobile ? 'pt-6' : 'pt-8', className)}>
      {/* Header - Sticky */}
      <div className={cn('flex items-start justify-between mb-8 sticky z-10 pb-4 pt-2 -mt-2 bg-[var(--color-bg-page)]', isMobile ? 'top-16' : 'top-[72px]')}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className={cn('truncate font-medium text-[var(--color-text-primary)] leading-[1.2]', isMobile ? 'text-xl' : 'text-3xl')}>
              {title}
            </h1>
            {status && (
              <AdminStatusBadge
                status={status.variant === 'default' ? 'neutral' : status.variant}
                label={status.label}
              />
            )}
          </div>
          {(subtitle ?? description) && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{subtitle ?? description}</p>
          )}
        </div>

        {/* Actions */}
        {!isMobile && (
          <div className="flex items-center gap-3 ml-4">
            {/* Toggle Actions (e.g. Featured) */}
            {toggleActions.map((toggle) => (
              <button
                key={toggle.label}
                onClick={() => toggle.onChange(!toggle.checked)}
                className={cn(SQUARE, 'border duration-200')}
                style={{
                  backgroundColor: toggle.checked ? '#FEF3C7' : 'var(--color-bg-muted)',
                  color: toggle.checked ? '#D97706' : 'var(--color-text-muted)',
                  borderColor: toggle.checked ? '#F59E0B' : 'var(--color-border-default)',
                }}
                title={`${toggle.label}: ${toggle.checked ? 'ON' : 'OFF'}`}
                aria-label={`${toggle.label}: ${toggle.checked ? 'ON' : 'OFF'}`}
                aria-pressed={toggle.checked}
              >
                <Star size={24} fill={toggle.checked ? '#F59E0B' : 'none'} />
              </button>
            ))}

            {/* 1. Cancel */}
            <button
              onClick={onCancel}
              disabled={busy || !onCancel}
              className={cn(SQUARE, 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-default)] disabled:opacity-50')}
              title="Cancel"
              aria-label="Cancel"
            >
              <X size={24} />
            </button>

            {/* 2. Delete */}
            <button
              onClick={onDelete}
              disabled={!onDelete || busy}
              className={cn(SQUARE, 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border border-[var(--color-status-danger)] disabled:opacity-30')}
              title="Delete"
              aria-label="Delete"
            >
              <Trash2 size={24} />
            </button>

            {/* 3. Save Draft */}
            {onSaveDraft && (
              <button
                onClick={onSaveDraft}
                disabled={busy}
                className={cn(SQUARE, 'bg-[var(--color-accent-default)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] disabled:opacity-50')}
                title="Save Draft"
                aria-label="Save Draft"
              >
                <FileText size={24} />
              </button>
            )}

            {/* 4. Publish/Update */}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
                className={cn(SQUARE, 'bg-[var(--color-primary-default)] text-[var(--color-text-inverse)] border-none disabled:opacity-50')}
                title={primaryAction.label}
                aria-label={primaryAction.label}
              >
                <span className={primaryAction.loading ? 'animate-spin' : undefined}>
                  <Save size={24} />
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Actions */}
      {isMobile && (primaryAction || onCancel) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex gap-2 z-50 bg-[var(--color-bg-card)] border-t border-[var(--color-border-default)]">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={busy}
              aria-label="Cancel"
              className="flex-1 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className="flex-1 h-[var(--ikan-component-button-height)] rounded-[var(--ikan-component-border-radius)] font-medium bg-[var(--color-primary-default)] text-[var(--color-primary-on)]"
            >
              {primaryAction.loading ? (
                <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
              ) : (
                primaryAction.icon
              )}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={isMobile && primaryAction ? 'pb-24' : ''}>{body}</div>
    </div>
  );
}
