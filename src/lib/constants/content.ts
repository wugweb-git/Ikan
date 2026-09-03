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
  PRIVACY_TEXT: "We store and process your personal data based on our privacy policy. You can unsubscribe at any time.",
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
    section2_bullets: ["Screening only", "Takes ~5 minutes", "Private"],
    section3_title: "What you'll learn",
    section3_subtitle: "Gain clarity on your symptoms",
    section3_content: ["Severity of anxiety", "Recommended next steps", "Tracking over time"],
    section4_notes_title: "Important Notes",
    section4_notes: [{ title: "Screening only", description: "Not a medical diagnosis." }]
  },
  DEPRESSION: {
    title: "Depression Assessment",
    description: "Understand your mood and energy levels with this standard screening tool.",
    hero_image: FALLBACK_IMAGES.DEPRESSION_ASSESSMENT,
    cta_button_text: "Start Assessment",
    cta_button_link: `/assessment-flow?type=phq-9`,
    section1_title: "How it works",
    section1_eligibility_title: "Simple process:",
    section1_eligibility_points: ["9 questions", "Takes ~5 minutes", "Instant results"],
    section1_who_title: "Who is this for?",
    section1_who_content: "Anyone feeling down, hopeless, or tired.",
    section2_title: "About this assessment",
    section2_content: "A nine-item screening questionnaire covering mood, interest, sleep, energy and concentration over the past two weeks.",
    section2_bullets: ["Screening only", "Takes ~5 minutes", "Private"],
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

// SPECIAL PROGRAM IDS (For linking from Dashboard/Menu)
// Special program IDs used for linking from Dashboard/Menu
export const SPECIAL_PROGRAM_IDS = {
  DAILY_TRACKER: 'tracker-daily-mood-v1', 
  ONBOARDING: 'utility-onboarding-v1',
} as const;

// ═══════════════════════════════════════════════════════════════
// UI LABEL STRINGS — Centralized for all pages
// These are fallback strings used when CMS content is unavailable.
// ═══════════════════════════════════════════════════════════════

// HOMEPAGE
export const HOMEPAGE_LABELS = {
  ASSESSMENT_PROGRAMS_TITLE: 'Assessment Programs',
  ASSESSMENT_PROGRAMS_SUBTITLE: 'PROGRAM',
  ASSESSMENT_BUTTON_TEXT: 'Take Assessment',
  ASSESSMENT_SEE_MORE_TEXT: 'SEE MORE',
  EQUIP_FOOTER_TEXT: 'Supported by leading healthcare providers',
  RESOURCE_BLOCK_TITLE: 'Our Recent Thoughts',
  NEWSLETTER_TITLE: 'Stay Informed About Mental Health',
  NEWSLETTER_BENEFITS: [
    'Get weekly mental health tips and insights',
    'Early access to new features and programs',
    'Exclusive resources and guided exercises',
  ],
  NEWSLETTER_IMAGE_ALT: 'Mental health newsletter',
  NEWSLETTER_CTA_TEXT: 'Subscribe Now',
} as const;

// ASSESSMENT BENTO TILE HEADINGS
export const ASSESSMENT_TILE_LABELS = {
  WHAT_IS_THIS: 'What is this assessment?',
  HOW_IT_WORKS: 'How it works',
  IMPORTANT: 'Important',
  WHAT_YOULL_SEE: "What you'll see",
  START_ASSESSMENT: 'Start Assessment',
  BACK_TO_ASSESSMENTS: 'Back to Assessments',
  DEFAULT_SAFETY_NOTE: 'This is a screening tool, not a medical diagnosis.',
  DEFAULT_RESULT_DESCRIPTION: "Upon completion, you'll receive a detailed breakdown of your results.",
  DEFAULT_PROCESS_STEPS: [
    'Answer the questions honestly',
    'Your responses are private & secure',
    'Receive immediate insights & guidance',
  ],
  RESULT_PREVIEW: {
    SCORE: 'Score',
    SCORE_VALUE: 'Risk',
    INSIGHT: 'Insight',
    INSIGHT_VALUE: 'Deep',
    PLAN: 'Plan',
    PLAN_VALUE: 'Action',
  },
} as const;

// LIBRARY / RESOURCE PAGE
export const LIBRARY_LABELS = {
  PAGE_TITLE: 'Resources',
  PAGE_SUBTITLE: 'Explore articles, guides, and tools to support your mental health journey',
  NO_RESOURCES_FOUND: 'No resources found matching your criteria.',
  CLEAR_FILTERS: 'Clear all filters',
  FEATURED: 'Featured',
  CONTENT_TYPES: [
    { value: 'all', label: 'All' },
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'podcast', label: 'Podcasts' },
    { value: 'guide', label: 'Guides' },
    { value: 'infographic', label: 'Infographics' },
  ],
} as const;

// EQUIP PROGRAMS PAGE
export const EQUIP_PAGE_LABELS = {
  DEFAULT_HERO_TITLE: 'Equip Programs',
  DEFAULT_HERO_SUBTITLE: 'Evidence-based programs designed to support your mental health journey.',
  EMPTY_STATE_TITLE: 'Programs Coming Soon',
  EMPTY_STATE_DESCRIPTION: "We're preparing evidence-based programs to support your mental health journey. Check back soon.",
  UNTITLED_PROGRAM: 'Untitled Program',
} as const;

// CONSULTATION PAGE
export const CONSULTATION_LABELS = {
  DEFAULT_HERO_TITLE: 'Find Your Consultant',
  DEFAULT_HERO_SUBTITLE: 'Connect with experienced mental health professionals who understand your needs.',
} as const;

// ABOUT US PAGE
export const ABOUT_US_LABELS = {
  HERO_TITLE: 'To us, mental health matters.',
  HERO_SUBTITLE: 'At iKan, we believe mental health is for everyone.',
  SECTION_OUR_STORY: 'Our Story',
  SECTION_OUR_TEAM: 'Our Team',
  TEAM_DESCRIPTION: 'The people behind iKan, driven by personal experience and a shared belief that mental health care should be better.',
  WHY_YOULL_LOVE: "Why you'll love",
  BRAND_NAME: 'iKan',
} as const;

// DATA FALLBACK DEFAULTS
export const DATA_FALLBACKS = {
  READ_TIME: '5 min read',
  DATE: 'Recently',
  CATEGORY: 'General',
  QUESTION_COUNT: 10,
  DURATION_MINUTES: 5,
  ASSESSMENT_CATEGORY: 'wellness',
  EQUIP_DESCRIPTION: 'Mental wellness program',
  EQUIP_DURATION: '18 days',
  EQUIP_ACTIVITIES: 'Self-paced modules',
} as const;

// Add legal page and footer labels
// LEGAL & POLICY PAGE LABELS
export const LEGAL_PAGE_LABELS = {
  TERMS_TITLE: 'Terms of Service',
  TERMS_SUBTITLE: "Important legal terms governing your use of iKan's mental health platform and services.",
  PRIVACY_TITLE: 'Privacy Policy',
  PRIVACY_SUBTITLE: 'Your privacy and data security are fundamental to our mission.',
  RETURN_TITLE: 'Return & Refund Policy',
  RETURN_SUBTITLE: 'Understanding our refund and return policy for iKan services.',
  CANCELLATION_TITLE: 'Cancellation Policy',
  CANCELLATION_SUBTITLE: 'We understand plans change. Cancel anytime with no penalties or hidden fees.',
} as const;

// FAQ PAGE LABELS
export const FAQ_LABELS = {
  HERO_TITLE: 'FAQs & Help Center',
  HERO_SUBTITLE: 'Find answers to common questions about iKan, your account, programs, and more.',
  SEARCH_PLACEHOLDER: 'Search for answers...',
  NO_RESULTS: 'No results found. Try a different search term.',
  CTA_TITLE: 'Still have questions?',
  CTA_DESCRIPTION: 'We are here to help you on your mental health journey. Submit a ticket and our team will get back to you.',
  CTA_BUTTON: 'Contact Support',
} as const;

// CONTACT PAGE LABELS
export const CONTACT_LABELS = {
  HERO_TITLE: "We're Here to Help",
  HERO_SUBTITLE: 'Your mental health journey matters to us. Reach out for support, questions, or just to connect.',
  FORM_TITLE: 'Send us a Message',
  FORM_SUBTITLE: 'We typically respond within 24 hours during business days.',
  SUBMIT_BUTTON: 'Send Message',
  SUBMITTED_TEXT: 'Message Sent',
  SUBMITTING_TEXT: 'Sending...',
} as const;

// SITEMAP PAGE LABELS
export const SITEMAP_LABELS = {
  HERO_TITLE: 'Site Navigation',
  HERO_SUBTITLE: 'Explore all pages and resources available on iKan.',
} as const;

// NOT FOUND PAGE LABELS
export const NOT_FOUND_LABELS = {
  HERO_TITLE: 'Page Not Found',
  HERO_SUBTITLE: "We couldn't find the page you're looking for.",
  HEADING: 'Lost your way?',
  DESCRIPTION: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  HOME_BUTTON: 'Return Home',
  BACK_BUTTON: 'Go Back',
} as const;