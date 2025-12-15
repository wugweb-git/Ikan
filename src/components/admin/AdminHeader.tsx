import React from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface AdminHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }[];
}

export function AdminHeader({ 
  title, 
  description, 
  onBack, 
  breadcrumbs,
  actions,
  stats
}: AdminHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="hover:underline"
                  style={{ 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span style={{ 
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              aria-label="Go back"
              style={{
                height: 'var(--ikan-component-button-height)',
                width: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)'
              }}
            >
              <Icon name="arrowLeft" size={20} />
            </Button>
          )}
          <div className="flex-1">
            <h1 style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: description ? 'var(--spacing-2)' : '0'
            }}>
              {title}
            </h1>
            {description && (
              <p style={{ 
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-muted)'
              }}>
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  {stat.label}
                </span>
                {stat.icon}
              </div>
              <div className="flex items-baseline gap-2">
                <span style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  {stat.value}
                </span>
                {stat.trend && (
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: stat.trend === 'up' ? 'var(--color-success-default)' : 
                           stat.trend === 'down' ? 'var(--color-danger-default)' : 
                           'var(--color-text-muted)'
                  }}>
                    {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
