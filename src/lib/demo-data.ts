import { EquipProgram, Activity, DayContent, OnboardingQuestion } from './equip-admin-types';

// ============================================================================
// HELPERS & MAPPINGS
// ============================================================================
const mapBlockType = (type: string): Activity['type'] => {
    switch(type) {
        case 'lesson': return 'lesson';
        case 'quiz': return 'exercise';
        case 'reflection': return 'reflection';
        case 'checklist': return 'checklist';
        default: return 'lesson';
    }
};

const mapSubtype = (subtype?: string): any => {
    if (!subtype) return undefined;
    if (subtype === 'matrix') return 'table';
    if (subtype === 'row_list') return 'table';
    if (subtype === 'text_list') return 'table'; // map list input to table
    if (subtype === 'scale') return 'single-select'; // fallback for scale
    return subtype.replace('_', '-'); // e.g. single_select -> single-select
};

// ============================================================================
// ASSESSMENT DATA
// ============================================================================
export const DUMMY_ASSESSMENT = {
  id: 'assessment-comprehensive-v1',
  slug: 'assessment-comprehensive-v1',
  title: 'Comprehensive Mental Health Assessment',
  description: 'A full screening for Stress, Burnout, Sleep issues, and Productivity blockers.',
  questions: [
    {
      id: 'sleep_1',
      text: 'How would you rate your sleep quality over the last 2 weeks?',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Very Good', value: 0 },
        { id: '1', text: 'Good', value: 1 },
        { id: '2', text: 'Bad', value: 2 },
        { id: '3', text: 'Very Bad', value: 3 }
      ],
      required: true
    },
    {
      id: 'sleep_2',
      text: 'Do you have trouble staying awake during the day?',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Never', value: 0 },
        { id: '1', text: 'Sometimes', value: 1 },
        { id: '2', text: 'Often', value: 2 },
        { id: '3', text: 'Always', value: 3 }
      ],
      required: true
    },
    {
      id: 'burnout_1',
      text: 'I feel emotionally drained from my work.',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Never', value: 0 },
        { id: '1', text: 'Rarely', value: 1 },
        { id: '2', text: 'Sometimes', value: 2 },
        { id: '3', text: 'Often', value: 3 }
      ],
      required: true
    },
    {
      id: 'burnout_2',
      text: 'I doubt the significance of my work.',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Never', value: 0 },
        { id: '1', text: 'Rarely', value: 1 },
        { id: '2', text: 'Sometimes', value: 2 },
        { id: '3', text: 'Often', value: 3 }
      ],
      required: true
    },
    {
      id: 'stress_1',
      text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Never', value: 0 },
        { id: '1', text: 'Almost Never', value: 1 },
        { id: '2', text: 'Sometimes', value: 2 },
        { id: '3', text: 'Often', value: 3 }
      ],
      required: true
    },
    {
      id: 'stress_2',
      text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Never', value: 0 },
        { id: '1', text: 'Almost Never', value: 1 },
        { id: '2', text: 'Sometimes', value: 2 },
        { id: '3', text: 'Often', value: 3 }
      ],
      required: true
    },
    {
      id: 'prod_1',
      text: 'I find it hard to focus on a single task for more than 15 minutes.',
      type: 'single-choice',
      options: [
        { id: '0', text: 'Disagree', value: 0 },
        { id: '1', text: 'Neutral', value: 1 },
        { id: '2', text: 'Agree', value: 2 }
      ],
      required: true
    }
  ],
  scoring: {
    type: 'category-based',
    ranges: [
      { 
        id: 'rec-sleep',
        min: 4, 
        max: 6, 
        category: 'sleep', 
        label: 'Sleep Issues Detected', 
        recommendation: 'sleep-tight',
        interpretation: 'Your responses indicate significant sleep disruption. We recommend the Sleep Tight program.' 
      },
      { 
        id: 'rec-burnout',
        min: 4, 
        max: 6, 
        category: 'burnout', 
        label: 'High Burnout Risk', 
        recommendation: 'burnout-reset',
        interpretation: 'You are showing signs of burnout (exhaustion/cynicism). The Burnout Recovery program is advised.' 
      },
      { 
        id: 'rec-stress',
        min: 4, 
        max: 6, 
        category: 'stress', 
        label: 'High Stress', 
        recommendation: 'stress-buster',
        interpretation: 'Your stress levels appear unmanageable. The Stress Buster program can help.' 
      },
      {
        id: 'rec-prod',
        min: 2,
        max: 2,
        category: 'prod',
        label: 'Focus Challenges',
        recommendation: 'productivity-reset',
        interpretation: 'You indicated difficulty focusing. The Productivity Reset might be helpful.'
      }
    ]
  }
};

// ============================================================================
// PRODUCTIVITY RESET
// ============================================================================
import { productivityProgramData } from '../components/admin/programs/productivity';

const prodDailyContent: DayContent[] = productivityProgramData.days.map((day, dIdx) => ({
    day: day.day_number,
    title: day.title,
    description: day.description,
    dayType: dIdx === 0 ? 'learning' : 'practice',
    activities: day.blocks.map((b: any, bIdx: number) => ({
        id: `prod-d${day.day_number}-b${bIdx}`,
        order: bIdx + 1,
        title: b.title,
        type: mapBlockType(b.block_type),
        content: b.content || '',
        duration: 5,
        required: true,
        image_url: b.image_url,
        autoAdvance: b.auto_advance,
        exerciseConfig: b.exercise_config ? {
            ...b.exercise_config,
            subtype: mapSubtype(b.exercise_config.subtype),
            // Map matrix/lists to columns if needed
            columns: b.exercise_config.columns || (b.exercise_config.subtype === 'text_list' ? ['Item'] : undefined)
        } : undefined
    }))
}));

export const DUMMY_PRODUCTIVITY_PROGRAM: EquipProgram = {
    id: 'equip-productivity-reset',
    slug: 'productivity-reset',
    title: productivityProgramData.title,
    description: productivityProgramData.description,
    category: productivityProgramData.category,
    difficulty: 'Beginner',
    duration_days: 7,
    status: 'published',
    version: '1.0.0',
    price: 0,
    currency: 'USD',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    thumbnail: productivityProgramData.image_url,
    cover_image: productivityProgramData.image_url,
    onboarding_questions: [],
    daily_content: prodDailyContent,
    section1_title: 'Reset Your Focus',
    section1_eligibility_points: ['Procrastination', 'Brain Fog', 'Distraction'],
    section2_title: '7 Days to Focus',
    section2_content: 'Reclaim your attention span.',
    overview_benefits: ['Deep Work', 'Better Planning']
};

// ============================================================================
// SLEEP TIGHT
// ============================================================================
import { sleepProgramData } from '../components/admin/programs/sleep';

const sleepDailyContent: DayContent[] = sleepProgramData.days.map((day, dIdx) => ({
    day: day.day_number,
    title: day.title,
    description: day.description,
    dayType: 'practice',
    activities: day.blocks.map((b: any, bIdx: number) => ({
        id: `sleep-d${day.day_number}-b${bIdx}`,
        order: bIdx + 1,
        title: b.title,
        type: mapBlockType(b.block_type),
        content: b.content || '',
        duration: 5,
        required: true,
        image_url: b.image_url,
        autoAdvance: b.auto_advance,
        stepGroup: b.step_group_id,
        exerciseConfig: b.exercise_config ? {
            ...b.exercise_config,
            subtype: mapSubtype(b.exercise_config.subtype),
            columns: b.exercise_config.columns
        } : undefined
    }))
}));

export const DUMMY_SLEEP_PROGRAM: EquipProgram = {
    id: 'equip-sleep-tight',
    slug: 'sleep-tight',
    title: sleepProgramData.title,
    description: sleepProgramData.description,
    category: sleepProgramData.category,
    difficulty: 'Beginner',
    duration_days: 32,
    status: 'published',
    version: '2.0.0',
    price: 0,
    currency: 'USD',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    thumbnail: sleepProgramData.image_url,
    cover_image: sleepProgramData.image_url,
    onboarding_questions: [],
    daily_content: sleepDailyContent,
    section1_title: 'Wake up refreshed.',
    section1_eligibility_points: ['Insomnia', 'Fatigue'],
    section2_title: 'CBT-I Based',
    section2_content: 'Science-backed sleep improvement.',
    overview_benefits: ['Better Sleep Quality', 'Faster Onset']
};

// ============================================================================
// BURNOUT RESET
// ============================================================================
import { burnoutProgramData } from '../components/admin/programs/burnout';

const burnoutDailyContent: DayContent[] = burnoutProgramData.days.map((day, dIdx) => ({
    day: day.day_number,
    title: day.title,
    description: day.description,
    dayType: 'practice',
    activities: day.blocks.map((b: any, bIdx: number) => ({
        id: `burn-d${day.day_number}-b${bIdx}`,
        order: bIdx + 1,
        title: b.title,
        type: mapBlockType(b.block_type),
        content: b.content || '',
        duration: 5,
        required: true,
        image_url: b.image_url,
        autoAdvance: b.auto_advance,
        stepGroup: b.step_group_id,
        exerciseConfig: b.exercise_config ? {
            ...b.exercise_config,
            subtype: mapSubtype(b.exercise_config.subtype),
            columns: b.exercise_config.columns
        } : undefined
    }))
}));

export const DUMMY_BURNOUT_PROGRAM: EquipProgram = {
    id: 'equip-burnout-reset',
    slug: 'burnout-reset',
    title: burnoutProgramData.title,
    description: burnoutProgramData.description,
    category: burnoutProgramData.category,
    difficulty: 'Intermediate',
    duration_days: 32,
    status: 'published',
    version: '1.0.0',
    price: 0,
    currency: 'USD',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    thumbnail: burnoutProgramData.image_url,
    cover_image: burnoutProgramData.image_url,
    onboarding_questions: [],
    daily_content: burnoutDailyContent,
    section1_title: 'Recover from Burnout',
    section1_eligibility_points: ['Exhaustion', 'Cynicism', 'Inefficacy'],
    section2_title: 'Energy Management',
    section2_content: 'Reclaim your spark.',
    overview_benefits: ['Restored Energy', 'Boundaries']
};

// ============================================================================
// STRESS BUSTER
// ============================================================================
import { stressProgramData } from '../components/admin/programs/stress';

const stressDailyContent: DayContent[] = stressProgramData.days.map((day, dIdx) => ({
    day: day.day_number,
    title: day.title,
    description: day.description,
    dayType: 'practice',
    activities: day.blocks.map((b: any, bIdx: number) => ({
        id: `stress-d${day.day_number}-b${bIdx}`,
        order: bIdx + 1,
        title: b.title,
        type: mapBlockType(b.block_type),
        content: b.content || '',
        duration: 5,
        required: true,
        image_url: b.image_url,
        autoAdvance: b.auto_advance,
        stepGroup: b.step_group_id,
        exerciseConfig: b.exercise_config ? {
            ...b.exercise_config,
            subtype: mapSubtype(b.exercise_config.subtype),
            columns: b.exercise_config.columns
        } : undefined
    }))
}));

export const DUMMY_STRESS_PROGRAM: EquipProgram = {
    id: 'equip-stress-buster',
    slug: 'stress-buster',
    title: stressProgramData.title,
    description: stressProgramData.description,
    category: stressProgramData.category,
    difficulty: 'Beginner',
    duration_days: 30,
    status: 'published',
    version: '1.0.0',
    price: 0,
    currency: 'USD',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    thumbnail: stressProgramData.image_url,
    cover_image: stressProgramData.image_url,
    onboarding_questions: [],
    daily_content: stressDailyContent,
    section1_title: 'Stress Relief',
    section1_eligibility_points: ['High Stress', 'Anxiety', 'Tension'],
    section2_title: 'Tools for Calm',
    section2_content: 'Practical techniques.',
    overview_benefits: ['Instant Calm', 'Long-term Resilience']
};

export const DUMMY_EQUIP_PROGRAM = DUMMY_SLEEP_PROGRAM;
export const ALL_DUMMY_PROGRAMS = [
    DUMMY_SLEEP_PROGRAM,
    DUMMY_BURNOUT_PROGRAM,
    DUMMY_STRESS_PROGRAM,
    DUMMY_PRODUCTIVITY_PROGRAM
];
