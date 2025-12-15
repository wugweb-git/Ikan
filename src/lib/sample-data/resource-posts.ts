import { ResourcePost } from '../../components/blocks/ResourceCard';

// Sample mental health resource posts
export const mentalHealthResourcePosts: ResourcePost[] = [
  {
    id: 'understanding-anxiety',
    title: 'Understanding Anxiety: Signs, Symptoms, and Coping Strategies',
    description: 'Learn to recognize the signs of anxiety and discover evidence-based techniques to manage anxious thoughts and feelings in daily life.',
    date: 'December 1, 2024',
    category: 'Anxiety',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop',
    slug: 'understanding-anxiety',
    author: 'Dr. Sarah Johnson'
  },
  {
    id: 'mindfulness-beginners',
    title: 'Mindfulness for Beginners: A Practical Guide',
    description: 'Start your mindfulness journey with simple, practical exercises that can help reduce stress and increase present-moment awareness.',
    date: 'November 28, 2024',
    category: 'Mindfulness',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
    slug: 'mindfulness-beginners',
    author: 'Emma Williams'
  },
  {
    id: 'sleep-mental-health',
    title: 'The Connection Between Sleep and Mental Health',
    description: 'Discover how quality sleep impacts your mental wellbeing and learn strategies to improve your sleep hygiene for better mental health.',
    date: 'November 25, 2024',
    category: 'Wellness',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=800&auto=format&fit=crop',
    slug: 'sleep-mental-health',
    author: 'Dr. Michael Chen'
  },
  {
    id: 'managing-depression',
    title: 'Managing Depression: Small Steps to Better Days',
    description: 'Practical tips and evidence-based strategies for managing depression symptoms and building momentum toward recovery.',
    date: 'November 20, 2024',
    category: 'Depression',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop',
    slug: 'managing-depression',
    author: 'Dr. Sarah Johnson'
  },
  {
    id: 'therapy-types',
    title: 'Different Types of Therapy: Finding What Works for You',
    description: 'Explore various therapeutic approaches including CBT, DBT, and psychodynamic therapy to find the best fit for your needs.',
    date: 'November 15, 2024',
    category: 'Therapy',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop',
    slug: 'therapy-types',
    author: 'Emma Williams'
  },
  {
    id: 'self-care-routine',
    title: 'Building a Sustainable Self-Care Routine',
    description: 'Create a personalized self-care routine that fits your lifestyle and supports your mental health goals.',
    date: 'November 10, 2024',
    category: 'Self-Care',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
    slug: 'self-care-routine',
    author: 'Dr. Michael Chen'
  }
];

// Helper function to get latest posts
export function getLatestResourcePosts(count: number = 3): ResourcePost[] {
  return mentalHealthResourcePosts.slice(0, count);
}

// Helper function to get posts by category
export function getResourcePostsByCategory(category: string): ResourcePost[] {
  return mentalHealthResourcePosts.filter(post => 
    post.category?.toLowerCase() === category.toLowerCase()
  );
}

// Helper function to get post by slug
export function getResourcePostBySlug(slug: string): ResourcePost | undefined {
  return mentalHealthResourcePosts.find(post => post.slug === slug);
}
