// iKan Notifications System - Complete implementation of JSON notifications specification

// Core Components
export { NotificationItem } from './NotificationItem';
export { NotificationBadge, NotificationBadgeOverlay } from './NotificationBadge';
export { BannerNotification, PWAInstallBanner, UpdateAvailableBanner, OfflineModeBanner } from './BannerNotification';
export { NotificationCenter, NotificationCenterTrigger } from './NotificationCenter';
export { PushPermissionPrompt, usePushPermissionPrompt } from './PushPermissionPrompt';

// Blocks
export { NotificationListBlock } from './blocks/NotificationListBlock';

// Context
export { NotificationProvider, useNotifications } from '../../contexts/NotificationContext';
export type { NotificationItem as NotificationItemType } from '../../contexts/NotificationContext';

// Utility functions for working with notifications
export function getNotificationTypeIcon(type: 'info' | 'success' | 'error' | 'warning') {
  const iconMap = {
    info: { default: 'info', active: 'info' },
    success: { default: 'checkCircle', active: 'checkCircle' },
    error: { default: 'alertCircle', active: 'alertCircle' },
    warning: { default: 'alertTriangle', active: 'alertTriangle' }
  };
  
  return iconMap[type] || iconMap.info;
}

export function getNotificationTypeColor(type: 'info' | 'success' | 'error' | 'warning') {
  switch (type) {
    case 'success':
      return {
        bg: 'var(--semantic-notification-bg-success)',
        fg: 'var(--semantic-notification-fg-success)',
        icon: 'var(--color-status-success)'
      };
    case 'error':
      return {
        bg: 'var(--color-status-danger-light)',
        fg: 'var(--color-status-danger)',
        icon: 'var(--color-status-danger)'
      };
    case 'warning':
      return {
        bg: 'var(--color-status-warning-light)',
        fg: 'var(--color-status-warning)',
        icon: 'var(--color-status-warning)'
      };
    case 'info':
    default:
      return {
        bg: 'var(--semantic-notification-bg-info)',
        fg: 'var(--semantic-notification-fg-info)',
        icon: 'var(--color-accent-default)'
      };
  }
}

// Notification timeout constants from JSON spec
export const NOTIFICATION_TIMEOUTS = {
  DEFAULT: 5000, // notification.timeout.default
  STICKY: 0,     // notification.timeout.sticky
  FAST: 2000,    // For quick confirmations
  SLOW: 8000     // For important messages
} as const;

// Notification constraints from JSON spec
export const NOTIFICATION_CONSTRAINTS = {
  WIDTH: 'var(--constraint-component-max)', // notification.width
  MIN_WIDTH: 'var(--constraint-component-min)', // notification.minWidth
  MAX_VISIBLE: 50, // NotificationCenter maxVisible
  TOAST_MIN_WIDTH: '200px',
  TOAST_MAX_WIDTH: '420px',
  BANNER_MIN_WIDTH: 'var(--constraint-content-min)',
  BANNER_MAX_WIDTH: 'var(--constraint-content-max)'
} as const;

// Helper function to create notification with proper defaults
export function createNotification(
  type: 'info' | 'success' | 'error' | 'warning',
  title: string,
  message?: string,
  options?: {
    sticky?: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
    metadata?: Record<string, any>;
  }
) {
  return {
    type,
    title,
    message: message || '',
    sticky: options?.sticky || false,
    action: options?.action,
    metadata: options?.metadata
  };
}

// Quick notification creation helpers
export const NotificationHelpers = {
  success: (title: string, message?: string, options?: any) => 
    createNotification('success', title, message, options),
  
  error: (title: string, message?: string, options?: any) => 
    createNotification('error', title, message, options),
  
  warning: (title: string, message?: string, options?: any) => 
    createNotification('warning', title, message, options),
  
  info: (title: string, message?: string, options?: any) => 
    createNotification('info', title, message, options)
} as const;