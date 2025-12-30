// Homepage Content Configuration
// This file serves as the single source of truth for homepage text and static assets.
// In the future, this can be replaced by a CMS fetch.

// Assessment Program Images
const imgRectangle9 = "https://images.unsplash.com/photo-1758273240373-370993d0275d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXBpc3QlMjBjb25zdWx0YXRpb24lMjBtZW50YWwlMjBoZWFsdGh8ZW58MXx8fHwxNzY1ODgwMTIyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const imgRectangle10 = "https://images.unsplash.com/photo-1758273240403-052b3c99f636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwc3ljaGlhdHJpc3QlMjBkb2N0b3IlMjBtZW50YWwlMjBoZWFsdGglMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY1ODgwMTIyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const imgRectangle11 = "https://images.unsplash.com/photo-1711343777918-6d395c16e37f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGNsaW5pY2FsJTIwbWVudGFsJTIwaGVhbHRoJTIwY2FyZXxlbnwxfHx8fDE3NjU4ODAxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080";

// Hero Images
const heroImages = {
  bg1: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop",
  video1: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop",
  bg2: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop",
  video2: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop",
  bg3: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
  video3: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
  bg4: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400&h=400&fit=crop",
  video4: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
  bg5: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=400&h=400&fit=crop",
  video5: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  video6a: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
  video6b: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop",
};

// Hero Section
export const HERO_DATA = {
  title: "Reimagining mental health care.",
  description: "Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.",
  ctaText: "Get Started",
  statistics: [
    {
      type: 'label',
      title: 'Acceptance',
      bgImage: heroImages.bg1,
      videoImage: heroImages.video1
    },
    {
      type: 'stat',
      number: '2500+',
      description: 'People who have gained more wellbeing through our platform',
      bgImage: heroImages.bg2,
      videoImage: heroImages.video2
    },
    {
      type: 'label',
      title: 'Understanding',
      bgImage: heroImages.bg3,
      videoImage: heroImages.video3
    },
    {
      type: 'stat',
      number: '52+',
      description: 'Qualified Psychologists',
      bgImage: heroImages.bg4,
      videoImage: heroImages.video4
    },
    {
      type: 'label',
      title: 'Compassion',
      bgImage: heroImages.bg5,
      videoImage: heroImages.video5
    },
    {
      type: 'stat',
      number: '96%',
      description: 'Recommend our courses',
      bgImage: null,
      videoImage: heroImages.video6a,
      videoImage2: heroImages.video6b
    }
  ]
};

// Assessment Section
export const ASSESSMENT_INTRO_DATA = {
  title: "iKan is the mental health platform for the modern era.",
  description: "Get actionable and quantified insights about your mental health. Screen for issues prevent them from turning chronic with the help of our experts and evidence backed tools.",
  ctaText: "Get Started",
  image: "https://images.unsplash.com/photo-1724176636904-394580bfedf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0ZWNobm9sb2d5JTIwYW5hbHl0aWNzJTIwaW5zaWdodHN8ZW58MXx8fHwxNzY1NDQ3NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  programs: [
    { title: "Adult Therapy", image: imgRectangle9 },
    { title: "Adult Psychiatry", image: imgRectangle10 },
    { title: "Hospital Care", image: imgRectangle11 }
  ]
};

export const ASSESSMENT_PROGRAMS_TITLE = "Assessment Programs";
export const ASSESSMENT_PROGRAMS_SUBTITLE = "PROGRAM";
export const ASSESSMENT_BUTTON_TEXT = "Take Assessment";
export const ASSESSMENT_SEE_MORE_TEXT = "SEE MORE";

// Mission Section
export const MISSION_DATA = {
  title: "Our Mission",
  content: "We believe mental health is for everyone. Our mission is to fix the broken system and democratize mental healthcare by creating an accessible, secure, and people-centric and science-backed platform empowering every individual to achieve lasting well-being.",
  videoCaption: "Watch the full\ninterview",
  image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
  imageAlt: "Mission interview"
};

// Equip Programs Section
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

// Resource Block
export const RESOURCE_BLOCK_TITLE = "Our Recent Thoughts";
export const RESOURCE_VIEW_ALL_TEXT = "VIEW ALL";

// Benefits Section
export const BENEFITS_TITLE = "Who is it for?";
export const BENEFITS_DATA = [
  {
    targetType: 'individuals',
    title: 'For Individuals',
    subtitle: 'Find Balance',
    description: 'Personalized mental health support tailored to your unique journey. Access therapy, tools, and a supportive community.',
    color: '#E0F2FE', // light blue
    iconColor: '#0284C7' // blue
  },
  {
    targetType: 'employers',
    title: 'For Employers',
    subtitle: 'Support Your Team',
    description: 'Empower your workforce with comprehensive mental wellness programs. Boost productivity and improve team morale.',
    color: '#F0FDF4', // light green
    iconColor: '#16A34A' // green
  },
  {
    targetType: 'professionals',
    title: 'For Professionals',
    subtitle: 'Expand Your Reach',
    description: 'Join our network of certified mental health professionals. Connect with clients and manage your practice efficiently.',
    color: '#FAF5FF', // light purple
    iconColor: '#9333EA' // purple
  }
];
