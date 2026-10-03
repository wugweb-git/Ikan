import React, { useState } from 'react';
import { cn } from '../ui/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
        "flex flex-col items-start relative w-full",
        className
      )} 
      style={style}
      data-name="Side Navigation"
    >
      <div className="flex flex-col w-full">
        {groups.map((group) => (
          <div key={group.id} className="w-full mb-2">
            {/* Group Header */}
            {group.title && (
              <div 
                className={cn(
                  "px-6 py-3 flex items-center justify-between",
                  group.collapsible ? "cursor-pointer select-none" : ""
                )}
                onClick={() => group.collapsible && toggleGroup(group.id)}
              >
                <h3 className="text-[11px] font-medium text-[var(--grey-5)] uppercase tracking-wider">
                  {group.title}
                </h3>
                {group.collapsible && (
                  <div className="text-[var(--grey-5)]">
                    {expandedGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                )}
              </div>
            )}

            {/* Group Items */}
            {(expandedGroups[group.id] || !group.collapsible) && (
              <div className="flex flex-col">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isActive;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={cn(
                        "relative w-[calc(100%-32px)] mx-4 text-left transition-all duration-200 group rounded-lg mb-1",
                        isActive 
                          ? "bg-[var(--grey-3)] text-[var(--grey-9)] shadow-sm" 
                          : "bg-transparent text-[var(--grey-9)] hover:bg-[var(--grey-2)] hover:text-[var(--grey-9)]"
                      )}
                    >
                      <div className="flex flex-row items-center w-full px-3 py-2.5">
                        {Icon && (
                          <div className="shrink-0 w-5 h-5 flex items-center justify-center mr-3">
                            <Icon 
                              size={18}
                              className={isActive ? "text-[var(--grey-9)]" : "text-[var(--grey-6)] group-hover:text-[var(--grey-9)]"}
                            />
                          </div>
                        )}
                        <span className={cn(
                          "text-base",
                          isActive ? "font-medium text-[var(--grey-9)]" : "font-normal text-[var(--grey-9)]"
                        )}>
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
      </div>
    </div>
  );
}