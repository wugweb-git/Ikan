/**
 * One view model for an assessment result, computed once.
 *
 * Production renders the same result with different severities on two screens.
 * Measured on 3 Sep: Burnout 60/115 reads "Low" green on the dashboard and
 * "Moderate" yellow one tap later in history; General 46/96 does the same.
 * The dashboard calls `evaluateAssessment` per historical row and re-derives a
 * tier from score and max; the history screen reads the band the scoring spec
 * authored. Two sources, two answers, and the user is the one who has to
 * reconcile them.
 *
 * The fix is not to patch the dashboard. Every card defect found this month has
 * the same shape — a surface handed data it cannot render honestly, then
 * improvising — so this module is the single place that decides, and the
 * surfaces render what it returns.
 *
 * ## What this will not do
 *
 * - **Never re-derive a band.** The band comes from the stored record or it is
 *   null, and null renders nothing. There is no fallback tier. A percentage
 *   cannot produce one honestly: it needs the instrument's own cut points,
 *   which is exactly what the band already is.
 * - **Never invent a denominator.** `raw` is null when `max_score` is absent.
 *   Not `score/score`, not 100, not 21.
 * - **Never infer direction.** It is declared on the spec. Half these
 *   instruments are higher-is-better and nothing on a result record says so.
 *
 * `change` deliberately is not computed here: one result cannot know what came
 * before it. `withChange` fills it given the list.
 */

/**
 * How a band should read, authored on the band itself.
 *
 * NOT a lookup from the severity word. There are four live severity
 * vocabularies — 5 clinical terms in `scoring-engine.ts`, 3 response tiers, a
 * 4-term one in the server's `shared-types.ts`, and band labels like "Poor
 * Sleep" and "Completed" that belong to no vocabulary at all. Every colour bug
 * this month came from a word-to-colour map falling through to a default.
 */
export type Tone = 'good' | 'watch' | 'concern' | 'urgent';

export const TONE_ORDER: Tone[] = ['good', 'watch', 'concern', 'urgent'];

export function isTone(v: unknown): v is Tone {
  return typeof v === 'string' && (TONE_ORDER as string[]).includes(v);
}

export type Direction = 'higher-is-distress' | 'higher-is-wellbeing';

/**
 * Why a result may not be comparable to the others.
 *
 * - `ok`        — scored under the current spec, complete.
 * - `pre-spec`  — predates the spec and could not be re-scored honestly. Its
 *                 stored score is untouched and it carries
 *                 `excluded_from_trends`, so it is checked BEFORE `excluded`:
 *                 it is the more specific statement of the same fact.
 * - `excluded`  — kept out of trends for some other reason.
 * - `partial`   — fewer items answered than the instrument expects.
 */
export type Integrity = 'ok' | 'pre-spec' | 'excluded' | 'partial';

export interface ResultPresentation {
  instrument: { id: string; name: string; categoryLabel: string };
  /**
   * The stored band. Null means the record carries none — render nothing.
   *
   * `tone` is null when the band has not been authored with one yet; a caller
   * renders that neutral. It is deliberately nullable rather than defaulted:
   * guessing a tone from the label is the bug this type exists to prevent.
   *
   * `of === 0` means the spec declares no bands, so no band track can be drawn.
   * `index === -1` means the stored label is not in the spec's band list — the
   * label still renders, the track does not.
   */
  band: { label: string; tone: Tone | null; index: number; of: number } | null;
  direction: Direction;
  /** Null whenever `max_score` is absent. Never defaulted. */
  raw: { score: number; max: number } | null;
  completedAt: string;
  /** Filled by `withChange`, which needs list context. Null here. */
  change: { fromLabel: string; delta: 'improved' | 'worsened' | 'same' } | null;
  integrity: Integrity;
  partial?: { answered: number; expected: number };
}

/** The shape this reads off an assessment definition. Structural on purpose. */
export interface SpecLike {
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  scores?: {
    id?: string;
    direction?: string;
    bands?: { label?: string; severity_ref?: string; tone?: string }[];
  }[];
}

function firstScore(spec: SpecLike | null | undefined) {
  return Array.isArray(spec?.scores) && spec.scores.length > 0 ? spec.scores[0] : null;
}

/**
 * Direction, declared or defaulted to distress.
 *
 * The default is not a guess about the instrument — it is the safer of the two
 * when a spec has not said. Distress framing under-claims improvement rather
 * than over-claiming it, and `withChange` refuses to compare rows whose
 * direction was never declared anyway.
 */
function directionOf(spec: SpecLike | null | undefined): Direction {
  const d = firstScore(spec)?.direction;
  return d === 'higher-is-better' || d === 'higher-is-wellbeing'
    ? 'higher-is-wellbeing'
    : 'higher-is-distress';
}

/** The stored band label, from wherever the record actually put it. */
function storedBand(result: any): { label: string; severityRef: string | null } | null {
  const candidates = [
    result?.section_scores?.overall?.band,
    result?.sectionScores?.overall?.band,
    result?.interpretation,
    result?.engine_result?.band,
  ];
  for (const c of candidates) {
    const label = typeof c?.label === 'string' ? c.label.trim() : '';
    if (label) {
      const ref = typeof c?.severity_ref === 'string' ? c.severity_ref : null;
      return { label, severityRef: ref };
    }
  }
  return null;
}

function integrityOf(result: any): { integrity: Integrity; partial?: { answered: number; expected: number } } {
  const prov = result?.scoring_provenance ?? result?.scoringProvenance ?? null;

  // pre-spec before excluded: a pre-spec row also carries excluded_from_trends,
  // and reporting it as merely "excluded" loses the reason.
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

export function resolveResultPresentation(result: any, spec?: SpecLike | null): ResultPresentation {
  const bands = firstScore(spec)?.bands ?? [];
  const stored = storedBand(result);

  let band: ResultPresentation['band'] = null;
  if (stored) {
    // Placed by severity_ref first — that is the field the rules matched on and
    // it survives a label rewording. Falls back to an exact label match.
    let index = stored.severityRef
      ? bands.findIndex((b) => b?.severity_ref === stored.severityRef)
      : -1;
    if (index < 0) index = bands.findIndex((b) => b?.label === stored.label);

    const authored = index >= 0 ? bands[index]?.tone : undefined;
    band = {
      label: stored.label,
      tone: isTone(authored) ? authored : null,
      index,
      of: bands.length,
    };
  }

  const score = result?.score;
  const max = result?.max_score ?? result?.maxScore;
  const raw =
    typeof score === 'number' && typeof max === 'number' && max > 0
      ? { score, max }
      : null;

  const { integrity, partial } = integrityOf(result);

  const out: ResultPresentation = {
    instrument: {
      id: result?.assessment_id ?? result?.assessmentId ?? spec?.id ?? '',
      name: spec?.title ?? spec?.name ?? result?.assessment_name ?? result?.assessmentName ?? '',
      categoryLabel: spec?.category ?? result?.category ?? '',
    },
    band,
    direction: directionOf(spec),
    raw,
    completedAt: result?.completed_at ?? result?.completedAt ?? '',
    change: null,
    integrity,
  };
  if (partial) out.partial = partial;
  return out;
}

/**
 * Fill `change` on each row by comparing it to the previous comparable run of
 * the same instrument.
 *
 * Rows whose integrity is `excluded` or `pre-spec` are **skipped, not compared
 * through**: they were scored against a different item set or a different
 * option scale, so a delta against one is arithmetic on two different
 * instruments. A skipped row still appears in the output with `change: null`;
 * the row after it compares to the last comparable run before it.
 *
 * Grouped by `instrument.id` rather than slug. 92 question ids were renamed
 * once already and slugs are not stable; the definition id is.
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
    // Oldest first, so "the previous comparable run" is simply the last one
    // kept. Ties keep their input order.
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
