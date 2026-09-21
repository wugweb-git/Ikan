/**
 * Run with:  npm test
 *
 * Fixtures are the four live programmes as measured on 2026-09-08, so a change
 * that makes the helper disagree with production fails here rather than on a
 * card.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipMeta, equipMetaChips, equipDurationLooksImplausible } from './equip-meta.ts';

const day = (nBlocks: number) => ({ blocks: Array.from({ length: nBlocks }, (_, i) => ({ id: i })) });
const program = (nDays: number, over: Record<string, unknown> = {}) => ({
  daily_content: Array.from({ length: nDays }, () => day(3)),
  ...over,
});

// ── the live four ───────────────────────────────────────────────────────────

test('days come from daily_content, not the authored field', () => {
  // Unburn: 31 days of content, advertised as 35.
  const unburn = program(31, { duration_days: 35, duration_weeks: 4 });
  assert.equal(equipMeta(unburn).days, 31, 'the content is the programme');
});

test('Sleep Tight agrees with its authored days and still reports content', () => {
  assert.equal(equipMeta(program(31, { duration_days: 31, duration_weeks: 5 })).days, 31);
});

test('activities are summed across days', () => {
  assert.equal(equipMeta(program(8)).activities, 24);
});

test('an empty programme reports null, never zero', () => {
  const m = equipMeta({ daily_content: [] });
  assert.equal(m.days, null);
  assert.equal(m.activities, null);
});

test('a null record does not throw', () => {
  assert.deepEqual(equipMeta(null), { days: null, activities: null, declaredWeeks: null });
});

// ── chips ───────────────────────────────────────────────────────────────────

test('chips omit what is absent rather than rendering a zero', () => {
  assert.deepEqual(equipMetaChips({ daily_content: [] }), []);
  assert.deepEqual(equipMetaChips(program(7)), [
    { key: 'days', label: '7 days' },
    { key: 'activities', label: '21 activities' },
  ]);
});

// ── the disagreement, surfaced rather than resolved ─────────────────────────

test('Unburn flags both its day and week disagreements', () => {
  const w = equipDurationLooksImplausible(program(31, { duration_days: 35, duration_weeks: 4 }));
  assert.ok(w?.includes('35'), 'names the declared days');
  assert.ok(w?.includes('31'), 'names the real days');
  assert.ok(w?.includes('duration_weeks'), '31 days is 5 weeks, not 4');
});

test('Stress Buster flags its 30-vs-28', () => {
  const w = equipDurationLooksImplausible(program(28, { duration_days: 30, duration_weeks: 4 }));
  assert.ok(w?.includes('duration_days says 30'));
  assert.ok(!w?.includes('duration_weeks'), '28 days is exactly 4 weeks, so weeks are fine');
});

test('Sleep Tight flags only its weeks', () => {
  const w = equipDurationLooksImplausible(program(31, { duration_days: 31, duration_weeks: 5 }));
  assert.equal(w, null, '31 days, 31 declared, and ceil(31/7) is 5 — all consistent');
});

test('Productivity Reset flags its 7-vs-8', () => {
  const w = equipDurationLooksImplausible(program(8, { duration_days: 7, duration_weeks: 1 }));
  assert.ok(w?.includes('duration_days says 7'));
  assert.ok(w?.includes('8 days is 2'), '8 days spills into a second week');
});

test('an unauthored duration is silence, not a complaint', () => {
  assert.equal(equipDurationLooksImplausible(program(10)), null);
});

test('a programme with no content cannot be checked', () => {
  assert.equal(equipDurationLooksImplausible({ daily_content: [], duration_days: 30 }), null);
});

test('a partial final week counts as a week', () => {
  // 31 days is 4 weeks and 3 days. Reporting "4" would make the ceiling wrong
  // for every programme that does not divide by seven.
  assert.equal(equipDurationLooksImplausible(program(31, { duration_weeks: 5 })), null);
});
