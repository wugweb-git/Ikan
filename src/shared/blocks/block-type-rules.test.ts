/**
 * Run with:  npm test
 *
 * **Every preset's own `defaultBlocks` validated against its own rules.**
 *
 * This is the check that should have existed before `allowedActivities` was
 * introduced alongside `allowedBlocks`. The two fields sit in the same object
 * and disagree: `learning` permits the `complete` interaction in one and
 * forbids conclude-shaped blocks in the other, so a validator reading one gets
 * a different answer than one reading the other.
 *
 * **Fixed 2026-09-04.** Five presets used to seed default content their own
 * allow-list rejected — 8 violations — so turning enforcement on would have
 * failed an author's day at the moment they picked a preset, before they had
 * authored anything. `read` and `complete` were added to the five presets whose
 * seeds need them. The first test now asserts **zero**, and is the gate that
 * keeps it that way.
 *
 * The second test is still pinned rather than zeroed, because reconciling
 * `allowedBlocks` against `allowedActivities` is a separate decision
 * (blocks.md §18 2.4) and not a cleanup.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DAY_TYPE_PRESETS, PALETTE_BLOCK_TYPES } from './block-type-rules.ts';
import { METADATA_CATALOG_ITEMS } from '../lib/metadata-catalog.ts';
import { LEAF_BLOCK_TYPES } from './block-model.ts';

/*
  `seedViolations` and "no preset seeds default content its own rules reject"
  were here. Retired with §19 step 3, along with `validateBlockForDayType`.

  Both asked the same question: does a preset seed a block its own allow-list
  would reject? A day no longer has a type, so a preset no longer constrains
  anything — it seeds a day and has no further say. There is no allow-list left
  for a seed to violate.

  What replaced the guarantee: `validateBlock` (block-validation.ts) still runs
  on every block and still asks whether it can render at all, which is the half
  that was ever enforced. The half that never fired is gone rather than left
  computed and discarded.
*/

test('every preset can open with a lesson and close with a conclude', () => {
  // 131 `lesson` + 84 `conclude` = 215 of 406 live blocks, 53% of the
  // catalogue. A stage forbidding either was describing something no author
  // builds — which is what Phase 0 left behind by widening the lists only far
  // enough to cover each preset's own seeds.
  const cannotOpen = Object.entries(DAY_TYPE_PRESETS)
    .filter(([, p]) => !p.allowedActivities.includes('read')).map(([d]) => d);
  const cannotClose = Object.entries(DAY_TYPE_PRESETS)
    .filter(([, p]) => !p.allowedActivities.includes('complete')).map(([d]) => d);
  assert.deepEqual(cannotOpen, [], `presets that cannot open with a lesson: ${cannotOpen.join(', ')}`);
  assert.deepEqual(cannotClose, [], `presets that cannot close with a conclude: ${cannotClose.join(', ')}`);
});

/*
  "every interaction is reachable from at least one preset" was here. Retired
  2026-09-08.

  It existed because `upload` and `number` were allowed by no preset, so those
  activities could be authored NOWHERE — the preset's `allowedActivities`
  gated the palette. §19 step 3 unfiltered the palette: a day has no type, so
  no preset gates anything and `allowedActivities` is seeding information.

  An interaction reachable from no preset is now an ordinary fact, not a bug —
  `listen`, `rank`, `review-table` and `pick-date` are in exactly that position
  and are fully authorable. What replaced the guarantee is
  `INTERACTIONS_WITHOUT_RENDERER`, which asks the question that still matters:
  can the player DRAW it.
*/

// ── Seed-file assertions ───────────────────────────────────────────
// The seed file is the DEFINITION; KV is the deployment. A test that only
// checks KV passes while the seed quietly regresses — which is exactly how the
// 9 container rows and every `can_hold` list came to exist in KV alone, one
// re-seed away from being wiped. Anything the seed can regenerate is asserted
// about the seed.

const seedBlockTypes = METADATA_CATALOG_ITEMS.filter(i => i.type === 'block_type');

test('the seed file defines every block type, and only those', () => {
  /*
    The two vocabularies parted company on 2026-09-09. This asserted that the
    block types were exactly the day templates plus the six original leaves —
    true while the two lists had been merged, and false the moment `rest` and
    `assessment-lite` were retired as BLOCK types while surviving as TEMPLATES.

    Which is the point of the retirement: a rest day is a day with no task, not
    a kind of block. The test now pins the block types against `LEAF_BLOCK_TYPES`
    — the union the renderer and the editor read — rather than against a preset
    list that answers a different question.
  */
  const seeded = seedBlockTypes.map(r => r.slug).sort();
  assert.deepEqual(
    seeded, [...LEAF_BLOCK_TYPES].sort(),
    'The block_type vocabulary must be reproducible from this file alone.',
  );
  for (const t of ['rest', 'assessment-lite']) {
    assert.ok(Object.keys(DAY_TYPE_PRESETS).includes(t), `${t} must survive as a day template`);
    assert.ok(!(LEAF_BLOCK_TYPES as readonly string[]).includes(t), `${t} must not be a block type`);
  }
});

/*
  Two tests were here and are retired with `can_hold` (2026-09-08):

    · "can_hold non-empty <=> the row has a preset"
    · "the vocabulary is 11 containers and 6 leaves"

  Both asserted a containment relationship that no longer exists — no block
  holds another block, so there are no containers and no leaves, only 17 block
  types. The relationship they policed had never existed in CONTENT either: all
  11 holder types had zero blocks.

  What a block type permits is `activities`, which all 17 rows now carry, and
  the assertion below covers it.
*/

test('every block type declares the activities it permits', () => {
  const rows = METADATA_CATALOG_ITEMS.filter(r => r.type === 'block_type');
  assert.equal(rows.length, 15);
  const missing = rows.filter(r => !Array.isArray(r.activities)).map(r => r.slug);
  assert.deepEqual(
    missing, [],
    'A block type with no `activities` list permits nothing and can hold no ' +
    'authored content — and the six leaves were exactly this until 2026-09-08, ' +
    'which is why the store and the seed disagreed.',
  );
  /*
    `rest` used to be asserted here — it permitted nothing by design, a day with
    no task. It is retired as a BLOCK type (§27 step 6) and survives as a day
    template, so there is no row to assert. The design it recorded is unchanged:
    `DAY_TYPE_PRESETS.rest` still permits only `read` and `complete`.
  */
  assert.equal(rows.find(r => r.slug === 'rest'), undefined);
  assert.equal(rows.find(r => r.slug === 'assessment-lite'), undefined);
});

/**
 * DIRECTION A: the validator permits a block type the editor cannot create.
 *
 * A present-tense authoring gap — an author who deletes a seeded block cannot
 * add it back. Pinned at what it is today and closed in Phase 4.2/4.3, when the
 * picker is rebuilt off `can_hold`; it converts cleanly into a
 * can_hold-vs-picker test then.
 *
 * The opposite direction — palette offers what the interactions forbid — is
 * deliberately NOT tested: it is a property of `allowedBlocks`, which Phase 4
 * deletes, and pinning a field that is being removed only records its drift.
 */
test('every block type a stage can hold is offerable by the DayEditor palette', () => {
  const offerable = new Set(PALETTE_BLOCK_TYPES.map(b => b.type));
  const gaps = new Set<string>();
  for (const row of seedBlockTypes) {
    for (const held of row.can_hold ?? []) if (!offerable.has(held)) gaps.add(held);
  }
  assert.deepEqual(
    [...gaps].sort(), [],
    'CLOSED 2026-09-04. Every leaf block type the catalog defines now has a ' +
    'palette entry, so a stage can no longer permit a type the editor cannot ' +
    'create. This asserts zero — it was pinned at 3 gaps, then 1, now none.',
  );
});
