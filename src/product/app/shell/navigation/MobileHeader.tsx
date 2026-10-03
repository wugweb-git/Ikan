/**
 * MobileHeader - Contextual top bar for private mobile screens.
 * Shows back button + page title. Follows iKan design tokens.
 * Hidden on desktop (Navigation.tsx capsule handles that).
 */
import { ArrowLeft, Share2, Bell } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';

// ─── Route → Title mapping ──────────────────────────────────
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Home',
  '/mood-journal': 'Mood Journal',
  '/assessment': 'Assessments',
  '/assessment-landing': 'Assessment Details',
  '/assessment-detail': 'Assessment Details',
  '/assessment-flow': 'Assessment',
  '/assessment-results': 'Results',
  '/equip': 'Programs',
  '/equip-programs-landing': 'Programs',
  '/equip-detail': 'Program Details',
  '/equip-program-onboarding': 'Get Started',
  '/equip-program-flow': 'Today\'s Session',
  '/equip-program-completion': 'Congratulations',
  '/consultation': 'Consultation',
  '/consultation-detail': 'Consultant',
  '/resource': 'Library',
  '/resource-detail': 'Article',
  '/account': 'Account',
  '/about': 'About Us',
  '/faq': 'FAQs',
  '/privacy': 'Privacy Policy',
  '/privacy-policy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/contact': 'Contact Us',
  '/return-policy': 'Return Policy',
  '/cancellation-policy': 'Cancellation Policy',
  '/sitemap': 'Sitemap',
  '/payment-history': 'Payment History',
  '/learning-diary': 'Learning Diary',
};

// Routes where we DON'T show a back button (top-level tabs)
const TOP_LEVEL_ROUTES = new Set(['/dashboard']);

// Routes where we show the header transparent (hero pages)
const TRANSPARENT_ROUTES = new Set([
  '/assessment-detail',
  '/equip-detail',
  '/consultation-detail',
  '/resource-detail',
]);

interface MobileHeaderProps {
  currentRoute: string;
  onBack: () => void;
  onNavigate?: (route: string) => void;
  title?: string; // override route-based title
  transparent?: boolean; // override route-based transparency
  showShare?: boolean;
  onShare?: () => void;
  className?: string;
}

export function MobileHeader({
  currentRoute,
  onBack,
  onNavigate,
  title,
  transparent,
  showShare = false,
  onShare,
  className,
}: MobileHeaderProps) {
  const resolvedTitle = title || ROUTE_TITLES[currentRoute] || '';
  const isTransparent = transparent ?? TRANSPARENT_ROUTES.has(currentRoute);
  const isTopLevel = TOP_LEVEL_ROUTES.has(currentRoute);

  /*
   * A div, not a <header>. `Navigation` already renders the page's banner
   * landmark; this is an in-page bar nested inside it, so a second <header>
   * gave the page two banner landmarks and a screen-reader user two "header"
   * destinations for one page. Presentation is unchanged.
   */
  return (
    <div
      className={cn(
        'flex items-center gap-2 w-full',
        isTransparent ? 'absolute top-0 left-0 z-10' : 'sticky top-0 z-10',
        className
      )}
      style={{
        backgroundColor: isTransparent ? 'transparent' : 'var(--color-bg-card)',
        borderBottom: isTransparent ? 'none' : '1px solid var(--color-border-default)',
        padding: 'var(--spacing-2) var(--spacing-3)',
        minHeight: '56px',
        fontFamily: 'var(--font-family-base)',
      }}
      role="banner"
      aria-label={resolvedTitle ? `${resolvedTitle} page header` : 'Page header'}
    >
      {/* Back Button */}
      {!isTopLevel && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Go back to previous page"
          className="shrink-0"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            color: isTransparent ? 'white' : 'var(--color-text-primary)',
            backdropFilter: isTransparent ? 'blur(4px)' : 'none',
          }}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Button>
      )}

      {/* Title */}
      {!isTransparent && resolvedTitle && (
        <h1
          className="flex-1 truncate"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-sm)',
            margin: 0,
            padding: 0,
          }}
        >
          {resolvedTitle}
        </h1>
      )}

      {/* Spacer for transparent mode */}
      {isTransparent && <div className="flex-1" />}

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Notifications bell on dashboard */}
        {isTopLevel && onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('/account')}
            aria-label="Account and notifications"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
          </Button>
        )}

        {/* Share button */}
        {showShare && onShare && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            aria-label="Share this page"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: isTransparent ? 'white' : 'var(--color-text-primary)',
              backdropFilter: isTransparent ? 'blur(4px)' : 'none',
            }}
          >
            <Share2 className="w-5 h-5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

export { ROUTE_TITLES };