/**
 * Run with:  npm test
 *
 * Fixtures are the live burnout and anxiety rules as measured 2026-09-08, so
 * the ordering is checked against the rows production actually holds.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankMatchingRules } from './recommendation-ranking.ts';

/** The four live burnout rules, in creation order. */
const burnout = [
  { id: 'b-mild', min_severity: 'mild', priority: 7, target_id: 'unburn' },
  { id: 'b-mod-8', min_severity: 'moderate', priority: 8, target_id: 'stress-buster' },
  { id: 'b-mod-10', min_severity: 'moderate', priority: 10, target_id: 'sleep-tight' },
  { id: 'b-modsev', min_severity: 'moderately-severe', priority: 10, target_id: 'sleep-tight' },
];

test('the most severe user gets the rule written for their band, not the mildest', () => {
  // The live defect: ascending priority put mild (7) first, so a
  // moderately-severe burnout user was handed the mild programme.
  const ranked = rankMatchingRules(burnout, 'moderately-severe');
  assert.equal(ranked[0].id, 'b-modsev');
  assert.notEqual(ranked[0].id, 'b-mild', 'the old ordering picked this');
});

test('a moderate user gets the strongest rule at their own threshold', () => {
  const ranked = rankMatchingRules(burnout, 'moderate');
  assert.equal(ranked[0].id, 'b-mod-10', 'priority 10 beats 8 within the same threshold');
  assert.equal(ranked.length, 3, 'moderately-severe is above them and must not match');
});

test('a mild user matches only the mild rule', () => {
  const ranked = rankMatchingRules(burnout, 'mild');
  assert.deepEqual(ranked.map(r => r.id), ['b-mild']);
});

test('a minimal user matches nothing', () => {
  assert.deepEqual(rankMatchingRules(burnout, 'minimal'), []);
});

test('a severe user still matches every rule, strongest first', () => {
  const ranked = rankMatchingRules(burnout, 'severe');
  assert.deepEqual(ranked.map(r => r.id), ['b-modsev', 'b-mod-10', 'b-mod-8', 'b-mild']);
});

test('specificity outranks priority', () => {
  // A weak rule at the user's own threshold beats a strong one far below it.
  const rules = [
    { id: 'low-threshold-high-priority', min_severity: 'mild', priority: 99 },
    { id: 'exact-threshold-low-priority', min_severity: 'severe', priority: 1 },
  ];
  assert.equal(rankMatchingRules(rules, 'severe')[0].id, 'exact-threshold-low-priority');
});

test('an unrecognised threshold is not a match rather than a NaN comparison', () => {
  const rules = [{ id: 'typo', min_severity: 'moderatly-severe', priority: 10 }];
  assert.deepEqual(rankMatchingRules(rules, 'severe'), [],
    'a typo fails closed and visibly, not by silently ranking first');
});

test('a missing priority does not throw or win', () => {
  const rules = [
    { id: 'no-priority', min_severity: 'mild', priority: undefined as unknown as number },
    { id: 'has-priority', min_severity: 'mild', priority: 5 },
  ];
  assert.equal(rankMatchingRules(rules, 'mild')[0].id, 'has-priority');
});

test('ordering is stable enough to be deterministic for identical rules', () => {
  const rules = [
    { id: 'first', min_severity: 'mild', priority: 5 },
    { id: 'second', min_severity: 'mild', priority: 5 },
  ];
  assert.deepEqual(rankMatchingRules(rules, 'mild').map(r => r.id), ['first', 'second']);
});
