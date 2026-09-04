/**
 * Run with:  npm test
 *
 * Node 24 strips TypeScript natively, so this needs no test framework. Keep the
 * syntax erasable — no enums, no parameter properties, no namespaces.
 *
 * **The type x subtype table below is the live census**, queried from
 * `kv_store_cc205da9` on 2026-09-04 by walking `equip:*.daily_content[].activities[]`.
 * All 23 combinations that exist across the four programmes are here with their
 * block counts, and the expected interaction is what the resolver produced
 * BEFORE the alias map was extracted — so this is a behaviour-preservation
 * test, not a restatement of the new code.
 *
 * The one deliberate change is marked: `reflection · number` used to fall
 * through the default branch to `write` and draw a textarea.
 *
 * This is also the first piece of the blocks.md §18 item 0.1 fixture set: the
 * second block below asserts every canonical subtype and every declared alias
 * resolves, so a term added to the catalog without an interaction fails here.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveInteraction, normalizeSubtype, SUBTYPE_ALIASES, EXERCISE_SUBTYPES,
  INTERACTION_META, DAY_TYPES,
  type Activity, type InteractionType, type ExerciseSubtype,
} from './equip-admin-types.ts';

/** Minimal Activity — only the fields resolveInteraction reads. */
function block(type: string, subtype?: string, extra: Record<string, unknown> = {}): Activity {
  return {
    id: 'test-block',
    title: 'Test',
    type: type as Activity['type'],
    content: '',
    duration: 1,
    required: false,
    order: 0,
    ...(subtype ? { exerciseConfig: { subtype: subtype as ExerciseSubtype } } : {}),
    ...extra,
  } as Activity;
}

// ── The live census: every type x subtype in the store, 2026-09-04 ──────────
// [ type, subtype, expected interaction, live block count ]
const LIVE: Array<[string, string | undefined, InteractionType, number]> = [
  ['exercise',   'input-table',       'input-table', 126],
  ['lesson',     undefined,           'read',        118],
  ['conclude',   undefined,           'complete',     84],
  ['reflection', undefined,           'write',        14],
  ['exercise',   'comparison-matrix', 'input-table',   9],
  ['checklist',  'multi-select',      'select-many',   8],
  ['exercise',   'single-select',     'select-one',    7],
  ['lesson',     'multi-select',      'select-many',   6],
  ['quiz',       'single-select',     'select-one',    6],
  ['lesson',     'matrix',            'input-table',   4],
  ['reflection', 'matrix',            'input-table',   4],
  ['quiz',       'mcq',               'select-one',    3],
  ['journal',    undefined,           'write',         3],
  ['reflection', 'structured-list',   'check',         3],
  ['quiz',       'multi-select',      'select-many',   2],
  ['lesson',     'single-select',     'select-one',    2],
  ['lesson',     'input-table',       'input-table',   1],
  ['reflection', 'multi-select',      'select-many',   1],
  ['reflection', 'row_list',          'check',         1],
  ['quiz',       'scale',             'rate',          1],
  ['exercise',   'structured-list',   'check',         1],
  ['reflection', 'text_list',         'check',         1],
  // CHANGED 2026-09-04: was 'write' via the default branch — a numeric field
  // drawn as a textarea. `number` is a declared subtype and now has an interaction.
  ['reflection', 'number',            'number',        1],
];

test('every live type x subtype resolves to the interaction it did before', () => {
  for (const [type, subtype, expected, count] of LIVE) {
    assert.equal(
      resolveInteraction(block(type, subtype)),
      expected,
      `${type} · ${subtype ?? '—'} (${count} live blocks)`
    );
  }
});

test('the census covers all 406 stored equip blocks', () => {
  assert.equal(LIVE.reduce((n, row) => n + row[3], 0), 406);
});

/**
 * Every canonical subtype and the interaction it must produce. A term added to
 * EXERCISE_SUBTYPES without a `case` in the resolver fails here rather than
 * silently landing on the default branch, which is exactly how `matrix`,
 * `scale`, `row_list`, `text_list` and `number` reached production.
 *
 * `ephemeral-journal` -> `write` is correct, not a fallthrough: free text IS its
 * interaction. It is the reason this asserts an explicit map instead of just
 * `notEqual('write')`.
 */
const CANONICAL_INTERACTION: Record<ExerciseSubtype, InteractionType> = {
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
  'number':              'number',
  'ephemeral-journal':   'write',
};

test('every canonical subtype and every alias resolves to a real interaction', () => {
  for (const subtype of EXERCISE_SUBTYPES) {
    const interaction = resolveInteraction(block('exercise', subtype));
    assert.equal(
      interaction, CANONICAL_INTERACTION[subtype],
      `canonical subtype "${subtype}" resolved to "${interaction}"`
    );
    assert.ok(
      INTERACTION_META[interaction],
      `"${interaction}" has no INTERACTION_META entry`
    );
  }
  for (const alias of Object.keys(SUBTYPE_ALIASES)) {
    const canonical = normalizeSubtype(alias);
    assert.ok(canonical, `alias "${alias}" normalizes to nothing`);
    assert.ok(
      (EXERCISE_SUBTYPES as readonly string[]).includes(canonical as string),
      `alias "${alias}" normalizes to "${canonical}", which is not canonical`
    );
  }
});

test('normalizeSubtype passes canonical terms through and rejects unknowns', () => {
  assert.equal(normalizeSubtype('mcq'), 'mcq');
  assert.equal(normalizeSubtype('comparison-matrix'), 'comparison-matrix');
  assert.equal(normalizeSubtype('matrix'), 'comparison-matrix');
  assert.equal(normalizeSubtype('row_list'), 'structured-list');
  assert.equal(normalizeSubtype('scale'), 'rating-scale');
  assert.equal(normalizeSubtype(undefined), undefined);
  assert.equal(normalizeSubtype(''), undefined);
  assert.equal(normalizeSubtype('not-a-subtype'), undefined);
});

test('an explicit interaction short-circuits the resolver entirely', () => {
  // The seam the whole migration depends on: a block written in the new shape
  // is already understood by today's player.
  const b = block('lesson', 'multi-select', { interaction: 'clinical' });
  assert.equal(resolveInteraction(b), 'clinical');
});

test('an unknown subtype still falls back to a text box rather than throwing', () => {
  assert.equal(resolveInteraction(block('reflection', 'not-a-real-subtype')), 'write');
  // ...unless it carries options, in which case the default branch calls it select-one.
  const withOptions = block('reflection', 'not-a-real-subtype', {
    exerciseConfig: { subtype: 'not-a-real-subtype', options: ['a', 'b'] },
  });
  assert.equal(resolveInteraction(withOptions), 'select-one');
});

test('type-only blocks resolve without a subtype', () => {
  assert.equal(resolveInteraction(block('checklist')), 'check');
  assert.equal(resolveInteraction(block('sleep-diary')), 'track-table');
  assert.equal(resolveInteraction(block('unknown-type')), 'read');
});

test('a reflection carrying options is treated as a question, not free text', () => {
  const b = block('reflection', undefined, { exerciseConfig: { options: ['yes', 'no'] } });
  assert.equal(resolveInteraction(b), 'select-one');
});

test('INTERACTION_META covers every interaction the resolver can return', () => {
  const produced = new Set<string>();
  for (const [type, subtype] of LIVE) produced.add(resolveInteraction(block(type, subtype)));
  for (const subtype of EXERCISE_SUBTYPES) produced.add(resolveInteraction(block('exercise', subtype)));
  for (const i of produced) assert.ok(INTERACTION_META[i as InteractionType], `no INTERACTION_META for "${i}"`);
});

test('DAY_TYPES is the full preset vocabulary', () => {
  // Drift between DAY_TYPES and DAY_TYPE_PRESETS is a *compile* error — the
  // presets are declared `Record<DayType, DayTypePreset>` — which is stronger
  // than anything assertable here. (A runtime import of day-presets.ts fails
  // under node's native type stripping: it imports '../../lib/equip-admin-types'
  // with no file extension, which ESM resolution requires.)
  assert.equal(DAY_TYPES.length, 11);
  assert.ok(DAY_TYPES.includes('onboarding'), 'onboarding had a catalog row and no preset until 2026-09-04');
});
