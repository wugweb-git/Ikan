import imgRectangle9 from "figma:asset/e14b378ba443955238f6e52a608bb6cfa341e5d8.png";
import imgRectangle10 from "figma:asset/33be9701c78a44f54392cf1bfcc20d8f8f00cd9d.png";
import imgRectangle11 from "figma:asset/2576c36c768010586aefac2ca3b21e8a5e123bd0.png";

// Hero Section Data
export const HERO_DATA = {
  title: "Reimagining mental health care.",
  description: "Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.",
  ctaText: "Get Started"
};

// Assessment Section (Intro) Data
export const ASSESSMENT_INTRO_DATA = {
  title: "iKan is the mental health platform for the modern era.",
  description: "Get actionable and quantified insights about your mental health. Screen for issues prevent them from turning chronic with the help of our experts and evidence backed tools.",
  ctaText: "Get Started",
  image: "https://images.unsplash.com/photo-1724176636904-394580bfedf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0ZWNobm9sb2d5JTIwYW5hbHl0aWNzJTIwaW5zaWdodHN8ZW58MXx8fHwxNzY1NDQ3NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

// Assessment Programs Block Data
export const ASSESSMENT_PROGRAMS_TITLE = "Assessment Programs";
export const ASSESSMENT_PROGRAMS_SUBTITLE = "PROGRAM";
export const ASSESSMENT_BUTTON_TEXT = "Take Assessment";
export const ASSESSMENT_SEE_MORE_TEXT = "SEE MORE";
export const ASSESSMENT_PROGRAMS = [
  {
    title: "Adult Therapy",
    description: "Talk to a trained therapist who helps you make sense of things and feel more in control, one session at a time.",
    image: imgRectangle9,
    info: "5 min Quiz",
    link: "/assessment-landing"
  },
  {
    title: "Adult Psychiatry", 
    description: "Meet with a psychiatrist who helps with sleep, focus, energy, or mood and finds the right medication, if needed.",
    image: imgRectangle10,
    info: "5 min Quiz",
    link: "/assessment-landing"
  },
  {
    title: "Hospital Care",
    description: "Designed for acute mental health needs, with 24/7 support and a multi-disciplinary team that supports you.",
    image: imgRectangle11,
    info: "5 min Quiz",
    link: "/assessment-landing"
  }
];

// Mission Section Data
export const MISSION_DATA = {
  title: "Our Mission",
  content: "We believe mental health is for everyone. Our mission is to fix the broken system and democratize mental healthcare by creating an accessible, secure, and people-centric and science-backed platform empowering every individual to achieve lasting well-being.",
  videoCaption: "Watch the full\ninterview"
};

// Equip Programs Block Data
export const EQUIP_PROGRAMS_TITLE = "Equip Programs";
export const EQUIP_PROGRAMS_SUBTITLE = "PROGRAM";
export const EQUIP_BUTTON_TEXT = "LEARN MORE";
export const EQUIP_FOOTER_TEXT = "Supported by leading healthcare providers";
export const EQUIP_FEATURES = [
  "Flexible — whenever and wherever you want",
  "Self-paced learning modules",
  "Expert-designed curriculum",
  "Community support included",
  "Progress tracking tools"
];

export const EQUIP_PROGRAMS = [
  {
    title: "Stress Management",
    description: "A highly-curated selection of evidence-based techniques, mindfulness practices, and proven strategies for managing stress effectively.",
    duration: "14 days",
    activities: "23 Activities",
    link: "/equip-programs-landing"
  },
  {
    title: "Anxiety Relief",
    description: "Comprehensive program combining cognitive behavioral techniques with practical exercises to help you overcome anxiety and build confidence.",
    duration: "21 days", 
    activities: "31 Activities",
    link: "/equip-programs-landing"
  }
];

// Resource Block Data
export const RESOURCE_BLOCK_TITLE = "Our Recent Thoughts";
export const RESOURCE_VIEW_ALL_TEXT = "VIEW ALL";

// Benefits Section Data
export const BENEFITS_TITLE = "Who is it for?";
export const BENEFITS_DATA = [
  {
    title: "Individuals",
    subtitle: "Prioritize your mental well-being.",
    description: "iKan offers tailored resources, expert guidance, and tracking tools to help you achieve a healthier, happier self.",
    color: "var(--color-status-info-light)",
    iconColor: "var(--color-status-info)",
    targetType: "individuals"
  },
  {
    title: "Employers",
    subtitle: "Maximize your team's potential.",
    description: "iKan provides personalized mental wellness solutions for employees and equips employers with actionable insights for measurable impact.",
    color: "var(--color-status-success-light)",
    iconColor: "var(--color-status-success)",
    targetType: "employers"
  },
  {
    title: "Therapists",
    subtitle: "Enhance client outcomes.",
    description: "Track progress with data-driven insights, accelerating recovery through more targeted and effective care.",
    color: "var(--color-status-warning-light)",
    iconColor: "var(--color-status-warning)",
    targetType: "therapists"
  }
];
