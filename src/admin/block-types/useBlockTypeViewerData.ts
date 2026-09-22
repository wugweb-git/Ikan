import { useMemo } from 'react';
import { AUTHORABLE_SUBTYPES, LEAF_BLOCK_TYPES } from '../block-builder/model/block-model';
import { missingRequirements, blockOf } from '../block-builder/model/content-hierarchy';
import {
  INTERACTIONS, ACTIVITIES as CANONICAL_SUBTYPES, LABELS,
} from '../block-builder/model/vocabulary';
import { useMetadata } from '../ui/hooks/useMetadata';
import { useBlockUsage, type BlockUsage } from '../ui/hooks/useBlockUsage';

export type UsageState = 'loading' | 'ok' | 'failed';
export type UsageDimension = 'interactions' | 'blockTypes' | 'activities' | 'dayTypes';
export type { BlockUsage };

export interface ExerciseSubtypeRow {
  value: string;
  label: string;
  description: string;
  icon?: string;
  selectable: boolean;
  inCatalog: boolean;
}

/*
  §26, 2026-09-09. The page reads the vocabulary module directly: nine
  interactions, twenty-nine activities, seven labels, and one preview hint per
  activity. It used to read seventeen `INTERACTION_META` entries and derive the
  activity list from `EXERCISE_SUBTYPES`.
*/
export const INTERACTION_TYPES = [...INTERACTIONS];

/*
  THE BLOCK TYPES, and only those — `LEAF_BLOCK_TYPES`.

  This unioned the day TEMPLATES into the list, which was right while the two
  vocabularies were one and wrong the moment §27 step 6 separated them: `rest`
  and `assessment-lite` are templates and no longer block types, so the union
  counted 17 against a store holding 15 and reported DRIFT on a catalog that
  was correct. A tile that cries wolf is worse than no tile.

  The templates are not lost from the page — each block type's row still shows
  its preset where it has one, and the day-template list is its own thing.

  (`pickableBlockTypes` and `containerBlockTypes` were removed 2026-09-08: the
  first fed a split list that no longer exists, the second fed the "Stages with
  rules" tile, whose `can_hold` ⟺ preset invariant is asserted at
  `block-type-rules.test.ts:125` instead.)
*/
export const BLOCK_TYPE_VOCABULARY: string[] = [...LEAF_BLOCK_TYPES];

/**
 * Leaf block types draw whatever their bare type resolves to.
 *
 * `exercise` is the exception and must be stated, not derived: a bare
 * `exercise` with no activity resolves to `write`, so deriving its hint made
 * the page claim all 187 exercise blocks draw a textarea. They draw nine
 * different widgets — the activity decides, which is the whole point of the
 * Activities tab.
 */
export const LEAF_HINTS: Record<string, string> = Object.fromEntries(
  LEAF_BLOCK_TYPES.map((t) => {
    if (t === 'exercise') {
      return [t, 'Depends entirely on its activity — see the Activities tab'];
    }
    /*
      A bare type with no activity draws nothing of its own any more. It used
      to fall through a switch on `type`; §26 makes the ACTIVITY the thing that
      draws, so a type is a category and the honest answer is to say so.
    */
    return [t, 'Depends on the block’s activity — a type does not draw.'];
  }),
);

/**
 * Most-used first, unused last, declaration order within a tie.
 *
 * The page listed every vocabulary in catalog order, which gave a term nobody
 * has ever used the same prominence as one carried by 187 blocks. Ranking is
 * the cheapest way to make the shape of the data visible: on every tab the
 * handful of real values now sit at the top and the long tail reads as a tail.
 *
 * With the feed down the order is left ALONE — `null` sorts as a tie, so the
 * list keeps catalog order rather than inventing a ranking out of unknowns.
 */
export const byLiveCount = <T,>(rows: T[], countFor: (row: T) => number | null): T[] =>
  rows
    .map((row, i) => ({ row, i, n: countFor(row) ?? 0 }))
    .sort((a, b) => (b.n - a.n) || (a.i - b.i))
    .map((x) => x.row);

/**
 * Like-for-like, or it cries wolf.
 *
 * This row used to print `code count / raw KV row count`, comparing a DERIVED
 * number against a RAW one, so correct behaviour rendered exactly like drift.
 * Worse, it compared the catalog against a hardcoded 7-entry block-type array
 * this screen kept — after the quiz/reflection flip that read
 * `7 / 5 · DRIFT`, blaming the data for a stale constant. The array is gone.
 *
 * Counts expected to differ — stages, blocks, aliases — are their own figure,
 * never the denominator of a ratio. DRIFT means DRIFT.
 */
const compare = (code: number, catalog: number, aside?: string) => {
  const suffix = aside ? ` · ${aside}` : '';
  if (catalog === 0) return `${code}${suffix}`;          // catalog not loaded
  if (code === catalog) return `${code}${suffix}`;
  return `${code} / ${catalog} in catalog · DRIFT${suffix}`;
};

/** Everything the Block Type Viewer reads: live usage, the catalog, and what is derived from both. */
export function useBlockTypeViewerData() {
  // Live usage, counted over `equip:` server-side. `null` means the feed failed
  // — which must NOT read as "everything is unused", so every count renders as
  // "—" rather than 0 until it arrives.
  const { usage, usageState } = useBlockUsage();

  const {
    blockTypes: kvBlockTypes,
    exerciseSubtypes: kvExerciseSubtypes,
    interactionTypes: kvInteractionTypes,
  } = useMetadata();

  /** Live count for a term, or null when the feed has not arrived. */
  const countOf = (dim: UsageDimension, term: string): number | null =>
    usage ? (usage[dim][term] ?? 0) : null;

  /**
   * What live content is missing, per interaction, judged by the one table that
   * says what each interaction needs.
   *
   * `INTERACTION_REQUIREMENTS` and `missingRequirements` were imported by their
   * own test and nothing else. They are the module's only written statement of
   * what a block of each kind requires — so rather than restate it in an
   * editor, this runs it over production content and reports the answer.
   *
   * The server sends FACTS (which config keys carry a value), never the target
   * field names; the mapping between the two is `blockOf`, and it exists once.
   * The probe block below is reconstituted from those facts: every present key
   * gets a truthy stand-in, except `subtype`, which needs its real value for
   * the resolver, and `key`, which must be a non-empty string.
   */
  const requirementGaps = useMemo(() => {
    const out: Record<string, { blocks: number; fields: Record<string, number> }> = {};
    for (const p of usage?.blockProbes ?? []) {
      const cfg: Record<string, unknown> = {};
      for (const k of p.c) cfg[k] = k === 'subtype' ? (p.s ?? true) : k === 'key' ? 'named' : true;
      const missing = missingRequirements(blockOf({
        id: 'probe',
        title: '',
        type: p.t as never,
        interaction: (p.i ?? undefined) as never,
        content: p.ct ? 'x' : '',
        duration: 0,
        required: false,
        order: 0,
        activityConfig: cfg,
        image_url: p.im ? 'x' : undefined,
      }));
      if (!missing.length) continue;
      const interaction = p.i ?? 'unknown';
      const bucket = (out[interaction] ??= { blocks: 0, fields: {} });
      bucket.blocks += p.n;
      for (const f of missing) bucket.fields[f] = (bucket.fields[f] ?? 0) + p.n;
    }
    return out;
  }, [usage]);

  // ── Exercise subtypes — derived, not declared ──────────────────
  // This screen used to hardcode its own 12-entry list, a third copy alongside
  // the catalog and the code. It had drifted from both: it presented
  // `rating_scale`, `clinical_instrument` and `comparison_matrix` (aliases) as
  // the canonical terms, listed `likert` as a subtype, and had no entry for
  // `number` — while missing every term actually found in live content.
  // Canonical terms come from code, labels and descriptions from the catalog,
  // and aliases are listed as aliases.
  const exerciseSubtypes = useMemo<ExerciseSubtypeRow[]>(() => {
    const row = (v: string) => kvExerciseSubtypes.find((r) => r.value === v);
    const canonical = CANONICAL_SUBTYPES.map((value) => ({
      value,
      label: row(value)?.label ?? value,
      description: row(value)?.description ?? 'No catalog description.',
      // The row's own icon. Every activity row declares one; this screen drew
      // a hardcoded PenTool on all twelve.
      icon: row(value)?.icon,
      /*
        `selectable` is what the badge reads, so it must mean what BlockEditor
        does — not "is canonical". It said `true` for all twenty, which put "In
        Editor" on `listen`, `date-time`, `table-review` and `ranking`: the four
        the editor deliberately filters out because their interaction has no
        renderer. The page was contradicting the guard it exists to report on.

        One source: `AUTHORABLE_SUBTYPES` is the same list the editor filters by,
        so the badge cannot drift from the picker again.
      */
      selectable: (AUTHORABLE_SUBTYPES as readonly string[]).includes(value),
      inCatalog: !!row(value),
    }));
    // Anything the catalog holds that code knows nothing about. Should be empty.
    const unknown = kvExerciseSubtypes
      .filter((r) => !(CANONICAL_SUBTYPES as readonly string[]).includes(r.value))
      .map((r) => ({
        value: r.value,
        label: r.label,
        description: 'In the catalog but not in the twenty-nine — nothing will draw it.',
        icon: r.icon,
        selectable: false,
        inCatalog: true,
      }));
    return [...canonical, ...unknown];
  }, [kvExerciseSubtypes]);

  /* Rows the catalog holds that are not one of the twenty-nine. Should be zero;
     each one is an orphan to delete, not vocabulary to count. */
  const orphanRows = exerciseSubtypes.length - CANONICAL_SUBTYPES.length;

  const statValues = {
    // Compares the code's leaf vocabulary against the catalog's, like the
    // other tiles, so it can report DRIFT.
    blockTypes: compare(BLOCK_TYPE_VOCABULARY.length, kvBlockTypes.length),
    activities: compare(CANONICAL_SUBTYPES.length, kvExerciseSubtypes.length,
                        orphanRows > 0 ? `${orphanRows} orphaned` : undefined),
    interactions: compare(INTERACTION_TYPES.length, kvInteractionTypes.length),
    /*
      WAS "Stages with rules 11" — DAY_TYPE_PRESETS against catalog containers.
      It restated a per-row badge, and presented containment as the page's
      headline structural fact when no block in production has ever been held
      by anything. What the page could not say, and now does: how much of each
      declared vocabulary anything actually uses — measured, not asserted, and
      "—" when the feed is down.
    */
    inUse: usageState !== 'ok'
      ? '—'
      : `${BLOCK_TYPE_VOCABULARY.filter((t) => (countOf('blockTypes', t) ?? 0) > 0 || (countOf('dayTypes', t) ?? 0) > 0).length}` +
        ` of ${kvBlockTypes.length} types · ` +
        `${INTERACTION_TYPES.filter((i) => (countOf('interactions', i) ?? 0) > 0).length} of ${INTERACTION_TYPES.length} interactions`,
    /*
      LABELS — §26's third list, and the one that stops the other two growing.
      A label is device-bound: it changes how something is drawn and never what
      it is. Every one of these would otherwise have arrived as a new activity,
      which is how the previous list reached twenty.
    */
    labels: `${LABELS.length}`,
  };

  return {
    usage: usage as BlockUsage,
    usageState: usageState as UsageState,
    countOf,
    requirementGaps,
    exerciseSubtypes,
    kvBlockTypes,
    kvInteractionTypes,
    statValues,
  };
}
