import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Icon } from './Icon';
import { cn } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicBottomNavMobileProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onSignIn: () => void;
  className?: string;
}

export function PublicBottomNavMobile({ currentRoute, onNavigate, onSignIn, className }: PublicBottomNavMobileProps) {
  // Fixed navigation items for mobile (showing 4 most important)
  const publicNavItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/assessment', label: 'Assessments', icon: 'assignment' },
    { path: '/equip', label: 'Equip', icon: 'tools', badge: 'beta' },
    { path: '/resource', label: 'Resource', icon: 'library' }
  ];

  // Additional navigation items for dropdown menu
  const additionalNavItems = [
    { path: '/about', label: 'About Us', icon: 'info' },
    { path: '/faq', label: 'FAQ', icon: 'help-circle' },
    { path: '/contact', label: 'Contact', icon: 'phone' },
    { path: '/privacy', label: 'Privacy', icon: 'shield' },
    { path: '/terms', label: 'Terms', icon: 'file-text' }
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (path: string) => {
    onNavigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav 
      className={cn("w-full", className)}
      aria-label="Public navigation"
      style={{
        backgroundColor: 'transparent',
        padding: 'var(--spacing-2)',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '9999'
      }}
    >
      {/* Mobile Header Container */}
      <div 
        className="w-full rounded-lg"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex items-center justify-between p-4">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-2 cursor-pointer touch-target"
            onClick={() => onNavigate('/')}
            style={{ minHeight: 'var(--ikan-touch-target-min)' }}
          >
            <div 
              className="relative shrink-0"
              style={{ 
                width: '60px', 
                height: '30px' 
              }}
            >
              <svg 
                className="block size-full" 
                fill="none" 
                preserveAspectRatio="none" 
                viewBox="0 0 80 40"
                style={{ 
                  color: 'var(--color-primary-default)',
                  fill: 'var(--color-primary-default)'
                }}
              >
                <g>
                  <path d="M72.2544 25.8333V16.9333H74.2034L74.2874 19.4333L74.0354 19.3333C74.125 18.7111 74.3098 18.2111 74.5898 17.8333C74.8699 17.4556 75.2115 17.1778 75.6147 17C76.018 16.8222 76.4604 16.7333 76.9421 16.7333C77.6029 16.7333 78.1574 16.8778 78.6055 17.1667C79.0647 17.4556 79.4119 17.8556 79.6472 18.3667C79.8824 18.8667 80 19.45 80 20.1167V25.8333H77.8494V20.8C77.8494 20.3 77.799 19.8778 77.6982 19.5333C77.5973 19.1889 77.4293 18.9278 77.1941 18.75C76.9701 18.5611 76.6677 18.4667 76.2868 18.4667C75.7156 18.4667 75.2563 18.6667 74.9091 19.0667C74.573 19.4667 74.405 20.0444 74.405 20.8V25.8333H72.2544Z" fill="currentColor" />
                  <path d="M51.7812 25.8333V14H53.9654V19.4L58.6363 14H61.2238L56.7545 19.2L61.5094 25.8333H59.0059L55.3095 20.6833L53.9654 22.2V25.8333H51.7812Z" fill="currentColor" />
                  <path d="M18.8337 33.8245H21.2286V23.2405L28.9673 30.5801L30.5985 28.9638L23.1878 21.295H33.7492C34.195 20.9618 34.1329 20.2003 34.087 19.6629C34.069 19.4625 34.103 19.2563 34.041 19.06L33.7492 18.701H23.1878L30.5985 11.0322L28.9673 9.41593L21.2286 16.7556V6.17551H18.8337V13.3049C18.3659 13.0074 18.158 12.2301 17.9261 11.7223C17.2004 10.1339 16.5547 8.48386 15.995 6.83193L13.614 7.81159L16.2188 14.3857L11.1031 9.42193C10.8112 9.87014 9.28389 10.8161 9.56581 11.3594L14.4777 16.3272L7.83257 13.5409L6.87297 15.7561L13.3881 18.705H6.20127V21.297H13.3881L6.87297 24.2459L7.83257 26.4611L14.4777 23.6748L9.56581 28.6425C9.28195 29.1859 10.8112 30.1319 11.1031 30.5801L16.2188 25.6163L13.614 32.1904L15.995 33.1701C16.5547 31.5161 17.2004 29.8681 17.9261 28.2797C18.158 27.7719 18.3659 26.9926 18.8337 26.6971V33.8265V33.8245ZM0 20C0 8.95386 9.02804 0 20.1631 0C31.2982 0 40.3242 8.95386 40.3242 20C40.3242 31.0461 31.2982 40 20.1631 40C9.02804 40 0.00199955 31.0461 0.00199955 20H0Z" fill="currentColor" />
                  <path d="M65.1451 26.0333C64.2042 26.0333 63.4482 25.8222 62.8769 25.4C62.3056 24.9667 62.02 24.3667 62.02 23.6C62.02 22.8333 62.2608 22.2333 62.7425 21.8C63.2241 21.3667 63.9578 21.0556 64.9435 20.8667L67.9174 20.2833C67.9174 19.65 67.7718 19.1778 67.4806 18.8667C67.1893 18.5444 66.7581 18.3833 66.1868 18.3833C65.6716 18.3833 65.2627 18.5056 64.9603 18.75C64.6691 18.9833 64.4675 19.3222 64.3555 19.7667L62.1712 19.6667C62.3504 18.7222 62.7873 18 63.4818 17.5C64.1762 16.9889 65.0779 16.7333 66.1868 16.7333C67.4638 16.7333 68.4271 17.0556 69.0768 17.7C69.7376 18.3333 70.0681 19.2444 70.0681 20.4333V23.6667C70.0681 23.9 70.1073 24.0611 70.1857 24.15C70.2753 24.2389 70.4041 24.2833 70.5721 24.2833H70.8577V25.8333C70.7905 25.8556 70.6785 25.8722 70.5217 25.8833C70.3761 25.8944 70.2249 25.9 70.0681 25.9C69.6984 25.9 69.368 25.8444 69.0768 25.7333C68.7855 25.6111 68.5615 25.4056 68.4047 25.1167C68.2479 24.8167 68.1695 24.4111 68.1695 23.9L68.3543 24.0333C68.2647 24.4222 68.0686 24.7722 67.7662 25.0833C67.475 25.3833 67.1053 25.6167 66.6573 25.7833C66.2092 25.95 65.7052 26.0333 65.1451 26.0333ZM65.582 24.4833C66.0636 24.4833 66.4781 24.3889 66.8253 24.2C67.1726 24.0111 67.4414 23.75 67.6318 23.4167C67.8222 23.0833 67.9174 22.6889 67.9174 22.2333V21.7333L65.5988 22.2C65.1171 22.3 64.7699 22.45 64.5571 22.65C64.3554 22.8389 64.2546 23.0889 64.2546 23.4C64.2546 23.7444 64.3667 24.0111 64.5907 24.2C64.8259 24.3889 65.1563 24.4833 65.582 24.4833Z" fill="currentColor" />
                  <path d="M47.101 25.8333V16.9333H49.2516V25.8333H47.101ZM47.0674 15.75V13.85H49.302V15.75H47.0674Z" fill="currentColor" />
                </g>
              </svg>
            </div>
            <span 
              className="font-medium hidden sm:block"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-sm)'
              }}
            >
              iKan
            </span>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                className="relative p-2"
                style={{
                  backgroundColor: isMenuOpen 
                    ? 'var(--color-primary-default)' 
                    : 'var(--color-accent-default)',
                  borderRadius: 'var(--ikan-component-border-radius)',
                  minHeight: 'var(--ikan-touch-target-min)',
                  minWidth: 'var(--ikan-touch-target-min)',
                  transition: 'all var(--ikan-animation-fast) ease'
                }}
                onClick={handleMenuToggle}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
              >
                <motion.div 
                  className="relative shrink-0"
                  style={{ width: '14px', height: '14px' }}
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? (
                    <Icon 
                      name="x" 
                      size={14}
                      variant="outline"
                      style={{ 
                        color: 'var(--color-primary-on)',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  ) : (
                    <svg 
                      className="block size-full" 
                      fill="none" 
                      preserveAspectRatio="none" 
                      viewBox="0 0 14 14"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <path 
                        clipRule="evenodd" 
                        d="M13.2222 2.98148C13.2222 2.62352 12.932 2.33333 12.5741 2.33333H2.2037C1.84573 2.33333 1.55556 2.62352 1.55556 2.98148C1.55556 3.33944 1.84573 3.62963 2.2037 3.62963H12.5741C12.932 3.62963 13.2222 3.33944 13.2222 2.98148ZM13.2222 6.87037C13.2222 6.5124 12.932 6.22222 12.5741 6.22222H6.09259C5.73462 6.22222 5.44444 6.5124 5.44444 6.87037C5.44444 7.22834 5.73462 7.51852 6.09259 7.51852H12.5741C12.932 7.51852 13.2222 7.22834 13.2222 6.87037ZM13.2222 10.7593C13.2222 10.4013 12.932 10.1111 12.5741 10.1111H9.33333C8.97537 10.1111 8.68519 10.4013 8.68519 10.7593C8.68519 11.1172 8.97537 11.4074 9.33333 11.4074H12.5741C12.932 11.4074 13.2222 11.1172 13.2222 10.7593Z" 
                        fill="currentColor" 
                        fillRule="evenodd" 
                      />
                    </svg>
                  )}
                </motion.div>
              </Button>

              {/* Mobile Navigation Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed left-4 right-4 top-24 z-50 flex flex-col"
                    style={{
                      maxHeight: 'calc(100vh - 120px)',
                      overflowY: 'auto',
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-default)',
                      boxShadow: 'var(--shadow-xl)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)'
                    }}
                  >
                    <div className="p-2">
                      {/* Primary Navigation Section */}
                      <div className="mb-2">
                        <div 
                          className="px-3 py-2 text-xs font-medium"
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-weight-medium)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--letter-spacing-wide)'
                          }}
                        >
                          Main Menu
                        </div>
                        {publicNavItems.map((item) => {
                          const isActive = currentRoute === item.path;
                          return (
                            <motion.button
                              key={item.path}
                              whileHover={{ backgroundColor: 'var(--color-accent-default)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleMenuItemClick(item.path)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                              style={{
                                backgroundColor: isActive 
                                  ? 'var(--color-primary-default)' 
                                  : 'transparent',
                                color: isActive 
                                  ? 'var(--color-primary-on)' 
                                  : 'var(--color-text-primary)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                textAlign: 'left'
                              }}
                            >
                              <Icon 
                                name={item.icon as any} 
                                size={16}
                                variant={isActive ? 'filled' : 'roundedOutline'}
                                style={{
                                  color: isActive 
                                    ? 'var(--color-primary-on)' 
                                    : 'var(--color-text-muted)'
                                }}
                              />
                              {item.label}
                              {(item as any).badge && (
                                <span
                                  className="uppercase"
                                  style={{
                                    fontSize: '7px', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1,
                                    padding: '1px 3px', borderRadius: '3px', marginLeft: '3px', color: 'var(--grey-0)',
                                    backgroundColor: 'var(--color-primary-default, #6941C6)',
                                  }}
                                >
                                  {(item as any).badge}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Divider */}
                      <div 
                        className="h-px mx-2 my-2"
                        style={{ backgroundColor: 'var(--color-border-light)' }}
                      />

                      {/* Additional Navigation Section */}
                      <div className="mb-2">
                        <div 
                          className="px-3 py-2 text-xs font-medium"
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-weight-medium)',
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--letter-spacing-wide)'
                          }}
                        >
                          More
                        </div>
                        {additionalNavItems.map((item) => {
                          const isActive = currentRoute === item.path;
                          return (
                            <motion.button
                              key={item.path}
                              whileHover={{ backgroundColor: 'var(--color-accent-default)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleMenuItemClick(item.path)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                              style={{
                                backgroundColor: isActive 
                                  ? 'var(--color-primary-default)' 
                                  : 'transparent',
                                color: isActive 
                                  ? 'var(--color-primary-on)' 
                                  : 'var(--color-text-primary)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-regular)',
                                textAlign: 'left'
                              }}
                            >
                              <Icon 
                                name={item.icon as any} 
                                size={16}
                                variant="roundedOutline"
                                style={{
                                  color: isActive 
                                    ? 'var(--color-primary-on)' 
                                    : 'var(--color-text-muted)'
                                }}
                              />
                              {item.label}
                              {(item as any).badge && (
                                <span
                                  className="uppercase"
                                  style={{
                                    fontSize: '7px', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1,
                                    padding: '1px 3px', borderRadius: '3px', marginLeft: '3px', color: 'var(--grey-0)',
                                    backgroundColor: 'var(--color-primary-default, #6941C6)',
                                  }}
                                >
                                  {(item as any).badge}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Divider */}
                      <div 
                        className="h-px mx-2 my-2"
                        style={{ backgroundColor: 'var(--color-border-light)' }}
                      />

                      {/* Sign In Action */}
                      <motion.button
                        whileHover={{ backgroundColor: 'var(--color-primary-default)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onSignIn();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors"
                        style={{
                          backgroundColor: 'var(--color-accent-default)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          textAlign: 'left'
                        }}
                      >
                        <Icon 
                          name="account" 
                          size={16}
                          variant="roundedOutline"
                          style={{ color: 'var(--color-primary-default)' }}
                        />
                        Sign In
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={onSignIn}
              className="gap-2 ml-2"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                height: 'var(--ikan-component-button-height)',
                padding: '0 var(--ikan-component-spacing-default)',
                transition: 'all var(--ikan-animation-fast) ease',
                minHeight: 'var(--ikan-touch-target-min)'
              }}
            >
              <Icon 
                name="account" 
                size={16}
                variant="roundedOutline"
                style={{ color: 'var(--color-primary-on)' }}
              />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </div>
        </div>


      </div>
    </nav>
  );
}