import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

/**
 * HeroStatusCard
 * 
 * Reusable dark-themed hero card used for prominent status displays 
 * (e.g. active program, enrollment progress, daily streak).
 * 
 * Extracted from ProgramProgressTracker's "Active Program" card pattern.
 * Design tokens: --color-primary-default bg, --radius-lg, --shadow-md.
 */

interface HeroStatusCardAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  /** 'primary' = white bg / dark text, 'ghost' = translucent bg */
  variant?: 'primary' | 'ghost';
}

interface HeroStatusCardProps {
  /** Small tag above the title */
  tag?: { text: string; variant?: 'active' | 'complete' | 'info' };
  title: string;
  subtitle?: string;
  description?: string;
  /** Progress bar — pass current & total to show linear progress */
  progress?: { current: number; total: number };
  /** CTA buttons at the bottom */
  actions?: HeroStatusCardAction[];
  /** Optional slot rendered opposite the text (e.g. a ring, icon, or image) */
  trailing?: ReactNode;
  /** Override background color — defaults to --color-primary-default */
  backgroundColor?: string;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-inverse)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: '100%', marginTop: 14 }}>
      <div style={{
        width: '100%', height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.85))',
          }}
        />
      </div>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ width: 72, height: 72, flexShrink: 0, position: 'relative' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <motion.circle
          cx="36" cy="36" r={r} fill="none"
          stroke="rgba(255,255,255,0.8)" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...f('sm', 500, 'var(--color-text-inverse)'),
      }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export function HeroStatusCard({
  tag,
  title,
  subtitle,
  description,
  progress,
  actions,
  trailing,
  backgroundColor = 'var(--color-primary-default)',
  className,
}: HeroStatusCardProps) {
  const pct = progress ? Math.min(Math.round((progress.current / Math.max(progress.total, 1)) * 100), 100) : 0;

  const tagColor = tag?.variant === 'complete'
    ? { text: 'var(--color-status-success)', bg: 'var(--color-status-success-light)', border: 'none' }
    : tag?.variant === 'info'
    ? { text: 'rgba(255,255,255,0.65)', bg: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }
    : { text: 'rgba(255,255,255,0.65)', bg: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{
        backgroundColor,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative background wave */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', opacity: 0.06 }}
        viewBox="0 0 200 200" preserveAspectRatio="none"
      >
        <path d="M100 0 Q120 50 100 100 Q80 150 100 200 L200 200 L200 0 Z" fill="var(--color-bg-card)" />
        <path d="M130 0 Q150 50 130 100 Q110 150 130 200 L200 200 L200 0 Z" fill="var(--color-bg-card)" />
      </svg>

      <div style={{ padding: '20px 20px 18px', position: 'relative', zIndex: 1 }}>
        <div className="flex items-start justify-between" style={{ gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tag */}
            {tag && (
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 500,
                fontFamily: 'var(--font-family-base)',
                color: tagColor.text,
                backgroundColor: tagColor.bg,
                padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                border: tagColor.border,
              }}>
                {tag.text}
              </span>
            )}

            {/* Title */}
            <h3 style={{ ...f('2xl', 500), margin: tag ? '10px 0 0' : '0', lineHeight: 1.2 }}>
              {title}
            </h3>

            {/* Subtitle */}
            {subtitle && (
              <p style={{
                ...f('xs', 500, 'rgba(255,255,255,0.45)'),
                margin: '4px 0 0',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
              }}>
                {subtitle}
              </p>
            )}

            {/* Progress */}
            {progress && <ProgressBar pct={pct} />}

            {/* Description */}
            {description && (
              <p style={{ ...f('sm', 400, 'rgba(255,255,255,0.6)'), margin: '10px 0 0', lineHeight: 1.5 }}>
                {description}
              </p>
            )}
          </div>

          {/* Trailing slot — default to progress ring if progress prop is present */}
          {trailing || (progress && <ProgressRing pct={pct} />)}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex" style={{ gap: 10, marginTop: 18 }}>
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="flex items-center justify-center"
                style={{
                  padding: '11px 20px', borderRadius: 'var(--radius-md)',
                  ...(action.variant === 'ghost' ? {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  } : {
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-primary-default)',
                    border: 'none',
                  }),
                  cursor: 'pointer', gap: 8,
                  ...f('sm', 500, action.variant === 'ghost' ? 'rgba(255,255,255,0.8)' : 'var(--color-primary-default)'),
                }}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { ProgressRing, ProgressBar };
