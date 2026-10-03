import { useState, useEffect } from 'react';

/**
 * MEASURED DURING RENDER, NOT AFTER IT.
 *
 * This initialised to `false` and corrected in an effect, so the first paint of
 * every screen was the DESKTOP branch — on a phone. Components that branch on it
 * (the detail heroes, the bento grids, the header) rendered the wrong layout,
 * then reflowed once hydration ran. On a slow device that is a visible jump on
 * every navigation.
 *
 * `matchMedia` can be read synchronously during render, so the first paint is
 * already right. SSR and any non-browser environment keep the old `false`
 * default, which is the only case where the answer is genuinely unknown.
 *
 * The breakpoint comes from `--breakpoint-md` rather than a hardcoded 768, so
 * moving it in the design system moves it here. The literal remains as the
 * fallback for the one render before styles resolve.
 */
const FALLBACK_BREAKPOINT = 768;

function mobileQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue('--breakpoint-md')
    .trim();
  const px = Number.parseInt(declared, 10);
  const breakpoint = Number.isFinite(px) && px > 0 ? px : FALLBACK_BREAKPOINT;
  return window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => mobileQuery()?.matches ?? false);

  useEffect(() => {
    const mq = mobileQuery();
    if (!mq) return;

    // Re-read on mount: the first render may have run before the stylesheet
    // resolved `--breakpoint-md`, in which case it used the fallback.
    setIsMobile(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export default useIsMobile;

/**
 * True below 1024px, where the public capsule cannot hold the whole menu.
 *
 * Separate from `useIsMobile` on purpose. `useIsMobile` is the layout
 * breakpoint the rest of the app reasons on and must stay at `--breakpoint-md`;
 * this one answers a narrower question — can the bar fit six links and two
 * buttons on one line — and the honest answer there is 1024, not 768. They are
 * two different questions that happened to share a hook, which is why the band
 * from 768 to 1023 ended up with a nav that had room for neither layout.
 */
const COMPACT_NAV_BREAKPOINT = 1024;

function compactNavQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(`(max-width: ${COMPACT_NAV_BREAKPOINT - 0.02}px)`);
}

export function useIsCompactNav() {
  const [isCompact, setIsCompact] = useState<boolean>(() => compactNavQuery()?.matches ?? false);

  useEffect(() => {
    const mq = compactNavQuery();
    if (!mq) return;
    setIsCompact(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isCompact;
}
