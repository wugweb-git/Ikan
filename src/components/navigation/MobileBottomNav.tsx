import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Smile, Users, PlusCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { useIsMobile } from '../../hooks/useIsMobile';

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Mood', route: '/mood-journal', icon: Smile },
    { label: 'Consultation', route: '/consultation', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9D9D9] h-[64px] pb-safe z-[50] flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.route);
        const Icon = item.icon;
        
        return (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full",
              isActive ? "text-[#1A1A1A]" : "text-[#757575]"
            )}
          >
            <Icon 
              size={24} 
              strokeWidth={2}
              className={cn(
                "transition-colors",
                isActive ? "text-[#1A1A1A]" : "text-[#757575]"
              )}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && (
              <div className="absolute top-0 h-[2px] w-[32px] bg-[#1A1A1A] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
