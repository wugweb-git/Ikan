import React, { useState } from 'react';
import { cn } from '../ui/utils';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';

export interface SideNavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ color?: string; size?: number | string; className?: string }>;
  onClick?: () => void;
  isActive?: boolean;
  route?: string; // Optional: for identification or routing
}

export interface SideNavGroup {
  id: string;
  title?: string;
  items: SideNavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SideNavProps {
  groups: SideNavGroup[];
  className?: string;
  style?: React.CSSProperties;
  onLogout?: () => void;
  logoutLabel?: string;
}

export function SideNav({ 
  groups, 
  className,
  style,
  onLogout,
  logoutLabel = "Log out"
}: SideNavProps) {
  
  // Initialize expanded state based on defaultExpanded prop
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach(group => {
      initial[group.id] = group.defaultExpanded !== false; // Default to true if not specified
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

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
        {groups.map((group) => (
          <div key={group.id} className="w-full">
            {/* Group Header */}
            {group.title && (
              <div 
                className={cn(
                  "px-[20px] py-[8px] flex items-center justify-between",
                  group.collapsible ? "cursor-pointer select-none" : ""
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
            )}

            {/* Group Items */}
            {(expandedGroups[group.id] || !group.collapsible) && (
              <div className={cn("flex flex-col gap-[8px]", group.title ? "mt-1" : "")}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isActive;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={cn(
                        "relative rounded-[8px] w-full transition-all duration-200",
                        isActive ? "bg-[#2e2a2f]" : "bg-white border border-[#f5f5f5] hover:bg-gray-50"
                      )}
                    >
                      <div className="flex flex-row items-center w-full">
                        <div className="flex gap-[8px] items-center px-[20px] py-[10px] w-full">
                          {Icon && (
                            <div className="shrink-0 w-[18px] flex items-center justify-center">
                              <Icon 
                                color={isActive ? "white" : "black"} 
                                size={18}
                                className={isActive ? "text-white" : "text-black"}
                              />
                            </div>
                          )}
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
                    <LogOut size={18} className="text-black group-hover:text-red-600" />
                  </div>
                  <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#151515] group-hover:text-red-600 text-[14px] text-nowrap font-medium font-['Inter']">
                    <p className="leading-[28px]">{logoutLabel}</p>
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
