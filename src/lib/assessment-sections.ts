/**
 * Sectioned assessment scoring.
 *
 * Some instruments are really several scales stitched into one questionnaire:
 * the General questionnaire carries GAD-2, PHQ-2, WHO-5, NGSE and the BRS, and
 * the Burnout assessment has four BAT sub-scales plus an overall index. A single
 * total score is meaningless for those — each sub-scale has its own range,
 * direction and clinical cut-offs.
 *
 * Sections are declared on the assessment definition and reference questions by
 * **id, never by position**. Positional ranges were the original spec, but the
 * stored question order does not match them (and re-ordering a question in the
 * admin would silently re-assign it to a different clinical scale), so ids are
 * the only safe key.
 *
 * This module is intentionally pure and dependency-free so it can be reasoned
 * about and tested without the player.
 */

export type SectionDirection = 'higher-is-better' | 'higher-is-distress';

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  color?: string;
}

export interface SectionConfig {
  id: string;
  label: string;
  /** Display-only provenance, e.g. "GAD-2", "WHO-5", "BAT". */
  instrument?: string;
  /** Question ids belonging to this section. Order is irrelevant. */
  questionIds: string[];
  /**
   * Ids whose value must be inverted before aggregating. The Brief Resilience
   * Scale alternates positively and negatively worded items ("I bounce back
   * quickly" vs "I have a hard time making it through"), and summing them raw
   * would have the two halves cancel out into a meaningless mid-range score.
   */
  reverseQuestionIds?: string[];
  /**
   * How many items the instrument is defined to have, when that differs from
   * how many are currently mapped. GAD-2 needs 2 items but only 1 exists in the
   * bank today, so the section must report as incomplete rather than presenting
   * a one-item score as a valid GAD-2.
   */
  expectedItems?: number;
  calc: 'sum' | 'average';
  /** Applied after sum/average. WHO-5 uses 4 to express 0-25 as a percentage. */
  multiplier?: number;
  /**
   * Added to every individual item value before aggregating. Option values are
   * derived 0-based from the option index; BAT norms are stated on a 1-5 mean,
   * so the burnout sections set this to 1.
   */
  offset?: number;
  direction: SectionDirection;
  bands?: ScoreBand[];
}

export interface SectionScore {
  id: string;
  label: string;
  instrument?: string;
  direction: SectionDirection;
  /** Final value after offset, aggregation and multiplier. */
  value: number;
  /** Highest value this section could produce, computed the same way. */
  max: number;
  /** 0-100, always oriented so higher = more of whatever the label names. */
  percent: number;
  answered: number;
  expected: number;
  /**
   * False when the section has fewer answered items than it declares. The
   * score is still returned, but a partial instrument is not clinically
   * comparable and callers should present it as incomplete rather than
   * silently treating it as a real result.
   */
  complete: boolean;
  band?: ScoreBand;
}

export interface OverallConfig {
  calc: 'sum' | 'average';
  /** Which questions feed the overall. Defaults to the union of all sections. */
  questionIds?: string[];
  multiplier?: number;
  offset?: number;
  direction?: SectionDirection;
  bands?: ScoreBand[];
  label?: string;
}

export interface SectionScoreResult {
  sections: SectionScore[];
  overall?: SectionScore;
  /** True when the definition declares sections at all. */
  sectioned: boolean;
}

type AnyQuestion = {
  id: string;
  text?: string;
  options?: unknown;
};

/**
 * Numeric value of a single option.
 *
 * Options are stored two ways in this codebase. Objects may carry an explicit
 * `value` or `score`. Plain strings — the common case — carry no number at all,
 * and the rest of the pipeline (assessment-adapter.ts) treats the array index
 * as the weight. Note the strings often *read* as 1-based ("1 Not at all"), but
 * that digit is display text stripped for rendering; the scored value is the
 * index, so GAD-2/PHQ-2 land 0-3 and WHO-5 lands 0-5 as their norms require.
 * Deviating from index-as-weight here would silently disagree with the total
 * score shown elsewhere.
 */
function optionValue(option: unknown, index: number): number {
  if (typeof option === 'number') return option;
  if (option && typeof option === 'object') {
    const o = option as Record<string, unknown>;
    if (typeof o.value === 'number') return o.value;
    if (typeof o.score === 'number') return o.score;
  }
  return index;
}

/** Comparable text for an option, used to match a stored answer back to it. */
function optionText(option: unknown): string {
  if (typeof option === 'string') return option;
  if (typeof option === 'number') return String(option);
  if (option && typeof option === 'object') {
    const o = option as Record<string, unknown>;
    return String(o.text ?? o.label ?? o.value ?? '');
  }
  return '';
}

function optionsOf(question: AnyQuestion): unknown[] {
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

/**
 * Resolve a stored answer to its numeric value, or null when unanswered.
 *
 * Matching by option text is tried before treating a numeric answer as a score,
 * because an answer of `2` is ambiguous — it may be the option "2 Several days"
 * (value 1) rather than the value 2.
 */
export function resolveAnswerValue(question: AnyQuestion, answer: unknown): number | null {
  if (answer === undefined || answer === null || answer === '') return null;

  const options = optionsOf(question);

  if (options.length > 0) {
    const idx = options.findIndex(opt => optionText(opt) === String(answer));
    if (idx >= 0) return optionValue(options[idx], idx);
  }

  if (typeof answer === 'number') return answer;
  if (typeof answer === 'string') {
    const n = Number(answer);
    if (!Number.isNaN(n)) return n;
  }

  // Multi-select: sum the matched options.
  if (Array.isArray(answer)) {
    let total = 0;
    let matched = false;
    for (const a of answer) {
      const idx = options.findIndex(opt => optionText(opt) === String(a));
      if (idx >= 0) {
        total += optionValue(options[idx], idx);
        matched = true;
      }
    }
    return matched ? total : null;
  }

  return null;
}

/** Highest value a question can contribute. */
function maxValueFor(question: AnyQuestion): number {
  const options = optionsOf(question);
  if (options.length === 0) return 0;
  return options.reduce<number>((hi, opt, i) => Math.max(hi, optionValue(opt, i)), 0);
}

function aggregate(values: number[], calc: 'sum' | 'average'): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return calc === 'average' ? sum / values.length : sum;
}

function bandFor(value: number, bands?: ScoreBand[]): ScoreBand | undefined {
  if (!bands || bands.length === 0) return undefined;
  return bands.find(b => value >= b.min && value <= b.max)
    ?? (value > bands[bands.length - 1].max ? bands[bands.length - 1] : undefined);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function scoreOne(
  cfg: { calc: 'sum' | 'average'; multiplier?: number; offset?: number; reverseQuestionIds?: string[] },
  questions: AnyQuestion[],
  responses: Record<string, unknown>,
): { value: number; max: number; answered: number } {
  const offset = cfg.offset ?? 0;
  const multiplier = cfg.multiplier ?? 1;
  const reverse = new Set(cfg.reverseQuestionIds ?? []);

  const answeredValues: number[] = [];
  for (const q of questions) {
    const v = resolveAnswerValue(q, responses[q.id]);
    if (v === null) continue;
    // Invert against this question's own scale, so mixed option counts within
    // one section still reverse correctly.
    const scored = reverse.has(q.id) ? maxValueFor(q) - v : v;
    answeredValues.push(scored + offset);
  }

  // Max is computed over every declared question, not just the answered ones,
  // so an incomplete section reports its score against the full scale rather
  // than against a shrinking denominator that would flatter a partial answer.
  const maxValues = questions.map(q => maxValueFor(q) + offset);

  return {
    value: round(aggregate(answeredValues, cfg.calc) * multiplier),
    max: round(aggregate(maxValues, cfg.calc) * multiplier),
    answered: answeredValues.length,
  };
}

/**
 * Compute every section score for an assessment.
 *
 * Returns `sectioned: false` when the definition declares no sections, letting
 * callers fall back to the existing single-score presentation.
 */
export function computeSectionScores(
  assessment: { questions?: AnyQuestion[]; sections?: SectionConfig[]; overallCalc?: OverallConfig; hasOverallScore?: boolean },
  responses: Record<string, unknown>,
): SectionScoreResult {
  const sections = assessment.sections ?? [];
  if (sections.length === 0) return { sections: [], sectioned: false };

  const byId = new Map<string, AnyQuestion>();
  for (const q of assessment.questions ?? []) {
    if (q?.id) byId.set(q.id, q);
  }

  const scored: SectionScore[] = sections.map(cfg => {
    // Silently skipping unknown ids would make a mis-typed id look like a
    // complete section, so only resolved questions count toward `expected`.
    const questions = cfg.questionIds.map(id => byId.get(id)).filter((q): q is AnyQuestion => !!q);
    const { value, max, answered } = scoreOne(cfg, questions, responses);

    const percent = max > 0 ? round((value / max) * 100) : 0;
    const expected = cfg.expectedItems ?? cfg.questionIds.length;

    return {
      id: cfg.id,
      label: cfg.label,
      instrument: cfg.instrument,
      direction: cfg.direction,
      value,
      max,
      percent,
      answered,
      expected,
      // Complete requires the instrument's full item count to be mapped, all of
      // those ids to resolve to real questions, and all of them answered.
      complete:
        questions.length === cfg.questionIds.length &&
        cfg.questionIds.length >= expected &&
        answered >= expected,
      band: bandFor(value, cfg.bands),
    };
  });

  let overall: SectionScore | undefined;
  if (assessment.hasOverallScore && assessment.overallCalc) {
    const cfg = assessment.overallCalc;
    const ids = cfg.questionIds ?? [...new Set(sections.flatMap(s => s.questionIds))];
    const questions = ids.map(id => byId.get(id)).filter((q): q is AnyQuestion => !!q);
    const { value, max, answered } = scoreOne(cfg, questions, responses);

    overall = {
      id: 'overall',
      label: cfg.label ?? 'Overall',
      direction: cfg.direction ?? 'higher-is-distress',
      value,
      max,
      percent: max > 0 ? round((value / max) * 100) : 0,
      answered,
      expected: ids.length,
      complete: answered === ids.length,
      band: bandFor(value, cfg.bands),
    };
  }

  return { sections: scored, overall, sectioned: true };
}

/**
 * Orientation-aware severity for a section.
 *
 * A high WHO-5 or resilience score is good news; a high GAD-2 is not. Callers
 * must not colour sections by raw percentage alone.
 */
export function severityForSection(section: SectionScore): 'low' | 'moderate' | 'high' {
  const distress = section.direction === 'higher-is-better'
    ? 100 - section.percent
    : section.percent;

  if (distress <= 33) return 'low';
  if (distress <= 66) return 'moderate';
  return 'high';
}
