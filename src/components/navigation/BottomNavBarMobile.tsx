import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div className="relative shrink-0 size-[24px]">
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
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path clipRule="evenodd" d={svgPaths.pa3ed680} fill={color} fillRule="evenodd" />
        </g>
      </svg>
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

  const bottomNavItems = [
    { label: 'Home', route: '/dashboard', icon: HomeIcon },
    { label: 'Explore', route: '/assessment', icon: ExploreIcon }, // Mapped Assessment to Explore icon/label per previous logic
    { label: 'Mood', route: '/mood-journal', icon: MoodIcon },
    { label: 'Library', route: '/equip', icon: LibraryIcon }, // Mapped Equip to Library icon/label per previous logic/naming
    { label: 'Account', route: '/account', icon: AccountIcon }
  ];
  
  // Note: The labels in the array above are updated to match the Figma design (Home, Explore, Mood, Library, Account)
  // The routes map to the existing application routes.
  // Explore -> /assessment (or /explore if it exists? Previous code mapped Assessment to ExploreIcon)
  // Mood -> /mood-journal
  // Library -> /equip (Previous code mapped Equip to LibraryIcon? No, previous code mapped Equip to ExploreIcon too. Wait.)

  // Let's re-verify the mapping from previous code:
  // { label: 'Dashboard', route: '/dashboard', icon: HomeIcon },
  // { label: 'Assessment', route: '/assessment', icon: ExploreIcon },
  // { label: 'Equip', route: '/equip', icon: ExploreIcon },
  // { label: 'Tracker', route: '/mood-journal', icon: MoodIcon },
  // { label: 'Accounts', route: '/account', icon: AccountIcon }
  
  // New Design has: Home, Explore, Mood, Library, Account.
  // I should probably update the labels to match the Design, but keep routes working.
  // Dashboard -> Home
  // Assessment -> Explore
  // Tracker -> Mood
  // Account -> Account
  // Equip -> Library? Or Equip -> Explore? 
  // Let's assume:
  // Home -> Dashboard
  // Explore -> Assessment (or /explore)
  // Mood -> Mood Journal
  // Library -> Equip (Equip seems like a library of tools)
  // Account -> Account
  
  // However, I must keep all 5 items if I want to match the structure. 
  // The previous nav had 5 items. The new design has 5 items.
  // I will map them as best as I can.

  const navItems = [
    { label: 'Home', route: '/dashboard', icon: HomeIcon },
    { label: 'Explore', route: '/assessment', icon: ExploreIcon },
    { label: 'Mood', route: '/mood-journal', icon: MoodIcon },
    { label: 'Library', route: '/equip', icon: LibraryIcon },
    { label: 'Account', route: '/account', icon: AccountIcon }
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
        "fixed bg-white z-[50]",
        className
      )}
      style={{
        bottom: '16px',
        left: '16px',
        right: '16px',
        borderRadius: '12px',
        border: '1px solid #d6d6d6',
        boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.1)',
        padding: '10px',
        position: 'fixed' // Ensure position is fixed
      }}
    >
      <div className="flex flex-row items-center justify-center size-full">
        {/* Use grid for equal width distribution or flex with basis-0 grow */}
        <div className="flex w-full items-center justify-between">
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
                  "relative flex flex-col items-center justify-center gap-[4px] shrink-0",
                  "touch-manipulation"
                )}
                style={{
                  // Active state styles
                  backgroundColor: isActive ? '#f5f5f5' : 'transparent',
                  borderRadius: isActive ? '10px' : '0',
                  padding: isActive ? '6px 20px' : '6px 0',
                  width: isActive ? 'auto' : '100%', // Inactive take available space? Or fixed?
                  // Actually, to match "basis-0 grow" from Figma code:
                  flexBasis: 0,
                  flexGrow: 1,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={cn("flex flex-col items-center", !isActive && "opacity-40")}>
                  <IconComponent isActive={isActive} />
                  <span 
                    className={cn(
                      "text-[12px] leading-[18px] text-[#2e2a2f] whitespace-nowrap",
                      isActive ? "font-['Ubuntu'] font-medium" : "font-['Ubuntu'] font-regular"
                    )}
                  >
                    {item.label}
                  </span>
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
                        padding: '2px'
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
