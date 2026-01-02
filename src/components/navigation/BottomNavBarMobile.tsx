import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase } from 'lucide-react';
import { getPrivateNavigationRoutes } from '../../lib/route-config';
import { cn } from '../ui/utils';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';
import svgPaths from '../../imports/svg-ffxmv6hrd1';

interface BottomNavBarMobileProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
  notificationBadges?: { [route: string]: number };
}

// Individual icon components based on NEW Figma design (BottmNavigation.tsx)
function HomeIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? "#2E2A2F" : "#2E2A2F";
  return (
    <div className="relative shrink-0 size-[24px] p-[2px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path 
            clipRule="evenodd" 
            d={svgPaths.pb2f2480} 
            fill={color} 
            fillRule="evenodd" 
          />
          <path 
            clipRule="evenodd" 
            d={svgPaths.p133ce900} 
            fill={color} 
            fillRule="evenodd" 
          />
        </g>
      </svg>
    </div>
  );
}

function ExploreIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? "black" : "black"; // Figma uses black
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[5.56%_7.25%_6.68%_4.99%]">
        <div className="absolute inset-[-0.95%]">
           <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
             <g>
               <path d={svgPaths.pde05680} fill={color} stroke={color} strokeWidth="0.4" />
               <g>
                 <path d={svgPaths.p39ab3b00} fill={color} />
                 <path d={svgPaths.p17159100} stroke={color} strokeWidth="0.4" />
               </g>
             </g>
           </svg>
        </div>
      </div>
    </div>
  );
}

function MoodIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? "black" : "black";
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[8.33%]">
        <div className="absolute inset-[-1.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
            <g>
              <path d={svgPaths.p2a376880} fill={color} stroke={color} strokeWidth="0.5" />
              <path d={svgPaths.p2e0cb300} fill={color} stroke={color} strokeWidth="0.5" />
              <path d={svgPaths.p1eaa2f80} fill={color} stroke={color} strokeWidth="0.5" />
              <path d={svgPaths.p33218a00} fill={color} stroke={color} strokeWidth="0.5" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function LibraryIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? "black" : "black";
  return (
    <div className="relative shrink-0 size-[24px] p-[2px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path clipRule="evenodd" d={svgPaths.pa3ed680} fill={color} fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

function EquipIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? "#2E2A2F" : "#2E2A2F";
  return (
    <div className="relative shrink-0 size-[24px] flex items-center justify-center">
      <Briefcase size={20} color={color} strokeWidth={1.5} />
    </div>
  );
}

function AccountIcon({ isActive }: { isActive: boolean }) {
  const color = isActive ? "black" : "black";
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[5.21%_11.08%]">
        <div className="absolute inset-[-0.47%_-0.54%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 22">
            <g>
              <path d={svgPaths.p1edee100} fill={color} stroke={color} strokeWidth="0.2" />
              <path d={svgPaths.p2a7bce00} fill={color} stroke={color} strokeWidth="0.2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function BottomNavBarMobile({ 
  currentRoute, 
  onNavigate, 
  className, 
  notificationBadges = {} 
}: BottomNavBarMobileProps) {
  const { triggerHapticFeedback } = useMobileOptimizations();
  const [activeTab, setActiveTab] = useState(currentRoute);
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  // Sync activeTab with currentRoute changes
  useEffect(() => {
    setActiveTab(currentRoute);
  }, [currentRoute]);

  const navItems = [
    { label: 'Home', route: '/dashboard', icon: HomeIcon },
    { label: 'Equip', route: '/equip', icon: EquipIcon },
    { label: 'Self Help', route: '/assessment', icon: ExploreIcon },
    { label: 'Mood', route: '/mood-journal', icon: MoodIcon },
    { label: 'Library', route: '/resource', icon: LibraryIcon },
    { label: 'You', route: '/account', icon: AccountIcon }
  ];

  const handleTabPress = (route: string) => {
    triggerHapticFeedback('light');
    setPressedTab(route);
    setTimeout(() => {
      onNavigate(route);
      setPressedTab(null);
    }, 50);
  };

  return (
    <div 
      className={cn(
        "bg-white z-[9999]",
        className
      )}
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 20px))',
        left: '16px',
        right: '16px',
        borderRadius: '32px',
        border: '1px solid var(--color-border-default)',
        padding: '8px 8px',
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', // Subtle shadow
        transform: 'translate3d(0,0,0)', // Force GPU layer
        backfaceVisibility: 'hidden',
        isolation: 'isolate'
      }}
    >
      <div className="flex flex-row items-center justify-center size-full">
        {/* Use grid for equal width distribution or flex with basis-0 grow */}
        <div className="flex w-full items-center justify-between gap-1">
          {navItems.map((item, index) => {
            const isActive = currentRoute === item.route;
            const isPressed = pressedTab === item.route;
            const badgeCount = notificationBadges[item.route] || 0;
            const IconComponent = item.icon;
            
            return (
              <motion.button
                key={item.route}
                onClick={() => handleTabPress(item.route)}
                className={cn(
                  "relative flex flex-col items-center justify-center shrink-0 cursor-pointer pointer-events-auto",
                  "touch-manipulation"
                )}
                style={{
                  // Active state styles
                  backgroundColor: isActive ? '#2A2A2A' : 'transparent',
                  borderRadius: isActive ? '50%' : '0', // Circle shape
                  width: isActive ? '48px' : 'auto', // Fixed size for circle
                  height: isActive ? '48px' : 'auto', // Fixed size for circle
                  padding: isActive ? '0' : '8px 0',
                  minWidth: isActive ? '48px' : '0',
                  // Inactive items grow to fill space
                  flexBasis: 0,
                  flexGrow: isActive ? 0 : 1, 
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className={cn(
                    "flex flex-col items-center transition-all duration-300 justify-center size-full",
                    !isActive && "opacity-40",
                    isActive && "scale-110" // Make icon slightly bigger when active
                  )}
                  style={{
                    // Force icon to white when active using filter
                    filter: isActive ? 'brightness(0) invert(1)' : 'none'
                  }}
                >
                  <div className={cn(isActive ? "text-white" : "")}>
                     <IconComponent isActive={isActive} />
                  </div>
                  
                  {!isActive && (
                    <span 
                      className="text-[11px] leading-[14px] text-[#2e2a2f] whitespace-nowrap mt-[4px] font-['Ubuntu'] font-medium"
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Badge */}
                <AnimatePresence>
                  {badgeCount > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full flex items-center justify-center z-10"
                      style={{
                        backgroundColor: 'var(--color-status-danger)',
                        fontSize: '10px',
                        color: 'white',
                        padding: '2px',
                        border: '2px solid white'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
