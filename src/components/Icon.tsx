import React from 'react';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { iconConfig, type IconName, type IconVariant } from '../lib/icon-config';
import { iconMapping, type IconMappingKey } from '../lib/icon-mapping';
import { cn } from './ui/utils';

// Type for getting the right variant based on icon name
type GetIconVariant<T extends IconName> = T extends keyof typeof iconConfig.icon 
  ? keyof typeof iconConfig.icon[T]
  : never;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  variant?: string;
  size?: number | string;
  className?: string;
}

// Helper to create icon key for mapping lookup
function createIconKey(name: IconName, variant?: string): string {
  const defaultVariants: Record<string, string> = {
    home: 'roundedOutline',
    library: 'roundedOutline', 
    tools: 'roundedOutline',
    account: 'roundedOutline',
    arrowRight: 'outline',
    more: 'outline',
    delete: 'outline',
    search: 'outline',
    settings: 'outline',
    dashboard: 'outline',
    assignment: 'outline',
    article: 'outline',
    info: 'outline',
    checkCircle: 'outline',
    error: 'outline',
    warning: 'outline',
    calendar: 'default',
    chat: 'default',
    widget: 'default',
    bookmark: 'outline',
    star: 'outline'
  };

  const resolvedVariant = variant || defaultVariants[name] || 'outline';
  return `${name}-${resolvedVariant}`;
}

// Helper to get Lucide icon component
function getLucideIcon(iconKey: string): LucideIcon | null {
  const mappingKey = iconKey as IconMappingKey;
  const lucideIconName = iconMapping[mappingKey];
  
  if (!lucideIconName) return null;
  
  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[lucideIconName] as LucideIcon;
  return IconComponent || null;
}

export function Icon({ 
  name, 
  variant, 
  size = 24, 
  className, 
  ...props 
}: IconProps) {
  const iconKey = createIconKey(name, variant);
  const IconComponent = getLucideIcon(iconKey);

  if (!IconComponent) {
    // Fallback to a default icon if mapping not found
    const FallbackIcon = LucideIcons.HelpCircle;
    return (
      <FallbackIcon
        size={size}
        className={cn("text-current", className)}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      className={cn("text-current", className)}
      {...props}
    />
  );
}

// Convenience components for common icon variants
export function HomeIcon({ variant = 'roundedOutline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="home" variant={variant} {...props} />;
}

export function LibraryIcon({ variant = 'roundedOutline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="library" variant={variant} {...props} />;
}

export function ToolsIcon({ variant = 'roundedOutline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="tools" variant={variant} {...props} />;
}

export function AccountIcon({ variant = 'roundedOutline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="account" variant={variant} {...props} />;
}

export function ArrowRightIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="arrowRight" variant={variant} {...props} />;
}

export function MoreIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="more" variant={variant} {...props} />;
}

export function SearchIcon(props: Omit<IconProps, 'name' | 'variant'>) {
  return <Icon name="search" variant="outline" {...props} />;
}

export function SettingsIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="settings" variant={variant} {...props} />;
}

export function CheckCircleIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="checkCircle" variant={variant} {...props} />;
}

export function ErrorIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="error" variant={variant} {...props} />;
}

export function CalendarIcon(props: Omit<IconProps, 'name' | 'variant'>) {
  return <Icon name="calendar" variant="default" {...props} />;
}

export function ChatIcon(props: Omit<IconProps, 'name' | 'variant'>) {
  return <Icon name="chat" variant="default" {...props} />;
}

export function BookmarkIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="bookmark" variant={variant} {...props} />;
}

export function DeleteIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="delete" variant={variant} {...props} />;
}

export function DashboardIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="dashboard" variant={variant} {...props} />;
}

export function AssignmentIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="assignment" variant={variant} {...props} />;
}

export function ArticleIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="article" variant={variant} {...props} />;
}

export function InfoIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="info" variant={variant} {...props} />;
}

export function WarningIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="warning" variant={variant} {...props} />;
}

export function WidgetIcon(props: Omit<IconProps, 'name' | 'variant'>) {
  return <Icon name="widget" variant="default" {...props} />;
}

export function StarIcon({ variant = 'outline', ...props }: Omit<IconProps, 'name'>) {
  return <Icon name="star" variant={variant} {...props} />;
}

// Export all icon names for external use
export const availableIcons = Object.keys(iconConfig.icon) as IconName[];

// Helper function to get all variants for an icon
export function getIconVariants(iconName: IconName): string[] {
  const iconData = iconConfig.icon[iconName];
  return iconData ? Object.keys(iconData) : [];
}

export default Icon;