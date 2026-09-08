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

test('interaction_type ids are frozen — 13 of them', () => {
  assert.deepEqual(idsOf('interaction_type'), [
    'cat-interaction_type-read',
    'cat-interaction_type-watch',
    'cat-interaction_type-select-one',
    'cat-interaction_type-select-many',
    'cat-interaction_type-write',
    'cat-interaction_type-rate',
    'cat-interaction_type-check',
    'cat-interaction_type-track-table',
    'cat-interaction_type-input-table',
    'cat-interaction_type-clinical',
    'cat-interaction_type-upload',
    'cat-interaction_type-number',
    'cat-interaction_type-complete',
  ]);
});

test('activity ids are frozen — 12 of them', () => {
  assert.deepEqual(idsOf('activity'), [
    'cat-activity-mcq',
    'cat-activity-single-select',
    'cat-activity-multi-select',
    'cat-activity-table',
    'cat-activity-input-table',
    'cat-activity-structured-list',
    'cat-activity-rating-scale',
    'cat-activity-clinical-instrument',
    'cat-activity-upload',
    'cat-activity-ephemeral-journal',
    'cat-activity-comparison-matrix',
    'cat-activity-number',
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
