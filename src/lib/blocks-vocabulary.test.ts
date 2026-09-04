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

// ── The target hierarchy (blocks.md §14) — types only, nothing migrated ──────

import {
  INTERACTION_REQUIREMENTS, RESPONSE_PRODUCING, SCALE_BACKED, missingRequirements,
  type Block as HBlock,
} from './content-hierarchy.ts';

test('every interaction has a requirement spec', () => {
  for (const interaction of Object.keys(INTERACTION_META) as InteractionType[]) {
    assert.ok(
      INTERACTION_REQUIREMENTS[interaction],
      `interaction "${interaction}" has INTERACTION_META but no requirement spec`
    );
  }
  assert.equal(
    Object.keys(INTERACTION_REQUIREMENTS).length,
    Object.keys(INTERACTION_META).length
  );
});

test('exactly the response-producing interactions produce something', () => {
  for (const [interaction, spec] of Object.entries(INTERACTION_REQUIREMENTS)) {
    const produces = spec.produces !== null;
    assert.equal(
      produces,
      RESPONSE_PRODUCING.includes(interaction as InteractionType),
      `"${interaction}" produces ${spec.produces} but RESPONSE_PRODUCING says otherwise`
    );
  }
  // read / watch / complete are the three passive ones.
  assert.equal(RESPONSE_PRODUCING.length, Object.keys(INTERACTION_REQUIREMENTS).length - 3);
});

test('every scale-backed interaction requires a scale_ref, and only those', () => {
  for (const [interaction, spec] of Object.entries(INTERACTION_REQUIREMENTS)) {
    assert.equal(
      spec.requires.includes('scale_ref'),
      SCALE_BACKED.includes(interaction as InteractionType),
      `"${interaction}" disagrees with SCALE_BACKED about needing a scale`
    );
  }
});

test('a response-producing block with no key is incomplete', () => {
  // This is the defect the hierarchy exists to make unrepresentable: 98 of Sleep
  // Tight's input-tables have nowhere to file an answer, so a 31-day diary
  // produces 98 unrelated facts instead of a diary.
  const keyless: HBlock = {
    id: 'b1', interaction: 'input-table', position: 0, required: true,
    config: { columns: ['Mon'], rows: ['Hours slept'] },
  };
  assert.deepEqual(missingRequirements(keyless), ['key']);
  assert.deepEqual(missingRequirements({ ...keyless, key: 'hours_slept' }), []);
});

test('a scale-backed block with inline options instead of a scale_ref is incomplete', () => {
  // 27 inline copies of the PHQ/GAD scale is what this refuses.
  const inlined: HBlock = {
    id: 'b2', interaction: 'select-one', position: 0, required: true,
    key: 'phq9_1', config: { options: ['Not at all', 'Several days'] },
  };
  assert.deepEqual(missingRequirements(inlined), ['scale_ref']);
});

test('a passive block needs no key', () => {
  const lesson: HBlock = { id: 'b3', interaction: 'read', position: 0, required: false };
  assert.deepEqual(missingRequirements(lesson), []);
});

// ── The seed file must cover the code's vocabularies ────────────────
// `number` was added to InteractionType earlier on 2026-09-04 and never seeded,
// so the catalog held 12 rows against the code's 13. Nothing failed — the only
// symptom was the Block Type Viewer quietly printing `13 / 12 in KV`, i.e.
// reporting drift as a statistic. These two tests are what turns that into a
// failure instead.

import { METADATA_CATALOG_ITEMS } from './metadata-catalog.ts';

const seedSlugs = (type: string) =>
  METADATA_CATALOG_ITEMS.filter(i => i.type === type).map(i => i.slug).sort();

test('every interaction in the code has an `interaction_type` seed row', () => {
  assert.deepEqual(
    seedSlugs('interaction_type'),
    (Object.keys(INTERACTION_META) as InteractionType[]).slice().sort(),
    'INTERACTION_META and the interaction_type seed rows disagree. Adding an ' +
    'interaction to the union without seeding it leaves the catalog one row ' +
    'short, and the only symptom is a mismatched count in the admin viewer.',
  );
});

test('every canonical subtype has an `activity` seed row', () => {
  // The bucket was renamed `exercise_subtype` -> `activity` on 2026-09-04
  // (blocks.md §18 Phase 1.2). This asserts the seed file was renamed with it:
  // had step C been missed, this list would be empty.
  assert.deepEqual(
    seedSlugs('activity'),
    EXERCISE_SUBTYPES.slice().sort(),
    'EXERCISE_SUBTYPES and the `activity` seed rows disagree.',
  );
});

// ── The block reader must not silently drop fields ─────────────────
// `api-client`'s mapper enumerated eleven fields and returned a fresh object,
// so everything else was discarded on EVERY load. That is why `ActivityRepeat`
// is fully built, has a working editor control, and is used by zero of 407
// stored blocks: the editor wrote `repeat`, the next load threw it away.
//
// It also dropped `interaction` — the field the whole block model migrates TO —
// so the strangler seam could never take hold, and any provenance a migration
// wrote (`retyped_from`) would vanish on the next editor save.

import { normaliseBlock } from './block-normalise.ts';

test('normaliseBlock preserves every field it does not normalise', () => {
  const stored = {
    id: 'b1', title: 'T', type: 'exercise', content: '', duration: 5, required: true,
    exerciseConfig: { subtype: 'input-table' }, order: 3,
    // none of these are normalised, and all were previously lost:
    interaction: 'input-table',
    repeat: { type: 'simple_repeat', onDays: [2, 3] },
    subtitle: 'sub',
    data_id: 'd1',
    retyped_from: { type: 'reflection', at: '2026-09-04T00:00:00.000Z' },
  };
  const out = normaliseBlock(stored) as Record<string, unknown>;
  for (const k of ['interaction', 'repeat', 'subtitle', 'data_id', 'retyped_from']) {
    assert.deepEqual(out[k], (stored as Record<string, unknown>)[k], `normaliseBlock dropped "${k}"`);
  }
});

test('normaliseBlock still normalises snake_case and drops the aliases', () => {
  const out = normaliseBlock({
    id: 'b2', block_type: 'lesson', exercise_config: { subtype: 'mcq' },
    estimated_time_minutes: 9, is_required: false, step_group_id: 'sg', auto_advance: true,
  }) as Record<string, unknown>;
  assert.equal(out.type, 'lesson');
  assert.deepEqual(out.exerciseConfig, { subtype: 'mcq' });
  assert.equal(out.duration, 9);
  assert.equal(out.required, false);
  assert.equal(out.stepGroup, 'sg');
  assert.equal(out.autoAdvance, true);
  // the snake_case originals must not survive alongside their camelCase form
  for (const k of ['block_type', 'exercise_config', 'estimated_time_minutes',
                   'is_required', 'step_group_id', 'auto_advance']) {
    assert.ok(!(k in out), `snake_case alias "${k}" leaked through`);
  }
});

// ── Block validation ───────────────────────────────────────────────
// Nothing validated block content at any layer before 2026-09-04: a day could
// be published with zero blocks, a select with no options, a clinical item with
// no scale. `validateBlockForDayType` looked like the guardrail but had zero
// production callers and returned `allowed: true` unconditionally.

import { validateBlock, validateDay, hasBlockingIssues } from './block-validation.ts';

const act = (o: Record<string, unknown>): Activity => ({
  id: 'b1', title: 'T', type: 'exercise', content: '', duration: 5,
  required: true, order: 0, ...o,
} as Activity);

test('a select with no options is an error, with options is clean', () => {
  const empty = validateBlock(act({ exerciseConfig: { subtype: 'single-select' } }));
  assert.equal(empty.filter(i => i.level === 'error').length, 1);
  assert.equal(empty[0].code, 'no-options');

  const filled = validateBlock(act({ exerciseConfig: { subtype: 'single-select', options: ['a', 'b'] } }));
  assert.deepEqual(filled.filter(i => i.level === 'error'), []);
});

test('a table with no columns is an error — it renders one blank cell', () => {
  const issues = validateBlock(act({ exerciseConfig: { subtype: 'input-table' } }));
  assert.equal(issues.find(i => i.code === 'no-columns')?.level, 'error');
});

test('a rating with no scale is NOT an error — the renderer defaults to 1-5', () => {
  // Calibration finding: flagging this as an error was a false positive on live
  // content. renderRatingScale defaults the range and the labels.
  const issues = validateBlock(act({ exerciseConfig: { subtype: 'rating-scale' } }));
  assert.deepEqual(issues.filter(i => i.level === 'error'), []);
  assert.ok(issues.some(i => i.code === 'default-scale' && i.level === 'warning'));
});

test('a list with only `rows` is still empty — the renderer does not read rows', () => {
  const issues = validateBlock(act({ exerciseConfig: { subtype: 'row_list', rows: ['a', 'b'] } }));
  assert.ok(issues.some(i => i.code === 'no-items' && i.level === 'error'));
});

test('a clinical instrument missing its scale cannot be scored', () => {
  const issues = validateBlock(act({ exerciseConfig: { subtype: 'clinical-instrument', questions: ['q'] } }));
  assert.ok(issues.some(i => i.code === 'no-scale' && i.level === 'error'));
});

test('a lesson with no content and no media is an empty card', () => {
  assert.ok(validateBlock(act({ type: 'lesson', exerciseConfig: undefined }))
    .some(i => i.code === 'no-content'));
  assert.ok(!validateBlock(act({ type: 'lesson', content: '<p>real</p>' }))
    .some(i => i.code === 'no-content'));
});

test('an untitled block warns but does not block a publish', () => {
  const issues = validateBlock(act({ title: '', type: 'lesson', content: 'x' }));
  const t = issues.find(i => i.code === 'no-title');
  assert.equal(t?.level, 'warning');
});

test('an empty day is an error, and duplicate block ids are an error', () => {
  assert.ok(validateDay([]).dayIssues.some(i => i.code === 'empty-day'));

  const dup = validateDay([
    act({ id: 'same', type: 'lesson', content: 'a' }),
    act({ id: 'same', type: 'lesson', content: 'b' }),
  ]);
  assert.ok(dup.dayIssues.some(i => i.code === 'duplicate-block-id'));
  assert.ok(hasBlockingIssues(dup));
});

test('a well-formed day has nothing blocking', () => {
  const ok = validateDay([
    act({ id: 'a', type: 'lesson', content: '<p>Intro</p>' }),
    act({ id: 'b', exerciseConfig: { subtype: 'input-table', columns: ['Mon'] } }),
    act({ id: 'c', type: 'conclude', content: 'Done' }),
  ]);
  assert.equal(hasBlockingIssues(ok), false);
});

test('validateBlock never throws on a malformed block', () => {
  assert.doesNotThrow(() => validateBlock(undefined as unknown as Activity));
  assert.doesNotThrow(() => validateBlock({ id: 'x' } as Activity));
});
