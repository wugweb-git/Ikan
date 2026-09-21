import { Icon, AccountIcon, MoreIcon } from '../../ui/Icon';
import { navigationConfig } from '../../lib/navigation';
import { Button } from '../../ui/button';
import { LogoIcon } from '../../ui/Logo';
import { usePublicSettings } from '../../../shared/hooks/usePublicSettings';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { cn } from '../../ui/utils';

interface DesktopTopNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  className?: string;
}

export function DesktopTopNav({ currentRoute, onNavigate, className }: DesktopTopNavProps) {
  const topNavItems = navigationConfig.desktop.top_nav;
  const { settings } = usePublicSettings();
  const siteName = settings.siteName || 'iKan';

  const getIconVariant = (iconPath: string): { name: string; variant?: string } => {
    const match = iconPath.match(/\{icon\.(\w+)\.(\w+)\}/);
    if (match) {
      return { name: match[1], variant: match[2] };
    }
    return { name: 'home' };
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
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => onNavigate('/dashboard')}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigate('/dashboard'); }}
        >
          <LogoIcon size={28} />{/* LogoIcon already renders settings.logoIconUrl when set */}
          <div className="text-xl font-medium text-primary" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}>{siteName}</div>
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
                {(item as any).badge && (
                  <span
                    className="uppercase"
                    style={{
                      fontSize: '9px', fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1,
                      padding: '2px 5px', borderRadius: '4px', marginLeft: '4px', color: 'var(--grey-0)',
                      backgroundColor: (item as any).badge === 'beta'
                        ? 'var(--color-primary-default, #6941C6)'
                        : 'var(--color-text-muted, #888)',
                    }}
                  >
                    {(item as any).badge}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Profile Button - Direct Navigation to Account */}
        <Button 
          variant="ghost" 
          className="gap-2 px-2 py-2 h-auto hover:bg-muted transition-colors"
          onClick={() => onNavigate('/account')}
        >
          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>
              <AccountIcon variant="roundedOutline" size={16} />
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline">Profile</span>
        </Button>
      </div>
    </header>
  );
}

export default DesktopTopNav;