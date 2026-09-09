/**
 * Metadata Catalog
 *
 * Renamed from metadata-seed.ts (2026-08-06) — "seed" implied something that
 * runs automatically; it doesn't. This is the CANONICAL catalog of every
 * admin-configurable metadata type (labels, icons, groupings, and reference
 * values), read only when an admin explicitly clicks "Sync All" in
 * AdminCategoryManager and confirms a dialog. Nothing here executes on page
 * load, app start, or build.
 *
 * Once synced, KV (`category:` records) is the single source of truth —
 * components read live data via the useMetadata() hook, never this file
 * directly, except AdminCategoryManager itself (labels/icons/groups for the
 * tab UI) and the sync action.
 */

export type MetadataType =
  | 'category'
  | 'content_type'
  | 'filter_type'
  | 'interaction_type'
  | 'block_type'
  | 'difficulty_level'
  | 'consultant_type'
  | 'language'
  | 'therapeutic_approach'
  | 'demographic_specialty'
  | 'expertise_category'
  | 'session_format'
  | 'assessment_type'
  | 'media_type'
  | 'ema_category'
  | 'scoring_method'
  /**
   * Clinical severity, 5 ordered terms (PHQ-9/GAD-7 convention).
   * `low` and `high` used to live here too; they are a different, coarser
   * family and now live in `response_tier`. They were never a single scale:
   * `minimal` and `low` shared both colour and icon because they were one
   * tier under two names, and no row carried an `order`, so the seven-way
   * ordering existed only as a lookup table in recommendation-engine.ts.
   */
  | 'severity_level'
  /** What the product does about a score. Drives tone and copy, 3 ordered. */
  | 'response_tier'
  | 'account_type'
  | 'day_config_type'
  /**
   * What the user DOES in a block. Renamed from `exercise_subtype` on
   * 2026-09-04 (blocks.md §18 Phase 1.2) — a subtype named a shape, an
   * activity names an action. All 12 rows carry this name; zero carry the old
   * one.
   */
  | 'activity'
  | 'checkin_block_type';

// ═══════════════════════════════════════════════════════════════
// Hierarchy / Grouping — organise metadata types by domain
// Used by AdminCategoryManager to display grouped tabs
// ═══════════════════════════════════════════════════════════════
export interface MetadataGroup {
  key: string;
  label: string;
  icon: string;
  description: string;
  types: MetadataType[];
}

export const METADATA_TYPE_GROUPS: MetadataGroup[] = [
  {
    key: 'content',
    label: 'Content & Topics',
    icon: 'file-text',
    description: 'Categories, types, and formats for content across the platform',
    types: ['category', 'content_type', 'filter_type', 'media_type'],
  },
  {
    key: 'programs',
    label: 'Programs & Blocks',
    icon: 'blocks',
    description: 'Block types, interactions, activities, and day configurations',
    types: ['block_type', 'interaction_type', 'activity', 'day_config_type', 'difficulty_level'],
  },
  {
    key: 'assessments',
    label: 'Assessments & Scoring',
    icon: 'clipboard-list',
    description: 'Assessment types, scoring methods, severity levels, and check-in categories',
    types: ['assessment_type', 'scoring_method', 'severity_level', 'response_tier', 'ema_category', 'checkin_block_type'],
  },
  {
    key: 'consultants',
    label: 'Consultants & Therapy',
    icon: 'stethoscope',
    description: 'Consultant specialisations, therapy approaches, and session formats',
    types: ['consultant_type', 'therapeutic_approach', 'demographic_specialty', 'expertise_category', 'session_format', 'language'],
  },
  {
    key: 'users',
    label: 'Users & Accounts',
    icon: 'users',
    description: 'Account types',
    types: ['account_type'],
  },
];

// ═══════════════════════════════════════════════════════════════
// Human-readable labels for each metadata type (for admin UI tabs)
// ═══════════════════════════════════════════════════════════════
export const METADATA_TYPE_LABELS: Record<MetadataType, string> = {
  category: 'Topic Categories',
  content_type: 'Content Types',
  filter_type: 'Content Formats',
  interaction_type: 'Interaction Types',
  block_type: 'Block Types',
  difficulty_level: 'Difficulty Levels',
  consultant_type: 'Consultant Types',
  language: 'Languages',
  therapeutic_approach: 'Therapeutic Approaches',
  demographic_specialty: 'Demographic Specialties',
  expertise_category: 'Issues Addressed',
  session_format: 'Session Formats',
  assessment_type: 'Assessment Types',
  media_type: 'Media Types',
  ema_category: 'Check-in Categories',
  scoring_method: 'Scoring Methods',
  severity_level: 'Severity Levels',
  response_tier: 'Response Tiers',
  account_type: 'Account Types',
  day_config_type: 'Day Config Types',
  activity: 'Activities',
  checkin_block_type: 'Check-in Block Types',
};

export const METADATA_TYPE_ICONS: Record<MetadataType, string> = {
  category: 'folder',
  content_type: 'file-text',
  filter_type: 'filter',
  interaction_type: 'mouse-pointer-click',
  block_type: 'layout-grid',
  difficulty_level: 'signal',
  consultant_type: 'stethoscope',
  language: 'globe',
  therapeutic_approach: 'heart-handshake',
  demographic_specialty: 'users',
  expertise_category: 'shield-check',
  session_format: 'video',
  assessment_type: 'clipboard-list',
  media_type: 'image',
  ema_category: 'activity',
  scoring_method: 'bar-chart',
  severity_level: 'signal',
  response_tier: 'trending-up',
  account_type: 'user-check',
  day_config_type: 'calendar',
  activity: 'pen-tool',
  checkin_block_type: 'smile',
};

/**
 * All valid icon keys that can be stored in KV and rendered in admin UI.
 * Maps to lucide-react component names (kebab-case).
 */
export const ALL_ICON_KEYS = [
  'folder', 'folder-open', 'file-text', 'file', 'file-check',
  'tag', 'tags', 'filter', 'type', 'sparkles',
  'shield', 'shield-check', 'shield-alert',
  'heart', 'heart-handshake', 'heart-pulse',
  'brain', 'activity', 'zap', 'flame', 'sun', 'moon', 'cloud', 'cloud-lightning',
  'target', 'compass', 'scale', 'balance',
  'smile', 'frown', 'meh', 'angry',
  'eye', 'ear', 'hand',
  'user', 'users', 'user-check', 'user-plus', 'baby', 'graduation-cap',
  'briefcase', 'building', 'school',
  'stethoscope', 'pill', 'thermometer', 'syringe',
  'globe', 'languages', 'map-pin',
  'video', 'phone', 'message-square', 'message-circle', 'monitor',
  'mic', 'headphones', 'music',
  'book', 'book-open', 'notebook', 'library',
  'image', 'camera', 'film',
  'clipboard', 'clipboard-list', 'clipboard-check',
  'list', 'list-checks', 'check-square', 'circle-check',
  'sliders-horizontal', 'toggle-left', 'toggle-right',
  'mouse-pointer-click', 'pointer',
  'layout-grid', 'layout-list', 'blocks',
  'signal', 'bar-chart', 'trending-up',
  'clock', 'timer', 'calendar',
  'link', 'paperclip',
  'lock', 'unlock', 'key',
  'alert-triangle', 'alert-circle', 'info',
  'refresh-cw', 'repeat', 'undo',
  'tool', 'wrench', 'settings',
  'palette', 'pen-tool', 'brush',
] as const;

// ═══════════════════════════════════════════════════════════════
// Seed data — consolidated from all previously hardcoded values
// Every item has an icon assigned for admin UI rendering
// ═══════════════════════════════════════════════════════════════

export interface SeedItem {
  name: string;
  slug: string;
  type: MetadataType;
  icon?: string;
  color?: string;
  description?: string;
  /**
   * Rank within its type, low to high. Required on ordered vocabularies
   * (`severity_level`, `response_tier`) so the ordering lives in the catalog
   * rather than in a lookup table someone wrote by hand.
   */
  order?: number;
  /*
    `can_hold` was here. Removed 2026-09-08 — no block holds another block.

    It has to leave the SEED, not just the store: the sync now writes everything
    the catalog declares, so leaving it here would have restored `can_hold` on
    all 17 rows the next time anyone pressed Sync, silently undoing the removal.
    That is the cost of the whole-item merge, and this is the first thing it
    would have bitten.

    What a block type permits is `activities`, which every one of the 17 now
    carries.
  */
  /** `block_type` container rows: which activities its blocks may use. */
  activities?: string[];
  /**
   * For `severity_level` rows only: which `response_tier` this severity maps
   * to. The authoritative severity -> tier map, held as data so it is visible
   * and editable in the catalog UI. A scoring profile may override it per
   * instrument via `tier_map`.
   */
  tier?: string;
  /**
   * This vocabulary has been superseded and nothing reads it. Kept — a term
   * that is editable but dead must SAY so rather than be deleted — and carried
   * into KV so any reader, not just Meta Manager, can tell.
   */
  deprecated?: boolean;
  /**
   * The row's PERMANENT identifier. See `catalogId` below — an id is minted once
   * from the slug and then never regenerated, so this is what a rename must not
   * touch.
   */
  id: string;
  /**
   * Display rank within its type, low to high.
   *
   * Added 2026-09-08. No catalog row carried one, so display order was whatever
   * the store returned, which is why the Block Type Viewer had to sort
   * stages-then-blocks in code. Seeded here from the order these rows are
   * written in, which is the order the screens already showed.
   */
  sort_order: number;
}

/**
 * **A catalog id is minted once and then frozen. It is never regenerated.**
 *
 * Every row's id reads like its slug — `cat-block_type-tracker` — and that is
 * cosmetic and irrelevant. What matters is that the id is the row's identity
 * and the slug is its name. Rename `tracker` and `slug`/`name` change; the id
 * stays `cat-block_type-tracker` forever.
 *
 * This is the same distinction settled for block responses on 2026-09-08:
 * `activityConfig.key` gave an answer an identity independent of the block that
 * asked it. An id gives a type an identity independent of what it is called.
 *
 * It matters because the sync endpoint derives an id from the slug when an item
 * carries none (`index.tsx:3721`) and matches existing rows on `type::slug`. So
 * a slug rename in this file, with no id declared, would MINT A NEW ROW and
 * orphan the old one — silently, because 407 live blocks store the slug, not
 * the id, and nothing would report a break. Declaring the id here means the
 * sync uses it and the derivation never runs.
 *
 * `catalog-ids.test.ts` asserts the block_type / interaction_type / activity ids
 * exactly. Any future edit that would regenerate one fails there instead of
 * repointing content in production.
 */
function catalogId(type: MetadataType, slug: string): string {
  return `cat-${type}-${slug}`;
}

let _seq = 0;
function s(name: string, type: MetadataType, slug?: string, extra?: Partial<Omit<SeedItem, 'id' | 'sort_order'>> & { id?: string }): SeedItem {
  const resolvedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    name,
    slug: resolvedSlug,
    type,
    // Frozen at first mint. `extra.id` is how a row whose slug has since been
    // renamed keeps the id it was created with.
    id: extra?.id ?? catalogId(type, resolvedSlug),
    // Declaration order is the display order. Global rather than per-type
    // because it only ever has to be stable, and a global counter cannot
    // silently collide when a row moves between types.
    sort_order: (_seq += 10),
    ...extra,
  };
}

export const METADATA_CATALOG_ITEMS: SeedItem[] = [
  // ── Topic Categories ──────────────────────────────────────────
  s('General',       'category', 'general',       { icon: 'folder',          color: '#2A2A2A' }),
  s('Anxiety',       'category', 'anxiety',       { icon: 'cloud-lightning', color: '#EAB308' }),
  s('Depression',    'category', 'depression',    { icon: 'cloud',           color: '#3B82F6' }),
  s('Stress',        'category', 'stress',        { icon: 'flame',           color: '#D4183D' }),
  s('Burnout',       'category', 'burnout',       { icon: 'thermometer',     color: '#EF4444' }),
  s('Sleep',         'category', 'sleep',         { icon: 'moon',            color: '#6366F1' }),
  s('Insomnia',      'category', 'insomnia',      { icon: 'moon',            color: '#8B5CF6' }),
  s('Balance',       'category', 'balance',       { icon: 'scale',           color: '#22C55E' }),
  s('Focus',         'category', 'focus',         { icon: 'target',          color: '#F97316' }),
  s('Resilience',    'category', 'resilience',    { icon: 'shield',          color: '#14B8A6' }),
  s('Motivation',    'category', 'motivation',    { icon: 'zap',             color: '#EAB308' }),
  s('Habits',        'category', 'habits',        { icon: 'repeat',          color: '#22C55E' }),
  s('Mindfulness',   'category', 'mindfulness',   { icon: 'brain',           color: '#8B5CF6' }),
  s('Energy',        'category', 'energy',        { icon: 'activity',        color: '#F97316' }),
  s('Relationships', 'category', 'relationships', { icon: 'heart',           color: '#EC4899' }),
  s('Confidence',    'category', 'confidence',    { icon: 'sparkles',        color: '#EAB308' }),
  s('Wellness',      'category', 'wellness',      { icon: 'heart-pulse',     color: '#22C55E' }),
  s('Work-Life',     'category', 'work-life',     { icon: 'briefcase',       color: '#3B82F6' }),
  s('Mental Health', 'category', 'mental-health', { icon: 'brain',           color: '#8B5CF6' }),

  // ── Content Types ─────────────────────────────────────────────
  s('Blog',       'content_type', 'blog',       { icon: 'pen-tool' }),
  s('Resource',   'content_type', 'resource',   { icon: 'library' }),
  s('Guide',      'content_type', 'guide',      { icon: 'book-open' }),
  s('Article',    'content_type', 'article',    { icon: 'file-text' }),
  s('Assessment', 'content_type', 'assessment', { icon: 'clipboard-list' }),
  s('Equip',      'content_type', 'equip',      { icon: 'blocks' }),
  s('Program',    'content_type', 'program',    { icon: 'layout-grid' }),

  // ── Content Formats (filter_type) ─────────────────────────────
  s('Article',  'filter_type', 'article',  { icon: 'file-text' }),
  s('Tool',     'filter_type', 'tool',     { icon: 'tool' }),
  s('Exercise', 'filter_type', 'exercise', { icon: 'activity' }),
  s('Video',    'filter_type', 'video',    { icon: 'video' }),
  s('Audio',    'filter_type', 'audio',    { icon: 'headphones' }),
  s('Podcast',  'filter_type', 'podcast',  { icon: 'mic' }),
  s('Workbook', 'filter_type', 'workbook', { icon: 'notebook' }),
  s('Guide',    'filter_type', 'guide',    { icon: 'book' }),
  s('Course',   'filter_type', 'course',   { icon: 'graduation-cap' }),

  // ── Interaction Types ─────────────────────────────────────────
  // Must match all 13 InteractionType values from blocks/block-model.ts
  // (was "12" — stale since `number` joined the union 2026-09-04. The DATA was
  // always right: 13 rows here, 13 values there. Only the comment lied.)
  /*
    THE NINE. §26, 2026-09-09. This list REPLACES the seventeen.

    The old rows named widgets — `select-one`, `input-table`, `track-table` —
    which is why they kept multiplying: every new way of drawing something became
    a new "interaction". These name what the USER is doing, and an activity
    carries one or more of them.

    Every old row is retired. `catalog-ids.test.ts` freezes the ids these mint;
    the seventeen they replace are listed in `RETIRED_TERMS`.
  */
  s('Observe',  'interaction_type', 'observe',  { icon: 'eye',                 description: 'Taking content in — reading, listening, watching' }),
  s('Choose',   'interaction_type', 'choose',   { icon: 'list-checks',         description: 'Picking from what the app offers' }),
  s('Share',    'interaction_type', 'share',    { icon: 'pen-tool',            description: 'Giving their own words or figures' }),
  s('Locate',   'interaction_type', 'locate',   { icon: 'map-pin',             description: 'Naming a real-world point — when, where' }),
  s('Confirm',  'interaction_type', 'confirm',  { icon: 'circle-check',        description: 'Affirming — that something happened, or that they agree' }),
  s('Rate',     'interaction_type', 'rate',     { icon: 'sliders-horizontal',  description: 'Placing a value on a range' }),
  s('Order',    'interaction_type', 'order',    { icon: 'list',                description: 'Putting things in sequence' }),
  s('Measure',  'interaction_type', 'measure',  { icon: 'timer',               description: 'Bracketing a span the app times' }),
  s('Submit',   'interaction_type', 'submit',   { icon: 'upload',              description: 'Handing over an artefact — ownership changes' }),

  // ── Block Types (Equip/Program) ───────────────────────────────
  s('Lesson',      'block_type', 'lesson',      { icon: 'book-open',   description: 'Informational content block', activities: ['read', 'listen', 'view'] }),
  s('Exercise',    'block_type', 'exercise',    { icon: 'activity',    description: 'Interactive exercise block', activities: ['mcq', 'single-select', 'multi-select', 'input-table', 'comparison-matrix', 'table', 'structured-list', 'rating-scale', 'number', 'date-time', 'ranking', 'upload'] }),
  s('Journal',     'block_type', 'journal',     { icon: 'notebook',    description: 'Journaling / free-write prompt', activities: ['ephemeral-journal', 'short-text'] }),
  s('Checklist',   'block_type', 'checklist',   { icon: 'list-checks', description: 'Task checklist block', activities: ['structured-list'] }),
  s('Reflection',  'block_type', 'reflection',  { icon: 'brain',       description: 'Guided reflection prompt', activities: ['mcq', 'single-select', 'rating-scale', 'ephemeral-journal'] }),
  s('Conclude',    'block_type', 'conclude',    { icon: 'flag',        description: 'Session conclusion / summary', activities: ['complete'] }),
  s('Quiz',        'block_type', 'quiz',        { icon: 'circle-check', description: 'Knowledge check with scoring', activities: ['mcq', 'single-select', 'multi-select', 'rating-scale'] }),
  // Retained by decision 2026-09-04 rather than retired. It had been dropped
  // from the catalog while surviving in the code union, so it was unreachable
  // in the editor — a declared type nobody could pick. Restored, and retargeted
  // from `track-table` to `input-table` so the name matches what Sleep Tight's
  // 126 real diary blocks actually do.
  s('Sleep Diary', 'block_type', 'sleep-diary', { icon: 'moon', description: 'A day-by-day diary grid the user fills in with text', activities: ['input-table', 'date-time', 'table-review'] }),

  // ── Container rows: stages that HOLD blocks ─────────────────────
  // Merged in from `day_config_type` (blocks.md §18 Phase 1.1). These live
  // in the same bucket as leaf block types and are told apart by a non-empty
  // `can_hold`. They must be in THIS file, not only in KV: the seed is the
  // definition, KV is the deployment, and a re-seed from a file without them
  // silently wipes Phases 1.1 and 2.1.
  s('Onboarding', 'block_type', 'onboarding', { icon: 'flag', description: 'Day 0. First-time intro, consent, and orientation before the programme starts.', activities: ['mcq', 'single-select', 'multi-select', 'ephemeral-journal'] }),
  s('Assessment', 'block_type', 'assessment', { icon: 'clipboard-list', description: 'Baseline measurement, severity scoring, recommendations.', activities: ['mcq', 'single-select', 'clinical-instrument'] }),
  s('Learning', 'block_type', 'learning', { icon: 'book-open', description: 'Concept introduction and understanding.', activities: ['mcq', 'single-select'] }),
  s('Practice', 'block_type', 'practice', { icon: 'pen-tool', description: 'User data capture, reflection, application.', activities: ['multi-select', 'input-table', 'structured-list', 'upload', 'ephemeral-journal', 'comparison-matrix', 'number'] }),
  s('Workshop', 'block_type', 'workshop', { icon: 'hammer', description: 'Multi-step thinking (ideation, evaluation, rituals).', activities: ['multi-select', 'input-table', 'upload', 'ephemeral-journal', 'comparison-matrix'] }),
  s('Tracker', 'block_type', 'tracker', { icon: 'table', description: 'Daily repetition, habits, streaks.', activities: ['table', 'input-table', 'structured-list', 'rating-scale', 'comparison-matrix', 'number'] }),
  s('Check-In', 'block_type', 'check-in', { icon: 'smile', description: 'Quick daily mood/wellness check. 1-3 questions, no scoring.', activities: ['mcq', 'single-select', 'multi-select', 'rating-scale', 'ephemeral-journal'] }),
  /*
    `Rest Day` and `Assessment Lite` were block_type rows and are retired — §27
    step 6. Zero blocks carried either. Both remain DAY TEMPLATES; a rest day is
    a day with no task, not a kind of block.
  */

  // ── Difficulty Levels ─────────────────────────────────────────
  s('Beginner',     'difficulty_level', 'beginner',     { icon: 'signal',       color: '#22C55E' }),
  s('Intermediate', 'difficulty_level', 'intermediate', { icon: 'trending-up',  color: '#EAB308' }),
  s('Advanced',     'difficulty_level', 'advanced',     { icon: 'zap',          color: '#D4183D' }),

  // ── Consultant Types ──────────────────────────────────────────
  s('Therapist',             'consultant_type', 'therapist',             { icon: 'heart-handshake' }),
  s('Psychiatrist',          'consultant_type', 'psychiatrist',          { icon: 'stethoscope' }),
  s('Counselor',             'consultant_type', 'counselor',             { icon: 'message-circle' }),
  s('Family Therapist',      'consultant_type', 'family-therapist',      { icon: 'users' }),
  s('Clinical Psychologist', 'consultant_type', 'clinical-psychologist', { icon: 'brain' }),
  s('Life Coach',            'consultant_type', 'life-coach',            { icon: 'compass' }),

  // ── Languages ─────────────────────────────────────────────────
  s('English',   'language', 'english',   { icon: 'globe' }),
  s('Hindi',     'language', 'hindi',     { icon: 'globe' }),
  s('Tamil',     'language', 'tamil',     { icon: 'globe' }),
  s('Telugu',    'language', 'telugu',    { icon: 'globe' }),
  s('Kannada',   'language', 'kannada',   { icon: 'globe' }),
  s('Malayalam', 'language', 'malayalam', { icon: 'globe' }),
  s('Bengali',   'language', 'bengali',   { icon: 'globe' }),
  s('Marathi',   'language', 'marathi',   { icon: 'globe' }),
  s('Gujarati',  'language', 'gujarati',  { icon: 'globe' }),
  s('Punjabi',   'language', 'punjabi',   { icon: 'globe' }),
  s('Urdu',      'language', 'urdu',      { icon: 'globe' }),
  s('Odia',      'language', 'odia',      { icon: 'globe' }),

  // ── Therapeutic Approaches ────────────────────────────────────
  s('Cognitive Behavioral Therapy (CBT)',  'therapeutic_approach', 'cbt',              { icon: 'brain' }),
  s('Emotionally Focused Therapy (EFT)',   'therapeutic_approach', 'eft',              { icon: 'heart' }),
  s('Attachment-based Therapy',            'therapeutic_approach', 'attachment-based',  { icon: 'link' }),
  s('Trauma-informed Therapy',             'therapeutic_approach', 'trauma-informed',   { icon: 'shield-alert' }),
  s('Mindfulness-based Approaches',        'therapeutic_approach', 'mindfulness-based', { icon: 'sun' }),
  s('Narrative Therapy',                   'therapeutic_approach', 'narrative',          { icon: 'book-open' }),
  s('Solution-Focused Therapy',            'therapeutic_approach', 'solution-focused',  { icon: 'target' }),
  s('Person-Centered Therapy',             'therapeutic_approach', 'person-centered',   { icon: 'user-check' }),
  s('DBT Skills',                          'therapeutic_approach', 'dbt',               { icon: 'sliders-horizontal' }),
  s('Psychodynamic Therapy',               'therapeutic_approach', 'psychodynamic',     { icon: 'activity' }),
  s('EMDR',                                'therapeutic_approach', 'emdr',              { icon: 'eye' }),
  s('Art Therapy',                         'therapeutic_approach', 'art-therapy',       { icon: 'palette' }),
  s('Play Therapy',                        'therapeutic_approach', 'play-therapy',      { icon: 'baby' }),

  // ── Demographic Specialties ───────────────────────────────────
  s('Children',                'demographic_specialty', 'children',       { icon: 'baby' }),
  s('Adolescents',             'demographic_specialty', 'adolescents',    { icon: 'user' }),
  s('Adults',                  'demographic_specialty', 'adults',         { icon: 'user-check' }),
  s('Couples',                 'demographic_specialty', 'couples',        { icon: 'heart' }),
  s('LGBTQIA+ Clients',       'demographic_specialty', 'lgbtqia',        { icon: 'sparkles' }),
  s('Elderly Clients',         'demographic_specialty', 'elderly',        { icon: 'users' }),
  s('Neurodivergent Clients',  'demographic_specialty', 'neurodivergent', { icon: 'brain' }),
  s('Corporate Professionals', 'demographic_specialty', 'corporate',      { icon: 'briefcase' }),
  s('Parents',                 'demographic_specialty', 'parents',        { icon: 'users' }),
  s('Students',                'demographic_specialty', 'students',       { icon: 'graduation-cap' }),
  s('Families',                'demographic_specialty', 'families',       { icon: 'users' }),

  // ── Expertise / Issues Addressed ──────────────────────────────
  s('Relationship Skills',   'expertise_category', 'relationship-skills',  { icon: 'heart' }),
  s('Communication Skills',  'expertise_category', 'communication-skills', { icon: 'message-circle' }),
  s('Parenting Support',     'expertise_category', 'parenting-support',    { icon: 'baby' }),
  s('LGBTQIA+ Concerns',    'expertise_category', 'lgbtqia-concerns',     { icon: 'sparkles' }),
  s('Couples Therapy',       'expertise_category', 'couples-therapy',      { icon: 'heart-handshake' }),
  s('Stress Management',     'expertise_category', 'stress-management',    { icon: 'flame' }),
  s('Anxiety',               'expertise_category', 'anxiety',              { icon: 'cloud-lightning' }),
  s('Depression',            'expertise_category', 'depression',           { icon: 'cloud' }),
  s('Trauma',                'expertise_category', 'trauma',               { icon: 'shield-alert' }),
  s('Grief & Loss',          'expertise_category', 'grief-loss',           { icon: 'frown' }),
  s('Self-Esteem',           'expertise_category', 'self-esteem',          { icon: 'sparkles' }),
  s('Life Transitions',      'expertise_category', 'life-transitions',     { icon: 'compass' }),
  s('Anger Management',      'expertise_category', 'anger-management',     { icon: 'angry' }),
  s('Work-related Concerns', 'expertise_category', 'work-related',         { icon: 'briefcase' }),
  s('Academic Concerns',     'expertise_category', 'academic-concerns',    { icon: 'graduation-cap' }),
  s('Anxiety Disorders',     'expertise_category', 'anxiety-disorders',    { icon: 'alert-triangle' }),
  s('Depressive Disorders',  'expertise_category', 'depressive-disorders', { icon: 'cloud' }),
  s('PTSD',                  'expertise_category', 'ptsd',                 { icon: 'shield-alert' }),
  s('Sleep Disorder',        'expertise_category', 'sleep-disorder',       { icon: 'moon' }),
  s('OCD',                   'expertise_category', 'ocd',                  { icon: 'repeat' }),
  s('Eating Disorders',      'expertise_category', 'eating-disorders',     { icon: 'alert-circle' }),

  // ── Session Formats ───────────────────────────────────────────
  s('Video Call', 'session_format', 'video',     { icon: 'video' }),
  s('Voice Call', 'session_format', 'call',      { icon: 'phone' }),
  s('Chat',       'session_format', 'chat',      { icon: 'message-square' }),
  s('In-Person',  'session_format', 'in-person', { icon: 'map-pin' }),

  // ── Assessment Types ──────────────────────────────────────────
  s('Standard Assessment', 'assessment_type', 'standard',        { icon: 'clipboard-list' }),
  s('Clinical Screening',  'assessment_type', 'clinical',        { icon: 'clipboard-check' }),
  s('Self Reflection',     'assessment_type', 'self-reflection', { icon: 'brain' }),

  // ── Media Types ───────────────────────────────────────────────
  s('Image',    'media_type', 'image',    { icon: 'image' }),
  s('Video',    'media_type', 'video',    { icon: 'film' }),
  s('Audio',    'media_type', 'audio',    { icon: 'headphones' }),
  s('Document', 'media_type', 'document', { icon: 'file-text' }),
  s('PDF',      'media_type', 'pdf',      { icon: 'file-check' }),

  // ── EMA / Check-in Categories ─────────────────────────────────
  s('Mood',            'ema_category', 'mood',            { icon: 'smile',               description: 'Emotional state tracking' }),
  s('Energy',          'ema_category', 'energy',          { icon: 'zap',                 description: 'Energy level assessment' }),
  s('Stress',          'ema_category', 'stress',          { icon: 'flame',               description: 'Stress level tracking' }),
  s('Sleep',           'ema_category', 'sleep',           { icon: 'moon',                description: 'Sleep quality assessment' }),
  s('Pain Experience', 'ema_category', 'pain-experience', { icon: 'thermometer',         description: 'Pain severity tracking' }),
  s('Pain Impact',     'ema_category', 'pain-impact',     { icon: 'activity',            description: 'How pain affects daily life' }),
  s('Anxiety',         'ema_category', 'anxiety',         { icon: 'cloud-lightning',     description: 'Anxiety level monitoring' }),
  s('Social',          'ema_category', 'social',          { icon: 'users',               description: 'Social interaction quality' }),
  s('Activity',        'ema_category', 'activity',        { icon: 'heart-pulse',         description: 'Physical activity tracking' }),
  s('Nutrition',       'ema_category', 'nutrition',       { icon: 'apple',               description: 'Nutritional intake awareness' }),
  s('Custom',          'ema_category', 'custom',          { icon: 'sparkles',            description: 'Custom check-in category' }),

  // ── Scoring Methods ────────────────────────────────────────────
  s('Sum',      'scoring_method', 'sum',      { icon: 'bar-chart',   description: 'Add up all response scores' }),
  s('Average',  'scoring_method', 'average',  { icon: 'trending-up', description: 'Mean of all response scores' }),
  s('Weighted', 'scoring_method', 'weighted', { icon: 'scale',       description: 'Weighted sum based on question importance' }),
  s('Custom',   'scoring_method', 'custom',   { icon: 'sparkles',    description: 'Custom scoring logic per assessment' }),

  // ── Severity Levels ────────────────────────────────────────────
  // Clinical severity — 5 terms, ordered. A band's `severity_ref` points here.
  s('Minimal',           'severity_level', 'minimal',           { tier: 'low', order: 0, icon: 'circle-check',    color: '#22C55E', description: 'No significant concerns' }),
  s('Mild',              'severity_level', 'mild',              { tier: 'low', order: 1, icon: 'activity',        color: '#3B82F6', description: 'Mild symptoms present' }),
  s('Moderate',          'severity_level', 'moderate',          { tier: 'moderate', order: 2, icon: 'alert-triangle',  color: '#EAB308', description: 'Moderate symptoms — consider guided support' }),
  s('Moderately Severe', 'severity_level', 'moderately-severe', { tier: 'high', order: 3, icon: 'alert-triangle',  color: '#F97316', description: 'Significant symptoms — guided program recommended' }),
  s('Severe',            'severity_level', 'severe',            { tier: 'high', order: 4, icon: 'shield-alert',    color: '#D4183D', description: 'Severe symptoms — professional help strongly recommended' }),

  // Response tier — 3 terms, ordered. Derived from severity via the tier map
  // (default in scoring-engine.ts, overridable per scoring profile). `low` and
  // `high` moved here out of severity_level; `moderate` exists in both, which
  // is fine — they are different types.
  s('Low',               'response_tier',  'low',               { order: 0, icon: 'circle-check',    color: '#22C55E', description: 'Self-monitoring suggested' }),
  s('Moderate',          'response_tier',  'moderate',          { order: 1, icon: 'alert-triangle',  color: '#EAB308', description: 'Guided support suggested' }),
  s('High',              'response_tier',  'high',              { order: 2, icon: 'alert-circle',    color: '#EF4444', description: 'Structured support recommended' }),

  // ── Account Types ──────────────────────────────────────────────
  s('User',       'account_type', 'user',       { icon: 'user',       color: '#22C55E', description: 'Standard user account' }),
  s('Admin',      'account_type', 'admin',      { icon: 'shield',     color: '#EAB308', description: 'Platform administrator' }),
  s('Corporate',  'account_type', 'corporate',  { icon: 'briefcase',  color: '#3B82F6', description: 'Corporate/enterprise user' }),
  s('Premium',    'account_type', 'premium',    { icon: 'sparkles',   color: '#8B5CF6', description: 'Premium subscription user' }),

  // ── Day Config Types ───────────────────────────────────────────
  // Must match all 10+ DAY_TYPE_PRESETS from blocks/block-type-rules.ts
  s('Onboarding',     'day_config_type', 'onboarding',     { deprecated: true, icon: 'zap',             color: '#F59E0B', description: 'First-time intro, consent, and orientation' }),
  s('Assessment',     'day_config_type', 'assessment',     { deprecated: true, icon: 'clipboard-list',  color: '#8B5CF6', description: 'Baseline measurement, severity scoring' }),
  s('Assessment Lite','day_config_type', 'assessment-lite',{ deprecated: true, icon: 'clipboard-check', color: '#A78BFA', description: 'Awareness, non-scored check-ins' }),
  s('Learning',       'day_config_type', 'learning',       { deprecated: true, icon: 'book-open',       color: '#2A2A2A', description: 'Concept introduction and understanding' }),
  s('Practice',       'day_config_type', 'practice',       { deprecated: true, icon: 'pen-tool',        color: '#22C55E', description: 'User data capture, reflection, application' }),
  s('Reflection',     'day_config_type', 'reflection',     { deprecated: true, icon: 'brain',           color: '#3B82F6', description: 'Closure, sense-making, review' }),
  s('Rest',           'day_config_type', 'rest',           { deprecated: true, icon: 'moon',            color: '#9CA3AF', description: 'No active tasks, optional motivation' }),
  s('Quiz',           'day_config_type', 'quiz',           { deprecated: true, icon: 'circle-check',    color: '#F59E0B', description: 'Knowledge check with scoring, tests retention' }),
  s('Check-In',       'day_config_type', 'check-in',       { deprecated: true, icon: 'heart-pulse',     color: '#EC4899', description: 'Quick mood/wellness check with rating' }),
  s('Tracker',        'day_config_type', 'tracker',        { deprecated: true, icon: 'repeat',          color: '#10B981', description: 'Daily repetition, habits, streaks' }),
  s('Workshop',       'day_config_type', 'workshop',       { deprecated: true, icon: 'blocks',          color: '#6366F1', description: 'Multi-step thinking (ideation, evaluation)' }),

  // ── Activities ─────────────────────────────────────────────────
  // Renamed from "Exercise Subtypes" 2026-09-04; the type is `activity` and the
  // label is "Activities" everywhere. This heading was the last place the old
  // name survived, which is how a reader ends up believing there are two lists.
  //
  // THE IDS STILL READ `cat-exercise_subtype-*`, AND THAT IS CORRECT.
  //
  // All 12 live rows carry `type: 'activity'` with these slugs, so the sync's
  // `type::slug` lookup matches every one and updates it — nothing forks, and
  // no second vocabulary exists. Only the KEY kept the name the rows were
  // created under.
  //
  // Which is the rule working, not a leftover: an id is minted once and must
  // survive a rename, exactly as `activityConfig.key` gives an answer an
  // identity independent of the block that asked it. Declaring
  // `cat-activity-mcq` here — as this file briefly did — described rows that do
  // not exist, and on the create path would mint a duplicate under a second id.
  //
  // Do not "tidy" these to match the type. `catalog-ids.test.ts` pins them.
  s('Read',                 'activity', 'read',                 { icon: 'book-open',           description: 'Formatted prose, optionally above media' }),
  s('Listen',               'activity', 'listen',               { icon: 'headphones',          description: 'An audio track. No renderer yet.' }),
  s('View',                 'activity', 'view',                 { icon: 'film',                description: 'Embedded video or image' }),
  s('Table Review',         'activity', 'table-review',         { icon: 'table',               description: 'Reads an earlier series back. No renderer yet.' }),
  s('Complete',             'activity', 'complete',             { icon: 'flag',                description: 'A closing card that ends the day' }),
  s('Paced Breathing',      'activity', 'paced-breathing',      { icon: 'heart-pulse',         description: 'A pacer to breathe along with. No renderer yet.' }),

  s('MCQ',                  'activity', 'mcq',                  { id: 'cat-exercise_subtype-mcq', icon: 'circle-check',       description: 'Options with a correct answer behind them' }),
  s('Single Select',        'activity', 'single-select',        { id: 'cat-exercise_subtype-single-select', icon: 'list',               description: 'Pick one option from a vertical list' }),
  s('Multi Select',         'activity', 'multi-select',         { id: 'cat-exercise_subtype-multi-select', icon: 'list-checks',        description: 'Pick any number of options' }),
  s('Boolean',              'activity', 'boolean',              { icon: 'toggle-left',         description: 'Two labelled sides of one question. No renderer yet.' }),
  s('Clinical Instrument',  'activity', 'clinical-instrument',  { id: 'cat-exercise_subtype-clinical-instrument', icon: 'clipboard-list',     description: 'A validated instrument on one scored scale' }),

  s('Rating Scale',         'activity', 'rating-scale',         { id: 'cat-exercise_subtype-rating-scale', icon: 'sliders-horizontal', description: 'A point between two labels — produces an option' }),
  s('Slider',               'activity', 'slider',               { icon: 'sliders-horizontal',  description: 'A continuum the app does not own — produces a number. No renderer yet.' }),
  s('Ranking',              'activity', 'ranking',              { icon: 'list',                description: 'Order a list by preference. No renderer yet.' }),

  s('Structured List',      'activity', 'structured-list',      { id: 'cat-exercise_subtype-structured-list', icon: 'list',               description: 'Fixed items, each ticked or not' }),
  s('Check Grid',           'activity', 'check-grid',           { id: 'cat-exercise_subtype-table', icon: 'toggle-left',        description: 'Items against columns, each cell ticked or not' }),
  s('Consent',              'activity', 'consent',              { icon: 'shield-check',        description: 'A statement to agree to, stored as shown. No renderer yet.' }),

  s('Text',                 'activity', 'text',                 { icon: 'pen-tool',            description: 'A prompt above a text box, kept. No renderer yet.' }),
  s('Short Text',           'activity', 'short-text',           { icon: 'pen-tool',            description: 'A one-line free-text answer' }),
  s('Ephemeral Journal',    'activity', 'ephemeral-journal',    { id: 'cat-exercise_subtype-ephemeral-journal', icon: 'notebook',           description: 'A text box whose contents are not kept' }),
  s('Number',               'activity', 'number',               { id: 'cat-exercise_subtype-number', icon: 'hash',               description: 'A single numeric value' }),
  s('Input Table',          'activity', 'input-table',          { id: 'cat-exercise_subtype-input-table', icon: 'layout-grid',        description: 'A grid the user types into' }),

  s('Date',                 'activity', 'date',                 { icon: 'calendar',            description: 'A date. No renderer yet.' }),
  s('Time',                 'activity', 'time',                 { icon: 'clock',               description: 'A time. No renderer yet.' }),
  s('Date and Time',        'activity', 'date-time',            { icon: 'calendar',            description: 'A date and a time' }),
  s('Location',             'activity', 'location',             { icon: 'map-pin',             description: 'A place, at a stated precision. No renderer yet.' }),

  s('Timer',                'activity', 'timer',                { icon: 'timer',               description: 'A stopwatch up, or down to a target. No renderer yet.' }),

  s('File Upload',          'activity', 'upload',               { id: 'cat-exercise_subtype-upload', icon: 'image',              description: 'A file the user picks' }),
  s('Record',               'activity', 'record',               { icon: 'mic',                 description: 'Audio the user captures. No renderer yet.' }),

  // ── Check-in Block Types (widget types for check-in flow steps) ─
  s('Emoji Scale',   'checkin_block_type', 'emoji-scale',   { deprecated: true, icon: 'smile',               description: 'User picks from emoji options representing mood, energy, etc.' }),
  s('Free Text',     'checkin_block_type', 'free-text',     { deprecated: true, icon: 'pen-tool',            description: 'Open-ended text input for journaling or notes' }),
  s('Multi Select',  'checkin_block_type', 'multi-select',  { deprecated: true, icon: 'list-checks',         description: 'User picks multiple tags/options from a set' }),
  s('Single Choice', 'checkin_block_type', 'single-choice', { deprecated: true, icon: 'circle-check',        description: 'User picks one option from a list' }),
  s('Slider',        'checkin_block_type', 'slider',        { deprecated: true, icon: 'sliders-horizontal',  description: 'Numeric slider with min/max values and labels' }),
  s('Yes / No',      'checkin_block_type', 'yes-no',        { deprecated: true, icon: 'toggle-left',         description: 'Simple binary question — yes or no' }),
  s('Context Tags',  'checkin_block_type', 'context-tags',  { deprecated: true, icon: 'tag',                 description: 'Contextual tags for situational tracking' }),
];