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
  resolveInteraction, normalizeSubtype, SUBTYPE_ALIASES, EXERCISE_SUBTYPES, responseKeyOf,
  INTERACTIONS_WITHOUT_RENDERER, AUTHORABLE_SUBTYPES, SUBTYPE_INTERACTION, activityOf,
  INTERACTION_META, DAY_TYPES,
  type Activity, type InteractionType, type ExerciseSubtype,
} from './block-model.ts';

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
    ...(subtype ? { activityConfig: { subtype: subtype as ExerciseSubtype } } : {}),
    ...extra,
  } as Activity;
}

// ── The live census: every type x subtype in the store ─────────────────────
//
// RE-TAKEN 2026-09-04, after Phase 3.3 re-typed the 58 schema-invalid blocks
// and the `|| subtype` overrule was removed from the resolver.
//
// The previous census listed 23 combinations because a block's declared type
// and its subtype could disagree — `checklist · multi-select`, `lesson · matrix`,
// `quiz · scale`. The retype made every declared type match what the block
// actually does, so the store now holds 14 combinations and every subtype sits
// on an `exercise`. That is the whole point of the retype, visible as a shrinking
// table.
//
// This is still a behaviour-preservation test: every interaction below is what
// the resolver produced BEFORE the overrule clause was removed, because the
// retype was proved interaction-neutral against a backup on both prefixes.
//
// [ type, subtype, expected interaction, live block count ]
const LIVE: Array<[string, string | undefined, InteractionType, number]> = [
  ['exercise',   'input-table',       'input-table', 127],
  ['lesson',     undefined,           'read',        118],
  ['conclude',   undefined,           'complete',     85],
  ['journal',    undefined,           'write',        17],
  ['exercise',   'multi-select',      'select-many',  17],
  ['exercise',   'single-select',     'select-one',   15],
  ['exercise',   'comparison-matrix', 'input-table',   9],
  ['exercise',   'matrix',            'input-table',   8],
  ['exercise',   'structured-list',   'check',         4],
  ['exercise',   'mcq',               'select-one',    3],
  ['exercise',   'number',            'number',        1],
  ['exercise',   'row_list',          'check',         1],
  ['exercise',   'scale',             'rate',          1],
  ['exercise',   'text_list',         'check',         1],
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

test('the census covers all 407 stored equip blocks', () => {
  // 406 -> 407: burnout-reset gained a day 28, which had been a dead end in the
  // player. The count is asserted so the census cannot quietly go stale — which
  // is what it just caught.
  assert.equal(LIVE.reduce((n, row) => n + row[3], 0), 407);
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
  // The eight added 2026-09-08. Four resolve to interactions with no renderer;
  // they are declared and kept out of every picker, not offered.
  'read':                'read',
  'listen':              'listen',
  'view':                'view',
  'complete':            'complete',
  'date-time':           'pick-date',
  'table-review':        'review-table',
  'ranking':             'rank',
  'short-text':          'write',
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
    activityConfig: { subtype: 'not-a-real-subtype', options: ['a', 'b'] },
  });
  assert.equal(resolveInteraction(withOptions), 'select-one');
});

test('type-only blocks resolve without a subtype', () => {
  assert.equal(resolveInteraction(block('checklist')), 'check');
  // Retargeted 2026-09-04: `sleep-diary` used to resolve to `track-table`, a
  // yes/no grid, while Sleep Tight's 126 real diary blocks are `input-table`.
  // The type was named after a programme whose behaviour it did not reproduce.
  assert.equal(resolveInteraction(block('sleep-diary')), 'input-table');
  assert.equal(resolveInteraction(block('unknown-type')), 'read');
});

test('a reflection carrying options is treated as a question, not free text', () => {
  const b = block('reflection', undefined, { activityConfig: { options: ['yes', 'no'] } });
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
  // than anything assertable here. (A runtime import of block-type-rules.ts fails
  // under node's native type stripping: it imports './block-model'
  // with no file extension, which ESM resolution requires.)
  assert.equal(DAY_TYPES.length, 11);
  assert.ok(DAY_TYPES.includes('onboarding'), 'onboarding had a catalog row and no preset until 2026-09-04');
});

// ── The target hierarchy (blocks.md §14) — types only, nothing migrated ──────

import {
  INTERACTION_REQUIREMENTS, RESPONSE_PRODUCING, SCALE_BACKED, missingRequirements,
  type Block as HBlock,
  blockOf,
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
  /*
    Name the passive ones rather than counting them. This asserted
    `length - 3` — read, watch, complete — which stopped being a claim about
    the vocabulary and became a claim about its size: adding `listen` and
    `review-table` (both passive) broke it without anything being wrong.
    Listing them means a NEW interaction has to be classified deliberately.

    `review-table` is the interesting one: it reads back earlier days' entries
    and captures nothing, which is what distinguishes it from `input-table`.
  */
  const passive = (Object.keys(INTERACTION_REQUIREMENTS) as InteractionType[])
    .filter((i) => !RESPONSE_PRODUCING.includes(i))
    .sort();
  assert.deepEqual(passive, ['complete', 'listen', 'read', 'review-table', 'view']);
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

import { METADATA_CATALOG_ITEMS } from '../metadata-catalog.ts';

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
    activityConfig: { subtype: 'input-table' }, order: 3,
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
  assert.deepEqual(out.activityConfig, { subtype: 'mcq' });
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
  const empty = validateBlock(act({ activityConfig: { subtype: 'single-select' } }));
  assert.equal(empty.filter(i => i.level === 'error').length, 1);
  assert.equal(empty[0].code, 'no-options');

  const filled = validateBlock(act({ activityConfig: { subtype: 'single-select', options: ['a', 'b'] } }));
  assert.deepEqual(filled.filter(i => i.level === 'error'), []);
});

test('a table with no columns is an error — it renders one blank cell', () => {
  const issues = validateBlock(act({ activityConfig: { subtype: 'input-table' } }));
  assert.equal(issues.find(i => i.code === 'no-columns')?.level, 'error');
});

test('a rating with no scale is NOT an error — the renderer defaults to 1-5', () => {
  // Calibration finding: flagging this as an error was a false positive on live
  // content. renderRatingScale defaults the range and the labels.
  const issues = validateBlock(act({ activityConfig: { subtype: 'rating-scale' } }));
  assert.deepEqual(issues.filter(i => i.level === 'error'), []);
  assert.ok(issues.some(i => i.code === 'default-scale' && i.level === 'warning'));
});

test('a list with only `rows` is still empty — the renderer does not read rows', () => {
  const issues = validateBlock(act({ activityConfig: { subtype: 'row_list', rows: ['a', 'b'] } }));
  assert.ok(issues.some(i => i.code === 'no-items' && i.level === 'error'));
});

test('a clinical instrument missing its scale cannot be scored', () => {
  const issues = validateBlock(act({ activityConfig: { subtype: 'clinical-instrument', questions: ['q'] } }));
  assert.ok(issues.some(i => i.code === 'no-scale' && i.level === 'error'));
});

test('a lesson with no content and no media is an empty card', () => {
  assert.ok(validateBlock(act({ type: 'lesson', activityConfig: undefined }))
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
    act({ id: 'b', activityConfig: { subtype: 'input-table', columns: ['Mon'] } }),
    act({ id: 'c', type: 'conclude', content: 'Done' }),
  ]);
  assert.equal(hasBlockingIssues(ok), false);
});

test('validateBlock never throws on a malformed block', () => {
  assert.doesNotThrow(() => validateBlock(undefined as unknown as Activity));
  assert.doesNotThrow(() => validateBlock({ id: 'x' } as Activity));
});

// ── The exerciseConfig -> activityConfig rename ────────────────────
// Three steps: ship the accessor, migrate 906 stored blocks across three
// prefixes, drop the old name. Until the last step a block may be stored under
// either, and everything reading config must survive both.
import { configOf } from './block-model.ts';

test('configOf reads either name, preferring the new one', () => {
  const cfg = { subtype: 'input-table', columns: ['Mon'] };
  // NOTE these two literals must stay spelled differently — a bulk rename of
  // `exerciseConfig` -> `activityConfig` rewrote this test to pass the new name
  // twice, so it asserted nothing and failed. The whole point is both shapes.
  assert.deepEqual(configOf({ exerciseConfig: cfg } as never), cfg, 'old name');
  assert.deepEqual(configOf({ activityConfig: cfg } as never), cfg, 'new name');
  assert.deepEqual(
    configOf({ activityConfig: cfg, exerciseConfig: { subtype: 'mcq' } } as never), cfg,
    'both present — the new name wins',
  );
  assert.equal(configOf(undefined), undefined);
  assert.equal(configOf({} as never), undefined);
});

test('a block resolves identically under either config name', () => {
  // The property the migration rests on: while the store is half-migrated, the
  // same block must render the same way whichever name it arrived under.
  const shapes: Array<[string, string]> = [
    ['exercise', 'input-table'], ['exercise', 'single-select'],
    ['exercise', 'multi-select'], ['exercise', 'structured-list'],
    ['exercise', 'scale'],       ['exercise', 'number'],
  ];
  for (const [type, subtype] of shapes) {
    const legacy = { id: 'a', title: '', type, content: '', duration: 0, required: false,
                     order: 0, exerciseConfig: { subtype } } as unknown as Activity;
    const renamed = { id: 'a', title: '', type, content: '', duration: 0, required: false,
                      order: 0, activityConfig: { subtype } } as unknown as Activity;
    assert.equal(resolveInteraction(renamed), resolveInteraction(legacy),
      `${type} · ${subtype} must resolve the same under either name`);
  }
});

// ── Shared field vocabulary ────────────────────────────────────────
// These decisions lived twice — in BlockEditor (the form) and BlockTypeViewer
// (the preview that documents the form). The preview had fallen behind.
import { hasContentField, contentLabelFor, contentPlaceholderFor, stageColour } from './block-fields.ts';

test('only prose block types get a content field — and reflection is not one', () => {
  for (const t of ['lesson', 'journal', 'conclude', 'sleep-diary']) {
    assert.equal(hasContentField(t), true, t);
  }
  assert.equal(hasContentField('exercise'), false);
  assert.equal(hasContentField('checklist'), false);
  // Both copies still listed `reflection`, which became a CONTAINER in the flip
  // and so can never be a block type at all.
  assert.equal(hasContentField('reflection'), false);
});

test('the content field is labelled by what the block is', () => {
  assert.equal(contentLabelFor('lesson'), 'Content');
  assert.equal(contentLabelFor('conclude'), 'Content');
  assert.equal(contentLabelFor('sleep-diary'), 'Sleep Diary Instructions');
  assert.equal(contentLabelFor('journal'), 'Prompt / Instructions');
  assert.match(contentPlaceholderFor('lesson'), /educational/);
  assert.match(contentPlaceholderFor('sleep-diary'), /sleep diary/);
});

test('stage colour prefers the catalog, ignores the seeded placeholder', () => {
  assert.equal(stageColour('tracker'), '#10B981');
  assert.equal(stageColour('tracker', '#ABCDEF'), '#ABCDEF', 'catalog wins');
  // Every catalog row carries #2A2A2A as a seeded default — not a real choice,
  // so it must not override the map.
  assert.equal(stageColour('tracker', '#2A2A2A'), '#10B981');
  // `learning` is 93 of 98 days and used to fall through to the default.
  assert.equal(stageColour('learning'), 'var(--color-primary-default)');
  assert.equal(stageColour(undefined), 'var(--color-primary-default)');
});

/**
 * Response identity. The live shape this pins, queried 2026-09-08: 98 of 407
 * blocks carry `activityConfig.key`, 61 keys are distinct, and 14 keys are
 * carried by more than one block (51 blocks in all) — `sleep_quality_day1` is on days 1-7 of
 * Sleep Tight under seven different ids. Zero blocks carry `repeat`.
 */
test('a block with no key is only ever itself', () => {
  assert.equal(responseKeyOf({ id: 'block-1' }), 'block-1');
  assert.equal(responseKeyOf({ id: 'block-1', activityConfig: {} }), 'block-1');
  // Whitespace is not a declaration.
  assert.equal(responseKeyOf({ id: 'block-1', activityConfig: { key: '   ' } }), 'block-1');
});

test('a shared key makes two blocks one question', () => {
  const dayOne = { id: 'block-1773', activityConfig: { key: 'sleep_quality_day1' } };
  const daySeven = { id: 'block-9912', activityConfig: { key: 'sleep_quality_day1' } };
  assert.equal(responseKeyOf(dayOne), responseKeyOf(daySeven));
  assert.notEqual(dayOne.id, daySeven.id);
});

test('the key is read through the migration accessor, not activityConfig alone', () => {
  // 906 live blocks are still stored under the old name; a direct
  // `.activityConfig.key` read would drop the identity of every one of them.
  assert.equal(responseKeyOf({ id: 'b', exerciseConfig: { key: 'tf_thoughts' } }), 'tf_thoughts');
});

/**
 * `blockOf` is the strangler seam: the live shape read as the target shape.
 * These pin the three mappings that decide what live content reports.
 */
test('blockOf carries every stored spelling of a table under the target name', () => {
  const b = blockOf({
    id: 'b1', title: 'Sleep log', type: 'exercise', interaction: 'input-table',
    content: '', duration: 0, required: true, order: 3,
    activityConfig: { tableColumns: [{ key: 'hours', label: 'Hours' }], prompt: 'Log it' },
  } as never);
  assert.equal(b.interaction, 'input-table');
  assert.equal(b.prompt, 'Log it');
  assert.deepEqual(missingRequirements(b), ['key'], 'columns are satisfied by tableColumns');
});

test('blockOf never invents a scale_ref, so scale-backed blocks report the real gap', () => {
  // No stored block references a shared scale — they all inline their options.
  const b = blockOf({
    id: 'b2', title: '', type: 'exercise', interaction: 'select-one',
    content: '', duration: 0, required: true, order: 0,
    activityConfig: { options: ['Yes', 'No'], key: 'therapy_history' },
  } as never);
  assert.equal(b.scale_ref, undefined);
  assert.deepEqual(missingRequirements(b), ['scale_ref']);
});

test('a passive block with content is complete, and needs no key', () => {
  const b = blockOf({
    id: 'b3', title: '', type: 'conclude', interaction: 'complete',
    content: 'Well done.', duration: 0, required: false, order: 0,
  } as never);
  assert.deepEqual(missingRequirements(b), []);
});

test('an unnamed response-producing block is reported incomplete', () => {
  const b = blockOf({
    id: 'b4', title: '', type: 'journal', interaction: 'write',
    content: '', duration: 0, required: true, order: 0,
    activityConfig: { prompt: 'What happened?' },
  } as never);
  assert.deepEqual(missingRequirements(b), ['key']);
});

/**
 * The four interactions declared 2026-09-08 ahead of their renderers.
 *
 * Declaring an interaction the player cannot draw recreates the `watch` defect
 * on purpose — a block carrying one falls to `default: renderLesson()`. These
 * pin the guard that makes it a known gap rather than a trap.
 */
test('nothing without a renderer is authorable', () => {
  /*
    The list is EMPTY as of 2026-09-08 — step 7 built all four renderers, so
    every activity is offerable. The assertion is kept and inverted rather than
    deleted: it is what makes declaring a vocabulary ahead of its renderers
    safe, and the next interaction added before its renderer must appear in the
    list on the day it is declared. `watch` sat unauthorable for months because
    there was nowhere to say this.
  */
  for (const i of INTERACTIONS_WITHOUT_RENDERER) {
    assert.ok(INTERACTION_META[i], `"${i}" is guarded but not declared`);
  }
  for (const subtype of AUTHORABLE_SUBTYPES) {
    assert.ok(
      !INTERACTIONS_WITHOUT_RENDERER.includes(SUBTYPE_INTERACTION[subtype]),
      `activity "${subtype}" is offered to authors but resolves to "${SUBTYPE_INTERACTION[subtype]}", which has no renderer`,
    );
  }
  assert.equal(AUTHORABLE_SUBTYPES.length, EXERCISE_SUBTYPES.length,
    'every activity is authorable now that every interaction can be drawn');
});

test('the activity table agrees with the resolver, for every activity', () => {
  // Two mappings exist while the resolver keeps its switch: the switch's cases
  // and SUBTYPE_INTERACTION. They must not drift, and the gated collapse
  // deletes the switch — leaving the table as the only one.
  for (const subtype of EXERCISE_SUBTYPES) {
    if (subtype === 'ephemeral-journal') continue; // options-dependent, asserted separately
    assert.equal(
      resolveInteraction(block('exercise', subtype)),
      SUBTYPE_INTERACTION[subtype],
      `the switch and SUBTYPE_INTERACTION disagree on "${subtype}"`,
    );
  }
});

test('watch still resolves, under its new name', () => {
  // 0 live blocks carried it, which is what made the rename free — but a stored
  // value must never stop resolving just because a term was renamed.
  assert.equal(normalizeSubtype('watch'), 'view');
  assert.equal(SUBTYPE_INTERACTION['view'], 'view');
});

/**
 * The per-block-type rules from the block type reference.
 *
 * Calibrated against live content, which is what stops them being noise: they
 * fire on 107 keyless input-tables, 35 scale-backed blocks with no `scale_ref`
 * and 5 checklists with no items — none of which is bad authoring, because the
 * editor has never had a `key` field and no block has ever referenced a shared
 * scale. Hence warnings, not errors, for exactly those two.
 */
test('a response-producing block with no key is reported, not blocked', () => {
  const issues = validateBlock({
    id: 'b', title: 'Sleep log', type: 'exercise', content: '',
    duration: 0, required: true, order: 0,
    activityConfig: { subtype: 'input-table', columns: ['Hours'] },
  } as never);
  const key = issues.find(i => i.code === 'no-response-key');
  assert.ok(key, 'a keyless exercise should be reported');
  assert.equal(key!.level, 'warning', 'the editor has never had a key field — blocking is unfair');
});

test('a block that produces nothing needs no key', () => {
  const issues = validateBlock({
    id: 'b', title: 'Well done', type: 'conclude', content: 'Nice work.',
    duration: 0, required: false, order: 0,
  } as never);
  assert.equal(issues.find(i => i.code === 'no-response-key'), undefined);
});

test('an exercise with no activity is an error — it has nothing for the user to do', () => {
  const issues = validateBlock({
    id: 'b', title: 'Exercise', type: 'exercise', content: '',
    duration: 0, required: true, order: 0, activityConfig: { key: 'k' },
  } as never);
  const a = issues.find(i => i.code === 'no-activity');
  assert.ok(a);
  assert.equal(a!.level, 'error');
});

test('the closing block must be last, and there must be exactly one', () => {
  const lesson = { id: 'l', title: 'L', type: 'lesson', content: 'x', duration: 0, required: false, order: 0 };
  const end    = { id: 'c', title: 'C', type: 'conclude', content: 'done', duration: 0, required: false, order: 1 };

  assert.ok(validateDay([lesson] as never).dayIssues.some(i => i.code === 'no-conclude'),
    'a day with no closing block ends on whatever came last');
  assert.ok(validateDay([end, lesson] as never).dayIssues.some(i => i.code === 'conclude-not-last'),
    'content after the end of the day');
  assert.ok(validateDay([lesson, { ...end, id: 'c2' }, end] as never).dayIssues.some(i => i.code === 'multiple-concludes'));
  assert.deepEqual(validateDay([lesson, end] as never).dayIssues, [],
    'a lesson then a conclude is a well-formed day');
});

test('needing a key is derived from what the block draws, not from a list of types', () => {
  /*
    A hardcoded type list missed 67 keyless blocks the day the remap moved
    content onto `tracker` and `workshop`. A block on ANY type that produces a
    response must be reported.
  */
  const trackerTable = validateBlock({
    id: 'b', title: 'Habit grid', type: 'tracker', content: '',
    duration: 0, required: true, order: 0,
    activityConfig: { subtype: 'input-table', columns: ['Mon'] },
  } as never);
  assert.ok(trackerTable.some(i => i.code === 'no-response-key'),
    'a keyless tracker produces answers and must be reported');

  const passive = validateBlock({
    id: 'b', title: 'Intro', type: 'lesson', content: 'Read this.',
    duration: 0, required: false, order: 0,
  } as never);
  assert.equal(passive.find(i => i.code === 'no-response-key'), undefined,
    'a lesson produces nothing and needs no key, whatever its type');
});

/**
 * The activity lives in two places since the 2026-09-08 remap: a top-level
 * `activity` on all 407 blocks, and `activityConfig.subtype` on 187. Reading
 * only the second was blind to 220 blocks.
 */
test('the activity is found wherever it is stored', () => {
  assert.equal(activityOf({ activity: 'input-table' } as never), 'input-table');
  assert.equal(activityOf({ activityConfig: { subtype: 'mcq' } } as never), 'mcq');
  // Top level wins: the remap canonicalised it, so `matrix` there is already
  // `comparison-matrix`. The 11 blocks carrying both differ only by alias.
  assert.equal(
    activityOf({ activity: 'comparison-matrix', activityConfig: { subtype: 'matrix' } } as never),
    'comparison-matrix',
  );
  assert.equal(activityOf({} as never), undefined);
  assert.equal(activityOf(undefined), undefined);
});

test('a block resolves from its activity whatever its type — all 407 live shapes', () => {
  /*
    Every (type, activity) pair in production, with the interaction stored on
    those blocks. Verified 2026-09-08: the resolver reproduces the stored value
    on 407 of 407 from the ACTIVITY ALONE, which is what makes build-order
    step 5 — dropping the stored `interaction` — safe rather than a guess.

    `tracker` and `workshop` are the ones that matter: neither has a case in the
    type switch, so under "type decides" they resolved to `read`.
  */
  const live: [string, string, string][] = [
    ['lesson', 'read', 'read'], ['conclude', 'complete', 'complete'],
    ['tracker', 'input-table', 'input-table'], ['tracker', 'comparison-matrix', 'input-table'],
    ['sleep-diary', 'input-table', 'input-table'],
    ['workshop', 'comparison-matrix', 'input-table'], ['workshop', 'input-table', 'input-table'],
    ['journal', 'ephemeral-journal', 'write'], ['onboarding', 'ephemeral-journal', 'write'],
    ['onboarding', 'single-select', 'select-one'], ['onboarding', 'mcq', 'select-one'],
    ['onboarding', 'multi-select', 'select-many'],
    ['checklist', 'structured-list', 'check'],
    ['exercise', 'single-select', 'select-one'], ['exercise', 'mcq', 'select-one'],
    ['exercise', 'multi-select', 'select-many'], ['exercise', 'input-table', 'input-table'],
    ['exercise', 'comparison-matrix', 'input-table'], ['exercise', 'rating-scale', 'rate'],
    ['exercise', 'number', 'number'],
  ];
  for (const [type, activity, expected] of live) {
    assert.equal(
      resolveInteraction({ id: 'p', title: 't', type, content: '', duration: 0, required: true, order: 0, activity } as never),
      expected,
      `${type} · ${activity} must resolve to ${expected}`,
    );
  }
});
