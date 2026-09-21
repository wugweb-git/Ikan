/**
 * The builder's frame: a full-height column of top bar, optional banner, and the
 * active screen. §21 item 5.
 *
 * The height is the point. `WizardLayout` was `h-screen` with one scrolling
 * `main`, so the day builder inside it had to guess its own height —
 * `h-[calc(100vh-250px)]`, a hardcoded subtraction of the chrome above it that
 * was wrong the moment the chrome changed. Here the body is `flex-1 min-h-0` and
 * the Content screen simply fills it.
 */
import type { ReactNode } from 'react';

export interface BuilderShellProps {
  topBar: ReactNode;
  /** The save-error strip, when there is one. Above the screen, below the bar. */
  banner?: ReactNode;
  children: ReactNode;
}

export function BuilderShell({ topBar, banner, children }: BuilderShellProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
      {topBar}
      {banner}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
