import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface SideNavAccountProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function SideNavAccount({ 
  currentRoute, 
  onNavigate, 
  collapsed = false,
  onToggleCollapse,
  onLogout,
  className 
}: SideNavAccountProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const navItems = [
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
      label: 'Preferences', 
      route: '/account/preferences', 
      icon: { default: 'settings', active: 'settings' },
      description: 'Your preferences'
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

  // Help & Resources section
  const resourceItems = [
    {
      label: 'FAQ',
      route: '/faq',
      icon: { default: 'messageCircle', active: 'messageCircle' },
      description: 'Common questions'
    },
    {
      label: "Let's Talk",
      route: '/contact',
      icon: { default: 'messageCircle', active: 'messageCircle' },
      description: 'Contact us'
    },
    {
      label: 'Privacy Policy',
      route: '/privacy-policy',
      icon: { default: 'fileText', active: 'fileText' },
      description: 'Our privacy terms'
    },
    {
      label: 'Terms & Conditions',
      route: '/terms',
      icon: { default: 'fileText', active: 'fileText' },
      description: 'Terms & conditions'
    },
    {
      label: 'Return Policy',
      route: '/return-policy',
      icon: { default: 'fileText', active: 'fileText' },
      description: 'Return policy'
    },
    {
      label: 'Cancellation Policy',
      route: '/cancellation-policy',
      icon: { default: 'fileText', active: 'fileText' },
      description: 'Cancellation policy'
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
                Accounts
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

      {/* Help & Resources Section */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        {/* Section Header */}
        {isExpanded && (
          <div className="px-3 py-2 mb-1">
            <h3 
              style={{ 
                fontSize: 'var(--text-xs)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Help & Support
            </h3>
          </div>
        )}
        
        <div className="space-y-1">
          {resourceItems.map((item) => {
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

      {/* Footer - Logout */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left",
              "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            )}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-status-danger)',
              borderRadius: 'var(--ikan-component-border-radius)',
              minHeight: 'var(--ikan-component-button-height)',
              ringColor: 'var(--color-status-danger)',
              ringOpacity: 0.3
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={!isExpanded ? 'Log out' : undefined}
          >
            <Icon 
              name="logOut"
              size={20}
              variant="outline"
              style={{
                color: 'var(--color-status-danger)',
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
                    color: 'var(--color-status-danger)'
                  }}
                >
                  Log out
                </div>
                <div 
                  style={{ 
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-md)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Sign out of your account
                </div>
              </div>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}