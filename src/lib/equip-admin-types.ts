export interface ConditionalLogic {
  show_if_question_id: string;
  show_if_answer: string | string[];
}

export interface OnboardingQuestion {
  id: string;
  order: number;
  question: string;
  helper_text?: string;
  type: 'single_select' | 'multi_select' | 'text' | 'textarea';
  options?: string[];
  allow_skip: boolean;
  allow_prefer_not_to_answer: boolean;
  required: boolean;
  max_selections?: number;
  character_limit?: number;
  conditional?: ConditionalLogic;
  privacy_level: 'general' | 'sensitive' | 'health';
  storage_scope: 'equip-only' | 'profile';
  editable_later: boolean;
  placeholder?: string;
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'boolean' | 'rtf' | 'date';
  editable?: boolean;
}

export interface TableRow {
  id: string;
  values: Record<string, any>;
  readonly?: boolean;
}

export interface ScoringConfig {
  enabled: boolean;
  maxScore?: number;
  weights?: number[]; // For MCQs, corresponds to options index
  correctIndex?: number; // Simplified correct answer tracking
}

// ── Unified Interaction Taxonomy ────────────────────────────────────
// Every block — whether "lesson", "exercise", or "journal" — is an interaction.
// The `interaction` field replaces the split between Activity.type + ExerciseConfig.subtype.
// Old programs without `interaction` are mapped via resolveInteraction() at runtime.
export type InteractionType =
  | 'read'          // Lesson, conclude — user reads/scrolls content
  | 'watch'         // Video/media — user watches embedded media
  | 'select-one'    // MCQ, single-select — pick one option
  | 'select-many'   // Multi-select — pick multiple options
  | 'write'         // Journal, reflection, ephemeral-journal — free text entry
  | 'rate'          // Rating scale, likert — pick a number on a scale
  | 'check'         // Checklist, structured-list — toggle items
  | 'track-table'   // Table checklist (yes/no grid)
  | 'input-table'   // Input table, comparison matrix — fill data cells
  | 'clinical'      // Clinical instrument (GAD-7, PHQ-9) — scored Likert grid
  | 'upload'        // File upload — user uploads a document, image, or audio file
  | 'complete';     // Conclude/summary — day-ending content block

// ── Fallback telemetry ──────────────────────────────────────────────
// Every default in the author -> store -> resolve -> render chain replaces a
// missing value with a working one and records nothing. That is why undeclared
// terms, mistyped days and a disabled guardrail coexisted in production without
// a single error. These warns turn a silent substitution into a searchable one.
// Deduped by key: several of these sites run on every render.
const _warnedFallbacks = new Set<string>();
export function warnFallback(site: string, detail: string, key?: string): void {
  const k = site + '::' + (key ?? detail);
  if (_warnedFallbacks.has(k)) return;
  _warnedFallbacks.add(k);
  console.warn('[blocks:fallback] ' + site + ' - ' + detail);
}

// Maps legacy type + subtype → unified interaction. Used by BlockRenderer at runtime.
export function resolveInteraction(activity: Activity): InteractionType {
  // Prefer explicit interaction field if set
  if (activity.interaction) return activity.interaction;

  const { type, exerciseConfig } = activity;
  const subtype = exerciseConfig?.subtype;

  // Exercise with subtype → map subtype.
  // NOTE the `|| subtype`: ANY block carrying a subtype takes this path, whatever
  // its type says. That is how `lesson · multi-select` renders as a question and
  // how the once-undeclared `quiz` type worked at all. Legal, but it is type
  // being overruled by accident of a boolean, so it is recorded.
  if (type === 'exercise' || subtype) {
    if (type !== 'exercise' && subtype) {
      warnFallback(
        'resolveInteraction',
        `type "${type}" overruled by subtype "${subtype}" on block ${activity.id}`,
        `${type}/${subtype}`
      );
    }
    switch (subtype) {
      case 'mcq':
      case 'single-select':
        return 'select-one';
      case 'multi-select':
        return 'select-many';
      case 'table':
        return 'track-table';
      case 'input-table':
      case 'comparison_matrix':
      case 'comparison-matrix':
      case 'matrix':
        return 'input-table';
      case 'structured-list':
      case 'row_list':
      case 'text_list':
        return 'check';
      case 'rating_scale':
      case 'rating-scale':
      case 'likert':
      case 'scale':
        return 'rate';
      case 'clinical_instrument':
      case 'clinical-instrument':
        return 'clinical';
      case 'upload':
        return 'upload';
      case 'ephemeral-journal':
        // If it has options, it's really a select-one (data inconsistency fix)
        if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
        return 'write';
      default:
        // Exercise with options but no subtype → select-one
        if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
        if (subtype) {
          warnFallback(
            'resolveInteraction',
            `unmapped exercise subtype "${subtype}" on block ${activity.id} — rendering a free-text box`,
            subtype
          );
        }
        return 'write';
    }
  }

  // Direct type mapping
  switch (type) {
    case 'lesson':       return 'read';
    case 'conclude':     return 'complete';
    case 'journal':
    case 'reflection':
      // Journal/reflection with options → select-one (data inconsistency)
      if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
      return 'write';
    case 'checklist':    return 'check';
    case 'sleep-diary':  return 'track-table';
    default:             return 'read';
  }
}

// ── Interaction metadata (for admin UIs) ────────────────────────────
export const INTERACTION_META: Record<InteractionType, { label: string; verb: string; icon: string; description: string }> = {
  'read':        { label: 'Read',           verb: 'Reads',    icon: 'book-open',      description: 'User reads/scrolls through content' },
  'watch':       { label: 'Watch',          verb: 'Watches',  icon: 'play-circle',    description: 'User watches embedded video or media' },
  'select-one':  { label: 'Select One',     verb: 'Selects',  icon: 'circle-dot',     description: 'User picks one option from a list' },
  'select-many': { label: 'Select Many',    verb: 'Selects',  icon: 'check-square',   description: 'User picks multiple options' },
  'write':       { label: 'Write',          verb: 'Writes',   icon: 'pen-line',       description: 'User types free-form text response' },
  'rate':        { label: 'Rate',           verb: 'Rates',    icon: 'star',           description: 'User picks a number on a scale' },
  'check':       { label: 'Check Off',      verb: 'Checks',   icon: 'list-checks',    description: 'User toggles items in a checklist' },
  'track-table': { label: 'Track (Table)',   verb: 'Tracks',   icon: 'table',          description: 'User fills yes/no grid or diary' },
  'input-table': { label: 'Input (Table)',   verb: 'Enters',   icon: 'grid-3x3',       description: 'User fills data into table cells' },
  'clinical':    { label: 'Clinical Scale',  verb: 'Answers',  icon: 'clipboard-list', description: 'User answers scored clinical instrument' },
  'upload':      { label: 'Upload',          verb: 'Uploads',  icon: 'upload',         description: 'User uploads a file (document, image, audio)' },
  'complete':    { label: 'Complete',        verb: 'Finishes', icon: 'flag',           description: 'Day-ending summary or conclusion' },
};

export interface ExerciseConfig {
  /**
   * Authored subtype. Both snake_case and kebab-case spellings of the same term are
   * present in live content, so both are declared here and mapped in resolveInteraction().
   * 'number' has no interaction of its own yet and falls back to a free-text box.
   */
  subtype?: 'multi-select' | 'single-select' | 'mcq' | 'table' | 'input-table' | 'ephemeral-journal'
    | 'structured-list' | 'row_list' | 'text_list'
    | 'clinical_instrument' | 'clinical-instrument'
    | 'rating_scale' | 'rating-scale' | 'likert' | 'scale'
    | 'comparison_matrix' | 'comparison-matrix' | 'matrix'
    | 'number' | 'upload';
  prompt?: string;
  options?: string[];
  questions?: string[]; // For clinical instruments
  scale?: { label: string; value: number }[]; // For clinical instruments
  columns?: string[]; // Simple config for tables
  rows?: string[];    // Simple config for tables/matrix
  allow_add_rows?: boolean;
  correctAnswer?: string | string[];
  allCorrect?: boolean;
  tableColumns?: TableColumn[];
  tableRows?: TableRow[];
  maxEntries?: number;
  autoDelete?: number;
  progressive?: boolean;
  listItems?: string[];
  editable?: boolean;
  scoring?: ScoringConfig;
  // Upload block config
  acceptedFileTypes?: string[];  // e.g. ['image/*', '.pdf', 'audio/*']
  maxFileSize?: number;          // in bytes, defaults to 10MB
}

// ── Carry-forward / repetition ──────────────────────────────────────
// Lets a single block (one stable `id`) surface on multiple days instead of
// being copy-pasted (which creates new ids and fragments user data). Because
// progress.block_responses is keyed by block id, keeping one id makes data
// carry across days automatically.
export type RepetitionType =
  | 'simple_repeat'    // running log: prior days' entries shown read-only + a new entry
  | 'column_addition'  // prior columns read-only + new columns added on specific days
  | 'on_demand';       // available any day from a start day (single evolving response)

export interface ActivityRepeat {
  type: RepetitionType;
  /** Explicit target days this block also appears on (its home day is implicit). */
  onDays?: number[];
  /** Appear on every day after the block's home day. */
  everyDay?: boolean;
  /** on_demand: reachable any time from this day onward. */
  onDemandFromDay?: number;
  /** column_addition: new columns introduced on a given day number. */
  columnsByDay?: Record<number, TableColumn[]>;
}

export interface Activity {
  id: string;
  title: string;
  subtitle?: string;
  type: 'lesson' | 'exercise' | 'journal' | 'checklist' | 'reflection' | 'conclude' | 'sleep-diary';
  /** Unified interaction type. Preferred over type+subtype when present. */
  interaction?: InteractionType;
  content: string;
  duration: number; // in minutes
  required: boolean;
  data_id?: string;
  order: number;
  exerciseConfig?: ExerciseConfig;
  image_url?: string;
  stepGroup?: string;
  autoAdvance?: boolean;
  /** Carry-forward / repetition config. Absent = appears only on its home day. */
  repeat?: ActivityRepeat;
}

// ── Carry-forward runtime helpers ───────────────────────────────────
// Resolve which day-numbers a block should appear on, given its home day.
export function repeatTargetDays(activity: Activity, homeDay: number, totalDays: number): number[] {
  const r = activity.repeat;
  if (!r) return [homeDay];
  const days = new Set<number>([homeDay]);
  if (r.everyDay) {
    for (let d = homeDay; d <= totalDays; d++) days.add(d);
  }
  if (r.type === 'on_demand' && typeof r.onDemandFromDay === 'number') {
    for (let d = r.onDemandFromDay; d <= totalDays; d++) days.add(d);
  }
  for (const d of r.onDays ?? []) days.add(d);
  return [...days].sort((a, b) => a - b);
}

export interface DayContent {
  day: number;
  title: string;
  subtitle?: string;
  description: string;
  activities: Activity[];
  image_url?: string;
  /** Must stay in sync with DAY_TYPE_PRESETS in components/admin/day-presets.ts. */
  dayType?: 'assessment' | 'assessment-lite' | 'learning' | 'practice' | 'workshop' | 'tracker' | 'reflection'
    | 'check-in' | 'rest' | 'quiz';
}

export interface WeekStructure {
  week: number;
  title: string;
  description: string;
  focus: string;
  days: number[];
}

// ── Program Check-in Configuration ──────────────────────────────────
// Controls the milestone check-in modal shown during program playback.
// If absent, defaults to legacy behavior (days 7, 14, 30 + last day).
export interface CheckInConfig {
  enabled: boolean;
  /** Specific day numbers that trigger the check-in modal */
  triggerDays: number[];
  /** Whether to also trigger on the very last day of the program */
  triggerOnLastDay: boolean;
  /** Optional: custom title shown in the check-in modal header */
  customTitle?: string;
  /** Optional: override the 4 default questions (future) */
  // customQuestions?: CheckInQuestion[];
}

export const DEFAULT_CHECKIN_CONFIG: CheckInConfig = {
  // Disabled by default — the milestone check-in popup is turned off site-wide.
  // Re-enable per-program via the program's checkInConfig when desired.
  enabled: false,
  triggerDays: [7, 14, 30],
  triggerOnLastDay: true,
};

export interface EquipProgram {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  cover_image: string;
  category: string;
  duration_days: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_paid?: boolean;
  published: boolean;
  price: number;
  currency: string;
  
  // Landing Page (Bento) Fields
  section1_title?: string;
  section1_eligibility_points?: string[];
  
  section2_title?: string;
  section2_content?: string;
  section2_bullets?: string[];
  section2_image?: string;
  
  section3_title?: string;
  section3_subtitle?: string;
  section3_content?: string[]; // Steps
  
  overview_benefits?: string[]; // "Title | Description" strings
  
  // Structure
  onboarding_questions: OnboardingQuestion[];
  daily_content: DayContent[];
  
  // Check-in configuration
  checkInConfig?: CheckInConfig;
  
  metadata?: Record<string, any>;

  created_at: string;
  updated_at: string;
}