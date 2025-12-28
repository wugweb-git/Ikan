import React from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
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
}

export function AdminHeader({ 
  title, 
  description, 
  actions,
  stats
}: AdminHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
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