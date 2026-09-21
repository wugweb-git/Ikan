/**
 * `repeatSummary` — what a block row says about carry-forward.
 *
 * The case that matters most is the empty one: four live blocks carry
 * `{type: 'simple_repeat', onDays: []}`, which `repeatTargetDays` resolves to
 * the home day alone. The row must say so rather than say nothing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repeatSummary, type Activity } from './block-model.ts';

const block = (repeat: Activity['repeat']) => ({ repeat }) as Pick<Activity, 'repeat'>;

test('no repeat field means no summary', () => {
  assert.equal(repeatSummary(block(undefined), 5, 30), null);
});

test('a repeat that targets no day is reported, not hidden', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', onDays: [] }), 5, 30);
  assert.deepEqual(s, { label: 'no days set', targetsNone: true });
});

test('on_demand with no start day is also empty', () => {
  const s = repeatSummary(block({ type: 'on_demand', onDays: [] }), 5, 30);
  assert.equal(s?.targetsNone, true);
});

test('everyDay', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', everyDay: true }), 5, 30);
  assert.deepEqual(s, { label: 'every day', targetsNone: false });
});

test('everyDay on the last day of the programme targets nothing', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', everyDay: true }), 30, 30);
  assert.equal(s?.targetsNone, true);
});

test('on_demand from a day', () => {
  const s = repeatSummary(block({ type: 'on_demand', onDemandFromDay: 12 }), 5, 30);
  assert.deepEqual(s, { label: 'from day 12', targetsNone: false });
});

test('a single explicit day', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', onDays: [7] }), 5, 30);
  assert.deepEqual(s, { label: 'day 7', targetsNone: false });
});

test('a contiguous run collapses to a range', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', onDays: [6, 7, 8] }), 5, 30);
  assert.equal(s?.label, 'days 6–8');
});

test('a scattered list lists the first three and counts the rest', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', onDays: [7, 9, 11, 13, 15] }), 5, 30);
  assert.equal(s?.label, 'days 7, 9, 11 +2');
});

test('the home day is never listed as a target', () => {
  const s = repeatSummary(block({ type: 'simple_repeat', onDays: [5, 6] }), 5, 30);
  assert.equal(s?.label, 'day 6');
});
