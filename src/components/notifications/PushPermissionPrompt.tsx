import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';

interface PushPermissionPromptProps {
  showOnce?: boolean;
  onGrant?: () => void;
  onDeny?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PushPermissionPrompt({
  showOnce = true,
  onGrant,
  onDeny,
  onDismiss,
  className
}: PushPermissionPromptProps) {
  const { requestPushPermission, pushPermissionState } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // JSON spec states: ["default", "granted", "denied"]
  const promptState = pushPermissionState;

  useEffect(() => {
    // Check if we should show the prompt
    const shouldShow = () => {
      // Don't show if permission already granted or denied
      if (pushPermissionState !== 'default') return false;
      
      // Don't show if we should only show once and it's been shown
      if (showOnce && hasBeenShown) return false;
      
      // Check if user has previously dismissed (localStorage)
      try {
        const dismissed = localStorage.getItem('ikan-push-permission-dismissed');
        if (dismissed === 'true') return false;
      } catch {
        // Ignore localStorage errors
      }
      
      return true;
    };

    if (shouldShow()) {
      // Show after a small delay to not be intrusive
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [pushPermissionState, showOnce, hasBeenShown]);

  const handleGrant = async () => {
    try {
      const granted = await requestPushPermission();
      if (granted) {
        onGrant?.();
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
    }
  };

  const handleDeny = () => {
    onDeny?.();
    setIsVisible(false);
    
    // Remember that user denied (don't show again)
    try {
      localStorage.setItem('ikan-push-permission-dismissed', 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleDismiss = () => {
    onDismiss?.();
    setIsVisible(false);
    
    // Remember dismissal
    try {
      localStorage.setItem('ikan-push-permission-dismissed', 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  // Don't render if not visible or if permission is not default
  if (!isVisible || pushPermissionState !== 'default') {
    return null;
  }

  return (
    <Card
      className={cn(
        "max-w-md mx-auto shadow-lg border-2",
        // JSON spec animations: ["motion.keyframes.fadeIn", "motion.keyframes.scaleIn"]
        "animate-fadeIn animate-scaleIn",
        className
      )}
      style={{
        // JSON spec tokens: ["notifications.tokens.semantic.notification.bg.info", "type.base", "spacing.3", "borders.radius.md"]
        backgroundColor: 'var(--semantic-notification-bg-info)', // notifications.tokens.semantic.notification.bg.info
        borderRadius: 'var(--radius-md)', // borders.radius.md
        borderColor: 'var(--color-accent-default)',
        // JSON spec constraints: { "minWidth": "300px", "maxWidth": "{layout.constraints.content.max}" }
        minWidth: '300px',
        maxWidth: 'var(--constraint-content-max)'
      }}
      data-state={promptState}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {/* JSON spec icons: { "permission": "{icon.more.outline}" } - using bell for better UX */}
            <Icon
              name="bell"
              size={24}
              variant="outline"
              style={{ color: 'var(--semantic-notification-fg-info)' }}
            />
          </div>
          <div className="flex-1">
            <CardTitle 
              style={{ 
                fontSize: 'var(--text-base)', // type.base from JSON spec
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--semantic-notification-fg-info)',
                lineHeight: 'var(--line-height-sm)'
              }}
            >
              Stay Connected with iKan
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 -mt-1"
            aria-label="Dismiss"
          >
            <Icon 
              name="x" 
              size={14} 
              variant="outline"
              style={{ color: 'var(--semantic-notification-fg-info)' }}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" style={{ padding: 'var(--spacing-3)' }}>
        <p 
          style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--semantic-notification-fg-info)',
            lineHeight: 'var(--line-height-md)',
            opacity: 0.9
          }}
        >
          Get gentle reminders for mood tracking, program updates, and supportive messages 
          to help you on your mental health journey.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon 
              name="checkCircle" 
              size={16} 
              variant="outline"
              style={{ color: 'var(--semantic-notification-fg-info)' }}
            />
            <span 
              style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--semantic-notification-fg-info)'
              }}
            >
              Daily mood check-in reminders
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon 
              name="checkCircle" 
              size={16} 
              variant="outline"
              style={{ color: 'var(--semantic-notification-fg-info)' }}
            />
            <span 
              style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--semantic-notification-fg-info)'
              }}
            >
              Program milestone celebrations
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon 
              name="checkCircle" 
              size={16} 
              variant="outline"
              style={{ color: 'var(--semantic-notification-fg-info)' }}
            />
            <span 
              style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--semantic-notification-fg-info)'
              }}
            >
              Supportive messages when you need them
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {/* JSON spec interactions: ["grant", "deny", "dismiss"] */}
          <Button
            onClick={handleGrant}
            className="flex-1 gap-2"
            style={{
              backgroundColor: 'var(--semantic-notification-fg-info)',
              color: 'var(--semantic-notification-bg-info)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            <Icon name="bell" size={16} />
            Enable Notifications
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDeny}
            className="flex-1"
            style={{
              borderColor: 'var(--semantic-notification-fg-info)',
              color: 'var(--semantic-notification-fg-info)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--semantic-notification-fg-info)';
              e.currentTarget.style.color = 'var(--semantic-notification-bg-info)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--semantic-notification-fg-info)';
            }}
          >
            Not Now
          </Button>
        </div>

        <p 
          style={{ 
            fontSize: 'var(--text-xs)',
            color: 'var(--semantic-notification-fg-info)',
            opacity: 0.7,
            textAlign: 'center',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          You can change this setting anytime in your browser or app settings.
        </p>
      </CardContent>
    </Card>
  );
}

// Hook to check if we should show the push permission prompt
export function usePushPermissionPrompt() {
  const { pushPermissionState } = useNotifications();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Only show if permission is default and user hasn't dismissed
    const checkShouldShow = () => {
      if (pushPermissionState !== 'default') return false;
      
      try {
        const dismissed = localStorage.getItem('ikan-push-permission-dismissed');
        return dismissed !== 'true';
      } catch {
        return true;
      }
    };

    setShouldShow(checkShouldShow());
  }, [pushPermissionState]);

  return {
    shouldShowPrompt: shouldShow,
    permissionState: pushPermissionState
  };
}