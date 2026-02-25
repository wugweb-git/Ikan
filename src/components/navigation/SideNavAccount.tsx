import React, { useState } from 'react';
import { cn } from '../ui/utils';
import { Separator } from '../ui/separator';
import svgPaths from '../../imports/svg-tfxlcr50sc';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

interface SideNavAccountProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  className?: string;
  style?: React.CSSProperties;
  isMobile?: boolean;
}

// Icon Components from Figma SVGs

const IconProfile = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[15px] h-[17px]" fill="none" viewBox="0 0 13.9077 16.0073">
    <g>
      <path d={svgPaths.p1366f300} fill={color} />
      <path d={svgPaths.pab3de00} fill={color} />
    </g>
  </svg>
);

const IconPayments = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p5eca500} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M1.5 7.5H16.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

const IconOrganization = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 17.6449">
    <g>
      <path d={svgPaths.p6656b80} fill={color} />
      <path d={svgPaths.p10da980} fill={color} />
      <path d={svgPaths.p29f7df80} fill={color} />
      <path d={svgPaths.p2d44f700} fill={color} />
      <path d={svgPaths.pf7d2800} fill={color} />
      <path d={svgPaths.p39b09d00} fill={color} />
      <path d={svgPaths.p22900400} fill={color} />
      <path d={svgPaths.p3f3f7080} fill={color} />
      <path d={svgPaths.p39f74900} fill={color} />
    </g>
  </svg>
);

const IconPreferences = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 17.6449">
    <g>
      <path d={svgPaths.p6656b80} fill={color} />
      <path d={svgPaths.p10da980} fill={color} />
      <path d={svgPaths.p29f7df80} fill={color} />
      <path d={svgPaths.p2d44f700} fill={color} />
      <path d={svgPaths.pf7d2800} fill={color} />
      <path d={svgPaths.p39b09d00} fill={color} />
      <path d={svgPaths.p22900400} fill={color} />
      <path d={svgPaths.p3f3f7080} fill={color} />
      <path d={svgPaths.p39f74900} fill={color} />
    </g>
  </svg>
);

const IconNotifications = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[13px] h-[15px]" fill="none" viewBox="0 0 13 14.4901">
    <g>
      <path d={svgPaths.p1a326d80} fill={color} />
      <path d={svgPaths.p3d903400} fill={color} />
    </g>
  </svg>
);

const IconPrivacy = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p1e0a7a40} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d={svgPaths.p1ba86b40} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d={svgPaths.p1ed557a0} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M1.5 1.5L16.5 16.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

const IconSecurity = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[15px] h-[18px]" fill="none" viewBox="0 0 15 17.8515">
    <g>
      <path d={svgPaths.p3de0e900} fill={color} />
      <path d={svgPaths.p29a2ee70} fill={color} />
    </g>
  </svg>
);

const IconAbout = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p132bc00} fill={color} />
      <path d={svgPaths.p36b21200} fill={color} />
      <path d={svgPaths.p26bfc271} fill={color} />
    </g>
  </svg>
);

const IconFAQs = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p132bc00} fill={color} />
      <path d={svgPaths.p36b21200} fill={color} />
      <path d={svgPaths.p26bfc271} fill={color} />
    </g>
  </svg>
);

const IconHelp = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <path clipRule="evenodd" d={svgPaths.p19332900} fill={color} fillRule="evenodd" />
  </svg>
);

const IconLegal = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p3a382d00} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d={svgPaths.p678c080} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M7.5 6.75H6" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M12 9.75H6" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M12 12.75H6" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

const IconLogOut = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 12.0199 17.9402">
    <g>
      <path d={svgPaths.p3317b780} fill={color} />
      <path d={svgPaths.ped6b480} fill={color} />
    </g>
  </svg>
);

const IconChevron = ({ color = "currentColor" }: { color?: string }) => (
  <svg className="block w-[14px] h-[14px]" fill="none" viewBox="0 0 8.16667 4.66667" style={{ overflow: 'visible' }}>
    <path d={svgPaths.p1d8d0700} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: React.ComponentType<{ color?: string }>;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

export function SideNavAccount({ 
  currentRoute, 
  onNavigate, 
  onLogout,
  className,
  style,
  isMobile = false
}: SideNavAccountProps) {
  
  // Initialize with only top 2 groups open to satisfy constraint
  // On mobile, maybe defaults are different? Figma implies ACCOUNT and PREFERENCES are open.
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'profile': true,
    'preferences': true,
    'settings': false,
    'support': false,
    'legal': false
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'profile',
      title: 'ACCOUNT',
      collapsible: true,
      items: [
        { 
          id: 'profile', 
          label: 'Profile', 
          route: '/account/profile', 
          icon: IconProfile 
        },
        { 
          id: 'payments', 
          label: 'Payments', 
          route: '/account/payments', 
          icon: IconPayments 
        },
        { 
          id: 'organization', 
          label: 'Organization', 
          route: '/account/corporate', 
          icon: IconOrganization 
        }
      ]
    },
    {
      id: 'preferences',
      title: 'PREFERENCES',
      collapsible: true,
      items: [
        { 
          id: 'preferences', 
          label: 'Preferences', 
          route: '/account/preferences', 
          icon: IconPreferences 
        },
        { 
          id: 'notifications', 
          label: 'Notifications', 
          route: '/account/notifications', 
          icon: IconNotifications 
        }
      ]
    },
    {
      id: 'settings',
      title: 'SETTINGS',
      collapsible: true,
      items: [
        { 
          id: 'privacy', 
          label: 'Privacy', 
          route: '/account/privacy', 
          icon: IconPrivacy 
        },
        { 
          id: 'security', 
          label: 'Security', 
          route: '/account/security', 
          icon: IconSecurity 
        }
      ]
    },
    {
      id: 'support',
      title: 'SUPPORT',
      collapsible: true,
      items: [
        { 
          id: 'about', 
          label: 'About', 
          route: '/about', 
          icon: IconAbout 
        },
        { 
          id: 'faqs', 
          label: 'FAQs', 
          route: '/faq', 
          icon: IconFAQs 
        },
        { 
          id: 'help', 
          label: "Let's Talk", 
          route: '/contact', 
          icon: IconHelp 
        }
      ]
    },
    {
      id: 'legal',
      title: 'LEGAL',
      collapsible: true,
      items: [
        {
          id: 'privacy-policy',
          label: 'Privacy Policy',
          route: '/privacy-policy',
          icon: IconLegal
        },
        {
          id: 'terms',
          label: 'Terms & Conditions',
          route: '/terms',
          icon: IconLegal
        },
        {
          id: 'return-policy',
          label: 'Return Policy',
          route: '/return-policy',
          icon: IconLegal
        },
        {
          id: 'cancellation-policy',
          label: 'Cancellation Policy',
          route: '/cancellation-policy',
          icon: IconLegal
        }
      ]
    }
  ];

  return (
    <div 
      className={cn(
        "flex flex-col items-start relative w-full",
        isMobile ? "bg-transparent p-0 border-none" : "bg-white p-5 border border-[var(--color-border-default)]",
        className
      )} 
      style={{
        ...style,
        boxShadow: 'none'
      }}
      data-name="SideNavAccount"
    >
      <div className={cn("flex flex-col w-full", isMobile ? "gap-[16px]" : "gap-[12px]")}>
        {navGroups.map((group, index) => (
          <div key={group.id} className="w-full">
            {/* Separator between groups (desktop only or specific mobile logic if needed) */}
            {/* Mobile design doesn't explicitly show separators between groups, just spacing. 
                Desktop has them. Keeping desktop behavior, hiding on mobile if spacing handles it. */}
            {!isMobile && index > 0 && <Separator className="mb-[12px] bg-[var(--color-border-default)]" />}

            {/* Group Header */}
            <div 
              className={cn(
                "flex items-center justify-between",
                isMobile ? "px-[16px] mb-[8px]" : "px-[0px] py-[8px] h-[34px]",
                group.collapsible ? "cursor-pointer" : ""
              )}
              onClick={() => group.collapsible && toggleGroup(group.id)}
            >
              <h3 className={cn(
                "font-medium text-[var(--color-text-muted)] uppercase tracking-[0.6px]",
                isMobile ? "text-[13px] leading-[18px]" : "text-[12px] leading-[18px]"
              )}>
                {group.title}
              </h3>
              {group.collapsible && (
                <div 
                  className={cn(
                    "text-[var(--color-text-muted)] transition-transform duration-200",
                    expandedGroups[group.id] ? "rotate-0" : "rotate-180"
                  )}
                >
                  <IconChevron color="var(--color-text-muted)" />
                </div>
              )}
            </div>

            {/* Group Items */}
            {(expandedGroups[group.id] || !group.collapsible) && (
              <div className={cn("flex flex-col w-full", isMobile ? "settings-group" : "gap-[8px] mt-1")}>
                {group.items.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;
                  
                  // Mobile specific styling vs Desktop
                  // Mobile: settings-item (defined in globals.css)
                  // Desktop: existing logic
                  
                  if (isMobile) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.route)}
                          className="settings-item w-full transition-colors active:bg-[var(--color-bg-muted)] group"
                        >
                          <div className="flex flex-row items-center justify-between w-full h-full">
                            <div className="flex gap-[12px] items-center">
                              <div className="shrink-0 w-[24px] flex items-center justify-center">
                                <Icon color="var(--color-text-primary)" />
                              </div>
                              <div className="flex flex-col justify-center leading-none text-[var(--color-text-primary)] font-medium text-[16px]">
                                {item.label}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                          </div>
                        </button>
                      );
                  }

                  const desktopButtonClasses = isActive 
                    ? "bg-[var(--color-primary-default)] border-[var(--color-primary-default)]" 
                    : "bg-white border-[var(--color-border-default)] hover:bg-[var(--color-bg-page)]";
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.route)}
                      className={cn(
                        "relative w-full transition-all duration-200 overflow-hidden group flex items-center h-[50px] border",
                        desktopButtonClasses
                      )}
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      <div className="flex flex-row items-center justify-between w-full h-full px-[20px]">
                        <div className="flex gap-[12px] items-center">
                          <div className="shrink-0 w-[24px] flex items-center justify-center">
                            <Icon color={isActive ? "white" : "var(--color-text-primary)"} />
                          </div>
                          <div className={cn(
                            "flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-nowrap font-medium h-[28px]",
                            "text-[14px]",
                            isActive ? "text-white" : "text-[var(--color-text-primary)]"
                          )}>
                            <p className="leading-[28px]">{item.label}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {onLogout && (
          <div className={cn("w-full", isMobile ? "mt-[24px]" : "mt-[12px]")}>
             {!isMobile && <Separator className="mb-[17px] bg-[var(--color-border-default)]" />}
             
             {isMobile ? (
                <div className="settings-group">
                    <button
                      onClick={onLogout}
                      className="settings-item w-full transition-colors active:bg-[var(--color-bg-muted)] group"
                    >
                      <div className="flex flex-row items-center justify-between w-full h-full">
                        <div className="flex gap-[12px] items-center">
                          <div className="shrink-0 w-[24px] flex items-center justify-center">
                            <IconLogOut color="var(--color-text-primary)" />
                          </div>
                          <div className="flex flex-col justify-center leading-none text-[var(--color-text-primary)] font-medium text-[16px]">
                            Log out
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                    </button>
                </div>
             ) : (
             <button
              onClick={onLogout}
              className={cn(
                "relative w-full transition-all duration-200 group flex items-center h-[50px] border hover:bg-[var(--color-status-danger-light)]"
              )}
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)', borderRadius: 'var(--radius-md)' }}
            >
              <div className="flex flex-row items-center justify-between w-full h-full px-[20px]">
                <div className="flex gap-[12px] items-center">
                  <div className="shrink-0 w-[24px] flex items-center justify-center">
                    <IconLogOut color="var(--color-text-primary)" />
                  </div>
                  <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[var(--color-text-primary)] group-hover:text-[var(--color-status-danger)] text-nowrap font-medium h-[28px] text-[14px]">
                    <p className="leading-[28px]">Log out</p>
                  </div>
                </div>
              </div>
            </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}