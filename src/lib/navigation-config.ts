// iKan Navigation Configuration - Implementation of JSON navigation specifications

export interface NavigationIcon {
  default: string;
  active?: string;
  variant?: 'roundedOutline' | 'roundedFilled' | 'outline' | 'filled';
}

export interface NavigationConstraints {
  minWidth: string;
  maxWidth: string;
}

export interface NavigationState {
  name: string;
  description?: string;
}

export interface NavigationInteraction {
  type: 'hover' | 'tap' | 'click' | 'focus' | 'type';
  description?: string;
}

export interface NavigationAnimation {
  name: string;
  keyframes: string;
  duration?: string;
  easing?: string;
}

export interface NavigationComponent {
  name: string;
  tokens: string[];
  icons?: { [key: string]: NavigationIcon | string };
  states: string[];
  interactions: string[];
  constraints: NavigationConstraints;
  animations: string[];
}

// Navigation configurations from the JSON specification
export const navigationConfigs: { [key: string]: NavigationComponent } = {
  TopNavBar: {
    name: 'TopNavBar',
    tokens: [
      'aliases.semantic.navbar.default',
      'spacing.3',
      'type.title',
      'zIndex.overlay'
    ],
    icons: {
      profile: 'icon.account.roundedOutline'
    },
    states: ['default', 'scrolled'],
    interactions: ['hover'],
    constraints: {
      minWidth: 'var(--constraint-nav-desktop-min)',
      maxWidth: 'var(--constraint-nav-desktop-max)'
    },
    animations: ['motion.keyframes.slideDown', 'motion.keyframes.fadeIn']
  },

  BottomNavBarMobile: {
    name: 'BottomNavBarMobile',
    tokens: [
      'bg.canvas',
      'primary.default',
      'borders.radius.lg',
      'zIndex.overlay'
    ],
    icons: {
      home: {
        default: 'icon.home.roundedOutline',
        active: 'icon.home.roundedFilled'
      },
      tools: {
        default: 'icon.tools.roundedOutline',
        active: 'icon.tools.roundedFilled'
      },
      library: {
        default: 'icon.library.roundedOutline',
        active: 'icon.library.roundedFilled'
      },
      account: {
        default: 'icon.account.roundedOutline',
        active: 'icon.account.roundedFilled'
      }
    },
    states: ['default', 'active'],
    interactions: ['tap'],
    constraints: {
      minWidth: 'var(--constraint-nav-mobile-min)',
      maxWidth: 'var(--constraint-nav-mobile-max)'
    },
    animations: ['motion.keyframes.slideUp', 'motion.keyframes.fadeIn']
  },

  SideNavAccount: {
    name: 'SideNavAccount',
    tokens: [
      'bg.canvas',
      'accent.default',
      'type.body'
    ],
    icons: {
      dashboard: {
        default: 'icon.dashboard.outline',
        active: 'icon.dashboard.filled'
      },
      settings: {
        default: 'icon.settings.outline',
        active: 'icon.settings.filled'
      }
    },
    states: ['default', 'expanded', 'collapsed', 'active'],
    interactions: ['hover', 'click'],
    constraints: {
      minWidth: 'var(--constraint-sidebar-min)',
      maxWidth: 'var(--constraint-sidebar-max)'
    },
    animations: ['motion.keyframes.slideLeft', 'motion.keyframes.fadeIn']
  },

  Breadcrumbs: {
    name: 'Breadcrumbs',
    tokens: [
      'type.body',
      'colors.muted.fg',
      'spacing.1'
    ],
    states: ['default'],
    interactions: [],
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-content-max)'
    },
    animations: []
  },

  Pagination: {
    name: 'Pagination',
    tokens: [
      'secondary.default',
      'type.body',
      'spacing.2'
    ],
    states: ['default', 'active', 'disabled'],
    interactions: ['click'],
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-component-max)'
    },
    animations: ['motion.keyframes.fadeIn']
  },

  SearchBar: {
    name: 'SearchBar',
    tokens: [
      'input.background',
      'borders.radius.md',
      'icons.sizes.md'
    ],
    icons: {
      search: 'icon.search.outline'
    },
    states: ['default', 'focus', 'empty'],
    interactions: ['focus', 'type'],
    constraints: {
      minWidth: 'var(--constraint-input-min)',
      maxWidth: 'var(--constraint-input-max)'
    },
    animations: ['motion.keyframes.scaleIn']
  }
};

// Helper functions for working with navigation configurations
export function getNavigationConfig(componentName: string): NavigationComponent | undefined {
  return navigationConfigs[componentName];
}

export function getNavigationTokens(componentName: string): string[] {
  const config = getNavigationConfig(componentName);
  return config?.tokens || [];
}

export function getNavigationStates(componentName: string): string[] {
  const config = getNavigationConfig(componentName);
  return config?.states || [];
}

export function getNavigationInteractions(componentName: string): string[] {
  const config = getNavigationConfig(componentName);
  return config?.interactions || [];
}

export function getNavigationAnimations(componentName: string): string[] {
  const config = getNavigationConfig(componentName);
  return config?.animations || [];
}

export function getNavigationConstraints(componentName: string): NavigationConstraints | undefined {
  const config = getNavigationConfig(componentName);
  return config?.constraints;
}

export function getNavigationIcons(componentName: string): { [key: string]: NavigationIcon | string } | undefined {
  const config = getNavigationConfig(componentName);
  return config?.icons;
}

// CSS class generators for navigation animations
export function generateNavigationAnimationClasses(animations: string[]): string {
  const animationMap: { [key: string]: string } = {
    'motion.keyframes.slideDown': 'animate-slide-down',
    'motion.keyframes.slideUp': 'animate-slide-up',
    'motion.keyframes.slideLeft': 'animate-slide-left',
    'motion.keyframes.slideRight': 'animate-slide-right',
    'motion.keyframes.fadeIn': 'animate-fade-in',
    'motion.keyframes.fadeOut': 'animate-fade-out',
    'motion.keyframes.scaleIn': 'animate-scale-in'
  };

  return animations
    .map(animation => animationMap[animation])
    .filter(Boolean)
    .join(' ');
}

// Navigation state management helpers
export function getNavigationStateClasses(
  component: string, 
  currentState: string
): string {
  const config = getNavigationConfig(component);
  if (!config || !config.states.includes(currentState)) {
    return '';
  }

  // Generate state-specific classes
  const stateClasses: { [key: string]: string } = {
    'default': '',
    'active': 'bg-muted text-primary',
    'scrolled': 'shadow-sm backdrop-blur',
    'focus': 'ring-2 ring-primary',
    'expanded': 'w-64',
    'collapsed': 'w-16',
    'disabled': 'opacity-50 cursor-not-allowed',
    'empty': 'text-muted-foreground'
  };

  return stateClasses[currentState] || '';
}

// Icon mapping for navigation components
export const navigationIconMapping: { [key: string]: string } = {
  'icon.account.roundedOutline': 'user',
  'icon.account.roundedFilled': 'user',
  'icon.home.roundedOutline': 'home',
  'icon.home.roundedFilled': 'home',
  'icon.tools.roundedOutline': 'wrench',
  'icon.tools.roundedFilled': 'wrench',
  'icon.library.roundedOutline': 'library',
  'icon.library.roundedFilled': 'library',
  'icon.dashboard.outline': 'layout-dashboard',
  'icon.dashboard.filled': 'layout-dashboard',
  'icon.settings.outline': 'settings',
  'icon.settings.filled': 'settings',
  'icon.search.outline': 'search'
};

// Utility function to resolve icon names from JSON specification
export function resolveNavigationIcon(iconSpec: string): string {
  return navigationIconMapping[iconSpec] || iconSpec.split('.').pop() || 'circle';
}

export default navigationConfigs;