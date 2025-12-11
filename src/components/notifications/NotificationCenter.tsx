import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Icon } from '../Icon';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

interface NotificationCenterProps {
  placement?: 'right' | 'left';
  maxVisible?: number;
  trigger?: React.ReactNode;
  className?: string;
}

export function NotificationCenter({ 
  placement = 'right',
  maxVisible = 50,
  trigger,
  className 
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    isNotificationCenterOpen,
    openNotificationCenter,
    closeNotificationCenter,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll
  } = useNotifications();

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'info' | 'success' | 'error' | 'warning'>('all');

  // JSON spec states: ["closed", "open"]
  const centerState = isNotificationCenterOpen ? 'open' : 'closed';

  const filteredNotifications = notifications
    .filter(notification => {
      switch (filterType) {
        case 'unread':
          return !notification.read;
        case 'info':
        case 'success':
        case 'error':
        case 'warning':
          return notification.type === filterType;
        case 'all':
        default:
          return true;
      }
    })
    .slice(0, maxVisible); // JSON spec props: { "maxVisible": 50 }

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon 
        name="bell" 
        size={48} 
        variant="outline"
        style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}
      />
      <h3 
        style={{ 
          fontSize: 'var(--text-lg)', 
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-2)'
        }}
      >
        No notifications
      </h3>
      <p style={{ 
        fontSize: 'var(--text-sm)', 
        color: 'var(--color-text-muted)',
        lineHeight: 'var(--line-height-md)'
      }}>
        {filterType === 'unread' 
          ? "You're all caught up! No unread notifications."
          : "You'll see your notifications here when you receive them."
        }
      </p>
    </div>
  );

  return (
    <Sheet 
      open={isNotificationCenterOpen} 
      onOpenChange={(open) => open ? openNotificationCenter() : closeNotificationCenter()}
    >
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}
      
      <SheetContent 
        side={placement}
        className={cn(
          "w-full sm:max-w-md p-0",
          // JSON spec animations: ["motion.keyframes.slideLeft", "motion.keyframes.fadeIn"]
          "animate-slideLeft animate-fadeIn",
          className
        )}
        style={{
          // JSON spec tokens: ["surface.popover", "type.sm", "spacing.3", "zIndex.overlay"]
          backgroundColor: 'var(--color-bg-card)', // surface.popover
          zIndex: 'var(--z-overlay)', // zIndex.overlay
          // JSON spec constraints: { "minWidth": "320px", "maxWidth": "520px" }
          minWidth: '320px',
          maxWidth: '520px'
        }}
        data-state={centerState}
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                <Icon 
                  name="bell" 
                  size={20} 
                  variant="outline"
                  style={{ color: 'var(--color-primary-default)' }}
                />
                Notifications
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                View and manage your notifications
              </SheetDescription>
            </div>
            
            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                // Could navigate to notification settings
                console.log('Open notification settings');
              }}
              aria-label="Notification settings"
            >
              <Icon 
                name="settings" 
                size={16} 
                variant="outline"
                style={{ color: 'var(--color-text-muted)' }}
              />
            </Button>
          </div>
        </SheetHeader>

        {/* Controls */}
        <div className="px-6 pb-4 space-y-4">
          {/* Filter Tabs */}
          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
              <TabsTrigger value="success" className="text-xs">Success</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex-1 gap-2"
              >
                <Icon name="checkCircle" size={14} />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex-1 gap-2"
              >
                <Icon name="trash" size={14} />
                Clear all
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div 
            className="p-6 space-y-3"
            style={{ gap: 'var(--spacing-3)' }} // JSON spec layout gap
          >
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  timestamp={notification.timestamp}
                  read={notification.read}
                  action={notification.action}
                  onRead={handleNotificationClick}
                  onDismiss={dismissNotification}
                  onClick={handleNotificationClick}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {notifications.length > maxVisible && (
          <>
            <Separator />
            <div className="p-6 pt-4 text-center">
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}>
                Showing {Math.min(notifications.length, maxVisible)} of {notifications.length} notifications
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Notification Center Trigger Button Component
interface NotificationCenterTriggerProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function NotificationCenterTrigger({
  variant = 'ghost',
  size = 'md',
  showLabel = false,
  className
}: NotificationCenterTriggerProps) {
  const { unreadCount, toggleNotificationCenter } = useNotifications();

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      case 'md':
      default: return 20;
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleNotificationCenter}
      className={cn("relative gap-2", className)}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <div className="relative">
        <Icon 
          name="bell" 
          size={getIconSize()} 
          variant="outline"
        />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center text-xs leading-none rounded-full animate-pulse"
            style={{
              backgroundColor: 'var(--color-status-danger)',
              color: 'var(--color-text-inverse)',
              minWidth: '16px',
              height: '16px',
              padding: '2px',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      {showLabel && (
        <span className="hidden lg:inline">
          Notifications
        </span>
      )}
    </Button>
  );
}