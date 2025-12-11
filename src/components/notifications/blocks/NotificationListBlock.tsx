import React, { useState } from 'react';
import { ScrollArea } from '../../ui/scroll-area';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Icon } from '../../Icon';
import { NotificationItem } from '../NotificationItem';
import { useNotifications } from '../../../contexts/NotificationContext';
import { cn } from '../../ui/utils';

interface NotificationListBlockProps {
  showFilters?: boolean;
  showActions?: boolean;
  maxHeight?: string;
  className?: string;
}

export function NotificationListBlock({
  showFilters = true,
  showActions = true,
  maxHeight = '600px',
  className
}: NotificationListBlockProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll
  } = useNotifications();

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'info' | 'success' | 'error' | 'warning'>('all');
  const [isScrolled, setIsScrolled] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
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
  });

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 10);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const getFilterCount = (type: string) => {
    switch (type) {
      case 'unread':
        return notifications.filter(n => !n.read).length;
      case 'info':
      case 'success':
      case 'error':
      case 'warning':
        return notifications.filter(n => n.type === type).length;
      case 'all':
      default:
        return notifications.length;
    }
  };

  return (
    <div 
      className={cn("w-full space-y-4", className)}
      style={{
        // JSON spec constraints: { "minWidth": "{layout.constraints.component.min}", "maxWidth": "{layout.constraints.content.max}" }
        minWidth: 'var(--constraint-component-min)',
        maxWidth: 'var(--constraint-content-max)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 
            style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}
          >
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              {unreadCount} new
            </Badge>
          )}
        </div>

        {showActions && notifications.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <Icon name="checkCircle" size={14} />
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="gap-2"
            >
              <Icon name="trash" size={14} />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'info', label: 'Info' },
            { key: 'success', label: 'Success' },
            { key: 'error', label: 'Error' },
            { key: 'warning', label: 'Warning' }
          ].map(({ key, label }) => {
            const count = getFilterCount(key);
            const isActive = filterType === key;
            
            return (
              <Button
                key={key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(key as any)}
                disabled={count === 0}
                className="gap-2"
              >
                {label}
                {count > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"}
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      )}

      <Separator />

      {/* Notifications List */}
      <div className="relative">
        {/* Scroll Shadow */}
        {isScrolled && (
          <div 
            className="absolute top-0 left-0 right-0 h-4 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, var(--color-bg-page), transparent)'
            }}
          />
        )}

        <ScrollArea 
          style={{ maxHeight }}
          onScrollCapture={handleScroll}
        >
          <div 
            className="space-y-3 pr-4"
            style={{ 
              // JSON spec layout: { "type": "column", "gap": "{spacing.2}" }
              gap: 'var(--spacing-2)' 
            }}
          >
            {filteredNotifications.length > 0 ? (
              // JSON spec interactions: ["scroll", "filter", "markRead"]
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
              <EmptyState filterType={filterType} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  filterType: string;
}

function EmptyState({ filterType }: EmptyStateProps) {
  const getEmptyMessage = () => {
    switch (filterType) {
      case 'unread':
        return {
          title: "All caught up!",
          message: "You have no unread notifications.",
          icon: "checkCircle"
        };
      case 'info':
        return {
          title: "No info notifications",
          message: "You'll see informational updates here.",
          icon: "info"
        };
      case 'success':
        return {
          title: "No success notifications",
          message: "Your achievements and completions will appear here.",
          icon: "checkCircle"
        };
      case 'error':
        return {
          title: "No error notifications",
          message: "Any important issues will be shown here.",
          icon: "alertCircle"
        };
      case 'warning':
        return {
          title: "No warning notifications",
          message: "Important reminders and alerts will appear here.",
          icon: "alertTriangle"
        };
      case 'all':
      default:
        return {
          title: "No notifications yet",
          message: "You'll see your notifications here when you receive them.",
          icon: "bell"
        };
    }
  };

  const { title, message, icon } = getEmptyMessage();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon 
        name={icon as any} 
        size={48} 
        variant="outline"
        style={{ 
          color: 'var(--color-text-muted)', 
          marginBottom: 'var(--spacing-4)'
        }}
      />
      <h3 
        style={{ 
          fontSize: 'var(--text-lg)', 
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-2)'
        }}
      >
        {title}
      </h3>
      <p style={{ 
        fontSize: 'var(--text-sm)', 
        color: 'var(--color-text-muted)',
        lineHeight: 'var(--line-height-md)',
        maxWidth: '300px'
      }}>
        {message}
      </p>
    </div>
  );
}