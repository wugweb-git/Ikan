import type { Interaction, ActivityName } from './vocabulary.ts';
import { ACTIVITIES, interactionsOf, isActivity } from './vocabulary.ts';

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
/**
 * INTERACTIONS — the nine. §26, 2026-09-09.
 *
 * The previous seventeen (`read`, `select-one`, `input-table`, `track-table`…)
 * are **gone, not deprecated**. They named widgets, which is why they kept
 * multiplying: every new way of drawing something became a new "interaction".
 * The nine name what the USER is doing, which is a closed set.
 *
 * The list itself lives in `vocabulary.ts` with the activities that carry it, so
 * there is one file to read and one file to change.
 */
export type InteractionType = Interaction;
export { INTERACTIONS } from './vocabulary.ts';

/*
  `INTERACTIONS_WITHOUT_RENDERER` and `authorableInteractions()` were here.

  They answered "can this be drawn yet", asked of an INTERACTION — which only
  made sense while an interaction was a widget. Under §26 an interaction is
  cognitive and never draws anything; the ACTIVITY is drawn. The question moved
  to `AUTHORABLE_ACTIVITIES` below, which is the same guard asked of the thing
  that actually has a renderer.
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
  'onboarding', 'assessment', 'learning', 'practice',
  'reflection', 'quiz', 'workshop', 'tracker', 'check-in',
  /*
    `rest` and `assessment-lite` were here and are RETIRED — §27 step 6,
    2026-09-09. Zero live blocks carried either, counted before the removal.

    Both survive as DAY TEMPLATES (`DAY_TYPES`, `DAY_TYPE_PRESETS`,
    `DAY_TYPE_LAYOUTS`), which is what they always honestly were: a rest day is
    a day with no task, not a kind of block, and `assessment-lite` describes how
    a day is scored rather than what a block does. §19 settled that a template
    seeds a day and constrains nothing afterwards, which is what makes keeping
    one and dropping the other coherent rather than half a deletion.
  */
] as const;

/** What a block may BE — 15, since no block holds another. */
export type BlockType = typeof LEAF_BLOCK_TYPES[number];

/**
 * ACTIVITIES — the twenty-nine. §26, 2026-09-09.
 *
 * Replaces the twenty. Nine are new (`slider`, `boolean`, `text`, `date`, `time`,
 * `location`, `record`, `consent`, `timer`, `paced-breathing`), one is renamed
 * (`table` -> `check-grid`), and `comparison-matrix` is on its way out — it is
 * not in the list, and until its 17 live blocks are retyped it resolves through
 * the alias table to `input-table`, which is what it has always drawn.
 *
 * `ExerciseSubtype` keeps its name as an alias only because `ActivityConfig` and
 * a dozen call sites are typed against it; it IS `ActivityName`.
 */
export { ACTIVITY_SPECS, interactionsOf, requiresOf, activitiesFor, LABELS, TWO_INTERACTIONS, ACTIVITY_HINTS, isActivity } from './vocabulary.ts';
export { ACTIVITIES };
export type { Interaction, ActivityName };
export const EXERCISE_SUBTYPES = ACTIVITIES;
export type ExerciseSubtype = ActivityName;

/**
 * The activities an author may pick — those with a renderer.
 *
 * Declared, not offered: eleven of the twenty-nine have no case in
 * `BlockRenderer` yet. A block carrying one would fall to the default and draw
 * something else, which is the defect `watch` taught this module in 2026-09.
 * The editor filters against this list; the viewer shows the rest as declared.
 */
export const ACTIVITIES_WITHOUT_RENDERER: readonly ActivityName[] = [
  'listen', 'table-review', 'paced-breathing', 'boolean', 'slider', 'ranking',
  'consent', 'text', 'date', 'time', 'location', 'timer', 'record',
];

export const AUTHORABLE_SUBTYPES: readonly ActivityName[] =
  ACTIVITIES.filter((a) => !ACTIVITIES_WITHOUT_RENDERER.includes(a));

/*
  `SUBTYPE_ALIASES` was here — thirty-odd retired spellings, each silently
  rewritten to a canonical term on every read.

  Removed 2026-09-09 (§26). An alias table is a resolver that hides its own
  input: live content could carry `comparison-matrix` for a year and the page
  would look correct, because the read fixed it every time and nothing fixed the
  store. Seventeen blocks did exactly that.

  The record of what each spelling became lives in the commits that removed
  them, not in the product: a list of dead terms shipped inside the app is still
  a list of dead terms. Nothing in the store carries one — 840 of 840 blocks
  resolve to one of the twenty-nine.
*/

/**
 * Canonical or nothing.
 *
 * Keeps the name `normalizeSubtype` because forty call sites use it; what it no
 * longer does is normalise. A term is one of the twenty-nine or it is undefined,
 * and undefined is what makes a stale block visible instead of invisible.
 */
export function normalizeSubtype(raw: string | undefined | null): ActivityName | undefined {
  return isActivity(raw) ? raw : undefined;
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
/**
 * WHAT THIS BLOCK IS DRAWN AS — the canonical activity, or undefined.
 *
 * Replaces `resolveInteraction`, which returned one of seventeen widget names
 * and preferred the block's stored `interaction` field over everything else.
 * Under §26 an interaction is cognitive and draws nothing, so the question a
 * renderer asks is "which activity", and the answer comes from the block's own
 * activity — never from the stored `interaction`, which is now stale metadata on
 * 420 blocks and names a vocabulary that no longer exists.
 */
export function renderActivityOf(block: Activity): ActivityName | undefined {
  return normalizeSubtype(activityOf(block));
}

/**
 * WHAT THE USER IS DOING — one or more of the nine.
 *
 * `interaction = f(activity)` is no longer one-to-one: six activities carry two,
 * so this returns a set. An unknown activity returns an empty set rather than a
 * guess; the caller decides what an unrenderable block means.
 */
export function interactionsOfBlock(block: Activity): readonly Interaction[] {
  return interactionsOf(renderActivityOf(block));
}

/*
  `INTERACTION_META` — seventeen entries of label/verb/icon/description plus a
  `previewHint` describing the widget each one drew — is gone with the seventeen.
  The nine carry `label` + `doing` + `icon` in `vocabulary.ts`; a preview hint
  belongs to an ACTIVITY, which is the thing that draws.
*/
export { INTERACTION_META } from './vocabulary.ts';

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
   * The older of the two places an activity is stored. `string`, not
   * `ActivityName`, because live content still holds retired spellings — and
   * they now READ as what they are rather than being rewritten on the way past.
   */
  subtype?: string;
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

  // ── §26 step 2: the seven LABELS ────────────────────────────────
  /*
    Device-bound, every one of them. A label changes how something is DRAWN and
    never what it is — `grid` degrading to `list` on a narrow screen is the same
    activity, the same interaction and the same stored answer. Declared here so
    an author can set one; nothing derives an activity from a label.
  */
  /** `single` · `list` · `grid`. Any activity. */
  layout?: 'single' | 'list' | 'grid';
  /** `emoji` · `nps` · `dropdown` · `image`. Every choose activity and rating-scale. */
  display?: 'emoji' | 'nps' | 'dropdown' | 'image';
  /** `email` · `phone` · `url`. `text` only. */
  format?: 'email' | 'phone' | 'url';
  /** `one` · `many`. Choose activities. */
  cardinality?: 'one' | 'many';
  /** `pick` · `capture`. Submit activities. */
  source?: 'pick' | 'capture';
  /** Share activities: whether the answer is kept, and how long it may be. */
  persist?: boolean;
  length?: number;
  /** `up` · `down`. `timer` only. */
  mode?: 'up' | 'down';

  // ── §26: what the new activities require ────────────────────────
  /** `slider` — the continuum's ends and its granularity. */
  min?: number;
  max?: number;
  step?: number;
  /** `table-review` — which earlier series to read back. Not `columns`: a review
      that declared columns would be a second table, not a view of the first. */
  source_key?: string;
  /** `consent` — the statement, stored as shown alongside the answer. */
  statement?: string;
  /** `paced-breathing`. */
  pattern?: string;
  cycles?: number;
  /** `ranking` · `structured-list`. */
  items?: string[];
  /** `location`. */
  precision?: string;
  /** `record`. */
  max_duration?: number;
  /** `upload` — the §26 spelling of `acceptedFileTypes`. */
  accepted_types?: string[];
  /** Scale-backed activities: the shared option set, rather than inlined options. */
  scale_ref?: string;
  /** `clinical-instrument`. */
  instrument_ref?: string;

  /*
    STORED SPELLINGS the editor already writes. `slider_min`/`slider_max` were
    written by the rating-scale fields and were undeclared, so every write to
    them was a type error the baseline absorbed.
  */
  slider_min?: number;
  slider_max?: number;
  slider_labels?: string[];
  constraints?: { min?: number; max?: number };

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
  activity?: string;
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

/**
 * A block row's repeat, in words. Display only — `repeatTargetDays` remains the
 * authority on where a block actually appears.
 *
 * `targetsNone` is the case worth showing rather than hiding: the editor writes
 * `{type: 'simple_repeat', onDays: []}` the moment the toggle is turned on, so a
 * block whose author never picked a day carries a repeat that repeats nothing.
 * Four live blocks are in exactly that state. Rendering nothing for them would
 * make the row agree with the player and disagree with the editor, which is how
 * an author loses an unfinished setting without ever being told.
 */
export interface RepeatSummary {
  label: string;
  targetsNone: boolean;
}

export function repeatSummary(
  activity: Pick<Activity, 'repeat'>,
  homeDay: number,
  totalDays: number,
): RepeatSummary | null {
  const r = activity.repeat;
  if (!r) return null;

  const targets = repeatTargetDays(activity as Activity, homeDay, totalDays)
    .filter((d) => d !== homeDay);
  if (targets.length === 0) return { label: 'no days set', targetsNone: true };

  if (r.everyDay) return { label: 'every day', targetsNone: false };
  if (r.type === 'on_demand' && typeof r.onDemandFromDay === 'number') {
    return { label: `from day ${r.onDemandFromDay}`, targetsNone: false };
  }
  if (targets.length === 1) return { label: `day ${targets[0]}`, targetsNone: false };

  const contiguous = targets.every((d, i) => i === 0 || d === targets[i - 1] + 1);
  if (contiguous) {
    return { label: `days ${targets[0]}\u2013${targets[targets.length - 1]}`, targetsNone: false };
  }
  const shown = targets.slice(0, 3).join(', ');
  const rest = targets.length - 3;
  return { label: `days ${shown}${rest > 0 ? ` +${rest}` : ''}`, targetsNone: false };
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
