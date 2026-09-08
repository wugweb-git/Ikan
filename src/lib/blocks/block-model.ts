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
  | 'view'          // Video/media — renamed from `watch` 2026-09-08 (0 live blocks)
  | 'listen'        // Audio — NO RENDERER YET, see below
  | 'select-one'    // MCQ, single-select — pick one option
  | 'select-many'   // Multi-select — pick multiple options
  | 'write'         // Journal, reflection, ephemeral-journal — free text entry
  | 'rate'          // Rating scale, likert — pick a number on a scale
  | 'rank'          // Ordering a list by preference — NO RENDERER YET
  | 'check'         // Checklist, structured-list — toggle items
  | 'track-table'   // Table checklist (yes/no grid)
  | 'input-table'   // Input table, comparison matrix — fill data cells
  | 'review-table'  // Read-back of earlier days' table entries — NO RENDERER YET
  | 'clinical'      // Clinical instrument (GAD-7, PHQ-9) — scored Likert grid
  | 'upload'        // File upload — user uploads a document, image, or audio file
  | 'pick-date'     // A date or time — NO RENDERER YET
  | 'number'        // Single numeric value — declared as a subtype since 2026-09-04
  | 'complete';     // Conclude/summary — day-ending content block

/**
 * Interactions declared here that `BlockRenderer` has no case for.
 *
 * **This is the `watch` defect, created deliberately and on the record.** A
 * block carrying one of these falls to `default: renderLesson()` and draws
 * reading content — which is precisely what `watch` has always done, and what
 * the Block Type Viewer had to discover by reading the renderer.
 *
 * So they are declared and NOT OFFERED. `authorableInteractions()` below is
 * what every picker must filter through, the viewer marks them
 * "Declared, unread", and `BlockPreview` shows a marked gap rather than a mock.
 * The list empties when the four renderers are built; until then it is the
 * difference between a known gap and a trap.
 */
export const INTERACTIONS_WITHOUT_RENDERER: readonly InteractionType[] = [
  /*
    EMPTY as of 2026-09-08 — build-order step 7 built all four.
    `BlockRenderer` now has a case for `listen`, `rank`, `review-table` and
    `pick-date`, so the four activities behind them (`listen`, `ranking`,
    `table-review`, `date-time`) are authorable and this list stops filtering
    the picker.

    Kept, not deleted: it is the mechanism that made declaring a vocabulary
    ahead of its renderers safe, and the next interaction added before its
    renderer belongs here on the same day it is declared. `watch` sat
    unauthorable for months precisely because there was nowhere to say this.
  */
];

/** Interactions an author may actually pick — everything the player can draw. */
export function authorableInteractions(all: readonly InteractionType[]): InteractionType[] {
  return all.filter((i) => !INTERACTIONS_WITHOUT_RENDERER.includes(i));
}

// ── The vocabulary, in one place ────────────────────────────────────
// Before this, the alias list lived as extra `case` labels inside
// resolveInteraction's switch — which meant the renderer obeyed a vocabulary
// that the editor, the catalog and any migration could not read. These are the
// canonical terms and every non-canonical spelling that reaches them.

/**
 * The block types a block may actually BE — the leaf half of the merged
 * vocabulary. `quiz` and `reflection` are deliberately absent: the flip made
 * them containers (stages), so nothing can be one.
 *
 * Exported so the Block Type Viewer can compare the code's vocabulary against
 * the catalog's and report DRIFT, rather than deriving one from the other and
 * proving nothing.
 */
export const LEAF_BLOCK_TYPES = [
  'lesson', 'exercise', 'journal', 'checklist', 'conclude', 'sleep-diary',
  /*
    All 17 as of 2026-09-08, and the name is now a leftover — there are no
    non-leaves. No block holds another, so every catalog `block_type` row is a
    type a block may BE.

    The eleven below were day types before the vocabularies merged, and the
    remap that assigned live content to them made the gap real: 82 blocks are
    `tracker`, 13 `onboarding`, 5 `workshop` — 100 blocks carrying a type the
    union did not contain. Exactly the `quiz` situation this file already
    documents, and latent for the same reason: every block carries an explicit
    `interaction`, so `resolveInteraction` returns before the type switch and
    nothing mis-renders. Latent, not harmless — a NEW block of one of these
    types authored without an interaction would fall to the default.
  */
  'onboarding', 'assessment', 'assessment-lite', 'learning', 'practice',
  'reflection', 'rest', 'quiz', 'workshop', 'tracker', 'check-in',
] as const;

/** What a block may BE — all 17, since no block holds another. */
export type BlockType = typeof LEAF_BLOCK_TYPES[number];

/** The canonical activities. Mirrors the `activity` catalog bucket (12 rows, renamed from `exercise_subtype` 2026-09-04). */
export const EXERCISE_SUBTYPES = [
  'mcq', 'single-select', 'multi-select', 'table', 'input-table', 'structured-list',
  'rating-scale', 'clinical-instrument', 'upload', 'ephemeral-journal',
  'comparison-matrix', 'number',
  /*
    +8 on 2026-09-08.

    `read`, `listen`, `view` and `complete` were never activities — they were
    resolved from the BLOCK TYPE, which is why `resolveInteraction` needs a type
    switch at all and why a video has never been authorable. Naming them as
    activities is what lets that switch become one lookup.

    `date-time`, `table-review`, `ranking` and `short-text` are recovered from
    the deleted `allowedBlocks` palette.

    Four of these resolve to interactions with no renderer — see
    INTERACTIONS_WITHOUT_RENDERER — so they are declared and not offered.
    `read`, `complete`, `short-text` and `view` are safe today.
  */
  'read', 'listen', 'view', 'complete',
  'date-time', 'table-review', 'ranking', 'short-text',
] as const;

/**
 * **Activity -> interaction. Total both ways.**
 *
 * Every activity resolves to exactly one interaction, and every interaction has
 * at least one activity. Typed `Record<ExerciseSubtype, InteractionType>`, so
 * an activity added without a mapping fails the build rather than falling
 * through the resolver's `default` to a free-text box — which is how nine live
 * blocks came to render as textareas.
 *
 * This is the model's central claim written down: the block TYPE is not
 * involved. `resolveInteraction` still consults its type switch for blocks that
 * carry no activity, and collapsing that away is a separate, gated step; this
 * table is what makes the collapse possible rather than a rewrite.
 */
export const SUBTYPE_INTERACTION: Record<ExerciseSubtype, InteractionType> = {
  'mcq':                 'select-one',
  'single-select':       'select-one',
  'multi-select':        'select-many',
  'table':               'track-table',
  'input-table':         'input-table',
  'comparison-matrix':   'input-table',
  'structured-list':     'check',
  'rating-scale':        'rate',
  'clinical-instrument': 'clinical',
  'upload':              'upload',
  'ephemeral-journal':   'write',
  'number':              'number',
  // Added 2026-09-08 with the eight new activities.
  'read':                'read',
  'listen':              'listen',
  'view':                'view',
  'complete':            'complete',
  'date-time':           'pick-date',
  'table-review':        'review-table',
  'ranking':             'rank',
  'short-text':          'write',
};

/** The activities an author may pick — those whose interaction can be drawn. */
export const AUTHORABLE_SUBTYPES: readonly ExerciseSubtype[] = EXERCISE_SUBTYPES.filter(
  (s) => !INTERACTIONS_WITHOUT_RENDERER.includes(SUBTYPE_INTERACTION[s]),
);
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
  /*
    4 · recovered from the deleted `allowedBlocks` palette, 2026-09-08.

    Added so the deletion cannot repeat. `allowedBlocks` was a 23-string list
    that existed in no store and no type union, and deleting it took the only
    written record of these spellings with it — twice now this module has had to
    recover a vocabulary from a git history rather than read it. Declared here,
    a term survives its own removal.

    None of these is known to be in live content; they are the spellings this
    codebase has answered to, kept so that a stored one resolves instead of
    hitting the resolver default and drawing a free-text box.
  */
  watch:               'view',
  boolean:             'mcq',
  mcq_single:          'mcq',
  mcq_multi:           'multi-select',
  rtf_list:            'structured-list',
  journal_short:       'ephemeral-journal',
  long_text:           'ephemeral-journal',
  rich_lesson:         'read',
  callout:             'read',
  media:               'view',
  summary:             'complete',
  table_input:         'input-table',
  table_review:        'table-review',
  date_time:           'date-time',
  short_text:          'short-text',
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

  const { type } = activity;
  // Via the accessor: during the rename a block may be stored under either name.
  const exerciseConfig = configOf(activity);
  const rawSubtype = activityOf(activity);
  // Aliases are resolved BEFORE the switch, so the switch below is the
  // canonical vocabulary and nothing else. See SUBTYPE_ALIASES.
  const subtype = normalizeSubtype(rawSubtype);

  /*
    THE ACTIVITY DECIDES (2026-09-08). Superseding "type is authoritative".

    That rule was written when the only type carrying an activity was
    `exercise`: 44 blocks had been retyped to make their declared type match
    what they drew, and the check confirmed zero non-exercise blocks carried a
    subtype. Both were true then.

    The block remap made them false. 82 blocks are now `tracker` and 5
    `workshop`, each carrying a real activity — and under "type decides" a
    `tracker · input-table` resolved to **`read`**, because `tracker` has no
    case in the switch below. It warned and discarded the activity. Nothing
    mis-rendered only because every block also carries an explicit
    `interaction` and this function returns before reaching here.

    That is a trap with a date on it: build-order step 5 stops writing
    `interaction`, and on the day it lands 87 blocks would draw reading content.

    The settled model says `interaction = f(activity)`, block type not involved.
    So an activity, wherever it sits, decides — which is also what makes the
    gated collapse of this function a deletion rather than a rewrite.
  */
  if (subtype && subtype in SUBTYPE_INTERACTION) {
    return SUBTYPE_INTERACTION[subtype as ExerciseSubtype];
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
        /*
          Everything above is a `case` this switch has carried since before
          `SUBTYPE_INTERACTION` existed, and every one of them agrees with the
          table — asserted in block-vocabulary.test.ts, so they cannot drift
          while both exist. The eight activities added 2026-09-08 have no case
          and resolve here, through the table, which is the single mapping the
          gated collapse will leave standing.
        */
        if (subtype && subtype in SUBTYPE_INTERACTION) {
          return SUBTYPE_INTERACTION[subtype as ExerciseSubtype];
        }
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
    // `sleep-diary` — RETAINED and RETARGETED 2026-09-04.
    //
    // It resolved to `track-table` (a yes/no grid) while Sleep Tight's 126 real
    // diary blocks are `input-table` (a text grid). The type was named after a
    // programme whose behaviour it did not reproduce, which made the name a
    // second lie: pick `sleep-diary` expecting Sleep Tight and you got a
    // different widget.
    //
    // The decision was to keep the type rather than retire it, so it is pointed
    // at what a sleep diary actually is. Zero stored blocks carry this type, so
    // the retarget changes no live content — it changes what a NEW one does.
    case 'sleep-diary':  return 'input-table';
    default:             return 'read';
  }
}

// ── Interaction metadata (for admin UIs) ────────────────────────────
/**
 * What each interaction IS, and what it DRAWS.
 *
 * `previewHint` describes the rendered widget. Those strings were the only
 * documentation of what an interaction actually looks like, and they were lost
 * when `EQUIP_BLOCK_TYPES` / `CHECKIN_BLOCK_TYPES` were deleted from the viewer
 * — the render sites survived and went on printing `block.previewHint` against
 * nothing. Recovered from `040a4cfe^` and re-hung here, where they belong: on
 * the interaction, not on a hardcoded copy of the block list.
 *
 * Each is marked with its provenance. `recovered` is verbatim from the deleted
 * arrays; `written` was read off `BlockRenderer` because no recovered string
 * described that interaction — those six had no documentation to lose.
 */
export const INTERACTION_META: Record<InteractionType, {
  label: string; verb: string; icon: string; description: string;
  /** What the user sees on screen. */
  previewHint: string;
  /** Where `previewHint` came from, so a reader knows what it is worth. */
  hintSource: 'recovered' | 'written';
}> = {
  'read':        { label: 'Read',           verb: 'Reads',    icon: 'book-open',      description: 'User reads/scrolls through content',
                   previewHint: 'Formatted prose with optional media — the primary learning block', hintSource: 'recovered' },
  'view':        { label: 'View',           verb: 'Views',    icon: 'film',           description: 'User watches embedded video or media',
                   // Renamed from `watch` 2026-09-08, and given a renderer the same
                   // day. It returned renderLesson() for as long as it existed, so a
                   // video block drew the PROSE layout — which is why this hint used
                   // to read "no renderer of its own".
                   previewHint: 'The video, played inline, with any content below it as a caption', hintSource: 'written' },
  'listen':      { label: 'Listen',         verb: 'Listens',  icon: 'headphones',     description: 'User plays an audio track',
                   previewHint: 'An audio player, with an optional transcript folded beneath it', hintSource: 'written' },
  'rank':        { label: 'Rank',           verb: 'Ranks',    icon: 'list',           description: 'User puts a list in order of preference',
                   previewHint: 'A numbered list, reordered with up and down controls', hintSource: 'written' },
  'review-table':{ label: 'Review Table',   verb: 'Reviews',  icon: 'table',          description: 'Read-back of earlier days\u2019 table entries — the carry-forward view',
                   previewHint: 'No renderer yet — declared so it can be authored once one exists', hintSource: 'written' },
  'pick-date':   { label: 'Pick a Date',    verb: 'Picks',    icon: 'calendar',       description: 'User chooses a date or a time',
                   previewHint: 'A native date control, or date-and-time when the block asks for both', hintSource: 'written' },
  'select-one':  { label: 'Select One',     verb: 'Selects',  icon: 'circle-dot',     description: 'User picks one option from a list',
                   previewHint: 'Radio button list — only one option can be selected', hintSource: 'recovered' },
  'select-many': { label: 'Select Many',    verb: 'Selects',  icon: 'check-square',   description: 'User picks multiple options',
                   previewHint: 'Chip/tag grid where multiple items can be selected', hintSource: 'recovered' },
  'write':       { label: 'Write',          verb: 'Writes',   icon: 'pen-line',       description: 'User types free-form text response',
                   previewHint: 'Multi-line textarea for free-form responses', hintSource: 'recovered' },
  'rate':        { label: 'Rate',           verb: 'Rates',    icon: 'star',           description: 'User picks a number on a scale',
                   previewHint: 'Horizontal slider with numeric range and endpoint labels', hintSource: 'recovered' },
  'check':       { label: 'Check Off',      verb: 'Checks',   icon: 'list-checks',    description: 'User toggles items in a checklist',
                   previewHint: 'List of checkboxes that users tick off as they complete', hintSource: 'recovered' },
  'track-table': { label: 'Track (Table)',   verb: 'Tracks',   icon: 'table',          description: 'User fills yes/no grid or diary',
                   previewHint: 'Grid with a labelled first column and a yes/no toggle per cell', hintSource: 'written' },
  'input-table': { label: 'Input (Table)',   verb: 'Enters',   icon: 'grid-3x3',       description: 'User fills data into table cells',
                   previewHint: 'Grid of text cells; predefined row labels make the first column read-only', hintSource: 'written' },
  'clinical':    { label: 'Clinical Scale',  verb: 'Answers',  icon: 'clipboard-list', description: 'User answers scored clinical instrument',
                   previewHint: 'Scored Likert rows — defaults to Not at all / Several days / More than half / Nearly every day', hintSource: 'written' },
  'upload':      { label: 'Upload',          verb: 'Uploads',  icon: 'upload',         description: 'User uploads a file (document, image, audio)',
                   previewHint: 'File picker accepting images, PDF, documents and audio', hintSource: 'written' },
  'number':      { label: 'Number',          verb: 'Enters',   icon: 'hash',           description: 'User enters a single numeric value',
                   previewHint: 'Single numeric input, using the prompt as its placeholder', hintSource: 'written' },
  'complete':    { label: 'Complete',        verb: 'Finishes', icon: 'flag',           description: 'Day-ending summary or conclusion',
                   previewHint: 'Summary card with motivational closing content', hintSource: 'recovered' },
};

/**
 * What a block needs to do its job — options, columns, prompt, scale.
 *
 * Renamed from `ExerciseConfig` 2026-09-04: it is carried by every block type,
 * not only `exercise` — a `lesson` and a `conclude` hold one too — so the name
 * described one case out of six.
 */
export interface ActivityConfig {
  /**
   * The block's RESPONSE IDENTITY, declared by the author.
   *
   * A block's answers file under its `id`, so the same question asked on seven
   * days is seven ids and seven unrelated answers. 98 live blocks say otherwise
   * here — 61 distinct keys, 14 of them carried by more than one block (51
   * blocks in all), e.g.
   * `sleep_quality_day1` on days 1-7 of Sleep Tight under seven different ids.
   * The field was undeclared and read by no code, so every one of those series
   * was silently broken apart.
   *
   * Read it through `responseKeyOf(block)`, never directly: identity must have
   * one definition, and for the 309 blocks with no key that definition is the
   * block id, exactly as before.
   */
  key?: string;
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
  /* ── The four interactions built 2026-09-08 (build-order step 7) ────── */
  /** `listen`: an optional transcript, shown under the player. */
  transcript?: string;
  /** `pick-date`: ask for a time as well as a date. */
  time?: boolean;
  /** `pick-date`: bounds, as ISO dates. */
  minDate?: string;
  maxDate?: string;
  /** `review-table`: which response series to read back — a `key` from another block. */
  source_key?: string;
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

/** @deprecated Use `ActivityConfig`. Kept so the 22 existing type references keep compiling. */
export type ExerciseConfig = ActivityConfig;

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
  type: BlockType;
  /** Unified interaction type. Preferred over type+subtype when present. */
  interaction?: InteractionType;
  /**
   * WHAT THE USER DOES — the activity, at block level.
   *
   * Written onto all 407 live blocks by the 2026-09-08 remap, canonicalised
   * (`matrix` became `comparison-matrix`, `scale` became `rating-scale`). The
   * older location is `activityConfig.subtype`, which only 187 carry.
   *
   * READ NEITHER DIRECTLY — use `activityOf(block)`. 220 blocks carry the
   * activity ONLY here, so a direct `activityConfig.subtype` read is blind to
   * more than half the corpus.
   */
  activity?: ExerciseSubtype | keyof typeof SUBTYPE_ALIASES;
  content: string;
  duration: number; // in minutes
  required: boolean;
  data_id?: string;
  order: number;
  /**
   * The block's configuration. `activityConfig` is the name; `exerciseConfig`
   * is what 906 live blocks are stored under and is being migrated away.
   *
   * READ NEITHER DIRECTLY during the migration — use `configOf(block)`, which
   * prefers the new name and falls back to the old. `normaliseBlock` populates
   * both on load, so a block loaded through it is safe either way; server code
   * that reads raw KV is not.
   */
  activityConfig?: ActivityConfig;
  /** @deprecated The stored name. Being migrated to `activityConfig`. */
  exerciseConfig?: ActivityConfig;
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
  /*
    `dayType` was here. Removed 2026-09-08, §19 step 3.

    A day no longer has a type. It carries `policy` and `layout` of its own,
    written by whichever template seeded it, and nothing is derived from a type
    string any more — not the player's layout, not its save behaviour, not what
    the block palette offers.

    `DayType` itself survives as the name of a TEMPLATE (`DAY_TYPE_PRESETS`,
    `DAY_TYPE_LAYOUTS`, `DAY_TYPE_POLICIES`), which is all it ever honestly was.
  */
  /**
   * What this day OBEYS — autoAdvance, navigation, save behaviour, step rules.
   * Absent means "resolve from `dayType`"; `policyOf(day)` is the only reader.
   */
  policy?: import('./day-policy.ts').DayPolicy;
  /**
   * What this day LOOKS LIKE — layout, progress style, button labels, headings.
   * Absent means "resolve from `dayType`"; `layoutOf(day)` is the only reader.
   */
  layout?: import('./day-layout.ts').DayLayout;
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

/**
 * The block's config, whichever name it is stored under.
 *
 * `exerciseConfig` -> `activityConfig` is a three-step migration: ship this
 * accessor, migrate the 906 stored blocks across three prefixes, then drop the
 * old name. Until the last step, anything reading the config must come through
 * here — a direct `.exerciseConfig` read breaks on a migrated block and a
 * direct `.activityConfig` read breaks on one that has not been migrated yet.
 */
export function configOf(block: Pick<Activity, 'activityConfig' | 'exerciseConfig'> | undefined | null): ActivityConfig | undefined {
  return block?.activityConfig ?? block?.exerciseConfig;
}

/**
 * What a block's response is filed under, logically.
 *
 * The stored map is still keyed by block id — this does not change where an
 * answer is written. It is the answer to a different question: *which other
 * blocks are the same question as this one*. An author who repeats a question
 * across days gives each occurrence the same `activityConfig.key`; without a
 * key a block is only ever itself, which is every block's behaviour today.
 *
 * Total by construction, so a caller never has to branch on presence.
 */
/**
 * The block's activity, from either place it is stored.
 *
 * A seventh two-representations-of-one-entity, created 2026-09-08: the block
 * remap wrote a top-level `activity` on all 407 blocks while
 * `activityConfig.subtype` — the only field `resolveInteraction` read — remained
 * on 187. So **220 blocks carried an activity the resolver could not see**.
 *
 * Nothing mis-rendered, because every block also carries an explicit
 * `interaction` and the resolver returns on that first. It is a trap with a
 * date on it: build-order step 5 stops writing `interaction`, and on that day
 * those 220 would resolve from their type alone.
 *
 * The two never actually conflict. All 11 rows where both are present and
 * differ are alias-versus-canonical — `matrix`/`comparison-matrix`,
 * `row_list`/`structured-list`, `scale`/`rating-scale` — and normalise to the
 * same term. Top level wins because the remap canonicalised it.
 */
export function activityOf(
  block: Pick<Activity, 'activity' | 'activityConfig' | 'exerciseConfig'> | undefined | null,
): string | undefined {
  return block?.activity ?? configOf(block ?? undefined)?.subtype;
}

export function responseKeyOf(block: Pick<Activity, 'id' | 'activityConfig' | 'exerciseConfig'>): string {
  const k = configOf(block)?.key;
  return typeof k === 'string' && k.trim() ? k.trim() : block.id;
}
