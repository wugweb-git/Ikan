import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { LogoFull } from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import { getPrivateNavigationRoutes, corporateRoutes } from '../../lib/route-config';
import { NotificationCenterTrigger } from '../notifications/NotificationCenter';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Heart, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../ui/utils';
import svgPaths from "../../imports/svg-53vrzosjep";
import sideNavSvgPaths from "../../imports/svg-9hgv5sa7uo";
import imgAvatar from "figma:asset/f8bfdc3dfe2a754ded4c44d82d1518e16a087140.png";

interface TopNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
  showAuthButtons?: boolean;
}

export function TopNavBar({ currentRoute, onNavigate, className, showAuthButtons = true }: TopNavBarProps) {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Define specific navigation items for top nav as requested by user
  // Top nav should have: Dashboard, Mood journal, Assessments, Program, Library, Let's Talk
  const topNavItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Mood Journal', route: '/mood-journal', icon: 'heart' },
    { label: 'Assessments', route: '/assessments', icon: 'assignment' },
    { label: 'Program', route: '/equip-programs', icon: 'tools' },
    { label: 'Library', route: '/library', icon: 'library' },
    { label: 'Consultation', route: '/consultation', icon: 'chat' }
  ];
  
  const navItems = topNavItems.map(item => ({
    label: item.label,
    route: item.route,
    icon: { default: item.icon, active: item.icon },
    variant: { default: 'roundedOutline', active: 'roundedFilled' }
  }));

  // Handle scroll state for animations - JSON spec: states: ["default", "scrolled"]
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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
        minWidth: 'var(--constraint-nav-desktop-min)',
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
          className="flex items-center gap-2 font-semibold transition-all duration-200"
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
                "gap-2 px-3 py-2 h-auto transition-all duration-200 relative overflow-hidden",
                // JSON spec interactions: ["hover"] 
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
              <Icon 
                name={isActive ? item.icon.active : item.icon.default} 
                size={16}
                variant={isActive ? item.variant.active : item.variant.default}
              />
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

          {/* Profile Dropdown Menu */}
          {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative shrink-0 size-[48px] hover:scale-105 transition-transform duration-200 rounded-full overflow-hidden border border-transparent hover:border-gray-200">
                <img alt="User Avatar" className="block max-w-none size-full object-cover" src={imgAvatar} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[280px] p-2"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Profile Header */}
              <div className="mb-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-default)' }}>
                <div className="flex items-center gap-3 text-white">
                  <div className="p-1.5 bg-white/10 rounded-full">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="font-medium" style={{ fontFamily: 'var(--font-family-base)' }}>Profile</span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {[
                  { label: 'Settings', route: '/account', icon: sideNavSvgPaths.p3535ba00 },
                  { label: 'Notifications', route: '/account/notifications', icon: sideNavSvgPaths.p2ac53bf0 }, // Note: using first path for icon
                  { label: 'Security', route: '/account/privacy', icon: sideNavSvgPaths.p3879200 },
                  { label: 'Preferences', route: '/account', icon: sideNavSvgPaths.p6656b80 },
                  { label: 'Corporate', route: '/about', icon: sideNavSvgPaths.p6656b80 },
                  { label: 'Help & Support', route: '/contact', icon: sideNavSvgPaths.p19332900 },
                  { label: 'FAQs', route: '/faq', icon: sideNavSvgPaths.p132bc00 },
                ].map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => onNavigate(item.route)}
                    className="flex items-center gap-3 p-3 cursor-pointer rounded-md transition-colors hover:bg-neutral-100 focus:bg-neutral-100"
                  >
                    <div className="w-[18px] h-[18px] shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 18 18" fill="none">
                        <path d={item.icon} fill="var(--color-text-primary)" />
                      </svg>
                    </div>
                    <span style={{ 
                      fontFamily: 'var(--font-family-base)', 
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {item.label}
                    </span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="my-2 bg-neutral-100" />
                
                {/* Corporate Sub-routes */}
                {corporateRoutes.map((page) => (
                  <DropdownMenuItem
                    key={page.path}
                    onClick={() => onNavigate(page.path)}
                    className="flex items-center gap-3 p-2 pl-9 cursor-pointer rounded-md hover:bg-neutral-100 focus:bg-neutral-100"
                  >
                    <span style={{ 
                      fontFamily: 'var(--font-family-base)', 
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)'
                    }}>
                      {page.label}
                    </span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="my-2 bg-neutral-100" />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-md hover:bg-red-50 focus:bg-red-50 group"
                >
                  <LogOut size={18} className="text-neutral-900 group-hover:text-red-600" />
                  <span style={{ 
                    fontFamily: 'var(--font-family-base)', 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }} className="group-hover:text-red-600">
                    Log out
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
