// Helper for images
const images = {
  stress: "https://images.unsplash.com/photo-1758598306663-4874b2aff114?w=800",
  sleep: "https://images.unsplash.com/photo-1756058811187-6cfc539fdfa6?w=800",
  balance: "https://images.unsplash.com/photo-1670270103229-9a999f368bba?w=800",
  general: "https://images.unsplash.com/photo-1758525589695-b667f09dfb13?w=800",
  anxiety: "https://images.unsplash.com/photo-1654272531347-d7bf75ec6a42?w=800",
  depression: "https://images.unsplash.com/photo-1558409057-bbe679023136?w=800",
  burnout: "https://images.unsplash.com/photo-1591964006776-90b32e88f5ec?w=800"
};

export const stressAssessmentData = {
  id: "assessment-stress-v1",
  type: "assessment",
  category: "Stress",
  title: "Feeling Worried & Stressed",
  description: "Understand how stress is affecting you.",
  image_url: images.stress,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["stress", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "lesson",
          title: "Understanding Your Stress",
          content: "<p>Stress shows up differently for everyone. This short check-in helps us understand how it’s affecting you recently.</p>",
          image_url: "https://illustrations/stress-intro.png"
        },
        {
          block_type: "quiz",
          title: "Overwhelm",
          exercise_config: {
            subtype: "scale",
            prompt: "In the past 2 weeks, how often have you felt overwhelmed?",
            scale: { min: 0, max: 4, label_min: "Never", label_max: "Always" },
            key: "stress_overwhelm"
          },
          auto_advance: true,
          step_group_id: "stress-core"
        },
        {
          block_type: "quiz",
          title: "Stress Signs",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which of these stress signs apply to you?",
            options: [
              "Racing thoughts",
              "Poor sleep",
              "Irritability",
              "Physical tension"
            ],
            key: "stress_signs"
          },
          auto_advance: true,
          step_group_id: "stress-core"
        }
      ]
    }
  ]
};

export const sleepAssessmentData = {
  id: "assessment-sleep-v1",
  type: "assessment",
  category: "Sleep",
  title: "Struggling with Quality Sleep",
  description: "Let's look at your sleep quality.",
  image_url: images.sleep,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["sleep", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "lesson",
          title: "Let’s Look at Your Sleep",
          content: "<p>Sleep quality affects mood, energy, and focus. Answer honestly — there are no right or wrong answers.</p>",
          image_url: "https://illustrations/sleep-moon.png"
        },
        {
          block_type: "quiz",
          title: "Quality",
          exercise_config: {
            subtype: "scale",
            prompt: "How would you rate your overall sleep quality?",
            constraints: { min: 1, max: 5 },
            key: "sleep_quality"
          },
          auto_advance: true,
          step_group_id: "sleep-core"
        },
        {
          block_type: "quiz",
          title: "Affectors",
          exercise_config: {
            subtype: "single-select",
            prompt: "What most affects your sleep?",
            options: [
              "Stress / anxiety",
              "Screen usage",
              "Irregular routine",
              "Physical discomfort"
            ],
            key: "sleep_affector"
          },
          auto_advance: true,
          step_group_id: "sleep-core"
        }
      ]
    }
  ]
};

export const balanceAssessmentData = {
  id: "assessment-balance-v1",
  type: "assessment",
  category: "Balance",
  title: "Struggling to Balance Life",
  description: "Check your life balance.",
  image_url: images.balance,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["balance", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "reflection",
          title: "Balance Matrix",
          exercise_config: {
            subtype: "matrix",
            prompt: "How balanced do these areas feel?",
            rows: ["Work", "Health", "Relationships", "Personal Time"],
            columns: ["Very Unbalanced", "Somewhat", "Balanced"],
            key: "balance_matrix"
          },
          step_group_id: "balance-core"
        }
      ]
    }
  ]
};

export const generalAssessmentData = {
  id: "assessment-general-v1",
  type: "assessment",
  category: "General",
  title: "Unsure / General Well-Being",
  description: "A quick check-in.",
  image_url: images.general,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["general", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "reflection",
          title: "Mind",
          exercise_config: {
            subtype: "text",
            prompt: "What’s been on your mind lately?",
            key: "general_mind"
          }
        }
      ]
    }
  ]
};

export const anxietyAssessmentData = {
  id: "assessment-anxiety-v1",
  type: "assessment",
  category: "Anxiety",
  title: "Feeling Overwhelmed & Anxious",
  description: "Check your anxiety levels.",
  image_url: images.anxiety,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["anxiety", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "quiz",
          title: "Nervousness",
          exercise_config: {
            subtype: "scale",
            prompt: "How often have you felt nervous or on edge?",
            scale: { min: 0, max: 4 },
            key: "anxiety_nervous"
          },
          auto_advance: true,
          step_group_id: "anxiety-core"
        }
      ]
    }
  ]
};

export const depressionAssessmentData = {
  id: "assessment-depression-v1",
  type: "assessment",
  category: "Depression",
  title: "Feeling Depressed & Hopeless",
  description: "Check your mood.",
  image_url: images.depression,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["depression", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "quiz",
          title: "Hopelessness",
          exercise_config: {
            subtype: "single-select",
            prompt: "How often have you felt low or hopeless?",
            options: [
              "Not at all",
              "Several days",
              "More than half the days",
              "Nearly every day"
            ],
            key: "depression_hopeless"
          },
          auto_advance: true,
          step_group_id: "depression-core"
        }
      ]
    }
  ]
};

export const burnoutAssessmentData = {
  id: "assessment-burnout-v1",
  type: "assessment",
  category: "Burnout",
  title: "Feeling Drained & Burned Out",
  description: "Check for burnout.",
  image_url: images.burnout,
  difficulty: "beginner",
  duration_weeks: 0,
  tags: ["burnout", "assessment"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Assessment",
      blocks: [
        {
          block_type: "lesson",
          title: "Let’s Check for Burnout",
          content: "<p>Burnout isn’t laziness. It’s prolonged stress without recovery.</p>",
          image_url: "https://illustrations/burnout.png"
        },
        {
          block_type: "quiz",
          title: "Burnout Signs",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which statements feel true lately?",
            options: [
              "I feel emotionally exhausted",
              "I feel detached from work",
              "I feel ineffective"
            ],
            key: "burnout_signs"
          },
          auto_advance: true,
          step_group_id: "burnout-core"
        }
      ]
    }
  ]
};
