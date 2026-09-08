/**
 * SERVER TYPES — owned here.
 *
 * The header used to read "Copied from lib/cms-types.ts and lib/program-types.ts".
 * **Both of those files are gone** (checked 2026-09-04), so this stopped being a
 * copy some time ago and became the only definition — while still describing
 * itself as a duplicate of something that no longer exists. A file that claims
 * to be a copy invites someone to "resync" it with a source that isn't there.
 *
 * OWNERSHIP: this file owns the CMS and programme types used by the edge
 * function. Nothing outside `server/` defines them.
 *
 * The constraint that produced it is still real, and is the reason to keep
 * server-side types here rather than in `src/lib/`: the function is deployed by
 * copying `src/supabase/functions/server/*` into a staging directory (BUILD.md),
 * so anything it imports from outside that directory is simply not deployed.
 * `validation-core.ts` is the companion case — shared with the browser, and
 * placed under `server/` for exactly this reason.
 */

// ==================================================================
// CMS TYPES
// ==================================================================

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
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  content_type: ContentType;
  category: ContentCategory;
  tags?: ContentTag[];
  status: ContentStatus;
  cover_image_url?: string;
  reading_time?: number;
  author_id?: string;
  author?: Author;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================================================================
// PROGRAM TYPES
// ==================================================================

export type EquipStatus = 'draft' | 'published' | 'archived';

export type BlockType = 
  | 'lesson'
  | 'exercise'
  | 'journal'
  | 'checklist'
  | 'reflection'
  | 'conclude'
  | 'sleep-diary'
  | 'table'   // legacy alias
  | 'quiz'    // legacy alias
  | 'text';   // legacy alias

export type DatasetType = 
  | 'mcq'
  | 'single-select'
  | 'multi-select'
  | 'table'
  | 'input-table'
  | 'structured-list'
  | 'clinical_instrument'
  | 'rating_scale'
  | 'likert'
  | 'comparison_matrix'
  | 'ephemeral-journal'
  | 'multi_select'  // legacy alias
  | 'journal'       // legacy alias
  | 'checklist';    // legacy alias

/**
 * The five-term clinical vocabulary. Must stay in step with `SEVERITY_LEVELS`
 * in `src/lib/scoring-engine.ts` — the edge function is deployed as a flat
 * directory copy and cannot import across it, so this is a deliberate
 * duplicate rather than a second opinion.
 *
 * It used to read `'low' | 'mild' | 'moderate' | 'high'`. Two of those are
 * response tiers from a different vocabulary, and the two real terms it was
 * missing — `minimal` and `moderately-severe` — are both live in the data.
 * Five recommendation rules are gated at `moderately-severe`; because this
 * type did not admit the term, nothing flagged that the rank table had no
 * entry for it, and those five rules silently never fired.
 */
/**
 * The clinical vocabulary, 5 ordered terms — the same list as
 * `SEVERITY_LEVELS` in `src/lib/scoring-engine.ts`. Verified identical
 * 2026-09-04. It is duplicated rather than imported because of the deploy
 * constraint described in the file header, so if one changes the other must.
 */
export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';

export interface Equip {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image_url?: string;
  category: ContentCategory;
  tags?: string[];
  duration_days?: number;
  duration_weeks?: number;
  price_cents: number;
  status: EquipStatus;
  intro_content_id?: string;
  onboarding?: {
    id?: string;
    title?: string;
    description?: string;
    is_required_before_start?: boolean;
    version?: string;
    sections?: any[];
    questions: Array<{
      id: string;
      text: string;
      type: string;
      options?: any[];
      required?: boolean;
      scaleMin?: number;
      scaleMax?: number;
      scaleLabels?: { min?: string; max?: string };
    }>;
  };
  created_at: string;
  updated_at: string;
}

export interface EquipDay {
  id: string;
  equip_id: string;
  day_number: number;
  title: string;
  estimated_time_minutes: number;
  is_repeatable: boolean;
  repeat_start_day?: number;
  repeat_end_day?: number;
  created_at: string;
}

export interface EquipBlock {
  id: string;
  equip_day_id: string;
  block_type: BlockType;
  title?: string;
  order_index: number;
  content_ref_id?: string;
  content?: string; // Inline content override
  dataset_id?: string;
  exercise_config?: Record<string, any>; // Flexible config
  is_required: boolean;
  step_group_id?: string;
  auto_advance?: boolean;
  estimated_time_minutes?: number;
  image_url?: string;
  created_at: string;
}

export interface EquipBlockDataset {
  id: string;
  dataset_key: string;
  dataset_type: DatasetType;
  schema: Record<string, any>; 
  created_at: string;
}

export interface RecommendationRule {
  id: string;
  assessment_category: string;
  min_severity: SeverityLevel;
  equip_id?: string;  // Legacy — use target_id instead
  recommendation_type?: 'equip' | 'resource' | 'assessment';
  target_id?: string;
  priority: number;
  /**
   * The author's internal note. **Never rendered to a user** — the live rows
   * hold clinician shorthand ("Awareness of overload"). Use `body`.
   */
  rationale: string;
  /** Authored copy. A rule missing any of the three cannot match — see
   *  `hasResolvableTarget` in `recommendation-matching.ts`. */
  title?: string;
  body?: string;
  cta?: string;
  /** Absent means enabled. Honoured by both engines via `eligibleRules`. */
  enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EquipWithDays extends Equip {
  days: EquipDayWithBlocks[];
}

export interface EquipDayWithBlocks extends EquipDay {
  blocks: EquipBlock[];
}

export interface RecommendationResult {
  equip_id: string;
  /**
   * The programme's name, under three keys, because the two consumers read
   * different ones: the dashboard re-fetches by `equip_id` and ignores this,
   * while `EquipProgramCompletion` reads `title`/`name` and so displayed the
   * literal "Recommended Program" on every card for as long as this endpoint
   * has returned only `equip_name`.
   */
  equip_name: string;
  title: string;
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  /** Authored copy from the rule's `body`, never its `rationale`. */
  description: string;
  reason: string;
}