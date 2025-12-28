import React, { useState } from 'react';
import { cn } from '../ui/utils';
import svgPaths from '../../imports/svg-t4fcbtgp25';
import { ChevronDown, ChevronRight, CreditCard, EyeOff, FileText } from 'lucide-react';

interface SideNavAccountProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  style?: React.CSSProperties;
}

// Icon Components from Figma SVGs
const IconProfile = ({ color = "black" }: { color?: string }) => (
  <svg className="block w-[15px] h-[17px]" fill="none" viewBox="0 0 15.01 17.125">
    <g>
      <path d={svgPaths.p2f37c08} fill={color} />
      <path d={svgPaths.p1e9cd40} fill={color} />
    </g>
  </svg>
);

const IconNotifications = ({ color = "black" }: { color?: string }) => (
  <svg className="block w-[13px] h-[15px]" fill="none" viewBox="0 0 13.121 14.625">
    <g>
      <path d={svgPaths.p2ac53bf0} fill={color} />
      <path d={svgPaths.p3fc49280} fill={color} />
    </g>
  </svg>
);

const IconSecurity = ({ color = "black" }: { color?: string }) => (
  <svg className="block w-[15px] h-[18px]" fill="none" viewBox="0 0 15.1249 18.0001">
    <g>
      <path d={svgPaths.p3879200} fill={color} />
      <path d={svgPaths.p3932e240} fill={color} />
    </g>
  </svg>
);

const IconPreferences = ({ color = "black" }: { color?: string }) => (
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

const IconCorporate = ({ color = "black" }: { color?: string }) => (
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

const IconHelp = ({ color = "black" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <path clipRule="evenodd" d={svgPaths.p19332900} fill={color} fillRule="evenodd" />
  </svg>
);

const IconFAQs = ({ color = "black" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p132bc00} fill={color} />
      <path d={svgPaths.p36b21200} fill={color} />
      <path d={svgPaths.p26bfc271} fill={color} />
    </g>
  </svg>
);

const IconLogOut = ({ color = "black" }: { color?: string }) => (
  <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
    <g>
      <path d={svgPaths.p3317b780} fill={color} />
      <path d={svgPaths.p29eef400} fill={color} />
    </g>
  </svg>
);

// Lucide Icon wrappers for consistency
const IconPayment = ({ color = "black" }: { color?: string }) => (
  <CreditCard size={18} color={color} />
);

const IconPrivacy = ({ color = "black" }: { color?: string }) => (
  <EyeOff size={18} color={color} />
);

const IconLegal = ({ color = "black" }: { color?: string }) => (
  <FileText size={18} color={color} />
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
  style
}: SideNavAccountProps) {
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'account': true,
    'preferences': true,
    'security': true,
    'support': true,
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
      id: 'account',
      title: 'Account',
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
          icon: IconPayment 
        },
        { 
          id: 'corporate', 
          label: 'Corporate', 
          route: '/account/corporate', 
          icon: IconCorporate 
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
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
      id: 'security',
      title: 'Security & Privacy',
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
      title: 'Support',
      items: [
        { 
          id: 'faqs', 
          label: 'FAQs', 
          route: '/faq', 
          icon: IconFAQs 
        },
        { 
          id: 'help', 
          label: 'Let\'s Talk', 
          route: '/contact', 
          icon: IconHelp 
        }
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
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
        "bg-white flex flex-col items-start relative rounded-[12px] w-full p-5",
        className
      )} 
      style={style}
      data-name="Side Navigation"
    >
      <div className="flex flex-col gap-[12px] w-full">
        {navGroups.map((group) => (
          <div key={group.id} className="w-full">
            {/* Group Header */}
            <div 
              className={cn(
                "px-[20px] py-[8px] flex items-center justify-between",
                group.collapsible ? "cursor-pointer" : ""
              )}
              onClick={() => group.collapsible && toggleGroup(group.id)}
            >
              <h3 className="text-[12px] font-medium text-[#717182] uppercase tracking-wider font-['Ubuntu']">
                {group.title}
              </h3>
              {group.collapsible && (
                <div className="text-[#717182]">
                  {expandedGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}
            </div>

            {/* Group Items */}
            {(expandedGroups[group.id] || !group.collapsible) && (
              <div className="flex flex-col gap-[8px] mt-1">
                {group.items.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.route)}
                      className={cn(
                        "relative rounded-[8px] w-full transition-all duration-200",
                        isActive ? "bg-[#2e2a2f]" : "bg-white border border-[#f5f5f5] hover:bg-gray-50"
                      )}
                    >
                      <div className="flex flex-row items-center w-full">
                        <div className="flex gap-[8px] items-center px-[20px] py-[10px] w-full">
                          <div className="shrink-0 w-[18px] flex items-center justify-center">
                            <Icon color={isActive ? "white" : "black"} />
                          </div>
                          <div className={cn(
                            "flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap font-medium",
                            isActive ? "text-white font-['Ubuntu']" : "text-[#151515] font-['Inter']"
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
          <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
             <button
              onClick={onLogout}
              className="relative rounded-[8px] w-full bg-white border border-[#f5f5f5] transition-all duration-200 hover:bg-red-50 group"
            >
              <div className="flex flex-row items-center w-full">
                <div className="flex gap-[8px] items-center px-[20px] py-[10px] w-full">
                  <div className="shrink-0 w-[18px] flex items-center justify-center">
                    <IconLogOut color="black" />
                  </div>
                  <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#151515] group-hover:text-red-600 text-[14px] text-nowrap font-medium font-['Inter']">
                    <p className="leading-[28px]">Log out</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}