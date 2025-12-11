import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface SideNavAccountProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function SideNavAccount({ 
  currentRoute, 
  onNavigate, 
  collapsed = false,
  onToggleCollapse,
  className 
}: SideNavAccountProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const navItems = [
    { 
      label: 'Dashboard', 
      route: '/account/dashboard', 
      icon: { default: 'dashboard', active: 'dashboard' },
      description: 'Overview and quick stats'
    },
    { 
      label: 'Profile', 
      route: '/account/profile', 
      icon: { default: 'user', active: 'user' },
      description: 'Personal information'
    },
    { 
      label: 'Payments', 
      route: '/account/payments', 
      icon: { default: 'creditCard', active: 'creditCard' },
      description: 'Purchase history'
    },
    { 
      label: 'Settings', 
      route: '/account/settings', 
      icon: { default: 'settings', active: 'settings' },
      description: 'App & database sync'
    },
    { 
      label: 'Privacy', 
      route: '/account/privacy', 
      icon: { default: 'shield', active: 'shield' },
      description: 'Data and privacy controls'
    },
    { 
      label: 'Notifications', 
      route: '/account/notifications', 
      icon: { default: 'bell', active: 'bell' },
      description: 'Manage notifications'
    },
    { 
      label: 'Security', 
      route: '/account/security', 
      icon: { default: 'lock', active: 'lock' },
      description: 'Security settings'
    }
  ];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggleCollapse?.();
  };

  const sidebarState = isExpanded ? 'expanded' : 'collapsed';

  return (
    <nav 
      className={cn(
        "flex flex-col border-r transition-all duration-300 animate-slideLeft",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-default)',
        minWidth: isExpanded ? 'var(--constraint-sidebar-max)' : 'var(--constraint-sidebar-min)',
        maxWidth: 'var(--constraint-sidebar-max)',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div className="animate-fadeIn">
              <h2 
                style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Account
              </h2>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}>
                Manage your profile
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="p-2 shrink-0"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Icon 
              name={isExpanded ? "chevronLeft" : "chevronRight"} 
              size={16}
              style={{ color: 'var(--color-accent-default)' }}
            />
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left",
                  "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isActive && "animate-fadeIn"
                )}
                style={{
                  backgroundColor: isActive ? 'var(--color-bg-muted)' : 'transparent',
                  color: isActive ? 'var(--color-accent-default)' : 'var(--color-text-primary)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  minHeight: 'var(--ikan-component-button-height)', // 48px for accessibility
                  ringColor: 'var(--color-accent-default)',
                  ringOpacity: 0.3
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon 
                  name={isActive ? item.icon.active : item.icon.default}
                  size={20}
                  variant={isActive ? "filled" : "outline"}
                  style={{
                    color: isActive ? 'var(--color-accent-default)' : 'var(--color-text-muted)',
                    flexShrink: 0
                  }}
                />
                
                {isExpanded && (
                  <div className="flex-1 min-w-0 animate-fadeIn">
                    <div 
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        lineHeight: 'var(--line-height-md)',
                        color: isActive ? 'var(--color-accent-default)' : 'var(--color-text-primary)'
                      }}
                    >
                      {item.label}
                    </div>
                    <div 
                      style={{ 
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-regular)',
                        lineHeight: 'var(--line-height-md)',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-l-full animate-scaleIn"
                    style={{ backgroundColor: 'var(--color-accent-default)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        {isExpanded ? (
          <div className="text-center animate-fadeIn">
            <p style={{ 
              fontSize: 'var(--text-xs)', 
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-md)'
            }}>
              Your data is secure and private
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Icon 
              name="shield" 
              size={16} 
              style={{ color: 'var(--color-text-muted)' }}
              title="Your data is secure"
            />
          </div>
        )}
      </div>
    </nav>
  );
}