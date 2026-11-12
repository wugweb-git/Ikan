/**
 * Run with:  npm test
 *
 * Two anchors. The WORKBOOK figures come from India_Burnout_Cost_Model_v2.xlsx
 * and pin `workbook-drag` mode to it, so the spreadsheet stays a regression
 * check. The v2.1 figures are recomputed by hand below, independently of the
 * engine, from the formulas written out in each test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SECTORS, sectorById, sectorInputs, estimate, computeScenario, STRESS_PREVALENCE,
  checkHeadcount, checkNumber, sig2, formatLakh, formatRupees, formatPercent, unitFor,
  parseState, serializeState, resolveInputs, DEFAULT_STATE, headcountBand,
} from './burnout-cost-model.ts';

const close = (a: number, b: number, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

const saas75 = sectorInputs(sectorById('saas')!, 75);

test('workbook parity: SaaS at 75 reproduces 29.3328 / 44.406 / 63.837 lakh', () => {
  const e = estimate(saas75, 'workbook-drag');
  close(e.low.total, 29.3328);
  close(e.base.total, 44.406);
  close(e.high.total, 63.837);
});

test('workbook parity: every sector base total at 75', () => {
  const expected: Record<string, number> = {
    saas: 44.406, fintech: 64.89, d2c: 31.434, edtech: 45.46125,
    agency: 34.65, 'it-services': 21.756, bpm: 19.56, other: 29.3895,
  };
  for (const s of SECTORS) {
    const inp = { ...sectorInputs(s, 75), attrition: s.workbookAttrition ?? s.attrition };
    close(computeScenario(inp, 'base', 'workbook-drag').total, expected[s.id]);
  }
});

test('workbook presenteeism runs at ~8.3x absenteeism, the figure v2.1 corrects', () => {
  const b = computeScenario(saas75, 'base', 'workbook-drag');
  close(b.presenteeism / b.absenteeism, 8.3036, 1e-3);
});

test('v2.1 SaaS at 75, recomputed by hand', () => {
  // leavers 75 x .19 x .25 = 3.5625; turnover x 12 x .6 = 25.65
  // affected 75 x .28 = 21; absenteeism 21 x 2 x 12 / 250 = 2.016; presenteeism x 3.5 = 7.056
  const b = computeScenario(saas75, 'base');
  close(b.turnover, 25.65);
  close(b.absenteeism, 2.016);
  close(b.presenteeism, 7.056);
  close(b.total, 34.722);
  close(b.shareOfPayroll, 34.722 / 900);
  close(b.perEmployee, 46296, 1);
});

test('v2.1 SaaS low and high: 2.43% and 5.82% of payroll', () => {
  const e = estimate(saas75);
  // low: turnover 75x.19x.2x12x.6x.8 = 16.416; abs 21x.9x1.5x12/250 = 1.36080; x4
  close(e.low.total, 16.416 + 1.3608 * 4);
  // high: turnover 75x.19x.3x12x.6x1.25 = 38.475; abs 21x1.1x2.5x12/250 = 2.772; x5
  close(e.high.total, 38.475 + 2.772 * 5);
  assert.equal(formatPercent(e.low.shareOfPayroll), '2.4%');
  assert.equal(formatPercent(e.high.shareOfPayroll), '5.8%');
});

test('v2.1 sector base totals at 75', () => {
  const expected: Record<string, number> = {
    saas: 34.722, fintech: 48.33, d2c: 26.298, edtech: 33.716,
    agency: 25.83, 'it-services': 15.792, bpm: 14.46, other: 18.6165,
  };
  for (const s of SECTORS) close(computeScenario(sectorInputs(s, 75), 'base').total, expected[s.id], 1e-3);
});

test('high-stress prevalence is Deloitte arithmetic rounded as the workbook does', () => {
  close(STRESS_PREVALENCE.high, Math.round(((0.55 * 3304) / 3995) * 100) / 100, 1e-12);
});

test('share of payroll does not move with CTC', () => {
  const a = computeScenario({ ...saas75, ctcLakh: 6 }, 'base').shareOfPayroll;
  const b = computeScenario({ ...saas75, ctcLakh: 30 }, 'base').shareOfPayroll;
  close(a, b, 1e-12);
});

test('low <= base <= high for every sector and stress level', () => {
  for (const s of SECTORS) for (const stress of ['low', 'medium', 'high'] as const) {
    const e = estimate({ ...sectorInputs(s, 60), stress });
    assert.ok(e.low.total <= e.base.total && e.base.total <= e.high.total, s.id);
  }
});

test('headcount validation', () => {
  assert.deepEqual(checkHeadcount(''), { ok: false, reason: 'empty' });
  assert.deepEqual(checkHeadcount('3'), { ok: false, reason: 'out-of-range' });
  assert.deepEqual(checkHeadcount('1001'), { ok: false, reason: 'out-of-range' });
  assert.deepEqual(checkHeadcount('12.5'), { ok: false, reason: 'not-a-number' });
  assert.deepEqual(checkHeadcount('-5'), { ok: false, reason: 'not-a-number' });
  assert.deepEqual(checkHeadcount('75'), { ok: true, value: 75, warning: false });
  assert.deepEqual(checkHeadcount('200'), { ok: true, value: 200, warning: true });
  assert.deepEqual(checkHeadcount(' 1,000 '), { ok: true, value: 1000, warning: true });
  assert.equal(checkNumber('0', 1, 200), null);
  assert.equal(checkNumber('12.5', 1, 200), 12.5);
  assert.equal(checkNumber('abc', 0, 100), null);
});

test('display: two significant figures, lakh below a crore, crore above', () => {
  assert.equal(sig2(34.722), 35);
  assert.equal(sig2(21.8595), 22);
  assert.equal(sig2(149.6), 150);
  assert.equal(formatLakh(34.722), 'Rs 35 lakh');
  assert.equal(formatLakh(48.33), 'Rs 48 lakh');
  assert.equal(formatLakh(9.94), 'Rs 9.9 lakh');
  assert.equal(formatLakh(123.4), 'Rs 1.2 crore');
  assert.equal(unitFor(99.4), 'lakh');
  assert.equal(unitFor(99.6), 'crore'); // rounds to 100 lakh, so shown as Rs 1 crore
  assert.equal(formatLakh(99.6), 'Rs 1 crore');
  assert.equal(formatLakh(22, 'lakh'), 'Rs 22 lakh');
  assert.equal(formatRupees(46296), 'Rs 46,000');
  assert.equal(formatRupees(123456), 'Rs 1,20,000');
});

test('URL state round-trips and whitelists', () => {
  const s = { ...DEFAULT_STATE, sector: 'fintech' as const, headcount: '120', attr: '22', stress: 'high' as const };
  const back = parseState(serializeState(s));
  assert.equal(back.fromUrl, true);
  assert.deepEqual(back.state, s);

  const bad = parseState('?sector=<script>&n=99999&ctc=-4&attr=500&stress=extreme');
  assert.equal(bad.fromUrl, false);
  assert.deepEqual(bad.state, DEFAULT_STATE);

  assert.equal(parseState('#sector=bpm&n=40').state.sector, 'bpm');
});

test('resolveInputs applies overrides and refuses a bad headcount', () => {
  assert.equal(resolveInputs({ ...DEFAULT_STATE, headcount: '2' }), null);
  const r = resolveInputs({ ...DEFAULT_STATE, ctc: '20', attr: '10', stress: 'low' })!;
  assert.equal(r.ctcLakh, 20);
  close(r.attrition, 0.1);
  assert.equal(r.stress, 'low');
});

test('headcount bands', () => {
  assert.equal(headcountBand(5), '5-19');
  assert.equal(headcountBand(75), '50-99');
  assert.equal(headcountBand(150), '150-299');
  assert.equal(headcountBand(1000), '300+');
});
