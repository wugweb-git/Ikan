/**
 * One place that turns a clinical severity into colour, tone and copy.
 *
 * Four files were doing this independently — `Dashboard`,
 * `AssessmentHistoryDetail`, `AssessmentResults` and `RecommendationCards` —
 * and every one of them still spoke the retired three-term vocabulary
 * (`low | moderate | high`). Post-split the real terms are
 * `minimal | mild | moderate | moderately-severe | severe`, so three of the
 * five fell through whatever each file used as its default.
 *
 * Dashboard's was the worst: nine ternaries of the shape
 *
 *     severity === 'low' ? ok : severity === 'moderate' ? warn : danger
 *
 * with no default, so the **else branch is the most severe presentation**.
 * `minimal` — the most common result there is — is not `'low'`, so the
 * calmest possible result rendered red under "Let's talk about it".
 *
 * This is the presentation counterpart to `tierFor`, which did the same
 * consolidation for the logic side. Colours come from the `severity_level`
 * catalog rows when they are available (each carries a `color`), and fall back
 * to design tokens — never to a raw hex in a component.
 */

import { isSeverityLevel, type SeverityLevel } from './scoring-engine';

export interface SeverityPresentation {
  /** The severity this describes, or null when nothing resolved. */
  severity: SeverityLevel | null;
  /** Human label. Never a band label — those are instrument copy. */
  label: string;
  /** Foreground/accent colour, a token unless the catalog supplies a hex. */
  color: string;
  /** Translucent background derived from the same colour. */
  background: string;
  /** Coarse tone, for callers that only need three states. */
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

const LABELS: Record<SeverityLevel, string> = {
  minimal: 'Minimal',
  mild: 'Mild',
  moderate: 'Moderate',
  'moderately-severe': 'Moderately severe',
  severe: 'Severe',
};

const TOKENS: Record<SeverityLevel, { color: string; background: string; tone: SeverityPresentation['tone'] }> = {
  minimal: { color: 'var(--color-status-success)', background: 'var(--color-status-success-light)', tone: 'success' },
  mild: { color: 'var(--color-status-info)', background: 'var(--color-info-light)', tone: 'success' },
  moderate: { color: 'var(--color-status-warning)', background: 'var(--color-status-warning-light)', tone: 'warning' },
  'moderately-severe': { color: 'var(--color-status-warning)', background: 'var(--color-status-warning-light)', tone: 'warning' },
  severe: { color: 'var(--color-status-danger)', background: 'var(--color-status-danger-light)', tone: 'danger' },
};

/**
 * Neutral, NOT the most severe.
 *
 * An unresolved severity means something upstream failed to produce one. It is
 * not evidence of a serious result, and presenting it as one is both alarming
 * and wrong — which is exactly what the missing default branches were doing.
 */
const UNRESOLVED: SeverityPresentation = {
  severity: null,
  label: 'Not banded',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg-muted)',
  tone: 'neutral',
};

/**
 * @param severity a clinical severity term. Anything else — a band label like
 *   "Poor Sleep", a retired tier like "high", undefined — resolves to the
 *   neutral presentation rather than being coerced.
 * @param catalog optional `severity_level` rows (slug -> color) from
 *   `useMetadata().severityLevels`, so an admin colour change reaches the UI.
 */
export function severityPresentation(
  severity: string | null | undefined,
  catalog?: Record<string, string>,
): SeverityPresentation {
  if (!isSeverityLevel(severity)) return UNRESOLVED;
  const base = TOKENS[severity];
  const fromCatalog = catalog?.[severity];
  return {
    severity,
    label: LABELS[severity],
    // A catalog hex needs its own translucent background; a token has one.
    color: fromCatalog || base.color,
    background: fromCatalog ? `color-mix(in srgb, ${fromCatalog} 15%, transparent)` : base.background,
    tone: base.tone,
  };
}

/**
 * Severity for a stored result, read from the band the score actually fell in.
 *
 * `severity_hint` on a result is the **band label** — "Poor Sleep",
 * "Healthy Sleep", "Completed" — not a severity. 76 of 101 stored results carry
 * one that is not a severity term, so lower-casing it (which is what the
 * screens did) produced `poor-sleep` and fell through to a default.
 */
export function severityOfResult(result: any): SeverityLevel | null {
  const ref =
    result?.section_scores?.overall?.band?.severity_ref ??
    result?.sectionScores?.overall?.band?.severity_ref ??
    result?.engine_result?.severityLevel ??
    result?.engineResult?.severityLevel ??
    null;
  return isSeverityLevel(ref) ? ref : null;
}
