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
  | 'exercise_subtype'
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
    description: 'Block types, interactions, exercise subtypes, and day configurations',
    types: ['block_type', 'interaction_type', 'exercise_subtype', 'day_config_type', 'difficulty_level'],
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
  exercise_subtype: 'Exercise Subtypes',
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
  exercise_subtype: 'pen-tool',
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
  /**
   * For `severity_level` rows only: which `response_tier` this severity maps
   * to. The authoritative severity -> tier map, held as data so it is visible
   * and editable in the catalog UI. A scoring profile may override it per
   * instrument via `tier_map`.
   */
  tier?: string;
}

function s(name: string, type: MetadataType, slug?: string, extra?: Partial<SeedItem>): SeedItem {
  return {
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    type,
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
  // Must match all 12 InteractionType values from equip-admin-types.ts
  s('Read',           'interaction_type', 'read',        { icon: 'book-open',          description: 'User reads/scrolls through content' }),
  s('Watch',          'interaction_type', 'watch',       { icon: 'film',               description: 'User watches embedded video or media' }),
  s('Select One',     'interaction_type', 'select-one',  { icon: 'circle-check',       description: 'User picks one option from a list' }),
  s('Select Many',    'interaction_type', 'select-many', { icon: 'list-checks',        description: 'User picks multiple options' }),
  s('Write',          'interaction_type', 'write',       { icon: 'pen-tool',           description: 'User types free-form text response' }),
  s('Rate',           'interaction_type', 'rate',        { icon: 'sliders-horizontal', description: 'User picks a number on a scale' }),
  s('Check Off',      'interaction_type', 'check',       { icon: 'check-square',       description: 'User toggles items in a checklist' }),
  s('Track (Table)',  'interaction_type', 'track-table', { icon: 'toggle-left',        description: 'User fills yes/no grid or diary' }),
  s('Input (Table)',  'interaction_type', 'input-table', { icon: 'layout-grid',        description: 'User fills data into table cells' }),
  s('Clinical Scale', 'interaction_type', 'clinical',    { icon: 'clipboard-list',     description: 'User answers scored clinical instrument' }),
  s('Upload',         'interaction_type', 'upload',      { icon: 'image',              description: 'User uploads a file (document, image, audio)' }),
  s('Complete',       'interaction_type', 'complete',    { icon: 'circle-check',       description: 'Day-ending summary or conclusion' }),

  // ── Block Types (Equip/Program) ───────────────────────────────
  s('Lesson',      'block_type', 'lesson',      { icon: 'book-open',   description: 'Informational content block' }),
  s('Exercise',    'block_type', 'exercise',    { icon: 'activity',    description: 'Interactive exercise block' }),
  s('Journal',     'block_type', 'journal',     { icon: 'notebook',    description: 'Journaling / free-write prompt' }),
  s('Checklist',   'block_type', 'checklist',   { icon: 'list-checks', description: 'Task checklist block' }),
  s('Reflection',  'block_type', 'reflection',  { icon: 'brain',       description: 'Guided reflection prompt' }),
  s('Conclude',    'block_type', 'conclude',    { icon: 'flag',        description: 'Session conclusion / summary' }),
  s('Quiz',        'block_type', 'quiz',        { icon: 'circle-check', description: 'Knowledge check with scoring' }),

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
  // Must match all 10+ DAY_TYPE_PRESETS from day-presets.ts
  s('Onboarding',     'day_config_type', 'onboarding',     { icon: 'zap',             color: '#F59E0B', description: 'First-time intro, consent, and orientation' }),
  s('Assessment',     'day_config_type', 'assessment',     { icon: 'clipboard-list',  color: '#8B5CF6', description: 'Baseline measurement, severity scoring' }),
  s('Assessment Lite','day_config_type', 'assessment-lite',{ icon: 'clipboard-check', color: '#A78BFA', description: 'Awareness, non-scored check-ins' }),
  s('Learning',       'day_config_type', 'learning',       { icon: 'book-open',       color: '#2A2A2A', description: 'Concept introduction and understanding' }),
  s('Practice',       'day_config_type', 'practice',       { icon: 'pen-tool',        color: '#22C55E', description: 'User data capture, reflection, application' }),
  s('Reflection',     'day_config_type', 'reflection',     { icon: 'brain',           color: '#3B82F6', description: 'Closure, sense-making, review' }),
  s('Rest',           'day_config_type', 'rest',           { icon: 'moon',            color: '#9CA3AF', description: 'No active tasks, optional motivation' }),
  s('Quiz',           'day_config_type', 'quiz',           { icon: 'circle-check',    color: '#F59E0B', description: 'Knowledge check with scoring, tests retention' }),
  s('Check-In',       'day_config_type', 'check-in',       { icon: 'heart-pulse',     color: '#EC4899', description: 'Quick mood/wellness check with rating' }),
  s('Tracker',        'day_config_type', 'tracker',        { icon: 'repeat',          color: '#10B981', description: 'Daily repetition, habits, streaks' }),
  s('Workshop',       'day_config_type', 'workshop',       { icon: 'blocks',          color: '#6366F1', description: 'Multi-step thinking (ideation, evaluation)' }),

  // ── Exercise Subtypes ──────────────────────────────────────────
  s('MCQ',                  'exercise_subtype', 'mcq',                  { icon: 'circle-check',       description: 'Standard MCQ with single correct answer' }),
  s('Single Select',       'exercise_subtype', 'single-select',       { icon: 'list',               description: 'Pick one option from a vertical list' }),
  s('Multi Select',        'exercise_subtype', 'multi-select',        { icon: 'list-checks',        description: 'Pick multiple options from a vertical list' }),
  s('Checklist Table',     'exercise_subtype', 'table',               { icon: 'toggle-left',        description: 'Grid of items with yes/no toggle per row' }),
  s('Input Table',         'exercise_subtype', 'input-table',         { icon: 'layout-grid',        description: 'Grid with text input cells for structured data' }),
  s('Structured List',     'exercise_subtype', 'structured-list',     { icon: 'list',               description: 'Ordered list items with user input' }),
  s('Rating Scale',        'exercise_subtype', 'rating-scale',        { icon: 'sliders-horizontal', description: 'Numeric rating scale (1–5, 1–10)' }),
  s('Clinical Instrument', 'exercise_subtype', 'clinical-instrument', { icon: 'clipboard-list',     description: 'Validated instruments with scored Likert scales' }),
  s('File Upload',         'exercise_subtype', 'upload',              { icon: 'image',              description: 'User uploads a file (document, image, audio)' }),
  s('Ephemeral Journal',   'exercise_subtype', 'ephemeral-journal',   { icon: 'notebook',           description: 'Session-scoped journal not persisted long-term. Selectable in editor.' }),
  s('Comparison Matrix',   'exercise_subtype', 'comparison-matrix',   { icon: 'layout-grid',        description: 'Side-by-side comparison table. Alias for input-table with comparison layout.' }),
  s('Number',              'exercise_subtype', 'number',              { icon: 'hash',               description: 'Single numeric value entry' }),

  // ── Check-in Block Types (widget types for check-in flow steps) ─
  s('Emoji Scale',   'checkin_block_type', 'emoji-scale',   { icon: 'smile',               description: 'User picks from emoji options representing mood, energy, etc.' }),
  s('Free Text',     'checkin_block_type', 'free-text',     { icon: 'pen-tool',            description: 'Open-ended text input for journaling or notes' }),
  s('Multi Select',  'checkin_block_type', 'multi-select',  { icon: 'list-checks',         description: 'User picks multiple tags/options from a set' }),
  s('Single Choice', 'checkin_block_type', 'single-choice', { icon: 'circle-check',        description: 'User picks one option from a list' }),
  s('Slider',        'checkin_block_type', 'slider',        { icon: 'sliders-horizontal',  description: 'Numeric slider with min/max values and labels' }),
  s('Yes / No',      'checkin_block_type', 'yes-no',        { icon: 'toggle-left',         description: 'Simple binary question — yes or no' }),
  s('Context Tags',  'checkin_block_type', 'context-tags',  { icon: 'tag',                 description: 'Contextual tags for situational tracking' }),
];