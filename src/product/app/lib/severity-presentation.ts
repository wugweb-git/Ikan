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
 * Dashboard's nine three-way ternaries were initially read as a defect on the
 * same grounds — no default, so the else branch is the most severe
 * presentation. That reading was WRONG and is recorded here so it is not made
 * again: those branches key on `EngineResult.tier`, whose domain is exactly
 * `low | moderate | high`, so they are exhaustive. The misreading came from two
 * modules exporting a type called `SeverityLevel` with different domains. That
 * collision is gone; the field is now named `tier`.
 *
 * This is the presentation counterpart to `tierFor`, which did the same
 * consolidation for the logic side. Colours come from the `severity_level`
 * catalog rows when they are available (each carries a `color`), and fall back
 * to design tokens — never to a raw hex in a component.
 */

import { isSeverityLevel, type SeverityLevel, type ResponseTier } from '../engines/scoring-engine';

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
  /**
   * Icon key for `<Icon name=…>`. Part of the presentation because the five
   * call sites picked their own and two of them disagreed about which way up
   * the scale ran — one showed a rising arrow for `severe`.
   */
  icon: string;
}

const LABELS: Record<SeverityLevel, string> = {
  minimal: 'Minimal',
  mild: 'Mild',
  moderate: 'Moderate',
  'moderately-severe': 'Moderately severe',
  severe: 'Severe',
};

const TOKENS: Record<SeverityLevel, Omit<SeverityPresentation, 'severity' | 'label'>> = {
  minimal: { color: 'var(--color-status-success)', background: 'var(--color-status-success-light)', tone: 'success', icon: 'checkCircle' },
  mild: { color: 'var(--color-status-info)', background: 'var(--color-status-info-light)', tone: 'success', icon: 'checkCircle' },
  moderate: { color: 'var(--color-status-warning)', background: 'var(--color-status-warning-light)', tone: 'warning', icon: 'info' },
  'moderately-severe': { color: 'var(--color-status-warning)', background: 'var(--color-status-warning-light)', tone: 'warning', icon: 'info' },
  severe: { color: 'var(--color-status-danger)', background: 'var(--color-status-danger-light)', tone: 'danger', icon: 'warning' },
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
  icon: 'clipboard',
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
    icon: base.icon,
  };
}

/**
 * Severity for a stored result, read from the band the score actually fell in.
 *
 * `severity_hint` on a result is the **band label** — "Poor Sleep",
 * "Healthy Sleep", "Completed" — not a severity. 68 of 102 stored results carry
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

// ── Response tier ────────────────────────────────────────────────────────────

/**
 * Presentation for a **response tier** (3 terms), as distinct from a clinical
 * severity (5). `EngineResult.tier` carries this one.
 *
 * Kept beside `severityPresentation` on purpose: the two vocabularies map to
 * colour independently, and having them in one file is what stops a screen
 * quietly branching on the wrong one — which is the mistake the type collision
 * in `recommendation-engine` used to invite.
 */
const TIER_TOKENS: Record<ResponseTier, { color: string; background: string; gradient: string }> = {
  low: {
    color: 'var(--color-status-success)',
    background: 'var(--color-status-success-light)',
    gradient: 'linear-gradient(135deg, var(--color-status-success-light) 0%, var(--color-bg-card) 100%)',
  },
  moderate: {
    color: 'var(--color-status-warning)',
    background: 'var(--color-status-warning-light)',
    gradient: 'linear-gradient(135deg, var(--color-status-warning-light) 0%, var(--color-bg-card) 100%)',
  },
  high: {
    color: 'var(--color-status-danger)',
    background: 'var(--color-status-danger-light)',
    gradient: 'linear-gradient(135deg, var(--color-status-danger-light) 0%, var(--color-bg-card) 100%)',
  },
};

export function tierPresentation(tier: ResponseTier | null | undefined) {
  return tier && TIER_TOKENS[tier]
    ? TIER_TOKENS[tier]
    : { color: 'var(--color-text-muted)', background: 'var(--color-bg-muted)', gradient: 'var(--color-bg-card)' };
}

// ── Band tone ────────────────────────────────────────────────────────────────

/**
 * Presentation for a band's **authored tone** — the third and last vocabulary
 * on this page, and the only one that is written down on the data itself.
 *
 * `severityPresentation` maps the 5-term clinical severity; `tierPresentation`
 * maps the 3-term response tier; this maps `success | warning | error`, which
 * is what every band in every live scoring profile carries. They live in one
 * file so that a screen branching on the wrong one is visible in review.
 *
 * Null is neutral, never the most severe. A score that could not be placed is
 * missing information, not a bad result.
 */
const TONE_TOKENS: Record<'success' | 'warning' | 'error', { color: string; background: string }> = {
  success: { color: 'var(--color-status-success)', background: 'var(--color-status-success-light)' },
  warning: { color: 'var(--color-status-warning)', background: 'var(--color-status-warning-light)' },
  error: { color: 'var(--color-status-danger)', background: 'var(--color-status-danger-light)' },
};

export function tonePresentation(tone: 'success' | 'warning' | 'error' | null | undefined) {
  return (tone && TONE_TOKENS[tone]) || {
    color: 'var(--color-text-muted)',
    background: 'var(--color-bg-muted)',
  };
}
