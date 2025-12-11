import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface BannerNotificationProps {
  type: 'info' | 'warning' | 'error' | 'actionable';
  title: string;
  message?: string;
  dismissible?: boolean;
  ctaLabel?: string;
  onCta?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function BannerNotification({
  type,
  title,
  message,
  dismissible = true,
  ctaLabel,
  onCta,
  onDismiss,
  className
}: BannerNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // JSON spec states: ["info", "warning", "error", "actionable"]  
  const bannerState = type;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleCta = () => {
    onCta?.();
  };

  // JSON spec icons: { "default": "{icon.info.outline}", "action": "{icon.arrowRight.outline}" }
  const getTypeIcon = () => {
    switch (type) {
      case 'warning':
        return 'alertTriangle';
      case 'error':
        return 'alertCircle';
      case 'actionable':
        return 'info';
      case 'info':
      default:
        return 'info';
    }
  };

  const getBannerColors = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'var(--color-status-warning-light)',
          fg: 'var(--color-status-warning)',
          border: 'var(--color-status-warning)'
        };
      case 'error':
        return {
          bg: 'var(--color-status-danger-light)',
          fg: 'var(--color-status-danger)',
          border: 'var(--color-status-danger)'
        };
      case 'actionable':
        return {
          bg: 'var(--semantic-notification-bg-info)',
          fg: 'var(--semantic-notification-fg-info)',
          border: 'var(--color-accent-default)'
        };
      case 'info':
      default:
        return {
          bg: 'var(--semantic-notification-bg-info)', // notifications.tokens.semantic.notification.bg.info
          fg: 'var(--semantic-notification-fg-info)', // accent.on
          border: 'var(--color-accent-default)'
        };
    }
  };

  const colors = getBannerColors();
  const typeIcon = getTypeIcon();

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        // Mobile-first responsive design
        "w-full transition-all duration-300",
        // Motion with reduced motion support
        "motion-safe:animate-slide-down motion-safe:animate-fade-in motion-reduce:animate-none",
        className
      )}
      style={{
        // iKan design tokens
        backgroundColor: colors.bg,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${colors.border}`,
        // Mobile-responsive padding
        padding: 'var(--spacing-3) var(--spacing-4)',
        // Layout constraints
        minWidth: 'var(--constraint-content-min)',
        maxWidth: 'var(--constraint-content-max)',
        margin: '0 auto',
        // Shadow for elevation
        boxShadow: 'var(--shadow-sm)'
      }}
      role="banner"
      aria-live="polite"
      data-state={bannerState}
    >
      <div 
        className="flex items-start gap-3"
        style={{
          gap: 'var(--spacing-3)'
        }}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            name={typeIcon}
            size={20}
            variant="outline"
            style={{ color: colors.fg }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 
            style={{ 
              fontSize: 'var(--text-base)', // type.base from JSON spec
              fontWeight: 'var(--font-weight-medium)',
              color: colors.fg,
              lineHeight: 'var(--line-height-sm)'
            }}
          >
            {title}
          </h3>
          
          {message && (
            <p 
              style={{ 
                fontSize: 'var(--text-sm)',
                color: colors.fg,
                lineHeight: 'var(--line-height-md)',
                opacity: 0.9
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* CTA Button */}
          {ctaLabel && onCta && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCta}
              className="gap-2"
              style={{
                borderColor: colors.fg,
                color: colors.fg,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.fg;
                e.currentTarget.style.color = colors.bg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.fg;
              }}
            >
              {ctaLabel}
              <Icon 
                name="arrowRight" 
                size={14} 
                variant="outline"
              />
            </Button>
          )}

          {/* Dismiss Button */}
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
              style={{ color: colors.fg }}
              aria-label="Dismiss banner"
            >
              <Icon 
                name="x" 
                size={16} 
                variant="outline"
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pre-configured banner types for common use cases
export function PWAInstallBanner({ 
  onInstall, 
  onDismiss 
}: { 
  onInstall: () => void; 
  onDismiss: () => void; 
}) {
  return (
    <BannerNotification
      type="actionable"
      title="Install iKan App"
      message="Get the full experience with offline access and push notifications."
      ctaLabel="Install Now"
      onCta={onInstall}
      onDismiss={onDismiss}
      dismissible={true}
    />
  );
}

export function UpdateAvailableBanner({ 
  onUpdate, 
  onDismiss 
}: { 
  onUpdate: () => void; 
  onDismiss: () => void; 
}) {
  return (
    <BannerNotification
      type="info"
      title="Update Available"
      message="A new version of iKan is available with improvements and new features."
      ctaLabel="Update Now"
      onCta={onUpdate}
      onDismiss={onDismiss}
      dismissible={true}
    />
  );
}

export function OfflineModeBanner({ 
  onDismiss 
}: { 
  onDismiss?: () => void; 
}) {
  return (
    <BannerNotification
      type="warning"
      title="Offline Mode"
      message="You're currently offline. Some features may be limited."
      onDismiss={onDismiss}
      dismissible={false}
    />
  );
}