import React from 'react';
import { Icon } from '../Icon';
import { navigationConfig } from '../../lib/navigation';
import { cn } from '../ui/utils';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
}

export function MobileBottomNav({ currentRoute, onNavigate, className }: MobileBottomNavProps) {
  const navItems = navigationConfig.mobile.bottom_nav;

  const getIconVariant = (iconPath: string): { name: string; variant?: string } => {
    // Parse icon path like "{icon.home.roundedOutline}"
    const match = iconPath.match(/\{icon\.(\w+)\.(\w+)\}/);
    if (match) {
      return { name: match[1], variant: match[2] };
    }
    return { name: 'home' }; // fallback
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50",
        "flex items-center justify-around",
        "px-2 py-2 pb-safe-area-inset-bottom",
        "animate-slide-up",
        className
      )}
      style={{
        minWidth: 'var(--constraint-nav-mobile-min)',
        maxWidth: 'var(--constraint-nav-mobile-max)'
      }}
    >
      {navItems.map((item) => {
        const isActive = currentRoute === item.route;
        const { name, variant } = getIconVariant(item.icon || '');
        
        return (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0",
              "hover:bg-muted/50 active:bg-muted/80",
              isActive && "text-primary"
            )}
            aria-label={item.label}
          >
            <Icon 
              name={name as any} 
              variant={variant} 
              size={20}
              className={cn(
                "transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span 
              className={cn(
                "text-xs truncate max-w-[60px] leading-none",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;