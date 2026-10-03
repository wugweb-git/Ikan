/**
 * One view model for an assessment result, computed once.
 *
 * Production renders the same result with different severities on two screens.
 * The dashboard used to re-derive a tier from score and max; the history screen
 * reads the band the scoring spec authored. Two sources, two answers, and the
 * user is the one who has to reconcile them.
 *
 * ## What this will not do
 *
 * - **Never re-derive a band.** The band comes from the instrument's own cut
 *   points or it is null, and null renders nothing. There is no fallback tier.
 * - **Never invent a denominator.** `raw` is null when `max_score` is absent.
 * - **Never infer direction.** It is declared on the profile.
 *
 * ## Corrected 2026-09-03, after the first version shipped wrong three ways
 *
 * The first cut of this module was written against a spec shape I assumed
 * rather than measured, and every one of the three mistakes was invisible
 * because the tests encoded the same assumptions:
 *
 * 1. It declared its own four-term tone vocabulary (`good | watch | concern |
 *    urgent`). Every authored band has always used `success | warning | error`,
 *    which `scoring-engine.ts` declares. So the tone guard rejected every real
 *    value and nulled all of them — and that was read as "no band carries a
 *    tone yet, someone must backfill seven records". There was nothing to
 *    backfill. The data was right and the type was wrong.
 * 2. It read bands from `spec.scores[].bands`. Live `assessment_def.scores[]`
 *    entries carry exactly four keys — `id, items, label, profile_id` — and no
 *    bands at all. Bands live on `scoring-profile:{id}` records. So `of` was
 *    always 0 and `index` always -1, and no band track could ever be drawn.
 * 3. It matched `direction` as `higher-is-better` with hyphens. The data says
 *    `higher_is_better` with underscores, so every wellbeing instrument would
 *    have fallen through to distress and read backwards — the precise bug this
 *    module exists to prevent. It did not bite only because the sampled
 *    profiles were all distress.
 *
 * The lesson worth keeping: a test that builds its fixture from the same
 * assumption as the code under test proves the code is self-consistent, not
 * that it is right. The fixtures below are copied from live records.
 */

/**
 * How a band should read, authored on the band itself.
 *
 * These three terms, not a fourth set: `scoring-engine.ts` declares them, the
 * admin editor writes them, and every live band carries one. Reusing them
 * costs no content write; inventing a vocabulary cost a false blocker.
 *
 * NOT a lookup from the severity word. Four severity vocabularies are live —
 * 5 clinical terms, 3 response tiers, a 4-term one server-side, plus band
 * labels like "Poor Sleep" and "Completed" belonging to none of them — and
 * every colour bug this month was a word-to-colour map falling to a default.
 */
export type Tone = 'success' | 'warning' | 'error';

export const TONE_ORDER: Tone[] = ['success', 'warning', 'error'];

export function isTone(v: unknown): v is Tone {
  return v === 'success' || v === 'warning' || v === 'error';
}

export type Direction = 'higher-is-distress' | 'higher-is-wellbeing';

/**
 * Why a result may not be comparable to the others.
 *
 * `pre-spec` is checked before `excluded` because a pre-spec row carries
 * `excluded_from_trends` too, and reporting only "excluded" loses the reason.
 */
export type Integrity = 'ok' | 'pre-spec' | 'excluded' | 'partial';

export interface ResultPresentation {
  instrument: { id: string; name: string; categoryLabel: string };
  /**
   * The band this score fell in, **placed against the instrument's own cut
   * points**. Null means it could not be placed, and a caller renders "Not
   * banded" rather than something that looks like a finding.
   *
   * There is deliberately no fallback to whatever string the record happens to
   * carry. 89 of 104 live results hold `Completed`, `Complete` or
   * `New Category` in that slot — those are status words that leaked into a
   * band field, and rendering one in the position where a result goes tells
   * the user their assessment came out "Completed". Whatever is stored is on
   * `storedLabel` instead, where nothing can mistake it for an outcome.
   *
   * When it is non-null, `index` is always a real position and `of` the band
   * count, so a band track can always be drawn from it.
   */
  band: { label: string; tone: Tone | null; index: number; of: number } | null;
  /**
   * The instrument's achievable range, from its own band set.
   *
   * Needed because a percentage is a position **within** a range, and a score
   * does not start at zero. Sleep runs 8-40: eight items whose lowest option
   * is worth 1, so 8 is the floor a person gets for answering "never" to
   * everything. Reading 24/40 as 60% treats that floor as if it were earned,
   * where the honest figure is (24-8)/32 = 50%. Every 1-5 Likert instrument
   * here overstates by roughly ten points that way; the 0-based ones agree
   * either way, which is why it went unnoticed.
   *
   * Derived from the resolved bands because a stored result does not carry the
   * floor — `max_score` was kept and `min` thrown away on the way in — while
   * the profile that banded it tiles the whole range and therefore states it.
   * Null when no profile resolved, and a caller then has nothing better than
   * `value / max`.
   */
  scale: { min: number; max: number } | null;
  /**
   * The label the record carries, unverified. Provenance, never a result.
   *
   * Useful for diagnosing which generation a row came from — a real band label
   * like "Poor Sleep" means it was scored under a spec, a status word means it
   * was not. It is not for rendering as an outcome.
   */
  storedLabel: string | null;
  direction: Direction;
  /** Null whenever `max_score` is absent. Never defaulted. */
  raw: { score: number; max: number } | null;
  completedAt: string;
  /** Filled by `withChange`, which needs list context. Null here. */
  change: { fromLabel: string; delta: 'improved' | 'worsened' | 'same' } | null;
  integrity: Integrity;
  partial?: { answered: number; expected: number };
}

/** A `scoring-profile:{id}` record. This is where bands actually live. */
export interface ProfileLike {
  id?: string;
  /** `higher_is_distress` or `higher_is_better`, underscored, as stored. */
  direction?: string;
  calc?: string;
  bands?: {
    label?: string;
    min?: number;
    max?: number;
    severity_ref?: string;
    tone?: string;
    interpretation?: string;
  }[];
}

/** An `assessment_def:{id}` record. Note: its `scores[]` carry NO bands. */
export interface SpecLike {
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  /** The primary profile. Absent on General, which has no overall score. */
  scoring_profile_id?: string;
  scores?: { id?: string; label?: string; profile_id?: string; items?: unknown[] }[];
}

/**
 * The profile a result's overall score belongs to.
 *
 * `scoring_profile_id` first, then a lone `scores[0].profile_id`. A multi-score
 * assessment with no declared primary resolves to none, which is correct:
 * General bundles five independent scales and has no overall score, so a
 * single band for it would be a fiction.
 */
export function profileIdFor(spec: SpecLike | null | undefined): string | null {
  if (spec?.scoring_profile_id) return spec.scoring_profile_id;
  const scores = Array.isArray(spec?.scores) ? spec.scores : [];
  if (scores.length === 1 && scores[0]?.profile_id) return scores[0].profile_id;
  return null;
}

/**
 * Direction, declared on the profile.
 *
 * Separator-insensitive on purpose. The store writes `higher_is_distress`; this
 * module's own type uses hyphens; the client's scoring engine has used both at
 * different times. Normalising is one line and the alternative is an instrument
 * silently reading backwards.
 */
function directionOf(profile: ProfileLike | null | undefined): Direction {
  const d = String(profile?.direction ?? '').toLowerCase().replace(/_/g, '-');
  return d === 'higher-is-better' || d === 'higher-is-wellbeing'
    ? 'higher-is-wellbeing'
    : 'higher-is-distress';
}

/** The stored band label, from wherever the record actually put it. */
function storedLabel(result: any): string | null {
  const candidates = [
    result?.section_scores?.overall?.band?.label,
    result?.sectionScores?.overall?.band?.label,
    result?.interpretation?.label,
    result?.severity_hint,
    result?.severityHint,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}

function integrityOf(result: any): { integrity: Integrity; partial?: { answered: number; expected: number } } {
  const prov = result?.scoring_provenance ?? result?.scoringProvenance ?? null;

  if (prov?.state === 'pre-spec') return { integrity: 'pre-spec' };
  if (prov?.excluded_from_trends === true || result?.excluded_from_trends === true) {
    return { integrity: 'excluded' };
  }

  const overall = result?.section_scores?.overall ?? result?.sectionScores?.overall ?? null;
  const answered = overall?.answered;
  const expected = overall?.expected;
  if (typeof answered === 'number' && typeof expected === 'number' && expected > 0 && answered < expected) {
    return { integrity: 'partial', partial: { answered, expected } };
  }

  return { integrity: 'ok' };
}

/**
 * @param result a stored `assessment_result:` record.
 * @param spec   the `assessment_def:` record, for names and the profile link.
 * @param profiles `scoring-profile:` records by id, as the client already
 *   loads them. Without them no band can be placed, because the definition
 *   does not carry any.
 */
/**
 * A score's position within its achievable range, 0-100.
 *
 * `(value - min) / (max - min)`, not `value / max`. The two agree only when
 * the floor is zero, which is true of Stress, GAD-7 and the PHQ screens and
 * false of Sleep, Balance and Burnout — so the bug is invisible on exactly the
 * instruments people check it against.
 *
 * Falls back to `value / max` when no floor is known, which is the honest
 * limit of a stored record that never recorded one. Callers should pass a
 * `scale` from `resolveResultPresentation` where they have it.
 */
export function percentOfRange(value: number, max: number, min = 0): number {
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return 0;
  const pct = ((value - min) / span) * 100;
  // A value outside its own range is a units mismatch, not a 140% result.
  return Math.round(Math.min(100, Math.max(0, pct)));
}

export function resolveResultPresentation(
  result: any,
  spec?: SpecLike | null,
  profiles?: Record<string, ProfileLike> | null,
): ResultPresentation {
  const profileId = profileIdFor(spec);
  const profile = profileId ? profiles?.[profileId] ?? null : null;
  const bands = Array.isArray(profile?.bands) ? profile!.bands! : [];

  /**
   * The value to band, which is NOT always `result.score`.
   *
   * `section_scores.overall.value` is what the client computed against this
   * profile, in the profile's own units. The top-level `score` is a legacy
   * raw sum kept for the iKAN aggregate, and for a `calc: mean` profile the
   * two are in different units entirely: the live Burnout record stores
   * `score: 60, max_score: 115` alongside `overall.value: 2.6087, max: 5`,
   * and `bat-mean`'s bands run 1-5. Banding 60 against those places it
   * nowhere; banding 2.6087 places it in "Low", which is what that record's
   * own `section_scores` already says.
   *
   * The record also shows why this ordering matters beyond units: its
   * `interpretation.label` reads "High" while its `section_scores` band reads
   * "Low". Two representations of one result, disagreeing. The computed one
   * is the one that matches the score.
   */
  const overall = result?.section_scores?.overall ?? result?.sectionScores?.overall ?? null;
  const score = typeof overall?.value === 'number' ? overall.value : result?.score;
  const max = result?.max_score ?? result?.maxScore;
  const raw =
    typeof score === 'number' && typeof max === 'number' && max > 0
      ? { score, max }
      : null;

  /**
   * Place the score in the profile's own bands.
   *
   * Half-open `[min, max)` with the last band closed, matching
   * `bandForValue`: a closed reader puts a value on a shared edge in the lower
   * band, the opposite of what the authoring means.
   */
  let band: ResultPresentation['band'] = null;
  if (typeof score === 'number' && bands.length > 0) {
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      const lo = typeof b?.min === 'number' ? b.min : -Infinity;
      const hi = typeof b?.max === 'number' ? b.max : Infinity;
      const last = i === bands.length - 1;
      if (last ? score >= lo && score <= hi : score >= lo && score < hi) {
        band = {
          label: typeof b?.label === 'string' && b.label.trim() ? b.label.trim() : '',
          tone: isTone(b?.tone) ? b.tone : null,
          index: i,
          of: bands.length,
        };
        break;
      }
    }
    // Falling out of the loop means the score sits outside every band, which in
    // practice is a units mismatch. That is a null band, not a reason to reach
    // for whatever string the record carries.
  }

  /**
   * The floor and ceiling the bands themselves tile, rather than `bands[0]`
   * and `bands[n-1]` positionally: nothing guarantees the stored order is
   * ascending, and a mis-ordered set would otherwise invert the range.
   */
  const edges = bands
    .flatMap(b => [b?.min, b?.max])
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  const scale = edges.length >= 2
    ? { min: Math.min(...edges), max: Math.max(...edges) }
    : null;

  const { integrity, partial } = integrityOf(result);

  const out: ResultPresentation = {
    instrument: {
      id: result?.assessment_id ?? result?.assessmentId ?? spec?.id ?? '',
      name: spec?.title ?? spec?.name ?? result?.assessment_name ?? result?.assessmentName ?? '',
      categoryLabel: spec?.category ?? result?.category ?? '',
    },
    band,
    scale,
    storedLabel: storedLabel(result),
    direction: directionOf(profile),
    raw,
    completedAt: result?.completed_at ?? result?.completedAt ?? '',
    change: null,
    integrity,
  };
  if (partial) out.partial = partial;
  return out;
}

/**
 * Fill `change` by comparing each row to the previous comparable run of the
 * same instrument.
 *
 * Rows whose integrity is `excluded` or `pre-spec` are **skipped, not compared
 * through**: they were scored against a different item set or option scale, so
 * a delta against one is arithmetic across two different instruments. A
 * skipped row still appears with `change: null`; the row after it compares to
 * the last comparable run before it.
 *
 * Grouped by `instrument.id`, never slug. 92 question ids were renamed once
 * already and slugs are not stable; the definition id is.
 */
export function withChange(list: ResultPresentation[]): ResultPresentation[] {
  const byInstrument = new Map<string, ResultPresentation[]>();
  for (const r of list) {
    const key = r.instrument.id;
    if (!byInstrument.has(key)) byInstrument.set(key, []);
    byInstrument.get(key)!.push(r);
  }

  const change = new Map<ResultPresentation, ResultPresentation['change']>();

  for (const rows of byInstrument.values()) {
    const ordered = [...rows].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );

    let previous: ResultPresentation | null = null;
    for (const row of ordered) {
      const comparable = row.integrity !== 'excluded' && row.integrity !== 'pre-spec';

      if (comparable && previous && previous.band && row.band &&
          previous.band.index >= 0 && row.band.index >= 0) {
        const improvedWhenLower = row.direction === 'higher-is-distress';
        const moved = row.band.index - previous.band.index;
        const delta: 'improved' | 'worsened' | 'same' =
          moved === 0 ? 'same'
            : (moved < 0) === improvedWhenLower ? 'improved' : 'worsened';
        change.set(row, { fromLabel: previous.band.label, delta });
      }

      if (comparable) previous = row;
    }
  }

  return list.map((r) => ({ ...r, change: change.get(r) ?? null }));
}
