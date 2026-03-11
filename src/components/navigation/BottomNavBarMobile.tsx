import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Smile, Users, User, Compass } from 'lucide-react';
import { cn } from '../ui/utils';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';

interface BottomNavBarMobileProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
  notificationBadges?: { [route: string]: number };
}

export function BottomNavBarMobile({ 
  currentRoute, 
  onNavigate, 
  className, 
  notificationBadges = {} 
}: BottomNavBarMobileProps) {
  const { triggerHapticFeedback } = useMobileOptimizations();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Scroll direction detection — hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        // Only react after a meaningful scroll (threshold 8px)
        if (Math.abs(delta) > 8) {
          if (delta > 0 && currentY > 80) {
            // Scrolling down & past threshold
            setIsVisible(false);
          } else {
            // Scrolling up
            setIsVisible(true);
          }
          lastScrollY.current = currentY;
        }

        // Always show when at top
        if (currentY <= 10) {
          setIsVisible(true);
        }

        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Defines the main navigation items for the "Thumb Zone"
  const navItems = [
    { label: 'Home', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Journal', route: '/mood-journal', icon: Smile },
    { label: 'Explore', route: '/equip', icon: Compass },
    { label: 'Consult', route: '/consultation', icon: Users },
    { label: 'Profile', route: '/account', icon: User }
  ];

  const handleTabPress = (route: string) => {
    triggerHapticFeedback('light');
    onNavigate(route);
  };

  return (
    <div 
      className={cn(
        "mobile-nav",
        className
      )}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 16,
        right: 16,
        height: 64,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: 'calc(100% - 32px)',
        transform: isVisible ? 'translateY(0)' : 'translateY(calc(100% + 30px))',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        willChange: 'transform',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-full w-full">
        {navItems.map((item) => {
          // Check if current route starts with item route (for nested pages)
          // Exception for Dashboard which matches exactly or root
          const isActive = item.route === '/dashboard' 
            ? (currentRoute === '/dashboard' || currentRoute === '/')
            : item.route === '/equip'
            ? (currentRoute.startsWith('/equip') || currentRoute.startsWith('/assessment'))
            : currentRoute.startsWith(item.route);
            
          const Icon = item.icon;
          const badgeCount = notificationBadges[item.route] || 0;
          
          return (
            <button
              key={item.route}
              onClick={() => handleTabPress(item.route)}
              aria-label={`${item.label}${badgeCount > 0 ? `, ${badgeCount} notifications` : ''}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 active:opacity-70 transition-opacity",
                "touch-manipulation"
              )}
              style={{ minHeight: 'var(--ikan-touch-target-min)' }}
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                />
                
                {/* Badge */}
                {badgeCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-2 text-white text-[10px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--color-status-danger)',
                      border: '2px solid var(--color-bg-card)',
                    }}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </div>
                )}
              </div>
              
              <span 
                className="text-[10px] leading-none"
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}