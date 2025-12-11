import React from 'react';
import { Icon, AccountIcon, MoreIcon } from '../Icon';
import { navigationConfig } from '../../lib/navigation';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

interface DesktopTopNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  className?: string;
}

export function DesktopTopNav({ currentRoute, onNavigate, onLogout, className }: DesktopTopNavProps) {
  const topNavItems = navigationConfig.desktop.top_nav;
  const profileItems = navigationConfig.desktop.profile_dropdown;

  const getIconVariant = (iconPath: string): { name: string; variant?: string } => {
    const match = iconPath.match(/\{icon\.(\w+)\.(\w+)\}/);
    if (match) {
      return { name: match[1], variant: match[2] };
    }
    return { name: 'home' };
  };

  const handleItemClick = (item: any) => {
    if (item.action === 'logout') {
      onLogout?.();
    } else if (item.route) {
      onNavigate(item.route);
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60",
        "animate-slide-down",
        className
      )}
      style={{
        minWidth: 'var(--constraint-nav-desktop-min)',
        maxWidth: 'var(--constraint-nav-desktop-max)'
      }}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold text-primary">iKan</div>
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {topNavItems.map((item) => {
            const isActive = currentRoute === item.route;
            const { name, variant } = getIconVariant(item.icon || '');
            
            if (item.children) {
              return (
                <DropdownMenu key={item.route}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "gap-2 px-3 py-2 h-auto",
                        isActive && "bg-muted text-primary"
                      )}
                    >
                      <Icon name={name as any} variant={variant} size={16} />
                      {item.label}
                      <MoreIcon variant="outline" size={14} className="rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start"
                    className="animate-slide-down"
                  >
                    {item.children.map((child) => (
                      <DropdownMenuItem 
                        key={child.route}
                        onClick={() => onNavigate(child.route)}
                        className="cursor-pointer"
                      >
                        {child.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Button
                key={item.route}
                variant="ghost"
                onClick={() => onNavigate(item.route)}
                className={cn(
                  "gap-2 px-3 py-2 h-auto",
                  isActive && "bg-muted text-primary"
                )}
                aria-label={item.ariaLabel}
              >
                <Icon name={name as any} variant={variant} size={16} />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 py-2 h-auto">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>
                  <AccountIcon variant="roundedOutline" size={16} />
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline">Profile</span>
              <MoreIcon variant="outline" size={14} className="rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="w-48 animate-slide-down"
          >
            {profileItems.map((item, index) => (
              <React.Fragment key={item.route || item.action}>
                {index === profileItems.length - 1 && <DropdownMenuSeparator />}
                <DropdownMenuItem 
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "cursor-pointer",
                    item.action === 'logout' && "text-destructive focus:text-destructive"
                  )}
                >
                  {item.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default DesktopTopNav;