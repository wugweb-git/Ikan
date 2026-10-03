/**
 * The content hierarchy — collection / stage / step / block.
 *
 * This is blocks.md §14 and §18 Phase 3.1-3.2: the target shape, declared
 * alongside the storage model that exists today, so migration is a strangler
 * rather than a cutover. The seam already works — `resolveInteraction()` opens
 * with `if (activity.interaction) return activity.interaction`, so a block
 * written in this shape is already understood by today's player.
 *
 * **The file was imported by its own test and nothing else** until 2026-09-08.
 * `blockOf()` below is the strangler seam actually being crossed: it reads a
 * live `Activity` as a `Block`, so `missingRequirements` — the one place that
 * states what each interaction needs — can run against production content. The
 * Block Type Viewer counts what it reports; the editor shows it per block.
 *
 * ## Why one shape
 *
 * Equip has programmes of days of blocks. Assessments have a flat question list.
 * Check-in has a linear template of steps. Those are the same structure at
 * different depths, and the reason there are separate builders is that nobody
 * wrote that down:
 *
 * | | stages | preset | answers go to | scoring |
 * |---|---|---|---|---|
 * | Equip programme | 31 | varies per day | a progress row | none |
 * | Assessment | 1 | `assessment` | a result row | a scoring spec |
 * | Check-in template | 1 | `check-in` | a journal row | none |
 *
 * Only the top two levels differ, and they differ in three fields. Steps and
 * blocks are identical in all three. That is the whole claim.
 *
 * ## What this fixes that the current model cannot express
 *
 * - **`key`** — ten of the thirteen interactions produce a response, and not one
 *   stored block names where its answer goes. Answers file under a block id, so
 *   day 3's "hours slept" and day 17's are unrelated facts. That is why 98 of
 *   Sleep Tight's input-tables cannot be charted and a 31-day sleep diary
 *   produces no diary. Check-in already solved this with `save_as`; this adopts
 *   check-in's idea, not the block model's absence of one.
 * - **`scale_ref`** — four interactions need an ordered option set. Today
 *   assessments inline the PHQ/GAD scale 27 separate times, equip inlines
 *   options per block, and only check-in references a scale by key. One
 *   reference collapses all three.
 * - **`Step`** — already exists as `Activity.stepGroup`, an optional string on a
 *   leaf, governed by preset rules that genuinely run. Promoting it to a real
 *   level is what lets a linear check-in and a workshop day be one structure.
 * - **`role`** — `type` answers two questions at once. `exercise`/`checklist`/
 *   `journal` describe the shape of the answer, which `interaction` says better;
 *   `lesson`/`reflection`/`quiz`/`conclude` describe why the block is there,
 *   which nothing else says. Splitting them makes `lesson · multi-select`
 *   sayable instead of accidental.
 */
import type { DayType, Activity } from './block-model.ts';
import { configOf, renderActivityOf } from './block-model.ts';
import { ACTIVITIES, ACTIVITY_SPECS, requiresOf, type ActivityName } from './vocabulary.ts';

/** Why a block is here. Editorial, open, catalog-backed — as against `interaction`, which is closed. */
export type BlockRole =
  | 'lesson'
  | 'practice'
  | 'reflection'
  | 'quiz'
  | 'conclude'
  | 'tracker'
  | 'assessment';

/** Where a collection's answers land. A property of the collection, not of a block. */
export type ResponseTarget = 'progress' | 'result' | 'journal';

/** What a user starts: an equip programme, an assessment instrument, or a check-in template. */
export interface Collection {
  id: string;
  slug: string;
  title: string;
  category_id?: string;
  published: boolean;
  content_version?: string;
  /** The one field that makes an assessment an assessment. Only assessments carry a spec. */
  scoring_profile_id?: string;
  response_target: ResponseTarget;
  stages: Stage[];
}

/** One sitting: a day (×31), or the whole instrument (×1), or the whole template (×1). */
export interface Stage {
  id: string;
  position: number;
  title: string;
  subtitle?: string;
  /** Policy, not rendering — what may be placed, how many fit a screen, nav and save behaviour. */
  preset_id: DayType;
  /** Absent means available immediately. */
  unlock_after_stage_id?: string;
  steps: Step[];
}

/** One navigable screen. Today this is `Activity.stepGroup`, an optional string on a leaf. */
export interface Step {
  id: string;
  position: number;
  /** Overrides the preset's nav policy for this screen only. Rare. */
  auto_advance?: boolean;
  blocks: Block[];
}

/** One interaction. The primitive — today's `Activity`, minus everything the resolver had to guess. */
export interface Block {
  id: string;
  /** WHAT THE USER DOES. Required, authored, never derived. Replaces type + subtype + the resolver. */
  /** WHAT IT IS — the canonical §26 activity. Was `interaction`, one of seventeen. */
  activity: ActivityName | undefined;
  /** WHY IT IS HERE. Optional; defaults from the stage preset. */
  role?: BlockRole;
  title?: string;
  /** The question, or the content. */
  prompt?: string;
  content?: string;
  /**
   * WHERE THE ANSWER GOES. Required for the ten interactions that produce one,
   * and unique within the collection. This is the field whose absence makes a
   * 31-day diary into 98 unrelated answers.
   */
  key?: string;
  /** The shared option set, for select-one / select-many / rate / clinical. Never inlined. */
  scale_ref?: string;
  /** Only the fields this activity needs — see `ACTIVITY_SPECS`. */
  config?: Record<string, unknown>;
  position: number;
  required: boolean;
  duration?: number;
  media_ref?: string;
}

/**
 * The activities that produce a response, and therefore require a `key`.
 *
 * Derived, not listed: §26 states what each activity produces, and an activity
 * that produces nothing cannot need a name for it. The previous version was a
 * hand-written list of ten interaction names, and it had already gone stale
 * twice — once when `number` was added, once when `rank` and `pick-date` were.
 */
export const RESPONSE_PRODUCING: readonly ActivityName[] =
  ACTIVITIES.filter((a) => ACTIVITY_SPECS[a].produces !== '');

/** The activities whose option set comes from the catalog rather than the block. */
export const SCALE_BACKED: readonly ActivityName[] =
  ACTIVITIES.filter((a) => (ACTIVITY_SPECS[a].requires as readonly string[]).includes('scale_ref'));

/*
  `INTERACTION_REQUIREMENTS` was here — seventeen rows of requires/optional/
  produces, keyed by interaction.

  §26 moves all three onto the ACTIVITY, which is the thing that has fields to
  require and an answer to produce; an interaction is cognitive and has neither.
  The table now lives in `vocabulary.ts` as `ACTIVITY_SPECS`, and the `optional`
  column is gone with it: nothing read it, and a list of fields that may or may
  not appear is not a statement anyone could act on.
*/

/** What a block of this activity must carry. */
export function requirementsOf(activity: ActivityName | undefined): readonly string[] {
  return activity ? requiresOf(activity) : [];
}

/** A block is complete when its activity's requirements are met and, if it answers, it is named. */
export function missingRequirements(b: Block): string[] {
  const activity = b.activity;
  if (!activity || !(activity in ACTIVITY_SPECS)) {
    return [`unknown activity "${activity ?? '(none)'}"`];
  }
  const missing: string[] = [];
  for (const field of requiresOf(activity)) {
    const present =
      field === 'scale_ref' ? !!b.scale_ref :
      field === 'media_ref' ? !!b.media_ref :
      field === 'prompt'    ? !!b.prompt :
      field === 'content'   ? !!b.content :
      !!b.config?.[field];
    if (!present) missing.push(field);
  }
  if ((RESPONSE_PRODUCING as readonly string[]).includes(activity) && !b.key) missing.push('key');
  return missing;
}


/**
 * Read a live `Activity` in the target shape.
 *
 * This is the strangler seam. The stored model spreads one interaction's inputs
 * across `content`, `image_url` and twenty optional `activityConfig` fields;
 * the target model names them. Mapping is one-way and lossy on purpose — only
 * the fields `INTERACTION_REQUIREMENTS` reasons about are carried.
 *
 * Two mappings are worth stating because they make live content report as
 * incomplete, correctly:
 *
 * - **`scale_ref` is never populated.** No stored block references a shared
 *   scale; they all inline their options. Every select-one / select-many /
 *   rate / clinical block therefore reports `scale_ref` missing, which is the
 *   27-copies-of-one-scale problem stated as a number rather than a paragraph.
 * - **`key` comes from `activityConfig.key` alone**, not from `responseKeyOf`.
 *   The id fallback is what makes a block resolvable; it is not the author
 *   having named where the answer goes, and this check is about the naming.
 */
export function blockOf(activity: Activity, position?: number): Block {
  const cfg = configOf(activity) ?? {};
  const config: Record<string, unknown> = {
    // Target name on the left, every stored spelling on the right.
    columns:        cfg.columns ?? cfg.tableColumns,
    rows:           cfg.rows ?? cfg.tableRows,
    items:          cfg.listItems ?? cfg.options,
    accepted_types: cfg.acceptedFileTypes,
    options:        cfg.options,
  };
  for (const k of Object.keys(config)) if (config[k] === undefined) delete config[k];

  return {
    id: activity.id,
    activity: renderActivityOf(activity),
    title: activity.title,
    prompt: cfg.prompt,
    content: activity.content,
    key: typeof cfg.key === 'string' && cfg.key.trim() ? cfg.key.trim() : undefined,
    // Deliberately absent — see the note above.
    scale_ref: undefined,
    config,
    position: position ?? activity.order ?? 0,
    required: !!activity.required,
    duration: activity.duration,
    media_ref: activity.image_url,
  };
}
