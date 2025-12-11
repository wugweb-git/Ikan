import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { formatDistanceToNow } from '../../lib/date-utils';

interface NotificationItemProps {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  dismissed?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClick?: (id: string) => void;
  onOpen?: (id: string) => void;
  className?: string;
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  timestamp,
  read,
  dismissed = false,
  action,
  onRead,
  onDismiss,
  onClick,
  onOpen,
  className
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // JSON spec states: ["default", "hover", "focused", "read", "unread", "dismissed"]
  const getNotificationState = () => {
    if (dismissed) return 'dismissed';
    if (isFocused) return 'focused';
    if (isHovered) return 'hover';
    return read ? 'read' : 'unread';
  };

  const notificationState = getNotificationState();

  // JSON spec icons with proper mapping
  const getTypeIcon = () => {
    const iconMap = {
      info: { default: 'info', active: 'info' },
      success: { default: 'checkCircle', active: 'checkCircle' },
      error: { default: 'alertCircle', active: 'alertCircle' },
      warning: { default: 'alertTriangle', active: 'alertTriangle' }
    };
    
    return iconMap[type] || iconMap.info;
  };

  const typeIcon = getTypeIcon();
  const isActive = isHovered || isFocused;

  // JSON spec semantic colors
  const getNotificationColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--semantic-notification-bg-success)', // colors.status.success
          fg: 'var(--semantic-notification-fg-success)', // colors.surface.cardForeground
          iconColor: 'var(--color-status-success)'
        };
      case 'error':
        return {
          bg: 'var(--color-status-danger-light)',
          fg: 'var(--color-status-danger)',
          iconColor: 'var(--color-status-danger)'
        };
      case 'warning':
        return {
          bg: 'var(--color-status-warning-light)',
          fg: 'var(--color-status-warning)',
          iconColor: 'var(--color-status-warning)'
        };
      case 'info':
      default:
        return {
          bg: 'var(--semantic-notification-bg-info)', // colors.accent.default
          fg: 'var(--semantic-notification-fg-info)', // accent.on
          iconColor: 'var(--color-accent-default)'
        };
    }
  };

  const colors = getNotificationColors();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!read && onRead) {
      onRead(id);
    }
    onClick?.(id);
    onOpen?.(id);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(id);
  };

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group",
        // JSON spec animations: ["motion.keyframes.fadeIn", "motion.keyframes.slideLeft"]
        "animate-fadeIn",
        !read && "shadow-sm",
        className
      )}
      style={{
        // JSON spec tokens: ["notifications.tokens.semantic.notification.bg.info", "type.sm", "spacing.2", "borders.radius.md"]
        backgroundColor: !read ? colors.bg : 'var(--color-bg-card)',
        borderRadius: 'var(--radius-md)', // borders.radius.md
        minWidth: 'var(--constraint-component-min)', // notifications.tokens.notification.minWidth
        maxWidth: 'var(--constraint-component-max)', // notifications.tokens.notification.width
        border: `1px solid ${!read ? 'transparent' : 'var(--color-border-light)'}`,
        opacity: dismissed ? 0.6 : 1
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="button"
      aria-label={`${type} notification: ${title}`}
      data-state={notificationState}
    >
      {/* Type Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon
          name={isActive ? typeIcon.active : typeIcon.default}
          size={16}
          variant={isActive ? "filled" : "outline"}
          style={{ color: colors.iconColor }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 
            style={{ 
              fontSize: 'var(--text-sm)', // type.sm from JSON spec
              fontWeight: !read ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
              color: !read ? colors.fg : 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-sm)'
            }}
          >
            {title}
          </h4>
          
          {/* Unread indicator */}
          {!read && (
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 animate-pulse"
              style={{ backgroundColor: colors.iconColor }}
              aria-label="Unread notification"
            />
          )}
        </div>

        {message && (
          <p 
            style={{ 
              fontSize: 'var(--text-xs)',
              color: !read ? colors.fg : 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-md)',
              opacity: !read ? 0.9 : 0.8
            }}
          >
            {message}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span 
            style={{ 
              fontSize: 'var(--text-xs)',
              color: !read ? colors.fg : 'var(--color-text-muted)',
              opacity: 0.7
            }}
          >
            {formatTimestamp(timestamp)}
          </span>

          {/* Action Button */}
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                color: colors.iconColor,
                fontSize: 'var(--text-xs)'
              }}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* More actions button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            // Could open a context menu with more options
          }}
          aria-label="More actions"
        >
          <Icon 
            name="more" 
            size={12} 
            variant="outline"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </Button>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <Icon 
            name="x" 
            size={12} 
            variant="outline"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </Button>
      </div>
    </div>
  );
}