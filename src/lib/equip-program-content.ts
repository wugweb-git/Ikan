// Content for individual equip program landing pages
export interface EquipProgramDetails {
  id: string;
  title: string;
  slug: string;
  overview: {
    title: string;
    description: string;
  };
  whatYoullGet: {
    title: string;
    description: string;
  };
  programDetails: {
    duration: string;
    accessPeriod: string;
    modules: string;
    eligibility?: string;
  };
  structure: {
    title: string;
    weeks: Array<{
      week: number;
      title: string;
      description: string;
    }>;
    moreCount: number;
  };
  pricing: {
    amount: string;
    currency: string;
    description: string;
  };
}

// Individual program content
const equipProgramsContent: Record<string, EquipProgramDetails> = {
  "burnout-recovery-32": {
    id: "burnout-recovery-32",
    title: "Burnout Recovery (32-day)",
    slug: "burnout-recovery-32",
    overview: {
      title: "Program Overview",
      description: "A comprehensive 32-day guided program to recover from burnout, build resilience, and restore energy with structured daily lessons and practices."
    },
    whatYoullGet: {
      title: "What You'll Get",
      description: "This evidence-based program combines cognitive behavioral techniques with mindfulness practices to address the root causes of burnout. You'll develop personalized strategies for managing stress, setting boundaries, and rebuilding your energy reserves through daily guided activities."
    },
    programDetails: {
      duration: "32 days",
      accessPeriod: "180 days access",
      modules: "32 daily modules"
    },
    structure: {
      title: "Program Structure",
      weeks: [
        {
          week: 1,
          title: "Understanding Burnout",
          description: "Recognize burnout patterns and establish foundations for recovery"
        },
        {
          week: 2,
          title: "Rest and Recovery",
          description: "Master the art of rest and create space for healing"
        },
        {
          week: 3,
          title: "Stress Management",
          description: "Develop effective coping strategies for daily stressors"
        }
      ],
      moreCount: 3
    },
    pricing: {
      amount: "4999",
      currency: "INR",
      description: "One-time payment • 180 days access"
    }
  },
  "stress-management-30": {
    id: "stress-management-30",
    title: "Stress Management (30-day)",
    slug: "stress-management-30",
    overview: {
      title: "Program Overview",
      description: "A 30-day comprehensive program to develop effective stress management techniques and build long-term resilience against daily stressors."
    },
    whatYoullGet: {
      title: "What You'll Get",
      description: "Learn evidence-based stress management strategies including mindfulness, cognitive reframing, and relaxation techniques. This program helps you identify stress triggers and develop personalized coping mechanisms."
    },
    programDetails: {
      duration: "30 days",
      accessPeriod: "180 days access",
      modules: "30 daily modules"
    },
    structure: {
      title: "Program Structure",
      weeks: [
        {
          week: 1,
          title: "Understanding Your Stress",
          description: "Identify your unique stress patterns and triggers"
        },
        {
          week: 2,
          title: "Mindfulness Foundations",
          description: "Learn mindfulness techniques for stress reduction"
        },
        {
          week: 3,
          title: "Cognitive Strategies",
          description: "Develop cognitive tools to reframe stressful situations"
        }
      ],
      moreCount: 2
    },
    pricing: {
      amount: "3999",
      currency: "INR",
      description: "One-time payment • 180 days access"
    }
  },
  "better-sleep-21": {
    id: "better-sleep-21",
    title: "Better Sleep (21-day)",
    slug: "better-sleep-21",
    overview: {
      title: "Program Overview",
      description: "A focused 21-day program to improve sleep quality through evidence-based sleep hygiene practices and cognitive techniques for better rest."
    },
    whatYoullGet: {
      title: "What You'll Get",
      description: "Transform your sleep with this comprehensive program based on cognitive behavioral therapy for insomnia (CBT-I) principles. Learn to optimize your sleep environment, develop healthy sleep routines, and address racing thoughts."
    },
    programDetails: {
      duration: "21 days",
      accessPeriod: "120 days access",
      modules: "21 daily modules"
    },
    structure: {
      title: "Program Structure",
      weeks: [
        {
          week: 1,
          title: "Sleep Foundations",
          description: "Understand sleep science and establish healthy sleep habits"
        },
        {
          week: 2,
          title: "Sleep Hygiene Practices",
          description: "Implement daily routines that promote better sleep"
        },
        {
          week: 3,
          title: "Managing Sleep Challenges",
          description: "Address common sleep problems and racing thoughts"
        }
      ],
      moreCount: 0
    },
    pricing: {
      amount: "2999",
      currency: "INR",
      description: "One-time payment • 120 days access"
    }
  },
  "productivity-challenge-7": {
    id: "productivity-challenge-7",
    title: "Productivity Challenge (7-day)",
    slug: "productivity-challenge-7",
    overview: {
      title: "Program Overview",
      description: "A quick 7-day intensive challenge to boost productivity, improve focus, and develop sustainable work habits for better performance."
    },
    whatYoullGet: {
      title: "What You'll Get",
      description: "Jumpstart your productivity with this fast-paced 7-day challenge. Learn time management techniques, focus strategies, and energy optimization methods that you can implement immediately for lasting results."
    },
    programDetails: {
      duration: "7 days",
      accessPeriod: "90 days access",
      modules: "7 daily challenges"
    },
    structure: {
      title: "Program Structure",
      weeks: [
        {
          week: 1,
          title: "Productivity Assessment",
          description: "Assess your current productivity patterns and identify improvement areas"
        }
      ],
      moreCount: 0
    },
    pricing: {
      amount: "1999",
      currency: "INR",
      description: "One-time payment • 90 days access"
    }
  }
};

// Function to get program content by slug
export function getEquipProgramContent(slug: string): EquipProgramDetails | null {
  return equipProgramsContent[slug] || null;
}

// Function to get stored program data
export const getStoredProgram = () => {
  try {
    const stored = localStorage.getItem('ikan-selected-program');
    if (!stored) return null;
    
    // Try to parse as JSON first (for object format)
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch {
      // If JSON.parse fails, treat it as a plain string (slug)
      return { slug: stored };
    }
  } catch {
    return null;
  }
};

// Default content for when no specific program is selected
export const getDefaultEquipProgramContent = (): EquipProgramDetails => ({
  id: "default",
  title: "Mental Health Equip Programs",
  slug: "default",
  overview: {
    title: "Program Overview",
    description: "Comprehensive mental health programs designed to help you build lasting skills and resilience. Choose from evidence-based programs tailored to your specific needs and goals."
  },
  whatYoullGet: {
    title: "What You'll Get",
    description: "Our programs combine evidence-based therapeutic techniques with modern technology to deliver personalized support. You'll develop practical skills and build lasting resilience for your mental wellness journey."
  },
  programDetails: {
    duration: "4-12 weeks",
    accessPeriod: "180 days access",
    modules: "Multiple programs"
  },
  structure: {
    title: "Program Structure",
    weeks: [
      {
        week: 1,
        title: "Assessment & Onboarding",
        description: "Complete assessment and choose your personalized program path"
      },
      {
        week: 2,
        title: "Foundation Building",
        description: "Learn core concepts and establish healthy practices"
      },
      {
        week: 3,
        title: "Skill Development",
        description: "Build practical skills through interactive exercises"
      }
    ],
    moreCount: 0
  },
  pricing: {
    amount: "Starting from 1999",
    currency: "INR",
    description: "One-time payment • Flexible access"
  }
});