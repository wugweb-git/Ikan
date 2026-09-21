import type React from 'react';
import { cn } from './utils';

/**
 * The marketing site's one content width.
 *
 * Pages had drifted between 1100px, 1200px (`--constraint-content-max`) and
 * Tailwind's `max-w-7xl` (1280px), so the content column jumped as you moved
 * between pages. 1100px was the most common value — the homepage sections,
 * the policy pages and About Us all used it — so it is the one kept.
 */
export const CONTENT_MAX = '1100px';

interface Props {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** Centred column at CONTENT_MAX with the site's side gutter (16px, 24px from md). */
export function Container({ children, className, style }: Props) {
  return (
    <div className={cn('mx-auto w-full px-4 md:px-6', className)} style={{ maxWidth: CONTENT_MAX, ...style }}>
      {children}
    </div>
  );
}

/** Page ground: full width, page background, base font. */
export function PageShell({ children, className, style }: Props) {
  return (
    <div
      className={cn('w-full min-h-screen', className)}
      style={{ backgroundColor: 'var(--color-bg-page)', fontFamily: 'var(--font-family-base)', ...style }}
    >
      {children}
    </div>
  );
}
