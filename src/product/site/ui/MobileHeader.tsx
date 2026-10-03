/**
 * MobileHeader — the back button floated over a landing page's hero.
 *
 * The site copy of the app's contextual top bar. The app version also carries
 * a route → title table, a dashboard notification bell linking to `/account`
 * and a share button; none of those can render on the marketing site (it has
 * no dashboard, no account screen and never passed a share handler), so they
 * are not here.
 */
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

interface MobileHeaderProps {
  /** Page name, for the landmark label. */
  title?: string;
  onBack: () => void;
  className?: string;
}

export function MobileHeader({ title, onBack, className }: MobileHeaderProps) {
  /*
   * A div, not a <header>. `Navigation` already renders the page's banner
   * landmark; a second <header> gave the page two banner landmarks.
   */
  return (
    <div
      className={cn('flex items-center gap-2 w-full absolute top-0 left-0 z-10', className)}
      style={{
        backgroundColor: 'transparent',
        padding: 'var(--spacing-2) var(--spacing-3)',
        minHeight: '56px',
        fontFamily: 'var(--font-sans)',
      }}
      role="banner"
      aria-label={title ? `${title} page header` : 'Page header'}
    >
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
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          backdropFilter: 'blur(4px)',
        }}
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </Button>
      <div className="flex-1" />
    </div>
  );
}
