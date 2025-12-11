// iKan Notification Configuration - Implementation of JSON notification specifications

export interface NotificationTokens {
  semantic: {
    'notification.bg.info': string;
    'notification.fg.info': string;
    'notification.bg.success': string;
    'notification.fg.success': string;
    'notification.bg.error': string;
    'notification.fg.error': string;
    'notification.bg.warn': string;
    'notification.fg.warn': string;
  };
  'notification.width': string;
  'notification.minWidth': string;
  'notification.timeout.default': number;
  'notification.timeout.sticky': number;
}

export interface NotificationIcon {
  default: string;
  active?: string;
}

export interface NotificationComponent {
  description: string;
  tokens: string[];
  states: string[];
  icons?: { [key: string]: NotificationIcon | { [key: string]: NotificationIcon } };
  interactions: string[];
  constraints: {
    minWidth: string;
    maxWidth: string;
  };
  animations: string[];
  props?: { [key: string]: any };
}

export interface NotificationBlock {
  description: string;
  constraints: {
    minWidth: string;
    maxWidth: string;
  };
  layout: {
    type: string;
    gap?: string;
    direction?: string;
  };
  items: Array<{
    component: string;
  }>;
  interactions: string[];
}

// Notification configurations from the JSON specification
export const notificationTokens: NotificationTokens = {
  semantic: {
    'notification.bg.info': 'var(--color-accent-default)', // {colors.accent.default}
    'notification.fg.info': 'var(--color-accent-on)', // {accent.on}
    'notification.bg.success': 'var(--color-status-success)', // {colors.status.success}
    'notification.fg.success': 'var(--color-bg-card)', // {colors.surface.cardForeground}
    'notification.bg.error': 'var(--color-status-danger)', // {colors.status.error}
    'notification.fg.error': 'var(--color-bg-card)', // {colors.surface.cardForeground}
    'notification.bg.warn': 'var(--color-status-warning)', // {colors.status.warning}
    'notification.fg.warn': 'var(--color-bg-card)' // {colors.surface.cardForeground}
  },
  'notification.width': 'var(--constraint-component-max)', // {layout.constraints.component.max}
  'notification.minWidth': 'var(--constraint-component-min)', // {layout.constraints.component.min}
  'notification.timeout.default': 5000,
  'notification.timeout.sticky': 0
};

export const notificationComponents: { [key: string]: NotificationComponent } = {
  NotificationItem: {
    description: 'Single notification row',
    tokens: [
      'notifications.tokens.semantic.notification.bg.info',
      'type.sm',
      'spacing.2',
      'borders.radius.md'
    ],
    states: ['default', 'hover', 'focused', 'read', 'unread', 'dismissed'],
    icons: {
      type: {
        info: { default: 'info', active: 'info' },
        success: { default: 'checkCircle', active: 'checkCircle' },
        error: { default: 'alertCircle', active: 'alertCircle' },
        warning: { default: 'alertTriangle', active: 'alertTriangle' }
      },
      actions: {
        dismiss: 'x',
        more: 'more'
      }
    },
    interactions: ['click', 'hover', 'dismiss', 'open'],
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-component-max)'
    },
    animations: ['motion.keyframes.fadeIn', 'motion.keyframes.slideLeft']
  },

  ToastNotification: {
    description: 'Temporary toast (top-right / bottom-right)',
    tokens: [
      'notifications.tokens.semantic.notification.bg.info',
      'type.sm',
      'spacing.2',
      'zIndex.toast'
    ],
    states: ['info', 'success', 'error', 'warning'],
    icons: {
      info: 'info',
      success: 'checkCircle',
      error: 'alertCircle',
      warning: 'alertTriangle'
    },
    props: {
      timeout: 5000,
      placement: 'top-right',
      dismissible: true
    },
    interactions: ['autoDismiss', 'hoverPause', 'dismiss'],
    constraints: {
      minWidth: '200px',
      maxWidth: '420px'
    },
    animations: ['motion.keyframes.slideUp', 'motion.keyframes.fadeOut']
  },

  BannerNotification: {
    description: 'Full-width banner (announcements / PWA install)',
    tokens: [
      'notifications.tokens.semantic.notification.bg.info',
      'type.base',
      'spacing.3',
      'borders.radius.md'
    ],
    states: ['info', 'warning', 'error', 'actionable'],
    icons: {
      default: 'info',
      action: 'arrowRight'
    },
    props: {
      dismissible: true,
      ctaLabel: null
    },
    interactions: ['dismiss', 'cta'],
    constraints: {
      minWidth: 'var(--constraint-content-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    animations: ['motion.keyframes.slideDown', 'motion.keyframes.fadeIn']
  },

  NotificationCenter: {
    description: 'Panel / drawer listing recent notifications',
    tokens: [
      'surface.popover',
      'type.sm',
      'spacing.3',
      'zIndex.overlay'
    ],
    states: ['closed', 'open'],
    icons: {
      empty: 'bell',
      settings: 'settings'
    },
    props: {
      placement: 'right',
      maxVisible: 50
    },
    interactions: ['open', 'close', 'markAllRead', 'filterByType'],
    constraints: {
      minWidth: '320px',
      maxWidth: '520px'
    },
    animations: ['motion.keyframes.slideLeft', 'motion.keyframes.fadeIn']
  },

  NotificationBadge: {
    description: 'Unread count badge',
    tokens: [
      'danger.default',
      'danger.on',
      'type.xs',
      'spacing.1'
    ],
    states: ['hidden', 'counted', 'overflow'],
    icons: {},
    interactions: [],
    constraints: {
      minWidth: '16px',
      maxWidth: '28px'
    },
    animations: ['motion.keyframes.pulse']
  },

  PushPermissionPrompt: {
    description: 'Prompt for push permission (PWA)',
    tokens: [
      'notifications.tokens.semantic.notification.bg.info',
      'type.base',
      'spacing.3',
      'borders.radius.md'
    ],
    states: ['default', 'granted', 'denied'],
    icons: {
      permission: 'bell'
    },
    props: {
      showOnce: true
    },
    interactions: ['grant', 'deny', 'dismiss'],
    constraints: {
      minWidth: '300px',
      maxWidth: 'var(--constraint-content-max)'
    },
    animations: ['motion.keyframes.fadeIn', 'motion.keyframes.scaleIn']
  }
};

export const notificationBlocks: { [key: string]: NotificationBlock } = {
  NotificationListBlock: {
    description: 'Vertical list of notifications',
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-2)'
    },
    items: [
      { component: 'NotificationItem' }
    ],
    interactions: ['scroll', 'filter', 'markRead']
  },

  NotificationCenterBlock: {
    description: 'Drawer block with NotificationCenter component',
    constraints: {
      minWidth: '320px',
      maxWidth: '520px'
    },
    layout: {
      type: 'column',
      gap: 'var(--spacing-3)'
    },
    items: [
      { component: 'NotificationCenter' }
    ],
    interactions: ['open', 'close', 'markAllRead']
  },

  ToastStackBlock: {
    description: 'Stack for toast notifications',
    constraints: {
      minWidth: '200px',
      maxWidth: '420px'
    },
    layout: {
      type: 'stack',
      direction: 'vertical',
      gap: 'var(--spacing-2)'
    },
    items: [
      { component: 'ToastNotification' }
    ],
    interactions: ['autoDismiss']
  }
};

// Helper functions for working with notification configurations
export function getNotificationComponent(componentName: string): NotificationComponent | undefined {
  return notificationComponents[componentName];
}

export function getNotificationBlock(blockName: string): NotificationBlock | undefined {
  return notificationBlocks[blockName];
}

export function getNotificationTokenValue(tokenPath: string): string | number {
  // Resolve token paths like "notifications.tokens.semantic.notification.bg.info"
  if (tokenPath.startsWith('notifications.tokens.semantic.')) {
    const key = tokenPath.replace('notifications.tokens.semantic.', '') as keyof NotificationTokens['semantic'];
    return notificationTokens.semantic[key] || tokenPath;
  }
  
  if (tokenPath.startsWith('notifications.tokens.')) {
    const key = tokenPath.replace('notifications.tokens.', '') as keyof NotificationTokens;
    return notificationTokens[key] || tokenPath;
  }
  
  return tokenPath;
}

// Icon swap rules implementation
export function getNotificationIcon(
  iconSpec: NotificationIcon | string,
  isActive: boolean = false
): string {
  if (typeof iconSpec === 'string') {
    return iconSpec;
  }
  
  // JSON spec iconSwapRules: "default → active: outline → filled"
  return isActive && iconSpec.active ? iconSpec.active : iconSpec.default;
}

// Accessibility configuration from JSON spec
export const notificationAccessibility = {
  announceRole: 'status',
  ariaLive: 'polite',
  keyboardDismiss: true
} as const;

// Timeout configuration from JSON spec
export const notificationTimeouts = {
  toastDefaultMs: 5000,
  toastStickyMs: 0
} as const;

export default {
  tokens: notificationTokens,
  components: notificationComponents,
  blocks: notificationBlocks,
  accessibility: notificationAccessibility,
  timeouts: notificationTimeouts
};