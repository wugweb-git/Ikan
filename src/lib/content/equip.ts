// Equip Program Content
// This file serves as the content repository for Equip programs fallback data.

export const MOCK_RESOURCES = [
  {
    id: 'mock-1',
    title: 'Understanding Sleep Cycles',
    content: 'Learn about the different stages of sleep and why they matter.',
    category: 'Sleep',
    imageUrl: 'https://images.unsplash.com/photo-1541781777621-39125221ab97?q=80&w=800&auto=format&fit=crop',
    readTime: '5 min read',
    link: '#'
  },
  {
    id: 'mock-2',
    title: 'Bedtime Rituals',
    content: 'Simple habits to help you wind down before bed.',
    category: 'Habits',
    imageUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b504802?q=80&w=800&auto=format&fit=crop',
    readTime: '3 min read',
    link: '#'
  },
  {
    id: 'mock-3',
    title: 'Anxiety and Sleep',
    content: 'How to manage racing thoughts when trying to sleep.',
    category: 'Mental Health',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    readTime: '7 min read',
    link: '#'
  }
];

export const SLEEP_TIGHT_FALLBACK = {
  id: 'sleep-tight-9',
  title: "Sleep Tight",
  description: "Sleep Tight is a guided, self-help program designed to help you understand and improve your sleep. Over the next 18 days, you’ll identify factors that disrupt your sleep and gradually build healthier sleep patterns that support your well-being.",
  hero_image: "https://images.unsplash.com/photo-1541781777621-39125221ab97?q=80&w=2000&auto=format&fit=crop",
  cta_button_link: `/equip-program-onboarding?id=sleep-tight-9`,
  
  // Map bento grid sections
  section1_title: "Is this for you?",
  section1_eligibility_title: "Sleep Tight may be helpful if:",
  section1_eligibility_points: [
      "You have trouble falling asleep or staying asleep",
      "You wake up too early and struggle to fall back asleep",
      "You find yourself worrying about your sleep",
      "Poor sleep is starting to affect your day-to-day life"
  ],
  section1_who_title: "Who can participate",
  section1_who_content: "This program is designed for adults who want to improve their sleep. If you’re managing other mental health concerns, consider checking with a qualified healthcare professional before starting.",
  
  section2_title: "Sleep Tight",
  section2_subtitle: "A guided program to improve sleep",
  section2_content: "Sleep Tight is a guided, self-help program designed to help you understand and improve your sleep. Over the next 18 days, you’ll identify factors that disrupt your sleep and gradually build healthier sleep patterns that support your well-being.",
  section2_bullets: [
      "A structured 18-day journey designed to fit into daily life",
      "Sleep, mood, and habit trackers to notice patterns and disruptions",
      "Science-backed techniques, including CBT"
  ],
  section2_image: "https://images.unsplash.com/photo-1511295742362-92c96b504802?q=80&w=2000&auto=format&fit=crop",
  section2_image_secondary: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop",
  
  section3_title: "How it works",
  section3_content: [
      "The program focuses on sleep in two stages.",
      "First, you’ll learn practical techniques to calm your mind and improve sleep hygiene.",
      "Then, you’ll build a personalized bedtime routine and practice these skills consistently.",
      "The focus is on habit-building — without medication or pressure — to support better rest over time."
  ],
  
  section4_benefits_title: "What you’ll gain",
  section4_benefits: [
      { title: "Understand your sleep better", description: "Notice patterns and identify factors affecting your sleep" },
      { title: "Manage sleep-related thoughts", description: "Learn ways to respond to worries that keep you awake" },
      { title: "Build sleep-friendly habits", description: "Create routines that support better rest" },
      { title: "Develop reusable tools", description: "Practice skills you can return to when sleep feels difficult" }
  ],
  section4_notes_title: "Important notes",
  section4_notes: [
      { title: "Consistency matters", description: "This is an 18-day program. Spending a few minutes daily helps reinforce skills." },
      { title: "This is a self-help tool", description: "The program focuses on building coping skills and does not claim to cure mental health conditions." },
      { title: "Support is always okay", description: "If you feel overwhelmed at any point, consider speaking with a mental health professional." }
  ]
};

export const FALLBACK_RELATED_PROGRAM = {
  title: "More Programs Coming Soon",
  description: "We are currently developing new programs to support your mental wellness journey. Stay tuned for updates.",
  image: "https://images.unsplash.com/photo-1499209974431-2761eb43a768?q=80&w=800&auto=format&fit=crop",
  duration: "Coming Soon",
  activities: "-",
  link: "#"
};
