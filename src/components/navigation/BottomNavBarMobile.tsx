import React from 'react';
import { LayoutDashboard, Smile, Users, User, FileText } from 'lucide-react';
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

  // Defines the main navigation items for the "Thumb Zone"
  const navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Mood', route: '/mood-journal', icon: Smile },
    { label: 'Consultation', route: '/consultation', icon: Users },
    { label: 'Profile', route: '/account', icon: User }
  ];

  const handleTabPress = (route: string) => {
    triggerHapticFeedback('light');
    onNavigate(route);
  };

  return (
    <div 
      className={cn(
        "mobile-nav", // Use the new CSS class for floating logic
        className
      )}
      // Removed inline styles that conflict with .mobile-nav class
    >
      <div className="flex items-center justify-around h-full w-full">
        {navItems.map((item) => {
          // Check if current route starts with item route (for nested pages)
          // Exception for Dashboard which matches exactly or root
          const isActive = item.route === '/dashboard' 
            ? (currentRoute === '/dashboard' || currentRoute === '/')
            : currentRoute.startsWith(item.route);
            
          const Icon = item.icon;
          const badgeCount = notificationBadges[item.route] || 0;
          
          return (
            <button
              key={item.route}
              onClick={() => handleTabPress(item.route)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 active:opacity-70 transition-opacity",
                "touch-manipulation"
              )}
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-[#1A1A1A] dark:text-[#E4E4E4]" : "text-[#757575] dark:text-[#9E9E9E]"}
                />
                
                {/* Badge */}
                {badgeCount > 0 && (
                  <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white dark:border-[#1A1A1A]">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </div>
                )}
              </div>
              
              <span 
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive ? "text-[#1A1A1A] dark:text-[#E4E4E4]" : "text-[#757575] dark:text-[#9E9E9E]"
                )}
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
