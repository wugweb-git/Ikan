import React from 'react';
import { cn } from '../ui/utils';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  showZero?: boolean;
  className?: string;
}

export function NotificationBadge({ 
  count, 
  maxCount = 99, 
  showZero = false,
  className 
}: NotificationBadgeProps) {
  // JSON spec states: ["hidden", "counted", "overflow"]
  const getBadgeState = () => {
    if (!showZero && count === 0) return 'hidden';
    if (count > maxCount) return 'overflow';
    return 'counted';
  };

  const badgeState = getBadgeState();

  if (badgeState === 'hidden') {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center text-center leading-none",
        "transition-all duration-200",
        // JSON spec animations: ["motion.keyframes.pulse"]
        count > 0 && "animate-pulse",
        className
      )}
      style={{
        // JSON spec tokens: ["danger.default", "danger.on", "type.xs", "spacing.1"]
        backgroundColor: 'var(--color-status-danger)', // danger.default
        color: 'var(--color-text-inverse)', // danger.on
        fontSize: 'var(--text-xs)', // type.xs
        // JSON spec constraints: { "minWidth": "16px", "maxWidth": "28px" }
        minWidth: '16px',
        maxWidth: '28px',
        height: count > 9 ? '20px' : '16px',
        borderRadius: count > 9 ? '10px' : '8px',
        padding: count > 9 ? '2px var(--spacing-1)' : '1px', // spacing.1
        fontWeight: 'var(--font-weight-medium)',
        lineHeight: 1
      }}
      data-state={badgeState}
      aria-label={`${count} unread notification${count === 1 ? '' : 's'}`}
    >
      {displayCount}
    </span>
  );
}

// Notification badge that can be positioned as an overlay
interface NotificationBadgeOverlayProps extends NotificationBadgeProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: { x?: number; y?: number };
}

export function NotificationBadgeOverlay({
  children,
  count,
  maxCount = 99,
  showZero = false,
  position = 'top-right',
  offset = { x: -2, y: -2 },
  className
}: NotificationBadgeOverlayProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'top-right':
      default:
        return 'top-0 right-0';
    }
  };

  return (
    <div className="relative inline-block">
      {children}
      <div
        className={cn(
          "absolute z-10 transform",
          getPositionClasses()
        )}
        style={{
          transform: `translate(${offset.x || 0}px, ${offset.y || 0}px)`
        }}
      >
        <NotificationBadge
          count={count}
          maxCount={maxCount}
          showZero={showZero}
          className={className}
        />
      </div>
    </div>
  );
}