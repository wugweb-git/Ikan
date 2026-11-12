import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowDown, ArrowRight, BadgeIndianRupee, BatteryLow, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronUp, ClipboardCheck, Link2, Loader2, Lock, MessagesSquare, RotateCcw, Sparkles, Thermometer,
  UserMinus, Users,
} from 'lucide-react';
import { useSeo } from '../ui/hooks/useSeo';
import {
  SECTORS, STRESS_LEVELS, LIMITS, WORKING_DAYS, REDUCTIONS, RESEARCH_DATE, MODEL_VERSION,
  DEFAULT_STATE, DEFAULT_HEADCOUNT, sectorById, estimate, checkHeadcount, checkNumber,
  resolveInputs, parseState, serializeState, headcountBand, unitFor, formatLakh, formatAmount,
  formatRupees, formatPercent,
  type CalcState, type Estimate, type Evidence, type SectorId, type StressLevel,
} from '../../../shared/content/burnout-cost-model';
import { SOURCES, JUDGEMENTS, EXCLUDED } from '../../../shared/content/burnout-sources';
import {
  CALC_PATH, CALC_TITLE, CALC_DESCRIPTION, CALC_IMAGE, CALC_EXAMPLE, CALC_EXAMPLE_LINE, CALC_FAQ, calcJsonLd,
} from '../../../shared/content/burnout-calc-seo';

const CALC_JSON_LD = calcJsonLd();
import { submitContactMessage, CONTACT_LIMITS } from '../../../shared/api/ikan2-forms';
import { trackCalc, CALC_STATE_KEY } from '../../../shared/content/calc-analytics';

/**
 * /burnout-cost-calculator: the public front door for employers.
 *
 * An HR lead picks a sector and a headcount and gets a yearly ballpark of what
 * burnout costs them, as a scenario range, with the method in full. The one
 * ask is a pilot request, which goes through the existing contact form.
 *
 * Built from the site's own pieces: the info-page band, info-button, the
 * contact form's fields and the FAQ's native details rows. Only the sector
 * chips, the range strip and the split bar are new (calc-* in globals.css).
 *
 * Privacy: the arithmetic runs here, in the browser. State is kept in
 * sessionStorage so Back from /contact returns to the same estimate, and goes
 * into a URL fragment only when the visitor copies a link. Analytics receive
 * a sector and a headcount band, never the numbers typed.
 *
 * Spec: Notion "iKan, Employer Cost Calculator (live spec)".
 */

const PATH = CALC_PATH;

const EVIDENCE_LABEL: Record<Evidence, string> = {
  sourced: 'Sourced',
  derived: 'Derived',
  judgement: 'Judgement',
};

const EVIDENCE_MEANING: Record<Evidence, string> = {
  sourced: 'From a named study or survey.',
  derived: 'Worked out from sourced figures.',
  judgement: 'Our assumption. Change it if you know better.',
};

const STRESS_LABEL: Record<StressLevel, string> = { low: 'Low', medium: 'Medium', high: 'High' };

const QUICK_HEADCOUNTS = [25, 50, 100, 250];

/* The pilot form. It posts through the site's existing contact pipeline
   (submitContactMessage → the contact inbox), so there is no new table or
   endpoint; what is new is that the request is made here, beside the number,
   instead of on a contact page that opens with a crisis card. */
const SUPPORT_EMAIL = 'support@ikanhealth.in';
const NOTE_MAX = 600;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type LeadField = 'name' | 'email' | 'company' | 'role' | 'note';
type Lead = Record<LeadField, string>;
type LeadStatus = 'idle' | 'sending' | 'sent' | 'error';
const EMPTY_LEAD: Lead = { name: '', email: '', company: '', role: '', note: '' };

function validateLead(l: Lead): Partial<Record<LeadField, string>> {
  const e: Partial<Record<LeadField, string>> = {};
  if (!l.name.trim()) e.name = 'Enter your name.';
  if (!l.email.trim()) e.email = 'Enter your work email.';
  else if (!EMAIL_RE.test(l.email.trim())) e.email = 'Enter an email address like name@company.com.';
  if (!l.company.trim()) e.company = 'Enter your company name.';
  return e;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

const REVIEWED = new Date(`${RESEARCH_DATE}T00:00:00`).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
});

/* The worked example and the FAQ live in burnout-calc-seo.ts, shared with the
   build's static copy of this page. */
const EXAMPLE = CALC_EXAMPLE;
const EXAMPLE_LINE = CALC_EXAMPLE_LINE;
const FAQ = CALC_FAQ;

function loadInitialState(): { state: CalcState; fromUrl: boolean } {
  if (typeof window === 'undefined') return { state: DEFAULT_STATE, fromUrl: false };
  const fromHash = parseState(window.location.hash);
  if (fromHash.fromUrl) return fromHash;
  const fromQuery = parseState(window.location.search);
  if (fromQuery.fromUrl) return fromQuery;
  try {
    const saved = window.sessionStorage.getItem(CALC_STATE_KEY);
    if (saved) return { state: parseState(saved).state, fromUrl: false };
  } catch { /* storage blocked: defaults */ }
  return { state: DEFAULT_STATE, fromUrl: false };
}

interface Props {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function BurnoutCostCalculator({ className, onNavigate }: Props) {
  const initial = useMemo(loadInitialState, []);
  const [state, setState] = useState<CalcState>(initial.state);
  const [headcountTouched, setHeadcountTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showDock, setShowDock] = useState(false);
  const [lead, setLead] = useState<Lead>(EMPTY_LEAD);
  const [leadErrors, setLeadErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('idle');
  const [leadError, setLeadError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const formStarted = useRef(false);
  const leadRefs = useRef<Partial<Record<LeadField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const sentRef = useRef<HTMLHeadingElement>(null);

  const started = useRef(false);
  const resultSeen = useRef(false);
  const resultRef = useRef<HTMLElement>(null);
  const pilotRef = useRef<HTMLElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);
  const ids = useId();

  const sector = sectorById(state.sector)!;
  const headcountCheck = checkHeadcount(state.headcount);
  // resolveInputs is pure and cheap; memoise on the state, which is what it reads.
  const inputs = useMemo(() => resolveInputs(state), [state]);
  const current: Estimate | null = useMemo(() => (inputs ? estimate(inputs) : null), [inputs]);

  // The last good estimate stays on screen, marked stale, while a field is invalid.
  const lastGood = useRef<{ est: Estimate; headcount: number }>({ est: EXAMPLE, headcount: DEFAULT_HEADCOUNT });
  if (current && inputs) lastGood.current = { est: current, headcount: inputs.headcount };
  const shown = lastGood.current.est;
  const shownHeadcount = lastGood.current.headcount;
  const stale = !current;
  const empty = state.headcount.trim() === '';
  const unit = unitFor(shown.base.total);
  const isDefault = serializeState(state) === serializeState(DEFAULT_STATE);

  const ctcValue = state.ctc ? checkNumber(state.ctc, LIMITS.ctcLakh.min, LIMITS.ctcLakh.max) : null;
  const attrValue = state.attr ? checkNumber(state.attr, LIMITS.attritionPct.min, LIMITS.attritionPct.max) : null;
  const ctcError = state.ctc !== '' && ctcValue === null;
  const attrError = state.attr !== '' && attrValue === null;
  const overridden = { ctc: state.ctc !== '', attr: state.attr !== '', stress: state.stress !== '' };

  useSeo({
    title: CALC_TITLE,
    description: CALC_DESCRIPTION,
    canonicalPath: PATH,
    image: CALC_IMAGE.url,
    type: 'website',
    jsonLd: CALC_JSON_LD,
  });

  /* A hash link is read once, then the address goes back to the plain path:
     the fragment would otherwise keep describing an estimate the visitor has
     since changed. */
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hash || window.location.search)) {
      window.history.replaceState(window.history.state, '', PATH);
    }
    // A shared link opened while the page is already showing changes only the
    // hash, which does not remount the page, so read it here too.
    const onHash = () => {
      const parsed = parseState(window.location.hash);
      if (parsed.fromUrl) setState(parsed.state);
      window.history.replaceState(window.history.state, '', PATH);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    try { window.sessionStorage.setItem(CALC_STATE_KEY, serializeState(state)); } catch { /* fine */ }
  }, [state]);

  const update = useCallback((patch: Partial<CalcState>) => {
    setCopied(false);
    setState((s) => {
      const next = { ...s, ...patch };
      if (!started.current) {
        started.current = true;
        const c = checkHeadcount(next.headcount);
        trackCalc('calc_start', { sector: next.sector, headcount_band: c.ok ? headcountBand(c.value) : 'none' });
      }
      return next;
    });
  }, []);

  /* Screen readers hear the new figure once, after typing settles. */
  const firstAnnounce = useRef(true);
  useEffect(() => {
    if (firstAnnounce.current) { firstAnnounce.current = false; return; }
    const t = window.setTimeout(() => {
      if (!current) {
        setAnnouncement(empty ? 'Enter your headcount to see your estimate.' : '');
        return;
      }
      const u = unitFor(current.base.total);
      setAnnouncement(
        `Estimated cost ${formatLakh(current.base.total, u)} a year, range ${formatAmount(current.low.total, u)} to ${formatAmount(current.high.total, u)} ${u}, ${formatPercent(current.base.shareOfPayroll)} of payroll.`,
      );
    }, 600);
    return () => window.clearTimeout(t);
  }, [current, empty]);

  /* One result view per visit, and the phone dock: shown once the result has
     scrolled away, hidden while the inline pilot block is on screen, so only
     one pilot button is ever visible. */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    let resultVisible = true;
    let pilotVisible = false;
    let reached = false; // the visitor has scrolled to the calculator at least once
    const sync = () => setShowDock(reached && !resultVisible && !pilotVisible);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === resultRef.current) {
          resultVisible = e.isIntersecting;
          if (e.isIntersecting || e.boundingClientRect.top < 0) reached = true;
          if (e.isIntersecting && !resultSeen.current) {
            resultSeen.current = true;
            trackCalc('calc_result_view', {
              sector: state.sector,
              headcount_band: headcountBand(shownHeadcount),
              is_default_example: isDefault,
              entry: initial.fromUrl ? 'url_params' : 'default',
            });
          }
        }
        if (e.target === calcRef.current && e.isIntersecting) reached = true;
        if (e.target === pilotRef.current) pilotVisible = e.isIntersecting;
      }
      sync();
    });
    if (calcRef.current) io.observe(calcRef.current);
    if (resultRef.current) io.observe(resultRef.current);
    if (pilotRef.current) io.observe(pilotRef.current);
    return () => io.disconnect();
    // Observers are set up once; the analytics values read on first sight are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = async () => {
    const url = `${window.location.origin}${PATH}#${serializeState(state)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setAnnouncement('Link copied. Anyone who opens it sees this estimate.');
    } catch {
      window.prompt('Copy this link', url);
    }
    trackCalc('calc_link_copy', { sector: state.sector });
  };

  const scrollToEl = (el: HTMLElement | null, focus?: HTMLElement | null) => {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (focus) window.setTimeout(() => focus.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 450);
  };

  const goToPilot = (location: 'dock' | 'inline') => {
    trackCalc('calc_pilot_click', { location, sector: state.sector, headcount_band: headcountBand(shownHeadcount) });
    scrollToEl(pilotRef.current, leadStatus === 'sent' ? sentRef.current : leadRefs.current.name ?? null);
  };

  const setLeadField = (k: LeadField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setLead((l) => ({ ...l, [k]: v }));
    // Clear a field's error as soon as it is fixed, never add one while typing.
    if (leadErrors[k]) setLeadErrors((errs) => ({ ...errs, [k]: validateLead({ ...lead, [k]: v })[k] }));
    if (!formStarted.current) {
      formStarted.current = true;
      trackCalc('pilot_form_start', { sector: state.sector });
    }
  };

  const onLeadBlur = (k: LeadField) => () => {
    if (!lead[k].trim()) return; // an untouched empty field is not an error until submit
    setLeadErrors((errs) => ({ ...errs, [k]: validateLead(lead)[k] }));
  };

  const buildLeadMessage = () => {
    const est = shown;
    const n = shownHeadcount;
    const u = unitFor(est.base.total);
    const changed = [
      overridden.ctc && ctcValue !== null ? `average CTC ₹${ctcValue} lakh` : '',
      overridden.attr && attrValue !== null ? `voluntary attrition ${attrValue}%` : '',
      overridden.stress && state.stress ? `stress level ${STRESS_LABEL[state.stress].toLowerCase()}` : '',
    ].filter(Boolean);
    const lines = [
      `Pilot request from the burnout cost calculator (model ${MODEL_VERSION}).`,
      '',
      `Company: ${lead.company.trim()}`,
      lead.role.trim() ? `Role: ${lead.role.trim()}` : '',
      `Sector: ${sector.label}`,
      `Team size: ${n.toLocaleString('en-IN')} people`,
      '',
      `Estimate: about ${formatLakh(est.base.total, u)} a year, scenario range ₹${formatAmount(est.low.total, u)} to ${formatAmount(est.high.total, u)} ${u}, ${formatPercent(est.base.shareOfPayroll)} of payroll.`,
      changed.length ? `Their own numbers: ${changed.join(', ')}.` : '',
      lead.note.trim() ? `Note: ${lead.note.trim()}` : '',
    ].filter((l, i, arr) => l !== '' || (arr[i - 1] ?? '') !== '');
    return lines.join('\n').slice(0, CONTACT_LIMITS.message);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadStatus === 'sending') return; // no double posts

    const errs = validateLead(lead);
    setLeadErrors(errs);
    const firstBad = (['name', 'email', 'company'] as LeadField[]).find((k) => errs[k]);
    if (firstBad) {
      leadRefs.current[firstBad]?.focus();
      setAnnouncement(`Please check the form. ${Object.values(errs).join(' ')}`);
      trackCalc('pilot_submit_error', { reason: 'validation' });
      return;
    }

    // A bot filled the hidden field: show success, send nothing.
    if (honeypot) { setLeadStatus('sent'); return; }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setLeadStatus('error');
      setLeadError('You seem to be offline. Your details are still here, so try again once you are connected.');
      trackCalc('pilot_submit_error', { reason: 'offline' });
      return;
    }

    setLeadStatus('sending');
    setLeadError('');
    const result = await submitContactMessage({
      name: lead.name.trim().slice(0, CONTACT_LIMITS.name),
      email: lead.email.trim(),
      subject: `Pilot enquiry, ${lead.company.trim()}, ${shownHeadcount.toLocaleString('en-IN')} people`.slice(0, CONTACT_LIMITS.subject),
      message: buildLeadMessage(),
    });

    if (result.ok) {
      setLeadStatus('sent');
      trackCalc('contact_submit_success', { source: 'calculator' });
      window.setTimeout(() => sentRef.current?.focus(), 50);
    } else {
      setLeadStatus('error');
      setLeadError(result.error || 'Something went wrong on our side. Please try again in a moment.');
      trackCalc('pilot_submit_error', { reason: result.error?.startsWith('Network') ? 'network' : 'server' });
    }
  };

  const resetOverrides = () => update({ ctc: '', attr: '', stress: '' });

  const headcountMsg = !headcountTouched && !empty ? null
    : headcountCheck.ok ? null
    : empty ? 'Enter your headcount to see your estimate.'
    : headcountCheck.reason === 'not-a-number' ? 'Enter a whole number of people, such as 75.'
    : `Enter a headcount between ${LIMITS.headcount.min} and ${LIMITS.headcount.max.toLocaleString('en-IN')}.`;
  const headcountWarn = headcountCheck.ok && headcountCheck.warning;

  const total = shown.base.total || 1;
  const parts = [
    { key: 'turnover', label: 'People leaving', icon: UserMinus, value: shown.base.turnover,
      explain: 'Hiring and training replacements for people who quit because of burnout.' },
    { key: 'presenteeism', label: 'Working below par', icon: BatteryLow, value: shown.base.presenteeism,
      explain: 'People at work but not at their usual level while they are burnt out.' },
    { key: 'absenteeism', label: 'Extra sick days', icon: Thermometer, value: shown.base.absenteeism,
      explain: 'Paid days off taken by people in burnout, over and above the usual.' },
  ];
  const pos = (v: number) => `${Math.max(0, Math.min(100, (v / (shown.high.total || 1)) * 100))}%`;

  return (
    <div className={['ikan2-theme', 'info-page', 'site-page-below-nav', 'calc-page', className].filter(Boolean).join(' ')}>
      {/* ── 1. Hero: the question, one action, and the example as a picture ── */}
      <section className="calc-hero" aria-labelledby={`${ids}-h1`}>
        <div className="info-band__inner calc-hero__inner">
          <div className="calc-hero__copy">
            <p className="calc-eyebrow">For HR leads and founders</p>
            <h1 className="calc-hero__title" id={`${ids}-h1`}>Burnout cost calculator for Indian teams</h1>
            <p className="calc-hero__lead">
              What is burnout costing your team each year? Pick your sector and headcount and get a figure in
              rupees, with the method in full.
            </p>
            <div className="calc-hero__actions">
              <a className="info-button calc-hero__cta" href="#calculator">
                Work out your cost <ArrowDown aria-hidden="true" size={16} />
              </a>
              <a className="calc-ghost" href="#method">How it is estimated</a>
            </div>
            <ul className="calc-trust">
              <li><BadgeIndianRupee aria-hidden="true" size={16} /> Free, no sign-up</li>
              <li><Lock aria-hidden="true" size={16} /> Runs in your browser</li>
              <li><BookOpen aria-hidden="true" size={16} /> {SOURCES.length} named sources</li>
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* ── 2. The calculator ── */}
      <section className="calc-band calc-band--white" id="calculator" aria-labelledby={`${ids}-calc-h`}>
        <div className="info-band__inner">
          <header className="calc-head">
            <p className="calc-kicker"><span className="calc-kicker__num">1</span> Your estimate</p>
            <h2 className="calc-head__title" id={`${ids}-calc-h`}>Work out your number</h2>
            <p className="calc-answer">{EXAMPLE_LINE} Pick your sector and headcount to see yours.</p>
          </header>

          <div className="calc-layout">
            {/* ── Inputs ── */}
            <div className="calc-inputs" ref={calcRef}>
              <fieldset className="calc-fieldset">
                <legend className="calc-step"><span className="calc-step__num" aria-hidden="true">1</span> Your sector</legend>
                <div className="calc-chips calc-chips--sectors">
                  {SECTORS.map((s) => (
                    <label key={s.id} className="calc-chip">
                      <input
                        type="radio"
                        name={`${ids}-sector`}
                        value={s.id}
                        checked={state.sector === s.id}
                        onChange={() => update({ sector: s.id as SectorId })}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="calc-field calc-field--step">
                <label className="calc-step" htmlFor={`${ids}-n`}><span className="calc-step__num" aria-hidden="true">2</span> Number of employees</label>
                <p className="calc-help" id={`${ids}-n-help`}>Between {LIMITS.headcount.min} and {LIMITS.headcount.max.toLocaleString('en-IN')}</p>
                <div className="contact-field calc-number">
                  <Users aria-hidden="true" size={18} />
                  <input
                    id={`${ids}-n`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    enterKeyHint="done"
                    maxLength={6}
                    autoComplete="off"
                    value={state.headcount}
                    onChange={(e) => update({ headcount: e.target.value })}
                    onBlur={() => setHeadcountTouched(true)}
                    aria-invalid={headcountMsg ? true : undefined}
                    aria-describedby={`${ids}-n-help${headcountMsg ? ` ${ids}-n-err` : ''}${headcountWarn ? ` ${ids}-n-warn` : ''}`}
                  />
                </div>
                {headcountMsg ? <p className="calc-error" id={`${ids}-n-err`}>{headcountMsg}</p> : null}
                {headcountWarn ? (
                  <p className="calc-warn" id={`${ids}-n-warn`}>
                    Sector averages fit teams of {LIMITS.headcount.fitMin} to {LIMITS.headcount.fitMax} best. Treat this as rougher.
                  </p>
                ) : null}
                <div className="calc-chips calc-chips--quick" role="group" aria-label="Quick headcounts">
                  {QUICK_HEADCOUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="calc-quick"
                      aria-pressed={state.headcount === String(n)}
                      onClick={() => { setHeadcountTouched(false); update({ headcount: String(n) }); }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <details
                className="faq-item calc-disclosure"
                onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) trackCalc('calc_assumptions_open', { sector: state.sector }); }}
              >
                <summary><span className="calc-step"><span className="calc-step__num calc-step__num--soft" aria-hidden="true">3</span> Use your own numbers <span className="calc-optional">Optional</span></span></summary>
                <div className="calc-disclosure__body">
                  <p className="calc-help">
                    These start at the defaults for {sector.label.toLowerCase()}. Each one says how much evidence is behind it.
                  </p>

                  <div className="calc-field">
                    <div className="calc-label-row">
                      <label className="calc-label" htmlFor={`${ids}-ctc`}>Average CTC (₹ lakh a year)</label>
                      <EvidenceBadge evidence={sector.evidence.ctc} own={overridden.ctc} />
                    </div>
                    <div className="contact-field">
                      <input
                        id={`${ids}-ctc`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder={String(sector.ctcLakh)}
                        value={state.ctc}
                        onChange={(e) => { update({ ctc: e.target.value }); trackCalc('calc_assumption_change', { field: 'ctc' }); }}
                        aria-invalid={ctcError || undefined}
                        aria-describedby={ctcError ? `${ids}-ctc-err` : undefined}
                      />
                    </div>
                    {ctcError ? <p className="calc-error" id={`${ids}-ctc-err`}>Enter an amount between {LIMITS.ctcLakh.min} and {LIMITS.ctcLakh.max} lakh.</p> : null}
                  </div>

                  <div className="calc-field">
                    <div className="calc-label-row">
                      <label className="calc-label" htmlFor={`${ids}-attr`}>Voluntary attrition (% a year)</label>
                      <EvidenceBadge evidence={sector.evidence.attrition} own={overridden.attr} />
                    </div>
                    <div className="contact-field">
                      <input
                        id={`${ids}-attr`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder={String(Math.round(sector.attrition * 100))}
                        value={state.attr}
                        onChange={(e) => { update({ attr: e.target.value }); trackCalc('calc_assumption_change', { field: 'attrition' }); }}
                        aria-invalid={attrError || undefined}
                        aria-describedby={attrError ? `${ids}-attr-err` : undefined}
                      />
                    </div>
                    {attrError ? <p className="calc-error" id={`${ids}-attr-err`}>Enter a percentage between 0 and 100.</p> : null}
                  </div>

                  <fieldset className="calc-fieldset calc-field">
                    <div className="calc-label-row">
                      <legend className="calc-label">How intense is work, most of the time?</legend>
                      <EvidenceBadge evidence={sector.evidence.stress} own={overridden.stress} />
                    </div>
                    <div className="calc-chips calc-chips--stress">
                      {STRESS_LEVELS.map((lvl) => (
                        <label key={lvl} className="calc-chip">
                          <input
                            type="radio"
                            name={`${ids}-stress`}
                            value={lvl}
                            checked={(state.stress || sector.stress) === lvl}
                            onChange={() => { update({ stress: lvl }); trackCalc('calc_assumption_change', { field: 'stress' }); }}
                          />
                          <span>{STRESS_LABEL[lvl]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {overridden.ctc || overridden.attr || overridden.stress ? (
                    <button type="button" className="calc-reset" onClick={resetOverrides}>
                      <RotateCcw aria-hidden="true" size={15} /> Reset to sector defaults
                    </button>
                  ) : null}

                  <dl className="calc-evidence-key">
                    {(Object.keys(EVIDENCE_LABEL) as Evidence[]).map((e) => (
                      <div key={e}>
                        <dt><span className={`calc-badge calc-badge--${e}`}>{EVIDENCE_LABEL[e]}</span></dt>
                        <dd>{EVIDENCE_MEANING[e]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </details>
            </div>

            {/* ── Result ── */}
            <section
              ref={resultRef}
              className={['calc-result', stale ? 'calc-result--stale' : ''].filter(Boolean).join(' ')}
              aria-labelledby={`${ids}-result-h`}
            >
              <div className="calc-result__hero">
                <div className="calc-result__top">
                  <h3 className="calc-result__title" id={`${ids}-result-h`}>Your estimate</h3>
                  <span className="calc-result__tag">
                    {isDefault ? 'Example' : `${sector.label}, ${shownHeadcount.toLocaleString('en-IN')} people`}
                  </span>
                </div>

                {stale ? (
                  <p className="calc-stale-note">{empty ? 'Enter your headcount to see your estimate.' : 'Showing your last valid estimate. Fix the highlighted field to update it.'}</p>
                ) : null}

                <p className="calc-figure">
                  <span className="calc-figure__about">about</span>{' '}
                  <span className="calc-figure__num">{formatLakh(shown.base.total, unit)}</span>
                  {' '}<span className="calc-figure__per">a year</span>
                </p>
                <p className="calc-result__caption">
                  {isDefault ? 'A 75-person software company. Change the sector or headcount to see yours.' : 'Estimated yearly cost of burnout, as a scenario range'}
                </p>

                {/* The range strip: the one thing to remember is that this is a range. */}
                <div className="calc-range" aria-hidden="true">
                  <div className="calc-range__track">
                    <span className="calc-range__span" style={{ left: pos(shown.low.total), right: `calc(100% - ${pos(shown.high.total)})` }} />
                    <span className="calc-range__tick" style={{ left: pos(shown.low.total) }} />
                    <span className="calc-range__tick calc-range__tick--base" style={{ left: pos(shown.base.total) }} />
                    <span className="calc-range__tick" style={{ left: pos(shown.high.total) }} />
                  </div>
                </div>
                <dl className="calc-range__labels">
                  <div><dt>Low</dt><dd>{formatLakh(shown.low.total, unit)}</dd></div>
                  <div className="calc-range__labels-base"><dt>Base</dt><dd>{formatLakh(shown.base.total, unit)}</dd></div>
                  <div><dt>High</dt><dd>{formatLakh(shown.high.total, unit)}</dd></div>
                </dl>
              </div>

              <div className="calc-result__body">
                <ul className="calc-pills">
                  <li><strong>{formatPercent(shown.base.shareOfPayroll)}</strong> of payroll</li>
                  <li><strong>{formatRupees(shown.base.perEmployee)}</strong> per employee</li>
                </ul>

                <h4 className="calc-split__title">Where it comes from</h4>
                <div className="calc-split" aria-hidden="true">
                  {parts.map((p) => (
                    <span key={p.key} className={`calc-split__seg calc-split__seg--${p.key}`} style={{ flexGrow: p.value / total }} />
                  ))}
                </div>
                <ul className="calc-split__list">
                  {parts.map((p) => (
                    <li key={p.key}>
                      <span className={`calc-swatch calc-split__seg--${p.key}`} aria-hidden="true" />
                      <span className="calc-split__label">{p.label}</span>
                      <span className="calc-split__value">{formatLakh(p.value, unitFor(p.value))} <span className="calc-split__pct">({Math.round((p.value / total) * 100)}%)</span></span>
                    </li>
                  ))}
                </ul>

                <div className="calc-result__actions">
                  <button type="button" className="calc-copy" onClick={copyLink}>
                    {copied ? <Check aria-hidden="true" size={16} /> : <Link2 aria-hidden="true" size={16} />} {copied ? 'Link copied' : 'Copy link to this estimate'}
                  </button>
                </div>
                <p className="calc-help">A ballpark from sector averages, not an audit of your company.</p>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* ── 3. What drives it, and what a drop would avoid ── */}
      <section className="calc-band" aria-labelledby={`${ids}-drivers-h`}>
        <div className="info-band__inner">
          <header className="calc-head">
            <p className="calc-kicker"><span className="calc-kicker__num">2</span> What drives it</p>
            <h2 className="calc-head__title" id={`${ids}-drivers-h`}>Where the cost comes from</h2>
            <p className="calc-head__lead">Three costs, added up for a year. The figures follow your inputs above.</p>
          </header>

          <ul className="calc-drivers">
            {parts.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.key} className={`calc-driver calc-driver--${p.key}`}>
                  <span className="calc-driver__icon"><Icon aria-hidden="true" size={22} /></span>
                  <h3 className="calc-driver__title">{p.label}</h3>
                  <p className="calc-driver__value">
                    {formatLakh(p.value, unitFor(p.value))}
                    <span> {Math.round((p.value / total) * 100)}% of the total</span>
                  </p>
                  <p className="calc-driver__note">{p.explain}</p>
                </li>
              );
            })}
          </ul>

          <div className="calc-savings">
            <div className="calc-savings__head">
              <h3 className="calc-savings__title">If burnout fell</h3>
              <p className="calc-help">Assumes every cost falls in proportion. Not a forecast of what any programme achieves.</p>
            </div>
            <ul className="calc-savings__list">
              {REDUCTIONS.map((r) => (
                <li key={r}>
                  <span className="calc-savings__pct">{Math.round(r * 100)}% less burnout</span>
                  <strong>{formatLakh(shown.base.total * r, unitFor(shown.base.total * r))}</strong>
                  <span className="calc-savings__per">a year avoided</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. The ask: the lead is captured here, beside the number ── */}
      <div className="calc-band calc-band--tight" id="pilot">
        <div className="info-band__inner">
          <section ref={pilotRef} className="calc-pilot" aria-labelledby={`${ids}-pilot-h`}>
            <div className="calc-pilot__copy">
              <p className="calc-kicker calc-kicker--dark"><span className="calc-kicker__num">3</span> For your team</p>
              <h2 className="calc-pilot__title" id={`${ids}-pilot-h`}>Talk to us about a pilot</h2>
              <p className="calc-pilot__lead">
                Tell us about your team and we will talk through what a pilot of iKAN would look like. Your estimate
                is sent with your request, so you do not have to explain it again.
              </p>
              <ul className="calc-pilot__list">
                <li><ClipboardCheck aria-hidden="true" size={18} /> Assessments people take privately</li>
                <li><Sparkles aria-hidden="true" size={18} /> Self-paced programmes and daily habits</li>
                <li><MessagesSquare aria-hidden="true" size={18} /> Access to qualified professionals</li>
              </ul>
              <PilotArt />
            </div>

            <div className="calc-lead">
              {leadStatus === 'sent' ? (
                <div className="calc-lead__done" role="status">
                  <CheckCircle2 aria-hidden="true" size={40} className="calc-lead__done-icon" />
                  <h3 className="calc-lead__title" ref={sentRef} tabIndex={-1}>
                    Thanks{lead.name.trim() ? `, ${lead.name.trim().split(/\s+/)[0]}` : ''}. Your request is with us.
                  </h3>
                  <p className="calc-lead__text">
                    We reply within 24 hours{lead.email.trim() ? <>, to <strong>{lead.email.trim()}</strong></> : null}. Your
                    estimate of about {formatLakh(shown.base.total, unit)} a year went with it.
                  </p>
                  <button type="button" className="calc-copy" onClick={copyLink}>
                    {copied ? <Check aria-hidden="true" size={16} /> : <Link2 aria-hidden="true" size={16} />} {copied ? 'Link copied' : 'Copy a link to share with your team'}
                  </button>
                </div>
              ) : (
                <form className="calc-lead__form" onSubmit={submitLead} noValidate aria-describedby={`${ids}-lead-sum`}>
                  <h3 className="calc-lead__title">Request a pilot call</h3>
                  <p className="calc-lead__summary" id={`${ids}-lead-sum`}>
                    <BadgeIndianRupee aria-hidden="true" size={16} />
                    <span>Sent with your request: {sector.label}, {shownHeadcount.toLocaleString('en-IN')} people, about {formatLakh(shown.base.total, unit)} a year</span>
                  </p>

                  {(['name', 'email', 'company', 'role'] as const).map((k) => {
                    const meta = {
                      name: { label: 'Your name', type: 'text', ac: 'name', req: true, max: CONTACT_LIMITS.name },
                      email: { label: 'Work email', type: 'email', ac: 'email', req: true, max: 254 },
                      company: { label: 'Company', type: 'text', ac: 'organization', req: true, max: 120 },
                      role: { label: 'Your role', type: 'text', ac: 'organization-title', req: false, max: 80 },
                    }[k];
                    const err = leadErrors[k];
                    return (
                      <div key={k} className="calc-lead__field">
                        <label className="calc-lead__label" htmlFor={`${ids}-lead-${k}`}>
                          {meta.label}{meta.req ? null : <span className="calc-optional calc-optional--dark">Optional</span>}
                        </label>
                        <input
                          ref={(el) => { leadRefs.current[k] = el; }}
                          id={`${ids}-lead-${k}`}
                          name={k}
                          type={meta.type}
                          inputMode={k === 'email' ? 'email' : undefined}
                          autoComplete={meta.ac}
                          autoCapitalize={k === 'email' ? 'off' : 'words'}
                          spellCheck={k === 'email' ? false : undefined}
                          enterKeyHint="next"
                          maxLength={meta.max}
                          required={meta.req}
                          aria-required={meta.req || undefined}
                          aria-invalid={err ? true : undefined}
                          aria-describedby={err ? `${ids}-lead-${k}-err` : undefined}
                          value={lead[k]}
                          onChange={setLeadField(k)}
                          onBlur={onLeadBlur(k)}
                          disabled={leadStatus === 'sending'}
                        />
                        {err ? <p className="calc-lead__error" id={`${ids}-lead-${k}-err`}><AlertCircle aria-hidden="true" size={14} /> {err}</p> : null}
                      </div>
                    );
                  })}

                  <div className="calc-lead__field calc-lead__field--wide">
                    <label className="calc-lead__label" htmlFor={`${ids}-lead-note`}>
                      Anything we should know? <span className="calc-optional calc-optional--dark">Optional</span>
                    </label>
                    <textarea
                      ref={(el) => { leadRefs.current.note = el; }}
                      id={`${ids}-lead-note`}
                      name="note"
                      rows={3}
                      maxLength={NOTE_MAX}
                      value={lead.note}
                      onChange={setLeadField('note')}
                      disabled={leadStatus === 'sending'}
                      aria-describedby={`${ids}-lead-note-count`}
                    />
                    <p className="calc-lead__count" id={`${ids}-lead-note-count`}>{lead.note.length} of {NOTE_MAX} characters</p>
                  </div>

                  {/* Hidden from people and screen readers; bots fill it in. */}
                  <div className="calc-hp" aria-hidden="true">
                    <label htmlFor={`${ids}-lead-website`}>Website</label>
                    <input id={`${ids}-lead-website`} name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>

                  {leadStatus === 'error' ? (
                    <div className="calc-lead__alert" role="alert">
                      <AlertCircle aria-hidden="true" size={18} />
                      <div>
                        <p>{leadError}</p>
                        <p>
                          Or email us at{' '}
                          <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Pilot enquiry')}`}>{SUPPORT_EMAIL}</a>.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <button type="submit" className="info-button calc-pilot__cta calc-lead__submit" disabled={leadStatus === 'sending'} aria-busy={leadStatus === 'sending' || undefined}>
                    {leadStatus === 'sending'
                      ? <><Loader2 aria-hidden="true" size={16} className="calc-spin" /> Sending</>
                      : leadStatus === 'error'
                        ? <>Try again <ArrowRight aria-hidden="true" size={16} /></>
                        : <>Request a pilot call <ArrowRight aria-hidden="true" size={16} /></>}
                  </button>
                  <p className="calc-lead__privacy">
                    <Lock aria-hidden="true" size={13} /> We use these details only to reply about a pilot. We reply within 24 hours.{' '}
                    <a href="/privacy-policy" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('/privacy-policy'); } }}>Privacy policy</a>
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ── 5. Method and sources ── */}
      <section className="calc-band calc-band--white" id="method" aria-labelledby={`${ids}-method-h`}>
        <div className="info-band__inner calc-split-layout">
          <header className="calc-head calc-head--side">
            <p className="calc-kicker"><span className="calc-kicker__num">4</span> The method</p>
            <h2 className="calc-head__title" id={`${ids}-method-h`}>How this is estimated</h2>
            <p className="calc-head__lead">
              Every input is either sourced, worked out from a source, or our stated judgement. The low figure sets every
              uncertain input low, and the high figure sets them all high.
            </p>
            <p className="calc-reviewed">
              <CalendarDays aria-hidden="true" size={15} />
              Last reviewed <time dateTime={RESEARCH_DATE}>{REVIEWED}</time>
            </p>
          </header>

          <div>
            <ol className="calc-formula">
              <li>
                <span className="calc-formula__num calc-split__seg--turnover" aria-hidden="true">1</span>
                <div>
                  <h3>People leaving</h3>
                  <p>Headcount × voluntary attrition × the burnout share of exits (20, 25 or 30%) × average pay × the cost of replacing someone.</p>
                </div>
              </li>
              <li>
                <span className="calc-formula__num calc-split__seg--absenteeism" aria-hidden="true">2</span>
                <div>
                  <h3>Extra sick days</h3>
                  <p>The share of people in burnout (13% at low stress to 45% at high) × 1.5 to 2.5 extra sick days × a day&apos;s pay over {WORKING_DAYS} working days.</p>
                </div>
              </li>
              <li>
                <span className="calc-formula__num calc-split__seg--presenteeism" aria-hidden="true">3</span>
                <div>
                  <h3>Working below par</h3>
                  <p>3, 3.5 or 4 times the sick-day cost, inside the 3 to 4 times range Deloitte India assumed.</p>
                </div>
              </li>
            </ol>

            <details className="faq-item" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) trackCalc('calc_method_open', {}); }}>
              <summary>Scope, cross-check and our assumptions</summary>
              <div className="calc-method">
                <p>
                  Covers burnout-related attrition, absenteeism and presenteeism. Not all mental health costs, and no
                  direct medical costs.
                </p>
                <p>
                  Deloitte India estimated in 2022 that poor mental health, which is broader than burnout, costs Indian
                  employers about ₹1.1 lakh crore a year. That is a cross-check on the shape of the costs, not a like-for-like comparison.
                </p>
                <p className="calc-help">Model {MODEL_VERSION}. Built from a research workbook dated {REVIEWED}, with its weaker inputs corrected and labelled.</p>

                <h3 className="calc-split__title">Our assumptions, with no source</h3>
                <ul className="info-list">
                  {JUDGEMENTS.map((j) => <li key={j.item}><strong>{j.item}.</strong> {j.bound}</li>)}
                </ul>
              </div>
            </details>

            <details className="faq-item">
              <summary>Sources ({SOURCES.length})</summary>
              <ol className="calc-sources">
                {SOURCES.map((s) => (
                  <li key={s.id}>
                    <p className="calc-source__title">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" onClick={() => trackCalc('calc_source_click', { source_id: s.id })}>
                        {s.title}
                      </a>
                      <span className={`calc-tier calc-tier--${s.tier.toLowerCase()}`}>Tier {s.tier}</span>
                    </p>
                    <p className="calc-source__meta">{s.publisher}, {s.date}. Used for: {s.usedFor.toLowerCase()}.</p>
                    <p>{s.finding}</p>
                    <p className="calc-help">{s.caveat}</p>
                  </li>
                ))}
              </ol>
              <p className="calc-help">Tier A is institutional or primary research, B is trade press or secondary coverage, C is vendor content.</p>
            </details>

            <details className="faq-item">
              <summary>Figures we chose not to use</summary>
              <ul className="info-list calc-method">
                {EXCLUDED.map((x) => <li key={x.claim}><strong>{x.claim}.</strong> {x.why}</li>)}
              </ul>
            </details>
          </div>
        </div>
      </section>

      {/* ── 6. Questions ── */}
      <section className="calc-band" aria-labelledby={`${ids}-faq-h`}>
        <div className="info-band__inner calc-split-layout">
          <header className="calc-head calc-head--side">
            <h2 className="calc-head__title" id={`${ids}-faq-h`}>Questions HR leads ask</h2>
            <p className="calc-head__lead">Something else? Write to us from the contact page and we reply within 24 hours.</p>
          </header>
          <div>
            {FAQ.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Phones only (CSS). An app-style bar: the live figure (tap to see the
          breakdown) and the one ask. Hidden while the result or the pilot form
          is on screen, so the same action is never shown twice. */}
      <div className="calc-dock" data-visible={showDock || undefined} aria-hidden={!showDock}>
        <button
          type="button"
          className="calc-dock__figure"
          tabIndex={showDock ? 0 : -1}
          onClick={() => scrollToEl(resultRef.current)}
          aria-label={`Your estimate, about ${formatLakh(shown.base.total, unit)} a year. Show the breakdown.`}
        >
          <small>Your estimate <ChevronUp aria-hidden="true" size={12} /></small>
          about {formatLakh(shown.base.total, unit)} a year
        </button>
        <button type="button" className="info-button" tabIndex={showDock ? 0 : -1} onClick={() => goToPilot('dock')}>
          Request a pilot
        </button>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}

/* The hero picture. The scene is iKAN 2's own "burnout" illustration (the app's
   art.tsx), redrawn on site tokens; the cards beside it follow the homepage's
   label chips and the app's dark programme card. The figures are the worked
   example, computed, so they cannot drift from the model. Decorative: the
   same facts are in the text below. */
function HeroArt() {
  const unitEx = unitFor(EXAMPLE.base.total);
  const gid = useId().replace(/:/g, '');
  return (
    <div className="calc-art" aria-hidden="true">
      <svg className="calc-art__scene" viewBox="0 0 320 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--rest-soft)' }} />
            <stop offset="1" style={{ stopColor: 'var(--brand-amber)', stopOpacity: 0.5 }} />
          </linearGradient>
        </defs>
        <rect width="320" height="300" fill={`url(#g${gid})`} />
        <circle cx="250" cy="58" r="34" style={{ fill: 'var(--background)', fillOpacity: 0.7 }} />
        <circle cx="64" cy="70" r="5" style={{ fill: 'var(--brand-coral)' }} />
        <circle cx="98" cy="42" r="4" style={{ fill: 'var(--brand-coral)', fillOpacity: 0.7 }} />
        <circle cx="160" cy="170" r="92" style={{ fill: 'var(--brand-amber)', fillOpacity: 0.45 }} />
        <g transform="translate(160 160) scale(1.45) translate(-160 -110)">
          <path
            d="M160 48 C 196 92, 206 120, 184 156 C 176 170, 144 172, 136 156 C 120 128, 132 98, 160 48 Z"
            style={{ fill: 'var(--brand-amber-ink)' }}
          />
          <path
            d="M160 104 C 174 124, 176 138, 168 152 C 162 160, 154 160, 150 152 C 144 140, 148 126, 160 104 Z"
            style={{ fill: 'var(--rest-soft)' }}
          />
        </g>
        <rect x="70" y="268" width="180" height="7" rx="3.5" style={{ fill: 'var(--brand-amber-ink)', fillOpacity: 0.35 }} />
      </svg>

      <div className="calc-art__tags">
        <span className="calc-art__tag calc-art__tag--teal">Resignations</span>
        <span className="calc-art__tag calc-art__tag--amber">Sick days</span>
        <span className="calc-art__tag calc-art__tag--coral">Working below par</span>
      </div>

      <div className="calc-art__card">
        <span className="calc-art__label">Example · 75-person software team</span>
        <strong>{formatLakh(EXAMPLE.base.total, unitEx)}</strong>
        <span className="calc-art__sub">a year · {formatPercent(EXAMPLE.base.shareOfPayroll)} of payroll</span>
      </div>

      <div className="calc-art__stat">
        <span>Per employee</span>
        <strong>{formatRupees(EXAMPLE.base.perEmployee)}</strong>
      </div>
    </div>
  );
}

/* The pilot picture: the homepage's workplace photo, with the app's home
   screen in front of it, built from the same iKAN 2 primitives the homepage
   phone uses (program-band, metric-pill, mini-score, semantic-chip). */
const WORKPLACE_PHOTO =
  'https://images.unsplash.com/photo-1758691737182-d42aefd6dee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900';

function PilotArt() {
  // If the photo cannot load (offline, blocked CDN), the phone stands alone on
  // a soft panel instead of beside a broken image.
  const [photoFailed, setPhotoFailed] = useState(false);
  return (
    <div className="calc-pilot__art" data-photo={photoFailed ? 'failed' : undefined} aria-hidden="true">
      {photoFailed ? null : (
        <img
          className="calc-pilot__photo"
          src={WORKPLACE_PHOTO}
          alt=""
          loading="lazy"
          decoding="async"
          width={900}
          height={600}
          onError={() => setPhotoFailed(true)}
        />
      )}
      <div className="calc-phone">
        <span className="calc-phone__notch" />
        <div className="app-screen">
          <div className="app-screen__top">
            <span>
              <small>Good morning</small>
              <strong>Today</strong>
            </span>
            <span className="semantic-chip app-screen__chip">Day 3</span>
          </div>
          <div className="app-screen__mood">
            <p>How are you feeling?</p>
            <div>
              {['\u{1F62B}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F604}'].map((e, i) => (
                <span key={e} className={i === 3 ? 'is-on' : undefined}>{e}</span>
              ))}
            </div>
          </div>
          <div className="program-band app-screen__band">
            <span>
              <span>PROGRAMME</span>
              <strong>Unburn</strong>
            </span>
            <span className="mini-score app-screen__ring"><span>3</span></span>
          </div>
          <div className="app-screen__metrics">
            <div className="metric-pill"><span>Day streak</span><strong>7</strong></div>
            <div className="metric-pill"><span>Well-being</span><strong>85%</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}


function EvidenceBadge({ evidence, own }: { evidence: Evidence; own: boolean }) {
  if (own) return <span className="calc-badge calc-badge--own">Your number</span>;
  return <span className={`calc-badge calc-badge--${evidence}`} title={EVIDENCE_MEANING[evidence]}>{EVIDENCE_LABEL[evidence]}</span>;
}
