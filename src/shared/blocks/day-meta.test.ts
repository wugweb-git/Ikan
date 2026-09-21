/**
 * `dayMeta` — the day header's line. Derived text, so it is tested: a header that
 * claims a repeat the player will not honour is worse than a header with no line
 * at all.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayMeta, blockCountLabel } from './day-meta.ts';
import type { Activity, DayContent } from './block-model.ts';

const block = (o: Partial<Activity>): Activity => ({
  id: 'b', title: 'T', type: 'lesson', content: '', duration: 5, required: true, order: 0, ...o,
} as Activity);

const day = (n: number, activities: Activity[]): DayContent =>
  ({ day: n, title: `Day ${n}`, description: '', activities } as DayContent);

test('an empty day counts nothing and claims nothing', () => {
  const m = dayMeta(day(3, []), 30);
  assert.deepEqual(m, { blocks: 0, minutes: 0, repeatsTo: [], repeatLabel: undefined });
  assert.equal(blockCountLabel(day(3, [])), '');
});

test('minutes are summed, and a block with no duration counts as zero', () => {
  const m = dayMeta(day(3, [block({ duration: 4 }), block({ duration: 6 }), block({ duration: undefined })]), 30);
  assert.equal(m.blocks, 3);
  assert.equal(m.minutes, 10);
});

test('no block repeating means no repeat line', () => {
  assert.equal(dayMeta(day(3, [block({}), block({})]), 30).repeatLabel, undefined);
});

test('a contiguous carry-forward names the furthest day it reaches', () => {
  const m = dayMeta(day(19, [block({ repeat: { type: 'simple_repeat', onDays: [20, 21] } })]), 30);
  assert.deepEqual(m.repeatsTo, [20, 21]);
  assert.equal(m.repeatLabel, 'repeats to day 21');
});

test('a single target day reads as one day', () => {
  const m = dayMeta(day(19, [block({ repeat: { type: 'simple_repeat', onDays: [25] } })]), 30);
  assert.equal(m.repeatLabel, 'repeats to day 25');
});

test('everyDay reaches the end of the programme', () => {
  const m = dayMeta(day(28, [block({ repeat: { type: 'simple_repeat', everyDay: true } })]), 30);
  assert.deepEqual(m.repeatsTo, [29, 30]);
  assert.equal(m.repeatLabel, 'repeats to day 30');
});

test('a scattered set is counted, not described as a range', () => {
  const m = dayMeta(day(10, [block({ repeat: { type: 'simple_repeat', onDays: [12, 15, 20] } })]), 30);
  assert.equal(m.repeatLabel, 'repeats onto 3 days');
});

test('a repeat that targets no day produces no line', () => {
  // The four live blocks carrying `{type:'simple_repeat', onDays: []}`. The row
  // says "no days set"; the day header must not claim a repeat.
  const m = dayMeta(day(9, [block({ repeat: { type: 'simple_repeat', onDays: [] } })]), 30);
  assert.deepEqual(m.repeatsTo, []);
  assert.equal(m.repeatLabel, undefined);
});

test('two blocks reaching the same day are counted once', () => {
  const m = dayMeta(day(5, [
    block({ id: 'a', repeat: { type: 'simple_repeat', onDays: [6] } }),
    block({ id: 'b', repeat: { type: 'simple_repeat', onDays: [6] } }),
  ]), 30);
  assert.deepEqual(m.repeatsTo, [6]);
});

test('an undefined day is safe', () => {
  assert.deepEqual(dayMeta(undefined, 30).repeatsTo, []);
  assert.equal(blockCountLabel(undefined), '');
});
