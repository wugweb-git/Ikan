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
  "sleep-tight-9": {
    id: "sleep-tight-9",
    title: "Sleep Tight (9-day)",
    slug: "sleep-tight-9",
    overview: {
      title: "Program Overview",
      description: "A comprehensive CBT-based sleep improvement program using structured blocks to help you build awareness, identify patterns, and create lasting rituals for better rest."
    },
    whatYoullGet: {
      title: "What You'll Get",
      description: "This 9-day program combines cognitive behavioral techniques with mindfulness practices to address sleep anxiety. You'll develop personalized strategies for managing racing thoughts, reducing distractions, and building a bedtime ritual that works for you."
    },
    programDetails: {
      duration: "9 days",
      accessPeriod: "Lifetime access",
      modules: "9 daily modules"
    },
    structure: {
      title: "Program Structure",
      weeks: [
        {
          week: 1,
          title: "Awareness & Patterns (Days 1-5)",
          description: "Understand your sleep-health feedback loop, distinguish thoughts from feelings, and identify internal vs. external distractions."
        },
        {
          week: 2,
          title: "Solutions & Rituals (Days 6-9)",
          description: "Brainstorm solutions for sleep disruptors, evaluate them, and build a consistent bedtime ritual."
        }
      ],
      moreCount: 0
    },
    pricing: {
      amount: "999",
      currency: "INR",
      description: "One-time payment • Lifetime access"
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
  id: "sleep-tight-9",
  title: "Sleep Tight (9-day)",
  slug: "sleep-tight-9",
  overview: {
    title: "Program Overview",
    description: "A comprehensive CBT-based sleep improvement program using structured blocks to help you build awareness, identify patterns, and create lasting rituals for better rest."
  },
  whatYoullGet: {
    title: "What You'll Get",
    description: "This 9-day program combines cognitive behavioral techniques with mindfulness practices to address sleep anxiety. You'll develop personalized strategies for managing racing thoughts, reducing distractions, and building a bedtime ritual that works for you."
  },
  programDetails: {
    duration: "9 days",
    accessPeriod: "Lifetime access",
    modules: "9 daily modules"
  },
  structure: {
    title: "Program Structure",
    weeks: [
      {
        week: 1,
        title: "Awareness & Patterns (Days 1-5)",
        description: "Understand your sleep-health feedback loop, distinguish thoughts from feelings, and identify internal vs. external distractions."
      },
      {
        week: 2,
        title: "Solutions & Rituals (Days 6-9)",
        description: "Brainstorm solutions for sleep disruptors, evaluate them, and build a consistent bedtime ritual."
      }
    ],
    moreCount: 0
  },
  pricing: {
    amount: "999",
    currency: "INR",
    description: "One-time payment • Lifetime access"
  }
});
