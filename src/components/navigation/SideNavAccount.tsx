import React, { useState } from 'react';
import { cn } from '../ui/utils';
import { Separator } from '../ui/separator';
import svgPaths from '../../imports/svg-tfxlcr50sc';
import { ChevronRight, FileText, ScrollText, RotateCcw, XCircle } from 'lucide-react';

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

// Lucide-based icon wrappers for Legal section
const IconPrivacyPolicy = ({ color = "currentColor" }: { color?: string }) => (
  <FileText size={18} color={color} />
);
const IconTerms = ({ color = "currentColor" }: { color?: string }) => (
  <ScrollText size={18} color={color} />
);
const IconReturnPolicy = ({ color = "currentColor" }: { color?: string }) => (
  <RotateCcw size={18} color={color} />
);
const IconCancellation = ({ color = "currentColor" }: { color?: string }) => (
  <XCircle size={18} color={color} />
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

// ─── Group title style ─────────────────────────────────────────
const groupTitleStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'var(--font-weight-medium)' as any,
  fontFamily: 'var(--font-family-base)',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase' as any,
  letterSpacing: '0.8px',
  lineHeight: '16px',
  margin: 0
};

export function SideNavAccount({
  currentRoute,
  onNavigate,
  onLogout,
  className,
  style,
  isMobile = false
}: SideNavAccountProps) {

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'profile': true,
    'preferences': true,
    'system': true
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'profile',
      title: 'Account',
      collapsible: true,
      items: [
        { id: 'profile', label: 'Profile', route: '/account/profile', icon: IconProfile },
        { id: 'payments', label: 'Payments', route: '/account/payments', icon: IconPayments },
        { id: 'organization', label: 'Organization', route: '/account/corporate', icon: IconOrganization }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      collapsible: true,
      items: [
        { id: 'preferences', label: 'Preferences', route: '/account/preferences', icon: IconPreferences },
        { id: 'notifications', label: 'Notifications', route: '/account/notifications', icon: IconNotifications }
      ]
    },
    {
      id: 'system',
      title: 'System',
      collapsible: true,
      items: [
        { id: 'privacy', label: 'Privacy', route: '/account/privacy', icon: IconPrivacy },
        { id: 'security', label: 'Security', route: '/account/security', icon: IconSecurity },
        { id: 'settings', label: 'Settings', route: '/account/settings', icon: IconAbout }
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      collapsible: true,
      items: [
        { id: 'privacy-policy', label: 'Privacy Policy', route: '/privacy', icon: IconPrivacyPolicy },
        { id: 'terms', label: 'Terms & Conditions', route: '/terms', icon: IconTerms },
        { id: 'return-policy', label: 'Return Policy', route: '/return-policy', icon: IconReturnPolicy },
        { id: 'cancellation-policy', label: 'Cancellation Policy', route: '/cancellation-policy', icon: IconCancellation }
      ]
    }
  ];

  // ─── Mobile Layout ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        className={cn("flex flex-col items-start relative w-full bg-transparent p-0 border-none", className)}
        style={{ ...style, boxShadow: 'none' }}
        data-name="SideNavAccount"
      >
        <div className="flex flex-col w-full" style={{ gap: '24px' }}>
          {navGroups.map((group) => (
            <div key={group.id} className="w-full">
              {/* Group Title */}
              <div
                className="flex items-center justify-between cursor-pointer"
                style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '8px' }}
                onClick={() => group.collapsible && toggleGroup(group.id)}
              >
                <h3 style={groupTitleStyle}>{group.title}</h3>
                {group.collapsible && (
                  <div
                    className="transition-transform duration-200"
                    style={{ transform: expandedGroups[group.id] ? 'rotate(0deg)' : 'rotate(180deg)' }}
                  >
                    <IconChevron color="var(--color-text-muted)" />
                  </div>
                )}
              </div>

              {/* Items */}
              {(expandedGroups[group.id] || !group.collapsible) && (
                <div className="settings-group flex flex-col w-full">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.route)}
                        className="settings-item w-full transition-colors active:bg-[var(--color-bg-muted)] group"
                      >
                        <div className="flex flex-row items-center justify-between w-full h-full">
                          <div className="flex items-center" style={{ gap: '12px' }}>
                            <div className="shrink-0 w-[24px] flex items-center justify-center">
                              <Icon color="var(--color-text-primary)" />
                            </div>
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: 'var(--font-weight-medium)' as any,
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-base)'
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Logout — danger style */}
          {onLogout && (
            <div className="w-full" style={{ marginTop: '8px' }}>
              <Separator style={{ backgroundColor: 'var(--color-border-default)', marginBottom: '16px' }} />
              <div className="settings-group">
                <button
                  onClick={onLogout}
                  className="settings-item w-full transition-colors active:bg-[rgba(239,68,68,0.08)] group"
                >
                  <div className="flex flex-row items-center justify-between w-full h-full">
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="shrink-0 w-[24px] flex items-center justify-center">
                        <IconLogOut color="var(--color-status-danger)" />
                      </div>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 'var(--font-weight-medium)' as any,
                          color: 'var(--color-status-danger)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        Log out
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-status-danger)' }} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Desktop Layout ─────────────────────────────────────────
  return (
    <div
      className={cn("flex flex-col items-start relative w-full bg-white border border-[var(--color-border-default)]", className)}
      style={{ ...style, boxShadow: 'none', padding: '12px' }}
      data-name="SideNavAccount"
    >
      <div className="flex flex-col w-full" style={{ gap: '12px' }}>
        {navGroups.map((group, index) => (
          <div key={group.id} className="w-full">
            {index > 0 && <Separator style={{ backgroundColor: 'var(--color-border-default)', marginBottom: '12px' }} />}

            {/* Group Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              style={{ padding: '0 4px', marginBottom: '6px' }}
              onClick={() => group.collapsible && toggleGroup(group.id)}
            >
              <h3 style={groupTitleStyle}>{group.title}</h3>
              {group.collapsible && (
                <div
                  className="transition-transform duration-200"
                  style={{ transform: expandedGroups[group.id] ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >
                  <IconChevron color="var(--color-text-muted)" />
                </div>
              )}
            </div>

            {/* Items */}
            {(expandedGroups[group.id] || !group.collapsible) && (
              <div className="flex flex-col w-full" style={{ gap: '4px' }}>
                {group.items.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.route)}
                      className={cn(
                        "relative w-full transition-all duration-200 flex items-center overflow-hidden",
                        isActive
                          ? "bg-[var(--color-primary-default)]"
                          : "bg-transparent hover:bg-[var(--color-bg-page)]"
                      )}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        height: '44px',
                        padding: '0 16px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div className="flex items-center" style={{ gap: '12px' }}>
                        <div className="shrink-0 w-[20px] flex items-center justify-center">
                          <Icon color={isActive ? "white" : "var(--color-text-primary)"} />
                        </div>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 'var(--font-weight-medium)' as any,
                            fontFamily: 'var(--font-family-base)',
                            color: isActive ? 'white' : 'var(--color-text-primary)',
                            lineHeight: '20px'
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Logout — danger */}
        {onLogout && (
          <div className="w-full">
            <Separator style={{ backgroundColor: 'var(--color-border-default)', marginBottom: '16px' }} />
            <button
              onClick={onLogout}
              className="relative w-full transition-all duration-200 flex items-center hover:bg-[rgba(239,68,68,0.06)]"
              style={{
                borderRadius: 'var(--radius-md)',
                height: '44px',
                padding: '0 16px',
                border: '1px solid var(--color-status-danger)',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div className="shrink-0 w-[20px] flex items-center justify-center">
                  <IconLogOut color="var(--color-status-danger)" />
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)' as any,
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-status-danger)',
                    lineHeight: '20px'
                  }}
                >
                  Log out
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}