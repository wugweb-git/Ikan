/**
 * Run with:  npm test
 *
 * Node 24 strips TypeScript natively, so this needs no test framework. Keep the
 * syntax erasable — no enums, no parameter properties, no namespaces.
 *
 * **The fixtures below are copied from live records**, separators and all. The
 * previous version of this file built its own shapes from the same assumptions
 * as the code under test, so 21 tests passed against a spec shape that does not
 * exist: `scores[].bands` (live entries have no bands), `higher-is-better` with
 * hyphens (the store writes underscores), and a tone vocabulary no band uses.
 * Every assertion held and every one of them was measuring nothing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveResultPresentation, withChange, profileIdFor, isTone,
  type ResultPresentation,
} from './result-presentation.ts';

// ── Fixtures, copied from live records ──────────────────────────────────────

/** `scoring-profile:sleep-severity`, verbatim shape. */
const sleepProfile = {
  id: 'sleep-severity',
  calc: 'sum',
  direction: 'higher_is_distress',
  bands: [
    { id: 'sleep-band-healthy', min: 8, max: 25, tone: 'success', label: 'Healthy Sleep', severity_ref: 'minimal' },
    { id: 'sleep-band-poor', min: 25, max: 33, tone: 'warning', label: 'Poor Sleep', severity_ref: 'moderate' },
    { id: 'sleep-band-very-poor', min: 33, max: 40, tone: 'error', label: 'Very Poor Sleep', severity_ref: 'severe' },
  ],
};

/** A `higher_is_better` profile, the shape `who5` / `ngse` / `brs` use. */
const wellbeingProfile = {
  id: 'who5',
  calc: 'sum',
  direction: 'higher_is_better',
  bands: [
    { min: 0, max: 13, tone: 'error', label: 'Low wellbeing', severity_ref: 'moderately-severe' },
    { min: 13, max: 18, tone: 'warning', label: 'Moderate wellbeing', severity_ref: 'mild' },
    { min: 18, max: 25, tone: 'success', label: 'High wellbeing', severity_ref: 'minimal' },
  ],
};

/** `assessment_def:` — note `scores[]` carries id/items/label/profile_id ONLY. */
const sleepSpec = {
  id: 'asm_sleep',
  title: 'Struggling with quality sleep',
  category: 'sleep',
  scoring_profile_id: 'sleep-severity',
  scores: [{ id: 'sleep-total', label: 'Sleep', profile_id: 'sleep-severity', items: [] }],
};

const profiles = { 'sleep-severity': sleepProfile, 'who5': wellbeingProfile };

const result = (over: Record<string, unknown> = {}) => ({
  assessment_id: 'asm_sleep',
  score: 18,
  max_score: 40,
  completed_at: '2026-09-03T10:00:00.000Z',
  interpretation: { label: 'Completed' },
  ...over,
});

// ── 1 · the three real tone values, and nothing else ────────────────────────

test('the authored tone vocabulary is accepted', () => {
  for (const t of ['success', 'warning', 'error']) assert.equal(isTone(t), true, t);
});

test('the four-term vocabulary I invented is not a tone', () => {
  for (const t of ['good', 'watch', 'concern', 'urgent']) assert.equal(isTone(t), false, t);
});

test('a live band resolves its authored tone rather than null', () => {
  const p = resolveResultPresentation(result({ score: 18 }), sleepSpec, profiles);
  assert.deepEqual(p.band, { label: 'Healthy Sleep', tone: 'success', index: 0, of: 3 });
});

// ── 2 · bands come from the profile, not the definition ─────────────────────

test('the profile is found through scoring_profile_id', () => {
  assert.equal(profileIdFor(sleepSpec), 'sleep-severity');
});

test('a lone score resolves its profile_id when no primary is declared', () => {
  assert.equal(profileIdFor({ scores: [{ profile_id: 'gad7' }] }), 'gad7');
});

test('a multi-score assessment with no primary resolves no profile', () => {
  // General: five independent scales, no overall score. A single band would be
  // a fiction, so it must resolve to none.
  const general = { id: 'asm_general', scores: [
    { profile_id: 'gad2-screen' }, { profile_id: 'phq2-screen' }, { profile_id: 'who5' },
    { profile_id: 'ngse' }, { profile_id: 'brs' },
  ]};
  assert.equal(profileIdFor(general), null);
});

test('without the profiles map no band can be placed', () => {
  const p = resolveResultPresentation(result(), sleepSpec, null);
  assert.equal(p.band?.index, -1, 'definitions carry no bands, so nothing can be placed');
  assert.equal(p.band?.of, 0);
});

test('band edges are half-open, with the last band closed', () => {
  const at = (n: number) => resolveResultPresentation(result({ score: n }), sleepSpec, profiles).band;
  assert.equal(at(24)?.label, 'Healthy Sleep');
  assert.equal(at(25)?.label, 'Poor Sleep', '25 is the start of Poor, not the end of Healthy');
  assert.equal(at(33)?.label, 'Very Poor Sleep');
  assert.equal(at(40)?.label, 'Very Poor Sleep', 'the last band includes its ceiling');
});

// ── 3 · direction, with the separator the store actually writes ─────────────

test('higher_is_distress (underscores, as stored) is read correctly', () => {
  assert.equal(resolveResultPresentation(result(), sleepSpec, profiles).direction, 'higher-is-distress');
});

test('higher_is_better (underscores, as stored) is NOT read as distress', () => {
  const spec = { id: 'asm_wb', scoring_profile_id: 'who5' };
  const p = resolveResultPresentation(result({ score: 20, max_score: 25 }), spec, profiles);
  assert.equal(p.direction, 'higher-is-wellbeing',
    'the underscored spelling is what the store writes; hyphens-only matching read this backwards');
  assert.deepEqual(p.band, { label: 'High wellbeing', tone: 'success', index: 2, of: 3 });
});

test('an unknown direction defaults to distress rather than throwing', () => {
  const p = resolveResultPresentation(result(), { scoring_profile_id: 'x' }, { x: { bands: [] } });
  assert.equal(p.direction, 'higher-is-distress');
});

// ── 4 · a score outside every band (the live Burnout case) ──────────────────

test('a score in the wrong units keeps its label and loses the track', () => {
  // Burnout stores 60/115 (a raw sum) against bat-mean's 1-5 bands.
  const p = resolveResultPresentation(
    result({ score: 60, max_score: 115, interpretation: { label: 'Low Burnout Risk' } }),
    sleepSpec, profiles,
  );
  assert.equal(p.band?.label, 'Low Burnout Risk', 'the stored label still renders');
  assert.equal(p.band?.index, -1, 'but it was not placed, so no band track');
  assert.equal(p.band?.tone, null, 'and no tone is guessed for it');
});

// ── 5 · raw ─────────────────────────────────────────────────────────────────

test('max_score absent makes raw null rather than inventing a denominator', () => {
  assert.equal(resolveResultPresentation(result({ max_score: undefined }), sleepSpec, profiles).raw, null);
});

test('max_score of 0 is not a denominator either', () => {
  assert.equal(resolveResultPresentation(result({ max_score: 0 }), sleepSpec, profiles).raw, null);
});

test('a real max is reported verbatim', () => {
  assert.deepEqual(resolveResultPresentation(result(), sleepSpec, profiles).raw, { score: 18, max: 40 });
});

// ── 6 · integrity ───────────────────────────────────────────────────────────

test('pre-spec wins over excluded, because it is the more specific fact', () => {
  const p = resolveResultPresentation(
    result({ scoring_provenance: { state: 'pre-spec', excluded_from_trends: true } }), sleepSpec, profiles);
  assert.equal(p.integrity, 'pre-spec');
});

test('excluded is reported when there is no pre-spec state', () => {
  const p = resolveResultPresentation(
    result({ scoring_provenance: { state: 'rescored', excluded_from_trends: true } }), sleepSpec, profiles);
  assert.equal(p.integrity, 'excluded');
});

test('partial carries the counts', () => {
  const p = resolveResultPresentation(
    result({ section_scores: { overall: { answered: 22, expected: 23 } } }), sleepSpec, profiles);
  assert.equal(p.integrity, 'partial');
  assert.deepEqual(p.partial, { answered: 22, expected: 23 });
});

test('a complete run is ok', () => {
  assert.equal(resolveResultPresentation(result(), sleepSpec, profiles).integrity, 'ok');
});

// ── 7 · withChange ──────────────────────────────────────────────────────────

const row = (over: Partial<ResultPresentation>): ResultPresentation => ({
  instrument: { id: 'asm_sleep', name: 'Sleep', categoryLabel: 'sleep' },
  band: { label: 'Poor Sleep', tone: 'warning', index: 1, of: 3 },
  direction: 'higher-is-distress',
  raw: { score: 28, max: 40 },
  completedAt: '2026-09-02T10:00:00.000Z',
  change: null,
  integrity: 'ok',
  ...over,
});

test('moving down a band on a distress instrument is an improvement', () => {
  const [older, newer] = withChange([
    row({ completedAt: '2026-08-01T00:00:00Z', band: { label: 'Very Poor Sleep', tone: 'error', index: 2, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.equal(older.change, null, 'the earliest run has nothing to compare to');
  assert.deepEqual(newer.change, { fromLabel: 'Very Poor Sleep', delta: 'improved' });
});

test('the same move on a wellbeing instrument is the opposite verdict', () => {
  const [, newer] = withChange([
    row({ direction: 'higher-is-wellbeing', completedAt: '2026-08-01T00:00:00Z',
          band: { label: 'High wellbeing', tone: 'success', index: 2, of: 3 } }),
    row({ direction: 'higher-is-wellbeing', completedAt: '2026-09-01T00:00:00Z',
          band: { label: 'Moderate wellbeing', tone: 'warning', index: 1, of: 3 } }),
  ]);
  assert.deepEqual(newer.change, { fromLabel: 'High wellbeing', delta: 'worsened' });
});

test('an unchanged band is same, not absent', () => {
  const [, newer] = withChange([
    row({ completedAt: '2026-08-01T00:00:00Z' }),
    row({ completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.deepEqual(newer.change, { fromLabel: 'Poor Sleep', delta: 'same' });
});

test('an excluded row is skipped, not compared through', () => {
  const rows = withChange([
    row({ completedAt: '2026-07-01T00:00:00Z', band: { label: 'Healthy Sleep', tone: 'success', index: 0, of: 3 } }),
    row({ completedAt: '2026-08-01T00:00:00Z', integrity: 'excluded',
          band: { label: 'Very Poor Sleep', tone: 'error', index: 2, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.equal(rows[1].change, null, 'the excluded row itself gets no verdict');
  // Against Healthy Sleep, the last comparable run, this is a worsening.
  // Compared through the excluded row it would have read "improved".
  assert.deepEqual(rows[2].change, { fromLabel: 'Healthy Sleep', delta: 'worsened' });
});

test('a pre-spec row is skipped the same way', () => {
  const rows = withChange([
    row({ completedAt: '2026-07-01T00:00:00Z', band: { label: 'Healthy Sleep', tone: 'success', index: 0, of: 3 } }),
    row({ completedAt: '2026-08-01T00:00:00Z', integrity: 'pre-spec',
          band: { label: 'Very Poor Sleep', tone: 'error', index: 2, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.deepEqual(rows[2].change, { fromLabel: 'Healthy Sleep', delta: 'worsened' });
});

test('two instruments never compare to each other', () => {
  const rows = withChange([
    row({ completedAt: '2026-08-01T00:00:00Z' }),
    row({ instrument: { id: 'asm_burnout', name: 'Burnout', categoryLabel: 'burnout' },
          completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.equal(rows[1].change, null);
});

test('an unplaced band produces no change verdict', () => {
  const rows = withChange([
    row({ completedAt: '2026-08-01T00:00:00Z', band: { label: 'Completed', tone: null, index: -1, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.equal(rows[1].change, null, 'an index of -1 cannot be ordered against anything');
});

test('input order is preserved regardless of dates', () => {
  const rows = withChange([
    row({ completedAt: '2026-09-01T00:00:00Z' }),
    row({ completedAt: '2026-08-01T00:00:00Z', band: { label: 'Healthy Sleep', tone: 'success', index: 0, of: 3 } }),
  ]);
  assert.equal(rows[0].completedAt, '2026-09-01T00:00:00Z');
  assert.deepEqual(rows[0].change, { fromLabel: 'Healthy Sleep', delta: 'worsened' });
  assert.equal(rows[1].change, null);
});

// ── 8 · the value banded is the computed one, not the legacy sum ────────────

/** `bat-mean`, verbatim: calc mean, bands on 1-5 with decimal edges. */
const batMean = {
  id: 'bat-mean',
  calc: 'mean',
  direction: 'higher_is_distress',
  bands: [
    { min: 1, max: 3, tone: 'success', label: 'Low', severity_ref: 'minimal' },
    { min: 3, max: 4.31, tone: 'warning', label: 'Normal', severity_ref: 'mild' },
    { min: 4.31, max: 5, tone: 'error', label: 'High', severity_ref: 'moderately-severe' },
  ],
};

test('a mean-calc profile bands section_scores.overall.value, not the raw sum', () => {
  // The live Burnout record, verbatim: a raw sum at the top level and the mean
  // in the breakdown. Banding 60 against 1-5 places it nowhere.
  const live = {
    assessment_id: 'asm_burnout',
    score: 60,
    max_score: 115,
    interpretation: { label: 'High' },
    section_scores: { overall: { value: 2.608696, max: 5, band: { label: 'Low' } } },
    completed_at: '2026-09-03T06:45:22.891Z',
  };
  const p = resolveResultPresentation(live, { scoring_profile_id: 'bat-mean' }, { 'bat-mean': batMean });
  assert.equal(p.band?.label, 'Low', 'the mean places in Low; the sum places nowhere');
  assert.equal(p.band?.tone, 'success');
  assert.equal(p.band?.index, 0);
  // And note the record's own interpretation.label says "High" — two
  // representations of one result. The computed one is the one that matches.
  assert.notEqual(p.band?.label, live.interpretation.label);
});

test('a sum-calc result with no breakdown still bands its top-level score', () => {
  const p = resolveResultPresentation(
    { assessment_id: 'asm_sleep', score: 30, max_score: 40 }, sleepSpec, profiles);
  assert.equal(p.band?.label, 'Poor Sleep');
});
