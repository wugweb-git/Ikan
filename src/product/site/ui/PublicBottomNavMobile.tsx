import { useState, useRef, useEffect } from 'react';
import { Menu, X, LogIn, MessageCircle } from 'lucide-react';
import { cn } from './utils';
import { AnimatePresence, motion } from 'framer-motion';
import { NavBadge } from './NavBadge';
import { NavIcon } from './NavIcon';
import { SiteLink } from './SiteLink';
import { APP_LOGIN_URL } from '../content/app-origin';
import { MENU, MENU_TALK, type MenuLink } from '../../../shared/navigation/menu';

/**
 * The public mobile bar: the brand and one menu button, nothing else.
 *
 * Rebuilt on iKAN 2's tokens and type roles. Everything here used to be inline
 * style objects on the PREVIOUS token set — `--card`,
 * `--border`, `--ikan-component-border-radius`, `--text-sm`,
 * `--spacing-2` — so the bar sat on a different design system from the page
 * under it. Grounds are `--card` and `--secondary`, edges are `--border`, the
 * radius comes from `--radius`, and every string takes a `type-*` role.
 *
 * The roles only work because the root carries `ikan2-theme`. Without it the
 * class is inert: `type-subhead` on the wordmark was rendering at the
 * inherited 16px/400 rather than 18px/600, which is what made the brand change
 * size between this bar and the desktop capsule.
 */

interface PublicBottomNavMobileProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
}

export function PublicBottomNavMobile({ currentRoute, onNavigate, className }: PublicBottomNavMobileProps) {
  // Both sections come from content/nav.ts, shared with the footer and sitemap.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
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

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);

  const renderItem = (item: MenuLink) => {
    const isActive = currentRoute === item.to;
    return (
      <SiteLink
        key={item.to}
        to={item.to}
        onNavigate={onNavigate}
        onClick={() => setIsMenuOpen(false)}
        className={cn('mnav__item', 'type-label-lg', isActive && 'is-active')}
        aria-current={isActive ? 'page' : undefined}
      >
        <NavIcon name={item.icon} size={18} />
        {item.label}
        <NavBadge label={item.badge} size="xs" />
      </SiteLink>
    );
  };

  return (
    <nav className={cn('ikan2-theme', 'mnav', className)} aria-label="Public navigation" ref={menuRef}>
      <div className="mnav__bar">
        <SiteLink to="/" onNavigate={onNavigate} aria-label="iKAN home" className="mnav__brand">
          <img src="/favicon.svg" alt="" width={40} height={40} />
          <span className="type-subhead">iKAN</span>
        </SiteLink>

        <button
          type="button"
          className="mnav__toggle"
          onClick={handleMenuToggle}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mnav__menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* One flat list, no group headings. "Menu" over a menu says
                nothing, and "More" ended up sitting over a single item. Four
                links do not need to be filed into sections. */}
            {MENU.map(renderItem)}

            {/* The same two actions the desktop bar carries. Contact Us is not
                in the list above because this button goes to the same place. */}
            <div className="mnav__actions">
              <SiteLink
                to={MENU_TALK.to}
                onNavigate={onNavigate}
                onClick={() => setIsMenuOpen(false)}
                className="mnav__talk type-label-lg"
              >
                <MessageCircle aria-hidden="true" />
                {MENU_TALK.label}
              </SiteLink>

              <a href={APP_LOGIN_URL} className="mnav__signin type-label-lg">
                <LogIn aria-hidden="true" />
                Sign in
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
