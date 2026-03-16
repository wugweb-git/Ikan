/**
 * ⚠️ LEGACY CONSTANTS – DO NOT IMPORT IN COMPONENTS
 *
 * These lists were the original hardcoded metadata before the KV-backed
 * Metadata Manager (AdminCategoryManager) was built.
 *
 * The single source of truth for categories, content types, and filter types
 * is now KV (prefix `category:`), consumed via the `useMetadata()` hook
 * from `/hooks/useMetadata.ts`.
 *
 * These arrays are kept ONLY for:
 *   - Historical reference
 *   - Potential one-time migration/seeding scripts
 *
 * If you need category/type data in a component, use:
 *   import { useMetadata } from '../hooks/useMetadata';
 *   const { categories, contentTypes, filterTypes } = useMetadata();
 */

export const RESOURCE_CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Anxiety', value: 'anxiety' },
  { label: 'Depression', value: 'depression' },
  { label: 'Stress', value: 'stress' },
  { label: 'Burnout', value: 'burnout' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Balance', value: 'balance' },
  { label: 'Focus', value: 'focus' },
  { label: 'Resilience', value: 'resilience' },
  { label: 'Motivation', value: 'motivation' },
  { label: 'Habits', value: 'habits' },
  { label: 'Mindfulness', value: 'mindfulness' },
  { label: 'Energy', value: 'energy' },
  { label: 'Relationships', value: 'relationships' },
  { label: 'Confidence', value: 'confidence' }
];

export const CMS_CONTENT_TYPES = [
  { label: 'Blog', value: 'blog' },
  { label: 'Resource', value: 'resource' },
  { label: 'Guide', value: 'guide' },
  { label: 'Article', value: 'article' }
];

export const CMS_STATUS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
];

// Legacy Resource Types (Keeping for backward compatibility until migration)
export const RESOURCE_TYPES = [
  { label: 'Article', value: 'article', icon: 'file-text' },
  { label: 'Tool', value: 'tool', icon: 'tool' },
  { label: 'Exercise', value: 'exercise', icon: 'activity' },
  { label: 'Video', value: 'video', icon: 'video' },
  { label: 'Audio', value: 'audio', icon: 'mic' },
  { label: 'Podcast', value: 'podcast', icon: 'mic' },
  { label: 'Workbook', value: 'workbook', icon: 'book' },
  { label: 'Guide', value: 'guide', icon: 'book' },
  { label: 'Course', value: 'course', icon: 'graduation-cap' }
];

export const CONTENT_TYPES = [
  'Assessment', 'Equip', 'Program', 'Resource', 'General'
];