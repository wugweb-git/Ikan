import { motion } from 'framer-motion';
import type { SectionScore, SectionScoreResult } from '../../lib/assessment-sections';
import { severityForSection } from '../../lib/assessment-sections';

/**
 * Per-scale breakdown for assessments that bundle several instruments.
 *
 * Rendered instead of a single total for the General questionnaire (GAD-2,
 * PHQ-2, WHO-5, NGSE, BRS) and Burnout (four BAT sub-scales plus an overall
 * risk index).
 */

const SEVERITY_COLOR: Record<string, string> = {
  low: 'var(--color-status-success)',
  moderate: 'var(--color-status-warning)',
  high: 'var(--color-status-danger)',
};

/** Inline style helper matching the convention used across the results screens. */
const f = (size: string, weight = 400, color = 'var(--color-text-primary)') => ({
  fontFamily: 'var(--font-family-base)',
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  color,
});

function sectionColor(section: SectionScore): string {
  return SEVERITY_COLOR[severityForSection(section)] ?? 'var(--color-primary-default)';
}

/** Score formatted for its scale: means get a decimal, sums stay whole. */
function formatValue(section: SectionScore): string {
  const decimal = !Number.isInteger(section.value) || section.max <= 10;
  return decimal ? section.value.toFixed(1) : String(Math.round(section.value));
}

function SectionRow({ section, index }: { section: SectionScore; index: number }) {
  const color = sectionColor(section);
  const unavailable = section.expected > 0 && section.answered === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span style={f('base', 500)}>{section.label}</span>
          {section.instrument && (
            <span style={f('xs', 400, 'var(--color-text-muted)')}>{section.instrument}</span>
          )}
        </div>

        {unavailable ? (
          <span style={f('xs', 500, 'var(--color-text-muted)')}>Not scored</span>
        ) : (
          <div className="flex items-baseline gap-2 shrink-0">
            <span style={{ ...f('lg', 500, color), fontVariantNumeric: 'tabular-nums' }}>
              {formatValue(section)}
            </span>
            <span style={f('xs', 400, 'var(--color-text-muted)')}>/ {section.max}</span>
          </div>
        )}
      </div>

      {!unavailable && (
        <div
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'var(--color-bg-muted)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, section.percent))}%` }}
            transition={{ delay: 0.05 * index + 0.1, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
            style={{ height: '100%', borderRadius: 3, backgroundColor: color }}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {section.band && !unavailable ? (
          <span
            style={{
              ...f('xs', 500, color),
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
            }}
          >
            {section.band.label}
          </span>
        ) : <span />}

        {/* A partial instrument is not clinically comparable, so say so rather
            than letting a half-answered scale read as a real result. */}
        {!section.complete && (
          <span style={f('xs', 400, 'var(--color-text-muted)')}>
            {unavailable
              ? 'No questions mapped yet'
              : `Incomplete — ${section.answered} of ${section.expected} answered`}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function SectionReportCard({
  result,
  title = 'Your results',
}: {
  result: SectionScoreResult;
  title?: string;
}) {
  if (!result.sectioned || result.sections.length === 0) return null;

  const overall = result.overall;
  const overallColor = overall ? sectionColor(overall) : undefined;

  return (
    <div className="w-full flex flex-col" style={{ gap: 16 }}>
      {/* Overall index, when the instrument defines one. The General
          questionnaire deliberately has none — five independent scales with no
          meaningful combined total. */}
      {overall && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          style={{
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: `color-mix(in srgb, ${overallColor} 8%, var(--color-bg-card))`,
            border: `1px solid color-mix(in srgb, ${overallColor} 30%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div className="flex flex-col" style={{ gap: 4 }}>
            <span style={f('xs', 500, 'var(--color-text-muted)')}>
              {overall.label.toUpperCase()}
            </span>
            {overall.band && (
              <span style={f('xl', 500, overallColor)}>{overall.band.label}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            <div style={{ ...f('2xl', 500, overallColor), fontVariantNumeric: 'tabular-nums' }}>
              {formatValue(overall)}
            </div>
            <div style={f('xs', 400, 'var(--color-text-muted)')}>of {overall.max}</div>
          </div>
        </motion.div>
      )}

      <div>
        <p style={{ ...f('xs', 500, 'var(--color-text-muted)'), letterSpacing: '0.04em', marginBottom: 10 }}>
          {title.toUpperCase()}
        </p>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {result.sections.map((s, i) => (
            <SectionRow key={s.id} section={s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
