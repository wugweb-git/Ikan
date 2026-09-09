/**
 * The picker must state what a retype drops BEFORE it commits — §21 item 4.
 * These tests are the statement; the picker only prints it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retypeEffect, retypeSentence, retype, ACTIVITY_FIELDS, ALWAYS_CARRIED } from './block-retype.ts';
import { ACTIVITIES } from './vocabulary.ts';
import type { Activity } from './block-model.ts';

const block = (activity: string, cfg: Record<string, unknown>, content = ''): Activity => ({
  id: 'b', title: 'T', type: 'exercise', activity, content,
  duration: 5, required: true, order: 0, activityConfig: cfg,
} as unknown as Activity);

test('every activity declares which fields it reads', () => {
  for (const a of ACTIVITIES) {
    assert.ok(Array.isArray(ACTIVITY_FIELDS[a]), `${a} declares no field list`);
  }
});

test('a table becoming a lesson loses its columns, and says so', () => {
  const b = block('input-table', { columns: ['Mon', 'Tue', 'Wed'], key: 'sleep' }, '<p>Log it</p>');
  const e = retypeEffect(b, 'input-table', 'read');
  assert.deepEqual(e.dropped.map(d => d.field), ['columns']);
  assert.deepEqual(e.carried, ['key']);
  assert.equal(e.contentCarried, true);
  assert.match(retypeSentence(e, 'Lesson'), /keeps title, subtitle, content/);
  assert.match(retypeSentence(e, 'Lesson'), /drops 3 columns/);
});

test('the response key is never dropped — it is the block’s identity, not its shape', () => {
  for (const to of ACTIVITIES) {
    const e = retypeEffect(block('input-table', { key: 'sleep_quality', columns: ['a'] }), 'input-table', to);
    assert.ok(e.carried.includes('key'), `retyping to ${to} dropped the key`);
  }
  assert.ok((ALWAYS_CARRIED as readonly string[]).includes('repeat'),
    'where a block appears is not a property of what it draws');
});

test('a select keeps its options when it becomes another select', () => {
  const e = retypeEffect(block('single-select', { options: ['Yes', 'No'] }), 'single-select', 'multi-select');
  assert.deepEqual(e.dropped, []);
  assert.ok(e.carried.includes('options'));
  assert.match(retypeSentence(e, 'Multi Select'), /Nothing is dropped/);
});

test('a select becoming a journal loses its options', () => {
  const e = retypeEffect(block('single-select', { options: ['Yes', 'No'], prompt: 'Well?' }), 'single-select', 'ephemeral-journal');
  assert.deepEqual(e.dropped.map(d => d.field), ['options']);
  assert.ok(e.carried.includes('prompt'), 'a journal asks something too');
});

test('prose is dropped only where the destination cannot draw it', () => {
  const withProse = block('read', {}, '<p>Some prose.</p>');
  assert.equal(retypeEffect(withProse, 'read', 'complete').contentCarried, true);
  assert.equal(retypeEffect(withProse, 'read', 'view').contentCarried, true);
  assert.equal(retypeEffect(withProse, 'read', 'mcq').contentCarried, false);
  // An empty content field is not a loss.
  assert.equal(retypeEffect(block('read', {}), 'read', 'mcq').contentCarried, true);
});

test('an empty field is not a loss — a warning nobody needs is a warning nobody reads', () => {
  const e = retypeEffect(block('input-table', { columns: [], rows: [] }), 'input-table', 'read');
  assert.deepEqual(e.dropped, []);
  assert.match(retypeSentence(e, 'Lesson'), /Nothing is dropped/);
});

test('retyping to what it already is says so and changes nothing', () => {
  const e = retypeEffect(block('mcq', { options: ['a'] }), 'mcq', 'mcq');
  assert.equal(e.unchanged, true);
  assert.equal(retypeSentence(e, 'MCQ'), 'This is what it already is.');
});

test('retype() removes exactly what it said it would, and records where it came from', () => {
  const b = block('input-table', { columns: ['Mon'], key: 'sleep', prompt: 'Log' }, '<p>x</p>');
  const out = retype(b, 'ephemeral-journal') as Activity & { retyped_from?: { activity?: string } };
  const cfg = out.activityConfig as Record<string, unknown>;
  assert.equal(cfg.columns, undefined, 'columns were dropped');
  assert.equal(cfg.key, 'sleep', 'the key survived');
  assert.equal(cfg.prompt, 'Log', 'a journal reads a prompt');
  assert.equal(out.activity, 'ephemeral-journal');
  assert.equal(out.content, '', 'a journal draws no prose');
  assert.equal(out.retyped_from?.activity, 'input-table');
});

test('retype() carries the stored subtype forward rather than leaving it stale', () => {
  // 187 blocks store the activity under `activityConfig.subtype` as well. Leaving
  // it on the old value would make the block disagree with itself.
  const b = block('mcq', { subtype: 'mcq', options: ['a'] });
  const out = retype(b, 'multi-select');
  assert.equal((out.activityConfig as Record<string, unknown>).subtype, 'multi-select');
});

test('every destination produces a sentence', () => {
  const b = block('input-table', { columns: ['Mon'], key: 'k' }, '<p>x</p>');
  for (const to of ACTIVITIES) {
    const s = retypeSentence(retypeEffect(b, 'input-table', to), to);
    assert.ok(s.length > 20, `${to} produced no sentence`);
  }
});
