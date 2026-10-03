/**
 * Copy shared by more than one marketing page.
 *
 * Page-specific copy lives in cms-defaults.ts; this file holds the strings
 * several pages repeat, so they are written once.
 */

// ASSESSMENT DETAIL PAGE — the related-assessments strip.
export const ASSESSMENT_CONTENT = {
  BLOCK_TITLE: "More Mental Health Assessments",
  BLOCK_SEE_ALL: "SEE ALL",
} as const;

// NEWSLETTER BLOCK
export const NEWSLETTER_CONTENT = {
  /** Homepage and About Us. */
  HOME: {
    title: "Stay Informed About Mental Health",
    benefits: [
      "Get weekly mental health tips and insights",
      "Early access to new features and programs",
      "Exclusive resources and guided exercises"
    ],
    imageAlt: "Mental health newsletter",
    ctaText: "Subscribe Now",
  },
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

// Programme ids left over from before the current catalogue; never listed as related.
export const LEGACY_PROGRAM_IDS = [
  'burnout-recovery-32',
  'stress-management-30',
  'better-sleep-21',
  'productivity-challenge-7'
] as const;
