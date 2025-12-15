import React, { useState, useEffect } from 'react';
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
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/assessment', label: 'Assessment', icon: 'assignment' },
    { path: '/equip', label: 'Equip', icon: 'tools' },
    { path: '/resource', label: 'Resource', icon: 'library' },
    { path: '/consultation', label: 'Consultation', icon: 'chat' },
    { path: '/about', label: 'About Us', icon: 'info' }
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
        "fixed backdrop-blur transition-all duration-300",
        isScrolled && "shadow-sm animate-slideDown",
        className
      )}
      style={{ 
        backgroundColor: 'var(--color-bg-card)', 
        border: '1px solid #D1D5DB',
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
      <div 
        className="mx-auto flex items-center justify-between max-w-7xl h-full"
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
        <nav className="hidden md:flex items-center gap-1">
          {publicNavItems.map((item) => {
            const isActive = currentRoute === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "gap-2 px-3 py-2 h-auto transition-all duration-200 relative overflow-hidden",
                  "hover:animate-fadeIn"
                )}
                style={{
                  backgroundColor: isActive ? 'var(--color-bg-muted)' : 'transparent',
                  color: isActive ? 'var(--color-primary-default)' : 'var(--color-text-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 animate-slideRight"
                    style={{ backgroundColor: 'var(--color-primary-default)' }}
                  />
                )}
              </Button>
            );
          })}
        </nav>

        {/* Let's Talk and Sign In Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            onClick={() => onNavigate('/contact')}
            className="gap-2 px-4 py-2 h-auto transition-all duration-200 hover:scale-105" 
            style={{
              backgroundColor: 'var(--color-neutral-300)',
              color: 'var(--color-neutral-600)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              height: '48px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-300)';
            }}
          >
            Let's Talk
          </Button>
          <Button 
            onClick={onSignIn}
            className="gap-2 px-4 py-2 h-auto transition-all duration-200 hover:scale-105" 
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              height: '48px'
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
                    <Icon name={item.icon} className="mr-3 h-5 w-5" />
                    {item.label}
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
                    backgroundColor: 'var(--color-neutral-300)',
                    color: 'var(--color-neutral-600)',
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
      </div>
    </header>
  );
}
