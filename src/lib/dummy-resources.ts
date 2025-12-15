// Centralized dummy resource data for consistent use across the application
export interface DummyResource {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: string;
  readTimeMinutes: number;
  author: string;
  publishedDate: string;
  tags: string[];
  image?: string;
  content: Array<{
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip';
    content: string;
    items?: string[];
  }>;
  relatedResources?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    readTimeMinutes: number;
    publishedDate: string;
  }>;
}

export const DUMMY_RESOURCES: DummyResource[] = [
  {
    id: 'resource-1',
    title: 'Understanding Anxiety: A Comprehensive Guide',
    description: 'Learn about the nature of anxiety, its symptoms, and evidence-based strategies to manage it effectively in your daily life.',
    category: 'Mental Health',
    contentType: 'Article',
    readTimeMinutes: 8,
    author: 'Dr. Sarah Johnson',
    publishedDate: '2024-03-15',
    tags: ['Anxiety', 'Mental Health', 'Coping Strategies', 'Self-Care'],
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
    content: [
      {
        type: 'heading',
        content: 'What is Anxiety?'
      },
      {
        type: 'paragraph',
        content: 'Anxiety is a natural human response to stress or perceived danger. While everyone experiences anxiety from time to time, chronic anxiety can significantly impact your quality of life. Understanding the nature of anxiety is the first step toward managing it effectively.'
      },
      {
        type: 'heading',
        content: 'Common Symptoms'
      },
      {
        type: 'list',
        content: 'Physical and emotional symptoms include:',
        items: [
          'Rapid heartbeat and breathing',
          'Excessive worry or fear',
          'Difficulty concentrating',
          'Sleep disturbances',
          'Muscle tension',
          'Restlessness or feeling on edge'
        ]
      },
      {
        type: 'heading',
        content: 'Evidence-Based Coping Strategies'
      },
      {
        type: 'paragraph',
        content: 'Research shows that several techniques can effectively reduce anxiety symptoms. Deep breathing exercises, progressive muscle relaxation, and mindfulness meditation have all been proven to help manage anxiety in the moment.'
      },
      {
        type: 'tip',
        content: 'Try the 4-7-8 breathing technique: Breathe in for 4 counts, hold for 7, and exhale for 8. This activates your parasympathetic nervous system and promotes calm.'
      },
      {
        type: 'paragraph',
        content: 'Remember, seeking professional help is a sign of strength, not weakness. If anxiety is interfering with your daily life, consider reaching out to a mental health professional.'
      }
    ],
    relatedResources: [
      {
        id: 'resource-2',
        title: 'Mindfulness Meditation for Beginners',
        description: 'A practical guide to starting your mindfulness practice',
        category: 'Wellness',
        readTimeMinutes: 5,
        publishedDate: '2024-03-10'
      },
      {
        id: 'resource-3',
        title: 'Sleep Hygiene: Better Rest for Better Mental Health',
        description: 'Improve your sleep quality with these evidence-based tips',
        category: 'Self-Care',
        readTimeMinutes: 6,
        publishedDate: '2024-03-08'
      }
    ]
  },
  {
    id: 'resource-2',
    title: 'Mindfulness Meditation for Beginners',
    description: 'A practical guide to starting your mindfulness practice, with simple techniques you can use anywhere, anytime.',
    category: 'Wellness',
    contentType: 'Guide',
    readTimeMinutes: 5,
    author: 'Michael Chen',
    publishedDate: '2024-03-10',
    tags: ['Mindfulness', 'Meditation', 'Stress Relief', 'Wellness'],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    content: [
      {
        type: 'heading',
        content: 'Getting Started with Mindfulness'
      },
      {
        type: 'paragraph',
        content: 'Mindfulness is the practice of being fully present in the moment, aware of where we are and what we\'re doing, without being overly reactive or overwhelmed. It\'s a skill that can be developed through regular practice.'
      },
      {
        type: 'heading',
        content: 'Simple 5-Minute Practice'
      },
      {
        type: 'list',
        content: 'Follow these steps:',
        items: [
          'Find a quiet, comfortable place to sit',
          'Set a timer for 5 minutes',
          'Close your eyes and focus on your breath',
          'Notice when your mind wanders (it will!)',
          'Gently bring your attention back to your breath',
          'Continue until the timer sounds'
        ]
      },
      {
        type: 'tip',
        content: 'Don\'t judge yourself when your mind wanders. That\'s completely normal and part of the practice. The act of noticing and returning your focus is where the real training happens.'
      },
      {
        type: 'paragraph',
        content: 'Start with just 5 minutes a day and gradually increase the duration as you become more comfortable with the practice. Consistency is more important than duration.'
      }
    ],
    relatedResources: [
      {
        id: 'resource-1',
        title: 'Understanding Anxiety: A Comprehensive Guide',
        description: 'Learn about anxiety and effective management strategies',
        category: 'Mental Health',
        readTimeMinutes: 8,
        publishedDate: '2024-03-15'
      },
      {
        id: 'resource-4',
        title: 'Building Resilience in Uncertain Times',
        description: 'Develop the mental strength to navigate life\'s challenges',
        category: 'Mental Health',
        readTimeMinutes: 7,
        publishedDate: '2024-03-05'
      }
    ]
  },
  {
    id: 'resource-3',
    title: 'Sleep Hygiene: Better Rest for Better Mental Health',
    description: 'Improve your sleep quality with these evidence-based tips and create a bedtime routine that supports your mental wellbeing.',
    category: 'Self-Care',
    contentType: 'Guide',
    readTimeMinutes: 6,
    author: 'Dr. Emily Rodriguez',
    publishedDate: '2024-03-08',
    tags: ['Sleep', 'Self-Care', 'Mental Health', 'Wellness'],
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
    content: [
      {
        type: 'heading',
        content: 'Why Sleep Matters for Mental Health'
      },
      {
        type: 'paragraph',
        content: 'Quality sleep is fundamental to mental health. Poor sleep can worsen symptoms of anxiety and depression, while good sleep supports emotional regulation, cognitive function, and overall wellbeing.'
      },
      {
        type: 'heading',
        content: 'Essential Sleep Hygiene Practices'
      },
      {
        type: 'list',
        content: 'Implement these habits:',
        items: [
          'Maintain a consistent sleep schedule, even on weekends',
          'Create a relaxing bedtime routine (reading, gentle stretching, warm bath)',
          'Keep your bedroom cool, dark, and quiet',
          'Avoid screens 1 hour before bed',
          'Limit caffeine after 2 PM',
          'Exercise regularly, but not close to bedtime'
        ]
      },
      {
        type: 'tip',
        content: 'If you can\'t fall asleep after 20 minutes, get up and do a quiet, non-stimulating activity until you feel sleepy. This helps your brain associate bed with sleep, not wakefulness.'
      },
      {
        type: 'paragraph',
        content: 'Remember, developing good sleep habits takes time. Be patient with yourself and make changes gradually for lasting results.'
      }
    ],
    relatedResources: [
      {
        id: 'resource-1',
        title: 'Understanding Anxiety: A Comprehensive Guide',
        description: 'Learn about anxiety and effective management strategies',
        category: 'Mental Health',
        readTimeMinutes: 8,
        publishedDate: '2024-03-15'
      },
      {
        id: 'resource-2',
        title: 'Mindfulness Meditation for Beginners',
        description: 'A practical guide to starting your mindfulness practice',
        category: 'Wellness',
        readTimeMinutes: 5,
        publishedDate: '2024-03-10'
      }
    ]
  },
  {
    id: 'resource-4',
    title: 'Building Resilience in Uncertain Times',
    description: 'Develop the mental strength to navigate life\'s challenges and bounce back from adversity with these proven strategies.',
    category: 'Mental Health',
    contentType: 'Article',
    readTimeMinutes: 7,
    author: 'Dr. James Williams',
    publishedDate: '2024-03-05',
    tags: ['Resilience', 'Mental Strength', 'Coping Skills', 'Personal Growth'],
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
    content: [
      {
        type: 'heading',
        content: 'What is Resilience?'
      },
      {
        type: 'paragraph',
        content: 'Resilience is the ability to adapt well in the face of adversity, trauma, tragedy, threats, or significant sources of stress. It\'s not about avoiding difficulties, but rather learning to cope with them effectively.'
      },
      {
        type: 'heading',
        content: 'Key Components of Resilience'
      },
      {
        type: 'list',
        content: 'Build these foundational elements:',
        items: [
          'Strong relationships and social support',
          'Realistic planning and problem-solving skills',
          'Positive view of yourself and confidence in your abilities',
          'Healthy communication and emotional management',
          'Ability to see setbacks as temporary',
          'Taking decisive actions in challenging situations'
        ]
      },
      {
        type: 'quote',
        content: 'Resilience is not a trait that people either have or don\'t have. It involves behaviors, thoughts, and actions that can be learned and developed by anyone.'
      },
      {
        type: 'paragraph',
        content: 'Start small by identifying one area where you can build resilience today. It could be reaching out to a friend, setting a small achievable goal, or practicing self-compassion when facing a challenge.'
      }
    ],
    relatedResources: [
      {
        id: 'resource-1',
        title: 'Understanding Anxiety: A Comprehensive Guide',
        description: 'Learn about anxiety and effective management strategies',
        category: 'Mental Health',
        readTimeMinutes: 8,
        publishedDate: '2024-03-15'
      },
      {
        id: 'resource-5',
        title: 'The Power of Gratitude Practice',
        description: 'Transform your mindset with daily gratitude exercises',
        category: 'Wellness',
        readTimeMinutes: 4,
        publishedDate: '2024-03-01'
      }
    ]
  },
  {
    id: 'resource-5',
    title: 'The Power of Gratitude Practice',
    description: 'Transform your mindset and improve your mental health with daily gratitude exercises backed by science.',
    category: 'Wellness',
    contentType: 'Practice Guide',
    readTimeMinutes: 4,
    author: 'Lisa Thompson',
    publishedDate: '2024-03-01',
    tags: ['Gratitude', 'Positive Psychology', 'Wellness', 'Daily Practice'],
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800',
    content: [
      {
        type: 'heading',
        content: 'The Science of Gratitude'
      },
      {
        type: 'paragraph',
        content: 'Research shows that regularly practicing gratitude can lead to increased happiness, reduced depression, improved relationships, and better physical health. It rewires your brain to notice positive aspects of life more readily.'
      },
      {
        type: 'heading',
        content: 'Simple Gratitude Exercises'
      },
      {
        type: 'list',
        content: 'Try these daily practices:',
        items: [
          'Write down 3 things you\'re grateful for each morning',
          'Send a thank-you message to someone who helped you',
          'Take a gratitude walk, noticing beauty around you',
          'Share something you\'re grateful for at dinner',
          'Keep a gratitude jar - add notes weekly',
          'Express appreciation to yourself for your efforts'
        ]
      },
      {
        type: 'tip',
        content: 'Be specific in your gratitude practice. Instead of "I\'m grateful for my family," try "I\'m grateful my sister called to check on me today." Specificity deepens the positive impact.'
      },
      {
        type: 'paragraph',
        content: 'Like any skill, gratitude improves with practice. Start with just one exercise and build from there. Even 2 minutes a day can make a meaningful difference.'
      }
    ],
    relatedResources: [
      {
        id: 'resource-2',
        title: 'Mindfulness Meditation for Beginners',
        description: 'A practical guide to starting your mindfulness practice',
        category: 'Wellness',
        readTimeMinutes: 5,
        publishedDate: '2024-03-10'
      },
      {
        id: 'resource-4',
        title: 'Building Resilience in Uncertain Times',
        description: 'Develop the mental strength to navigate life\'s challenges',
        category: 'Mental Health',
        readTimeMinutes: 7,
        publishedDate: '2024-03-05'
      }
    ]
  },
  {
    id: 'resource-6',
    title: 'Managing Depression: Practical Daily Strategies',
    description: 'Evidence-based techniques to manage depression symptoms and improve your daily functioning and quality of life.',
    category: 'Mental Health',
    contentType: 'Guide',
    readTimeMinutes: 9,
    author: 'Dr. Rachel Green',
    publishedDate: '2024-02-28',
    tags: ['Depression', 'Mental Health', 'Coping Strategies', 'Self-Help'],
    image: 'https://images.unsplash.com/photo-1499428665502-503f6ea4e3b3?w=800',
    content: [
      {
        type: 'heading',
        content: 'Understanding Depression'
      },
      {
        type: 'paragraph',
        content: 'Depression is more than just feeling sad. It\'s a medical condition that affects how you feel, think, and handle daily activities. While professional treatment is often necessary, there are also practical strategies you can use daily to manage symptoms.'
      },
      {
        type: 'heading',
        content: 'Daily Management Strategies'
      },
      {
        type: 'list',
        content: 'Incorporate these practices:',
        items: [
          'Maintain a regular sleep schedule',
          'Engage in physical activity, even just 10-minute walks',
          'Set small, achievable daily goals',
          'Stay connected with supportive people',
          'Practice self-compassion and avoid self-criticism',
          'Limit alcohol and avoid recreational drugs',
          'Challenge negative thought patterns'
        ]
      },
      {
        type: 'tip',
        content: 'On difficult days, use the "next right thing" approach. Instead of overwhelming yourself with everything you need to do, just focus on the next single action you can take.'
      },
      {
        type: 'paragraph',
        content: 'Remember, recovery from depression takes time. Be patient with yourself and don\'t hesitate to reach out to a mental health professional for support. You don\'t have to face this alone.'
      }
    ],
    relatedResources: [
      {
        id: 'resource-1',
        title: 'Understanding Anxiety: A Comprehensive Guide',
        description: 'Learn about anxiety and effective management strategies',
        category: 'Mental Health',
        readTimeMinutes: 8,
        publishedDate: '2024-03-15'
      },
      {
        id: 'resource-3',
        title: 'Sleep Hygiene: Better Rest for Better Mental Health',
        description: 'Improve your sleep quality with these evidence-based tips',
        category: 'Self-Care',
        readTimeMinutes: 6,
        publishedDate: '2024-03-08'
      }
    ]
  }
];

// Helper function to get a resource by ID
export function getResourceById(id: string): DummyResource | undefined {
  return DUMMY_RESOURCES.find(resource => resource.id === id);
}

// Helper function to get resources by category
export function getResourcesByCategory(category: string): DummyResource[] {
  return DUMMY_RESOURCES.filter(resource => resource.category === category);
}

// Helper function to get related resources
export function getRelatedResources(resourceId: string, limit: number = 3): DummyResource[] {
  const currentResource = getResourceById(resourceId);
  if (!currentResource) return [];

  // Get resources from the same category, excluding the current resource
  const categoryResources = DUMMY_RESOURCES.filter(
    resource => resource.category === currentResource.category && resource.id !== resourceId
  );

  // If we need more resources, add from other categories
  if (categoryResources.length < limit) {
    const otherResources = DUMMY_RESOURCES.filter(
      resource => resource.category !== currentResource.category && resource.id !== resourceId
    );
    return [...categoryResources, ...otherResources].slice(0, limit);
  }

  return categoryResources.slice(0, limit);
}

// Helper function to format resources for ResourceSectionBlock
export function formatResourcesForSection(resources: DummyResource[]) {
  return resources.map(resource => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    image: resource.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    category: resource.category,
    readTime: `${resource.readTimeMinutes} min read`,
    date: resource.publishedDate,
    author: resource.author,
    slug: resource.id
  }));
}
