/**
 * Search and share metadata for /burnout-cost-calculator, in one place.
 *
 * Two readers use it:
 *   - the page, through useSeo(), for visitors whose browser runs the app;
 *   - the build (vite.config.ts, `calcPrerender`), which writes a static
 *     dist/burnout-cost-calculator/index.html carrying the same head tags,
 *     JSON-LD and a plain-HTML summary.
 *
 * The static file matters because LinkedIn, WhatsApp, Slack and most AI
 * crawlers do not run JavaScript. Without it they read index.html's homepage
 * title, homepage description, the PWA icon and a canonical pointing at "/".
 *
 * Every figure is computed from the model, never typed, so the copy cannot
 * drift from the calculator. The FAQ here is the one the page shows; FAQPage
 * markup must mirror visible content.
 */

import {
  DEFAULT_HEADCOUNT, RESEARCH_DATE, sectorById, sectorInputs, estimate, unitFor,
  formatLakh, formatAmount, formatPercent, formatRupees,
} from './burnout-cost-model';
import { SOURCES } from './burnout-sources';

export const CALC_PATH = '/burnout-cost-calculator';
export const SITE_ORIGIN = 'https://ikanhealth.in';
export const CALC_URL = `${SITE_ORIGIN}${CALC_PATH}`;

/** Without the " | iKAN Health" suffix, which useSeo adds. */
export const CALC_TITLE = 'Employee Burnout Cost Calculator for India';
export const CALC_FULL_TITLE = `${CALC_TITLE} | iKAN Health`;
export const CALC_DESCRIPTION =
  'Estimate what burnout costs your team each year, in rupees. Pick your sector and headcount to see the range, the method and the sources. Free, no sign-up.';
export const CALC_H1 = 'Burnout cost calculator for Indian teams';


/* The worked example: SaaS at the default headcount. */
export const CALC_EXAMPLE = estimate(sectorInputs(sectorById('saas')!, DEFAULT_HEADCOUNT));
const UNIT = unitFor(CALC_EXAMPLE.base.total);

export const CALC_IMAGE = {
  url: `${SITE_ORIGIN}/og/burnout-cost-calculator.png`,
  width: 1200,
  height: 630,
  alt: `iKAN burnout cost calculator: on the model, burnout costs a ${DEFAULT_HEADCOUNT}-person Indian software team about ${formatLakh(CALC_EXAMPLE.base.total, UNIT)} a year.`,
};

export const CALC_EXAMPLE_LINE =
  `On this model, burnout costs a ${DEFAULT_HEADCOUNT}-person Indian software company about ` +
  `${formatLakh(CALC_EXAMPLE.base.total, UNIT)} a year, ${formatPercent(CALC_EXAMPLE.base.shareOfPayroll)} of payroll, ` +
  `in a scenario range of ₹${formatAmount(CALC_EXAMPLE.low.total, UNIT)} to ${formatAmount(CALC_EXAMPLE.high.total, UNIT)} ${UNIT}.`;

export const CALC_FAQ: readonly { q: string; a: string }[] = [
  {
    q: 'What does burnout cost an Indian company?',
    a: `${CALC_EXAMPLE_LINE} Sector, team size and pay move the figure a lot, which is why every input above can be changed.`,
  },
  {
    q: 'How is it calculated?',
    a: 'Three costs are added up. People who leave because of burnout, times what it costs to replace them. Extra sick days taken by people in burnout. And presenteeism, people at work but working below their usual level, estimated at 3 to 4 times the sick-day cost, the method Deloitte India used.',
  },
  {
    q: 'Is this an audit of my company?',
    a: 'No. It is a ballpark from sector averages and stated assumptions. A real figure needs your own attrition, leave and survey data.',
  },
  {
    q: 'Why a range and not one number?',
    a: 'Several inputs are judgement rather than data. The low figure sets every one of them low at once and the high figure sets every one high. It is a scenario range, not a statistical confidence interval.',
  },
  {
    q: 'What is not included?',
    a: 'Direct costs such as insurance and treatment, managers’ time, effects on customers, and mental health costs that are not burnout. Leaving them out keeps the estimate on the conservative side.',
  },
  {
    q: 'Where do my numbers go?',
    a: 'Nowhere. The calculation runs in your browser. We record which sector was picked and a size band such as 50 to 99 people, never the numbers you type. If you ask about a pilot, the estimate is copied into the message, and you can edit it before sending.',
  },
];

const ORG_ID = `${SITE_ORIGIN}/#organization`;
const SITE_ID = `${SITE_ORIGIN}/#website`;
const PAGE_ID = `${CALC_URL}#webpage`;
const APP_ID = `${CALC_URL}#app`;

/** schema.org graph. No ratings, reviews or HowTo: none exist to cite. */
export function calcJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'iKAN Health',
        url: `${SITE_ORIGIN}/`,
        logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/pwa-512x512.png`, width: 512, height: 512 },
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        name: 'iKAN Health',
        url: `${SITE_ORIGIN}/`,
        publisher: { '@id': ORG_ID },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'WebPage',
        '@id': PAGE_ID,
        url: CALC_URL,
        name: CALC_FULL_TITLE,
        headline: CALC_H1,
        description: CALC_DESCRIPTION,
        inLanguage: 'en-IN',
        isPartOf: { '@id': SITE_ID },
        about: { '@type': 'Thing', name: 'Occupational burnout' },
        audience: { '@type': 'BusinessAudience', audienceType: 'HR leaders and founders of Indian companies' },
        mainEntity: { '@id': APP_ID },
        primaryImageOfPage: {
          '@type': 'ImageObject', url: CALC_IMAGE.url, width: CALC_IMAGE.width, height: CALC_IMAGE.height,
          caption: CALC_IMAGE.alt,
        },
        lastReviewed: RESEARCH_DATE,
        dateModified: RESEARCH_DATE,
        publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${CALC_URL}#breadcrumb` },
        citation: SOURCES.map((s) => ({
          '@type': 'CreativeWork',
          name: s.title,
          url: s.url,
          publisher: { '@type': 'Organization', name: s.publisher },
        })),
      },
      {
        '@type': 'WebApplication',
        '@id': APP_ID,
        name: CALC_H1,
        url: CALC_URL,
        description: CALC_DESCRIPTION,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Calculator',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        inLanguage: 'en-IN',
        image: CALC_IMAGE.url,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        featureList: [
          'Yearly burnout cost in rupees for 8 sectors and teams of 5 to 1,000',
          'Low, base and high scenario range',
          'Split into turnover, presenteeism and absenteeism',
          'Your own pay, attrition and stress level',
          'Method and sources shown in full',
        ],
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CALC_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Burnout cost calculator', item: CALC_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${CALC_URL}#faq`,
        isPartOf: { '@id': PAGE_ID },
        mainEntity: CALC_FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The <head> tags for the static file. useSeo sets the same ones at runtime. */
export function calcHeadHtml(): string {
  const json = JSON.stringify(calcJsonLd()).replace(/</g, '\\u003c');
  return [
    `<title>${esc(CALC_FULL_TITLE)}</title>`,
    `<meta name="description" content="${esc(CALC_DESCRIPTION)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${CALC_URL}" />`,
    `<meta property="og:site_name" content="iKAN Health" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${CALC_URL}" />`,
    `<meta property="og:title" content="${esc(CALC_FULL_TITLE)}" />`,
    `<meta property="og:description" content="${esc(CALC_DESCRIPTION)}" />`,
    `<meta property="og:image" content="${CALC_IMAGE.url}" />`,
    `<meta property="og:image:secure_url" content="${CALC_IMAGE.url}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${CALC_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${CALC_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${esc(CALC_IMAGE.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(CALC_FULL_TITLE)}" />`,
    `<meta name="twitter:description" content="${esc(CALC_DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${CALC_IMAGE.url}" />`,
    `<meta name="twitter:image:alt" content="${esc(CALC_IMAGE.alt)}" />`,
    `<script type="application/ld+json" id="seo-jsonld">${json}</script>`,
  ].join('\n    ');
}

/**
 * Plain HTML placed inside #root. Crawlers that skip JavaScript read it; the
 * app replaces it on first render, so visitors never see it.
 */
export function calcBodyHtml(): string {
  const perHead = formatRupees(CALC_EXAMPLE.base.perEmployee);
  return `<main>
      <h1>${esc(CALC_H1)}</h1>
      <p>What is burnout costing your team each year? ${esc(CALC_EXAMPLE_LINE)} That is about ${esc(perHead)} per employee.</p>
      <p>The calculator adds three costs: burnout-related resignations, extra sick days and presenteeism. Pick one of 8 sectors and a headcount between 5 and 1,000, or use your own pay, attrition and stress level. It runs in your browser and needs no sign-up. Last reviewed ${esc(RESEARCH_DATE)}.</p>
      <h2>Questions HR leads ask</h2>
      ${CALC_FAQ.map((f) => `<h3>${esc(f.q)}</h3>\n      <p>${esc(f.a)}</p>`).join('\n      ')}
      <h2>Sources</h2>
      <ul>
        ${SOURCES.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>, ${esc(s.publisher)}, ${esc(s.date)}</li>`).join('\n        ')}
      </ul>
      <p><a href="/">iKAN Health</a> · <a href="/contact">Contact us about a pilot</a></p>
    </main>`;
}
