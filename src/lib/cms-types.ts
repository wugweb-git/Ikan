/**
 * PHASE 1: CMS SCHEMA
 * Backend-agnostic schema for Resources, Blogs, Guides, and Articles.
 * This is the SINGLE SOURCE OF TRUTH for content structure.
 */

// ------------------------------------------------------------------
// ENUMS (Locked)
// ------------------------------------------------------------------

export type ContentType = 'blog' | 'resource' | 'guide' | 'article';

export type ContentCategory = 
  | 'general'
  | 'anxiety'
  | 'depression'
  | 'stress'
  | 'burnout'
  | 'sleep'
  | 'balance'
  | 'focus'
  | 'resilience'
  | 'motivation'
  | 'habits'
  | 'mindfulness'
  | 'energy'
  | 'relationships'
  | 'confidence';

export type ContentStatus = 'draft' | 'published' | 'archived';

// ------------------------------------------------------------------
// CORE ENTITIES
// ------------------------------------------------------------------

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
}

export interface ContentTag {
  id: string;
  name: string;
}

export interface ContentItem {
  // Identification
  id: string; // UUID
  slug: string; // Unique, SEO friendly
  
  // Core Content
  title: string;
  summary: string; // Short intro for SEO/Cards
  body: string; // Rich text or Markdown
  
  // Classification
  content_type: ContentType;
  category: ContentCategory;
  tags?: ContentTag[]; // Optional
  
  // Metadata
  status: ContentStatus;
  cover_image_url?: string;
  reading_time?: number; // In minutes
  author_id?: string;
  author?: Author; // Hydrated author object
  
  // Timestamps
  published_at?: string; // ISO Date
  created_at: string; // ISO Date
  updated_at: string; // ISO Date
}

// ------------------------------------------------------------------
// HELPER TYPES (For API Responses)
// ------------------------------------------------------------------

export interface ContentListResponse {
  items: ContentItem[];
  total: number;
  page: number;
  limit: number;
}
