/**
 * The contrast ratchet, run with the suite so it cannot be forgotten.
 *
 * `scripts/contrast-ratchet.mjs` holds the pairs and the maths; this asserts the
 * count has not risen and that the ratio calculation is right, because a wrong
 * checker is worse than none — it would certify a failing pair as passing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// @ts-expect-error — plain ESM script, no types, deliberately runnable on its own
import { audit, ratio, TEXT_PAIRS } from '../../../scripts/contrast-ratchet.mjs';

test('the ratio calculation matches the WCAG reference values', () => {
  // Black on white is 21:1 exactly; a colour against itself is 1:1.
  assert.equal(Math.round(ratio('#000000', '#ffffff')), 21);
  assert.equal(Math.round(ratio('#ffffff', '#ffffff')), 1);
  // A published pair: #767676 on white is the canonical 4.54 "just passes".
  assert.ok(Math.abs(ratio('#767676', '#ffffff') - 4.54) < 0.02);
});

test('every declared pair resolves to a number — an unresolvable token is a hole', () => {
  const rows = audit(readFileSync(new URL('./globals.css', import.meta.url), 'utf8'));
  assert.equal(rows.length, TEXT_PAIRS.length);
  const unresolved = rows.filter((r: { pass: boolean | null }) => r.pass === null);
  assert.deepEqual(unresolved, [], 'a pair whose tokens do not resolve is never checked');
});

test('contrast failures have not risen above the recorded baseline', () => {
  const baseline = Number.parseInt(readFileSync(new URL('../../../.contrast-baseline', import.meta.url), 'utf8').trim(), 10);
  const rows = audit(readFileSync(new URL('./globals.css', import.meta.url), 'utf8'));
  const failing = rows.filter((r: { pass: boolean | null }) => r.pass === false);
  assert.ok(
    failing.length <= baseline,
    `contrast failures rose to ${failing.length} (baseline ${baseline}):\n` +
      failing.map((r: { ratio: number; fg: string; bg: string }) => `  ${r.ratio} ${r.fg} on ${r.bg}`).join('\n'),
  );
});
