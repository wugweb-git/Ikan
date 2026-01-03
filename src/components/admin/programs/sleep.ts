import { sharedImages } from "./shared-blocks";

const images = {
  moon: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=800",
  cycles: "https://images.unsplash.com/photo-1541781777621-39125221ab97?w=800",
  hygiene: "https://images.unsplash.com/photo-1511295742362-92c96b504802?w=800",
  thoughts: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
  relax: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
  routine: "https://images.unsplash.com/photo-1515890435782-55a580b84929?w=800",
  lettingGo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  clock: "https://images.unsplash.com/photo-1495197359483-d092478c170a?w=800",
  pattern: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
  compassion: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
  progress: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
  journal: sharedImages.journal,
  action: "https://images.unsplash.com/photo-1596524430615-b46476ddff6e?w=800",
  dump: sharedImages.thoughts,
  setback: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800",
  closure: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
  list: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800"
};

// Reusable blocks for Day 11 (Rituals in Action)
const ritualActionBlocks = [
    {
        block_type: "lesson",
        title: "Rituals in Action",
        content: "<p>Now that you’ve designed your bedtime ritual, it’s time to put it into action. Don’t aim for perfection — aim for consistency.</p>",
        image_url: images.action
    },
    {
        block_type: "checklist",
        title: "Checklist",
        exercise_config: {
            subtype: "multi-select",
            prompt: "My bedtime ritual tonight",
            options: [
                "No caffeine 4 hours before sleep",
                "Lights dimmed 30 minutes before bed",
                "No mobile usage before sleep",
                "Journaling",
                "Breathing / relaxation"
            ],
            key: "ritual_checklist"
        }
    }
];

// Reusable blocks for Day 12 (Sleep Reflection)
const sleepReflectionBlocks = [
    {
        block_type: "quiz", 
        title: "Sleep Quality",
        exercise_config: {
            subtype: "scale",
            prompt: "How was your sleep last night?",
            constraints: { min: 1, max: 5 },
            key: "sleep_quality"
        },
        step_group_id: "sleep_reflection"
    },
    {
        block_type: "reflection",
        title: "Notes",
        exercise_config: {
            prompt: "What influenced your sleep?",
            key: "sleep_reflection_notes"
        },
        step_group_id: "sleep_reflection"
    }
];

// Reusable blocks for Day 18 (Sleep Hygiene Check)
const sleepHygieneCheckBlocks = [
    {
        block_type: "checklist",
        title: "Hygiene Check",
        exercise_config: {
            subtype: "multi-select",
            prompt: "Which sleep hygiene practices did you follow?",
            options: [
                "Consistent bedtime",
                "Limited screen exposure",
                "Comfortable sleep environment",
                "No late meals",
                "Relaxation before bed"
            ],
            key: "sleep_hygiene"
        }
    }
];

// Reusable blocks for Day 19 (Mood & Sleep Link)
const moodSleepBlocks = [
    {
        block_type: "quiz",
        title: "Mood Rating",
        exercise_config: {
            subtype: "scale",
            prompt: "How was your mood today?",
            constraints: { min: 1, max: 5 },
            key: "mood_rating"
        },
        step_group_id: "mood_sleep"
    },
    {
        block_type: "reflection",
        title: "Reflection",
        exercise_config: {
            prompt: "Did your sleep affect your mood?",
            key: "mood_sleep_link"
        },
        step_group_id: "mood_sleep"
    }
];

// Maintenance Phase reusable day (Days 25-30)
const maintenanceDayBlocks = [...ritualActionBlocks, ...sleepReflectionBlocks];

export const sleepProgramData = {
  title: "Sleep Tight",
  description: "A gentle, guided program to help you understand and improve your sleep. There’s nothing to “fix” immediately — we’ll start by noticing patterns and building consistency.",
  category: "Sleep",
  image_url: images.moon,
  difficulty: "beginner",
  duration_weeks: 5,
  tags: ["sleep", "cbt-i", "insomnia", "rest"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Onboarding",
      description: "Welcome to Sleep Tight.",
      image_url: images.moon,
      blocks: [
        {
          block_type: "lesson",
          title: "Welcome to Sleep Tight",
          content: "<p>Sleep impacts mood, focus, immunity, and emotional resilience. Over the next days, we’ll gently rebuild your relationship with sleep.</p>",
          image_url: images.moon
        },
        {
          block_type: "quiz",
          title: "Primary Sleep Concern",
          exercise_config: {
            subtype: "single-select",
            prompt: "What troubles your sleep the most right now?",
            options: [
              "Difficulty falling asleep",
              "Waking up during the night",
              "Waking too early",
              "Poor sleep quality",
              "Irregular sleep schedule"
            ],
            uiHints: ["cards"],
            key: "sleep_primary_issue"
          },
          auto_advance: true,
          step_group_id: "onboarding_core"
        },
        {
          block_type: "quiz",
          title: "Sleep Duration",
          exercise_config: {
            subtype: "scale",
            prompt: "On average, how many hours do you sleep?",
            constraints: { min: 3, max: 9 },
            key: "avg_sleep_hours"
          },
          step_group_id: "baseline_sleep"
        },
        {
          block_type: "reflection",
          title: "Feeling",
          exercise_config: {
            prompt: "How does this amount of sleep usually feel for you?",
            key: "sleep_feel_note"
          },
          step_group_id: "baseline_sleep"
        },
        {
          block_type: "checklist",
          title: "Commitment",
          exercise_config: {
            subtype: "multi-select", // Checkbox
            prompt: "Commitment",
            options: ["I’m willing to try small sleep changes daily"],
            key: "commitment_ack"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 1,
      title: "Understanding Your Sleep",
      description: "Observing without fixing.",
      image_url: images.cycles,
      blocks: [
        {
          block_type: "lesson",
          title: "Understanding Sleep",
          content: "<p>Sleep isn’t just duration — it’s rhythm, quality, and safety. We begin by observing without fixing.</p>",
          image_url: images.cycles
        },
        {
          block_type: "quiz",
          title: "Sleep Quality",
          exercise_config: {
            subtype: "scale",
            prompt: "How was your sleep last night?",
            constraints: { min: 1, max: 5 },
            key: "sleep_quality_day1"
          },
          step_group_id: "daily_reflection"
        },
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "Anything that stood out?",
            key: "sleep_note_day1"
          },
          step_group_id: "daily_reflection"
        }
      ]
    },
    {
      day_number: 2,
      title: "Sleep Hygiene Basics",
      description: "Small habits.",
      image_url: images.hygiene,
      blocks: [
        {
          block_type: "lesson",
          title: "Sleep Hygiene",
          content: "<p>Small habits before bed can strongly affect how easily you fall asleep.</p>",
          image_url: images.hygiene
        },
        {
          block_type: "checklist",
          title: "Habit Checklist",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which of these did you follow last night?",
            options: [
              "No caffeine after evening",
              "Reduced screen time",
              "Fixed bedtime",
              "Dim lights",
              "Quiet environment"
            ],
            key: "sleep_habits"
          }
        }
      ]
    },
    {
      day_number: 3,
      title: "Thoughts & Sleep",
      description: "Disruptive thoughts.",
      image_url: images.thoughts,
      blocks: [
        {
          block_type: "lesson",
          title: "Thoughts That Disrupt Sleep",
          content: "<p>Sleep struggles are often maintained by anxious or repetitive thoughts.</p>",
          image_url: images.thoughts
        },
        {
          block_type: "reflection",
          title: "Thought Journal",
          exercise_config: {
            prompt: "What thoughts came up when trying to sleep?",
            key: "sleep_thoughts"
          }
        }
      ]
    },
    {
      day_number: 4,
      title: "Body Signals",
      description: "Listening to the body.",
      image_url: images.relax,
      blocks: [
        {
          block_type: "lesson",
          title: "Listening to the Body",
          content: "<p>Your body sends signals before sleep. Learning them reduces resistance.</p>",
          image_url: images.relax
        },
        {
          block_type: "quiz",
          title: "Sensation Check",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which sensations did you notice?",
            options: [
              "Tight shoulders",
              "Restless legs",
              "Heavy eyelids",
              "Calm breathing",
              "Racing heart"
            ],
            key: "pre_sleep_body"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 5,
      title: "Wind-Down Ritual",
      description: "Predictable routines.",
      image_url: images.routine,
      blocks: [
        {
          block_type: "lesson",
          title: "Creating a Wind-Down Ritual",
          content: "<p>A predictable routine tells your brain it’s safe to rest.</p>",
          image_url: images.routine
        },
        {
          block_type: "reflection",
          title: "Ritual Builder",
          exercise_config: {
            prompt: "List 2–3 things you’ll do before bed",
            subtype: "text_list",
            constraints: { max_items: 3 },
            key: "wind_down_ritual"
          }
        }
      ]
    },
    {
      day_number: 6,
      title: "Letting Go of Control",
      description: "Reducing effort.",
      image_url: images.lettingGo,
      blocks: [
        {
          block_type: "lesson",
          title: "Letting Sleep Happen",
          content: "<p>Sleep comes when effort reduces. Trying too hard keeps you awake.</p>",
          image_url: images.lettingGo
        },
        {
          block_type: "quiz",
          title: "Control Belief Check",
          exercise_config: {
            subtype: "single-select",
            prompt: "Which statement feels closer to you?",
            options: [
              "I must force myself to sleep",
              "Sleep happens when I relax"
            ],
            key: "sleep_control_belief"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 7,
      title: "Night Wakings",
      description: "Normalizing wake-ups.",
      image_url: images.clock,
      blocks: [
        {
          block_type: "lesson",
          title: "Handling Night Wakings",
          content: "<p>Waking at night is normal. How we respond matters more.</p>",
          image_url: images.clock
        },
        {
          block_type: "reflection",
          title: "Response Plan",
          exercise_config: {
            prompt: "What will you try if you wake up?",
            key: "night_waking_plan"
          }
        }
      ]
    },
    {
      day_number: 8,
      title: "Tracking Patterns",
      description: "Noticing patterns.",
      image_url: images.pattern,
      blocks: [
        {
          block_type: "lesson",
          title: "Noticing Patterns",
          content: "<p>Patterns matter more than single nights.</p>",
          image_url: images.pattern
        },
        {
          block_type: "reflection",
          title: "Weekly Reflection",
          exercise_config: {
            prompt: "Any patterns you’re noticing?",
            key: "sleep_pattern_reflection"
          }
        }
      ]
    },
    {
      day_number: 9,
      title: "Self-Compassion",
      description: "Be kind to yourself.",
      image_url: images.compassion,
      blocks: [
        {
          block_type: "lesson",
          title: "Being Kind to Yourself",
          content: "<p>Frustration worsens insomnia. Compassion reduces it.</p>",
          image_url: images.compassion
        },
        {
          block_type: "reflection",
          title: "Reframe",
          exercise_config: {
            prompt: "What kinder thought can you try tonight?",
            key: "self_talk_sleep"
          }
        }
      ]
    },
    {
      day_number: 10,
      title: "First Review",
      description: "Review & Reset.",
      image_url: images.progress,
      blocks: [
        {
          block_type: "lesson",
          title: "Review & Reset",
          content: "<p>You’ve already started shifting your sleep relationship.</p>",
          image_url: images.progress
        },
        {
          block_type: "quiz",
          title: "Progress Rating",
          exercise_config: {
            subtype: "scale",
            prompt: "Compared to Day 0, how do you feel now?",
            constraints: { min: 1, max: 5 },
            key: "sleep_progress_rating"
          },
          step_group_id: "review_pair"
        },
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "What helped the most?",
            key: "sleep_progress_note"
          },
          step_group_id: "review_pair"
        }
      ]
    },
    {
      day_number: 11,
      title: "Rituals in Action",
      description: "Applying the ritual.",
      image_url: images.action,
      blocks: ritualActionBlocks
    },
    {
      day_number: 12,
      title: "Sleep Reflection",
      description: "Daily Check-in.",
      image_url: images.moon,
      blocks: sleepReflectionBlocks
    },
    {
      day_number: 13,
      title: "Tracking Patterns",
      description: "Observing.",
      image_url: images.pattern,
      blocks: [
        {
          block_type: "lesson",
          title: "Tracking Patterns",
          content: "<p>Sleep improves when patterns are noticed. Today, simply observe — no fixing.</p>",
          image_url: images.pattern
        },
        {
          block_type: "reflection",
          title: "Journal",
          exercise_config: {
            prompt: "What patterns did you notice?",
            key: "sleep_pattern_observation"
          }
        }
      ]
    },
    {
      day_number: 14,
      title: "Managing Thoughts",
      description: "Night-time thoughts.",
      image_url: images.thoughts,
      blocks: [
        {
          block_type: "quiz",
          title: "Night-time Thoughts",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which thoughts kept you awake?",
            options: [
              "Work-related worries",
              "Personal concerns",
              "Health worries",
              "Future planning",
              "Nothing specific"
            ],
            key: "night_thoughts"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 15,
      title: "Thought Offloading",
      description: "Writing it down.",
      image_url: images.dump,
      blocks: [
        {
          block_type: "lesson",
          title: "Thought Offloading",
          content: "<p>Writing down thoughts before bed reduces mental load.</p>",
          image_url: images.dump
        },
        {
          block_type: "reflection",
          title: "Journal",
          exercise_config: {
            prompt: "Write down thoughts before sleep",
            key: "pre_sleep_dump"
          }
        }
      ]
    },
    {
      day_number: 16,
      title: "Adjusting the Ritual",
      description: "Refining.",
      image_url: images.routine,
      blocks: [
        {
          block_type: "reflection",
          title: "Adjustment",
          exercise_config: {
            prompt: "What will you adjust in your ritual?",
            key: "ritual_adjustment"
          }
        }
      ]
    },
    {
      day_number: 17,
      title: "Practice Day",
      description: "Reinforcement.",
      image_url: images.action,
      blocks: [...ritualActionBlocks, ...sleepReflectionBlocks]
    },
    {
      day_number: 18,
      title: "Sleep Hygiene Check",
      description: "Consistency check.",
      image_url: images.hygiene,
      blocks: sleepHygieneCheckBlocks
    },
    {
      day_number: 19,
      title: "Mood & Sleep Link",
      description: "Connecting the dots.",
      image_url: images.progress,
      blocks: moodSleepBlocks
    },
    {
      day_number: 20,
      title: "Wind-down Techniques",
      description: "What helps?",
      image_url: images.relax,
      blocks: [
        {
          block_type: "quiz",
          title: "Wind-down Methods",
          exercise_config: {
            subtype: "multi-select",
            prompt: "What helped you wind down?",
            options: [
              "Reading",
              "Breathing exercises",
              "Listening to music",
              "Stretching",
              "Meditation"
            ],
            key: "wind_down_methods"
          }
        }
      ]
    },
    {
      day_number: 21,
      title: "Progress Check",
      description: "Tracking progress.",
      image_url: images.progress,
      blocks: [
        {
          block_type: "quiz",
          title: "Progress",
          exercise_config: {
            subtype: "scale",
            prompt: "Compared to Day 1, how is your sleep now?",
            constraints: { min: 1, max: 5 },
            key: "sleep_progress"
          }
        }
      ]
    },
    {
      day_number: 22,
      title: "Handling Setbacks",
      description: "Resilience.",
      image_url: images.setback,
      blocks: [
        {
          block_type: "lesson",
          title: "Handling Setbacks",
          content: "<p>Bad nights happen. What matters is returning to the routine.</p>",
          image_url: images.setback
        },
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "How will you handle setbacks?",
            key: "sleep_setback_reflection"
          }
        }
      ]
    },
    {
      day_number: 23,
      title: "Practice Day",
      description: "Reinforcement.",
      image_url: images.hygiene,
      blocks: [...sleepHygieneCheckBlocks, ...moodSleepBlocks]
    },
    {
      day_number: 24,
      title: "Long-Term Health",
      description: "Looking ahead.",
      image_url: images.list,
      blocks: [
        {
          block_type: "reflection",
          title: "Plan",
          exercise_config: {
            prompt: "One habit I will continue long-term",
            key: "long_term_sleep_plan"
          }
        }
      ]
    },
    // Maintenance Phase (Days 25-30)
    ...Array.from({ length: 6 }).map((_, i) => ({
      day_number: 25 + i,
      title: "Maintenance",
      description: "Building consistency.",
      image_url: images.moon,
      blocks: maintenanceDayBlocks
    })),
    {
      day_number: 31,
      title: "Review & Confidence",
      description: "Reflecting on confidence.",
      image_url: images.progress,
      blocks: [
        {
          block_type: "reflection",
          title: "Confidence",
          exercise_config: {
            prompt: "How confident do you feel about your sleep now?",
            key: "sleep_confidence"
          }
        }
      ]
    },
    {
      day_number: 32,
      title: "Closure & Next Steps",
      description: "Program complete.",
      image_url: images.closure,
      blocks: [
        {
          block_type: "lesson",
          title: "Closure",
          content: "<p>You’ve built tools you can return to whenever sleep feels difficult.</p>",
          image_url: images.closure
        },
        {
          block_type: "reflection",
          title: "Commitment",
          exercise_config: {
            prompt: "One commitment I make to my sleep",
            key: "sleep_commitment"
          }
        }
      ]
    }
  ]
};
