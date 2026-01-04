// Helper for images to keep code clean
import { 
  onboardingBlocks, 
  mindfulnessBlock, 
  thoughtsVsFeelingsLesson, 
  brainDumpBlock, 
  positiveCapturingBlocks,
  demandsVsResourcesBlock,
  sharedImages 
} from "./shared-blocks";

const images = {
  intro: "https://images.unsplash.com/photo-1461532257246-777de18cd58b?w=800",
  snapshot: "https://images.unsplash.com/photo-1758876022104-368b0f3fb6c9?w=800",
  tracking: "https://images.unsplash.com/photo-1622993361017-180360aea82c?w=800",
  observation: "https://images.unsplash.com/photo-1522724942718-71a5cd63ce22?w=800",
  reward: "https://images.unsplash.com/photo-1762345127396-ac4a970436c3?w=800",
  map: "https://images.unsplash.com/photo-1613238906889-26b3eb9cf9a7?w=800",
  goals: "https://images.unsplash.com/photo-1610540604745-3e96fba9ccef?w=800",
  control: "https://images.unsplash.com/photo-1611955373379-cc0555aa37cd?w=800",
  thinking: "https://images.unsplash.com/photo-1761158495821-b1fc8433672b?w=800",
  alignment: "https://images.unsplash.com/photo-1732117112755-abec73a90ddb?w=800",
  relaxing: "https://images.unsplash.com/photo-1646692446460-29862524b623?w=800",
  lettingGo: "https://images.unsplash.com/photo-1623707431024-32c77c6e6f6c?w=800",
  perfectionism: "https://images.unsplash.com/photo-1598714479411-a11ad65f7b2d?w=800",
  // Reused from shared
  mindfulness: sharedImages.mindfulness,
  journal: sharedImages.journal,
  positive: sharedImages.positive,
  thoughts: sharedImages.thoughts,
  anatomy: sharedImages.anatomy
};

// Reusable block definitions specific to Burnout (not shared widely enough to move to shared-blocks yet)
const day16Blocks = [
  {
    block_type: "reflection",
    title: "Shedding Dead Weight",
    exercise_config: {
      prompt: "Identify tasks to remove",
      subtype: "matrix",
      columns: ["Task", "Why it’s unnecessary", "How I will remove it"],
      key: "dead_weight_tasks"
    }
  }
];

const day17Blocks = [
  {
    block_type: "lesson",
    title: "Journaling",
    content: "<p>Write freely for 5 minutes. No structure. No judgment.</p>",
    image_url: images.journal
  },
  brainDumpBlock
];

const day18Blocks = positiveCapturingBlocks;

const day24Blocks = [
  {
    block_type: "reflection",
    title: "Just Do It",
    exercise_config: {
      prompt: "One task I will complete today",
      key: "focus_task"
    }
  }
];

const toolkitBlocks = [...day16Blocks, ...day18Blocks, ...day17Blocks];

export const burnoutProgramData = {
  title: "Burnout Reset",
  slug: "burnout-reset",
  description: "A comprehensive 30-day program to understand, manage, and recover from burnout.",
  category: "Burnout",
  image_url: images.snapshot,
  difficulty: "intermediate",
  duration_weeks: 4,
  tags: ["burnout", "stress", "work", "resilience"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Onboarding",
      description: "Setup Phase.",
      image_url: images.intro,
      blocks: [
        {
          block_type: "lesson",
          title: "Welcome",
          content: "<p>Before we begin, we’d like to know a little about you. This helps us tailor the program better.</p>",
          image_url: images.intro
        },
        ...onboardingBlocks,
        {
          block_type: "quiz",
          title: "Conditions",
          exercise_config: {
            subtype: "single-select",
            prompt: "Do you have any pre-existing conditions?",
            options: ["Yes", "No", "I'd prefer not to answer"],
            key: "pre_existing_conditions"
          },
          auto_advance: true,
          step_group_id: "onboarding_conditions"
        },
        {
          block_type: "reflection",
          title: "Conditions Detail",
          exercise_config: {
            prompt: "If yes, what?",
            key: "conditions_detail",
            rules: { dependsOn: "pre_existing_conditions == Yes" }
          },
          step_group_id: "onboarding_conditions"
        }
      ]
    },
    {
      day_number: 1,
      title: "Burnout Snapshot",
      description: "Understanding My Workplace.",
      image_url: images.snapshot,
      blocks: [
        {
          block_type: "lesson",
          title: "Understanding",
          content: "<p>Select the statements that best describe your current experience at work.</p>",
          image_url: images.snapshot
        },
        {
          block_type: "quiz",
          title: "Indicators",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which of these feel true for you?",
            options: [
              "It is stressful",
              "It is hectic",
              "I don't enjoy it as much as before",
              "I am exhausted all the time",
              "My work feels overwhelming",
              "I desperately need a vacation",
              "I feel energized every morning",
              "I want to continue in my current position"
            ],
            uiHints: ["cards"],
            key: "burnout_indicators"
          }
        }
      ]
    },
    {
      day_number: 2,
      title: "Thoughts vs Feelings",
      description: "Identification.",
      image_url: images.thoughts,
      blocks: [
        thoughtsVsFeelingsLesson,
        {
          block_type: "quiz",
          title: "Scenario 1",
          exercise_config: {
            subtype: "single-select",
            prompt: "“It makes me furious!”",
            options: ["Thought", "Feeling"],
            key: "tf_q1"
          },
          auto_advance: true,
          step_group_id: "tf_identification"
        },
        {
          block_type: "quiz",
          title: "Scenario 2",
          exercise_config: {
            subtype: "single-select",
            prompt: "“This is inconvenient and difficult.”",
            options: ["Thought", "Feeling"],
            key: "tf_q2"
          },
          auto_advance: true,
          step_group_id: "tf_identification"
        }
      ]
    },
    {
      day_number: 3,
      title: "Tracking",
      description: "Tracking Thoughts & Feelings.",
      image_url: images.tracking,
      blocks: [
        {
          block_type: "reflection",
          title: "Log",
          exercise_config: {
            prompt: "Track thoughts and feelings today",
            subtype: "matrix",
            columns: ["Date & Time", "Event", "Thoughts", "Feelings"],
            key: "tf_log"
          }
        }
      ]
    },
    {
      day_number: 4,
      title: "Deep Observation",
      description: "Observing Patterns.",
      image_url: images.observation,
      blocks: [
        {
          block_type: "lesson",
          title: "Observe",
          content: "<p>Record thoughts, feelings, triggers, and your response before, during, and after work.</p>",
          image_url: images.observation
        },
        {
          block_type: "reflection",
          title: "Behavior Log",
          exercise_config: {
            subtype: "matrix",
            columns: ["Date & Time", "Event", "Thoughts", "Feelings", "Response"],
            key: "tf_behavior_log"
          }
        }
      ]
    },
    {
      day_number: 5,
      title: "Observation – Day 2",
      description: "Repeat Observation.",
      image_url: images.observation,
      blocks: [
        {
          block_type: "reflection",
          title: "Behavior Log (Day 2)",
          exercise_config: {
            subtype: "matrix",
            columns: ["Date & Time", "Event", "Thoughts", "Feelings", "Response"],
            key: "tf_behavior_log_d5"
          }
        }
      ]
    },
    {
      day_number: 6,
      title: "Mindfulness",
      description: "Pause and Breathe.",
      image_url: images.mindfulness,
      blocks: [
        mindfulnessBlock
      ]
    },
    {
      day_number: 7,
      title: "Anatomy of Burnout",
      description: "Demands vs Resources.",
      image_url: images.anatomy,
      blocks: [
        {
          block_type: "lesson",
          title: "Anatomy",
          content: "<p>Burnout often happens when demands outweigh resources.</p>",
          image_url: images.anatomy
        },
        demandsVsResourcesBlock
      ]
    },
    {
      day_number: 8,
      title: "Effort vs Reward",
      description: "Balance Check.",
      image_url: images.reward,
      blocks: [
        {
          block_type: "quiz",
          title: "Balance",
          exercise_config: {
            subtype: "single-select",
            prompt: "Are your efforts and rewards in balance?",
            options: ["Yes", "No"],
            key: "er_balance"
          },
          auto_advance: true,
          step_group_id: "effort_reward_reflection"
        },
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "Why do you feel this way?",
            key: "er_reflection"
          },
          step_group_id: "effort_reward_reflection"
        }
      ]
    },
    {
      day_number: 9,
      title: "Mapping Efforts",
      description: "Structured Table.",
      image_url: images.map,
      blocks: [
        {
          block_type: "reflection",
          title: "Effort Map",
          exercise_config: {
            subtype: "matrix",
            columns: ["Effort", "Expected Reward", "Outcome", "Why I Do This"],
            key: "effort_map"
          }
        }
      ]
    },
    {
      day_number: 10,
      title: "Ideal vs Realistic",
      description: "Outcome Check.",
      image_url: images.goals,
      blocks: [
        {
          block_type: "lesson",
          title: "Expectations",
          content: "<p>Burnout increases when expectations are unrealistic.</p>",
          image_url: images.goals
        },
        {
          block_type: "reflection",
          title: "Outcomes",
          exercise_config: {
            subtype: "matrix",
            columns: ["Goal", "Ideal Outcome", "Realistic Outcome"],
            key: "ideal_realistic"
          }
        }
      ]
    },
    {
      day_number: 11,
      title: "Control Lens",
      description: "Effort & Reward.",
      image_url: images.control,
      blocks: [
        {
          block_type: "lesson",
          title: "Control",
          content: "<p>Some aspects of work are within your control. Others are not. Identifying this difference reduces burnout.</p>",
          image_url: images.control
        },
        {
          block_type: "reflection",
          title: "Control Matrix",
          exercise_config: {
            subtype: "matrix",
            columns: ["Effort", "In My Control (Yes / No)", "Why"],
            key: "er_control"
          }
        }
      ]
    },
    {
      day_number: 12,
      title: "Absolute Priorities",
      description: "Necessities.",
      image_url: images.tracking,
      blocks: [
        {
          block_type: "lesson",
          title: "Priorities",
          content: "<p>Burnout often disconnects us from our core priorities and values.</p>",
          image_url: images.tracking
        },
        {
          block_type: "reflection",
          title: "List",
          exercise_config: {
            prompt: "My absolute necessities and goals",
            subtype: "text_list",
            constraints: { max_items: 6 },
            key: "absolute_priorities"
          }
        }
      ]
    },
    {
      day_number: 13,
      title: "Thinking Day",
      description: "Light Day.",
      image_url: images.thinking,
      blocks: [
        {
          block_type: "lesson",
          title: "Reflect",
          content: "<p>Take today to reflect. Revisit your priorities and notice what truly matters.</p>",
          image_url: images.thinking
        }
      ]
    },
    {
      day_number: 14,
      title: "Alignment Check",
      description: "Goal Alignment.",
      image_url: images.alignment,
      blocks: [
        {
          block_type: "reflection",
          title: "Check",
          exercise_config: {
            subtype: "matrix",
            columns: ["Task / Effort", "Aligns with my goals (Yes / No)"],
            key: "alignment_check"
          }
        }
      ]
    },
    {
      day_number: 15,
      title: "Reducing Workload",
      description: "Doing what matters.",
      image_url: images.relaxing,
      blocks: [
        {
          block_type: "lesson",
          title: "Reduce",
          content: "<p>Reducing workload doesn’t mean doing less — it means doing what matters.</p>",
          image_url: images.relaxing
        },
        {
          block_type: "quiz",
          title: "Strategies",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Select strategies to use",
            options: [
              "Delegate tasks",
              "Reprioritize deadlines",
              "Drop non-essential work",
              "Ask for support",
              "Say no where needed"
            ],
            uiHints: ["cards"],
            key: "reduce_workload"
          }
        }
      ]
    },
    {
      day_number: 16,
      title: "Shedding Dead Weight",
      description: "Removing tasks.",
      image_url: images.lettingGo,
      blocks: day16Blocks
    },
    {
      day_number: 17,
      title: "Journaling",
      description: "Thought Dump.",
      image_url: images.journal,
      blocks: day17Blocks
    },
    {
      day_number: 18,
      title: "Positive Capturing",
      description: "Three good things.",
      image_url: images.positive,
      blocks: day18Blocks
    },
    {
      day_number: 19,
      title: "Practice",
      description: "Reinforcement.",
      image_url: images.journal,
      blocks: [...day17Blocks, ...day18Blocks]
    },
    {
      day_number: 20,
      title: "Perfectionism",
      description: "Intro.",
      image_url: images.perfectionism,
      blocks: [
        {
          block_type: "lesson",
          title: "Perfectionism",
          content: "<p>Perfectionism can drive excellence — or burnout.</p>",
          image_url: images.perfectionism
        },
        {
          block_type: "quiz",
          title: "Beliefs",
          exercise_config: {
            subtype: "multi-select",
            prompt: "What do you believe?",
            options: [
              "Sometimes perfectionism helps",
              "Starting imperfectly is okay",
              "Perfectionism causes procrastination",
              "Being self-critical is necessary"
            ],
            key: "perfectionism_beliefs"
          }
        }
      ]
    },
    {
      day_number: 21,
      title: "Perfect Outcomes",
      description: "Defining Perfect.",
      image_url: images.goals,
      blocks: [
        {
          block_type: "reflection",
          title: "Table",
          exercise_config: {
            subtype: "matrix",
            columns: ["Situation", "Perfect Outcome"],
            key: "perfect_outcomes"
          }
        }
      ]
    },
    {
      day_number: 22,
      title: "Realistic Outcomes",
      description: "Reality Check.",
      image_url: images.goals,
      blocks: [
        {
          block_type: "reflection",
          title: "Table",
          exercise_config: {
            subtype: "matrix",
            columns: ["Situation", "Perfect Outcome", "Realistic Outcome"],
            key: "realistic_outcomes"
          }
        }
      ]
    },
    {
      day_number: 23,
      title: "Challenging Perfectionism",
      description: "First Imperfect Step.",
      image_url: images.perfectionism,
      blocks: [
        {
          block_type: "reflection",
          title: "Challenge",
          exercise_config: {
            subtype: "matrix",
            columns: ["Situation", "Realistic Goal", "First Imperfect Step"],
            key: "perfectionism_challenge"
          }
        }
      ]
    },
    {
      day_number: 24,
      title: "Just Do It",
      description: "Focus Task.",
      image_url: images.tracking,
      blocks: day24Blocks
    },
    {
      day_number: 25,
      title: "Just Do It (Repeat)",
      description: "Focus Task.",
      image_url: images.tracking,
      blocks: day24Blocks
    },
    {
      day_number: 26,
      title: "Just Do It (Repeat)",
      description: "Focus Task.",
      image_url: images.tracking,
      blocks: day24Blocks
    },
    {
      day_number: 27,
      title: "Burnout Toolkit",
      description: "Practice Set.",
      image_url: images.lettingGo,
      blocks: toolkitBlocks
    },
    {
      day_number: 28,
      title: "Burnout Toolkit",
      description: "Practice Set.",
      image_url: images.lettingGo,
      blocks: toolkitBlocks
    },
    {
      day_number: 29,
      title: "Burnout Toolkit",
      description: "Practice Set.",
      image_url: images.lettingGo,
      blocks: toolkitBlocks
    },
    {
      day_number: 30,
      title: "Burnout Toolkit",
      description: "Practice Set.",
      image_url: images.lettingGo,
      blocks: toolkitBlocks
    },
    {
      day_number: 31,
      title: "Burnout Toolkit",
      description: "Practice Set.",
      image_url: images.lettingGo,
      blocks: toolkitBlocks
    },
    {
      day_number: 32,
      title: "Recalibration",
      description: "Closure.",
      image_url: images.positive,
      blocks: [
        {
          block_type: "lesson",
          title: "Closure",
          content: "<p>You now have tools to recognize and respond to burnout.</p>",
          image_url: images.positive
        },
        {
          block_type: "reflection",
          title: "Next Steps",
          exercise_config: {
            prompt: "What will you do differently next time?",
            key: "burnout_recalibration"
          }
        }
      ]
    }
  ]
};
