/**
 * Run with:  npm test
 *
 * **The freeze.** A catalog id is minted once from the slug and then never
 * regenerated. These assertions are the whole guarantee: an edit that would
 * change one fails here, loudly, instead of silently minting a new row in
 * production and orphaning every reference to the old one.
 *
 * Why it can happen silently: the sync endpoint derives an id when an item
 * carries none (`index.tsx:3721`) and matches existing rows on `type::slug`. So
 * renaming a slug without a declared id creates a SECOND row. 407 live blocks
 * store the slug, not the id, so nothing would report a break — the old row
 * would simply stop being written to.
 *
 * If a rename is deliberate: change `slug` and `name`, and pass the ORIGINAL id
 * explicitly (`{ id: 'cat-block_type-tracker' }`). Then update the string here
 * only if the id itself was always wrong, never merely because the name moved.
 *
 * Counts pinned: 17 block types, 13 interactions, 12 activities.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { METADATA_CATALOG_ITEMS } from './metadata-catalog.ts';

const idsOf = (type: string) =>
  METADATA_CATALOG_ITEMS.filter((i) => i.type === type).map((i) => i.id);

test('block_type ids are frozen — 17 of them', () => {
  assert.deepEqual(idsOf('block_type'), [
    'cat-block_type-lesson',
    'cat-block_type-exercise',
    'cat-block_type-journal',
    'cat-block_type-checklist',
    'cat-block_type-reflection',
    'cat-block_type-conclude',
    'cat-block_type-quiz',
    'cat-block_type-sleep-diary',
    'cat-block_type-onboarding',
    'cat-block_type-assessment',
    'cat-block_type-assessment-lite',
    'cat-block_type-learning',
    'cat-block_type-practice',
    'cat-block_type-workshop',
    'cat-block_type-tracker',
    'cat-block_type-check-in',
    'cat-block_type-rest',
  ]);
});

test('interaction_type ids are frozen — the nine', () => {
  /*
    §26 REPLACED the seventeen. Only `rate` survives the change with both its
    slug and its id: `cat-interaction_type-rate` is the same row it always was,
    and the sync updates it in place. The other eight are new rows.

    The seventeen retired ids are NOT listed here. Their rows are still live and
    are deleted by §27 step 6, one at a time, each against a fresh backup — this
    freeze covers what the seed mints, not what the store still holds.
  */
  assert.deepEqual(idsOf('interaction_type'), [
    'cat-interaction_type-observe',
    'cat-interaction_type-choose',
    'cat-interaction_type-share',
    'cat-interaction_type-locate',
    'cat-interaction_type-confirm',
    'cat-interaction_type-rate',
    'cat-interaction_type-order',
    'cat-interaction_type-measure',
    'cat-interaction_type-submit',
  ]);
});

/**
 * **Two prefixes here, on purpose.**
 *
 * `cat-exercise_subtype-*` are the rows minted before the type was renamed to
 * `activity` on 2026-09-04. They kept the id they were created with, which is
 * what an identifier surviving a rename looks like. `cat-activity-*` are the
 * rows created after it. Each id records when its row was minted, not what the
 * bucket is called today. Do not "harmonise" them.
 *
 * Two lines carry the §26 renames, and both are renames IN PLACE:
 *
 *  - `check-grid` keeps `cat-exercise_subtype-table`. The slug changes, the id
 *    does not, so the live row is updated rather than a second one appearing
 *    beside it. Zero live blocks carried `table`, which is what made the rename
 *    free.
 *  - `comparison-matrix` is **not here**. It is retired: no seed row, and its
 *    live row and its 17 blocks are §27 step 6.
 */
test('activity ids are frozen — the twenty-nine, each under the name it was minted with', () => {
  assert.deepEqual(idsOf('activity'), [
    'cat-activity-read',
    'cat-activity-listen',
    'cat-activity-view',
    'cat-activity-table-review',
    'cat-activity-complete',
    'cat-activity-paced-breathing',
    'cat-exercise_subtype-mcq',
    'cat-exercise_subtype-single-select',
    'cat-exercise_subtype-multi-select',
    'cat-activity-boolean',
    'cat-exercise_subtype-clinical-instrument',
    'cat-exercise_subtype-rating-scale',
    'cat-activity-slider',
    'cat-activity-ranking',
    'cat-exercise_subtype-structured-list',
    'cat-exercise_subtype-table',
    'cat-activity-consent',
    'cat-activity-text',
    'cat-activity-short-text',
    'cat-exercise_subtype-ephemeral-journal',
    'cat-exercise_subtype-number',
    'cat-exercise_subtype-input-table',
    'cat-activity-date',
    'cat-activity-time',
    'cat-activity-date-time',
    'cat-activity-location',
    'cat-activity-timer',
    'cat-exercise_subtype-upload',
    'cat-activity-record',
  ]);
});

test('every catalog row has an id, and no two share one', () => {
  const ids = METADATA_CATALOG_ITEMS.map((i) => i.id);
  assert.ok(ids.every(Boolean), 'a row with no id would have one derived at sync time');
  assert.equal(new Set(ids).size, ids.length, 'two rows sharing an id would overwrite each other in KV');
});

test('sort_order is present, unique and ascending in declaration order', () => {
  const orders = METADATA_CATALOG_ITEMS.map((i) => i.sort_order);
  assert.ok(orders.every((n) => typeof n === 'number'), 'a row with no sort_order falls back to store order');
  assert.equal(new Set(orders).size, orders.length);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b), 'declaration order is the display order');
});
