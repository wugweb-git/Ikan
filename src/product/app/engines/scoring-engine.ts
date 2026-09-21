/**
 * Scoring engine v2 — vocabulary, achievable range, band tiling, coverage.
 *
 * This module is pure and dependency-free so the arithmetic can be reasoned
 * about and tested without the player, the admin UI or the network. Everything
 * the authoring surface shows — the achievable range, the coverage meter, the
 * tiling verdict, the all-min/all-max preview — is computed here from the same
 * inputs the runtime scorer uses, so the editor cannot disagree with the result
 * page about what a spec means.
 *
 * Three things differ deliberately from v1 (`assessment-sections.ts`):
 *
 *  1. **Option values are explicit.** v1 derives an option's weight from its
 *     array index, which is why every BAT/BRS config carries `offset: 1` to
 *     push a 0-4 index back onto the instrument's 1-5 Likert. A scale that
 *     states its own values needs no offset, and a 4-, 5- or 7-point scale
 *     costs nothing. `offset` does not exist in v2.
 *
 *  2. **Bands are half-open** — `[min, max)`, except the last, which is
 *     `[min, max]`. `mean` produces decimals, and closed intervals need an
 *     adjacency step (+1? +0.01? +? for a 5-point mean over 6 items) that is a
 *     guess at every precision. Half-open needs none: `next.min === prev.max`.
 *
 *  3. **A band's label and its clinical term are separate fields.** v1 derives
 *     severity by lower-casing the user-facing label and hyphenating it, so
 *     "Poor Sleep" has to become a severity term by luck. v2 bands carry an
 *     explicit `severity_ref`.
 */

// ── Vocabulary ───────────────────────────────────────────────────────────────

/**
 * Clinical severity, ordered. The PHQ-9/GAD-7 convention.
 *
 * `low` and `high` are deliberately NOT here — they are a different, coarser
 * family (see `RESPONSE_TIERS`). The live catalog mixed all seven into one
 * `severity_level` type, where `minimal` and `low` share both a colour
 * (#22C55E) and an icon (circle-check) because they are one tier under two
 * names. No catalog row carries an `order`, so the seven-way ordering existed
 * only in a lookup table in `recommendation-engine.ts` — it asserted that
 * `low` sits between `minimal` and `mild`, which nobody decided.
 */
// The vocabulary and its comparison now live in ONE place — see
// `scoring-vocabulary.ts`. They were defined in four, and while the VALUES
// agreed, the two `compareSeverity` implementations did not: this copy read
// `SEVERITY_LEVELS.indexOf(a) - SEVERITY_LEVELS.indexOf(b)`, and `indexOf`
// returns -1 for an unknown term, so `compareSeverity('severe', 'typo')` was
// 4 - (-1) = 5 — an unrecognised threshold that every user cleared.
export {
  SEVERITY_LEVELS, RESPONSE_TIERS, isSeverityLevel, compareSeverity,
  type SeverityLevel, type ResponseTier,
} from '../../../supabase/functions/server/scoring-vocabulary';
import { RESPONSE_TIERS, type SeverityLevel, type ResponseTier } from '../../../supabase/functions/server/scoring-vocabulary';

/**
 * Severity -> tier, the FALLBACK only. The authoritative map is data: each
 * `severity_level` catalog row carries a `tier`, and resolution order is
 * profile `tier_map` -> catalog row -> this. Dropping the catalog's `tier`
 * field silently reverts the map to these values.
 */
export const DEFAULT_TIER_MAP: Record<SeverityLevel, ResponseTier> = {
  minimal: 'low',
  mild: 'low',
  moderate: 'moderate',
  'moderately-severe': 'high',
  severe: 'high',
};

/**
 * Resolve a severity to its response tier.
 *
 * @param override  per-profile `tier_map`, wins over everything
 * @param catalog   severity slug → tier, read from the `severity_level`
 *                  catalog rows' `tier` field. This is the authoritative map;
 *                  pass it wherever the catalog is available.
 */
export function tierFor(
  severity: SeverityLevel,
  override?: Record<string, string>,
  catalog?: Record<string, string>,
): ResponseTier {
  const mapped = override?.[severity] ?? catalog?.[severity] ?? DEFAULT_TIER_MAP[severity];
  return (RESPONSE_TIERS as readonly string[]).includes(mapped)
    ? (mapped as ResponseTier)
    : DEFAULT_TIER_MAP[severity];
}

// ── Scales ───────────────────────────────────────────────────────────────────

export interface ScaleOption {
  label: string;
  /** Explicit. Never inferred from position — that is what `offset` was for. */
  value: number;
}

export interface Scale {
  id: string;
  label: string;
  options: ScaleOption[];
}

// ── Spec shapes ──────────────────────────────────────────────────────────────

export interface ScoreItem {
  question_id: string;
  /** Multiplies this item's contribution. Defaults to 1. */
  weight?: number;
  /** Invert against the item's own scale before weighting. */
  reverse?: boolean;
}

export type ScoreCalc = 'sum' | 'mean' | 'sum_times_k' | 'from_scores';

export interface AssessmentScore {
  id: string;
  label: string;
  /** Which profile supplies calc, direction and bands. */
  profile_id: string;
  /** Present for sum / mean / sum_times_k. */
  items?: ScoreItem[];
  /** Present for from_scores — ids of other scores on the same assessment. */
  from_scores?: string[];
  /**
   * This score is the assessment's headline — the one a recommendation rule
   * matches on.
   *
   * Declared rather than inferred. `toSectionScoreResult` previously picked the
   * overall by id convention (`overall` or `*-overall`), which burnout's
   * `bat-overall` satisfies but depression's `phq9-total` and anxiety's
   * `gad7-total` do not. Without it those two resolved as the worst of their
   * sections, so a positive GAD-2 screen could outrank a minimal PHQ-9 and
   * drive the recommendation from the embedded screen rather than the
   * instrument.
   *
   * General deliberately declares none: it runs five independent scales and
   * genuinely has no headline, so it falls through to the worst domain.
   */
  primary?: boolean;
}

export interface ScoringBand {
  /** Minted once. Never derived from the label, which is editable copy. */
  id: string;
  /** User-facing, instrument-specific: "Poor Sleep", "Burnout Warning". */
  label: string;
  /** The clinical term the system reasons on. Required. */
  severity_ref: SeverityLevel;
  /** Half-open: [min, max). The last band in a set is [min, max]. */
  min: number;
  max: number;
  tone: 'success' | 'warning' | 'error';
  interpretation?: string;
}

export interface ScoringProfile {
  id: string;
  version: number;
  name: string;
  description: string;
  calc: ScoreCalc;
  /** Required iff calc === 'sum_times_k'. WHO-5 uses 4. */
  k?: number;
  direction: 'higher_is_distress' | 'higher_is_better';
  band_basis: 'percent' | 'absolute';
  bands: ScoringBand[];
  tier_map?: Record<string, string>;
  missing: {
    min_answered: number;
    on_missing: 'prorate' | 'zero' | 'invalidate';
  };
  locked: boolean;
  created_at: string;
  updated_at: string;
}

/** Minimal question shape this module needs. */
export interface ScorableQuestion {
  id: string;
  text?: string;
  scale_ref?: string;
  /** Absent or true means the question counts toward coverage. */
  is_scored?: boolean;
  is_risk_indicator?: boolean;
  retired_at?: string | null;
}

export interface Range {
  min: number;
  max: number;
}

/** Everything the pure functions need resolved up front. */
export interface ScoringContext {
  questions: ScorableQuestion[];
  scales: Record<string, Scale>;
  profiles: Record<string, ScoringProfile>;
  scores: AssessmentScore[];
}

// ── Achievable range ─────────────────────────────────────────────────────────

/**
 * Two decimal places.
 *
 * Was 1e6 — six places — which is float-noise suppression, not a presentation
 * decision, and it showed: a `mean` over 23 BAT items produced values like
 * 3.6086956521739131 rounded to 3.608696, printed to a clinician as though the
 * fourth decimal meant something. No instrument here is precise past two, and a
 * score is read by a person.
 *
 * Applied at the point of computation rather than in a formatter, so every
 * reader — report card, stored result, trend, export — gets the same number.
 * A stored score and a displayed score that differ is how two representations
 * of one value start.
 */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * The contribution range of one item, after reverse and weight.
 *
 * Reversal maps `v → (scale_max + scale_min − v)`. On a uniform scale that just
 * mirrors the endpoints, but the transform is applied to the actual values
 * rather than assumed, so a non-uniform scale (0, 1, 3, 5) and a negative
 * weight both come out right instead of silently inverted.
 */
export function itemRange(scale: Scale, item: ScoreItem): Range {
  const values = scale.options.map(o => o.value);
  if (values.length === 0) return { min: 0, max: 0 };

  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const weight = item.weight ?? 1;

  const contributions = values.map(v => (item.reverse ? hi + lo - v : v) * weight);
  return { min: round(Math.min(...contributions)), max: round(Math.max(...contributions)) };
}

export interface AchievableResult {
  range: Range;
  /** Item ids that could not be resolved. A score with any of these is invalid. */
  unresolved: string[];
}

/**
 * Achievable range for one score.
 *
 * Recomputed on every edit rather than stored: a stored range is a denominator
 * that goes stale silently the moment an item or a scale changes, and a wrong
 * denominator is invisible in the output.
 *
 * `from_scores` recurses, with cycle detection — a score that (transitively)
 * feeds itself has no defined range, and returning 0 for it would look like a
 * legitimate empty score.
 */
export function achievableRange(
  scoreId: string,
  ctx: ScoringContext,
  seen: string[] = [],
): AchievableResult {
  if (seen.includes(scoreId)) {
    return { range: { min: 0, max: 0 }, unresolved: [`cycle:${[...seen, scoreId].join('->')}`] };
  }

  const score = ctx.scores.find(s => s.id === scoreId);
  if (!score) return { range: { min: 0, max: 0 }, unresolved: [`score:${scoreId}`] };

  const profile = ctx.profiles[score.profile_id];
  if (!profile) return { range: { min: 0, max: 0 }, unresolved: [`profile:${score.profile_id}`] };

  const unresolved: string[] = [];

  if (profile.calc === 'from_scores') {
    let min = 0;
    let max = 0;
    for (const memberId of score.from_scores ?? []) {
      const member = achievableRange(memberId, ctx, [...seen, scoreId]);
      unresolved.push(...member.unresolved);
      min += member.range.min;
      max += member.range.max;
    }
    return { range: { min: round(min), max: round(max) }, unresolved };
  }

  const byId = new Map(ctx.questions.map(q => [q.id, q]));
  const ranges: Range[] = [];

  for (const item of score.items ?? []) {
    const question = byId.get(item.question_id);
    if (!question) {
      // Loudly unresolved. v1's optionValue() would have scored a missing
      // question as zero, which is indistinguishable from a real floor.
      unresolved.push(item.question_id);
      continue;
    }
    const scale = question.scale_ref ? ctx.scales[question.scale_ref] : undefined;
    if (!scale) {
      unresolved.push(`scale:${item.question_id}`);
      continue;
    }
    ranges.push(itemRange(scale, item));
  }

  if (ranges.length === 0) return { range: { min: 0, max: 0 }, unresolved };

  const sumMin = ranges.reduce((a, r) => a + r.min, 0);
  const sumMax = ranges.reduce((a, r) => a + r.max, 0);

  switch (profile.calc) {
    case 'mean':
      return {
        range: { min: round(sumMin / ranges.length), max: round(sumMax / ranges.length) },
        unresolved,
      };
    case 'sum_times_k': {
      const k = profile.k ?? 1;
      return { range: { min: round(sumMin * k), max: round(sumMax * k) }, unresolved };
    }
    default:
      return { range: { min: round(sumMin), max: round(sumMax) }, unresolved };
  }
}

// ── Band tiling ──────────────────────────────────────────────────────────────

export type BandIssueKind =
  | 'gap'
  | 'overlap'
  | 'floor-mismatch'
  | 'ceiling-mismatch'
  | 'empty'
  | 'inverted'
  | 'collapsed';

export interface BandIssue {
  kind: BandIssueKind;
  severity: 'amber' | 'red';
  message: string;
  bandIds: string[];
}

export interface TilingReport {
  status: 'green' | 'amber' | 'red';
  issues: BandIssue[];
  /** Bands with percent edges resolved into score space. */
  resolved: ScoringBand[];
}

/**
 * Resolve percent-basis edges against a concrete achievable range.
 *
 * `raw_edge = min + (pct / 100) * (max - min)`
 */
export function resolveBandEdges(
  bands: ScoringBand[],
  basis: 'percent' | 'absolute',
  range: Range,
): ScoringBand[] {
  if (basis === 'absolute') return bands.map(b => ({ ...b }));
  const span = range.max - range.min;
  return bands.map(b => ({
    ...b,
    min: round(range.min + (b.min / 100) * span),
    max: round(range.max === range.min ? range.min : range.min + (b.max / 100) * span),
  }));
}

/**
 * Verify that a band set tiles its achievable range exactly.
 *
 * Four conditions, all required for green:
 *   1. first band starts at the achievable floor
 *   2. last band ends at the achievable ceiling
 *   3. every adjacent pair meets exactly — `next.min === prev.max`
 *   4. no pair overlaps
 *
 * Overlap is red rather than amber: two bands claiming one score means the
 * result depends on which the lookup loop reaches first, which is a coin flip
 * dressed as a configuration.
 */
export function validateBandTiling(
  bands: ScoringBand[],
  range: Range,
  basis: 'percent' | 'absolute' = 'absolute',
): TilingReport {
  const issues: BandIssue[] = [];

  if (bands.length === 0) {
    return {
      status: 'amber',
      issues: [{ kind: 'empty', severity: 'amber', message: 'No bands defined.', bandIds: [] }],
      resolved: [],
    };
  }

  const resolved = resolveBandEdges(bands, basis, range).sort((a, b) => a.min - b.min);

  for (const b of resolved) {
    if (b.max < b.min) {
      issues.push({
        kind: 'inverted',
        severity: 'red',
        message: `Band "${b.label}" ends (${b.max}) before it starts (${b.min}).`,
        bandIds: [b.id],
      });
    } else if (b.max === b.min) {
      // A zero-width half-open interval [x, x) can never match any score.
      issues.push({
        kind: 'collapsed',
        severity: 'red',
        message:
          `Band "${b.label}" collapsed to a single point (${b.min}) — no score can ever fall in it. ` +
          `A percent band can collapse against a short scale; widen it or use absolute edges.`,
        bandIds: [b.id],
      });
    }
  }

  if (resolved[0].min !== range.min) {
    issues.push({
      kind: 'floor-mismatch',
      severity: 'amber',
      message: `${range.min}–${resolved[0].min} uncovered: the lowest band starts above the achievable minimum.`,
      bandIds: [resolved[0].id],
    });
  }

  const last = resolved[resolved.length - 1];
  if (last.max !== range.max) {
    issues.push({
      kind: 'ceiling-mismatch',
      severity: 'amber',
      message: `${last.max}–${range.max} uncovered: the highest band ends below the achievable maximum.`,
      bandIds: [last.id],
    });
  }

  for (let i = 1; i < resolved.length; i++) {
    const prev = resolved[i - 1];
    const cur = resolved[i];
    if (cur.min > prev.max) {
      issues.push({
        kind: 'gap',
        severity: 'amber',
        message: `${prev.max}–${cur.min} uncovered between "${prev.label}" and "${cur.label}".`,
        bandIds: [prev.id, cur.id],
      });
    } else if (cur.min < prev.max) {
      issues.push({
        kind: 'overlap',
        severity: 'red',
        message: `"${prev.label}" and "${cur.label}" both claim ${cur.min}–${prev.max}.`,
        bandIds: [prev.id, cur.id],
      });
    }
  }

  const status = issues.some(i => i.severity === 'red')
    ? 'red'
    : issues.length > 0
      ? 'amber'
      : 'green';

  return { status, issues, resolved };
}

/**
 * Band containing `value`, using half-open intervals.
 *
 * The final band is closed at the top so the achievable maximum itself lands
 * somewhere. Bands must be pre-resolved (see `resolveBandEdges`).
 */
export function bandForValue(value: number, bands: ScoringBand[]): ScoringBand | undefined {
  if (bands.length === 0) return undefined;
  const sorted = [...bands].sort((a, b) => a.min - b.min);
  const last = sorted[sorted.length - 1];

  for (const b of sorted) {
    if (b === last) {
      if (value >= b.min && value <= b.max) return b;
    } else if (value >= b.min && value < b.max) {
      return b;
    }
  }
  return undefined;
}

/** How the editor should render a half-open band. Never a bare dash. */
export function formatBandInterval(band: ScoringBand, isLast: boolean): string {
  return isLast
    ? `${band.min} ≤ score ≤ ${band.max}`
    : `${band.min} ≤ score < ${band.max}`;
}

// ── Coverage meter ───────────────────────────────────────────────────────────

export interface CoverageAssignment {
  questionId: string;
  text?: string;
  scoreIds: string[];
}

export interface CoverageReport {
  status: 'green' | 'amber' | 'red';
  /** Questions where is_scored !== false and not retired. */
  denominator: number;
  /** Of those, the ones assigned to at least one score. */
  numerator: number;
  assigned: CoverageAssignment[];
  unassigned: CoverageAssignment[];
  /** Deliberately excluded — is_scored === false. Shown, never silent. */
  excluded: CoverageAssignment[];
  issues: BandIssue[];
}

/**
 * Coverage for a whole assessment.
 *
 * Denominator is every question with `is_scored !== false` that is not retired.
 * Numerator is those appearing in at least one `score.items[]`.
 *
 * Double assignment is legal and not an error: `general-q3` legitimately feeds
 * `depression`, `overall`, and later a `phq2-screen`. Only *zero* assignments
 * count against the meter. Excluding a question is a deliberate act that shows
 * up in `excluded` — the difference between that and a silent omission is the
 * entire point of the meter.
 */
export function computeCoverage(ctx: ScoringContext): CoverageReport {
  const assignedTo = new Map<string, string[]>();
  for (const score of ctx.scores) {
    for (const item of score.items ?? []) {
      const list = assignedTo.get(item.question_id) ?? [];
      list.push(score.id);
      assignedTo.set(item.question_id, list);
    }
  }

  const assigned: CoverageAssignment[] = [];
  const unassigned: CoverageAssignment[] = [];
  const excluded: CoverageAssignment[] = [];

  for (const q of ctx.questions) {
    if (q.retired_at) continue; // leaves both numerator and denominator
    const entry: CoverageAssignment = {
      questionId: q.id,
      text: q.text,
      scoreIds: assignedTo.get(q.id) ?? [],
    };
    if (q.is_scored === false) excluded.push(entry);
    else if (entry.scoreIds.length > 0) assigned.push(entry);
    else unassigned.push(entry);
  }

  const issues: BandIssue[] = [];
  const knownScoreIds = new Set(ctx.scores.map(s => s.id));

  for (const score of ctx.scores) {
    const profile = ctx.profiles[score.profile_id];
    if (!profile) {
      issues.push({
        kind: 'empty',
        severity: 'red',
        message: `Score "${score.label}" references missing profile ${score.profile_id}.`,
        bandIds: [],
      });
      continue;
    }

    if (profile.calc === 'from_scores') {
      for (const memberId of score.from_scores ?? []) {
        if (!knownScoreIds.has(memberId)) {
          issues.push({
            kind: 'empty',
            severity: 'red',
            message: `Score "${score.label}" composes unknown score ${memberId}.`,
            bandIds: [],
          });
        }
      }
      if ((score.from_scores ?? []).length === 0) {
        issues.push({
          kind: 'empty',
          severity: 'amber',
          message: `Score "${score.label}" composes no other scores.`,
          bandIds: [],
        });
      }
    } else if ((score.items ?? []).length === 0) {
      issues.push({
        kind: 'empty',
        severity: 'amber',
        message: `Score "${score.label}" has no items.`,
        bandIds: [],
      });
    }

    const { range, unresolved } = achievableRange(score.id, ctx);
    for (const u of unresolved) {
      issues.push({
        kind: 'empty',
        severity: 'red',
        message: u.startsWith('cycle:')
          ? `Score "${score.label}" composes itself (${u.slice(6)}).`
          : `Score "${score.label}": unresolved item ${u}.`,
        bandIds: [],
      });
    }
    if (unresolved.length === 0) {
      issues.push(...validateBandTiling(profile.bands, range, profile.band_basis).issues);
    }
  }

  const status = issues.some(i => i.severity === 'red')
    ? 'red'
    : unassigned.length > 0 || issues.length > 0
      ? 'amber'
      : 'green';

  return {
    status,
    denominator: assigned.length + unassigned.length,
    numerator: assigned.length,
    assigned,
    unassigned,
    excluded,
    issues,
  };
}

// ── Preview ──────────────────────────────────────────────────────────────────

export interface PreviewOutcome {
  value: number;
  band?: ScoringBand;
  severity?: SeverityLevel;
  tier?: ResponseTier;
}

export interface ScorePreview {
  scoreId: string;
  label: string;
  range: Range;
  atMin: PreviewOutcome;
  atMax: PreviewOutcome;
  unresolved: string[];
}

/**
 * All-min / all-max preview for one score.
 *
 * The endpoints are the two answers most likely to expose a backwards
 * direction or an untiled ceiling, and they need no fixture data. A
 * `higher_is_better` instrument should show its *worst* severity at the
 * minimum — the exact inversion that shipped once already in Balance.
 */
export function previewScore(scoreId: string, ctx: ScoringContext): ScorePreview | null {
  const score = ctx.scores.find(s => s.id === scoreId);
  if (!score) return null;
  const profile = ctx.profiles[score.profile_id];
  if (!profile) return null;

  const { range, unresolved } = achievableRange(scoreId, ctx);
  const resolved = resolveBandEdges(profile.bands, profile.band_basis, range);

  const outcome = (value: number): PreviewOutcome => {
    const band = bandForValue(value, resolved);
    return {
      value,
      band,
      severity: band?.severity_ref,
      tier: band ? tierFor(band.severity_ref, profile.tier_map) : undefined,
    };
  };

  return {
    scoreId,
    label: score.label,
    range,
    atMin: outcome(range.min),
    atMax: outcome(range.max),
    unresolved,
  };
}

// ── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Numeric value of a stored answer, or null when it does not resolve.
 *
 * Answers are stored as the option's **label**, so this matches on text. There
 * is deliberately no leading-digit fallback: whether the digit equals the value
 * differs per assessment (Stress `digit = value`, Anxiety `digit - 1 = value`),
 * and several assessments carry answers from a replaced scale whose labels
 * collide with the current ones at a different value. A wrong number here is
 * invisible, so an unresolvable answer stays unresolved.
 */
export function resolveAnswer(scale: Scale, answer: unknown): number | null {
  if (answer === undefined || answer === null || answer === '') return null;
  const text = String(answer);
  const hit = scale.options.find(o => o.label === text);
  return hit ? hit.value : null;
}

export interface ScoreResult {
  id: string;
  label: string;
  /** Null when the score could not be computed; see `invalidReason`. */
  value: number | null;
  range: Range;
  /** 0-100, oriented so higher always means more of what the label names. */
  percent: number;
  answered: number;
  expected: number;
  complete: boolean;
  direction: ScoringProfile['direction'];
  band?: ScoringBand;
  severity?: SeverityLevel;
  tier?: ResponseTier;
  /** Set when the score is deliberately not produced. Never a fabricated band. */
  invalidReason?: string;
  /** Mirrors `AssessmentScore.primary`; the headline for rule matching. */
  primary?: boolean;
}

function aggregate(values: number[], profile: ScoringProfile): number {
  const sum = values.reduce((a, b) => a + b, 0);
  switch (profile.calc) {
    case 'mean': return values.length > 0 ? sum / values.length : 0;
    case 'sum_times_k': return sum * (profile.k ?? 1);
    default: return sum;
  }
}

/**
 * Compute every score on an assessment from a response map.
 *
 * Honours each profile's `missing` policy rather than quietly scoring a partial
 * instrument as if it were complete:
 *   `invalidate` — below `min_answered`, produce no value and say why
 *   `prorate`    — scale the answered items up to the full item count
 *   `zero`       — treat an unanswered item as contributing zero
 */
export function computeScores(
  ctx: ScoringContext,
  responses: Record<string, unknown>,
  catalogTierMap?: Record<string, string>,
): ScoreResult[] {
  const byId = new Map(ctx.questions.map(q => [q.id, q]));

  return ctx.scores.map((score): ScoreResult => {
    const profile = ctx.profiles[score.profile_id];
    const { range, unresolved } = achievableRange(score.id, ctx);
    const base = {
      id: score.id, label: score.label, range, primary: score.primary === true,
      direction: profile?.direction ?? 'higher_is_distress',
    };

    if (!profile) {
      return { ...base, value: null, percent: 0, answered: 0, expected: 0, complete: false,
        invalidReason: `No scoring profile "${score.profile_id}".` };
    }
    if (unresolved.length > 0) {
      return { ...base, value: null, percent: 0, answered: 0, expected: 0, complete: false,
        invalidReason: `Unresolved: ${unresolved.join(', ')}.` };
    }

    const items = score.items ?? [];
    const expected = items.length;
    const values: number[] = [];

    for (const item of items) {
      const question = byId.get(item.question_id);
      const scale = question?.scale_ref ? ctx.scales[question.scale_ref] : undefined;
      if (!scale) continue;
      const raw = resolveAnswer(scale, responses[item.question_id]);
      if (raw === null) {
        if (profile.missing?.on_missing === 'zero') values.push(0);
        continue;
      }
      const scaleValues = scale.options.map(o => o.value);
      const lo = Math.min(...scaleValues);
      const hi = Math.max(...scaleValues);
      const transformed = item.reverse ? hi + lo - raw : raw;
      values.push(transformed * (item.weight ?? 1));
    }

    const answered = items.reduce((n, item) => {
      const q = byId.get(item.question_id);
      const sc = q?.scale_ref ? ctx.scales[q.scale_ref] : undefined;
      return n + (sc && resolveAnswer(sc, responses[item.question_id]) !== null ? 1 : 0);
    }, 0);

    const minAnswered = profile.missing?.min_answered ?? 0;
    if (answered < minAnswered) {
      return { ...base, value: null, percent: 0, answered, expected, complete: false,
        invalidReason: `${answered} of ${expected} items answered; this score needs at least ${minAnswered}.` };
    }

    let value = aggregate(values, profile);
    if (profile.missing?.on_missing === 'prorate' && answered > 0 && answered < expected
        && profile.calc !== 'mean') {
      value = value * (expected / answered);
    }
    value = round(value);

    const resolved = resolveBandEdges(profile.bands ?? [], profile.band_basis, range);
    const band = bandForValue(value, resolved);
    const span = range.max - range.min;
    const rawPercent = span > 0 ? ((value - range.min) / span) * 100 : 0;

    return {
      ...base,
      value,
      // Position within the achievable range. Higher always means more of what
      // the label names — more wellbeing for WHO-5, more anxiety for GAD-7 —
      // so callers must read `direction` before colouring it.
      percent: round(rawPercent),
      answered,
      expected,
      complete: answered === expected,
      band,
      severity: band?.severity_ref,
      tier: band ? tierFor(band.severity_ref, profile.tier_map, catalogTierMap) : undefined,
    };
  });
}
