import {
  warnFallback, resolveInteraction, normalizeSubtype,
  type Activity, type ExerciseConfig,
  type DayType, type InteractionType,
} from './block-model.ts';
import { METADATA_CATALOG_ITEMS } from '../metadata-catalog.ts';

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

/**
 * `allowedInteractions` coverage, corrected 2026-09-04 (blocks.md §18 step 2).
 *
 * Phase 0 widened these only far enough to cover each preset's OWN seed blocks.
 * That left them describing something no author actually builds:
 *
 *   - 3 presets could not open with a lesson (no `read`)
 *   - 5 presets could not close with a conclude (no `complete`)
 *   - `upload` and `number` were allowed by NO preset, so those two activities
 *     were authorable nowhere at all
 *
 * `lesson` + `conclude` are 215 of 406 live blocks — 53% of the catalogue — so a
 * stage forbidding either was wrong about the product, not about the content.
 * Every container now allows `read` and `complete`; `upload` and `number` were
 * given the homes where they make sense (practice/workshop, tracker/practice).
 * That last pair is a judgement call and is the one part here worth revisiting.
 */
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
    allowedInteractions: ['read', 'select-one', 'select-many', 'write', 'complete'],
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
    // + read/complete 2026-09-04: this preset seeds a `lesson` and a `conclude`.
    allowedInteractions: ['read', 'clinical', 'select-one', 'complete'],
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
    // + read 2026-09-04: this preset seeds a `lesson`.
    allowedInteractions: ['read', 'select-one', 'rate', 'write', 'complete'],
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
    // + read/complete 2026-09-04: this preset seeds a `lesson` and a `conclude`.
    allowedInteractions: ['read', 'write', 'input-table', 'check', 'select-many', 'number', 'upload', 'complete'],
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
    allowedInteractions: ['read', 'input-table', 'write', 'select-many', 'upload', 'complete'],
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
    allowedInteractions: ['read', 'track-table', 'input-table', 'check', 'rate', 'number', 'complete'],
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
      // Was `type: 'reflection'`. `reflection` became a CONTAINER when quiz and
      // reflection were flipped (Phase 3.3), so this seeded a stage inside a
      // stage — nothing nests. It is a written summary, which is a `journal`.
      // The preset's own defaultBlocks were not updated with the flip; the
      // containment check caught it the moment it started running.
      { type: 'journal', content: 'Summary', autoAdvance: false },
      { 
        type: 'exercise', 
        content: 'How do you feel now?', 
        required: true,
        exerciseConfig: { subtype: 'rating_scale' }
      },
      { type: 'journal', content: 'Final thoughts', required: false }
    ],
    allowedInteractions: ['read', 'write', 'rate', 'select-one', 'complete'],
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
    // + complete 2026-09-04: this preset seeds a `conclude`.
    allowedInteractions: ['read', 'rate', 'select-one', 'select-many', 'write', 'complete'],
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
    warnings: [
      'Keep check-ins under 2 minutes for best completion rates.',
      // `read` was added here as part of the uniform structural minimum
      // (2026-09-04), which lets an author place a lesson in a check-in. That
      // pushes against this stage's stated purpose, so it is DELIBERATELY a
      // warning rather than a prohibition: permitting is not requiring, and the
      // allow-list is the wrong instrument for "this is usually a bad idea".
      'A check-in can hold a lesson, but rarely should — brevity is the point of this stage.',
    ],
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
    // + read/complete 2026-09-04: this preset seeds a `lesson` and a `conclude`.
    allowedInteractions: ['read', 'select-one', 'select-many', 'rate', 'complete'],
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

  // CONTAINMENT, from the catalog seed (2026-09-04).
  //
  // This used to consult `blockedComponents`, a list of snake_case strings from
  // a phantom palette that exists in no store and no type union, matched by
  // SUBSTRING — so `'table'` blocked `input-table` and `track-table` too, and
  // eight of the palette's nineteen entries granted nothing at all.
  //
  // The real rule is `can_hold` on the stage's catalog row, which says which
  // block types the stage accepts. Read from the seed file rather than live KV
  // so this stays a pure function.
  const stageRow = METADATA_CATALOG_ITEMS.find(
    r => r.type === 'block_type' && r.slug === dayType,
  );
  const canHold = stageRow?.can_hold ?? [];
  if (canHold.length > 0 && !canHold.includes(blockType)) {
    return {
      allowed: true,           // reported, not enforced — see the note below
      wouldReject: true,
      reason: `${preset.label} days hold ${canHold.join(', ')} — this block is a '${blockType}'.`,
    };
  }

  // The stage's activity list, same source.
  //
  // Compare the NORMALISED subtype: the catalog stores canonical terms
  // (`rating-scale`) while authored content and these presets carry aliases
  // (`rating_scale`). Comparing raw spellings reported three false violations
  // on the presets' own seed content.
  const activities = stageRow?.activities ?? [];
  const canonicalSubtype = normalizeSubtype(subtype);
  if (canonicalSubtype && activities.length > 0 && !activities.includes(canonicalSubtype)) {
    return {
      allowed: true,
      wouldReject: true,
      reason: `${preset.label} days use ${activities.join(', ')} — this block is a '${canonicalSubtype}'.`,
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

/**
 * The block types `DayEditor`'s palette can actually OFFER an author, with the
 * legacy `allowedBlocks` key each one matches on.
 *
 * Extracted from `DayEditor.tsx` so it can be asserted against `can_hold`: the
 * validator permitting a block type the editor cannot create is a present-tense
 * authoring gap — an author who deletes a seeded block cannot add it back.
 *
 * NOTE this list is FOUR of the seven leaf block types. `checklist`, `quiz` and
 * `reflection` have no palette entry, so 45 live blocks are of types the day
 * palette cannot create. Closing that is §18 Phase 4.2/4.3; the test pins the
 * gap until then.
 */
export const PALETTE_BLOCK_TYPES: { type: string; label: string; keys: string[] }[] = [
  { type: 'lesson',   label: 'Lesson',     keys: ['lesson'] },
  { type: 'exercise', label: 'Exercise',   keys: ['mcq_single', 'mcq_multi', 'rating_scale', 'likert', 'boolean', 'short_text', 'long_text'] },
  { type: 'journal',  label: 'Journal',    keys: ['journal', 'journal_short'] },
  { type: 'conclude', label: 'Conclusion', keys: ['summary', 'conclude'] },
];
