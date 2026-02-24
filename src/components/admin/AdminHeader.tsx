import React from 'react';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  onBack?: () => void;
  breadcrumbs?: {
    label: string;
    onClick?: () => void;
  }[];
}

export function AdminHeader({ 
  title, 
  description, 
  actions,
  stats,
  onBack,
  breadcrumbs
}: AdminHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
              {crumb.onClick ? (
                <button 
                  onClick={crumb.onClick}
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {crumb.label}
                </button>
              ) : (
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)' }}>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {onBack && (
             <Button
               variant="ghost"
               size="sm"
               onClick={onBack}
               className="mt-1"
             >
               <ChevronRight className="w-6 h-6 rotate-180" />
             </Button>
          )}
          <div className="flex-1">
            <h1 style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-3xl)',
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
          {stats.map((stat) => (
            <div
              key={stat.label}
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