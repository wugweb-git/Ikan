import React from 'react';
import { motion } from 'framer-motion';

/**
 * The iKan brand mark — the single source of truth for the icon geometry.
 *
 * One 1:1 path, drawn with `currentColor` so it takes the surrounding text
 * colour (or an explicit `color`). Everything that shows the icon-only mark —
 * LogoIcon, the favicon, the PWA icons — derives from the constants below, so
 * the geometry lives in exactly one place.
 */
export const BRAND_MARK_VIEWBOX = '0 0 58 58';
export const BRAND_MARK_PATH =
  'M27.0893 49.0455H30.534V33.6987L41.6648 44.3411L44.0111 41.9975L33.3519 30.8777H48.5428C49.184 30.3946 49.0948 29.2904 49.0287 28.5112C49.0028 28.2207 49.0517 27.9217 48.9626 27.637L48.5428 27.1165H33.3519L44.0111 15.9967L41.6648 13.6531L30.534 24.2956V8.95449H27.0893V19.2921C26.4164 18.8608 26.1174 17.7336 25.7838 16.9974C24.7401 14.6941 23.8113 12.3016 23.0062 9.9063L19.5816 11.3268L23.3282 20.8593L15.9701 13.6618C15.5502 14.3117 13.3534 15.6833 13.7589 16.4712L20.8238 23.6745L11.2659 19.6343L9.88568 22.8463L19.2567 27.1223H8.91954V30.8806H19.2567L9.88568 35.1566L11.2659 38.3686L20.8238 34.3284L13.7589 41.5317C13.3506 42.3196 15.5502 43.6912 15.9701 44.3411L23.3282 37.1436L19.5816 46.6761L23.0062 48.0966C23.8113 45.6984 24.7401 43.3088 25.7838 41.0055C26.1174 40.2693 26.4164 39.1392 27.0893 38.7108V49.0484V49.0455ZM0 29C0 12.9831 12.9854 0 29.0014 0C45.0175 0 58 12.9831 58 29C58 45.0169 45.0175 58 29.0014 58C12.9854 58 0.00287603 45.0169 0.00287603 29H0Z';

const VB = 58;

export type BrandMarkAnimation = 'none' | 'draw' | 'spin' | 'pulse';

export interface BrandMarkProps {
  /** Rendered width and height in px — always 1:1. */
  size?: number | string;
  /** Explicit colour. Defaults to `currentColor` so it inherits text colour. */
  color?: string;
  /**
   * Transparent inset on all four sides, as a fraction of the box (0–0.45).
   * Use it when the mark sits in a filled container — an app-icon tile, a
   * coloured chip — so it is not flush to the edge. 0.2 matches the maskable
   * PWA safe zone.
   */
  padding?: number;
  animation?: BrandMarkAnimation;
  /** Play the draw-in once when scrolled into view, instead of on mount. */
  revealOnScroll?: boolean;
  /** Hover/tap feedback — a gentle scale. */
  interactive?: boolean;
  /** Accessible name. Omit for a decorative mark (then it is aria-hidden). */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The icon-only iKan mark. 1:1, colourable via `currentColor`, with optional
 * padding for filled containers and a few opt-in animations.
 */
export function BrandMark({
  size = 32,
  color,
  padding = 0,
  animation = 'none',
  revealOnScroll = false,
  interactive = false,
  title,
  className = '',
  style = {},
}: BrandMarkProps) {
  const pad = Math.max(0, Math.min(0.45, padding));
  const scale = 1 - pad * 2;
  const offset = VB * pad;
  const decorative = !title;

  const spin =
    animation === 'spin'
      ? { rotate: [0, 360] }
      : animation === 'pulse'
        ? { opacity: [1, 0.6, 1] }
        : {};
  const spinTransition =
    animation === 'spin'
      ? { duration: 2, repeat: Infinity, ease: 'linear' as const }
      : animation === 'pulse'
        ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const }
        : {};

  const draw = animation === 'draw';
  const drawAnim = { pathLength: 1, opacity: 1 };
  const drawInitial = { pathLength: 0, opacity: 0.35 };

  return (
    <motion.svg
      className={`block ${className}`}
      width={size}
      height={size}
      viewBox={BRAND_MARK_VIEWBOX}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      style={{ color: color ?? 'currentColor', ...style }}
      animate={spin}
      transition={spinTransition}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.94 } : undefined}
    >
      {title ? <title>{title}</title> : null}
      <g transform={pad > 0 ? `translate(${offset} ${offset}) scale(${scale})` : undefined}>
        <motion.path
          d={BRAND_MARK_PATH}
          fill="currentColor"
          initial={draw ? drawInitial : false}
          animate={draw && !revealOnScroll ? drawAnim : undefined}
          whileInView={draw && revealOnScroll ? drawAnim : undefined}
          viewport={draw && revealOnScroll ? { once: true, amount: 0.6 } : undefined}
          transition={draw ? { duration: 1.4, ease: 'easeInOut', delay: 0.1 } : undefined}
        />
      </g>
    </motion.svg>
  );
}

export default BrandMark;
