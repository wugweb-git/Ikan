import React from 'react';
import svgPathsFull from "./svg/svg-epzl744ze1";

/**
 * The iKan wordmark (icon + text), drawn in `currentColor`.
 *
 * The footer is the only caller. The admin-uploaded logo override and the
 * `/settings` fetch behind it are gone with the rest of the site's live reads;
 * the icon-only and icon+name variants had no callers on the site.
 */
export function LogoFull({ height = 32, className = "", style = {} }: {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ height, width: 'auto', color: 'var(--foreground)', ...style }}
      data-name="LogoFull"
    >
      <svg
        className="block h-full w-auto"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 100 50"
        style={{ color: 'currentColor' }}
        role="img"
        aria-label="iKan"
      >
        <g id="Logo">
          <g id="Vector">
            <path d={svgPathsFull.p28d7740} fill="currentColor" />
            <path d={svgPathsFull.p201d5680} fill="currentColor" />
            <path d={svgPathsFull.p2febba00} fill="currentColor" />
            <path d={svgPathsFull.p2be28440} fill="currentColor" />
            <path d={svgPathsFull.p1c12f8f0} fill="currentColor" />
          </g>
        </g>
      </svg>
    </div>
  );
}
