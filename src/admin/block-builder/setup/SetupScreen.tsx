/**
 * Setup — the record and its landing page, on one screen. §21 item 5.
 *
 * These were wizard steps 1 and 2. They are merged because both describe the
 * record and neither needs the other finished first, and because a stepper turns
 * a pair of editable things into a sequence you have to walk. It is reachable
 * from the Content top bar afterwards, so it is a prequel, not a gate.
 *
 * Layout only: the sections are passed in as children, so every field stays
 * exactly where it was authored and nothing had to be re-typed to move a screen.
 */
import type { ReactNode } from 'react';

export interface SetupScreenProps {
  /** Basics and landing-page sections, in order. */
  children: ReactNode;
  /** The right rail — the live store-card preview. */
  preview?: ReactNode;
}

export function SetupScreen({ children, preview }: SetupScreenProps) {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-8">
          {children}
        </div>
      </div>
      {preview && (
        <aside
          className="hidden xl:block w-[340px] shrink-0 overflow-y-auto p-5"
          style={{ borderLeft: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)' }}
        >
          {preview}
        </aside>
      )}
    </div>
  );
}
