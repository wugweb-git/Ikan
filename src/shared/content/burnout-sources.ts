/**
 * The source register behind the burnout-cost calculator.
 *
 * Taken from the workbook's Sources tab (research date 28 Oct 2026), with the
 * corrections the audit made: the burnout share of attrition is JUDGEMENT, not
 * "partly sourced" — S10 and S13 give shares of survey respondents, with no
 * usable window or denominator, not a share of all exits.
 *
 * Quality tiers are the workbook's: A institutional or primary, B trade press
 * or secondary coverage, C vendor content. The page shows the tier beside
 * every source so a reader can weigh it.
 *
 * Wording rules every claim on the page follows:
 * - Deloitte India 2022 measured POOR MENTAL HEALTH, not burnout. Never cite
 *   its Rs 1.1 lakh crore as a burnout cost.
 * - Aon, GPTW and Indeed figures are shares of respondents, not rates.
 */

export type Tier = 'A' | 'B' | 'C';

export interface Source {
  id: string;
  /** What the page uses it for. */
  usedFor: string;
  /** Plain paraphrase of the finding. */
  finding: string;
  title: string;
  publisher: string;
  date: string;
  tier: Tier;
  url: string;
  caveat: string;
}

export const SOURCES: readonly Source[] = [
  {
    id: 'S9', usedFor: 'Prevalence at high stress, the presenteeism multiple, the cross-check',
    finding: 'Survey of 3,995 corporate employees. More than half of those with a symptom reported burnout. Poor mental health was estimated to cost Indian employers about Rs 1.1 lakh crore a year, with presenteeism assumed at 3 to 4 times absenteeism.',
    title: 'Mental health and well-being in the workplace', publisher: 'Deloitte India', date: 'Sep 2022', tier: 'A',
    url: 'https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-mental-health-2022-report-noexp.pdf',
    caveat: 'Self-selected online sample, white-collar, during COVID. Measures poor mental health, which is broader than burnout. Excludes direct costs such as insurance.',
  },
  {
    id: 'S11', usedFor: 'Prevalence at low and medium stress',
    finding: 'About 13% of employees fall in a high-burnout category and 72% in a low one.',
    title: 'Great Place To Work India study', publisher: 'GPTW India, via Free Press Journal', date: '2026', tier: 'B',
    url: 'https://www.freepressjournal.in/education/13-employees-report-high-burnout-as-gen-z-nearly-doubles-its-share-of-indias-workforce-to-26-study',
    caveat: 'Participating employers may skew healthier. The medium share is the remainder.',
  },
  {
    id: 'S1', usedFor: 'Overall attrition anchor',
    finding: 'Overall attrition in India was 18.0% in 2026 (Aon survey of 1,200+ organisations).',
    title: 'Aon Salary Increase & Turnover Survey 2026-27 (press coverage)', publisher: 'Aon, via Wocult', date: 'Oct 2026', tier: 'B',
    url: 'https://www.wocult.com/news/india-attrition-rate-18-percent-2026-aon-survey',
    caveat: 'Total attrition, voluntary and involuntary. Secondary coverage; the survey itself was not accessed.',
  },
  {
    id: 'S4', usedFor: 'Software attrition; the voluntary share',
    finding: 'Overall attrition 21.2%, of which 16.8% voluntary and 3.6% involuntary. Tech sector voluntary attrition 19.1%.',
    title: 'EY Future of Pay report', publisher: 'EY, via HRKatha', date: '2023', tier: 'B',
    url: 'https://www.hrkatha.com/research/attrition-in-india-inc-was-21-2-16-8-voluntary-and-3-6-involuntary-attrition/',
    caveat: 'Older, and drawn from large companies.',
  },
  {
    id: 'S6', usedFor: 'IT services attrition',
    finding: 'Infosys voluntary attrition 12.6% and TCS 13.7% (Q4 FY26, last twelve months).',
    title: 'TCS vs Infosys Q4FY26', publisher: 'Zeebiz', date: '2026', tier: 'B',
    url: 'https://www.zeebiz.com/market-news/news-tcs-vs-infosys-q4fy26-which-it-giant-offers-stronger-visibility-for-fy27-394246',
    caveat: 'Large listed firms. Smaller IT services companies are likely higher.',
  },
  {
    id: 'S8', usedFor: 'BPM and support attrition',
    finding: 'Voice-based BPM roles show the highest attrition, 30 to 35%.',
    title: 'BPM sector witnesses highest attrition in voice-based roles', publisher: 'Storyboard18', date: '2025-26', tier: 'B',
    url: 'https://www.storyboard18.com/how-it-works/bpm-sector-witnesses-highest-attrition-in-voice-based-roles-report-',
    caveat: 'Voice roles specifically, not all support work.',
  },
  {
    id: 'S13', usedFor: 'Context for the burnout share of attrition',
    finding: 'Over 30% of employees surveyed said they had quit a job in the past year to protect their mental health.',
    title: 'Over 30% of Indian employees quit jobs for mental health: Indeed study', publisher: 'Indeed, via Storyboard18', date: 'Oct 2025', tier: 'B',
    url: 'https://storyboard18.com/how-it-works/over-30-of-indian-employees-quit-jobs-for-mental-health-indeed-study-82284.htm',
    caveat: 'A share of respondents, not a share of all exits. Not used as a number.',
  },
  {
    id: 'S15', usedFor: 'Bounds on replacement cost',
    finding: 'Replacement cost of 40 to 60% of salary for frontline roles and 75 to 110% for mid-level roles.',
    title: 'Cost of employee turnover in India', publisher: 'SalaryBox (vendor)', date: '2025', tier: 'C',
    url: 'https://forj-astro.pages.dev/blog/cost-of-employee-turnover-india',
    caveat: 'Vendor content; attribution could not be verified. The model stays at or below the low end.',
  },
  {
    id: 'S23', usedFor: 'Ceiling on extra sick days',
    finding: 'Most Indian private employers give 6 to 12 sick days a year.',
    title: 'Sick Leave in India 2026', publisher: 'greytHR (vendor)', date: '2026', tier: 'C',
    url: 'https://www.greythr.com/blog/sick-leave/',
    caveat: 'State figures differ between sources.',
  },
];

/** Inputs with no source, and what bounds each. */
export const JUDGEMENTS: readonly { item: string; bound: string }[] = [
  { item: 'Share of voluntary exits that are burnout-related: 20 / 25 / 30%', bound: 'No study gives a share of all exits. Deloitte and Indeed report shares of respondents only.' },
  { item: 'Extra sick days for a person in burnout: 1.5 / 2 / 2.5 a year', bound: 'No India figure exists. Kept well under the 6 to 12 sick days most private employers give (S23).' },
  { item: 'Presenteeism at 3 / 3.5 / 4 times absenteeism', bound: "Inside the 3 to 4 times range Deloitte India assumed (S9). No India measurement exists." },
  { item: 'Average pay, and the default stress level, for each sector', bound: 'No published blended average exists for 20 to 150 person startups. Change them to your own.' },
  { item: 'Attrition for fintech, D2C, edtech and agencies', bound: 'No current sector figures exist. Set above the 18% overall rate (S1).' },
];

/** Claims seen elsewhere and deliberately not used. */
export const EXCLUDED: readonly { claim: string; why: string }[] = [
  { claim: '62% of startup employees report burnout', why: 'Could not be traced to the publishers it names.' },
  { claim: 'Burnout costs 1.5 to 2% of payroll, per Deloitte', why: 'Not in the Deloitte India report.' },
  { claim: '68% of IT professionals show clinical burnout', why: 'Could not be traced to the publishers it names.' },
  { claim: 'Startup attrition of 50 to 80%', why: 'Old, and quoted from unnamed experts.' },
];
