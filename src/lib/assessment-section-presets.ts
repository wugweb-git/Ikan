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
  riskIndicatorQuestionIds: ['block-1773736126142'], // "Thoughts that you would be better off dead…"
  sections: [
    {
      id: 'anxiety',
      label: 'Anxiety',
      instrument: 'GAD-2',
      // Only the first GAD-2 item exists in the bank. The second
      // ("Not being able to stop or control worrying") has never been authored,
      // so expectedItems keeps this honest instead of presenting a one-item
      // score as a GAD-2.
      questionIds: ['gen-q1'],
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
      // Deliberately empty. The spec maps this to q3-q4, but those are
      // "How would you rate your overall mental health?" and "I feel optimistic
      // about my future" — neither is a PHQ-2 item. Scoring them would report a
      // depression screen that was never administered.
      questionIds: [],
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
        'block-1773736128273', // cheerful and in good spirits
        'block-1773736130158', // calm and relaxed
        'block-1773736132052', // active and vigorous
        'block-1773736134105', // woke up feeling fresh and rested
        'block-1773736136122', // daily life filled with things that interest me
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
      instrument: 'NGSE',
      questionIds: [
        'block-1773736138170',
        'block-1773736140137',
        'block-1773736142436',
        'block-1773736145417',
        'block-1773736147587',
        'block-1773736149658',
        'block-1773736151870',
        'block-1773736154075',
      ],
      calc: 'sum',
      direction: 'higher-is-better',
    },
    {
      id: 'resilience',
      label: 'Resilience',
      instrument: 'BRS',
      questionIds: [
        'block-1773736156172', // bounce back quickly
        'block-1773736158289', // hard time making it through          (reverse)
        'block-1773736161020', // does not take me long to recover
        'block-1773736163250', // hard to snap back                    (reverse)
        'block-1773736165457', // come through with little trouble
        'block-1773736175000', // long time to get over set-backs      (reverse)
      ],
      // The BRS alternates positive and negative wording. Without reversing the
      // negative items the two halves cancel and every respondent lands mid-scale.
      reverseQuestionIds: [
        'block-1773736158289',
        'block-1773736163250',
        'block-1773736175000',
      ],
      calc: 'average', // BRS is reported as a 1-5 mean
      offset: 1,       // option values are 0-4; BRS norms are stated on 1-5
      direction: 'higher-is-better',
      bands: [
        { min: 1, max: 2.99, label: 'Low' },
        { min: 3, max: 4.3, label: 'Normal' },
        { min: 4.31, max: 5, label: 'High' },
      ],
    },
  ],
  notes: [
    'Depression (PHQ-2) has no mapped items — both PHQ-2 questions need authoring.',
    'Anxiety (GAD-2) is missing its second item ("Not being able to stop or control worrying").',
    'gen-q2 / gen-q3 / gen-q4 (physical health, mental health, optimism) belong to no scale and are unscored.',
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
      questionIds: [
        'burnout-q5',  // mentally drained
        'burnout-q6',  // physically tired
        'burnout-q7',  // unmotivated
        'burnout-q8',  // overwhelmed by workload
        'burnout-q9',  // under-appreciated
        'burnout-q10', // need a long break
      ],
      calc: 'average',
      offset: 1,
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
    {
      id: 'mental-distancing',
      label: 'Mental distancing',
      instrument: 'BAT',
      questionIds: [
        'burnout-q2',           // detached from my work
        'burnout-q4',           // cynical about responsibilities
        'block-1773730436410',  // functioning on autopilot
        'block-1773730438342',  // strong aversion towards my job
        'block-1773730440488',  // indifferent about my job
        'block-1773730442601',  // cynical about what my work means
      ],
      calc: 'average',
      offset: 1,
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
    {
      id: 'cognitive-impairment',
      label: 'Cognitive impairment',
      instrument: 'BAT',
      questionIds: [
        'block-1773730444594', // trouble staying focused
        'block-1773730446622', // struggle to think clearly
        'block-1773730448735', // forgetful and distracted
        'block-1773730450593', // trouble concentrating
        'block-1773730452581', // mistakes because mind elsewhere
      ],
      calc: 'average',
      offset: 1,
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
    {
      id: 'emotional-impairment',
      label: 'Emotional impairment',
      instrument: 'BAT',
      questionIds: [
        'block-1773730454685', // unable to control emotion
        'block-1773730456837', // do not recognise my emotional reactions
        'block-1773730459006', // irritable when things do not go my way
        'block-1773730461022', // upset or sad without knowing why
        'block-1773732058231', // overreact unintentionally
      ],
      calc: 'average',
      offset: 1,
      direction: 'higher-is-distress',
      bands: BAT_BANDS(),
    },
  ],
  overallCalc: {
    label: 'Overall burnout risk',
    calc: 'average', // mean across all core items, per the spec
    offset: 1,
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

/** Preset lookup by assessment slug. */
export const SECTION_PRESETS: Record<string, AssessmentSectionPreset> = {
  'unsure-or-general-concern': GENERAL_SECTIONS,
  'feeling-drained-and-burned-out': BURNOUT_SECTIONS,
};
