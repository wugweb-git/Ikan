#!/usr/bin/env node
/**
 * CONTRAST RATCHET — mirrors scripts/typecheck-ratchet.sh and lint-ratchet.sh.
 *
 * Seven colour pairs fail WCAG AA as text, and the accessible siblings for two
 * of them already existed and were simply not used. Nothing stopped that, and
 * nothing stops it recurring: every fix in this area is one careless token edit
 * from being undone, silently, because a contrast failure looks fine to whoever
 * made it.
 *
 * This reads the token values out of globals.css, computes the ratio for every
 * pair the product actually paints, and FAILS when the number of failing pairs
 * goes up. It does not demand zero — that would fail on day one and be disabled
 * by day two. It demands that the number never rises.
 *
 * Run: node scripts/contrast-ratchet.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, '..', 'src', 'styles', 'globals.css');
const BASELINE_FILE = join(here, '..', '.contrast-baseline');

/** Token name -> value, from the `:root` block. Nested `var()` is resolved. */
function readTokens(css) {
  const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
  const raw = {};
  for (const m of root.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) raw[m[1]] = m[2].trim();
  const resolve = (v, depth = 0) => {
    if (depth > 5) return v;
    const m = v.match(/^var\((--[a-z0-9-]+)\)$/i);
    return m && raw[m[1]] ? resolve(raw[m[1]], depth + 1) : v;
  };
  const out = {};
  for (const [k, v] of Object.entries(raw)) out[k] = resolve(v);
  return out;
}

const hex = (v) => {
  const m = String(v).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};

const luminance = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export const ratio = (fg, bg) => {
  const a = hex(fg); const b = hex(bg);
  if (!a || !b) return null;
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/**
 * The pairs the product paints as TEXT. Each is a foreground token over a
 * background token that a component actually puts it on — not every possible
 * combination, which would report failures nobody can see.
 */
export const TEXT_PAIRS = [
  ['--color-text-primary', '--color-bg-page'],
  ['--color-text-primary', '--color-bg-card'],
  ['--color-text-primary', '--color-bg-muted'],
  ['--color-text-muted', '--color-bg-page'],
  ['--color-text-muted', '--color-bg-card'],
  ['--color-text-muted', '--color-bg-muted'],
  ['--color-primary-on', '--color-primary-default'],
  ['--color-status-success', '--color-bg-card'],
  ['--color-status-success-text', '--color-status-success-light'],
  ['--color-status-warning', '--color-bg-card'],
  ['--color-status-warning-text', '--color-status-warning-light'],
  ['--color-status-danger', '--color-bg-card'],
  ['--color-status-info', '--color-bg-card'],
  ['--ikan-brand-teal', '--color-bg-card'],
  ['--ikan-brand-teal-text', '--ikan-brand-teal-bg'],
  ['--ikan-brand-teal-text', '--ikan-brand-teal-bg-end'],
  ['--ikan-brand-teal-dark', '--ikan-brand-teal-bg'],
];

/** AA for body text. Large text (18.66px bold / 24px) would be 3.0. */
const AA = 4.5;

export function audit(css) {
  const tokens = readTokens(css);
  const rows = [];
  for (const [fg, bg] of TEXT_PAIRS) {
    const r = ratio(tokens[fg], tokens[bg]);
    if (r === null) { rows.push({ fg, bg, ratio: null, pass: null }); continue; }
    rows.push({ fg, bg, ratio: Math.round(r * 100) / 100, pass: r >= AA });
  }
  return rows;
}

if (process.argv[1] && process.argv[1].endsWith('contrast-ratchet.mjs')) {
  const rows = audit(readFileSync(CSS, 'utf8'));
  const failing = rows.filter(r => r.pass === false);
  const unresolved = rows.filter(r => r.pass === null);
  const baseline = existsSync(BASELINE_FILE)
    ? Number.parseInt(readFileSync(BASELINE_FILE, 'utf8').trim(), 10)
    : Number.MAX_SAFE_INTEGER;

  console.log(`contrast failures: ${failing.length} (baseline ${baseline})`);
  for (const r of failing) console.log(`  ${r.ratio.toFixed(2)}  ${r.fg} on ${r.bg}`);
  for (const r of unresolved) console.log(`  ?     ${r.fg} on ${r.bg} — not a resolvable hex, skipped`);

  if (failing.length > baseline) {
    console.error(`\n✗ contrast failures rose: ${baseline} -> ${failing.length}`);
    console.error('A pair that fails AA is unreadable for some of the people using it.');
    process.exit(1);
  }
  if (failing.length < baseline) {
    console.log(`\nImproved by ${baseline - failing.length}. Lower .contrast-baseline to ${failing.length} to lock it in.`);
  } else {
    console.log('✓ contrast at or below baseline');
  }
}
