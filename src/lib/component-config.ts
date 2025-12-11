// iKan Component Configuration from JSON
// This file contains the processed component configuration from the provided JSON

export interface ComponentToken {
  name: string;
  value: string;
  description?: string;
}

export interface ComponentIcon {
  name: string;
  default?: string;
  active?: string;
  variant?: 'roundedOutline' | 'roundedFilled' | 'outline' | 'filled' | 'default';
}

export interface ComponentState {
  name: string;
  description?: string;
  tokens?: string[];
}

export interface ComponentInteraction {
  type: 'hover' | 'press' | 'tap' | 'focus' | 'click' | 'drag' | 'open' | 'select' | 'type';
  description?: string;
}

export interface ComponentConstraints {
  minWidth?: string;
  maxWidth?: string;
  responsive?: {
    [breakpoint: string]: {
      maxWidth?: string;
      minWidth?: string;
    };
  };
}

export interface ComponentAnimation {
  name: string;
  keyframes: string;
  duration?: string;
  easing?: string;
}

export interface ComponentConfig {
  name: string;
  category: 'navigation' | 'buttons' | 'inputs';
  tokens: string[];
  icons?: { [key: string]: ComponentIcon };
  states: ComponentState[];
  interactions: ComponentInteraction[];
  constraints: ComponentConstraints;
  animations: ComponentAnimation[];
  style?: { [key: string]: string };
}

// Processed component configurations from the JSON
export const componentConfigs: { [key: string]: ComponentConfig } = {
  // Navigation Components
  TopNavBar: {
    name: 'TopNavBar',
    category: 'navigation',
    tokens: [
      'aliases.semantic.navbar.default',
      'spacing.3',
      'type.title',
      'zIndex.overlay'
    ],
    icons: {
      profile: { name: 'account', variant: 'roundedOutline' }
    },
    states: [
      { name: 'default' },
      { name: 'scrolled' }
    ],
    interactions: [
      { type: 'hover' }
    ],
    constraints: {
      minWidth: 'var(--constraint-nav-desktop-min)',
      maxWidth: 'var(--constraint-nav-desktop-max)'
    },
    animations: [
      { name: 'slideDown', keyframes: 'slideDown' },
      { name: 'fadeIn', keyframes: 'fadeIn' }
    ]
  },

  BottomNavBarMobile: {
    name: 'BottomNavBarMobile',
    category: 'navigation',
    tokens: [
      'bg.canvas',
      'primary.default',
      'borders.radius.lg',
      'zIndex.overlay'
    ],
    icons: {
      home: { name: 'home', default: 'roundedOutline', active: 'roundedFilled' },
      tools: { name: 'tools', default: 'roundedOutline', active: 'roundedFilled' },
      library: { name: 'library', default: 'roundedOutline', active: 'roundedFilled' },
      account: { name: 'account', default: 'roundedOutline', active: 'roundedFilled' }
    },
    states: [
      { name: 'default' },
      { name: 'active' }
    ],
    interactions: [
      { type: 'tap' }
    ],
    constraints: {
      minWidth: 'var(--constraint-nav-mobile-min)',
      maxWidth: 'var(--constraint-nav-mobile-max)'
    },
    animations: [
      { name: 'slideUp', keyframes: 'slideUp' },
      { name: 'fadeIn', keyframes: 'fadeIn' }
    ]
  },

  SearchBar: {
    name: 'SearchBar',
    category: 'navigation',
    tokens: [
      'input.background',
      'borders.radius.md',
      'icons.sizes.md'
    ],
    icons: {
      search: { name: 'search', variant: 'outline' }
    },
    states: [
      { name: 'default' },
      { name: 'focus' },
      { name: 'empty' }
    ],
    interactions: [
      { type: 'focus' },
      { type: 'type' }
    ],
    constraints: {
      minWidth: 'var(--constraint-input-min)',
      maxWidth: 'var(--constraint-input-max)'
    },
    animations: [
      { name: 'scaleIn', keyframes: 'scaleIn' }
    ]
  },

  // Button Components
  ButtonPrimary: {
    name: 'ButtonPrimary',
    category: 'buttons',
    tokens: [
      'button.primary.bg',
      'button.primary.fg',
      'borders.radius.md',
      'spacing.2'
    ],
    states: [
      { name: 'default' },
      { name: 'hover' },
      { name: 'active' },
      { name: 'disabled' },
      { name: 'loading' }
    ],
    interactions: [
      { type: 'hover' },
      { type: 'press' }
    ],
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-component-max)',
      responsive: {
        xs: { maxWidth: '100%' }
      }
    },
    animations: [
      { name: 'pulse', keyframes: 'pulse' },
      { name: 'ripple', keyframes: 'ripple' }
    ]
  },

  ButtonSecondary: {
    name: 'ButtonSecondary',
    category: 'buttons',
    tokens: [
      'secondary.default',
      'secondary.on',
      'borders.width.thin',
      'spacing.2'
    ],
    states: [
      { name: 'default' },
      { name: 'hover' },
      { name: 'active' },
      { name: 'disabled' }
    ],
    interactions: [
      { type: 'hover' },
      { type: 'press' }
    ],
    constraints: {
      minWidth: 'var(--constraint-component-min)',
      maxWidth: 'var(--constraint-component-max)'
    },
    animations: [
      { name: 'fadeIn', keyframes: 'fadeIn' }
    ]
  },

  ButtonIcon: {
    name: 'ButtonIcon',
    category: 'buttons',
    tokens: [
      'icons.sizes.md',
      'borders.radius.md',
      'spacing.1'
    ],
    icons: {
      default: { name: 'more', default: 'outline', active: 'filled' }
    },
    states: [
      { name: 'default' },
      { name: 'hover' },
      { name: 'active' },
      { name: 'disabled' },
      { name: 'selected' }
    ],
    interactions: [
      { type: 'hover' },
      { type: 'press' }
    ],
    constraints: {
      minWidth: 'auto',
      maxWidth: 'auto'
    },
    animations: [
      { name: 'scaleIn', keyframes: 'scaleIn' },
      { name: 'bounce', keyframes: 'bounce' }
    ]
  },

  // Input Components
  TextInput: {
    name: 'TextInput',
    category: 'inputs',
    tokens: [
      'input.background',
      'borders.radius.md',
      'type.body',
      'aliases.border.default',
      'spacing.2'
    ],
    states: [
      { name: 'default' },
      { name: 'focus' },
      { name: 'error' },
      { name: 'disabled' },
      { name: 'readOnly' }
    ],
    interactions: [
      { type: 'focus' },
      { type: 'type' }
    ],
    constraints: {
      minWidth: 'var(--constraint-input-min)',
      maxWidth: 'var(--constraint-input-max)',
      responsive: {
        xs: { maxWidth: '100%' }
      }
    },
    animations: [
      { name: 'fadeIn', keyframes: 'fadeIn' },
      { name: 'scaleIn', keyframes: 'scaleIn' }
    ]
  },

  RatingStars: {
    name: 'RatingStars',
    category: 'inputs',
    tokens: [
      'accent.default'
    ],
    icons: {
      star: { name: 'star', default: 'outline', active: 'filled' }
    },
    states: [
      { name: 'empty' },
      { name: 'partial' },
      { name: 'full' }
    ],
    interactions: [
      { type: 'click' },
      { type: 'hover' }
    ],
    constraints: {
      minWidth: 'auto',
      maxWidth: 'auto'
    },
    animations: [
      { name: 'scaleIn', keyframes: 'scaleIn' },
      { name: 'bounce', keyframes: 'bounce' }
    ]
  }
};

// Helper functions for working with component configurations
export function getComponentConfig(componentName: string): ComponentConfig | undefined {
  return componentConfigs[componentName];
}

export function getComponentsByCategory(category: 'navigation' | 'buttons' | 'inputs'): ComponentConfig[] {
  return Object.values(componentConfigs).filter(config => config.category === category);
}

export function getComponentTokens(componentName: string): string[] {
  const config = getComponentConfig(componentName);
  return config?.tokens || [];
}

export function getComponentStates(componentName: string): ComponentState[] {
  const config = getComponentConfig(componentName);
  return config?.states || [];
}

export function getComponentAnimations(componentName: string): ComponentAnimation[] {
  const config = getComponentConfig(componentName);
  return config?.animations || [];
}