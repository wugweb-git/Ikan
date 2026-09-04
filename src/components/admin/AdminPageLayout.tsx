import type React from 'react';
import { X, Trash2, FileText, Save, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { AdminStatusBadge } from './AdminStatusBadge';
import { useIsMobile } from '../../hooks/useIsMobile';

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

interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'info' | 'default';
  };
  primaryAction?: Action;
  secondaryActions?: Action[];
  toggleActions?: ToggleAction[];
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function AdminPageLayout({
  title,
  subtitle,
  status,
  primaryAction,
  secondaryActions = [],
  toggleActions = [],
  children,
  maxWidth = 'xl'
}: AdminPageLayoutProps) {
  const isMobile = useIsMobile();

  const maxWidthClass = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto px-4 md:px-6`} style={{ paddingTop: isMobile ? 'var(--spacing-6)' : 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)' }}>
      {/* Header - Sticky */}
      <div 
        className="flex items-start justify-between mb-8 sticky z-10 pb-4 pt-2 -mt-2"
        style={{ top: isMobile ? '64px' : '72px', backgroundColor: 'var(--color-bg-page)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1
              style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1.2'
              }}
              className="truncate"
            >
              {title}
            </h1>
            {status && (
              <AdminStatusBadge 
                status={status.variant === 'success' ? 'success' : status.variant === 'warning' ? 'warning' : status.variant === 'info' ? 'info' : 'neutral'}
                label={status.label}
              />
            )}
          </div>
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--spacing-1)'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isMobile && (primaryAction || secondaryActions.length > 0 || toggleActions.length > 0) && (
          <div className="flex items-center gap-3 ml-4">
            {/* Toggle Actions (e.g. Featured) */}
            {toggleActions.length > 0 && toggleActions.map((toggle, idx) => (
              <button
                key={`toggle-${idx}`}
                onClick={() => toggle.onChange(!toggle.checked)}
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: toggle.checked ? '#FEF3C7' : 'var(--color-bg-muted)',
                  color: toggle.checked ? '#D97706' : 'var(--color-text-muted)',
                  border: `1px solid ${toggle.checked ? '#F59E0B' : 'var(--color-border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={`${toggle.label}: ${toggle.checked ? 'ON' : 'OFF'}`}
              >
                <Star size={24} fill={toggle.checked ? '#F59E0B' : 'none'} />
              </button>
            ))}

            {/* 4 Fixed Square Icon Action Buttons */}
            
            {/* 1. Cancel Button */}
            <button
              onClick={secondaryActions[0]?.onClick}
              disabled={primaryAction?.loading}
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-muted)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border-default)',
                cursor: primaryAction?.loading ? 'not-allowed' : 'pointer',
                opacity: primaryAction?.loading ? 0.5 : 1
              }}
              title="Cancel"
            >
              <X size={24} />
            </button>

            {/* 2. Delete Button */}
            <button
              onClick={secondaryActions[1]?.onClick}
              disabled={!secondaryActions[1] || primaryAction?.loading}
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-status-danger-bg)',
                color: 'var(--color-status-danger)',
                border: '1px solid var(--color-status-danger)',
                cursor: (!secondaryActions[1] || primaryAction?.loading) ? 'not-allowed' : 'pointer',
                opacity: (!secondaryActions[1] || primaryAction?.loading) ? 0.3 : 1
              }}
              title="Delete"
            >
              <Trash2 size={24} />
            </button>

            {/* 3. Save Draft Button */}
            <button
              onClick={secondaryActions[2]?.onClick}
              disabled={primaryAction?.loading}
              className="flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent-default)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                cursor: primaryAction?.loading ? 'not-allowed' : 'pointer',
                opacity: primaryAction?.loading ? 0.5 : 1
              }}
              title="Save Draft"
            >
              <FileText size={24} />
            </button>

            {/* 4. Publish/Update Button */}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  cursor: (primaryAction.disabled || primaryAction.loading) ? 'not-allowed' : 'pointer',
                  opacity: (primaryAction.disabled || primaryAction.loading) ? 0.5 : 1
                }}
                title={primaryAction.label}
              >
                {primaryAction.loading ? (
                  <div className="animate-spin">
                    <Save size={24} />
                  </div>
                ) : (
                  <Save size={24} />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Actions */}
      {isMobile && (primaryAction || secondaryActions.length > 0) && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 flex gap-2"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderTop: '1px solid var(--color-border-default)',
            zIndex: 50
          }}
        >
          {secondaryActions.slice(0, 1).map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className="flex-1"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              {action.loading ? (
                <div
                  className="animate-spin rounded-full border-2 border-current border-t-transparent"
                  style={{ width: 'var(--spacing-4)', height: 'var(--spacing-4)' }}
                />
              ) : (
                action.icon
              )}
            </Button>
          ))}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className="flex-1"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)'
              }}
            >
              {primaryAction.loading ? (
                <div
                  className="animate-spin rounded-full border-2 border-current border-t-transparent"
                  style={{ width: 'var(--spacing-4)', height: 'var(--spacing-4)' }}
                />
              ) : (
                primaryAction.icon
              )}
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={isMobile && primaryAction ? 'pb-24' : ''}>{children}</div>
    </div>
  );
}