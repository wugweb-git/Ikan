import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash' | 'arrow';
  className?: string;
}

export function Breadcrumbs({ 
  items, 
  separator = 'chevron',
  className 
}: BreadcrumbsProps) {
  const getSeparatorIcon = () => {
    switch (separator) {
      case 'arrow':
        return 'arrowRight';
      case 'slash':
        return null; // Will render text separator
      case 'chevron':
      default:
        return 'chevronRight';
    }
  };

  const separatorIcon = getSeparatorIcon();

  if (items.length === 0) return null;

  return (
    <motion.nav 
      className={cn("flex items-center space-x-1", className)}
      style={{
        minWidth: 'var(--constraint-component-min)',
        maxWidth: 'var(--constraint-content-max)'
      }}
      aria-label="Breadcrumb navigation"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <ol className="flex items-center space-x-1" style={{ gap: 'var(--spacing-1)' }}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast;
          
            return (
              <motion.li 
                key={`${index}-${item.label}`} 
                className="flex items-center"
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.9 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                layout
              >
                {/* Breadcrumb Item */}
                {item.href || item.onClick ? (
                  <motion.button
                    onClick={item.onClick}
                    className={cn(
                      "rounded-sm px-1 py-0.5",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      !isCurrent && "hover:underline"
                    )}
                    style={{
                      fontSize: 'var(--text-sm)',
                      backgroundColor: 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    initial={false}
                    animate={{
                      color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      fontWeight: isCurrent ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'
                    }}
                    whileHover={!isCurrent ? {
                      backgroundColor: 'var(--color-bg-muted)',
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    } : {}}
                    whileTap={!isCurrent ? {
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    } : {}}
                    transition={{ duration: 0.2 }}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {item.label}
                  </motion.button>
                ) : (
                  <motion.span
                    className="px-1 py-0.5"
                    style={{
                      fontSize: 'var(--text-sm)'
                    }}
                    initial={false}
                    animate={{
                      color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      fontWeight: isCurrent ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'
                    }}
                    transition={{ duration: 0.2 }}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Separator */}
                {!isLast && (
                  <motion.div 
                    className="flex items-center mx-1"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: (index * 0.05) + 0.1,
                      ease: "easeOut"
                    }}
                  >
                    {separatorIcon ? (
                      <motion.div
                        animate={{ 
                          x: [0, 2, 0],
                          transition: { 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }
                        }}
                      >
                        <Icon 
                          name={separatorIcon} 
                          size={14}
                          variant="outline"
                          style={{ 
                            color: 'var(--color-text-muted)',
                            margin: '0 var(--spacing-1)'
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.span 
                        style={{ 
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-muted)',
                          margin: '0 var(--spacing-1)'
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          transition: { 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }
                        }}
                      >
                        /
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </motion.li>
          );
          })}
        </AnimatePresence>
      </ol>
    </motion.nav>
  );
}

// Utility function to generate breadcrumbs from route
export function generateBreadcrumbs(
  route: string, 
  customLabels?: { [key: string]: string },
  onNavigate?: (route: string) => void
): BreadcrumbItem[] {
  const segments = route.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({
    label: 'Home',
    href: '/dashboard',
    onClick: () => onNavigate?.('/dashboard')
  });

  // Build breadcrumbs for each segment
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Use custom label if provided, otherwise format segment
    const label = customLabels?.[segment] || 
                  segment.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');

    breadcrumbs.push({
      label,
      href: currentPath,
      onClick: () => onNavigate?.(currentPath),
      current: isLast
    });
  });

  return breadcrumbs;
}

// Pre-configured breadcrumbs for common iKan routes
export const ikanRouteLabels = {
  'dashboard': 'Dashboard',
  'assessments': 'Assessments',
  'equip-programs': 'Programs',
  'library': 'Library',
  'consultation': 'Consultation',
  'account': 'Account',
  'profile': 'Profile',
  'settings': 'Settings',
  'privacy': 'Privacy',
  'notifications': 'Notifications',
  'security': 'Security'
};

export default Breadcrumbs;