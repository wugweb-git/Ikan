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

// Common Scales
const scaleFrequency = {
  min: 0,
  max: 4,
  labels: ["Never", "Rarely", "Sometimes", "Often", "Always"]
};

const scaleAgreement = {
  min: 0,
  max: 4,
  labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
};

const scaleDays = {
  min: 0,
  max: 3,
  labels: ["Not at all", "Several days", "More than half", "Nearly every day"]
};

export const stressAssessmentData = {
  id: "assessment-stress-v1",
  slug: "assessment-stress",
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
        // 10 Questions - Stress Core
        {
          block_type: "exercise",
          title: "Control",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "In the last month, how often have you felt unable to control important things in your life?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_control"
          }
        },
        {
          block_type: "exercise",
          title: "Nervous",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you felt nervous or stressed?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_nervous"
          }
        },
        {
          block_type: "exercise",
          title: "Overwhelming",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have things felt overwhelming at work or home?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_overwhelm"
          }
        },
        {
          block_type: "exercise",
          title: "Difficulties",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you felt difficulties piling up too high to manage?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_difficulties"
          }
        },
        {
          block_type: "exercise",
          title: "Relax",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you found it hard to relax?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_relax"
          }
        },
        {
          block_type: "exercise",
          title: "Irritable",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you felt irritable or short-tempered?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_irritable"
          }
        },
        {
          block_type: "exercise",
          title: "Sleep",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often has stress affected your sleep?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_sleep"
          }
        },
        {
          block_type: "exercise",
          title: "Worry",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you worried about things beyond your control?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_worry"
          }
        },
        {
          block_type: "exercise",
          title: "Exhausted",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you felt mentally exhausted?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_exhausted"
          }
        },
        {
          block_type: "exercise",
          title: "Pressure",
          step_group_id: "stress_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often have you felt pressure to perform or meet expectations?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "stress_pressure"
          }
        },
        {
          block_type: "result",
          title: "Stress Score",
          content: "Your stress analysis",
          exercise_config: {
             interactionType: "result",
             scoringBands: [
                { min: 0, max: 10, label: "Low Stress" },
                { min: 11, max: 20, label: "Mild Stress" },
                { min: 21, max: 30, label: "Moderate Stress" },
                { min: 31, max: 40, label: "High Stress" }
             ],
             media: { type: "illustration", key: "stress_scale" }
          }
        }
      ]
    }
  ]
};

export const sleepAssessmentData = {
  id: "assessment-sleep-v1",
  slug: "assessment-sleep",
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
        // 8 Questions - Sleep Core (Using Section C questions as source)
        {
          block_type: "exercise",
          title: "Satisfaction",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How satisfied are you with your sleep?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_satisfaction"
          }
        },
        {
          block_type: "exercise",
          title: "Onset",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How long does it take you to fall asleep? (0=Fast, 4=Very Long)",
            scale: scaleFrequency, // Keeping scale consistent 0-4
            scoring: { weight: 1 },
            key: "sleep_onset"
          }
        },
        {
          block_type: "exercise",
          title: "Waking",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often do you wake during the night?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_waking"
          }
        },
        {
          block_type: "exercise",
          title: "Rested",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How rested do you feel in the morning? (0=Very, 4=Not at all)",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_rested"
          }
        },
        {
          block_type: "exercise",
          title: "Thoughts",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often do thoughts keep you awake?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_thoughts"
          }
        },
        {
          block_type: "exercise",
          title: "Screens",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often do you use screens before bed?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_screens"
          }
        },
        {
          block_type: "exercise",
          title: "Mood",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often does sleep affect your mood?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_mood"
          }
        },
        {
          block_type: "exercise",
          title: "Energy",
          step_group_id: "sleep_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "How often does poor sleep affect your energy?",
            scale: scaleFrequency,
            scoring: { weight: 1 },
            key: "sleep_energy"
          }
        },
        {
          block_type: "result",
          title: "Sleep Score",
          content: "Your sleep analysis",
          exercise_config: {
             interactionType: "result",
             scoringBands: [
                { min: 0, max: 8, label: "Healthy Sleep" },
                { min: 9, max: 20, label: "Sleep Strain" },
                { min: 21, max: 32, label: "Poor Sleep Quality" }
             ],
             media: { type: "illustration", key: "sleep_night" }
          }
        }
      ]
    }
  ]
};

export const burnoutAssessmentData = {
  id: "assessment-burnout-v1",
  slug: "assessment-burnout",
  type: "assessment",
  category: "Burnout",
  title: "Feeling Drained & Burned Out",
  description: "Check for burnout signs.",
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
        // 10 Questions - Burnout Core (Section D)
        {
          block_type: "exercise",
          title: "Exhausted",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel emotionally exhausted",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_exhausted"
          }
        },
        {
          block_type: "exercise",
          title: "Detached",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel detached from my work",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_detached"
          }
        },
        {
          block_type: "exercise",
          title: "Ineffective",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel ineffective at what I do",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_ineffective"
          }
        },
        {
          block_type: "exercise",
          title: "Cynical",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel cynical about responsibilities",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_cynical"
          }
        },
        {
          block_type: "exercise",
          title: "Drained",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel mentally drained",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_drained"
          }
        },
        {
          block_type: "exercise",
          title: "Tired",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel physically tired",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_tired"
          }
        },
        {
          block_type: "exercise",
          title: "Unmotivated",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel unmotivated",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_unmotivated"
          }
        },
        {
          block_type: "exercise",
          title: "Overwhelmed",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel overwhelmed by workload",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_overwhelmed"
          }
        },
        {
          block_type: "exercise",
          title: "Under-appreciated",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel under-appreciated",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_underappreciated"
          }
        },
        {
          block_type: "exercise",
          title: "Need Break",
          step_group_id: "burnout_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel I need a long break",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "burnout_break"
          }
        },
        {
          block_type: "result",
          title: "Burnout Score",
          content: "Your burnout analysis",
          exercise_config: {
             interactionType: "result",
             scoringBands: [
                { min: 0, max: 12, label: "Low Burnout Risk" },
                { min: 13, max: 25, label: "Burnout Warning" },
                { min: 26, max: 40, label: "High Burnout Risk" }
             ],
             media: { type: "illustration", key: "burnout_fatigue" }
          }
        }
      ]
    }
  ]
};

export const anxietyAssessmentData = {
  id: "assessment-anxiety-v1",
  slug: "assessment-anxiety",
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
        // 7 Questions - Anxiety Core
        {
          block_type: "exercise",
          title: "Nervousness",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Feeling nervous, anxious, or on edge",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_nervous"
          }
        },
        {
          block_type: "exercise",
          title: "Worry Control",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Not being able to stop or control worrying",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_control"
          }
        },
        {
          block_type: "exercise",
          title: "Worry Too Much",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Worrying too much about different things",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_too_much"
          }
        },
        {
          block_type: "exercise",
          title: "Relax",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Trouble relaxing",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_relax"
          }
        },
        {
          block_type: "exercise",
          title: "Restless",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Being so restless it’s hard to sit still",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_restless"
          }
        },
        {
          block_type: "exercise",
          title: "Annoyed",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Becoming easily annoyed or irritable",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_annoyed"
          }
        },
        {
          block_type: "exercise",
          title: "Afraid",
          step_group_id: "anxiety_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Feeling afraid as if something awful might happen",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "anxiety_afraid"
          }
        },
        {
          block_type: "result",
          title: "Anxiety Score",
          content: "Your anxiety analysis",
          exercise_config: {
             interactionType: "result",
             scoringBands: [
                { min: 0, max: 4, label: "Minimal Anxiety" },
                { min: 5, max: 9, label: "Mild Anxiety" },
                { min: 10, max: 14, label: "Moderate Anxiety" },
                { min: 15, max: 21, label: "Severe Anxiety" }
             ],
             media: { type: "illustration", key: "stress_scale" }
          }
        }
      ]
    }
  ]
};

export const depressionAssessmentData = {
  id: "assessment-depression-v1",
  slug: "assessment-depression",
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
        // 9 Questions - Depression Core
        {
          block_type: "exercise",
          title: "Interest",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Little interest or pleasure in doing things",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_interest"
          }
        },
        {
          block_type: "exercise",
          title: "Down",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Feeling down, depressed, or hopeless",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_down"
          }
        },
        {
          block_type: "exercise",
          title: "Sleep",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Trouble falling or staying asleep, or sleeping too much",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_sleep"
          }
        },
        {
          block_type: "exercise",
          title: "Energy",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Feeling tired or having little energy",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_energy"
          }
        },
        {
          block_type: "exercise",
          title: "Appetite",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Poor appetite or overeating",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_appetite"
          }
        },
        {
          block_type: "exercise",
          title: "Self-worth",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_self"
          }
        },
        {
          block_type: "exercise",
          title: "Concentration",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Trouble concentrating on things, such as reading the newspaper or watching television",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_concentration"
          }
        },
        {
          block_type: "exercise",
          title: "Movement",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_movement"
          }
        },
        {
          block_type: "exercise",
          title: "Meaning",
          step_group_id: "depression_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "Thoughts that you would be better off dead or of hurting yourself in some way",
            scale: scaleDays,
            scoring: { weight: 1 },
            key: "dep_harm"
          }
        },
        {
          block_type: "result",
          title: "Depression Score",
          content: "Your mood analysis",
          exercise_config: {
             interactionType: "result",
             scoringBands: [
                { min: 0, max: 4, label: "Minimal Depression" },
                { min: 5, max: 9, label: "Mild Depression" },
                { min: 10, max: 14, label: "Moderate Depression" },
                { min: 15, max: 19, label: "Moderately Severe" },
                { min: 20, max: 27, label: "Severe Depression" }
             ],
             media: { type: "illustration", key: "burnout_fatigue" }
          }
        }
      ]
    }
  ]
};

export const balanceAssessmentData = {
  id: "assessment-balance-v1",
  slug: "assessment-balance",
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
        // 10 Questions - Balance Core (Section 4)
        {
          block_type: "exercise",
          title: "Time for self",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel I have enough time for myself",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_time_self"
          }
        },
        {
          block_type: "exercise",
          title: "Energy drain",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "My work drains most of my energy",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_drain"
          }
        },
        {
          block_type: "exercise",
          title: "Disconnect",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I can disconnect from work after hours",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_disconnect"
          }
        },
        {
          block_type: "exercise",
          title: "Support",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel supported at work or home",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_support"
          }
        },
        {
          block_type: "exercise",
          title: "Manageable",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "My responsibilities feel manageable",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_manageable"
          }
        },
        {
          block_type: "exercise",
          title: "Guilt",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel guilty when I take breaks",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_guilt"
          }
        },
        {
          block_type: "exercise",
          title: "Relationships",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I have time for relationships",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_relationships"
          }
        },
        {
          block_type: "exercise",
          title: "Always On",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel constantly “on”",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_on"
          }
        },
        {
          block_type: "exercise",
          title: "Satisfaction",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel satisfied with how I spend my time",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_satisfaction"
          }
        },
        {
          block_type: "exercise",
          title: "Burnout Proximity",
          step_group_id: "balance_core",
          auto_advance: true,
          exercise_config: {
            interactionType: "rating_scale",
            subtype: "scale",
            prompt: "I feel close to burnout",
            scale: scaleAgreement,
            scoring: { weight: 1 },
            key: "bal_burnout"
          }
        },
        {
          block_type: "result",
          title: "Balance Score",
          content: "Your balance analysis",
          exercise_config: {
             interactionType: "result",
             scoringBands: [
                { min: 0, max: 12, label: "Balanced" },
                { min: 13, max: 24, label: "Strained" },
                { min: 25, max: 40, label: "Imbalanced" }
             ],
             media: { type: "illustration", key: "burnout_fatigue" }
          }
        }
      ]
    }
  ]
};

export const generalAssessmentData = {
  id: "assessment-general-v1",
  slug: "assessment-general",
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
          block_type: "exercise",
          title: "Mind",
          exercise_config: {
            interactionType: "short_text",
            subtype: "text",
            prompt: "What’s been on your mind lately?",
            helperText: "A few words are enough",
            scoring: { qualitative: true },
            key: "general_mind"
          }
        }
      ]
    }
  ]
};
