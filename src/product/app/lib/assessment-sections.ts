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
  description?: string;
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
  /** Same meaning as SectionConfig.reverseQuestionIds — see there. */
  reverseQuestionIds?: string[];
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
