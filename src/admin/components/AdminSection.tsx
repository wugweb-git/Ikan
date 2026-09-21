import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdminSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminSection({
  title,
  description,
  icon,
  children,
  collapsible = false,
  defaultCollapsed = false,
  badge,
  actions
}: AdminSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <Card
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-6)'
      }}
    >
      <CardContent className="p-6">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div
                  className="flex-shrink-0 mt-1"
                  style={{ color: 'var(--color-primary-default)' }}
                >
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {title}
                  </h2>
                  {badge}
                </div>
                {description && (
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      marginTop: 'var(--spacing-1)'
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {actions}
              {collapsible && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  style={{
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  className="hover:bg-[var(--color-bg-muted)]"
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section Content */}
        {!isCollapsed && <div>{children}</div>}
      </CardContent>
    </Card>
  );
}