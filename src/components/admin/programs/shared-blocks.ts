// Shared blocks for Equip Programs to ensure consistency and cross-reuse

export const sharedImages = {
  mindfulness: "https://images.unsplash.com/photo-1758274526500-ed29a45b6b79?w=800",
  journal: "https://images.unsplash.com/photo-1571916234808-adf437ac1644?w=800",
  positive: "https://images.unsplash.com/photo-1702059077194-9bd038a02bbe?w=800",
  thoughts: "https://images.unsplash.com/photo-1706206448433-f3562a40e035?w=800",
  anatomy: "https://images.unsplash.com/photo-1670270103229-9a999f368bba?w=800",
};

// 1. Mindfulness / 5 Senses
export const mindfulnessBlock = {
  block_type: "lesson",
  title: "Mindfulness: 5 Senses",
  content: "<p>Pause. Take a deep breath. Name 5 colors you see, 4 sounds you hear, 3 smells, 2 sensations, and 1 taste.</p>",
  image_url: sharedImages.mindfulness
};

// 2. Journaling / Brain Dump
export const brainDumpBlock = {
  block_type: "reflection",
  title: "Brain Dump",
  exercise_config: {
    prompt: "Write everything on your mind. No filters. Just get it out.",
    key: "brain_dump"
  }
};

// 3. Positive Capturing (Gratitude)
export const positiveCapturingBlocks = [
  {
    block_type: "reflection",
    title: "Good Things",
    exercise_config: {
      prompt: "Three good things today",
      subtype: "text_list",
      constraints: { max_items: 3 },
      key: "three_good"
    }
  },
  {
    block_type: "reflection",
    title: "Better Things",
    exercise_config: {
      prompt: "Three things that could have been better",
      subtype: "text_list",
      constraints: { max_items: 3 },
      key: "three_better"
    }
  }
];

// 4. Thoughts vs Feelings
export const thoughtsVsFeelingsLesson = {
  block_type: "lesson",
  title: "Thoughts vs Feelings",
  content: "<p>Thoughts are sentences in your mind (e.g., 'I am failing'). Feelings are emotional states (e.g., 'Sadness'). Distinguishing them is key to emotional regulation.</p>",
  image_url: sharedImages.thoughts
};

// 5. Demands vs Resources Matrix
export const demandsVsResourcesBlock = {
  block_type: "reflection",
  title: "Demands vs Resources",
  exercise_config: {
    prompt: "List your current demands and resources.",
    subtype: "matrix",
    columns: ["Demands (Drains)", "Resources (Energy)"],
    key: "demands_resources"
  }
};

// 6. Box Breathing
export const boxBreathingBlock = {
  block_type: "lesson",
  title: "Box Breathing",
  content: "<p>Breathe in for 4 counts. Hold for 4. Exhale for 4. Hold for 4. Repeat.</p>",
  image_url: "https://images.unsplash.com/photo-1655970580622-4a547789c850?w=800"
};

// 7. Onboarding Questions
export const onboardingBlocks = [
  {
    block_type: "quiz",
    title: "Occupation",
    exercise_config: {
      subtype: "single-select",
      prompt: "What do you do for a living?",
      options: ["Employed", "Self-employed", "Student", "Homemaker", "Between jobs", "Retired"],
      uiHints: ["cards"],
      key: "occupation"
    },
    auto_advance: true
  },
  {
    block_type: "quiz",
    title: "Therapy History",
    exercise_config: {
      subtype: "single-select",
      prompt: "Have you ever taken therapy before?",
      options: ["Yes", "No", "I'd prefer not to answer"],
      key: "therapy_history"
    },
    auto_advance: true
  }
];
