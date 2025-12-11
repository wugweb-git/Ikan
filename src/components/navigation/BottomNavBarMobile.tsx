import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../Icon';
import { getPrivateNavigationRoutes } from '../../lib/route-config';
import { cn } from '../ui/utils';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';
import svgPaths from '../../imports/svg-ajk3bd3zji';

interface BottomNavBarMobileProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
  notificationBadges?: { [route: string]: number };
}

// Individual icon components based on Figma design
function HomeIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path 
            clipRule="evenodd" 
            d={svgPaths.pb2f2480} 
            fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
            fillRule="evenodd" 
          />
          <path 
            clipRule="evenodd" 
            d={svgPaths.p133ce900} 
            fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
            fillRule="evenodd" 
          />
        </g>
      </svg>
    </div>
  );
}

function ExploreIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[5.55%_7.25%_6.69%_4.99%]">
        <div className="absolute inset-[-1.27%_-1.26%_-1.26%_-1.27%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
            <g>
              <path 
                d={svgPaths.p2eba0400} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.533333" 
              />
              <g>
                <path d={svgPaths.p30d744c0} fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} />
                <path 
                  d={svgPaths.p276d3f80} 
                  stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                  strokeWidth="0.533333" 
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function MoodIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[8.333%]">
        <div className="absolute inset-[-1.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <g>
              <path 
                d={svgPaths.p7ceef00} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.666667" 
              />
              <path 
                d={svgPaths.p1f9a3600} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.666667" 
              />
              <path 
                d={svgPaths.p36767b00} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.666667" 
              />
              <path 
                d={svgPaths.p1e3a6640} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.666667" 
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function LibraryIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path 
            clipRule="evenodd" 
            d={svgPaths.p2db70480} 
            fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
            fillRule="evenodd" 
          />
        </g>
      </svg>
    </div>
  );
}

function AccountIcon({ isActive }: { isActive: boolean }) {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[5.21%_11.08%_5.21%_11.09%]">
        <div className="absolute inset-[-0.62%_-0.72%_-0.62%_-0.71%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 23">
            <g>
              <path 
                d={svgPaths.p3e13bb70} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.266667" 
              />
              <path 
                d={svgPaths.p33e12980} 
                fill={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                stroke={isActive ? "var(--color-primary-default)" : "var(--color-text-muted)"} 
                strokeWidth="0.266667" 
              />
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

  // Define specific navigation items for bottom nav as requested by user
  // Bottom nav should have: Dashboard, Assessments, Equips, Tracker (mood journal), Accounts
  const bottomNavItems = [
    { label: 'Dashboard', route: '/dashboard', icon: HomeIcon },
    { label: 'Assessments', route: '/assessments', icon: ExploreIcon },
    { label: 'Equips', route: '/equip-programs', icon: ExploreIcon },
    { label: 'Tracker', route: '/mood-journal', icon: MoodIcon },
    { label: 'Accounts', route: '/account', icon: AccountIcon }
  ];
  
  const navItems = bottomNavItems.map(item => ({
    label: item.label,
    route: item.route,
    icon: item.icon
  }));

  const handleTabPress = (route: string) => {
    // Haptic feedback for tab switches
    triggerHapticFeedback('light');
    setPressedTab(route);
    
    // Navigate with gentle transition
    setTimeout(() => {
      onNavigate(route);
      setPressedTab(null);
    }, 50);
  };

  return (
    <div 
      className={cn(
        "bg-white relative rounded-[12px] size-full",
        className
      )}
      style={{
        height: 'var(--ikan-nav-height-mobile)'
      }}
    >
      {/* Border from Figma design */}
      <div 
        aria-hidden="true" 
        className="absolute border border-[#d6d6d6] border-solid inset-0 pointer-events-none rounded-[12px]" 
      />
      
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center p-[10px] relative size-full">
          {navItems.map((item, index) => {
            const isActive = currentRoute === item.route;
            const isPressed = pressedTab === item.route;
            const badgeCount = notificationBadges[item.route] || 0;
            const IconComponent = item.icon;
            
            return (
              <motion.div
                key={item.route}
                className={cn(
                  "basis-0 content-stretch flex flex-col gap-[4px] grow items-center min-h-px min-w-px relative shrink-0",
                  // Apply active state styling
                  isActive ? "" : "opacity-60"
                )}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: isActive ? 1 : 0.6 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: index * 0.05
                }}
              >
                {/* Active state background */}
                {isActive && (
                  <motion.div 
                    className="bg-neutral-100 relative rounded-[10px] shrink-0 w-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="flex flex-col items-center size-full">
                      <motion.button
                        onClick={() => handleTabPress(item.route)}
                        className="box-border content-stretch flex flex-col gap-[4px] items-center px-[20px] py-[6px] relative w-full touch-manipulation"
                        whileTap={{ 
                          scale: 0.95,
                          transition: { duration: 0.1 }
                        }}
                        aria-label={item.label}
                      >
                        <motion.div
                          animate={{
                            scale: isPressed ? 0.9 : 1
                          }}
                          transition={{ duration: 0.1 }}
                        >
                          <IconComponent isActive={true} />
                        </motion.div>
                        <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[12px] text-nowrap">
                          <p className="leading-[18px] whitespace-pre">{item.label}</p>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Inactive state */}
                {!isActive && (
                  <motion.button
                    onClick={() => handleTabPress(item.route)}
                    className="flex flex-col gap-[4px] items-center touch-manipulation py-[6px] px-[20px]"
                    whileTap={{ 
                      scale: 0.95,
                      transition: { duration: 0.1 }
                    }}
                    aria-label={item.label}
                  >
                    <motion.div
                      animate={{
                        scale: isPressed ? 0.9 : 1
                      }}
                      transition={{ duration: 0.1 }}
                    >
                      <IconComponent isActive={false} />
                    </motion.div>
                    <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#2e2a2f] text-[12px] text-center w-[min-content]">
                      <p className="leading-[18px]">{item.label}</p>
                    </div>
                  </motion.button>
                )}

                {/* Notification badge */}
                <AnimatePresence>
                  {badgeCount > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center z-10"
                      style={{
                        backgroundColor: 'var(--color-status-danger)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-inverse)',
                        fontWeight: 'var(--font-weight-medium)',
                        padding: '2px 6px'
                      }}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                        y: [0, -2, 0]
                      }}
                      exit={{ scale: 0, rotate: -180 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 25,
                        duration: 0.4,
                        y: {
                          repeat: badgeCount > 5 ? Infinity : 2,
                          duration: 1.5,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}