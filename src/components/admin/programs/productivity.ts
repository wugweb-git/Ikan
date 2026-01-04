export const productivityProgramData = {
  title: "Productivity Reset",
  slug: "productivity-reset",
  description: "This 7-day challenge helps you reset focus, reduce procrastination, and rebuild productive momentum — without burnout.",
  category: "Productivity",
  image_url: "https://images.unsplash.com/photo-1705417272217-490f4511abeb?w=800",
  difficulty: "beginner",
  duration_weeks: 1,
  tags: ["productivity", "focus", "dopamine", "planning"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Onboarding",
      description: "Expectation Setting.",
      image_url: "https://images.unsplash.com/photo-1705417272217-490f4511abeb?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Welcome",
          content: "<p>This 7-day challenge helps you reset focus, reduce procrastination, and rebuild productive momentum — without burnout.</p>",
          image_url: "https://images.unsplash.com/photo-1705417272217-490f4511abeb?w=800"
        },
        {
          block_type: "quiz",
          title: "Expectations",
          exercise_config: {
            subtype: "multi-select",
            prompt: "What do you want to achieve by the end of this challenge?",
            options: [
              "Increase productivity",
              "Overcome screen addiction",
              "Develop a schedule",
              "Overcome dopamine addiction",
              "Overcome procrastination"
            ],
            uiHints: ["cards"],
            key: "productivity_goals"
          },
          auto_advance: true
        },
        {
          block_type: "reflection",
          title: "Weekly Intent",
          exercise_config: {
            prompt: "What is ONE focus you want to prioritise this week?",
            key: "weekly_focus"
          }
        }
      ]
    },
    {
      day_number: 1,
      title: "Awareness & Baseline",
      description: "Where Is Your Time Going?",
      image_url: "https://images.unsplash.com/photo-1758874961005-9da9077cd44d?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Awareness",
          content: "<p>Before fixing productivity, we first observe where your attention and energy currently go.</p>",
          image_url: "https://images.unsplash.com/photo-1758874961005-9da9077cd44d?w=800"
        },
        {
          block_type: "reflection",
          title: "Screen Usage Tracker",
          exercise_config: {
            prompt: "Track your usage today",
            subtype: "row_list",
            rows: ["Phone usage", "App usage", "TV / Streaming time"],
            key: "screen_usage_today"
          }
        },
        {
          block_type: "reflection",
          title: "Weekly Activities List",
          exercise_config: {
            prompt: "List activities you want to do this week",
            subtype: "text_list",
            constraints: { max_items: 10 },
            key: "weekly_activities"
          }
        }
      ]
    },
    {
      day_number: 2,
      title: "Planning & Eat the Frog",
      description: "Plan Before You Act.",
      image_url: "https://images.unsplash.com/photo-1665241908863-2ec64d96ead6?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Plan",
          content: "<p>Clarity reduces procrastination. Today you plan, prioritize, and act.</p>",
          image_url: "https://images.unsplash.com/photo-1665241908863-2ec64d96ead6?w=800"
        },
        {
          block_type: "reflection",
          title: "Task Planning Matrix",
          exercise_config: {
            prompt: "Plan today’s tasks",
            subtype: "matrix",
            columns: ["Task", "Difficulty (Easy / Neutral / Hard)", "Priority (⭐–⭐⭐⭐)"],
            key: "daily_tasks"
          }
        },
        {
          block_type: "reflection",
          title: "Eat the Frog",
          exercise_config: {
            prompt: "Which task did you tackle first?",
            key: "frog_task"
          }
        },
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "How did it feel after completing it?",
            key: "frog_reflection"
          }
        }
      ]
    },
    {
      day_number: 3,
      title: "Hermit Hour",
      description: "Focus Time.",
      image_url: "https://images.unsplash.com/photo-1662103629396-a08922b5d6e6?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Hermit Hour",
          content: "<p>Deep focus requires distance from distractions. Today, we practice intentional isolation.</p>",
          image_url: "https://images.unsplash.com/photo-1662103629396-a08922b5d6e6?w=800"
        },
        {
          block_type: "reflection",
          title: "Focus Sessions",
          exercise_config: {
            prompt: "How many 20-minute focus sessions did you complete?",
            subtype: "number",
            constraints: { min: 0, max: 10 },
            key: "focus_sessions"
          }
        },
        {
          block_type: "quiz",
          title: "Distraction Control",
          exercise_config: {
            subtype: "multi-select",
            prompt: "What helped reduce distractions?",
            options: [
              "Phone out of sight",
              "Blocker apps",
              "Silent notifications",
              "Different workspace"
            ],
            key: "distraction_methods"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 4,
      title: "Mindfulness + Movement",
      description: "Reset Your Mind & Body.",
      image_url: "https://images.unsplash.com/photo-1610752133957-92f81f06702d?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Reset",
          content: "<p>Productivity improves when you step away and reset your nervous system.</p>",
          image_url: "https://images.unsplash.com/photo-1610752133957-92f81f06702d?w=800"
        },
        {
          block_type: "quiz",
          title: "Mindfulness Check",
          exercise_config: {
            subtype: "mcq", // using mcq for boolean
            prompt: "Did you take a 30-minute mindful break?",
            options: ["Yes", "No"],
            key: "mindfulness_done"
          },
          auto_advance: true
        },
        {
          block_type: "reflection",
          title: "Movement Log",
          exercise_config: {
            prompt: "What physical activity did you do?",
            key: "movement_activity"
          }
        }
      ]
    },
    {
      day_number: 5,
      title: "Motivation Mapping",
      description: "Understanding Motivation.",
      image_url: "https://images.unsplash.com/photo-1662103629396-a08922b5d6e6?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Motivation",
          content: "<p>Motivation depends on rewards, urgency, and perceived effort.</p>",
          image_url: "https://images.unsplash.com/photo-1662103629396-a08922b5d6e6?w=800"
        },
        {
          block_type: "reflection",
          title: "Motivation Table",
          exercise_config: {
            prompt: "Map your procrastinated tasks",
            subtype: "matrix",
            columns: ["Task", "Roadblock", "Reward", "Urgency", "Time Gap"],
            key: "motivation_map"
          }
        }
      ]
    },
    {
      day_number: 6,
      title: "Perfecting Imperfection",
      description: "Action beats perfection.",
      image_url: "https://images.unsplash.com/photo-1665241908863-2ec64d96ead6?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Imperfection",
          content: "<p>Perfectionism delays progress. Action beats perfection.</p>",
          image_url: "https://images.unsplash.com/photo-1665241908863-2ec64d96ead6?w=800"
        },
        {
          block_type: "quiz",
          title: "Perfectionism Check",
          exercise_config: {
            subtype: "mcq",
            prompt: "Did perfectionism slow you down today?",
            options: ["Yes", "No"],
            key: "perfectionism_today"
          },
          auto_advance: true
        },
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "What did you do anyway, despite it not being perfect?",
            key: "imperfection_reflection"
          }
        }
      ]
    },
    {
      day_number: 7,
      title: "Weekly Planning",
      description: "Designing the Next Week.",
      image_url: "https://images.unsplash.com/photo-1657040298726-7189d3090d5e?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Planning",
          content: "<p>Structure creates freedom. Today, you plan the next week intentionally.</p>",
          image_url: "https://images.unsplash.com/photo-1657040298726-7189d3090d5e?w=800"
        },
        {
          block_type: "reflection",
          title: "Weekly Schedule",
          exercise_config: {
            prompt: "Plan your next week (hour-level if possible)",
            key: "weekly_schedule"
          }
        },
        {
          block_type: "reflection",
          title: "Commitment",
          exercise_config: {
            prompt: "One promise I make to myself next week",
            key: "weekly_commitment"
          }
        }
      ]
    }
  ]
};
