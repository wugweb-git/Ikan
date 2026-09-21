/**
 * CalendarStrip — Pill-shaped adaptive date strip for iKan PWA.
 *
 * Fixed-width pill cells that expand to fill available width.
 * Number of visible days increases with screen width.
 * Today always sits on the right edge.
 */
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import tokens from '../../../lib/design-tokens';

// ── types ────────────────────────────────────────────────────────
export type DateStatus = 'done' | 'missed' | 'partial' | 'pending' | 'future' | 'none';

export interface MarkedDate {
  status: DateStatus;
  count?: number;
  emoji?: string;
  color?: string;
}

export interface CalendarStripProps {
  selectedDate: string;
  onDateSelect: (dateStr: string) => void;
  markedDates?: Record<string, MarkedDate>;
  dayCount?: number;
  allowFuture?: boolean;
  accentColor?: string;
  showNavArrows?: boolean;
  rangeLabel?: string;
}

// ── helpers ──────────────────────────────────────────────────────
function toDateStr(d: Date): string { return d.toISOString().split('T')[0]; }

function getDayName(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

// ── constants ────────────────────────────────────────────────────
const CELL_WIDTH = 56;
const CELL_GAP = 8;
const CONTAINER_PAD = 16;

const B = {
  primary: tokens.colors.primary.default,
  primaryOn: tokens.colors.primary.on,
  accent: tokens.colors.accent.default,
  muted: tokens.colors.text.muted,
  textPrimary: tokens.colors.text.primary,
  bgCard: tokens.colors.background.card,
  bgMuted: tokens.colors.background.muted,
  border: tokens.colors.border.default,
};

const f = (size: string, weight: number = 400, color: string = B.textPrimary) => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ═════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════

export function CalendarStrip({
  selectedDate,
  onDateSelect,
  markedDates = {},
  dayCount,
  allowFuture = false,
  accentColor: _accentColor,
  showNavArrows = true,
}: CalendarStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleDays, setVisibleDays] = useState(dayCount || 7);
  const [pageOffset, setPageOffset] = useState(0);
  const todayStr = toDateStr(new Date());

  // ── Responsive: measure container and compute how many pills fit ──
  const measureDays = useCallback(() => {
    if (dayCount) { setVisibleDays(dayCount); return; }
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth - CONTAINER_PAD * 2;
    const count = Math.max(3, Math.floor((w + CELL_GAP) / (CELL_WIDTH + CELL_GAP)));
    setVisibleDays(count);
  }, [dayCount]);

  useEffect(() => {
    measureDays();
    const ro = new ResizeObserver(measureDays);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measureDays]);

  // ── Compute visible dates ──
  // pageOffset=0 → trailing days ending at today
  const dates = useMemo(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + pageOffset * visibleDays);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (visibleDays - 1));
    const arr: Date[] = [];
    for (let i = 0; i < visibleDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [pageOffset, visibleDays]);

  // Ensure selected date is visible on mount
  useEffect(() => {
    const sel = new Date(selectedDate + 'T12:00:00');
    const today = new Date();
    const diffDays = Math.floor((sel.getTime() - today.getTime()) / 86400000);
    const page = Math.floor(diffDays / visibleDays);
    if (page !== pageOffset) setPageOffset(page);
  }, []); // mount only

  const canGoForward = allowFuture || pageOffset < 0;

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: B.bgCard,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: `1px solid ${B.border}`,
        padding: `${CONTAINER_PAD}px`,
      }}
    >
      {/* Nav arrows + month label */}
      {showNavArrows && (
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 12 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPageOffset(p => p - 1)}
            className="flex items-center justify-center"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: B.bgMuted, border: 'none', cursor: 'pointer',
            }}
          >
            <ChevronLeft size={14} style={{ color: B.muted }} />
          </motion.button>

          <motion.span
            key={`${dates[0]?.toISOString()}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...f('xs', 500, B.muted),
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
            }}
          >
            {dates[0]?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </motion.span>

          <motion.button
            whileHover={canGoForward ? { scale: 1.1 } : undefined}
            whileTap={canGoForward ? { scale: 0.9 } : undefined}
            onClick={() => canGoForward && setPageOffset(p => p + 1)}
            disabled={!canGoForward}
            className="flex items-center justify-center"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: B.bgMuted, border: 'none',
              cursor: canGoForward ? 'pointer' : 'not-allowed',
              opacity: canGoForward ? 1 : 0.3,
            }}
          >
            <ChevronRight size={14} style={{ color: B.muted }} />
          </motion.button>
        </div>
      )}

      {/* Date pills — fixed spacing, fluid count */}
      <div
        className="flex items-center justify-center"
        style={{ gap: CELL_GAP }}
      >
        <AnimatePresence mode="popLayout">
          {dates.map((date, i) => {
            const ds = toDateStr(date);
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            const isFuture = date > new Date() && !isToday;
            const mark = markedDates[ds];
            const status: DateStatus = mark?.status || (isFuture ? 'future' : 'none');
            const selectable = !isFuture || allowFuture;
            const hasEntry = status === 'done';
            const emojiOverride = mark?.emoji;

            // Colour logic:
            // Today (and selected) → dark primary bg, white text
            // Selected (not today) → dark primary bg, white text
            // Has entry → slightly highlighted
            // Default → light accent bg
            const isDark = isSelected || isToday;
            const pillBg = isDark
              ? B.primary
              : hasEntry
                ? `color-mix(in srgb, var(--color-status-success) 8%, transparent)`
                : B.accent;
            const dayColor = isDark ? 'rgba(255,255,255,0.7)' : B.muted;
            const dateColor = isDark ? B.primaryOn : B.textPrimary;

            return (
              <motion.button
                key={ds}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{
                  opacity: isFuture && !allowFuture ? 0.35 : 1,
                  scale: 1, y: 0,
                }}
                transition={{
                  delay: i * 0.025, duration: 0.3,
                  type: 'spring', stiffness: 350, damping: 22,
                }}
                whileHover={selectable ? { y: -3, scale: 1.04 } : undefined}
                whileTap={selectable ? { scale: 0.93 } : undefined}
                onClick={() => selectable && onDateSelect(ds)}
                className="flex flex-col items-center justify-center"
                style={{
                  width: CELL_WIDTH,
                  height: 72,
                  borderRadius: 28,
                  backgroundColor: pillBg,
                  border: 'none',
                  cursor: selectable ? 'pointer' : 'default',
                  gap: 4,
                  padding: '8px 0',
                  flexShrink: 0,
                  position: 'relative',
                  transition: 'background-color 0.25s ease',
                }}
              >
                {/* Day name */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: dayColor,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}>
                  {getDayName(date)}
                </span>

                {/* Date number */}
                <span style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: dateColor,
                  lineHeight: 1,
                }}>
                  {date.getDate()}
                </span>

                {/* Status indicator dot/emoji at bottom */}
                {hasEntry && !isDark && emojiOverride && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18, delay: i * 0.03 }}
                    style={{
                      fontSize: 12, lineHeight: 1,
                      position: 'absolute', bottom: 5,
                    }}
                  >
                    {emojiOverride}
                  </motion.span>
                )}

                {/* Today with entry: small checkmark dot */}
                {isToday && hasEntry && isDark && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    style={{
                      position: 'absolute', bottom: 6,
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: 'var(--color-status-success)',
                    }}
                  />
                )}

                {/* Today without entry: pulsing dot */}
                {isToday && !hasEntry && isDark && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', bottom: 6,
                      width: 5, height: 5, borderRadius: '50%',
                      backgroundColor: 'var(--color-status-warning)',
                    }}
                  />
                )}

                {/* Missed: subtle red dot */}
                {status === 'missed' && !isDark && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute', bottom: 6,
                      width: 4, height: 4, borderRadius: '50%',
                      backgroundColor: 'var(--color-status-danger)',
                      opacity: 0.5,
                    }}
                  />
                )}

                {/* Badge count for multiple entries */}
                {(mark?.count || 0) > 1 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center"
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      backgroundColor: isDark ? 'var(--color-status-warning)' : B.primary,
                      color: isDark ? B.primary : B.primaryOn,
                      fontSize: 9, fontWeight: 500,
                      border: `2px solid ${B.bgCard}`,
                    }}
                  >
                    {mark!.count}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CalendarStrip;