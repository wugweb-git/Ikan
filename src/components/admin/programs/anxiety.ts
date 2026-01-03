import { boxBreathingBlock } from "./shared-blocks";

export const anxietyProgramData = {
  title: "Anxiety 101",
  description: "Learn the basics of managing anxiety with CBT-based tools and relaxation techniques.",
  category: "Anxiety",
  image_url: "https://images.unsplash.com/photo-1568456064865-15080c31d422?w=800", // Calm lake
  difficulty: "beginner",
  duration_weeks: 1,
  tags: ["anxiety", "cbt", "stress"],
  published: true,
  days: [
    {
      day_number: 0,
      title: "Understanding Anxiety",
      description: "What is anxiety and why do we have it?",
      image_url: "https://images.unsplash.com/photo-1603171853810-e69b0cd9f169?w=800", // Tangled rope
      blocks: [
        { block_type: "lesson", title: "The Alarm System", content: "<p>Anxiety is your body's alarm system. It's not dangerous, just uncomfortable.</p>", image_url: "https://images.unsplash.com/photo-1603171853810-e69b0cd9f169?w=800" },
        { block_type: "quiz", title: "Symptoms", exercise_config: { subtype: "multi-select", prompt: "What do you feel when anxious?", options: ["Racing heart", "Sweating", "Worrying thoughts", "Tension"] } },
        { block_type: "conclude", title: "It's Okay", content: "You are safe." }
      ]
    },
    {
      day_number: 1,
      title: "The Anxiety Cycle",
      description: "How thoughts, feelings, and behaviors are connected.",
      image_url: "https://images.unsplash.com/photo-1568456064865-15080c31d422?w=800",
      blocks: [
        { block_type: "lesson", title: "The Triangle", content: "<p>Thoughts affect feelings, which affect behaviors.</p>", image_url: "https://images.unsplash.com/photo-1568456064865-15080c31d422?w=800" },
        { block_type: "reflection", title: "Identify a Trigger", exercise_config: { prompt: "Describe a recent situation that made you anxious." } }
      ]
    },
    {
      day_number: 2,
      title: "Breathing Space",
      description: "Physiological regulation.",
      image_url: "https://images.unsplash.com/photo-1655970580622-4a547789c850?w=800", // Breathing
      blocks: [
        // Reusing Box Breathing
        boxBreathingBlock,
        { block_type: "checklist", title: "Practice", exercise_config: { subtype: "structured-list", options: ["Completed 3 cycles", "Noticed tension dropping"] } }
      ]
    },
    {
      day_number: 3,
      title: "Catching Thoughts",
      description: "Cognitive reframing basics.",
      image_url: "https://images.unsplash.com/photo-1563141415-2ae640ce9c5f?w=800", // Hiking/Forest (calm)
      blocks: [
        { block_type: "lesson", title: "Thoughts vs Facts", content: "<p>Thoughts are not always facts.</p>", image_url: "https://images.unsplash.com/photo-1563141415-2ae640ce9c5f?w=800" },
        { block_type: "quiz", title: "True or False?", exercise_config: { subtype: "mcq", prompt: "Is 'Everyone is judging me' a fact?", options: ["Yes", "No, it's a thought"] }, auto_advance: true }
      ]
    },
    {
      day_number: 4,
      title: "Moving Forward",
      description: "Taking action.",
      image_url: "https://images.unsplash.com/photo-1720292770182-5fd47810f32c?w=800",
      blocks: [
        { block_type: "reflection", title: "Action Plan", exercise_config: { prompt: "What is one small step you can take today despite anxiety?" } },
        { block_type: "conclude", title: "You Got This", content: "Keep practicing." }
      ]
    }
  ]
};
