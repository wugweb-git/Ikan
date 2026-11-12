/**
 * Analytics for the burnout-cost calculator. Typed so a misspelt event or a
 * stray parameter fails the build rather than fragmenting GA data.
 *
 * Nothing personal, no free text, and never the exact headcount: sector and a
 * headcount BAND only. gtag is loaded by index.html; when it is blocked or
 * absent every call is a silent no-op.
 */

type Band = string;

export interface CalcEvents {
  calc_start: { sector: string; headcount_band: Band };
  calc_result_view: { sector: string; headcount_band: Band; is_default_example: boolean; entry: 'default' | 'url_params' };
  calc_assumptions_open: { sector: string };
  calc_assumption_change: { field: 'ctc' | 'attrition' | 'stress' };
  calc_method_open: Record<string, never>;
  calc_source_click: { source_id: string };
  calc_link_copy: { sector: string };
  calc_pilot_click: { location: 'dock' | 'inline'; sector: string; headcount_band: Band };
  pilot_form_start: { sector: string };
  pilot_submit_error: { reason: 'validation' | 'offline' | 'network' | 'server' };
  contact_submit_success: { source: 'calculator' };
}

export function trackCalc<K extends keyof CalcEvents>(event: K, params: CalcEvents[K]): void {
  try {
    const g = (globalThis as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof g === 'function') g('event', event, params);
  } catch {
    /* analytics must never break the page */
  }
}

/** Session keys shared by the calculator and the contact page. */
export const PILOT_PREFILL_KEY = 'ikan-pilot-prefill';
export const CALC_STATE_KEY = 'ikan-calc-state';

export interface PilotPrefill {
  subject: string;
  message: string;
}
