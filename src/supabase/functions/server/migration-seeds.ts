/**
 * MIGRATION SEED DATA
 * This file contains the static data to be migrated into the KV store.
 */

import { ContentCategory, ContentType, ContentStatus, BlockType, DatasetType } from "./shared-types.ts";

// ------------------------------------------------------------------
// 1. CONTENT ITEMS (Editorial Content)
// ------------------------------------------------------------------

export const SEED_CONTENT_ITEMS = [
  // --- Equip Intros ---
  {
    slug: 'sleep-well-intro',
    title: 'Sleep Well Program',
    summary: 'A guided, science-backed journey to better rest.',
    body: `
# Sleep Well

Sleep Tight is a guided, self-help program designed to help you understand and improve your sleep. Over the next 28 days, you’ll identify factors that disrupt your sleep and gradually build healthier sleep patterns that support your well-being.

## What you'll learn
*   **Understand your sleep better**: Notice patterns and identify factors affecting your sleep.
*   **Manage sleep-related thoughts**: Learn ways to respond to worries that keep you awake.
*   **Build sleep-friendly habits**: Create routines that support better rest.
*   **Develop reusable tools**: Practice skills you can return to when sleep feels difficult.

## How it works
The program focuses on sleep in two stages. First, you’ll learn practical techniques to calm your mind and improve sleep hygiene. Then, you’ll build a personalized bedtime routine and practice these skills consistently.
    `,
    content_type: 'guide' as ContentType,
    category: 'sleep' as ContentCategory,
    status: 'published' as ContentStatus,
    cover_image_url: 'https://images.unsplash.com/photo-1541781777621-39125221ab97?q=80&w=2000&auto=format&fit=crop'
  },
  {
    slug: 'stress-management-intro',
    title: 'Stress Management',
    summary: 'Master your stress response with CBT and mindfulness.',
    body: `
# Stress Management

Regain control over your stress levels with our comprehensive 30-day program. Learn to identify stressors, manage your physiological response, and build lasting resilience.

## Program Highlights
*   Physiological stress model education
*   Relaxation techniques (Box Breathing, PMR)
*   Cognitive restructuring for stressful thoughts
*   Time management and boundary setting
    `,
    content_type: 'guide' as ContentType,
    category: 'stress' as ContentCategory,
    status: 'published' as ContentStatus,
    cover_image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop'
  },
  {
    slug: 'unburn-intro',
    title: 'Unburn: Recover from Burnout',
    summary: 'A compassionate path to recovering your energy and passion.',
    body: `
# Unburn

Burnout isn't just about being tired; it's about being drained of meaning. This 32-day program helps you reconnect with your values, restore your energy, and find joy in your work and life again.

## What to expect
*   Deep rest protocols
*   Value realignment exercises
*   Sustainable work practices
*   Emotional processing
    `,
    content_type: 'guide' as ContentType,
    category: 'burnout' as ContentCategory,
    status: 'published' as ContentStatus,
    cover_image_url: 'https://images.unsplash.com/photo-1499209974431-2761eb43a768?q=80&w=2000&auto=format&fit=crop'
  },

  // --- Legal Pages (Migrated from Index) ---
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How we handle your data.',
    body: 'At iKan, we are committed to protecting your privacy... (Full text would go here)',
    content_type: 'article' as ContentType,
    category: 'general' as ContentCategory,
    status: 'published' as ContentStatus
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    summary: 'Rules for using our platform.',
    body: 'By accessing and using iKan, you agree to... (Full text would go here)',
    content_type: 'article' as ContentType,
    category: 'general' as ContentCategory,
    status: 'published' as ContentStatus
  }
];

// ------------------------------------------------------------------
// 2. EQUIPS (Programs)
// ------------------------------------------------------------------

export const SEED_EQUIPS = [
  {
    slug: 'sleep-well',
    name: 'Sleep Well',
    category: 'sleep' as ContentCategory,
    duration_days: 28,
    price_cents: 500000, // ₹5000.00
    status: 'published',
    intro_content_slug: 'sleep-well-intro' 
  },
  {
    slug: 'stress-management',
    name: 'Stress Management',
    category: 'stress' as ContentCategory,
    duration_days: 30,
    price_cents: 500000,
    status: 'published',
    intro_content_slug: 'stress-management-intro'
  },
  {
    slug: 'unburn',
    name: 'Unburn',
    category: 'burnout' as ContentCategory,
    duration_days: 32,
    price_cents: 500000,
    status: 'published',
    intro_content_slug: 'unburn-intro'
  }
];

// ------------------------------------------------------------------
// 3. DATASETS (Interaction Schemas)
// ------------------------------------------------------------------

export const SEED_DATASETS = [
  {
    dataset_key: 'thought_log',
    dataset_type: 'table' as DatasetType,
    schema: {
      columns: [
        { key: "time", type: "time", label: "Time" },
        { key: "situation", type: "text", label: "Situation" },
        { key: "thoughts", type: "text", label: "Automatic Thoughts" },
        { key: "feelings", type: "text", label: "Emotions (0-100)" },
        { key: "response", type: "text", label: "Rational Response" }
      ]
    }
  },
  {
    dataset_key: 'sleep_diary',
    dataset_type: 'table' as DatasetType,
    schema: {
      columns: [
        { key: "bed_time", type: "time", label: "Went to bed" },
        { key: "sleep_latency", type: "number", label: "Minutes to fall asleep" },
        { key: "wake_count", type: "number", label: "Times woke up" },
        { key: "wake_time", type: "time", label: "Woke up for day" },
        { key: "quality", type: "select", options: ["Poor", "Fair", "Good", "Excellent"], label: "Quality" }
      ]
    }
  },
  {
    dataset_key: 'mood_check_in',
    dataset_type: 'mcq' as DatasetType,
    schema: {
      question: "How are you feeling right now?",
      options: [
        { value: "great", label: "Great 🤩" },
        { value: "good", label: "Good 🙂" },
        { value: "okay", label: "Okay 😐" },
        { value: "bad", label: "Bad 🙁" },
        { value: "terrible", label: "Terrible 😫" }
      ]
    }
  },
  {
    dataset_key: 'stress_symptoms',
    dataset_type: 'multi_select' as DatasetType,
    schema: {
      question: "What symptoms are you noticing?",
      options: [
        { value: "headache", label: "Headache" },
        { value: "tension", label: "Muscle Tension" },
        { value: "fatigue", label: "Fatigue" },
        { value: "irritability", label: "Irritability" },
        { value: "sleep_issues", label: "Sleep Issues" }
      ]
    }
  }
];

// ------------------------------------------------------------------
// 4. DAY STRUCTURE TEMPLATES (For generation)
// ------------------------------------------------------------------

export const DAY_TEMPLATES = {
  welcome: {
    title: "Let's Begin",
    minutes: 10,
    blocks: [
      { type: 'lesson' as BlockType, content: "Welcome to the program. Today is about setting intentions." },
      { type: 'reflection' as BlockType, content: "What brings you here today?" }
    ]
  },
  standard: {
    title: "Daily Practice",
    minutes: 15,
    blocks: [
      { type: 'checklist' as BlockType, content: "Review yesterday's goals" },
      { type: 'lesson' as BlockType, content: "Today's concept: Awareness." },
      { type: 'exercise' as BlockType, dataset_key: 'mood_check_in' }
    ]
  },
  deep_dive: {
    title: "Deep Dive",
    minutes: 25,
    blocks: [
      { type: 'lesson' as BlockType, content: "Understanding the Cognitive Model." },
      { type: 'table' as BlockType, dataset_key: 'thought_log' },
      { type: 'reflection' as BlockType, content: "How did it feel to track your thoughts?" }
    ]
  },
  review: {
    title: "Weekly Review",
    minutes: 20,
    blocks: [
      { type: 'lesson' as BlockType, content: "Looking back at your progress." },
      { type: 'exercise' as BlockType, dataset_key: 'stress_symptoms' },
      { type: 'reflection' as BlockType, content: "What went well this week?" }
    ]
  }
};

// ------------------------------------------------------------------
// 5. RECOMMENDATION RULES
// ------------------------------------------------------------------

export const SEED_RECOMMENDATION_RULES = [
  // Anxiety -> Stress / Sleep
  {
    assessment_category: 'anxiety',
    min_severity: 'moderate',
    equip_slug: 'stress-management',
    priority: 1,
    rationale: 'Anxiety often improves with structured stress regulation practices'
  },
  {
    assessment_category: 'anxiety',
    min_severity: 'high',
    equip_slug: 'sleep-well',
    priority: 2,
    rationale: 'High anxiety frequently impacts sleep quality'
  },

  // Sleep -> Sleep Well
  {
    assessment_category: 'sleep',
    min_severity: 'mild',
    equip_slug: 'sleep-well',
    priority: 1,
    rationale: 'Early sleep difficulties can improve with structured sleep habits'
  },
  {
    assessment_category: 'sleep',
    min_severity: 'moderate',
    equip_slug: 'sleep-well',
    priority: 1,
    rationale: 'Consistent sleep disruption benefits from guided sleep training'
  },
  {
    assessment_category: 'sleep',
    min_severity: 'high',
    equip_slug: 'sleep-well',
    priority: 1,
    rationale: 'Severe sleep disruption requires focused, daily sleep intervention'
  },

  // Burnout -> Unburn
  {
    assessment_category: 'burnout',
    min_severity: 'moderate',
    equip_slug: 'unburn',
    priority: 1,
    rationale: 'Burnout recovery requires restoring energy, boundaries, and balance'
  },
  {
    assessment_category: 'burnout',
    min_severity: 'high',
    equip_slug: 'unburn',
    priority: 1,
    rationale: 'Severe burnout benefits from extended recovery-focused programs'
  },

  // Stress -> Stress Management
  {
    assessment_category: 'stress',
    min_severity: 'moderate',
    equip_slug: 'stress-management',
    priority: 1,
    rationale: 'Chronic stress responds well to structured coping skills'
  },
  {
    assessment_category: 'stress',
    min_severity: 'high',
    equip_slug: 'stress-management',
    priority: 1,
    rationale: 'High stress levels benefit from guided daily stress reduction'
  }
];
