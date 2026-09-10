import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Smile, ClipboardCheck, LayoutGrid, Menu, X, LogOut, ChevronRight,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';
import { preloadMoodJournal } from '../../lib/lazy-with-retry';
import { useAuth } from '../../contexts/AuthContext';

/** The More tab is a sheet, not a route. A sentinel keeps it out of the router. */
const MORE = '__more__';

/**
 * WHAT MORE HOLDS — every route the five tabs do not.
 *
 * Grouped, because a flat list of fourteen is a list nobody reads. The groups
 * are the questions a person actually arrives with: what have I recorded, what
 * else is here, my account, who are you, and the legal pages.
 */
const MORE_GROUPS: { title: string; items: { label: string; route: string; note?: string }[] }[] = [
  {
    title: 'Your data',
    items: [
      { label: 'Wellness timeline', route: '/timeline' },
      { label: 'Assessment history', route: '/assessment-history-detail' },
      { label: 'Learning diary', route: '/learning-diary' },
      { label: 'Mood journal', route: '/mood-journal' },
    ],
  },
  {
    title: 'Explore',
    items: [
      { label: 'Resources', route: '/resource' },
      { label: 'Consultation', route: '/consultation', note: 'Coming soon' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile and settings', route: '/account' },
      { label: 'Notifications', route: '/account?section=notifications' },
    ],
  },
  {
    title: 'About iKan',
    items: [
      { label: 'About', route: '/about' },
      { label: 'FAQ', route: '/faq' },
      { label: 'Contact', route: '/contact' },
      { label: 'Sitemap', route: '/sitemap' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Terms of service', route: '/terms' },
      { label: 'Privacy policy', route: '/privacy-policy' },
      { label: 'Cancellation policy', route: '/cancellation-policy' },
      { label: 'Refund policy', route: '/return-policy' },
    ],
  },
];

/** Routes that light the More tab, so it reflects where you are. */
const MORE_ROUTES = MORE_GROUPS.flatMap(g => g.items.map(i => i.route.split('?')[0]))
  .filter(r => r !== '/mood-journal');

interface BottomNavBarMobileProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
  notificationBadges?: { [route: string]: number };
}

export function BottomNavBarMobile({ 
  currentRoute, 
  onNavigate, 
  className, 
  notificationBadges = {} 
}: BottomNavBarMobileProps) {
  const { triggerHapticFeedback } = useMobileOptimizations();
  const { signOut } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Scroll direction detection — hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        // Only react after a meaningful scroll (threshold 8px)
        if (Math.abs(delta) > 8) {
          if (delta > 0 && currentY > 80) {
            // Scrolling down & past threshold
            setIsVisible(false);
          } else {
            // Scrolling up
            setIsVisible(true);
          }
          lastScrollY.current = currentY;
        }

        // Always show when at top
        if (currentY <= 10) {
          setIsVisible(true);
        }

        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /*
    THE FIVE.

    It was Home / Journal / Explore[beta] / Consult[coming soon] / Profile, which
    gave a permanent tab to a screen labelled "coming soon" and **no tab at all
    to Assessments** — seven instruments, the scoring engine and the
    recommendation engine, reachable only through Explore.

    Programs and Assess are the two things the product does. Everything else —
    consultation, resources, timeline, settings, legal — lives behind More, which
    is a sheet rather than a sixth tab because a thumb-zone bar with six targets
    is a bar with six small targets.

    No badges. "beta" and "coming soon" on a permanent tab are decoration that
    never changes; a state that never changes is not worth the pixels.
  */
  const navItems = [
    { label: 'Home', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Programs', route: '/equip', icon: LayoutGrid },
    { label: 'Assess', route: '/assessment', icon: ClipboardCheck },
    { label: 'Journal', route: '/mood-journal', icon: Smile },
    { label: 'More', route: MORE, icon: Menu },
  ];

  const handleTabPress = (route: string) => {
    triggerHapticFeedback('light');
    if (route === MORE) {
      setMoreOpen(true);
      return;
    }
    onNavigate(route);
  };

  // Preload heavy chunks when user shows intent (hover/touch)
  const handlePreload = (route: string) => {
    if (route === '/mood-journal') {
      preloadMoodJournal();
    }
  };

  return (
    <>
    <div 
      className={cn(
        "mobile-nav",
        className
      )}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 16,
        right: 16,
        height: 64,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: 'calc(100% - 32px)',
        transform: isVisible ? 'translateY(0)' : 'translateY(calc(100% + 30px))',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        willChange: 'transform',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-full w-full">
        {navItems.map((item) => {
          // Check if current route starts with item route (for nested pages)
          // Exception for Dashboard which matches exactly or root
          /* Programs and Assess own their own prefixes now that both have a
             tab — `/equip` used to claim `/assessment` as well, because there
             was nowhere else for it to light up. */
          const isActive = item.route === MORE
            ? moreOpen || MORE_ROUTES.some(r => currentRoute.startsWith(r))
            : item.route === '/dashboard'
            ? (currentRoute === '/dashboard' || currentRoute === '/')
            : currentRoute.startsWith(item.route);
            
          const Icon = item.icon;
          const badgeCount = notificationBadges[item.route] || 0;
          
          return (
            <button
              key={item.route}
              onClick={() => handleTabPress(item.route)}
              onTouchStart={() => handlePreload(item.route)}
              onMouseEnter={() => handlePreload(item.route)}
              aria-label={`${item.label}${badgeCount > 0 ? `, ${badgeCount} notifications` : ''}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 active:opacity-70 transition-opacity",
                "touch-manipulation"
              )}
              style={{ minHeight: 'var(--ikan-touch-target-min)' }}
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                />
                
                {/* Badge */}
                {badgeCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-2 text-white text-[10px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--color-status-danger)',
                      border: '2px solid var(--color-bg-card)',
                    }}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </div>
                )}

                {/* The "beta" / "coming soon" text badge was here. Removed with
                    the tabs that carried it: a permanent label that never
                    changes is decoration, and "coming soon" on a tab you can
                    press is a promise the screen does not keep. */}
              </div>
              
              <span 
                className="text-[10px] leading-none"
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>

    {/* MORE — a full-height sheet, not a sixth tab. */}
    {moreOpen && (
      <div
        className="fixed inset-0"
        style={{ zIndex: 1100 }}
        role="dialog"
        aria-modal="true"
        aria-label="More"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col"
          style={{
            maxHeight: '92vh',
            backgroundColor: 'var(--color-bg-card)',
            borderTopLeftRadius: 'var(--radius-lg)',
            borderTopRightRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            className="flex items-center justify-between shrink-0"
            style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-default)' }}
          >
            <span style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500, fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
              More
            </span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Close"
              className="flex items-center justify-center"
              style={{ minWidth: 'var(--ikan-touch-target-min)', minHeight: 'var(--ikan-touch-target-min)', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ padding: '8px 12px 24px' }}>
            {MORE_GROUPS.map(group => (
              <div key={group.title} style={{ marginTop: 12 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-family-base)', fontWeight: 500,
                    fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--color-text-muted)', margin: '0 0 4px', padding: '0 8px',
                  }}
                >
                  {group.title}
                </p>
                {group.items.map(item => (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => { setMoreOpen(false); triggerHapticFeedback('light'); onNavigate(item.route); }}
                    className="w-full flex items-center justify-between"
                    style={{
                      minHeight: 'var(--ikan-touch-target-min)',
                      padding: '12px 8px',
                      background: 'none', border: 'none', textAlign: 'left',
                      fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <span>
                      {item.label}
                      {item.note && (
                        <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {item.note}
                        </span>
                      )}
                    </span>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                ))}
              </div>
            ))}

            <button
              type="button"
              onClick={async () => { setMoreOpen(false); await signOut(); }}
              className="w-full flex items-center gap-2"
              style={{
                minHeight: 'var(--ikan-touch-target-min)',
                marginTop: 20, padding: '12px 8px',
                background: 'none', border: 'none', textAlign: 'left',
                fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)',
                color: 'var(--color-status-danger)',
              }}
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}