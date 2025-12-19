import React from 'react';
import { ArrowLeft, Save, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs: Breadcrumb[];
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'info' | 'default';
  };
  primaryAction?: Action;
  secondaryActions?: Action[];
  onBack?: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function AdminPageLayout({
  title,
  subtitle,
  breadcrumbs,
  status,
  primaryAction,
  secondaryActions = [],
  onBack,
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
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-bg-page)',
        paddingTop: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)',
        paddingBottom: 'var(--spacing-8)'
      }}
    >
      <div className={`${maxWidthClass} mx-auto px-4 md:px-6`}>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6" style={{ fontSize: 'var(--text-sm)' }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span style={{ color: 'var(--color-text-muted)' }}>/</span>
              )}
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  style={{
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-weight-regular)',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  className="hover:text-[var(--color-primary-default)]"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  style={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                </button>
              )}
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
                    <Badge
                      variant={status.variant === 'success' ? 'default' : 'outline'}
                      style={{
                        backgroundColor:
                          status.variant === 'success'
                            ? 'var(--color-success-default)'
                            : status.variant === 'warning'
                            ? 'var(--color-warning-default)'
                            : status.variant === 'info'
                            ? 'var(--color-info-default)'
                            : 'var(--color-bg-muted)',
                        color: status.variant === 'default' ? 'var(--color-text-muted)' : 'white'
                      }}
                    >
                      {status.label}
                    </Badge>
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
            </div>
          </div>

          {/* Actions */}
          {!isMobile && (primaryAction || secondaryActions.length > 0) && (
            <div className="flex items-center gap-2 ml-4">
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontWeight: 'var(--font-weight-medium)',
                    gap: 'var(--spacing-2)'
                  }}
                >
                  {action.loading ? (
                    <div
                      className="animate-spin rounded-full border-2 border-current border-t-transparent"
                      style={{ width: '16px', height: '16px' }}
                    />
                  ) : (
                    action.icon
                  )}
                  {action.label}
                </Button>
              ))}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'default'}
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                  style={{
                    height: 'var(--ikan-component-button-height)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    fontWeight: 'var(--font-weight-medium)',
                    gap: 'var(--spacing-2)',
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)'
                  }}
                >
                  {primaryAction.loading ? (
                    <div
                      className="animate-spin rounded-full border-2 border-current border-t-transparent"
                      style={{ width: '16px', height: '16px' }}
                    />
                  ) : (
                    primaryAction.icon
                  )}
                  {primaryAction.label}
                </Button>
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
                    style={{ width: '16px', height: '16px' }}
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
                    style={{ width: '16px', height: '16px' }}
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
    </div>
  );
}
