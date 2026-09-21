/**
 * The block reader, and the validator.
 *
 * Split out of `block-vocabulary.test.ts` on 2026-09-09 when §26 replaced the
 * vocabulary it tested. That file asserted the seventeen interactions, the
 * alias table and `resolveInteraction`'s type+subtype switch — none of which
 * exists any more. What it also held, and what is kept here, is the half that
 * tests behaviour rather than terms: that `normaliseBlock` drops nothing, and
 * that the validator reports what live content actually gets wrong.
 *
 * The vocabulary's own tests are in `vocabulary.test.ts`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Activity } from './block-model.ts';

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
import {
  DEFAULT_ACTIVITY_FOR_TYPE, ACTIVITIES, ACTIVITY_SPECS,
} from './vocabulary.ts';
import {
  ACTIVITIES_WITHOUT_RENDERER, AUTHORABLE_SUBTYPES, normalizeSubtype,
  responseKeyOf, activityOf, renderActivityOf,
} from './block-model.ts';
import { blockOf, missingRequirements } from './content-hierarchy.ts';

/*
  Every block gets an ACTIVITY, defaulting from its type — §26, where the type
  does not draw. These tests used to build type-only blocks and rely on
  `resolveInteraction`'s switch on `type`; a block with no activity is now
  correctly reported as having nothing to draw, so the fixtures state one.
*/
const act = (o: Record<string, unknown>): Activity => {
  const base = { id: 'b1', title: 'T', type: 'exercise', content: '', duration: 5, required: true, order: 0 };
  const merged = { ...base, ...o } as Record<string, unknown>;
  if (!merged.activity) {
    const cfg = (merged.activityConfig ?? merged.exerciseConfig) as { subtype?: string } | undefined;
    merged.activity = cfg?.subtype ?? DEFAULT_ACTIVITY_FOR_TYPE[String(merged.type)] ?? 'read';
  }
  return merged as unknown as Activity;
};

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
  const issues = validateBlock(act({ activity: 'structured-list', activityConfig: { rows: ['a', 'b'] } }));
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

test('two blocks answering under the same key on one day is reported', () => {
  // Duplicate (§21 item 3) keeps the copy's response key, which is right across
  // days and wrong on one: the second answer overwrites the first.
  const clash = validateDay([
    act({ id: 'a', activityConfig: { subtype: 'input-table', columns: ['Mon'], key: 'sleep_quality' } }),
    act({ id: 'b', activityConfig: { subtype: 'input-table', columns: ['Mon'], key: 'sleep_quality' } }),
  ]);
  const issue = clash.dayIssues.find(i => i.code === 'duplicate-response-key');
  assert.ok(issue);
  // A warning, not an error: four days of live content already collide, and an
  // error would have made them unpublishable on a rule nobody had been told of.
  assert.equal(issue?.level, 'warning');

  // Different keys, and a keyless pair, are both fine — the fallback identity
  // is the block id, which is already checked separately.
  const distinct = validateDay([
    act({ id: 'a', activityConfig: { subtype: 'input-table', columns: ['Mon'], key: 'sleep_quality' } }),
    act({ id: 'b', activityConfig: { subtype: 'input-table', columns: ['Mon'], key: 'sleep_latency' } }),
  ]);
  assert.equal(distinct.dayIssues.some(i => i.code === 'duplicate-response-key'), false);

  const keyless = validateDay([
    act({ id: 'a', activityConfig: { subtype: 'input-table', columns: ['Mon'] } }),
    act({ id: 'b', activityConfig: { subtype: 'input-table', columns: ['Mon'] } }),
  ]);
  assert.equal(keyless.dayIssues.some(i => i.code === 'duplicate-response-key'), false);
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
    ['exercise', 'rating-scale'], ['exercise', 'number'],
  ];
  for (const [type, subtype] of shapes) {
    const legacy = { id: 'a', title: '', type, content: '', duration: 0, required: false,
                     order: 0, exerciseConfig: { subtype } } as unknown as Activity;
    const renamed = { id: 'a', title: '', type, content: '', duration: 0, required: false,
                      order: 0, activityConfig: { subtype } } as unknown as Activity;
    assert.equal(renderActivityOf(renamed), renderActivityOf(legacy),
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
    id: 'b1', title: 'Sleep log', type: 'exercise', activity: 'input-table',
    content: '', duration: 0, required: true, order: 3,
    activityConfig: { tableColumns: [{ key: 'hours', label: 'Hours' }], prompt: 'Log it' },
  } as never);
  assert.equal(b.activity, 'input-table');
  assert.equal(b.prompt, 'Log it');
  assert.deepEqual(missingRequirements(b), ['key'], 'columns are satisfied by tableColumns');
});

test('blockOf never invents a scale_ref, so scale-backed blocks report the real gap', () => {
  // No stored block references a shared scale — they all inline their options.
  const b = blockOf({
    id: 'b2', title: '', type: 'exercise', activity: 'single-select',
    content: '', duration: 0, required: true, order: 0,
    activityConfig: { options: ['Yes', 'No'], key: 'therapy_history' },
  } as never);
  assert.equal(b.scale_ref, undefined);
  assert.deepEqual(missingRequirements(b), ['scale_ref']);
});

test('a passive block with content is complete, and needs no key', () => {
  const b = blockOf({
    id: 'b3', title: '', type: 'conclude', activity: 'complete',
    content: 'Well done.', duration: 0, required: false, order: 0,
  } as never);
  assert.deepEqual(missingRequirements(b), []);
});

test('an unnamed response-producing block is reported incomplete', () => {
  const b = blockOf({
    id: 'b4', title: '', type: 'journal', activity: 'text',
    content: '', duration: 0, required: true, order: 0,
    activityConfig: { prompt: 'What happened?' },
  } as never);
  assert.deepEqual(missingRequirements(b), ['key']);
});

/**
 * The eleven activities §26 declares ahead of their renderers.
 *
 * Declaring an activity the player cannot draw recreates the `watch` defect on
 * purpose — a block carrying one falls to `default: renderLesson()`. This is the
 * guard that makes it a known gap rather than a trap, and it is what `watch`
 * lacked for the months it sat unauthorable with nowhere to say so.
 *
 * Three tests were here that are gone with the vocabulary they tested: the
 * `SUBTYPE_INTERACTION` table agreeing with the resolver's switch (there is no
 * table and no switch), and `watch` still resolving through the alias map (there
 * is no alias map — `RETIRED_TERMS` records it instead, and nothing resolves it).
 */
test('nothing without a renderer is authorable', () => {
  for (const a of ACTIVITIES_WITHOUT_RENDERER) {
    assert.ok(ACTIVITY_SPECS[a], `"${a}" is guarded but not declared`);
  }
  for (const a of AUTHORABLE_SUBTYPES) {
    assert.ok(
      !(ACTIVITIES_WITHOUT_RENDERER as readonly string[]).includes(a),
      `activity "${a}" is offered to authors but has no renderer`,
    );
  }
  assert.equal(
    AUTHORABLE_SUBTYPES.length + ACTIVITIES_WITHOUT_RENDERER.length,
    ACTIVITIES.length,
    'every one of the twenty-nine is either authorable or explicitly guarded',
  );
});

test('a retired term resolves to nothing', () => {
  /*
    The alias table used to rewrite these on every read, which is how live
    content carried `comparison-matrix` for a year and still looked correct.
    Nothing rewrites them now, and nothing in the store carries one — 840 of 840
    blocks resolve to one of the twenty-nine.
  */
  for (const dead of ['comparison-matrix', 'watch', 'select-one', 'track-table', 'yes_no', 'table']) {
    assert.equal(normalizeSubtype(dead), undefined, `"${dead}" must not resolve`);
  }
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

test('the activity decides, whatever the type — every live shape', () => {
  /*
    Every (type, activity) pair in production. Under §26 the ACTIVITY is what
    draws, so each of these must come back as itself no matter what type carries
    it — `tracker` and `workshop` are the ones that matter, because neither ever
    had a case in the old type switch and both resolved to `read` under "type
    decides".

    `comparison-matrix` is the exception, and it is deliberate: it is retired, it
    resolves to NOTHING, and its 17 live blocks are the reason step 6 exists. An
    alias would have hidden them.
  */
  const live: [string, string, string | undefined][] = [
    ['lesson', 'read', 'read'], ['conclude', 'complete', 'complete'],
    ['tracker', 'input-table', 'input-table'], ['tracker', 'comparison-matrix', undefined],
    ['sleep-diary', 'input-table', 'input-table'],
    ['workshop', 'comparison-matrix', undefined], ['workshop', 'input-table', 'input-table'],
    ['exercise', 'mcq', 'mcq'], ['exercise', 'single-select', 'single-select'],
    ['exercise', 'multi-select', 'multi-select'], ['exercise', 'structured-list', 'structured-list'],
    ['exercise', 'rating-scale', 'rating-scale'], ['exercise', 'number', 'number'],
    ['journal', 'ephemeral-journal', 'ephemeral-journal'],
    ['check-in', 'rating-scale', 'rating-scale'],
  ];
  for (const [type, activity, expected] of live) {
    const b = { id: 'x', title: '', type, activity, content: '', duration: 0,
                required: false, order: 0 } as unknown as Activity;
    assert.equal(renderActivityOf(b), expected, `${type} · ${activity}`);
  }
});

