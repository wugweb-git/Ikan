import { iconConfig, type IconName } from './icon-config';
import { iconMapping } from './icon-mapping';

/**
 * Utility functions for working with the iKan icon system
 */

// Get Figma component path for an icon
export function getFigmaPath(iconName: IconName, variant?: string): string | null {
  const iconData = iconConfig.icon[iconName];
  if (!iconData) return null;
  
  const variantKey = variant as keyof typeof iconData;
  if (variant && variantKey in iconData) {
    return iconData[variantKey] as string;
  }
  
  // Return first available variant if no specific variant requested
  const firstVariant = Object.keys(iconData)[0] as keyof typeof iconData;
  return iconData[firstVariant] as string;
}

// Get all available icons with their variants
export function getAllIcons(): Record<IconName, string[]> {
  const result = {} as Record<IconName, string[]>;
  
  Object.keys(iconConfig.icon).forEach((iconName) => {
    const name = iconName as IconName;
    const iconData = iconConfig.icon[name];
    result[name] = Object.keys(iconData);
  });
  
  return result;
}

// Check if an icon and variant combination exists
export function iconExists(iconName: IconName, variant?: string): boolean {
  const iconData = iconConfig.icon[iconName];
  if (!iconData) return false;
  
  if (!variant) return true;
  
  return variant in iconData;
}

// Get the mapped Lucide icon name
export function getLucideMapping(iconName: IconName, variant?: string): string | null {
  const defaultVariants: Record<IconName, string> = {
    home: 'roundedOutline',
    library: 'roundedOutline',
    tools: 'roundedOutline', 
    account: 'roundedOutline',
    arrowRight: 'outline',
    more: 'outline',
    search: 'outline',
    settings: 'outline',
    checkCircle: 'outline',
    error: 'outline',
    calendar: 'default',
    chat: 'default',
    bookmark: 'outline'
  };

  const resolvedVariant = variant || defaultVariants[iconName];
  const iconKey = `${iconName}-${resolvedVariant}` as keyof typeof iconMapping;
  
  return iconMapping[iconKey] || null;
}

// Get icon metadata
export function getIconMeta(iconName: IconName) {
  const iconData = iconConfig.icon[iconName];
  if (!iconData) return null;
  
  return {
    name: iconName,
    variants: Object.keys(iconData),
    figmaPaths: Object.values(iconData),
    defaultVariant: Object.keys(iconData)[0]
  };
}

// Search icons by name or description
export function searchIcons(query: string): IconName[] {
  const searchTerm = query.toLowerCase();
  
  return Object.keys(iconConfig.icon).filter((iconName) => {
    return iconName.toLowerCase().includes(searchTerm);
  }) as IconName[];
}

// Validate icon configuration
export function validateIconConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if all icon names are valid
  Object.keys(iconConfig.icon).forEach((iconName) => {
    const name = iconName as IconName;
    const iconData = iconConfig.icon[name];
    
    if (!iconData || typeof iconData !== 'object') {
      errors.push(`Invalid icon data for: ${iconName}`);
      return;
    }
    
    // Check if all variants have valid paths
    Object.entries(iconData).forEach(([variant, path]) => {
      if (typeof path !== 'string' || !path.startsWith('Icon/')) {
        errors.push(`Invalid Figma path for ${iconName}.${variant}: ${path}`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  getFigmaPath,
  getAllIcons,
  iconExists,
  getLucideMapping,
  getIconMeta,
  searchIcons,
  validateIconConfig
};