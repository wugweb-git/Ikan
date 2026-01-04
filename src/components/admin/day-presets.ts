import { Activity, ExerciseConfig } from '../../lib/equip-admin-types';

export interface DayTypePreset {
  label: string;
  description: string;
  defaultBlocks: Partial<Activity>[];
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

export const DAY_TYPE_PRESETS: Record<string, DayTypePreset> = {
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
  }
};

export function getPresetForDayType(dayType: string): DayTypePreset | undefined {
  return DAY_TYPE_PRESETS[dayType];
}

export function validateBlockForDayType(blockType: string, subtype: string | undefined, dayType: string): { allowed: boolean; reason?: string } {
  const preset = DAY_TYPE_PRESETS[dayType];
  if (!preset) return { allowed: true }; // No restrictions if no preset

  // Map internal component types to "Block Palette" names loosely
  // This mapping needs to be robust. 
  // blockType: 'lesson' | 'exercise' | 'journal' | ...
  // subtype: 'mcq' | 'table' | ...
  
  // Construct a "key" to check against allowedBlocks
  // e.g. 'mcq_single', 'mcq_multi', 'lesson', 'journal'
  
  let key = blockType;
  if (blockType === 'exercise' && subtype) {
    if (subtype === 'mcq') key = 'mcq_single'; // Default to single, handled by logic
    if (subtype === 'multi-select') key = 'mcq_multi';
    if (subtype === 'single-select') key = 'mcq_single';
    if (subtype === 'table') key = 'table_input';
  }
  
  // Check if explicitly blocked
  if (preset.blockedComponents.some(b => key.includes(b))) {
     return { allowed: false, reason: `Component '${key}' is blocked in ${preset.label} days.` };
  }

  // Check if in allowed list (if allowed list is strict)
  // For now we use the allowedBlocks as a "Guide" but maybe strict?
  // The spec says "Block Palette (Enabled)". Implies others are disabled.
  
  // Fuzzy match against allowedBlocks
  const isAllowed = preset.allowedBlocks.some(allowed => {
      if (allowed === key) return true;
      if (allowed === 'media' && (blockType === 'image' || blockType === 'video')) return true;
      if (allowed === 'boolean' && subtype === 'boolean') return true;
      if (allowed === 'rating_scale' && subtype === 'rating_scale') return true;
      if (allowed === 'likert' && subtype === 'likert') return true;
      if (allowed === 'short_text' && subtype === 'text') return true;
      if (allowed === 'long_text' && subtype === 'textarea') return true;
      if (allowed === 'journal' && blockType === 'journal') return true;
      if (allowed === 'checklist' && blockType === 'checklist') return true;
      if (allowed === 'summary' && blockType === 'reflection') return true;
      return false;
  });

  // If strict enforcement is desired:
  // if (!isAllowed) return { allowed: false, reason: `Component '${key}' is not in the allowed palette for ${preset.label}.` };

  return { allowed: true };
}
