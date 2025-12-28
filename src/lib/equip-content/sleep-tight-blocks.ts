import { DayDefinition, ProgramBlock } from '../equip-block-types';

const DAYS_1_TO_9: DayDefinition[] = [
  // DAY 1 — Let’s Begin
  {
    dayNumber: 1,
    title: "Let's Begin",
    intent: "Awareness & baseline",
    dayType: 'lesson_activity',
    estimatedTime: 10,
    blocks: [
      {
        id: "d1-b1",
        type: "lesson",
        title: "Welcome to Sleep Tight",
        required: true,
        contentType: "text",
        content: "## Welcome to Sleep Tight\n\nThis program is designed to help you build awareness, identify patterns, and create lasting rituals for better rest.\n\n### The Sleep-Health Feedback Loop\n\nHow we think about sleep affects how we sleep. Anxiety about not sleeping often keeps us awake. We'll work together to break this loop.",
        estimatedTime: 5
      },
      {
        id: "d1-b2",
        type: "exercise",
        title: "How do you feel?",
        required: true,
        exerciseType: "multi_select",
        dataId: "i02",
        prompt: "Pick statements that resonate with you before sleep or after waking up:",
        options: [
          { id: "opt-1", label: "😴 Tired but wired", value: "tired_wired" },
          { id: "opt-2", label: "🧠 Can't turn off my brain", value: "racing_thoughts" },
          { id: "opt-3", label: "😫 Dread going to bed", value: "dread_bed" },
          { id: "opt-4", label: "⚡ Wake up alert", value: "wake_alert" },
          { id: "opt-5", label: "🐼 Grogginess all day", value: "groggy" }
        ],
        config: { allowMultiple: true },
        estimatedTime: 3
      },
      {
        id: "d1-b3",
        type: "conclude",
        required: false,
        message: "Thanks for the insights on your sleep! We’ll meet tomorrow."
      }
    ]
  },

  // DAY 2 — Understanding Thought Patterns
  {
    dayNumber: 2,
    title: "Understanding Thought Patterns",
    intent: "Psychoeducation",
    dayType: 'lesson_activity',
    estimatedTime: 15,
    blocks: [
      {
        id: "d2-b1",
        type: "lesson",
        title: "Thoughts vs. Feelings",
        required: true,
        contentType: "text",
        content: "## Thoughts vs. Feelings\n\nA **Thought** is a sentence in your head (e.g., 'I will never sleep').\n\nA **Feeling** is an emotional state (e.g., 'Anxious', 'Frustrated').\n\nDistinguishing them is the first step to CBT.",
        estimatedTime: 5
      },
      {
        id: "d2-b2",
        type: "exercise",
        title: "Identify the Pattern",
        required: true,
        exerciseType: "mcq",
        dataId: "i03",
        prompt: "Identify which is a thought vs a feeling:",
        options: [
          { id: "opt-1", label: "'I am never going to fall asleep'", value: "thought", isCorrect: true },
          { id: "opt-2", label: "Frustrated and Angry", value: "feeling", isCorrect: false }
        ],
        estimatedTime: 3
      },
      {
        id: "d2-b3",
        type: "exercise",
        title: "Thought Log Example",
        required: false,
        exerciseType: "table",
        dataId: "i04",
        prompt: "Review these examples of how to track thoughts:",
        columns: [
          { id: "time", header: "Time", type: "text" },
          { id: "situation", header: "Situation", type: "text" },
          { id: "thoughts", header: "Thoughts", type: "text" },
          { id: "feelings", header: "Feelings", type: "text" },
          { id: "response", header: "Response", type: "text" }
        ],
        rows: [
          { time: "10:30 PM", situation: "Lying in bed", thoughts: "Why am I not asleep yet?", feelings: "Anxious", response: "Tossed and turned" },
          { time: "2:00 AM", situation: "Woke up", thoughts: "I'm going to be wrecked tomorrow", feelings: "Panic", response: "Checked phone" }
        ],
        config: { editable: false },
        estimatedTime: 5
      },
      {
        id: "d2-b4",
        type: "conclude",
        required: false,
        message: "Great job understanding the difference. Tomorrow we'll track your own."
      }
    ]
  },

  // DAY 3 — Digging Deeper
  {
    dayNumber: 3,
    title: "Digging Deeper",
    intent: "Pattern recognition",
    dayType: 'activity_only',
    estimatedTime: 10,
    blocks: [
      {
        id: "d3-b1",
        type: "exercise",
        title: "Your Thought Log",
        required: true,
        exerciseType: "table",
        dataId: "i04_plus",
        prompt: "Think back to last night. Can you log one thought?",
        columns: [
          { id: "time", header: "Time", type: "text" },
          { id: "situation", header: "Situation", type: "text" },
          { id: "thoughts", header: "Thoughts", type: "text" },
          { id: "feelings", header: "Feelings", type: "text" },
          { id: "response", header: "Response", type: "text" },
          { id: "impact", header: "Did it affect sleep?", type: "boolean" }
        ],
        config: { editable: true, autoAddRow: true },
        estimatedTime: 8
      },
      {
        id: "d3-b2",
        type: "conclude",
        required: false,
        message: "Logging thoughts helps us detach from them. Well done."
      }
    ]
  },

  // DAY 4 — Journaling
  {
    dayNumber: 4,
    title: "Journaling",
    intent: "Cognitive offloading",
    dayType: 'lesson_activity',
    estimatedTime: 15,
    blocks: [
      {
        id: "d4-b1",
        type: "lesson",
        title: "The Power of Offloading",
        required: true,
        contentType: "text",
        content: "## Emptying the Mind\n\nSometimes our brain keeps spinning because it's trying to 'hold on' to things so you don't forget. Writing them down signals to your brain: 'It's safe to let go now.'",
        estimatedTime: 3
      },
      {
        id: "d4-b2",
        type: "exercise",
        title: "What counts?",
        required: true,
        exerciseType: "mcq",
        dataId: "i08",
        prompt: "Which of the following is a valid journal entry?",
        options: [
          { id: "opt-1", label: "A grocery list", value: "list", isCorrect: true },
          { id: "opt-2", label: "A rant about work", value: "rant", isCorrect: true },
          { id: "opt-3", label: "A worry about tomorrow", value: "worry", isCorrect: true },
          { id: "opt-4", label: "All of the above", value: "all", isCorrect: true }
        ],
        estimatedTime: 2
      },
      {
        id: "d4-b3",
        type: "journal",
        title: "Brain Dump",
        required: true,
        prompt: "Write down anything that is on your mind right now. Don't worry about grammar. This will be deleted in 48 hours.",
        isEphemeral: true,
        dataId: "i09",
        estimatedTime: 10
      },
      {
        id: "d4-b4",
        type: "conclude",
        required: false,
        message: "You've offloaded your thoughts. They are safe here, so you can rest."
      }
    ]
  },

  // DAY 5 — Distractions & Control
  {
    dayNumber: 5,
    title: "Distractions & Control",
    intent: "Identify disruptors",
    dayType: 'lesson_activity',
    estimatedTime: 15,
    blocks: [
      {
        id: "d5-b1",
        type: "lesson",
        title: "Internal vs. External",
        required: true,
        contentType: "text",
        content: "## Distractions\n\n**External**: Noise, light, temperature, partner snoring.\n\n**Internal**: Hunger, pain, worry, planning.\n\nWe tackle them differently.",
        estimatedTime: 5
      },
      {
        id: "d5-b2",
        type: "exercise",
        title: "Identify Distractors",
        required: true,
        exerciseType: "multi_select",
        dataId: "i05",
        prompt: "Select things that commonly keep you up:",
        options: [
          { id: "opt-1", label: "Street noise", value: "noise" },
          { id: "opt-2", label: "Room temperature", value: "temp" },
          { id: "opt-3", label: "Blue light / Phone", value: "phone" },
          { id: "opt-4", label: "Hunger", value: "hunger" },
          { id: "opt-5", label: "Worrying about tasks", value: "worry" }
        ],
        config: { allowMultiple: true },
        estimatedTime: 3
      },
      {
        id: "d5-b3",
        type: "exercise",
        title: "Control Check",
        required: true,
        exerciseType: "table",
        dataId: "i06",
        prompt: "For each distractor, is it in your control?",
        columns: [
          { id: "distractor", header: "Thing that kept me up", type: "text" },
          { id: "control", header: "In my control?", type: "boolean" }
        ],
        config: { autoAddRow: true },
        estimatedTime: 5
      },
      {
        id: "d5-b4",
        type: "conclude",
        required: false,
        message: "Identifying what we can control is key to reducing sleep anxiety."
      }
    ]
  },

  // DAY 6 — Ideation (Day 1)
  {
    dayNumber: 6,
    title: "Ideation (Day 1)",
    intent: "Divergent thinking",
    dayType: 'lesson_activity',
    estimatedTime: 15,
    blocks: [
      {
        id: "d6-b1",
        type: "lesson",
        title: "Brainstorming Rules",
        required: true,
        contentType: "text",
        content: "## No Bad Ideas\n\nToday we just generate ideas. Don't evaluate them yet. Crazy ideas are welcome.",
        estimatedTime: 3
      },
      {
        id: "d6-b2",
        type: "exercise",
        title: "Solution Brainstorm",
        required: true,
        exerciseType: "table",
        dataId: "i07",
        prompt: "List disturbances and ANY way to reduce them:",
        columns: [
          { id: "disturbance", header: "Disturbance", type: "text" },
          { id: "idea", header: "Ways to reduce", type: "text" }
        ],
        config: { autoAddRow: true },
        estimatedTime: 10
      },
      {
        id: "d6-b3",
        type: "conclude",
        required: false,
        message: "Good start. We'll expand on this tomorrow."
      }
    ]
  },

  // DAY 7 — Ideation (Day 2)
  {
    dayNumber: 7,
    title: "Ideation (Day 2)",
    intent: "Expand solution space",
    dayType: 'activity_only',
    estimatedTime: 15,
    blocks: [
      {
        id: "d7-b1",
        type: "exercise",
        title: "Push Further",
        required: true,
        exerciseType: "table",
        dataId: "i07_plus",
        prompt: "Can you think of 3 more ways to handle your main disturbance?",
        columns: [
          { id: "disturbance", header: "Disturbance", type: "text" },
          { id: "idea", header: "More ideas", type: "text" }
        ],
        config: { autoAddRow: true },
        estimatedTime: 15
      },
      {
        id: "d7-b2",
        type: "conclude",
        required: false,
        message: "Now we have plenty of options to choose from."
      }
    ]
  },

  // DAY 8 — Part of the Solution
  {
    dayNumber: 8,
    title: "Part of the Solution",
    intent: "Convergent thinking",
    dayType: 'activity_only',
    estimatedTime: 20,
    blocks: [
      {
        id: "d8-b1",
        type: "exercise",
        title: "Evaluate Solutions",
        required: true,
        exerciseType: "table",
        dataId: "i07_plus_plus",
        prompt: "Let's weigh the pros and cons to find a balanced solution.",
        columns: [
          { id: "disturbance", header: "Disturbance", type: "text" },
          { id: "idea", header: "Way to reduce", type: "text" },
          { id: "pros", header: "Pros", type: "text" },
          { id: "cons", header: "Cons", type: "text" },
          { id: "solution", header: "Balanced Solution", type: "text" }
        ],
        config: { autoAddRow: true },
        estimatedTime: 20
      },
      {
        id: "d8-b2",
        type: "conclude",
        required: false,
        message: "You've created your own personalized sleep strategy."
      }
    ]
  },

  // DAY 9 — Bedtime Rituals
  {
    dayNumber: 9,
    title: "Bedtime Rituals",
    intent: "Habit creation",
    dayType: 'lesson_activity',
    estimatedTime: 20,
    blocks: [
      {
        id: "d9-b1",
        type: "lesson",
        title: "The Power of Ritual",
        required: true,
        contentType: "text",
        content: "## Signaling Sleep\n\nA consistent ritual tells your body it's time to wind down, triggering melatonin production.",
        estimatedTime: 5
      },
      {
        id: "d9-b2",
        type: "exercise",
        title: "Choose Your Routine",
        required: true,
        exerciseType: "multi_select",
        dataId: "i10",
        prompt: "Select activities for your bedtime routine:",
        options: [
          { id: "opt-1", label: "Reading fiction", value: "read" },
          { id: "opt-2", label: "Warm shower", value: "shower" },
          { id: "opt-3", label: "Stretching", value: "stretch" },
          { id: "opt-4", label: "Breathing exercise", value: "breath" },
          { id: "opt-5", label: "Dimming lights", value: "lights" }
        ],
        config: { allowMultiple: true },
        estimatedTime: 3
      },
      {
        id: "d9-b3",
        type: "exercise",
        title: "Sleep Hygiene Checklist",
        required: true,
        exerciseType: "list",
        dataId: "i11",
        prompt: "Customize your sleep hygiene essentials:",
        options: [
          { id: "h1", label: "Phone away 30m before bed", value: "phone_away" },
          { id: "h2", label: "Room cool (65-68°F)", value: "cool_room" },
          { id: "h3", label: "Blackout curtains / Mask", value: "darkness" }
        ],
        config: { editable: true },
        estimatedTime: 5
      },
      {
        id: "d9-b4",
        type: "journal",
        title: "Relaxation List",
        required: true,
        prompt: "List 3 things that genuinely relax you (not just scrolling):",
        isEphemeral: false,
        dataId: "i12",
        estimatedTime: 5
      },
      {
        id: "d9-b5",
        type: "conclude",
        required: false,
        message: "Congratulations! You've built your sleep toolkit. Keep practicing."
      }
    ]
  }
];

// DAYS 10-17 — Practice Loop
const PRACTICE_DAYS: DayDefinition[] = Array.from({ length: 8 }, (_, i) => {
  const dayNum = 10 + i;
  return {
    dayNumber: dayNum,
    title: `Daily Practice (Day ${dayNum})`,
    intent: "Consolidation & Routine",
    dayType: 'practice',
    estimatedTime: 10,
    blocks: [
      {
        id: `d${dayNum}-b1`,
        type: "checklist",
        title: "Sleep Hygiene Checklist",
        required: true,
        items: [
          { id: "h1", text: "Phone away 30m before bed" },
          { id: "h2", text: "Room cool (65-68°F)" },
          { id: "h3", text: "Blackout curtains / Mask" },
          { id: "h4", text: "Completed bedtime ritual" }
        ],
        estimatedTime: 2
      },
      {
        id: `d${dayNum}-b2`,
        type: "sleep_diary", // New type
        title: "Sleep Diary",
        required: true,
        dataId: `diary-${dayNum}`,
        estimatedTime: 5
      },
      {
        id: `d${dayNum}-b3`,
        type: "conclude",
        required: false,
        message: "Consistency is key. See you tomorrow."
      }
    ]
  };
});

// DAY 18 — Conclusion
const DAY_18: DayDefinition = {
  dayNumber: 18,
  title: "Conclusion & Review",
  intent: "Commitment",
  dayType: 'conclusion',
  estimatedTime: 15,
  blocks: [
    {
      id: "d18-b1",
      type: "lesson",
      title: "You Did It!",
      required: true,
      contentType: "text",
      content: "## The End is Just the Beginning\n\nYou have completed the Sleep Tight program. You now have a toolkit for better sleep.\n\n### What we've covered:\n- Understanding thoughts vs feelings\n- Identifying distractors\n- Creating a ritual\n- Consistent practice",
      estimatedTime: 5
    },
    {
      id: "d18-b2",
      type: "exercise",
      title: "Your Commitment",
      required: true,
      exerciseType: "multi_select",
      dataId: "commitment",
      prompt: "What will you continue doing?",
      options: [
        { id: "c1", label: "My bedtime ritual", value: "ritual" },
        { id: "c2", label: "Keeping phone away", value: "phone" },
        { id: "c3", label: "Writing down worries", value: "journal" }
      ],
      config: { allowMultiple: true },
      estimatedTime: 5
    },
    {
      id: "d18-b3",
      type: "conclude",
      required: false,
      message: "Thank you for trusting us with your sleep journey. Be well."
    }
  ]
};

export const SLEEP_TIGHT_DAYS: DayDefinition[] = [
  ...DAYS_1_TO_9,
  ...PRACTICE_DAYS,
  DAY_18
];
