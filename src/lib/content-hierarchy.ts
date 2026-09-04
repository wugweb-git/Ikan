/**
 * The content hierarchy — collection / stage / step / block.
 *
 * **Nothing reads these yet.** This is blocks.md §14 and §18 Phase 3.1-3.2 at
 * type level only: the target shape, declared alongside the four storage models
 * that exist today, so migration is a strangler rather than a cutover. The seam
 * already works — `resolveInteraction()` opens with
 * `if (activity.interaction) return activity.interaction`, so a block written in
 * this shape is already understood by today's player.
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
import type { InteractionType, DayType } from './equip-admin-types';

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
  interaction: InteractionType;
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
  /** Only the fields this interaction needs — see INTERACTION_REQUIREMENTS. */
  config?: Record<string, unknown>;
  position: number;
  required: boolean;
  duration?: number;
  media_ref?: string;
}

/**
 * The ten interactions that produce a response, and therefore require a `key`.
 * (`number` joined them on 2026-09-04; the other three — read, watch, complete —
 * are passive and produce nothing.)
 */
export const RESPONSE_PRODUCING: readonly InteractionType[] = [
  'select-one', 'select-many', 'rate', 'clinical',
  'check', 'input-table', 'track-table', 'write', 'number', 'upload',
];

/** The four whose option set comes from the catalog rather than from the block. */
export const SCALE_BACKED: readonly InteractionType[] = [
  'select-one', 'select-many', 'rate', 'clinical',
];

/**
 * What each interaction requires and produces.
 *
 * `INTERACTION_META` already carries a label, verb, icon and description for all
 * twelve — that vocabulary exists and is correct. What it lacks is this: a
 * statement of what config each one needs, which is what lets an editor show
 * only the right fields instead of one `exerciseConfig` with 20 optional ones.
 */
export interface InteractionRequirement {
  requires: readonly string[];
  optional: readonly string[];
  /** Shape of the stored answer. `null` = the interaction produces none. */
  produces: string | null;
}

export const INTERACTION_REQUIREMENTS: Record<InteractionType, InteractionRequirement> = {
  // Passive — no response, completion only
  'read':        { requires: [],                              optional: ['media_ref'],                      produces: null },
  'watch':       { requires: ['media_ref'],                   optional: ['content'],                        produces: null },
  'complete':    { requires: ['content'],                     optional: [],                                 produces: null },
  // Scale-backed — the option set comes from the catalog, never inline
  'select-one':  { requires: ['scale_ref'],                   optional: ['correct_option'],                 produces: 'option_id' },
  'select-many': { requires: ['scale_ref'],                   optional: ['min', 'max'],                     produces: 'option_id[]' },
  'rate':        { requires: ['scale_ref'],                   optional: ['display'],                        produces: 'option_id' },
  'clinical':    { requires: ['scale_ref', 'instrument_ref'], optional: ['reverse', 'section_ref'],         produces: 'option_id' },
  // Structured — the block defines its own shape
  'check':       { requires: ['items'],                       optional: ['min_required'],                   produces: 'item_id[]' },
  'input-table': { requires: ['columns', 'rows'],             optional: ['allow_add_rows', 'column_types'], produces: 'cell map' },
  'track-table': { requires: ['columns', 'rows'],             optional: [],                                 produces: 'boolean map' },
  'write':       { requires: ['prompt'],                      optional: ['max_length', 'ephemeral'],        produces: 'text' },
  'number':      { requires: ['prompt'],                      optional: ['min', 'max', 'unit'],             produces: 'number' },
  'upload':      { requires: ['accepted_types'],              optional: ['max_size'],                       produces: 'file_ref' },
};

/** A block is complete when its interaction's requirements are met and, if it answers, it is named. */
export function missingRequirements(b: Block): string[] {
  const spec = INTERACTION_REQUIREMENTS[b.interaction];
  if (!spec) return [`unknown interaction "${b.interaction}"`];
  const missing: string[] = [];
  for (const field of spec.requires) {
    const present =
      field === 'scale_ref' ? !!b.scale_ref :
      field === 'media_ref' ? !!b.media_ref :
      field === 'prompt'    ? !!b.prompt :
      field === 'content'   ? !!b.content :
      !!b.config?.[field];
    if (!present) missing.push(field);
  }
  if (RESPONSE_PRODUCING.includes(b.interaction) && !b.key) missing.push('key');
  return missing;
}
