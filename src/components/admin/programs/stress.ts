import { 
  onboardingBlocks, 
  mindfulnessBlock, 
  demandsVsResourcesBlock, 
  thoughtsVsFeelingsLesson, 
  brainDumpBlock, 
  positiveCapturingBlocks,
  sharedImages
} from "./shared-blocks";

export const stressProgramData = {
  title: "Stress Buster",
  slug: "stress-buster",
  description: "A 30-day guided program to understand, manage, and reduce everyday stress.",
  category: "Stress",
  image_url: "https://images.unsplash.com/photo-1758876201548-ade1eff8b169?w=800",
  difficulty: "beginner",
  duration_weeks: 4,
  tags: ["stress", "resilience", "mindfulness", "cbt"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Onboarding",
      description: "Getting to know you.",
      image_url: "https://images.unsplash.com/photo-1639081650181-1da0c5ed850e?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Welcome",
          content: "<p>Before we begin, we’d like to know a little about you. Your responses help personalize your experience.</p>",
          image_url: "https://images.unsplash.com/photo-1639081650181-1da0c5ed850e?w=800"
        },
        ...onboardingBlocks,
        {
          block_type: "quiz",
          title: "Pre-existing Conditions",
          exercise_config: {
            subtype: "mcq",
            prompt: "Do you have any pre-existing conditions?",
            options: ["Yes", "No", "I'd prefer not to answer"],
            key: "pre_existing_conditions"
          },
          auto_advance: true
        },
        {
          block_type: "reflection",
          title: "Condition Details",
          exercise_config: {
            prompt: "If yes, please specify",
            key: "condition_details",
            rules: { dependsOn: "pre_existing_conditions == Yes" }
          }
        }
      ]
    },
    {
      day_number: 1,
      title: "Taking Stock",
      description: "How have you been?",
      image_url: "https://images.unsplash.com/photo-1765182105125-7d47b5872b27?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Taking Stock",
          content: "<p>Stress is a part of life, but unmanaged stress can affect us deeply. Let’s begin by taking stock.</p>",
          image_url: "https://images.unsplash.com/photo-1765182105125-7d47b5872b27?w=800"
        },
        {
          block_type: "reflection",
          title: "Recent Stressors",
          exercise_config: {
            prompt: "What has been stressing you recently?",
            key: "recent_stressors"
          }
        }
      ]
    },
    {
      day_number: 2,
      title: "Stress Manifestations",
      description: "How does it show up?",
      image_url: "https://images.unsplash.com/photo-1737093889885-8e827af13eb6?w=800",
      blocks: [
        {
          block_type: "quiz",
          title: "Manifestations",
          exercise_config: {
            subtype: "multi-select",
            prompt: "How does stress show up for you?",
            options: [
              "I am more irritable",
              "I clench my jaw",
              "I have trouble sleeping",
              "I procrastinate",
              "I forget things",
              "I feel restless"
            ],
            uiHints: ["cards"],
            key: "stress_manifestations"
          }
        }
      ]
    },
    {
      day_number: 3,
      title: "Before Stress",
      description: "Remembering your relaxed self.",
      image_url: "https://images.unsplash.com/photo-1518574095400-c75c9b094daa?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Relaxed Self",
          exercise_config: {
            prompt: "How are you when you’re relaxed?",
            key: "pre_stress_self"
          }
        },
        {
          block_type: "reflection",
          title: "Relaxation Methods",
          exercise_config: {
            prompt: "What helps you relax?",
            key: "relax_methods"
          }
        }
      ]
    },
    {
      day_number: 4,
      title: "Stress Patterns",
      description: "Recurring themes.",
      image_url: "https://images.unsplash.com/photo-1754405300203-db7d9532cf6c?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Patterns",
          exercise_config: {
            prompt: "Do you notice any recurring stress patterns?",
            key: "stress_patterns"
          }
        }
      ]
    },
    {
      day_number: 5,
      title: "Stress Patterns",
      description: "Continuing observations.",
      image_url: "https://images.unsplash.com/photo-1754405300203-db7d9532cf6c?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Patterns",
          exercise_config: {
            prompt: "Do you notice any recurring stress patterns?",
            key: "stress_patterns"
          }
        }
      ]
    },
    {
      day_number: 6,
      title: "Mindfulness",
      description: "Grounding yourself.",
      image_url: sharedImages.mindfulness,
      blocks: [
        mindfulnessBlock
      ]
    },
    {
      day_number: 7,
      title: "Demands & Resources",
      description: "Anatomy of stress.",
      image_url: sharedImages.anatomy,
      blocks: [
        demandsVsResourcesBlock
      ]
    },
    {
      day_number: 8,
      title: "Demands & Resources",
      description: "Continuing the list.",
      image_url: sharedImages.anatomy,
      blocks: [
        demandsVsResourcesBlock
      ]
    },
    {
      day_number: 9,
      title: "Balance Check",
      description: "Weighing it up.",
      image_url: "https://images.unsplash.com/photo-1670270103229-9a999f368bba?w=800",
      blocks: [
        {
          block_type: "quiz",
          title: "Balance",
          exercise_config: {
            subtype: "mcq",
            prompt: "Do your demands outweigh your resources?",
            options: ["Yes", "No", "Not sure"],
            key: "er_balance"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 10,
      title: "Recalibration",
      description: "Adjusting the scales.",
      image_url: "https://images.unsplash.com/photo-1518574095400-c75c9b094daa?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Reduce Demands",
          exercise_config: {
            prompt: "One way I can reduce my demands",
            key: "reduce_demands"
          }
        },
        {
          block_type: "reflection",
          title: "Increase Resources",
          exercise_config: {
            prompt: "One way I can increase my resources",
            key: "increase_resources"
          }
        }
      ]
    },
    {
      day_number: 11,
      title: "Reflection",
      description: "What stood out?",
      image_url: "https://images.unsplash.com/photo-1758876201548-ade1eff8b169?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Reflection",
          exercise_config: {
            prompt: "After listing your demands and resources, what stood out to you?",
            key: "dr_reflection"
          }
        }
      ]
    },
    {
      day_number: 12,
      title: "Thoughts & Feelings",
      description: "Introduction.",
      image_url: sharedImages.thoughts,
      blocks: [
        thoughtsVsFeelingsLesson
      ]
    },
    {
      day_number: 13,
      title: "Identify",
      description: "Practice identification.",
      image_url: "https://images.unsplash.com/photo-1560362776-8f5bb438b7e1?w=800",
      blocks: [
        {
          block_type: "quiz",
          title: "Identify",
          exercise_config: {
            subtype: "mcq",
            prompt: "Identify what each statement is (Practice)",
            options: ["Thought", "Feeling"],
            key: "tf_identification"
          },
          auto_advance: true
        }
      ]
    },
    {
      day_number: 14,
      title: "Track Thoughts",
      description: "Journaling thoughts.",
      image_url: "https://images.unsplash.com/photo-1560362776-8f5bb438b7e1?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Event",
          exercise_config: { prompt: "What happened?", key: "tf_event" }
        },
        {
          block_type: "reflection",
          title: "Thoughts",
          exercise_config: { prompt: "Thoughts that came to your mind", key: "tf_thoughts" }
        },
        {
          block_type: "reflection",
          title: "Feelings",
          exercise_config: { prompt: "How it made you feel", key: "tf_feelings" }
        }
      ]
    },
    {
      day_number: 15,
      title: "Track Thoughts",
      description: "Continuing practice.",
      image_url: "https://images.unsplash.com/photo-1560362776-8f5bb438b7e1?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Event",
          exercise_config: { prompt: "What happened?", key: "tf_event" }
        },
        {
          block_type: "reflection",
          title: "Thoughts",
          exercise_config: { prompt: "Thoughts that came to your mind", key: "tf_thoughts" }
        },
        {
          block_type: "reflection",
          title: "Feelings",
          exercise_config: { prompt: "How it made you feel", key: "tf_feelings" }
        }
      ]
    },
    {
      day_number: 16,
      title: "Reasoning With Thoughts",
      description: "Cognitive distortions.",
      image_url: "https://images.unsplash.com/photo-1568495341369-1066472c7a27?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Challenge Them",
          content: "<p>Sometimes stress comes from exaggerated or inaccurate thoughts. Today, we learn to challenge them.</p>",
          image_url: "https://images.unsplash.com/photo-1568495341369-1066472c7a27?w=800"
        }
      ]
    },
    {
      day_number: 17,
      title: "Challenge Checklist",
      description: "Tools to challenge.",
      image_url: "https://images.unsplash.com/photo-1568495341369-1066472c7a27?w=800",
      blocks: [
        {
          block_type: "quiz",
          title: "Checklist",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which of these questions help challenge a stressful thought?",
            options: [
              "Am I overreacting?",
              "Am I assuming the worst?",
              "Is this thought fact or opinion?",
              "Would I say this to a friend?"
            ],
            key: "thought_challenge"
          }
        }
      ]
    },
    {
      day_number: 18,
      title: "Reframing",
      description: "New perspective.",
      image_url: "https://images.unsplash.com/photo-1568495341369-1066472c7a27?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Original",
          exercise_config: { prompt: "Stressful thought", key: "original_thought" }
        },
        {
          block_type: "reflection",
          title: "Reframed",
          exercise_config: { prompt: "A more realistic thought", key: "alternate_thought" }
        }
      ]
    },
    {
      day_number: 19,
      title: "Reframing",
      description: "Practice.",
      image_url: "https://images.unsplash.com/photo-1568495341369-1066472c7a27?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Original",
          exercise_config: { prompt: "Stressful thought", key: "original_thought" }
        },
        {
          block_type: "reflection",
          title: "Reframed",
          exercise_config: { prompt: "A more realistic thought", key: "alternate_thought" }
        }
      ]
    },
    {
      day_number: 20,
      title: "Journaling Intro",
      description: "Why journal?",
      image_url: sharedImages.journal,
      blocks: [
        {
          block_type: "lesson",
          title: "Empty the Mind",
          content: "<p>Journaling helps empty your mind and reduce stress overload.</p>",
          image_url: sharedImages.journal
        }
      ]
    },
    {
      day_number: 21,
      title: "Empty the Mind",
      description: "Free writing.",
      image_url: sharedImages.journal,
      blocks: [
        brainDumpBlock
      ]
    },
    {
      day_number: 22,
      title: "Empty the Mind",
      description: "Repeat practice.",
      image_url: sharedImages.journal,
      blocks: [
        brainDumpBlock
      ]
    },
    {
      day_number: 23,
      title: "Positive Capturing",
      description: "Gratitude.",
      image_url: sharedImages.positive,
      blocks: [
        {
          block_type: "lesson",
          title: "Perspective",
          content: "<p>Stress narrows focus. Positive capturing helps widen perspective.</p>",
          image_url: sharedImages.positive
        }
      ]
    },
    {
      day_number: 24,
      title: "Positive Capturing",
      description: "Good things.",
      image_url: sharedImages.positive,
      blocks: positiveCapturingBlocks
    },
    {
      day_number: 25,
      title: "Positive Capturing",
      description: "Repeat practice.",
      image_url: sharedImages.positive,
      blocks: positiveCapturingBlocks
    },
    {
      day_number: 26,
      title: "Breathing",
      description: "Pause and breath.",
      image_url: "https://images.unsplash.com/photo-1713428856080-43fc975d2496?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Breathe",
          content: "<p>Pause. Breathe slowly. Inhale for 4, exhale for 6. Repeat for 5 minutes.</p>",
          image_url: "https://images.unsplash.com/photo-1713428856080-43fc975d2496?w=800"
        }
      ]
    },
    {
      day_number: 27,
      title: "Toolkit",
      description: "Review what helps.",
      image_url: "https://images.unsplash.com/photo-1588515603068-adb330f26e92?w=800",
      blocks: [
        {
          block_type: "quiz",
          title: "Toolkit",
          exercise_config: {
            subtype: "multi-select",
            prompt: "Which techniques helped you most?",
            options: [
              "Thought tracking",
              "Reframing",
              "Journaling",
              "Mindfulness",
              "Positive capturing"
            ],
            key: "stress_toolkit"
          }
        }
      ]
    },
    {
      day_number: 28,
      title: "Reflection",
      description: "Program review.",
      image_url: "https://images.unsplash.com/photo-1758876201548-ade1eff8b169?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Learnings",
          exercise_config: {
            prompt: "What have you learned about your stress?",
            key: "program_reflection"
          }
        }
      ]
    },
    {
      day_number: 29,
      title: "Future Plan",
      description: "Moving forward.",
      image_url: "https://images.unsplash.com/photo-1758680177368-494e280c104f?w=800",
      blocks: [
        {
          block_type: "reflection",
          title: "Plan",
          exercise_config: {
            prompt: "How will you manage stress going forward?",
            key: "future_plan"
          }
        }
      ]
    },
    {
      day_number: 30,
      title: "Completion",
      description: "Well done.",
      image_url: "https://images.unsplash.com/photo-1665951244655-4f2c640a7413?w=800",
      blocks: [
        {
          block_type: "lesson",
          title: "Complete",
          content: "<p>You’ve completed the Stress Buster program. You can revisit these tools anytime.</p>",
          image_url: "https://images.unsplash.com/photo-1665951244655-4f2c640a7413?w=800"
        }
      ]
    }
  ]
};
