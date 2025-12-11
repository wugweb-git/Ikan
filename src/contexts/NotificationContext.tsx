import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  sticky?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isNotificationCenterOpen: boolean;
  
  // Actions
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read' | 'dismissed'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  
  // Toast notifications
  showToast: (type: 'info' | 'success' | 'error' | 'warning', title: string, message?: string, options?: ToastOptions) => void;
  
  // Notification center
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  toggleNotificationCenter: () => void;
  
  // Push notifications
  requestPushPermission: () => Promise<boolean>;
  pushPermissionState: 'default' | 'granted' | 'denied';
}

interface ToastOptions {
  timeout?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 50 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [pushPermissionState, setPushPermissionState] = useState<'default' | 'granted' | 'denied'>('default');

  // Initialize push permission state
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermissionState(Notification.permission);
    }
  }, []);

  const generateId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addNotification = useCallback((
    notificationData: Omit<NotificationItem, 'id' | 'timestamp' | 'read' | 'dismissed'>
  ): string => {
    const id = generateId();
    const newNotification: NotificationItem = {
      ...notificationData,
      id,
      timestamp: new Date(),
      read: false,
      dismissed: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the most recent notifications
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, dismissed: true } : n
    ));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToast = useCallback((
    type: 'info' | 'success' | 'error' | 'warning',
    title: string,
    message?: string,
    options: ToastOptions = {}
  ) => {
    const {
      timeout = 5000, // JSON spec: notification.timeout.default: 5000
      dismissible = true,
      action
    } = options;

    // Add to notification history
    const notificationId = addNotification({
      type,
      title,
      message: message || '',
      sticky: timeout === 0
    });

    // Show toast using sonner
    const toastContent = (
      <div className="space-y-1">
        <div style={{ 
          fontSize: 'var(--text-sm)', 
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}>
          {title}
        </div>
        {message && (
          <div style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-md)'
          }}>
            {message}
          </div>
        )}
      </div>
    );

    const toastOptions: any = {
      duration: timeout || undefined,
      dismissible,
      ...(action && {
        action: {
          label: action.label,
          onClick: action.onClick
        }
      })
    };

    switch (type) {
      case 'success':
        toast.success(toastContent, toastOptions);
        break;
      case 'error':
        toast.error(toastContent, toastOptions);
        break;
      case 'warning':
        toast.warning(toastContent, toastOptions);
        break;
      case 'info':
      default:
        toast.info(toastContent, toastOptions);
        break;
    }

    return notificationId;
  }, [addNotification]);

  const openNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(true);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(false);
  }, []);

  const toggleNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(prev => !prev);
  }, []);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermissionState(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  const contextValue: NotificationContextType = {
    notifications: notifications.filter(n => !n.dismissed),
    unreadCount,
    isNotificationCenterOpen,
    
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    
    showToast,
    
    openNotificationCenter,
    closeNotificationCenter,
    toggleNotificationCenter,
    
    requestPushPermission,
    pushPermissionState
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}