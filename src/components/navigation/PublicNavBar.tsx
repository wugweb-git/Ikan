import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { Icon } from '../Icon';
import { LogoFull } from '../Logo';

import { cn } from '../ui/utils';

interface PublicNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onSignIn: () => void;
  className?: string;
}

export function PublicNavBar({ currentRoute, onNavigate, onSignIn, className }: PublicNavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Fixed navigation items as specified
  const publicNavItems = [
    { path: '/', label: 'Home' },
    { path: '/assessment', label: 'Assessments' },
    { path: '/equip', label: 'Equip', badge: 'beta' },
    { path: '/resource', label: 'Resource' },
    { path: '/consultation', label: 'Consultation', badge: 'coming soon' },
    { path: '/about', label: 'About Us' }
  ];

  // Handle scroll state for animations
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarState = isScrolled ? 'scrolled' : 'default';

  return (
    <header 
      className={cn(
        "fixed backdrop-blur transition-all duration-300 flex items-center justify-between px-6",
        isScrolled && "shadow-sm animate-slideDown",
        className
      )}
      style={{ 
        backgroundColor: 'var(--color-bg-card)', 
        border: '1px solid var(--color-border-default)',
        zIndex: 'var(--z-nav)',
        minWidth: 'var(--constraint-nav-desktop-min)',
        maxWidth: 'var(--constraint-nav-desktop-max)',
        height: '88px',
        borderRadius: '12px',
        top: '20px',
        left: '20px',
        right: '20px',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-medium)'
      }}
      data-state={navbarState}
    >
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 animate-fadeIn">
        <button
          className="flex items-center gap-2 font-medium transition-all duration-200"
          onClick={() => onNavigate('/')}
          style={{ 
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-primary-default)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LogoFull height={50} />
        </button>
      </div>

      {/* Public Navigation Items */}
      <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {publicNavItems.map((item) => {
          const isActive = currentRoute === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => onNavigate(item.path)}
              className={cn(
                "px-4 py-2 h-auto transition-all duration-200 relative",
                "hover:animate-fadeIn"
              )}
              style={{
                backgroundColor: isActive ? 'var(--color-primary-default)' : 'transparent',
                color: isActive ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: 'var(--radius-md)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                }
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {item.label}
              {(item as any).badge && (
                <span
                  className="uppercase"
                  style={{
                    fontSize: '9px', fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1,
                    padding: '2px 5px', borderRadius: '4px', marginLeft: '5px', color: '#fff',
                    backgroundColor: (item as any).badge === 'beta'
                      ? 'var(--color-primary-default, #6941C6)'
                      : 'var(--color-text-muted, #888)',
                    verticalAlign: 'middle',
                  }}
                >
                  {(item as any).badge}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Let's Talk and Sign In Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <Button 
          onClick={() => onNavigate('/contact')}
          className="gap-2 px-5 py-2.5 h-auto transition-all duration-200 hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          Let's Talk
        </Button>
        <Button 
          onClick={onSignIn}
          className="gap-2 px-5 py-2.5 h-auto transition-all duration-200 hover:scale-105" 
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)'
          }}
        >
          <Icon name="account" size={16} variant="roundedOutline" />
          Sign In
        </Button>
      </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col gap-6 pt-10">
              <div className="flex flex-col gap-4">
                {publicNavItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "justify-start text-lg h-auto py-3 px-4",
                      currentRoute === item.path && "bg-muted font-medium"
                    )}
                    onClick={() => {
                      onNavigate(item.path);
                      setIsSheetOpen(false);
                    }}
                  >
                    {item.label}
                    {(item as any).badge && (
                      <span
                        className="uppercase"
                        style={{
                          fontSize: '9px', fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1,
                          padding: '2px 5px', borderRadius: '4px', marginLeft: '8px', color: '#fff',
                          backgroundColor: (item as any).badge === 'beta'
                            ? 'var(--color-primary-default, #6941C6)'
                            : 'var(--color-text-muted, #888)',
                        }}
                      >
                        {(item as any).badge}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <div className="border-t pt-6 flex flex-col gap-4">
                <Button 
                  onClick={() => {
                    onNavigate('/contact');
                    setIsSheetOpen(false);
                  }}
                  className="w-full justify-start h-12 text-base font-medium"
                  style={{
                    backgroundColor: 'var(--color-bg-muted)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Let's Talk
                </Button>
                <Button 
                  onClick={() => {
                    onSignIn();
                    setIsSheetOpen(false);
                  }}
                  className="w-full justify-start h-12 text-base font-medium"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                  }}
                >
                  <Icon name="account" size={16} variant="roundedOutline" className="mr-2" />
                  Sign In
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
  );
}