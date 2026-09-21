#!/usr/bin/env node
/**
 * Static accessibility lint over component source.
 *
 * This repo has no DOM test stack — tests are bare `node --test` on .test.ts.
 * Standing up jest + jsdom + testing-library + jest-axe to catch four rules is
 * a poor trade, so these are matched on the source instead. Every rule here
 * corresponds to a defect measured live against production on 2026-09-10.
 *
 * A static rule cannot see the rendered tree, so it errs toward silence:
 * it reports only patterns that are wrong regardless of what wraps them.
 *
 * Ratchets against scripts/baselines/a11y. No dependencies.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/* The three UI surfaces. components/ was emptied into them. */
const SRCS = ['src/admin', 'src/product/app', 'src/product/site'].map(d => join(ROOT, d));
const BASELINE_FILE = join(ROOT, 'scripts/baselines/a11y');
const SKIP = /\.(test|spec|stories)\.tsx?$/;

const RULES = [
  {
    id: 'focusable-div-without-role',
    wcag: '4.1.2',
    // <div tabIndex={0}> with no role on the same tag
    test: tag => /^<div\b/.test(tag) && /tabIndex=\{?0/.test(tag) && !/\brole=/.test(tag),
    why: 'A div in the tab order with no role announces as nothing. Finding 12.',
  },
  {
    id: 'focusable-without-key-handler',
    wcag: '2.1.1',
    // tabIndex={0} + onClick but no keyboard handler
    test: tag => /tabIndex=\{?0/.test(tag) && /onClick=/.test(tag) && !/onKeyDown=|onKeyUp=|onKeyPress=/.test(tag),
    why: 'Focusable and clickable but not operable by keyboard. Finding 12.',
  },
  {
    id: 'click-on-non-interactive',
    wcag: '2.1.1',
    // onClick on div/span with no role, no tabIndex — unreachable by keyboard
    test: tag => /^<(div|span|li)\b/.test(tag) && /onClick=/.test(tag)
                 && !/\brole=/.test(tag) && !/tabIndex=/.test(tag),
    why: 'Clickable to a mouse, invisible to a keyboard. Finding 11.',
  },
  {
    id: 'aria-invalid-without-describedby',
    wcag: '3.3.1',
    test: tag => /aria-invalid=/.test(tag) && !/aria-describedby=/.test(tag),
    why: 'Marks itself invalid without naming why. Finding 4. ui/form-field-error.tsx already solves this.',
  },
  {
    id: 'icon-button-without-name',
    wcag: '4.1.2',
    // self-closing button with no aria-label and no title
    test: tag => /^<button\b/.test(tag) && /\/>$/.test(tag)
                 && !/aria-label=|aria-labelledby=|title=/.test(tag),
    why: 'A button with no text child and no accessible name.',
  },
];


/**
 * Yields each opening JSX tag as flattened text, tracking brace depth so that
 * `>` inside a prop expression does not terminate the tag.
 */
function* openingTags(src) {
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== '<') continue;
    if (!/[a-zA-Z]/.test(src[i + 1] || '')) continue;
    let depth = 0, j = i + 1, str = null;
    while (j < src.length) {
      const c = src[j];
      if (str) {
        if (c === '\\') j++;
        else if (c === str) str = null;
      } else if (c === '"' || c === "'" || c === '`') str = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) break;
      else if (c === '<' && depth === 0) { j = -1; break; }
      j++;
    }
    if (j < 0 || j >= src.length) continue;
    yield {
      text: src.slice(i, j + 1).replace(/\s+/g, ' '),
      line: src.slice(0, i).split('\n').length,
    };
    i = j;
  }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    statSync(p).isDirectory() ? walk(p, out)
      : (/\.tsx$/.test(name) && !SKIP.test(name) && out.push(p));
  }
  return out;
}

for (const d of SRCS) if (!existsSync(d)) { console.error(`a11y lint: cannot read ${d}`); process.exit(2); }

const counts = Object.fromEntries(RULES.map(r => [r.id, []]));
let total = 0;

for (const file of SRCS.flatMap(d => walk(d))) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  /* match an opening tag and its attributes, across line breaks */
  /*
    Scan opening tags with a brace-aware reader. A regex cannot do this: JSX
    props hold arrow functions, and `onClick={() => x}` contains a `>` that
    ends the match early. That under-reports silently, which is worse than not
    linting at all.
  */
  for (const tag of openingTags(src)) {
    for (const r of RULES) {
      if (r.test(tag.text)) { counts[r.id].push(`${relative(ROOT, file)}:${tag.line}`); total++; }
    }
  }
}

const baseline = existsSync(BASELINE_FILE)
  ? parseInt(readFileSync(BASELINE_FILE, 'utf8').trim(), 10) || 0
  : Number.MAX_SAFE_INTEGER;

console.log(`static a11y: ${total} occurrences (baseline ${baseline === Number.MAX_SAFE_INTEGER ? 'unset' : baseline})`);
console.log('');
for (const r of RULES) {
  const hits = counts[r.id];
  console.log(`  ${String(hits.length).padStart(4)}  ${r.id}  [WCAG ${r.wcag}]`);
  if (hits.length) {
    console.log(`        ${r.why}`);
    for (const h of hits.slice(0, 4)) console.log(`        ${h}`);
    if (hits.length > 4) console.log(`        ...and ${hits.length - 4} more`);
  }
}
console.log('');

if (total > baseline) {
  console.error(`FAIL: static a11y occurrences rose by ${total - baseline} above the baseline.`);
  process.exit(1);
}
if (total < baseline && baseline !== Number.MAX_SAFE_INTEGER) console.log(`Baseline can be lowered to ${total}.`);
process.exit(0);
