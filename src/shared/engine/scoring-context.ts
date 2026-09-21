/**
 * Adapter: live assessment record → `ScoringContext`.
 *
 * `scoring-engine.ts` is pure and expects each question to name a `scale_ref`
 * resolving to a shared `Scale` whose options carry explicit values. No live
 * question does that yet — scales are authored per assessment during step 4 of
 * the scoring rollout. Until then this module derives a private scale per
 * question so the coverage meter, achievable range and preview all work on
 * today's data instead of waiting for the migration.
 *
 * It also records **where each option's value came from**, which is the useful
 * part. Three provenances, best to worst:
 *
 *   `option-value`  the option object carries an explicit `value`. The target
 *                   state. Nothing in the live bank does this yet (0 of 438).
 *   `question-map`  the question's own `scoring` map states a weight per option
 *                   text. All 92 live questions do this, and every one of the
 *                   438 weights happens to equal the option's index — so the
 *                   two scoring paths in the app agree today by coincidence,
 *                   not by construction.
 *   `index`         nothing states a value, so array position is the weight.
 *                   This is the assumption that forced `offset: 1` onto every
 *                   BAT and BRS config, and it is what step 4 removes.
 */

import type { Scale, ScaleOption, ScorableQuestion, ScoringContext } from './scoring-engine';

export type ValueProvenance = 'option-value' | 'question-map' | 'index';

export interface DerivedScale {
  scale: Scale;
  provenance: ValueProvenance;
  /** True when at least one option resolved differently than its index. */
  differsFromIndex: boolean;
}

/** Any question shape the live records actually use. */
export interface RawQuestion {
  id: string;
  text?: string;
  options?: unknown;
  /** Option text → weight. The live per-question weight map. */
  scoring?: unknown;
  scale_ref?: string;
  is_scored?: boolean;
  is_risk_indicator?: boolean;
  retired_at?: string | null;
}

function optionsOf(question: RawQuestion): unknown[] {
  const raw = question.options;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function optionLabel(option: unknown): string {
  if (typeof option === 'string') return option;
  if (typeof option === 'number') return String(option);
  if (option && typeof option === 'object') {
    const o = option as Record<string, unknown>;
    return String(o.text ?? o.label ?? o.value ?? '');
  }
  return '';
}

/** The private scale implied by one question's own options. */
export function deriveScale(question: RawQuestion): DerivedScale {
  const raw = optionsOf(question);
  const map =
    question.scoring && typeof question.scoring === 'object' && !Array.isArray(question.scoring)
      ? (question.scoring as Record<string, unknown>)
      : null;

  let provenance: ValueProvenance = 'option-value';
  let sawQuestionMap = false;
  let sawIndex = false;

  const options: ScaleOption[] = raw.map((opt, index) => {
    const label = optionLabel(opt);

    if (opt && typeof opt === 'object') {
      const o = opt as Record<string, unknown>;
      const explicit = typeof o.value === 'number' ? o.value : typeof o.score === 'number' ? o.score : null;
      if (explicit !== null) return { label, value: explicit };
    }

    const mapped = map ? map[label] : undefined;
    const asNumber = typeof mapped === 'number' ? mapped : typeof mapped === 'string' && mapped.trim() !== '' && !Number.isNaN(Number(mapped)) ? Number(mapped) : null;
    if (asNumber !== null) {
      sawQuestionMap = true;
      return { label, value: asNumber };
    }

    sawIndex = true;
    return { label, value: index };
  });

  // Worst provenance wins — a scale is only as trustworthy as its weakest option.
  if (sawIndex) provenance = 'index';
  else if (sawQuestionMap) provenance = 'question-map';

  return {
    scale: { id: `q:${question.id}`, label: question.text ?? question.id, options },
    provenance,
    differsFromIndex: options.some((o, i) => o.value !== i),
  };
}

export interface BuiltContext {
  ctx: ScoringContext;
  /** Per question id, how its option values were resolved. */
  provenance: Record<string, ValueProvenance>;
  /**
   * Questions whose option values were **inferred** rather than declared —
   * provenance `question-map` or `index`.
   *
   * Declaring values inline on the options counts as declared; a shared
   * `scale_ref` is one way to get there, not the only one.
   *
   * Fine for preview — the numbers are right for today's data. Not fine for a
   * *saved spec*: a stored result computed against an inferred scale has an
   * inferred denominator, and nothing downstream can tell that apart from a
   * declared one. Authoring is gated on this being empty, otherwise step 4's
   * `scale_ref` work becomes optional in practice — it would work well enough
   * without it, so it would never get done.
   */
  derivedScale: string[];
  /** Questions whose values came from array position alone. */
  indexDerived: string[];
  /** Questions with no options at all — they cannot contribute to a score. */
  optionless: string[];
}

/**
 * Build a `ScoringContext` from a live assessment record.
 *
 * A question keeps its own `scale_ref` when it has one and that scale exists in
 * `scales`; otherwise it gets the private `q:<id>` scale derived above. That
 * way step 4 can introduce shared catalog scales one question at a time without
 * this adapter needing to change.
 */
export function buildScoringContext(input: {
  questions: RawQuestion[];
  scores: ScoringContext['scores'];
  profiles: ScoringContext['profiles'];
  scales?: Record<string, Scale>;
}): BuiltContext {
  const scales: Record<string, Scale> = { ...(input.scales ?? {}) };
  const questions: ScorableQuestion[] = [];
  const provenance: Record<string, ValueProvenance> = {};
  const derivedScale: string[] = [];
  const indexDerived: string[] = [];
  const optionless: string[] = [];

  for (const q of input.questions ?? []) {
    if (!q?.id) continue;

    const hasSharedScale = !!q.scale_ref && !!scales[q.scale_ref];
    let scaleRef = q.scale_ref;

    if (!hasSharedScale) {
      const derived = deriveScale(q);
      scaleRef = derived.scale.id;
      scales[derived.scale.id] = derived.scale;
      provenance[q.id] = derived.provenance;
      // The gate is on *provenance*, not on where the scale lives. A question
      // whose own options carry explicit values is fully declared — that is
      // the target state, and a shared `scale_ref` is only one way to reach
      // it. Values inferred from a weight map or from array position are not.
      if (derived.provenance !== 'option-value') derivedScale.push(q.id);
      if (derived.provenance === 'index') indexDerived.push(q.id);
      if (derived.scale.options.length === 0) optionless.push(q.id);
    } else {
      provenance[q.id] = 'option-value';
      if ((scales[scaleRef!].options ?? []).length === 0) optionless.push(q.id);
    }

    questions.push({
      id: q.id,
      text: q.text,
      scale_ref: scaleRef,
      is_scored: q.is_scored,
      is_risk_indicator: q.is_risk_indicator,
      retired_at: q.retired_at ?? null,
    });
  }

  return {
    ctx: { questions, scales, profiles: input.profiles, scores: input.scores },
    provenance,
    derivedScale,
    indexDerived,
    optionless,
  };
}

// ── Presentation adapter ─────────────────────────────────────────────────────

import type { ScoreResult } from './scoring-engine';

/**
 * `ScoreResult[]` -> the `SectionScoreResult` shape `SectionReportCard` renders.
 *
 * Which score is the "overall" is decided by id rather than guessed from item
 * coverage: a single-score assessment is its own overall, and a multi-score one
 * has an overall only if a score declares itself as such. General deliberately
 * has none — five independent scales, no total.
 */
export function toSectionScoreResult(results: ScoreResult[]): {
  sectioned: boolean;
  sections: any[];
  overall?: any;
} {
  const toSection = (r: ScoreResult) => ({
    id: r.id,
    label: r.label,
    direction: r.direction === 'higher_is_better' ? 'higher-is-better' : 'higher-is-distress',
    value: r.value ?? 0,
    max: r.range.max,
    percent: r.percent,
    answered: r.answered,
    expected: r.expected,
    complete: r.complete,
    // Absent when the score is unbanded or invalid — the report card renders
    // "Not banded" rather than inventing a label.
    // severity_ref is carried, not dropped. It is the clinical term the
    // recommendation engine matches on; discarding it here forced the engine
    // to re-derive severity from a profile id and a score, which is how a
    // Burnout mean of 2.61 got looked up as 60 against 1-5 bands and resolved
    // to null.
    band: r.band
      ? { min: r.band.min, max: r.band.max, label: r.band.label,
          description: r.band.interpretation, severity_ref: r.band.severity_ref }
      : undefined,
    severity: r.severity,
  });

  if (results.length === 0) return { sectioned: false, sections: [] };
  if (results.length === 1) {
    return { sectioned: true, sections: [], overall: toSection(results[0]) };
  }

  // A declared `primary` wins over the id convention. The convention alone
  // matched burnout's `bat-overall` but not depression's `phq9-total` or
  // anxiety's `gad7-total`, so those two had no overall at all.
  const primaryIdx = results.findIndex(r => (r as any).primary === true);
  const overallIdx = primaryIdx >= 0
    ? primaryIdx
    : results.findIndex(r => r.id === 'overall' || r.id.endsWith('-overall'));
  const overall = overallIdx >= 0 ? toSection(results[overallIdx]) : undefined;
  const sections = results.filter((_, i) => i !== overallIdx).map(toSection);
  return { sectioned: true, sections, overall };
}
