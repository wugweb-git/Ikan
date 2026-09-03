/**
 * Run with:  npm run test
 *
 * Node 24 strips TypeScript natively, so this needs no test framework and no
 * new dependency. Keep the syntax erasable — no enums, no parameter
 * properties, no namespaces — or Node will refuse the file.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveResultPresentation, withChange, type ResultPresentation } from './result-presentation.ts';

// ── Fixtures ────────────────────────────────────────────────────────────────

/** Sleep: higher score is worse, three authored bands. */
const distressSpec = {
  id: 'asm_sleep',
  title: 'Struggling with quality sleep',
  category: 'sleep',
  scores: [{
    id: 'sleep-total',
    direction: 'higher-is-distress',
    bands: [
      { label: 'Healthy Sleep', severity_ref: 'minimal', tone: 'good' },
      { label: 'Poor Sleep', severity_ref: 'moderate', tone: 'concern' },
      { label: 'Very Poor Sleep', severity_ref: 'severe', tone: 'urgent' },
    ],
  }],
};

/** WHO-5 shaped: higher score is better, so band order runs bad -> good. */
const wellbeingSpec = {
  id: 'asm_wellbeing',
  title: 'Wellbeing',
  category: 'general',
  scores: [{
    id: 'who5',
    direction: 'higher-is-better',
    bands: [
      { label: 'Low wellbeing', severity_ref: 'severe', tone: 'urgent' },
      { label: 'Moderate wellbeing', severity_ref: 'moderate', tone: 'watch' },
      { label: 'High wellbeing', severity_ref: 'minimal', tone: 'good' },
    ],
  }],
};

const result = (over: Record<string, unknown> = {}) => ({
  assessment_id: 'asm_sleep',
  score: 18,
  max_score: 40,
  completed_at: '2026-09-03T10:00:00.000Z',
  section_scores: { overall: { band: { label: 'Healthy Sleep', severity_ref: 'minimal' } } },
  ...over,
});

// ── 1 · band absent ─────────────────────────────────────────────────────────

test('band absent renders nothing, and is not derived from the score', () => {
  const p = resolveResultPresentation(
    result({ section_scores: undefined, interpretation: undefined }),
    distressSpec,
  );
  assert.equal(p.band, null, 'a missing band must stay null, never a computed tier');
  // The score is still present and perfectly derivable-from — that is the point.
  assert.deepEqual(p.raw, { score: 18, max: 40 });
});

// ── 2 · max_score absent ────────────────────────────────────────────────────

test('max_score absent makes raw null rather than inventing a denominator', () => {
  const p = resolveResultPresentation(result({ max_score: undefined }), distressSpec);
  assert.equal(p.raw, null);
  assert.equal(p.band?.label, 'Healthy Sleep', 'the band is unaffected by a missing max');
});

test('max_score of 0 is not a denominator either', () => {
  assert.equal(resolveResultPresentation(result({ max_score: 0 }), distressSpec).raw, null);
});

// ── 3 · direction comes from the spec, never inferred ───────────────────────

test('higher-is-wellbeing is read from the spec', () => {
  const p = resolveResultPresentation(
    result({
      assessment_id: 'asm_wellbeing',
      section_scores: { overall: { band: { label: 'High wellbeing', severity_ref: 'minimal' } } },
    }),
    wellbeingSpec,
  );
  assert.equal(p.direction, 'higher-is-wellbeing');
  assert.deepEqual(p.band, { label: 'High wellbeing', tone: 'good', index: 2, of: 3 });
});

test('higher-is-distress is read from the spec', () => {
  const p = resolveResultPresentation(result(), distressSpec);
  assert.equal(p.direction, 'higher-is-distress');
  assert.equal(p.band?.index, 0);
});

test('no spec at all still produces a row, with the band it stored', () => {
  const p = resolveResultPresentation(result(), null);
  assert.equal(p.direction, 'higher-is-distress', 'the safe default, not a claim about the instrument');
  assert.deepEqual(p.band, { label: 'Healthy Sleep', tone: null, index: -1, of: 0 });
});

// ── 4 · tone is authored, never guessed ─────────────────────────────────────

test('a band with no authored tone is null, not a guess from its label', () => {
  const spec = { ...distressSpec, scores: [{ ...distressSpec.scores[0],
    bands: [{ label: 'Healthy Sleep', severity_ref: 'minimal' }] }] };
  assert.equal(resolveResultPresentation(result(), spec).band?.tone, null);
});

test('a stored label that is not in the spec keeps the label and loses the track', () => {
  const p = resolveResultPresentation(
    result({ section_scores: { overall: { band: { label: 'Completed' } } } }),
    distressSpec,
  );
  assert.equal(p.band?.label, 'Completed', 'the label renders verbatim');
  assert.equal(p.band?.index, -1, 'but it cannot be placed, so no band track');
  assert.equal(p.band?.tone, null);
});

test('a reworded label still places by severity_ref', () => {
  const p = resolveResultPresentation(
    result({ section_scores: { overall: { band: { label: 'Sleeping well', severity_ref: 'minimal' } } } }),
    distressSpec,
  );
  assert.equal(p.band?.index, 0);
  assert.equal(p.band?.tone, 'good');
});

// ── 5 · integrity ───────────────────────────────────────────────────────────

test('pre-spec wins over excluded, because it is the more specific fact', () => {
  const p = resolveResultPresentation(
    result({ scoring_provenance: { state: 'pre-spec', excluded_from_trends: true } }),
    distressSpec,
  );
  assert.equal(p.integrity, 'pre-spec');
});

test('excluded is reported when there is no pre-spec state', () => {
  const p = resolveResultPresentation(
    result({ scoring_provenance: { state: 'rescored', excluded_from_trends: true } }),
    distressSpec,
  );
  assert.equal(p.integrity, 'excluded');
});

test('partial carries the counts', () => {
  const p = resolveResultPresentation(
    result({ section_scores: { overall: {
      band: { label: 'Healthy Sleep', severity_ref: 'minimal' }, answered: 22, expected: 23 } } }),
    distressSpec,
  );
  assert.equal(p.integrity, 'partial');
  assert.deepEqual(p.partial, { answered: 22, expected: 23 });
});

test('a complete run is ok', () => {
  assert.equal(resolveResultPresentation(result(), distressSpec).integrity, 'ok');
});

// ── 6 · withChange ──────────────────────────────────────────────────────────

const row = (over: Partial<ResultPresentation>): ResultPresentation => ({
  instrument: { id: 'asm_sleep', name: 'Sleep', categoryLabel: 'sleep' },
  band: { label: 'Poor Sleep', tone: 'concern', index: 1, of: 3 },
  direction: 'higher-is-distress',
  raw: { score: 20, max: 40 },
  completedAt: '2026-09-02T10:00:00.000Z',
  change: null,
  integrity: 'ok',
  ...over,
});

test('moving down a band on a distress instrument is an improvement', () => {
  const [older, newer] = withChange([
    row({ completedAt: '2026-08-01T00:00:00Z', band: { label: 'Very Poor Sleep', tone: 'urgent', index: 2, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z', band: { label: 'Poor Sleep', tone: 'concern', index: 1, of: 3 } }),
  ]);
  assert.equal(older.change, null, 'the earliest run has nothing to compare to');
  assert.deepEqual(newer.change, { fromLabel: 'Very Poor Sleep', delta: 'improved' });
});

test('the same move on a wellbeing instrument is the opposite verdict', () => {
  const [, newer] = withChange([
    row({ direction: 'higher-is-wellbeing', completedAt: '2026-08-01T00:00:00Z',
          band: { label: 'High wellbeing', tone: 'good', index: 2, of: 3 } }),
    row({ direction: 'higher-is-wellbeing', completedAt: '2026-09-01T00:00:00Z',
          band: { label: 'Moderate wellbeing', tone: 'watch', index: 1, of: 3 } }),
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
    row({ completedAt: '2026-07-01T00:00:00Z', band: { label: 'Healthy Sleep', tone: 'good', index: 0, of: 3 } }),
    row({ completedAt: '2026-08-01T00:00:00Z', integrity: 'excluded',
          band: { label: 'Very Poor Sleep', tone: 'urgent', index: 2, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z', band: { label: 'Poor Sleep', tone: 'concern', index: 1, of: 3 } }),
  ]);
  assert.equal(rows[1].change, null, 'the excluded row itself gets no verdict');
  // Compared against Healthy Sleep (the last comparable run), so this is a
  // worsening. Compared through the excluded row it would have read "improved".
  assert.deepEqual(rows[2].change, { fromLabel: 'Healthy Sleep', delta: 'worsened' });
});

test('a pre-spec row is skipped the same way', () => {
  const rows = withChange([
    row({ completedAt: '2026-07-01T00:00:00Z', band: { label: 'Healthy Sleep', tone: 'good', index: 0, of: 3 } }),
    row({ completedAt: '2026-08-01T00:00:00Z', integrity: 'pre-spec',
          band: { label: 'Very Poor Sleep', tone: 'urgent', index: 2, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z', band: { label: 'Poor Sleep', tone: 'concern', index: 1, of: 3 } }),
  ]);
  assert.equal(rows[1].change, null);
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

test('an unplaceable band produces no change verdict', () => {
  const rows = withChange([
    row({ completedAt: '2026-08-01T00:00:00Z', band: { label: 'Completed', tone: null, index: -1, of: 3 } }),
    row({ completedAt: '2026-09-01T00:00:00Z' }),
  ]);
  assert.equal(rows[1].change, null, 'an index of -1 cannot be ordered against anything');
});

test('input order is preserved regardless of dates', () => {
  const rows = withChange([
    row({ completedAt: '2026-09-01T00:00:00Z' }),
    row({ completedAt: '2026-08-01T00:00:00Z', band: { label: 'Healthy Sleep', tone: 'good', index: 0, of: 3 } }),
  ]);
  assert.equal(rows[0].completedAt, '2026-09-01T00:00:00Z');
  assert.deepEqual(rows[0].change, { fromLabel: 'Healthy Sleep', delta: 'worsened' });
  assert.equal(rows[1].change, null);
});
