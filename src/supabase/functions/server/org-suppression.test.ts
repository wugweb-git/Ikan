import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLEMENT_REASON,
  groupsToWithhold,
  withholdPeriod,
} from './org-suppression.ts';

const dept = (department: string, n: number) => ({ department, n });
const keyOf = (r: { department: string }) => r.department;

test('a group below the floor is withheld, and says how small it was', () => {
  const rows = [dept('Engineering', 24), dept('Design', 14), dept('Finance', 7), dept('Ops', 11)];
  const out = groupsToWithhold(rows, 10, keyOf);

  assert.ok(out.has('Finance'));
  assert.match(out.get('Finance')!, /Fewer than 10 people with data in this group \(7\)/);
});

test('withholding exactly one group also withholds a second — otherwise subtraction recovers it', () => {
  const rows = [dept('Engineering', 24), dept('Design', 14), dept('Finance', 7), dept('Ops', 11)];
  const out = groupsToWithhold(rows, 10, keyOf);

  assert.equal(out.size, 2, 'one below the floor must take a second with it');
  // The smallest still eligible, so the least information is lost.
  assert.ok(out.has('Ops'));
  assert.equal(out.get('Ops'), COMPLEMENT_REASON);
  assert.ok(!out.has('Engineering'), 'the largest group is the worst one to withhold');
});

test('two groups already below the floor need no third — the remainder isolates neither', () => {
  const rows = [dept('Engineering', 24), dept('Design', 14), dept('Finance', 7), dept('Leadership', 4)];
  const out = groupsToWithhold(rows, 10, keyOf);

  assert.deepEqual([...out.keys()].sort(), ['Finance', 'Leadership']);
});

test('nothing below the floor means nothing withheld', () => {
  const rows = [dept('Engineering', 24), dept('Design', 14), dept('Ops', 11)];
  assert.equal(groupsToWithhold(rows, 10, keyOf).size, 0);
});

test('a lone group below the floor is withheld without dragging in a non-existent second', () => {
  const out = groupsToWithhold([dept('Finance', 7)], 10, keyOf);
  assert.deepEqual([...out.keys()], ['Finance']);
});

test('every group below the floor means every group withheld', () => {
  const rows = [dept('A', 3), dept('B', 4)];
  assert.equal(groupsToWithhold(rows, 10, keyOf).size, 2);
});

test('the floor counts contributors, not headcount — the caller passes n accordingly', () => {
  // A 40-person department where 9 people have data is a group of 9.
  assert.ok(groupsToWithhold([dept('Big', 9), dept('Other', 30)], 10, keyOf).has('Big'));
});

test('a raised floor withholds more, which is the point of letting it be raised', () => {
  const rows = [dept('Engineering', 24), dept('Design', 14), dept('Ops', 11)];
  assert.equal(groupsToWithhold(rows, 10, keyOf).size, 0);
  assert.equal(groupsToWithhold(rows, 20, keyOf).size, 2); // Design and Ops
});

test('a period below the floor is withheld; at the floor it is not', () => {
  assert.equal(withholdPeriod(9, 10)?.suppressed, true);
  assert.equal(withholdPeriod(10, 10), null);
});
