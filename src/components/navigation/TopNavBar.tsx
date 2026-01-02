import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { LogoFull } from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../ui/utils';
const imgAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"; // Default avatar

interface TopNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
  showAuthButtons?: boolean;
}

export function TopNavBar({ currentRoute, onNavigate, className, showAuthButtons = true }: TopNavBarProps) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Define specific navigation items for top nav as requested by user
  // Top nav should have: Dashboard, Mood journal, Assessments, Program, Library, Let's Talk
  const topNavItems = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Mood Journal', route: '/mood-journal' },
    { label: 'Assessment', route: '/assessment' },
    { label: 'Equip', route: '/equip' },
    { label: 'Resource', route: '/resource' },
    { label: 'Consultation', route: '/consultation' }
  ];
  
  const navItems = topNavItems.map(item => ({
    label: item.label,
    route: item.route,
  }));

  // Handle scroll state for animations - JSON spec: states: ["default", "scrolled"]
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
        border: '1px solid #D1D5DB',
        zIndex: 'var(--z-nav)',
        // Removed fixed min-width to prevent overflow on smaller desktop screens
        maxWidth: 'var(--constraint-nav-desktop-max)',
        height: '88px',
        // Updated border radius as per design
        borderRadius: '12px',
        // Fixed positioning from top
        top: '20px',
        left: '20px',
        right: '20px',
        fontSize: 'var(--text-lg)', // type.title
        fontWeight: 'var(--font-weight-medium)'
      }}
      data-state={navbarState}
    >
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 animate-fadeIn">
        <button
          className="flex items-center gap-2 font-medium transition-all duration-200"
          onClick={() => onNavigate('/dashboard')}
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

      {/* Navigation Items */}
      <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          
          return (
            <Button
              key={item.route}
              variant="ghost"
              onClick={() => onNavigate(item.route)}
              className={cn(
                "px-4 py-2 h-auto transition-all duration-200 relative",
                "hover:animate-fadeIn"
              )}
              style={{
                backgroundColor: isActive ? 'var(--color-primary-default)' : 'transparent',
                color: isActive ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: 'var(--radius-md)' // Updated to match SideNav rounded look
              }}
              onMouseEnter={(e) => {
                 if (!isActive) {
                   e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'; // "turn grye"
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
            </Button>
          );
        })}
      </nav>

      {/* Profile Section - JSON spec icons: { "profile": "{icon.account.roundedOutline}" } */}
      {showAuthButtons && (
        <div className="flex items-center gap-4">

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

          {/* Profile Button - Direct Navigation to Account */}
          {user ? (
          <button 
            onClick={() => onNavigate('/account')}
            className="relative shrink-0 size-[48px] hover:scale-105 transition-transform duration-200 rounded-full overflow-hidden border border-transparent hover:border-gray-200"
          >
            <img alt="User Avatar" className="block max-w-none size-full object-cover" src={imgAvatar} />
          </button>
        ) : (
          <Button 
            variant="ghost" 
            className="gap-2 px-2 py-2 h-auto transition-all duration-200 hover:scale-105" 
            onClick={() => onNavigate('/account')}
            style={{
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Icon name="account" size={16} variant="roundedOutline" />
            <span className="hidden lg:inline">Sign In</span>
          </Button>
        )}
        </div>
      )}
    </header>
  );
}