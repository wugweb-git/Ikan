import type { SectionConfig, OverallConfig } from './assessment-sections';

/**
 * Section definitions for the two multi-scale assessments.
 *
 * These live in code as a seed for the admin authoring UI — once an assessment
 * carries its own `sections` array in KV, that wins. They are kept here so the
 * mapping is reviewable in version control rather than existing only as
 * database rows.
 *
 * Every id below was read from the live question bank. Questions are referenced
 * by id and grouped by what the question actually asks, NOT by the positional
 * ranges in the original spec — those ranges do not match the stored order:
 *
 *   - "I feel detached from my work" and "I feel cynical" sit at positions 1-2
 *     of the burnout assessment, inside the spec's "Exhaustion = q1-8" range,
 *     but they are Mental Distancing items.
 *   - The spec splits self-efficacy/resilience at q17/q18. The real scales are
 *     NGSE (8 items, q11-18) and the BRS (6 items, q19-24).
 */

export interface AssessmentSectionPreset {
  sections: SectionConfig[];
  hasOverallScore: boolean;
  overallCalc?: OverallConfig;
  /** Scored separately and surfaced as a flag, never folded into a section. */
  riskIndicatorQuestionIds?: string[];
  notes?: string[];
}

// ── General questionnaire ────────────────────────────────────────────────────
// 24 items. Wellbeing, self-efficacy and resilience are complete and correct.
// Anxiety and depression are not: see `notes`.
export const GENERAL_SECTIONS: AssessmentSectionPreset = {
  hasOverallScore: false, // per spec: "Overall Score: NIL" — five independent scales
  riskIndicatorQuestionIds: ['general-q5'], // "Thoughts that you would be better off dead…"
  sections: [
    {
      id: 'anxiety',
      label: 'Anxiety',
      instrument: 'GAD-2',
      // Second item ("Not being able to stop or control worrying") copied in
      // verbatim from the standalone Anxiety assessment's anxiety-q2, as
      // general-q2 — no new authoring needed, GAD-2 was already fully
      // written elsewhere in the bank.
      questionIds: ['general-q1', 'general-q2'],
      expectedItems: 2,
      calc: 'sum',
      direction: 'higher-is-distress',
      bands: [
        { min: 0, max: 2, label: 'Minimal' },
        { min: 3, max: 6, label: 'Elevated' },
      ],
    },
    {
      id: 'depression',
      label: 'Depression',
      instrument: 'PHQ-2',
      // The spec maps this to q3-q4, but those are "How would you rate your
      // overall mental health?" and "I feel optimistic about my future" —
      // neither is a real PHQ-2 item, so this section stayed empty. Both real
      // PHQ-2 items now exist as general-q3/general-q4, copied in verbatim
      // from the standalone Depression assessment's depression-q1/depression-q2.
      questionIds: ['general-q3', 'general-q4'],
      expectedItems: 2,
      calc: 'sum',
      direction: 'higher-is-distress',
      bands: [
        { min: 0, max: 2, label: 'Minimal' },
        { min: 3, max: 6, label: 'Elevated' },
      ],
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      instrument: 'WHO-5',
      questionIds: [
        'general-q6', // cheerful and in good spirits
        'general-q7', // calm and relaxed
        'general-q8', // active and vigorous
        'general-q9', // woke up feeling fresh and rested
        'general-q10', // daily life filled with things that interest me
      ],
      calc: 'sum',
      multiplier: 4, // 0-25 raw → 0-100, the standard WHO-5 percentage
      direction: 'higher-is-better',
      bands: [
        { min: 0, max: 28, label: 'Poor' },
        { min: 29, max: 50, label: 'Below average' },
        { min: 51, max: 100, label: 'Good' },
      ],
    },
    {
      id: 'self-efficacy',
      label: 'Self-efficacy',
      // Split at q17/q18 per the scoring sheet: "Self efficacy — add all
      // scores for q11-17", "Resilience — add all scores for q18-24". 7/7.
      // This overrides the note at the top of this file, which argued for the
      // published NGSE (8 items) and BRS (6 items) instead. Decided 2026-09-03
      // from the source spec; the live record uses the same split.
      questionIds: [
        'general-q11',
        'general-q12',
        'general-q13',
        'general-q14',
        'general-q15',
        'general-q16',
        'general-q17',
      ],
      calc: 'sum',
      direction: 'higher-is-better',
      bands: [
        { min: 7, max: 20, label: 'Low' },
        { min: 21, max: 29, label: 'Normal' },
        { min: 30, max: 35, label: 'High' },
      ],
    },
    {
      id: 'resilience',
      label: 'Resilience',
      instrument: 'BRS',
      questionIds: [
        'general-q18', // even when things are tough, I perform well
        'general-q19', // bounce back quickly
        'general-q20', // hard time making it through          (reverse)
        'general-q21', // does not take me long to recover
        'general-q22', // hard to snap back                    (reverse)
        'general-q23', // come through with little trouble
        'general-q24', // long time to get over set-backs      (reverse)
      ],
      // The BRS alternates positive and negative wording. Without reversing the
      // negative items the two halves cancel and every respondent lands mid-scale.
      reverseQuestionIds: [
        'general-q20',
        'general-q22',
        'general-q24',
      ],
      // "Resilience — add all scores for q18-24": a sum of 7 items, not the
      // published BRS 1-5 mean. `offset: 1` removed — the General options now
      // carry explicit values (q11-q24 are 1-5), so there is no 0-based index
      // to push back onto the scale.
      calc: 'sum',
      direction: 'higher-is-better',
      bands: [
        { min: 7, max: 20, label: 'Low' },
        { min: 21, max: 29, label: 'Normal' },
        { min: 30, max: 35, label: 'High' },
      ],
    },
  ],
  notes: [
    'Anxiety (GAD-2) and Depression (PHQ-2) are now both complete: general-q2, general-q3 and general-q4 were copied in verbatim from the standalone Anxiety/Depression assessments (no new authoring) and appended to the General question bank.',
    'The old gen-q2 / gen-q3 / gen-q4 (physical health, mental health, optimism) belonged to no scale and have since been removed from the question bank. They are unrelated to the current general-q2/q3/q4 above, which are the GAD-2/PHQ-2 items. Historical answers to the removed items survive on stored results under `_legacy:gen-q2` etc.',
  ],
};

// ── Burnout assessment ───────────────────────────────────────────────────────
// 22 items mapped to the four BAT core sub-scales, grouped by content.
export const BURNOUT_SECTIONS: AssessmentSectionPreset = {
  hasOverallScore: true,
  sections: [
    {
      id: 'exhaustion',
      label: 'Exhaustion',
      instrument: 'BAT',
      // BAT-23 allocation, 8/5/5/5, decided 2026-09-03. Exhaustion is q1-q8 by
      // the published item order. Note this deliberately overrides the grouping
      // comment at the top of this file: q1 ("detached from my work") and q2
      // ("cynical about responsibilities") read as mental-distance items but
      // are placed here to match BAT-23's structure. The live spec on the
      // assessment record uses the same allocation — keep the two in step.
      questionIds: [
        'burnout-q1',  // detached from my work
        'burnout-q2',  // cynical about responsibilities
        'burnout-q3',  // mentally drained
        'burnout-q4',  // physically tired
        'burnout-q5',  // unmotivated
        'burnout-q6',  // overwhelmed by workload
        'burnout-q7',  // under-appreciated
        'burnout-q8',  // need a long break
      ],
      calc: 'average',
      // `offset: 1` removed 2026-09-03: the Burnout options now carry explicit
      // values 1-5, so there is no 0-based index to push back onto the scale.
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
    {
      id: 'mental-distancing',
      label: 'Mental distancing',
      instrument: 'BAT',
      // `burnout-q9` was briefly retired as a duplicate of q10 and then
      // RESTORED 2026-09-03. It was never a duplicate: its text in
      // `questions[]` had been overwritten with q10's autopilot wording, while
      // the original survived as the `title` on the same block in
      // `daily_content`. Restoring that text makes Burnout 23 items again.
      // Do not "de-duplicate" these two on the strength of matching text —
      // check `daily_content` first.
      questionIds: [
        'burnout-q9',   // struggle to find any enthusiasm for my work (restored)
        'burnout-q10',  // functioning on autopilot
        'burnout-q11',  // strong aversion towards my job — previously scored by nothing
        'burnout-q12',  // indifferent about my job
        'burnout-q13',  // cynical about what my work means
      ],
      calc: 'average',
      // `offset: 1` removed 2026-09-03: the Burnout options now carry explicit
      // values 1-5, so there is no 0-based index to push back onto the scale.
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
    {
      id: 'cognitive-impairment',
      label: 'Cognitive impairment',
      instrument: 'BAT',
      questionIds: [
        'burnout-q14', // trouble staying focused
        'burnout-q15', // struggle to think clearly
        'burnout-q16', // forgetful and distracted
        'burnout-q17', // trouble concentrating
        'burnout-q18', // mistakes because mind elsewhere
      ],
      calc: 'average',
      // `offset: 1` removed 2026-09-03: the Burnout options now carry explicit
      // values 1-5, so there is no 0-based index to push back onto the scale.
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
    {
      id: 'emotional-impairment',
      label: 'Emotional impairment',
      instrument: 'BAT',
      questionIds: [
        'burnout-q19', // unable to control emotion
        'burnout-q20', // do not recognise my emotional reactions
        'burnout-q21', // irritable when things do not go my way
        'burnout-q22', // upset or sad without knowing why
        'burnout-q23', // overreact unintentionally
      ],
      calc: 'average',
      // `offset: 1` removed 2026-09-03: the Burnout options now carry explicit
      // values 1-5, so there is no 0-based index to push back onto the scale.
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
  ],
  overallCalc: {
    label: 'Overall burnout risk',
    calc: 'average', // mean across all core items, per the spec
    // `offset: 1` removed 2026-09-03 — see the section comment above.
    direction: 'higher-is-distress',
    bands: BAT_BANDS(),
  },
  notes: [
    'The bank holds 22 items; BAT-23 defines 23 (Exhaustion 8, the rest 5 each). ' +
      'Here Exhaustion has 6 and Mental distancing 6, grouped by question content. ' +
      'Means stay interpretable, but scores are not strictly comparable to published BAT norms.',
  ],
};

/**
 * BAT risk bands on the 1-5 mean. Returned fresh each call so no two sections
 * share a mutable array.
 */
function BAT_BANDS() {
  return [
    { min: 1, max: 2.58, label: 'Low' },
    { min: 2.59, max: 3.01, label: 'At risk' },
    { min: 3.02, max: 5, label: 'High' },
  ];
}

// ── Flat, single-instrument assessments ──────────────────────────────────────
// These aren't bundles like General/Burnout — each is genuinely one scale. They
// still need this config because the stored `scoring.ranges` is null on all of
// them, and the field the admin wizard actually writes (`resultCategories`) is
// never read by the player. Rather than patch the dead-field wiring per
// assessment, each gets zero named `sections` (so no report card renders) plus
// an `overallCalc` that drives the existing single-ring result — but computed
// correctly: only the clinically-scored items counted, reversal applied where
// the scale mixes wording direction, bands matched to the true achievable max.

// ── Anxiety — GAD-7 ──────────────────────────────────────────────────────────
// Clinical GAD-7 scoring sums ONLY the 7 core items (anxiety-q1..q7). Item 8
// is the standard functional-impairment add-on question and is NOT part of the
// score under the published instrument; items 9-10 are an embedded PHQ-2
// screen for a different condition. Summing all 10 (as the old flat-sum
// fallback did) would silently inflate the total past the clinical 0-21 range.
export const ANXIETY_SCORING: AssessmentSectionPreset = {
  sections: [],
  hasOverallScore: true,
  overallCalc: {
    label: 'Anxiety (GAD-7)',
    calc: 'sum',
    questionIds: ['anxiety-q1', 'anxiety-q2', 'anxiety-q3', 'anxiety-q4', 'anxiety-q5', 'anxiety-q6', 'anxiety-q7'],
    direction: 'higher-is-distress',
    bands: [
      { min: 0, max: 4, label: 'Minimal', description: 'Minimal anxiety symptoms.' },
      { min: 5, max: 9, label: 'Mild', description: 'Mild anxiety symptoms.' },
      { min: 10, max: 14, label: 'Moderate', description: 'Moderate anxiety symptoms — consider our Stress or Mindfulness programs.' },
      { min: 15, max: 21, label: 'Severe', description: 'Severe anxiety symptoms detected. We recommend speaking with a professional.' },
    ],
  },
  notes: [
    'resultCategories previously stored one single "Scoring Range 0-21" band — every score produced the identical label. Replaced with standard GAD-7 cutoffs.',
    'Items 8-10 (impairment + embedded PHQ-2) are intentionally excluded from the score, matching published GAD-7 convention.',
  ],
};

// ── Depression — PHQ-9 ───────────────────────────────────────────────────────
// Sums ONLY the 9 core items. Item 10 is the standard impairment add-on; items
// 11-12 are an embedded GAD-2 screen. Same exclusion logic as Anxiety above.
export const DEPRESSION_SCORING: AssessmentSectionPreset = {
  sections: [],
  hasOverallScore: true,
  overallCalc: {
    label: 'Depression',
    calc: 'sum',
    questionIds: ['depression-q1', 'depression-q2', 'depression-q3', 'depression-q4', 'depression-q5', 'depression-q6', 'depression-q7', 'depression-q8', 'depression-q9'],
    direction: 'higher-is-distress',
    bands: [
      { min: 0, max: 4, label: 'Minimal', description: 'Minimal depressive symptoms.' },
      { min: 5, max: 9, label: 'Mild', description: 'Mild depressive symptoms.' },
      { min: 10, max: 14, label: 'Moderate', description: 'Moderate depressive symptoms — consider speaking with someone you trust.' },
      { min: 15, max: 19, label: 'Moderately severe', description: 'Moderately severe symptoms — professional support is recommended.' },
      { min: 20, max: 27, label: 'Severe', description: 'Severe depressive symptoms detected. We recommend speaking with a professional soon.' },
    ],
  },
  notes: [
    'resultCategories previously stored one single "Score range: 0-27" band. Replaced with standard PHQ-9 cutoffs.',
    "depression-q9 (\"Feeling that life is meaningless\") is a softened rewrite of the standard PHQ-9 item 9, which is normally about self-harm/suicidal ideation. Flagged separately in src/docs/assessments/depression.md — confirm this rewording was a deliberate safety decision.",
  ],
};

// ── Stress ───────────────────────────────────────────────────────────────────
// Content and direction were already correct; only the band ceiling was wrong.
// 7 items x max option value 4 = 28 is the true max, not the stored 40. Bands
// rescaled proportionally from the original 10/25/40 split, same descriptions.
export const STRESS_SCORING: AssessmentSectionPreset = {
  sections: [],
  hasOverallScore: true,
  overallCalc: {
    label: 'Stress',
    calc: 'sum',
    questionIds: ['stress-q1', 'stress-q2', 'stress-q3', 'stress-q4', 'stress-q5', 'stress-q6', 'stress-q7'],
    direction: 'higher-is-distress',
    bands: [
      { min: 0, max: 7, label: 'Low Stress', description: 'You are managing stress well.' },
      { min: 8, max: 18, label: 'Moderate Stress', description: 'Stress is starting to affect your life. Consider our Stress program.' },
      { min: 19, max: 28, label: 'High Stress', description: 'High stress levels detected. We recommend immediate attention.' },
    ],
  },
  notes: [
    'resultCategories previously set the top band to 26-40; the real ceiling is 28, so scores above it could never occur. Rebalanced to the true 0-28 range, same labels/descriptions.',
  ],
};

// ── Sleep ────────────────────────────────────────────────────────────────────
// Every item scores 0 for the best answer, 4 for the worst (verified against
// live options) — so a LOW total means good sleep. The stored resultCategories
// had "Poor Sleep" at 0-16 and "Healthy Sleep" at 17-32: backwards. Numbers
// were otherwise correctly calibrated (8 x 4 = 32 matches the stored max) —
// only the labels needed to swap.
export const SLEEP_SCORING: AssessmentSectionPreset = {
  sections: [],
  hasOverallScore: true,
  overallCalc: {
    label: 'Sleep',
    calc: 'sum',
    questionIds: ['sleep-q1', 'sleep-q2', 'sleep-q3', 'sleep-q4', 'sleep-q5', 'sleep-q6', 'sleep-q7', 'sleep-q8'],
    direction: 'higher-is-distress',
    bands: [
      { min: 0, max: 16, label: 'Healthy Sleep', description: 'Your sleep patterns are normal.' },
      { min: 17, max: 32, label: 'Poor Sleep', description: 'Your sleep patterns indicate possible insomnia.' },
    ],
  },
  notes: [
    'Stored resultCategories had the labels inverted: "Poor Sleep" was assigned to the LOW-score band (good answers) and "Healthy Sleep" to the HIGH-score band (worst answers). Every item scores worst-answer=4, best-answer=0, verified directly against live options, so low total = good sleep. Labels corrected here; numeric ranges were already right.',
    'Typo in stored content: sleep-q4 option 4 reads "Pooo" instead of "Poor" — fixed directly in the KV record, not just here.',
  ],
};

// ── Balance ──────────────────────────────────────────────────────────────────
// Mixed-direction scale: 5 positively-worded items, 3 negatively-worded, summed
// with no reversal in the original config — a genuinely well-balanced person
// scored inside the "Imbalanced" band.
//
// The total is meant to read as "how much strain", higher = worse, matching
// every other assessment in this bank and the existing band labels (Balanced
// = low, Imbalanced = high). That means the 5 POSITIVELY-worded items must be
// reversed (a good answer should contribute LOW strain), not the 3 negative
// ones — reversing the negative items instead flips the total the other way
// (higher = MORE balanced), which would leave the band labels backwards even
// though the arithmetic runs. Verified by test: reversing the positives gives
// a well-balanced response (max on positives, min on negatives) a value of 0
// -> "Balanced"; reversing the negatives instead gave that same response 32
// -> "Imbalanced", the wrong answer with technically-working reversal code.
export const BALANCE_SCORING: AssessmentSectionPreset = {
  sections: [],
  hasOverallScore: true,
  overallCalc: {
    label: 'Balance',
    calc: 'sum',
    questionIds: ['balance-q1', 'balance-q2', 'balance-q3', 'balance-q4', 'balance-q5', 'balance-q6', 'balance-q7', 'balance-q8'],
    reverseQuestionIds: ['balance-q1', 'balance-q3', 'balance-q4', 'balance-q5', 'balance-q7'],
    direction: 'higher-is-distress',
    bands: [
      { min: 0, max: 10, label: 'Balanced', description: 'Your work-life balance is healthy.' },
      { min: 11, max: 19, label: 'Strained', description: 'You are struggling to maintain balance.' },
      { min: 20, max: 32, label: 'Imbalanced', description: 'Your life feels out of balance.' },
    ],
  },
  notes: [
    'balance-q2 ("My work drains most of my energy"), balance-q6 ("I feel guilty when I take breaks"), and balance-q8 ("I feel constantly on") are negatively worded against the other 5 positive items and were summed raw with no reversal. Verified: a consistently well-balanced response (max on positives, min on negatives) scored 28/32 -- inside "Imbalanced" -- before this fix. Do not trust any historical Balance result computed before this change.',
    'Bands rescaled from the stored 12/24/40 split to the true post-reversal 0-32 max.',
  ],
};

/** Preset lookup by assessment slug. */
export const SECTION_PRESETS: Record<string, AssessmentSectionPreset> = {
  'unsure-or-general-concern': GENERAL_SECTIONS,
  'feeling-drained-and-burned-out': BURNOUT_SECTIONS,
  'feeling-overwhelmed-and-anxious': ANXIETY_SCORING,
  'feeling-depressed-and-hopeless': DEPRESSION_SCORING,
  'feeling-worried-and-stressed': STRESS_SCORING,
  'struggling-with-quality-sleep': SLEEP_SCORING,
  'struggling-to-balance-life': BALANCE_SCORING,
};
