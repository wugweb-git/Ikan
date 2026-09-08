/**
 * Run with:  npm test
 *
 * **§19 step 1 promises zero behaviour change. This is that promise.**
 *
 * Every value below is transcribed from `DAY_TYPE_CONFIG` as it stood in
 * `ProgramPlayer.tsx` before the move (commit 02f16f6a), including the two
 * fields that were functions. If a value here disagrees with the module, the
 * move altered how a day renders — which is the one thing it must not do.
 *
 * `practice`'s `fallbackTitle` reading 'Assessment' is not a typo. It is what
 * the original held, and preserving a live oddity verbatim is the whole job of
 * a behaviour-preserving move; correcting it is a separate, visible decision.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_TYPE_LAYOUTS, DEFAULT_DAY_LAYOUT, layoutOf, primaryButtonFor, fallbackTitleFor,
} from './day-layout.ts';
import { policyOf, DAY_TYPE_POLICIES } from './day-policy.ts';
import { DAY_TYPE_PRESETS } from './block-type-rules.ts';

/** dayType -> [isLast label, other label, fallbackTitle for day 7] */
const ORIGINAL: Record<string, [string, string, string]> = {
  'onboarding':      ['Start Programme',    'Continue', 'Getting started'],
  'quiz':            ['See Results',        'Next',     'Day 7'],
  'check-in':        ['Done',               'Next',     'Day 7'],
  'rest':            ['Done',               'Done',     'Day 7'],
  'assessment':      ['Complete',           'Continue', 'Assessment'],
  'assessment-lite': ['Complete',           'Next',     'Assessment'],
  'learning':        ['Continue',           'Continue', 'Day 7'],
  'practice':        ['Done for Today',     'Next',     'Assessment'],
  'workshop':        ['Finish',             'Continue', 'Day 7'],
  'tracker':         ['Save',               'Save',     'Day 7'],
  'reflection':      ['Complete Reflection','Complete Reflection', 'Day 7'],
};

test('the two fields that were functions produce identical strings', () => {
  for (const [dayType, [last, other, title]] of Object.entries(ORIGINAL)) {
    const l = DAY_TYPE_LAYOUTS[dayType as keyof typeof DAY_TYPE_LAYOUTS];
    assert.ok(l, `no layout for "${dayType}"`);
    assert.equal(primaryButtonFor(l, true), last, `${dayType} last-step button`);
    assert.equal(primaryButtonFor(l, false), other, `${dayType} mid-step button`);
    assert.equal(fallbackTitleFor(l, 7), title, `${dayType} fallback title`);
  }
});

test('every stage type has a layout, and the set matches the presets', () => {
  assert.deepEqual(
    Object.keys(DAY_TYPE_LAYOUTS).sort(),
    Object.keys(DAY_TYPE_PRESETS).sort(),
    'a stage with a preset but no layout renders as a learning day, silently',
  );
});

test('a day with no layout of its own falls back to its type — every live day, today', () => {
  // All 98 live days carry `dayType: "learning"` and no `layout`, so this is
  // the path the whole database takes until the migration runs.
  assert.equal(layoutOf({ dayType: 'learning' }), DAY_TYPE_LAYOUTS['learning']);
  assert.equal(layoutOf({ dayType: 'tracker' }), DAY_TYPE_LAYOUTS['tracker']);
  // An unknown type, and no type at all, both land on learning rather than throwing.
  assert.equal(layoutOf({ dayType: 'nonsense' as never }), DEFAULT_DAY_LAYOUT);
  assert.equal(layoutOf(undefined), DEFAULT_DAY_LAYOUT);
});

test('a day that carries its own layout ignores its type entirely', () => {
  // The point of the whole step: after the migration a day answers for itself,
  // and `dayType` can be removed without changing anything.
  const own = { ...DAY_TYPE_LAYOUTS['tracker'] };
  assert.equal(layoutOf({ dayType: 'learning', layout: own }), own);
});

test('policy resolves the same way, and carries the save behaviour', () => {
  assert.equal(policyOf({ dayType: 'learning' }), DAY_TYPE_POLICIES['learning']);
  /*
    The two fields ProgramPlayer.handleExit reads, asserted as SETS rather than
    spot-checked — I wrote `reflection` here from memory and it does not carry
    saveOnExit at all. Naming the whole set means the next person cannot make
    the same mistake quietly, and a stage gaining or losing the flag has to be
    a deliberate edit here.
  */
  const withExit = Object.entries(DAY_TYPE_POLICIES).filter(([, v]) => v.saveOnExit).map(([k]) => k).sort();
  const withToggle = Object.entries(DAY_TYPE_POLICIES).filter(([, v]) => v.saveOnToggle).map(([k]) => k).sort();
  assert.deepEqual(withExit, ['check-in', 'practice']);
  assert.deepEqual(withToggle, ['tracker']);
  const own = { stepGroupRules: { allowed: false, required: false }, saveOnExit: true };
  assert.equal(policyOf({ dayType: 'learning', policy: own }), own);
});

test('policies are derived from the presets, not restated beside them', () => {
  for (const [type, preset] of Object.entries(DAY_TYPE_PRESETS)) {
    assert.deepEqual(
      DAY_TYPE_POLICIES[type as keyof typeof DAY_TYPE_POLICIES],
      { ...preset.autoConfig, stepGroupRules: preset.stepGroupRules },
      `policy for "${type}" has drifted from its preset`,
    );
  }
});
