import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Reveals children with a soft rise once they scroll into view.
 *
 * A port of `ikan2/src/components/reveal.tsx`, down to the observer options —
 * the `reveal` / `reveal-in` class pair it toggles is iKAN 2's, ported in
 * `ikan2.css`, so the two stay in step.
 *
 * Two notes on why this is an observer rather than CSS:
 *
 *   `animation-timeline: view()` would do the same job with no JavaScript, but
 *   this page scrolls inside an app-shell container rather than the document.
 *   A view timeline resolves against the nearest scroll container, which works,
 *   but Safari did not ship it until 26 and a silent no-op there means content
 *   that never appears. An observer degrades the right way.
 *
 *   The resting state is hidden, so if the observer never fires the content
 *   would be invisible. `ikan2.css` guards that at the CSS end: under
 *   `prefers-reduced-motion: reduce` the resting state IS the revealed one.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'section' | 'div' | 'header';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={['reveal', shown ? 'reveal-in' : '', className].filter(Boolean).join(' ')}
    >
      {children}
    </Tag>
  );
}
