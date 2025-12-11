// Comprehensive icon system configuration for iKan design system
// Combines Figma component mapping with Iconify fallbacks

import { iconConfig } from './icon-config';
import { iconMapping, iconifyMapping } from './icon-mapping';

// Export the complete icon configuration
export const iKanIcons = {
  // Figma component paths mapping
  figma: {
    name: "iKan - icons",
    description: "Map to Figma Icon components. Ensure Figma file has Icon/Name/Variant components to match these paths.",
    icon: iconConfig.icon
  },

  // Iconify mapping configuration
  iconify: {
    name: "iKan - icon-mapping", 
    source: "Iconify",
    mapping: iconifyMapping
  },

  // Lucide React fallback mapping
  lucide: {
    name: "iKan - lucide-fallback",
    source: "Lucide React",
    mapping: iconMapping
  }
} as const;

// Icon categories for organization
export const iconCategories = {
  navigation: {
    title: "Navigation Icons",
    description: "Icons used for app navigation and wayfinding",
    icons: ['home', 'library', 'tools', 'account'] as const
  },
  
  action: {
    title: "Action Icons", 
    description: "Icons for user actions and interactive elements",
    icons: ['arrowRight', 'more', 'delete', 'search', 'settings'] as const
  },
  
  content: {
    title: "Content Icons",
    description: "Icons representing different types of content",
    icons: ['dashboard', 'assignment', 'article'] as const
  },
  
  status: {
    title: "Status Icons",
    description: "Icons for conveying status, alerts, and notifications",
    icons: ['info', 'checkCircle', 'error', 'warning'] as const
  },
  
  general: {
    title: "General Icons",
    description: "Commonly used icons for various purposes",
    icons: ['calendar', 'chat', 'widget', 'bookmark', 'star'] as const
  }
} as const;

// Icon variant definitions
export const iconVariants = {
  roundedOutline: {
    title: "Rounded Outline",
    description: "Rounded style with outline stroke, used for navigation"
  },
  roundedFilled: {
    title: "Rounded Filled", 
    description: "Rounded style with solid fill, used for active navigation states"
  },
  outline: {
    title: "Outline",
    description: "Standard outline style, most common variant"
  },
  filled: {
    title: "Filled",
    description: "Solid fill style, used for active or selected states"
  },
  default: {
    title: "Default",
    description: "Default style for simple icons"
  }
} as const;

// Icon size presets
export const iconSizes = {
  xs: { size: 12, name: "Extra Small", usage: "Inline with small text" },
  sm: { size: 16, name: "Small", usage: "Buttons, form elements" },
  md: { size: 20, name: "Medium", usage: "Default size, navigation" },
  lg: { size: 24, name: "Large", usage: "Headers, prominent actions" },
  xl: { size: 32, name: "Extra Large", usage: "Hero sections, illustrations" }
} as const;

// Helper functions
export function getIconPath(iconName: string, variant: string): string | null {
  const icon = iconConfig.icon[iconName as keyof typeof iconConfig.icon];
  if (!icon) return null;
  
  return icon[variant as keyof typeof icon] || null;
}

export function getIconifyName(iconName: string, variant: string): string | null {
  const key = `${iconName}.${variant}` as keyof typeof iconifyMapping;
  return iconifyMapping[key] || null;
}

export function getLucideIconName(iconName: string, variant: string): string | null {
  const key = `${iconName}-${variant}` as keyof typeof iconMapping;
  return iconMapping[key] || null;
}

export function getAvailableVariants(iconName: string): string[] {
  const icon = iconConfig.icon[iconName as keyof typeof iconConfig.icon];
  return icon ? Object.keys(icon) : [];
}

export function getAllIcons(): string[] {
  return Object.keys(iconConfig.icon);
}

export function getIconsByCategory(category: keyof typeof iconCategories): readonly string[] {
  return iconCategories[category]?.icons || [];
}

// Type exports
export type IconName = keyof typeof iconConfig.icon;
export type IconVariant = 'roundedOutline' | 'roundedFilled' | 'outline' | 'filled' | 'default';
export type IconCategory = keyof typeof iconCategories;
export type IconSize = keyof typeof iconSizes;

// Default export
export default iKanIcons;