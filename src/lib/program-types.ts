/**
 * PHASE 3: PROGRAMS SCHEMA
 * Schema for Equips, Days, Blocks, and Datasets.
 * This separates Program Logic from Content.
 */

import { ContentCategory } from './cms-types';

// ------------------------------------------------------------------
// ENUMS (Locked)
// ------------------------------------------------------------------

export type EquipStatus = 'draft' | 'published' | 'archived';

export type BlockType = 
  | 'lesson'
  | 'exercise'
  | 'table'
  | 'journal'
  | 'checklist'
  | 'reflection';

export type DatasetType = 
  | 'mcq'
  | 'multi_select'
  | 'table'
  | 'journal'
  | 'checklist';

export type SeverityLevel = 'low' | 'mild' | 'moderate' | 'high';

// ------------------------------------------------------------------
// CORE ENTITIES
// ------------------------------------------------------------------

/**
 * TABLE: equips
 * Represents a structured program (e.g., Sleep Well, Stress, Unburn).
 */
export interface Equip {
  id: string; // UUID
  slug: string; // Unique
  name: string;

  category: ContentCategory;

  duration_days: number;
  price_cents: number;

  status: EquipStatus;

  intro_content_id?: string; // FK -> ContentItem (About, What to expect)

  created_at: string; // ISO Date
  updated_at: string; // ISO Date
}

/**
 * TABLE: equip_days
 * Defines the timeline of an Equip.
 */
export interface EquipDay {
  id: string; // UUID
  equip_id: string; // FK -> Equip

  day_number: number;
  title: string;
  estimated_time_minutes: number;

  is_repeatable: boolean;
  repeat_start_day?: number;
  repeat_end_day?: number;

  created_at: string; // ISO Date
}

/**
 * TABLE: equip_blocks
 * Defines what happens inside a day.
 */
export interface EquipBlock {
  id: string; // UUID
  equip_day_id: string; // FK -> EquipDay

  block_type: BlockType;
  order_index: number;

  content_ref_id?: string; // Optional FK -> ContentItem (for text content)
  dataset_id?: string;     // FK -> EquipBlockDataset (for structured interaction)

  is_required: boolean;

  created_at: string; // ISO Date
}

/**
 * TABLE: equip_block_datasets
 * Structured schemas for interactions (replacing i01-i12).
 */
export interface EquipBlockDataset {
  id: string; // UUID
  dataset_key: string; // Unique, e.g., thought_log, sleep_diary
  
  dataset_type: DatasetType;
  
  // JSON Schema defining the structure of the data collection
  // e.g., columns for a table, choices for an MCQ
  schema: Record<string, any>; 

  created_at: string; // ISO Date
}

/**
 * TABLE: equip_recommendation_rules
 * Logic for recommending equips based on assessment.
 */
export interface RecommendationRule {
  id: string; // UUID
  assessment_category: string; // 'anxiety', 'sleep', 'stress', 'burnout'
  min_severity: SeverityLevel;
  equip_id: string; // FK -> Equip
  priority: number; // Lower = Higher priority
  rationale: string;
  created_at: string;
}

// ------------------------------------------------------------------
// HELPER TYPES
// ------------------------------------------------------------------

export interface EquipWithDays extends Equip {
  days: EquipDayWithBlocks[];
}

export interface EquipDayWithBlocks extends EquipDay {
  blocks: EquipBlock[];
}

export interface RecommendationResult {
  equip_id: string;
  equip_name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}
