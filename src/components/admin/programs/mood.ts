export const moodProgramData = {
  title: "Mood Booster",
  description: "Reclaim your energy and motivation through Behavioral Activation.",
  category: "Depression",
  image_url: "https://images.unsplash.com/photo-1720292770182-5fd47810f32c?w=800", // Sunrise mountains
  difficulty: "intermediate",
  duration_weeks: 1,
  tags: ["mood", "depression", "activation"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "What is Behavioral Activation?",
      description: "Understanding the link between doing and feeling.",
      image_url: "https://images.unsplash.com/photo-1720292770182-5fd47810f32c?w=800",
      blocks: [
        { block_type: "lesson", title: "The Cycle", content: "<p>When we feel down, we do less. When we do less, we feel worse.</p>", image_url: "https://images.unsplash.com/photo-1720292770182-5fd47810f32c?w=800" },
        { block_type: "quiz", title: "Check-in", exercise_config: { subtype: "mcq", prompt: "How have your activity levels been lately?", options: ["Low", "Normal", "High"] }, auto_advance: true }
      ]
    },
    {
      day_number: 1,
      title: "Tracking Activities",
      description: "Noticing what lifts you up.",
      image_url: "https://images.unsplash.com/photo-1643148636637-58b3eb95cdad?w=800", // Journal Coffee
      blocks: [
        { block_type: "lesson", title: "Energy Audit", content: "<p>Pay attention to what gives you energy vs what drains it.</p>", image_url: "https://images.unsplash.com/photo-1643148636637-58b3eb95cdad?w=800" },
        { block_type: "reflection", title: "Energizers", exercise_config: { prompt: "List 3 things that usually make you feel slightly better." } }
      ]
    },
    {
      day_number: 2,
      title: "Scheduling Joy",
      description: "Planning specifically.",
      image_url: "https://images.unsplash.com/photo-1563141415-2ae640ce9c5f?w=800",
      blocks: [
        { block_type: "lesson", title: "Schedule It", content: "<p>Don't wait to feel like it. Put it on the calendar.</p>", image_url: "https://images.unsplash.com/photo-1563141415-2ae640ce9c5f?w=800" },
        { block_type: "checklist", title: "Commitment", exercise_config: { subtype: "structured-list", options: ["Chose an activity", "Set a time"] } }
      ]
    },
    {
      day_number: 3,
      title: "Values & Goals",
      description: "Connecting to what matters.",
      image_url: "https://images.unsplash.com/photo-1642417188964-870c08705ef3?w=800", // Calendar (reused)
      blocks: [
        { block_type: "lesson", title: "Your Compass", content: "<p>Values are directions, not destinations.</p>", image_url: "https://images.unsplash.com/photo-1642417188964-870c08705ef3?w=800" },
        { block_type: "reflection", title: "Values", exercise_config: { prompt: "What kind of person do you want to be?" } }
      ]
    },
    {
      day_number: 4,
      title: "Planning Forward",
      description: "Keeping momentum.",
      image_url: "https://images.unsplash.com/photo-1720292770182-5fd47810f32c?w=800",
      blocks: [
        { block_type: "conclude", title: "Stay Active", content: "<p>Action precedes motivation.</p>" }
      ]
    }
  ]
};
