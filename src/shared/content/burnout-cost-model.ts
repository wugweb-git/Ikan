/**
 * The employer burnout-cost model behind /burnout-cost-calculator.
 *
 * Pure and import-free so it runs under `node --test` and in the browser alike.
 *
 * Source: `India Burnout Cost.xlsx`, the sales team's workbook (updated 13 Nov
 * 2026, v2.1), and its server twin in Kartik's report backend (`app/model.py`).
 * The page uses the workbook's formula as it stands, by decision on 19 Nov
 * 2026, so the page and the emailed PDF give the same figures:
 *   - attrition is the sector's annual attrition, voluntary and involuntary
 *     ("Other" 18%, Aon's overall rate)
 *   - presenteeism = (people in burnout - burnout leavers) x productivity drag
 *     4 / 6 / 8% x CTC
 *   - prevalence factor 0.75 / 1 / 1.25, replacement scalar 0.6 / 1 / 1.5
 *
 * The drag works out to about 6.2x absenteeism; Deloitte's India and UK
 * reports sit at 2-4.5x. `presenteeism: 'multiplier'` (absenteeism x 3 / 3.5 /
 * 4) is kept as the alternative, tested but not shown.
 *
 * "Low / High" is a scenario range — every assumption low or high together —
 * not a confidence interval. The UI must never call it one. No ROI multiple
 * (the programme price is a placeholder) and no "sanity band" (the workbook's
 * 3-8% has no published benchmark; it says so itself).
 */

export const MODEL_VERSION = 'v2.1';
export const RESEARCH_DATE = '2026-10-28';

/** Working days a year: 260 weekdays less 10-15 public holidays (S24). */
export const WORKING_DAYS = 250;

export type Scenario = 'low' | 'base' | 'high';
export const SCENARIOS: readonly Scenario[] = ['low', 'base', 'high'];

export type StressLevel = 'low' | 'medium' | 'high';
export const STRESS_LEVELS: readonly StressLevel[] = ['low', 'medium', 'high'];

/**
 * Share of employees in burnout at each stress level.
 * low 0.13: GPTW India high-burnout share (S11).
 * medium 0.28: GPTW medium + high, medium derived as the remainder.
 * high 0.45: Deloitte India, 55% of 3,304 symptomatic over 3,995 total
 *   = 0.4549 (S9), rounded to 0.45 as the workbook's stress map does.
 */
export const STRESS_PREVALENCE: Record<StressLevel, number> = {
  low: 0.13,
  medium: 0.28,
  high: 0.45,
};

interface ScenarioParams {
  /** Share of leavers whose exit is burnout-related. Judgement. */
  burnoutShareOfAttrition: number;
  /** Uncertainty multiplier on replacement cost. Judgement. */
  replacementScalar: number;
  /** Uncertainty multiplier on prevalence. Judgement. */
  prevalenceFactor: number;
  /** Extra sick days a year per person in burnout. Judgement, bounded by 6-12 statutory days (S23). */
  extraSickDays: number;
  /** Productivity drag as a share of CTC, for each person in burnout who stays (workbook). */
  productivityDrag: number;
  /** Alternative method only: presenteeism as a multiple of absenteeism (Deloitte India, S9). */
  presenteeismMultiple: number;
}

export const SCENARIO_PARAMS: Record<Scenario, ScenarioParams> = {
  low: { burnoutShareOfAttrition: 0.2, replacementScalar: 0.6, prevalenceFactor: 0.75, extraSickDays: 1.5, productivityDrag: 0.04, presenteeismMultiple: 3.0 },
  base: { burnoutShareOfAttrition: 0.25, replacementScalar: 1, prevalenceFactor: 1, extraSickDays: 2, productivityDrag: 0.06, presenteeismMultiple: 3.5 },
  high: { burnoutShareOfAttrition: 0.3, replacementScalar: 1.5, prevalenceFactor: 1.25, extraSickDays: 2.5, productivityDrag: 0.08, presenteeismMultiple: 4.0 },
};

export type Evidence = 'sourced' | 'derived' | 'judgement';

export type SectorId = 'saas' | 'fintech' | 'd2c' | 'edtech' | 'agency' | 'it-services' | 'bpm' | 'other';

export interface Sector {
  id: SectorId;
  label: string;
  /** Average CTC, Rs lakh a year. */
  ctcLakh: number;
  /** Annual attrition, 0-1, as the workbook sets it. */
  attrition: number;
  stress: StressLevel;
  /** Replacement cost as a share of CTC, kept at or below published ranges (S15). */
  replacement: number;
  evidence: { ctc: Evidence; attrition: Evidence; stress: Evidence };
}

export const SECTORS: readonly Sector[] = [
  { id: 'saas', label: 'SaaS / B2B software', ctcLakh: 12, attrition: 0.19, stress: 'medium', replacement: 0.6, evidence: { ctc: 'judgement', attrition: 'sourced', stress: 'judgement' } },
  { id: 'fintech', label: 'Fintech', ctcLakh: 12, attrition: 0.25, stress: 'high', replacement: 0.6, evidence: { ctc: 'judgement', attrition: 'judgement', stress: 'judgement' } },
  { id: 'd2c', label: 'D2C / e-commerce', ctcLakh: 8, attrition: 0.3, stress: 'medium', replacement: 0.45, evidence: { ctc: 'judgement', attrition: 'judgement', stress: 'judgement' } },
  { id: 'edtech', label: 'Edtech / healthtech', ctcLakh: 9, attrition: 0.3, stress: 'high', replacement: 0.45, evidence: { ctc: 'judgement', attrition: 'judgement', stress: 'judgement' } },
  { id: 'agency', label: 'Agency / creative', ctcLakh: 7, attrition: 0.33, stress: 'high', replacement: 0.4, evidence: { ctc: 'judgement', attrition: 'judgement', stress: 'judgement' } },
  { id: 'it-services', label: 'IT services', ctcLakh: 7, attrition: 0.16, stress: 'medium', replacement: 0.5, evidence: { ctc: 'judgement', attrition: 'derived', stress: 'judgement' } },
  { id: 'bpm', label: 'BPM / customer support', ctcLakh: 4, attrition: 0.32, stress: 'high', replacement: 0.4, evidence: { ctc: 'derived', attrition: 'sourced', stress: 'judgement' } },
  { id: 'other', label: 'Other', ctcLakh: 9, attrition: 0.18, stress: 'medium', replacement: 0.5, evidence: { ctc: 'judgement', attrition: 'sourced', stress: 'judgement' } },
];

export const DEFAULT_SECTOR: SectorId = 'saas';
export const DEFAULT_HEADCOUNT = 75;

export function sectorById(id: string | null | undefined): Sector | undefined {
  return SECTORS.find((s) => s.id === id);
}

/* ── Limits ─────────────────────────────────────────────────────── */

export const LIMITS = {
  headcount: { min: 5, max: 1000, fitMin: 20, fitMax: 150 },
  ctcLakh: { min: 1, max: 200 },
  attritionPct: { min: 0, max: 100 },
} as const;

export type HeadcountCheck =
  | { ok: true; value: number; warning: boolean }
  | { ok: false; reason: 'empty' | 'not-a-number' | 'out-of-range' };

/** Accepts "75", " 1,000 " and the like. Integers only. */
export function checkHeadcount(raw: string): HeadcountCheck {
  const t = raw.replace(/[\s,]/g, '');
  if (t === '') return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(t)) return { ok: false, reason: 'not-a-number' };
  const n = Number(t);
  if (n < LIMITS.headcount.min || n > LIMITS.headcount.max) return { ok: false, reason: 'out-of-range' };
  return { ok: true, value: n, warning: n < LIMITS.headcount.fitMin || n > LIMITS.headcount.fitMax };
}

/** A positive decimal within [min, max], or null. */
export function checkNumber(raw: string, min: number, max: number): number | null {
  const t = raw.replace(/[\s,]/g, '');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return n >= min && n <= max ? n : null;
}

/* ── The engine ─────────────────────────────────────────────────── */

export interface Inputs {
  headcount: number;
  ctcLakh: number;
  /** 0-1 */
  attrition: number;
  stress: StressLevel;
  /** 0-1 */
  replacement: number;
}

export interface Breakdown {
  /** All money in Rs lakh a year. */
  turnover: number;
  presenteeism: number;
  absenteeism: number;
  total: number;
  payroll: number;
  /** total / payroll, 0-1. Does not move with CTC: every term is linear in it. */
  shareOfPayroll: number;
  /** Rupees (not lakh) per employee. */
  perEmployee: number;
}

export type PresenteeismMethod = 'workbook-drag' | 'multiplier';

export function computeScenario(
  inp: Inputs,
  scenario: Scenario,
  method: PresenteeismMethod = 'workbook-drag',
): Breakdown {
  const p = SCENARIO_PARAMS[scenario];
  const leavers = inp.headcount * inp.attrition * p.burnoutShareOfAttrition;
  const turnover = leavers * inp.ctcLakh * inp.replacement * p.replacementScalar;
  const affected = inp.headcount * STRESS_PREVALENCE[inp.stress] * p.prevalenceFactor;
  const absenteeism = (affected * p.extraSickDays * inp.ctcLakh) / WORKING_DAYS;
  const presenteeism =
    method === 'multiplier'
      ? absenteeism * p.presenteeismMultiple
      : Math.max(0, affected - leavers) * p.productivityDrag * inp.ctcLakh;
  const total = turnover + presenteeism + absenteeism;
  const payroll = inp.headcount * inp.ctcLakh;
  return {
    turnover,
    presenteeism,
    absenteeism,
    total,
    payroll,
    shareOfPayroll: payroll > 0 ? total / payroll : 0,
    perEmployee: inp.headcount > 0 ? (total * 100000) / inp.headcount : 0,
  };
}

export type Estimate = Record<Scenario, Breakdown>;

export function estimate(inp: Inputs, method: PresenteeismMethod = 'workbook-drag'): Estimate {
  return {
    low: computeScenario(inp, 'low', method),
    base: computeScenario(inp, 'base', method),
    high: computeScenario(inp, 'high', method),
  };
}

export function sectorInputs(sector: Sector, headcount: number): Inputs {
  return {
    headcount,
    ctcLakh: sector.ctcLakh,
    attrition: sector.attrition,
    stress: sector.stress,
    replacement: sector.replacement,
  };
}

/** Yearly cost avoided by a given reduction in burnout, applied to the base. */
export const REDUCTIONS = [0.1, 0.2, 0.3] as const;

/* ── Display ────────────────────────────────────────────────────── */

/** Round to two significant figures. The inputs do not support more. */
export function sig2(n: number): number {
  if (n === 0 || !Number.isFinite(n)) return 0;
  const mag = Math.floor(Math.log10(Math.abs(n)));
  const step = 10 ** (mag - 1);
  return Math.round(n / step) * step;
}

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

export type MoneyUnit = 'lakh' | 'crore';

/** Below Rs 1 crore (100 lakh) show lakh; at or above, crore. */
export function unitFor(lakh: number): MoneyUnit {
  return sig2(lakh) >= 100 ? 'crore' : 'lakh';
}

/** "₹35 lakh", "₹1.2 crore". Two significant figures. */
export function formatLakh(lakh: number, unit: MoneyUnit = unitFor(lakh)): string {
  return `₹${formatAmount(lakh, unit)} ${unit}`;
}

/** The number alone, in the given unit, two significant figures. */
export function formatAmount(lakh: number, unit: MoneyUnit): string {
  const v = unit === 'crore' ? lakh / 100 : lakh;
  return INR.format(sig2(v));
}

/** "about ₹46,000" — whole rupees, two significant figures, Indian grouping. */
export function formatRupees(rupees: number): string {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(sig2(rupees))}`;
}

export function formatPercent(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

/* ── URL state ──────────────────────────────────────────────────── */

export interface CalcState {
  sector: SectorId;
  headcount: string;
  /** Overrides, as typed. Empty string = use the sector default. */
  ctc: string;
  attr: string;
  stress: StressLevel | '';
}

export const DEFAULT_STATE: CalcState = {
  sector: DEFAULT_SECTOR,
  headcount: String(DEFAULT_HEADCOUNT),
  ctc: '',
  attr: '',
  stress: '',
};

/**
 * Reads state from a query or fragment string. Every value is whitelisted or
 * range-checked; anything else is dropped silently and the default stands.
 */
export function parseState(search: string): { state: CalcState; fromUrl: boolean } {
  const q = new URLSearchParams(search.replace(/^[?#]/, ''));
  const state: CalcState = { ...DEFAULT_STATE };
  let fromUrl = false;

  const sector = sectorById(q.get('sector'));
  if (sector) { state.sector = sector.id; fromUrl = true; }

  const n = q.get('n');
  if (n !== null) {
    const c = checkHeadcount(n);
    if (c.ok) { state.headcount = String(c.value); fromUrl = true; }
  }
  const ctc = q.get('ctc');
  if (ctc !== null && checkNumber(ctc, LIMITS.ctcLakh.min, LIMITS.ctcLakh.max) !== null) { state.ctc = ctc; fromUrl = true; }
  const attr = q.get('attr');
  if (attr !== null && checkNumber(attr, LIMITS.attritionPct.min, LIMITS.attritionPct.max) !== null) { state.attr = attr; fromUrl = true; }
  const stress = q.get('stress');
  if (stress && (STRESS_LEVELS as readonly string[]).includes(stress)) { state.stress = stress as StressLevel; fromUrl = true; }

  return { state, fromUrl };
}

export function serializeState(s: CalcState): string {
  const q = new URLSearchParams();
  q.set('sector', s.sector);
  const c = checkHeadcount(s.headcount);
  if (c.ok) q.set('n', String(c.value));
  if (s.ctc && checkNumber(s.ctc, LIMITS.ctcLakh.min, LIMITS.ctcLakh.max) !== null) q.set('ctc', s.ctc);
  if (s.attr && checkNumber(s.attr, LIMITS.attritionPct.min, LIMITS.attritionPct.max) !== null) q.set('attr', s.attr);
  if (s.stress) q.set('stress', s.stress);
  return q.toString();
}

/** Resolves state to model inputs, or null when the headcount is not usable. */
export function resolveInputs(s: CalcState): Inputs | null {
  const sector = sectorById(s.sector) ?? sectorById(DEFAULT_SECTOR)!;
  const c = checkHeadcount(s.headcount);
  if (!c.ok) return null;
  const base = sectorInputs(sector, c.value);
  const ctc = s.ctc ? checkNumber(s.ctc, LIMITS.ctcLakh.min, LIMITS.ctcLakh.max) : null;
  const attr = s.attr ? checkNumber(s.attr, LIMITS.attritionPct.min, LIMITS.attritionPct.max) : null;
  return {
    ...base,
    ctcLakh: ctc ?? base.ctcLakh,
    attrition: attr !== null ? attr / 100 : base.attrition,
    stress: s.stress || base.stress,
  };
}

/** For analytics: never the exact headcount. */
export function headcountBand(n: number): string {
  if (n < 20) return '5-19';
  if (n < 50) return '20-49';
  if (n < 100) return '50-99';
  if (n < 150) return '100-149';
  if (n < 300) return '150-299';
  return '300+';
}
