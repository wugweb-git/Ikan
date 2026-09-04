import {
  Activity, ExerciseConfig, warnFallback, resolveInteraction,
  type DayType, type InteractionType,
} from '../../lib/equip-admin-types';

export interface DayTypePreset {
  label: string;
  description: string;
  defaultBlocks: Partial<Activity>[];
  /**
   * What a user may be asked to DO on this stage — the vocabulary the renderer
   * actually obeys. Replaces reasoning over `allowedBlocks`, whose 23 strings
   * appear in no store and no type union and were bridged to real names by nine
   * hardcoded `if`s inside the validator below.
   */
  allowedInteractions: InteractionType[];
  /** Legacy 23-string palette. Still drives DayEditor's block palette and the reference screen. */
  allowedBlocks: string[];
  blockedComponents: string[];
  autoConfig: {
    autoAdvance?: boolean;
    navigationBack?: boolean;
    scoringEnabled?: boolean;
    saveOnExit?: boolean;
    saveOnToggle?: boolean;
  };
  stepGroupRules: {
    allowed: boolean;
    required: boolean;
    maxBlocksPerStep?: number;
    oneBlockPerStep?: boolean;
    oneStepPerLesson?: boolean;
  };
  warnings: string[];
  errors: string[];
}

export const DAY_TYPE_PRESETS: Record<DayType, DayTypePreset> = {
  // `onboarding` had a `day_config_type` catalog row and no code path at all, so
  // an admin picking it in Meta Manager silently got nothing. Typing this record
  // as Record<DayType, ...> is what forced it to exist.
  'onboarding': {
    label: 'Onboarding',
    description: 'Day 0. First-time intro, consent, and orientation before the programme starts.',
    defaultBlocks: [
      { type: 'lesson', title: 'Welcome', content: '', autoAdvance: false },
      {
        type: 'exercise',
        title: 'What brings you here?',
        content: '',
        required: true,
        autoAdvance: true,
        exerciseConfig: { subtype: 'single-select' }
      }
    ],
    allowedInteractions: ['read', 'select-one', 'select-many', 'write'],
    allowedBlocks: ['lesson', 'mcq_single', 'mcq_multi', 'short_text', 'long_text'],
    blockedComponents: ['table', 'clinical', 'checklist'],
    autoConfig: {
      autoAdvance: true,
      navigationBack: false,
      scoringEnabled: false
    },
    stepGroupRules: {
      allowed: true,
      required: false,
      oneBlockPerStep: true
    },
    warnings: ['Onboarding runs once, before day 1. Answers are profile data, not programme progress.'],
    errors: []
  },
  'assessment': {
    label: 'Assessment',
    description: 'Baseline measurement, severity scoring, recommendations.',
    defaultBlocks: [
      { type: 'lesson', content: 'Assessment Intro', autoAdvance: false },
      { 
        type: 'exercise', 
        content: 'Question 1', 
        required: true,
        autoAdvance: true,
        exerciseConfig: { subtype: 'mcq', scoring: { enabled: true } } 
      },
      { 
        type: 'exercise', 
        content: 'Question 2', 
        required: true, 
        autoAdvance: true,
        exerciseConfig: { subtype: 'mcq', scoring: { enabled: true } } 
      },
      { type: 'conclude', content: 'Continue', autoAdvance: false }
    ],
    allowedInteractions: ['clinical', 'select-one'],
    allowedBlocks: ['mcq_single', 'mcq_multi', 'rating_scale', 'likert', 'boolean', 'short_text'],
    blockedComponents: ['journal', 'table', 'checklist', 'rich_lesson'],
    autoConfig: {
      autoAdvance: true, // for MCQs
      navigationBack: false,
      scoringEnabled: true
    },
    stepGroupRules: {
      allowed: false,
      required: false,
      oneBlockPerStep: true
    },
    warnings: ['Assessments should be fast. Long inputs reduce completion.'],
    errors: []
  },
  'assessment-lite': {
    label: 'Assessment Lite',
    description: 'Awareness, reflection, non-scored check-ins.',
    defaultBlocks: [
      { type: 'lesson', content: 'Quick check-in', autoAdvance: false },
      { 
        type: 'exercise', 
        content: 'How are you feeling?', 
        required: true,
        exerciseConfig: { subtype: 'mcq', scoring: { enabled: false } } // non-evaluative
      },
      { 
        type: 'exercise', 
        content: 'Rate your day', 
        required: true,
        exerciseConfig: { subtype: 'rating_scale' } 
      }
    ],
    allowedInteractions: ['select-one', 'rate', 'write'],
    allowedBlocks: ['mcq_single', 'mcq_multi', 'rating_scale', 'short_text', 'lesson'],
    blockedComponents: [],
    autoConfig: {
      autoAdvance: true,
      navigationBack: true,
      scoringEnabled: false
    },
    stepGroupRules: {
      allowed: true,
      required: false,
      maxBlocksPerStep: 2
    },
    warnings: [],
    errors: []
  },
  'learning': {
    label: 'Learning',
    description: 'Concept introduction and understanding.',
    defaultBlocks: [
      { type: 'lesson', content: 'Introduction', autoAdvance: false },
      { type: 'lesson', content: 'Diagram/Illustration', autoAdvance: false }, // media
      { 
        type: 'exercise', 
        content: 'Knowledge Check', 
        required: false,
        exerciseConfig: { subtype: 'mcq' } 
      }
    ],
    allowedInteractions: ['read', 'watch', 'complete', 'select-one'],
    allowedBlocks: ['lesson', 'media', 'mcq_single', 'callout', 'short_text'],
    blockedComponents: [],
    autoConfig: {
      autoAdvance: false,
      navigationBack: true
    },
    stepGroupRules: {
      allowed: true,
      required: true,
      oneStepPerLesson: true
    },
    warnings: ['Learning days must include at least one interaction.'],
    errors: []
  },
  'practice': {
    label: 'Practice',
    description: 'User data capture, reflection, application.',
    defaultBlocks: [
      { type: 'lesson', content: 'Context for practice', autoAdvance: false },
      { 
        type: 'journal', 
        content: 'Journal Entry', 
        required: true,
        exerciseConfig: { subtype: 'ephemeral-journal' }
      },
      { type: 'conclude', content: 'Done for today', autoAdvance: false }
    ],
    allowedInteractions: ['write', 'input-table', 'check', 'select-many'],
    allowedBlocks: ['journal', 'long_text', 'table_input', 'checklist', 'date_time', 'lesson'],
    blockedComponents: [],
    autoConfig: {
      autoAdvance: false,
      navigationBack: true,
      saveOnExit: true
    },
    stepGroupRules: {
      allowed: true,
      required: false
    },
    warnings: ['Clearly state whether responses are stored or private.'],
    errors: []
  },
  'workshop': {
    label: 'Workshop',
    description: 'Multi-step thinking (ideation, evaluation, rituals).',
    defaultBlocks: [
      // Preset fills these but UI logic will handle StepGroups
    ],
    allowedInteractions: ['input-table', 'write', 'select-many', 'read'],
    allowedBlocks: ['lesson', 'mcq_multi', 'rtf_list', 'table_input', 'comparison_matrix'],
    blockedComponents: [],
    autoConfig: {
      autoAdvance: false,
      navigationBack: true
    },
    stepGroupRules: {
      allowed: true,
      required: true,
      maxBlocksPerStep: 3
    },
    warnings: [],
    errors: ['Workshop day without StepGroups', '>3 blocks in a StepGroup', 'Mixed intent blocks in same StepGroup']
  },
  'tracker': {
    label: 'Tracker',
    description: 'Daily repetition, habits, streaks.',
    defaultBlocks: [
      { 
        type: 'checklist', 
        content: 'Daily Habits', 
        required: false,
        exerciseConfig: { subtype: 'structured-list' }
      },
      { 
        type: 'exercise', 
        content: 'Rate today', 
        required: true,
        exerciseConfig: { subtype: 'rating_scale' }
      }
    ],
    allowedInteractions: ['track-table', 'input-table', 'check', 'rate'],
    allowedBlocks: ['checklist', 'rating_scale', 'boolean', 'journal_short'],
    blockedComponents: [],
    autoConfig: {
      autoAdvance: false,
      saveOnToggle: true
    },
    stepGroupRules: {
      allowed: false,
      required: false
    },
    warnings: ['Trackers should stay identical across days.'],
    errors: []
  },
  'reflection': {
    label: 'Reflection',
    description: 'Closure, sense-making, review.',
    defaultBlocks: [
      { type: 'reflection', content: 'Summary', autoAdvance: false },
      { 
        type: 'exercise', 
        content: 'How do you feel now?', 
        required: true,
        exerciseConfig: { subtype: 'rating_scale' }
      },
      { type: 'journal', content: 'Final thoughts', required: false }
    ],
    allowedInteractions: ['write', 'rate', 'select-one'],
    allowedBlocks: ['summary', 'rating_scale', 'journal', 'table_review'],
    blockedComponents: [],
    autoConfig: {
      autoAdvance: false,
      navigationBack: false
    },
    stepGroupRules: {
      allowed: false,
      required: false
    },
    warnings: [],
    errors: []
  },
  'check-in': {
    label: 'Check-In',
    description: 'Quick daily mood/wellness check. 1-3 questions, no scoring.',
    defaultBlocks: [
      {
        type: 'exercise',
        title: 'How are you feeling?',
        content: 'Rate your mood right now.',
        required: true,
        autoAdvance: true,
        exerciseConfig: { subtype: 'rating-scale', slider_min: 1, slider_max: 5, slider_labels: ['Awful', 'Bad', 'Okay', 'Good', 'Great'] }
      },
      {
        type: 'journal',
        title: 'Quick note',
        content: 'Anything on your mind? (optional)',
        required: false,
        autoAdvance: false,
      },
      { type: 'conclude', title: 'Done', content: 'Thanks for checking in!', autoAdvance: false }
    ],
    allowedInteractions: ['rate', 'select-one', 'select-many', 'write'],
    allowedBlocks: ['rating_scale', 'mcq_single', 'journal', 'lesson', 'boolean'],
    blockedComponents: ['table', 'checklist', 'clinical'],
    autoConfig: {
      autoAdvance: true,
      navigationBack: false,
      scoringEnabled: false,
      saveOnExit: true
    },
    stepGroupRules: {
      allowed: false,
      required: false,
      oneBlockPerStep: true
    },
    warnings: ['Keep check-ins under 2 minutes for best completion rates.'],
    errors: []
  },
  'rest': {
    label: 'Rest Day',
    description: 'No active tasks. Optional motivation or gentle prompt.',
    defaultBlocks: [
      {
        type: 'lesson',
        title: 'Rest Day',
        content: 'Take it easy today. You\'re doing great.',
        autoAdvance: false
      }
    ],
    allowedInteractions: ['read', 'complete'],
    allowedBlocks: ['lesson'],
    blockedComponents: ['exercise', 'journal', 'checklist', 'table'],
    autoConfig: {
      autoAdvance: false,
      navigationBack: false
    },
    stepGroupRules: {
      allowed: false,
      required: false
    },
    warnings: ['Rest days auto-complete — no user action needed.'],
    errors: []
  },
  'quiz': {
    label: 'Quiz',
    description: 'Knowledge check with scoring. Tests retention from learning days.',
    defaultBlocks: [
      { type: 'lesson', title: 'Quiz Intro', content: 'Let\'s see what you remember.', autoAdvance: false },
      {
        type: 'exercise',
        title: 'Question 1',
        content: '',
        required: true,
        autoAdvance: true,
        exerciseConfig: { subtype: 'mcq', scoring: { enabled: true, maxScore: 1 } }
      },
      {
        type: 'exercise',
        title: 'Question 2',
        content: '',
        required: true,
        autoAdvance: true,
        exerciseConfig: { subtype: 'mcq', scoring: { enabled: true, maxScore: 1 } }
      },
      { type: 'conclude', title: 'Results', content: 'Here\'s how you did.', autoAdvance: false }
    ],
    allowedInteractions: ['select-one', 'select-many', 'rate'],
    allowedBlocks: ['mcq_single', 'mcq_multi', 'rating_scale', 'boolean', 'lesson'],
    blockedComponents: ['journal', 'table', 'checklist'],
    autoConfig: {
      autoAdvance: true,
      navigationBack: false,
      scoringEnabled: true
    },
    stepGroupRules: {
      allowed: false,
      required: false,
      oneBlockPerStep: true
    },
    warnings: ['Keep quizzes to 5-10 questions max.'],
    errors: []
  }
};

/** True for a string that names a real preset. The only way into DAY_TYPE_PRESETS. */
export function isDayType(dayType: string | undefined | null): dayType is DayType {
  return !!dayType && Object.prototype.hasOwnProperty.call(DAY_TYPE_PRESETS, dayType);
}

export function getPresetForDayType(dayType: string): DayTypePreset | undefined {
  return isDayType(dayType) ? DAY_TYPE_PRESETS[dayType] : undefined;
}

export interface BlockDayTypeVerdict {
  /** What the editor enforces TODAY. Only the blocked list can make this false. */
  allowed: boolean;
  /**
   * What composition enforcement WOULD reject if it were on.
   *
   * The allow-list has never run: the rejecting line was commented out, so the
   * computed result was discarded and `allowed: true` always won. Restoring it
   * is one line (blocks.md §18 6.4) — but the moment it runs, content authored
   * against no constraint for months starts failing, and nine of eleven presets
   * have never even been assigned to a day. So this reports instead of rejects,
   * which is what makes the §18 6.3 audit runnable before the switch is thrown.
   */
  wouldReject: boolean;
  reason?: string;
}

/**
 * Does this block belong on this stage?
 *
 * Judged on the block's INTERACTION, not on the 23-string palette. That palette
 * exists in no store and no type union, and was bridged to real block names by
 * nine hardcoded `if`s right here — comparing `subtype === 'rating_scale'` and
 * `subtype === 'textarea'` against values the editor does not write.
 */
export function validateBlockForDayType(
  blockType: string,
  subtype: string | undefined,
  dayType: string
): BlockDayTypeVerdict {
  const preset = getPresetForDayType(dayType);
  if (!preset) {
    // No preset means this day skips every check below, allow-list and blocked
    // list alike. Live, 4 days are typed `lesson` — a BLOCK type used as a day
    // type (Unburn 26, 27, 29, 30). Recounted 2026-09-04 from the census; the
    // earlier figure of 8 was wrong, and summed to 104 against a 97-day catalog.
    warnFallback(
      'validateBlockForDayType',
      `no preset for dayType "${dayType}" — all validation skipped for this day`,
      dayType
    );
    return { allowed: true, wouldReject: false };
  }

  const interaction = resolveInteraction({
    id: 'validate',
    title: '',
    type: blockType as Activity['type'],
    content: '',
    duration: 0,
    required: false,
    order: 0,
    ...(subtype ? { exerciseConfig: { subtype } as ExerciseConfig } : {}),
  } as Activity);

  // The blocked list is the half that has always fired. Kept, and still on the
  // legacy palette strings, because that is what the preset data holds.
  const key = subtype ? `${blockType}_${subtype}` : blockType;
  const blocked = preset.blockedComponents.find(b => key.includes(b) || blockType === b);
  if (blocked) {
    return {
      allowed: false,
      wouldReject: true,
      reason: `'${blocked}' is blocked on ${preset.label} days.`,
    };
  }

  // The half that has never fired. Reported, not enforced.
  const permitted = preset.allowedInteractions.includes(interaction);
  if (!permitted) {
    return {
      allowed: true,
      wouldReject: true,
      reason: `${preset.label} days allow ${preset.allowedInteractions.join(', ')} — this block is '${interaction}'.`,
    };
  }

  return { allowed: true, wouldReject: false };
}
