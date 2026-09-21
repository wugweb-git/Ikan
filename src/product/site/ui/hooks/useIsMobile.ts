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
