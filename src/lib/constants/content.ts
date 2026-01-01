/**
 * Content Constants for iKan PWA
 * Centralized location for all hardcoded content strings
 */

// FALLBACK IMAGES
export const FALLBACK_IMAGES = {
  ASSESSMENT_HERO: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
  EQUIP_HERO: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
  RELATED_PROGRAM: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000",
  ANXIETY_ASSESSMENT: "https://images.unsplash.com/photo-1620052087057-bfd8231f584e?q=80&w=2000",
  DEPRESSION_ASSESSMENT: "https://images.unsplash.com/photo-1616870633658-5af666991942?q=80&w=2000",
  DEFAULT: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
} as const;

// ASSESSMENT DETAIL PAGE
export const ASSESSMENT_CONTENT = {
  BLOCK_TITLE: "More Mental Health Assessments",
  BLOCK_SEE_ALL: "SEE ALL",
  NOT_FOUND_TITLE: "Assessment Not Found",
  NOT_FOUND_DESCRIPTION: "We couldn't load the assessment details. Please try again later.",
  NOT_FOUND_BUTTON: "Back to Assessments",
  LOADING_MESSAGE: "Loading assessment...",
  NO_ASSESSMENTS: "No assessments available at the moment.",
} as const;

// EQUIP DETAIL PAGE
export const EQUIP_CONTENT = {
  BLOCK_TITLE: "More Equip Programs",
  BLOCK_FOOTER: "Explore other programs to support your mental wellness journey",
  NOT_FOUND_TITLE: "Program Not Found",
  NOT_FOUND_DESCRIPTION: "The program you are looking for does not exist or has been removed.",
  NOT_FOUND_BUTTON: "View All Programs",
  LOADING_MESSAGE: "Loading program...",
  NO_PROGRAMS: "No programs available at the moment.",
  DEFAULT_DURATION: "18 days",
  DEFAULT_ACTIVITIES: "Self-paced modules",
} as const;

// NEWSLETTER BLOCK
export const NEWSLETTER_CONTENT = {
  ASSESSMENT: {
    title: "Stay Informed About Mental Health",
    benefits: [
      "Get weekly mental health tips and insights",
      "Early access to new assessments and programs",
      "Exclusive resources and guided exercises"
    ],
    imageAlt: "Mental health newsletter subscription",
    ctaText: "Subscribe Now",
  },
  EQUIP: {
    title: "Stay Updated on Mental Wellness",
    benefits: [
      "Get weekly mental wellness tips and strategies",
      "Early access to new programs and resources",
      "Exclusive guided exercises and content"
    ],
    imageAlt: "Mental wellness newsletter subscription",
    ctaText: "Subscribe Now",
  },
  PRIVACY_TEXT: "Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time.",
} as const;

// LEGACY IDS TO FILTER
export const LEGACY_PROGRAM_IDS = [
  'burnout-recovery-32',
  'stress-management-30',
  'better-sleep-21',
  'productivity-challenge-7'
] as const;

// ASSESSMENT FALLBACK DATA
export const ASSESSMENT_FALLBACKS = {
  ANXIETY: {
    title: "Anxiety Assessment (GAD-7)",
    description: "A clinical tool to help you understand your anxiety symptoms.",
    hero_image: FALLBACK_IMAGES.ANXIETY_ASSESSMENT,
    cta_button_text: "Start Assessment",
    cta_button_link: `/assessment-flow?type=gad-7`,
    section1_title: "How it works",
    section1_eligibility_title: "Simple process:",
    section1_eligibility_points: ["7 questions", "Takes ~3 minutes", "Instant results"],
    section1_who_title: "Who is this for?",
    section1_who_content: "Anyone experiencing worry or nervousness.",
    section2_title: "About GAD-7",
    section2_content: "The Generalized Anxiety Disorder 7-item scale is a validated screening tool.",
    section2_bullets: ["Clinically validated", "Used by doctors", "Private"],
    section3_title: "What you'll learn",
    section3_subtitle: "Gain clarity on your symptoms",
    section3_content: ["Severity of anxiety", "Recommended next steps", "Tracking over time"],
    section4_notes_title: "Important Notes",
    section4_notes: [{ title: "Screening only", description: "Not a medical diagnosis." }]
  },
  DEPRESSION: {
    title: "Depression Assessment (PHQ-9)",
    description: "Understand your mood and energy levels with this standard screening tool.",
    hero_image: FALLBACK_IMAGES.DEPRESSION_ASSESSMENT,
    cta_button_text: "Start Assessment",
    cta_button_link: `/assessment-flow?type=phq-9`,
    section1_title: "How it works",
    section1_eligibility_title: "Simple process:",
    section1_eligibility_points: ["9 questions", "Takes ~5 minutes", "Instant results"],
    section1_who_title: "Who is this for?",
    section1_who_content: "Anyone feeling down, hopeless, or tired.",
    section2_title: "About PHQ-9",
    section2_content: "The Patient Health Questionnaire-9 is the gold standard for depression screening.",
    section2_bullets: ["Clinically validated", "Used by doctors", "Private"],
    section3_title: "What you'll learn",
    section3_subtitle: "Understand your mood",
    section3_content: ["Severity of depression", "Impact on daily life", "Tracking over time"],
    section4_notes_title: "Important Notes",
    section4_notes: [{ title: "Screening only", description: "Not a medical diagnosis." }]
  }
} as const;

// DEFAULT METADATA
export const DEFAULT_METADATA = {
  ASSESSMENT: {
    duration: 5,
    difficulty: 'Beginner',
    questionCount: 10,
  },
  EQUIP: {
    duration_days: 18,
  }
} as const;