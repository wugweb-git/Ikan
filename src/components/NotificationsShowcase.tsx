import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

// Notification Components
import { 
  NotificationProvider, 
  useNotifications,
  NotificationItem,
  NotificationBadge,
  NotificationBadgeOverlay,
  BannerNotification,
  PWAInstallBanner,
  UpdateAvailableBanner,
  OfflineModeBanner,
  NotificationCenter,
  NotificationCenterTrigger,
  PushPermissionPrompt,
  NotificationListBlock,
  NOTIFICATION_TIMEOUTS,
  NotificationHelpers
} from './notifications';

import { cn } from './ui/utils';
import { Icon } from './Icon';

// Demo component to show notifications in action
function NotificationDemoContent() {
  const { showToast, addNotification, notifications, unreadCount } = useNotifications();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [promptVisible, setPromptVisible] = useState(true);

  const handleAddSampleNotifications = () => {
    // Add various types of notifications
    addNotification(NotificationHelpers.success(
      'Mood logged successfully!',
      'Your daily mood entry has been saved. Great job staying consistent!',
      {
        action: {
          label: 'View Progress',
          onClick: () => console.log('View progress')
        }
      }
    ));

    addNotification(NotificationHelpers.info(
      'New resource available',
      'Check out "Managing Anxiety in Daily Life" - a new article just for you.',
      {
        metadata: { resourceId: 'res-123' }
      }
    ));

    addNotification(NotificationHelpers.warning(
      'Assessment reminder',
      'Your weekly mental health check-in is overdue. Take a moment to reflect.',
      {
        action: {
          label: 'Take Assessment',
          onClick: () => console.log('Take assessment')
        }
      }
    ));

    addNotification(NotificationHelpers.error(
      'Sync failed',
      'Unable to sync your data. Check your internet connection.',
      {
        action: {
          label: 'Retry',
          onClick: () => console.log('Retry sync')
        }
      }
    ));
  };

  const handleShowToasts = () => {
    showToast('success', 'Welcome back!', 'Your mental health journey continues.', {
      timeout: NOTIFICATION_TIMEOUTS.DEFAULT
    });
    
    setTimeout(() => {
      showToast('info', 'Daily reminder', 'Time for your evening reflection.', {
        timeout: NOTIFICATION_TIMEOUTS.SLOW
      });
    }, 1000);

    setTimeout(() => {
      showToast('error', 'Connection issue', 'Please check your internet connection.', {
        timeout: NOTIFICATION_TIMEOUTS.STICKY,
        action: {
          label: 'Retry',
          onClick: () => console.log('Retry connection')
        }
      });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddSampleNotifications} className="gap-2">
              <Icon name="plus" size={16} />
              Add Sample Notifications
            </Button>
            <Button onClick={handleShowToasts} variant="outline" className="gap-2">
              <Icon name="messageCircle" size={16} />
              Show Toast Examples
            </Button>
            <NotificationCenterTrigger 
              variant="outline"
              showLabel={true}
            />
          </div>
          
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>Total notifications: {notifications.length}</span>
            <span>Unread: {unreadCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notification Components Showcase */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* NotificationItem Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Items</CardTitle>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Individual notification components with different types and states.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationItem
              id="demo-1"
              type="success"
              title="Mood logged successfully!"
              message="Your daily mood entry has been saved."
              timestamp={new Date()}
              read={false}
              action={{
                label: 'View Progress',
                onClick: () => console.log('View progress')
              }}
              onRead={(id) => console.log('Read:', id)}
              onDismiss={(id) => console.log('Dismiss:', id)}
            />
            
            <NotificationItem
              id="demo-2"
              type="warning"
              title="Assessment reminder"
              message="Your weekly check-in is overdue."
              timestamp={new Date(Date.now() - 2 * 60 * 60 * 1000)}
              read={false}
              onRead={(id) => console.log('Read:', id)}
              onDismiss={(id) => console.log('Dismiss:', id)}
            />
            
            <NotificationItem
              id="demo-3"
              type="info"
              title="New resource available"
              message="Check out our latest article on mindfulness."
              timestamp={new Date(Date.now() - 24 * 60 * 60 * 1000)}
              read={true}
              onRead={(id) => console.log('Read:', id)}
              onDismiss={(id) => console.log('Dismiss:', id)}
            />
          </CardContent>
        </Card>

        {/* Notification Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Badges</CardTitle>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Unread count indicators with different states.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                Standalone Badges
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--text-sm)' }}>Count 3:</span>
                  <NotificationBadge count={3} />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--text-sm)' }}>Count 25:</span>
                  <NotificationBadge count={25} />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--text-sm)' }}>Count 150:</span>
                  <NotificationBadge count={150} maxCount={99} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                Badge Overlays
              </h4>
              <div className="flex items-center gap-6">
                <NotificationBadgeOverlay count={5}>
                  <Button variant="outline" size="sm">
                    <Icon name="bell" size={16} />
                  </Button>
                </NotificationBadgeOverlay>
                
                <NotificationBadgeOverlay count={unreadCount}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <Icon name="messageCircle" size={20} />
                  </div>
                </NotificationBadgeOverlay>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banner Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Notifications</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Full-width banners for announcements and important messages.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {bannerVisible && (
            <div className="space-y-4">
              <BannerNotification
                type="actionable"
                title="Try the new Mood Insights feature"
                message="Get personalized insights based on your mood patterns and journal entries."
                ctaLabel="Learn More"
                onCta={() => console.log('Learn More clicked')}
                onDismiss={() => setBannerVisible(false)}
              />
              
              <OfflineModeBanner 
                onDismiss={() => console.log('Offline banner dismissed')}
              />
            </div>
          )}
          
          {!bannerVisible && (
            <Button 
              onClick={() => setBannerVisible(true)}
              variant="outline"
              className="gap-2"
            >
              <Icon name="refresh" size={16} />
              Show Banners Again
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Push Permission Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Push Permission Prompt</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            PWA notification permission request with proper UX.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {promptVisible && (
            <PushPermissionPrompt
              onGrant={() => {
                console.log('Permission granted');
                setPromptVisible(false);
              }}
              onDeny={() => {
                console.log('Permission denied');
                setPromptVisible(false);
              }}
              onDismiss={() => {
                console.log('Permission prompt dismissed');
                setPromptVisible(false);
              }}
            />
          )}
          
          {!promptVisible && (
            <Button 
              onClick={() => setPromptVisible(true)}
              variant="outline"
              className="gap-2"
            >
              <Icon name="bell" size={16} />
              Show Permission Prompt
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification List Block */}
      <Card>
        <CardHeader>
          <CardTitle>Notification List Block</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Complete notification management interface with filtering and actions.
          </p>
        </CardHeader>
        <CardContent>
          <NotificationListBlock 
            showFilters={true}
            showActions={true}
            maxHeight="400px"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function NotificationsShowcase() {
  return (
    <div className="min-h-screen p-4 space-y-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-8">
          <h1 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            iKan Notifications Showcase
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            Complete notification system implementation with semantic tokens, components, blocks, and JSON compliance.
          </p>
          <Badge variant="secondary" className="w-fit">
            Notifications JSON Implementation
          </Badge>
        </div>

        <NotificationProvider>
          <NotificationDemoContent />
          
          {/* Implementation Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Notifications JSON Implementation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                    Semantic Tokens
                  </h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                    <li>• notification.bg.info/success/error/warning</li>
                    <li>• notification.fg with proper contrast</li>
                    <li>• Timeout constants (5000ms default)</li>
                    <li>• Width and constraint tokens</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                    Component States
                  </h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                    <li>• default, hover, focused, read, unread</li>
                    <li>• dismissed, info, success, error, warning</li>
                    <li>• open, closed, granted, denied</li>
                    <li>• hidden, counted, overflow (badges)</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                    Interactions & Animations
                  </h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                    <li>• click, hover, dismiss, open actions</li>
                    <li>• autoDismiss, hoverPause for toasts</li>
                    <li>• fadeIn, slideLeft, slideDown, pulse</li>
                    <li>• Proper timing and easing curves</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Complete Feature Set
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <div>
                    <p><strong>Components:</strong> NotificationItem, Badge, Banner, Center, Push Permission</p>
                    <p><strong>Blocks:</strong> NotificationListBlock, CenterBlock, ToastStackBlock</p>
                  </div>
                  <div>
                    <p><strong>Context:</strong> Full notification state management with React Context</p>
                    <p><strong>Integration:</strong> Sonner toast library, PWA permissions, offline support</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  All notification components implement the JSON specifications exactly with proper semantic tokens, 
                  component states, icon variants, interactions, constraints, and animations. The system includes 
                  accessibility features, PWA integration, and mental health-focused UX patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </NotificationProvider>
      </div>
    </div>
  );
}