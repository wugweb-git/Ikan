import type React from 'react';

/**
 * The one link the marketing site renders.
 *
 * Always a real `<a href>`, so open-in-new-tab, middle-click, copy-link and
 * keyboard focus work everywhere. An internal route (starts with `/`) is
 * handed to `onNavigate` on a plain left click, keeping the SPA transition; a
 * modified click falls through to the browser. Anything else — the member
 * app's sign-in, `mailto:`, `tel:`, another site — is a plain full-page link.
 */
export function isInternalRoute(to: string): boolean {
  return to.startsWith('/') && !to.startsWith('//');
}

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export interface SiteLinkProps extends AnchorProps {
  to: string;
  onNavigate?: (route: string) => void;
}

export function SiteLink({ to, onNavigate, onClick, children, ...rest }: SiteLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !onNavigate || !isInternalRoute(to)) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
