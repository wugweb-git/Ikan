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
  | 'number'        // Single numeric value — declared as a subtype since 2026-09-04
  | 'complete';     // Conclude/summary — day-ending content block

// ── The vocabulary, in one place ────────────────────────────────────
// Before this, the alias list lived as extra `case` labels inside
// resolveInteraction's switch — which meant the renderer obeyed a vocabulary
// that the editor, the catalog and any migration could not read. These are the
// canonical terms and every non-canonical spelling that reaches them.

/** The canonical activities. Mirrors the `activity` catalog bucket (12 rows, renamed from `exercise_subtype` 2026-09-04). */
export const EXERCISE_SUBTYPES = [
  'mcq', 'single-select', 'multi-select', 'table', 'input-table', 'structured-list',
  'rating-scale', 'clinical-instrument', 'upload', 'ephemeral-journal',
  'comparison-matrix', 'number',
] as const;
export type ExerciseSubtype = typeof EXERCISE_SUBTYPES[number];

/**
 * Every non-canonical spelling -> its canonical term.
 *
 * Group 1 is live in stored content: `matrix` (8 blocks), `row_list`, `text_list`
 * and `scale` (1 each) came from `components/wizard/types.ts`'s FieldType union,
 * a Figma Make import that reads content and never writes it.
 * Group 2 is snake_case spellings the resolver already accepted.
 * Group 3 is check-in's step vocabulary, which is four of these terms under
 * other names — declared here so Phase 5 has one list to read, not two.
 */
export const SUBTYPE_ALIASES: Record<string, ExerciseSubtype> = {
  // 1 · in live data, from the Figma Make wizard
  matrix:              'comparison-matrix',
  row_list:            'structured-list',
  text_list:           'structured-list',
  scale:               'rating-scale',
  // 2 · snake_case and legacy spellings
  comparison_matrix:   'comparison-matrix',
  rating_scale:        'rating-scale',
  clinical_instrument: 'clinical-instrument',
  likert:              'rating-scale',
  // 3 · check-in step types
  emoji_scale:         'rating-scale',
  slider:              'rating-scale',
  free_text:           'ephemeral-journal',
  multi_select:        'multi-select',
  single_choice:       'single-select',
  yes_no:              'mcq',
};

const _CANONICAL = new Set<string>(EXERCISE_SUBTYPES);

/**
 * Resolve any stored spelling to a canonical subtype.
 * Returns undefined for a term in neither list — the caller decides what that means.
 */
export function normalizeSubtype(raw: string | undefined | null): ExerciseSubtype | undefined {
  if (!raw) return undefined;
  if (_CANONICAL.has(raw)) return raw as ExerciseSubtype;
  return SUBTYPE_ALIASES[raw];
}

/** The day types that have a preset. `DAY_TYPE_PRESETS` is typed against this, so the two cannot drift. */
export const DAY_TYPES = [
  'onboarding', 'learning', 'practice', 'workshop', 'tracker', 'reflection',
  'quiz', 'check-in', 'assessment', 'assessment-lite', 'rest',
] as const;
export type DayType = typeof DAY_TYPES[number];

// ── Fallback telemetry ──────────────────────────────────────────────
// Every default in the author -> store -> resolve -> render chain replaces a
// missing value with a working one and records nothing. That is why undeclared
// terms, mistyped days and a disabled guardrail coexisted in production without
// a single error. These warns turn a silent substitution into a searchable one.
// Deduped by key: several of these sites run on every render.
//
// The dedupe is per browser tab and never resets, which is what makes these
// cheap enough to call during render — and also means a fallback that fires
// once early stays quiet for the rest of the session.
//
// REPORTING (added 2026-09-04). Until now this wrote to `console.warn` and
// nowhere else: no Sentry, no analytics event, no server write. Every one of
// these signals — an undeclared subtype in live content, a day whose type
// matches no preset and therefore skips ALL validation — was observable only by
// a developer with devtools open on the exact tab where it fired. Telemetry
// built to make silent failure visible was itself invisible.
//
// It is best-effort by construction: fire-and-forget, failures swallowed, and
// deduped by the same key as the console line, so a render loop cannot turn
// into a request loop. A diagnostic must never break the thing it observes.
const _warnedFallbacks = new Set<string>();

// Injected rather than imported. This module is the block MODEL — it must stay
// dependency-free so it can be unit-tested under `node --test` with no app
// config, no bundler and no network. Importing the Supabase constants here
// broke every test the moment it was tried (node cannot load a `.tsx` file).
// The app wires the real reporter once at startup; everywhere else this is a
// no-op and the console line still happens.
export type FallbackReporter = (e: { site: string; detail: string; term?: string }) => void;
let _reporter: FallbackReporter | null = null;

/** Wire fallback telemetry to a real sink. Called once, from the app entry. */
export function setFallbackReporter(fn: FallbackReporter | null): void {
  _reporter = fn;
}

export function warnFallback(site: string, detail: string, key?: string): void {
  const k = site + '::' + (key ?? detail);
  if (_warnedFallbacks.has(k)) return;
  _warnedFallbacks.add(k);
  console.warn('[blocks:fallback] ' + site + ' - ' + detail);
  // Never let a diagnostic break the thing it observes.
  try { _reporter?.({ site, detail, term: key }); } catch { /* swallowed */ }
}

// Maps legacy type + subtype → unified interaction. Used by BlockRenderer at runtime.
export function resolveInteraction(activity: Activity): InteractionType {
  // Prefer explicit interaction field if set
  if (activity.interaction) return activity.interaction;

  const { type, exerciseConfig } = activity;
  const rawSubtype = exerciseConfig?.subtype;
  // Aliases are resolved BEFORE the switch, so the switch below is the
  // canonical vocabulary and nothing else. See SUBTYPE_ALIASES.
  const subtype = normalizeSubtype(rawSubtype);

  // TYPE IS AUTHORITATIVE (2026-09-04).
  //
  // This used to read `if (type === 'exercise' || subtype)`, so ANY block
  // carrying a subtype took the subtype path whatever its type said. That is
  // how `lesson · multi-select` rendered as a question and how the once-
  // undeclared `quiz` type worked at all — type overruled by accident of a
  // boolean, on 44 live blocks.
  //
  // Phase 3.3 re-typed those 44 to `exercise`, which made their declared type
  // match what they already did. Verified before removing the clause: **zero**
  // blocks across `equip:`, `equip_program:` and `assessment_def:` are now a
  // non-exercise type carrying a subtype. So the clause protects nothing, and
  // keeping it would let the same disagreement be authored back in silently.
  //
  // If one appears anyway it is a data error, not a rendering mode: the type
  // wins, and the fallback sink hears about it. That sink is real now — see
  // warnFallback above.
  if (type !== 'exercise' && rawSubtype) {
    warnFallback(
      'resolveInteraction',
      `block ${activity.id} is type "${type}" but carries subtype "${rawSubtype}" — ` +
      `the subtype is ignored and the type decides. One of the two is wrong.`,
      `${type}/${rawSubtype}`
    );
  }

  if (type === 'exercise') {
    switch (subtype) {
      case 'mcq':
      case 'single-select':
        return 'select-one';
      case 'multi-select':
        return 'select-many';
      case 'table':
        return 'track-table';
      case 'input-table':
      case 'comparison-matrix':
        return 'input-table';
      case 'structured-list':
        return 'check';
      case 'rating-scale':
        return 'rate';
      case 'clinical-instrument':
        return 'clinical';
      case 'upload':
        return 'upload';
      case 'number':
        return 'number';
      case 'ephemeral-journal':
        // If it has options, it's really a select-one (data inconsistency fix)
        if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
        return 'write';
      default:
        // Exercise with options but no subtype → select-one
        if (exerciseConfig?.options && exerciseConfig.options.length > 0) return 'select-one';
        if (rawSubtype) {
          warnFallback(
            'resolveInteraction',
            `subtype "${rawSubtype}" is in neither EXERCISE_SUBTYPES nor SUBTYPE_ALIASES on block ${activity.id} — rendering a free-text box`,
            rawSubtype
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
    // A quiz with no subtype is still a question. Without this it fell to
    // `default: 'read'` and rendered as reading content.
    case 'quiz':         return 'select-one';
    // `sleep-diary` is DEPRECATED and retired from the block_type catalog
    // (2026-09-04), so it cannot be chosen in the editor. It stays in the code
    // union so any stored block still carrying it resolves rather than falling
    // to `default: 'read'`. Zero live blocks carry it.
    //
    // TRAP, recorded deliberately: this resolves to `track-table` (a yes/no
    // grid), but Sleep Tight's 126 actual diary blocks are `input-table` (a text
    // grid). The name suggests Sleep Tight's behaviour; the resolution is not
    // it. Left as-is rather than retargeted, because changing a deprecated
    // type's behaviour with no live users is churn — but do not reach for
    // `sleep-diary` expecting a Sleep Tight diary.
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
  'number':      { label: 'Number',          verb: 'Enters',   icon: 'hash',           description: 'User enters a single numeric value' },
  'complete':    { label: 'Complete',        verb: 'Finishes', icon: 'flag',           description: 'Day-ending summary or conclusion' },
};

export interface ExerciseConfig {
  /**
   * Authored subtype. Both snake_case and kebab-case spellings of the same term are
   * present in live content, so both are declared here and mapped in resolveInteraction().
   * 'number' has no interaction of its own yet and falls back to a free-text box.
   */
  subtype?: ExerciseSubtype | keyof typeof SUBTYPE_ALIASES;
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
  /**
   * `quiz` joined the union 2026-09-04. Twelve live blocks already carry it and
   * the catalog has the row; it was missing here and from `resolveInteraction`'s
   * direct-type switch. All twelve also carry a subtype, so they resolve through
   * the `|| subtype` clause and render correctly today — the gap is latent, not
   * live. A `quiz` block authored WITHOUT a subtype would have fallen to
   * `default: 'read'` and rendered as reading content.
   */
  type: 'lesson' | 'exercise' | 'journal' | 'checklist' | 'reflection' | 'conclude' | 'sleep-diary' | 'quiz';
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
  /** DAY_TYPE_PRESETS is typed `Record<DayType, ...>`, so this cannot drift from it. */
  dayType?: DayType;
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