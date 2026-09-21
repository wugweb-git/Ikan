#!/usr/bin/env node
/**
 * Raw-value lint — hardcoded colour literals in component source.
 *
 * A design token that can be bypassed is a suggestion. This counts the bypasses
 * and fails when they rise, so the number can only go down.
 *
 * Ratchets against .rawhex-baseline, mirroring scripts/lint-ratchet.sh.
 * No dependencies.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/* The three UI surfaces. components/ was emptied into them. */
const SRCS = ['src/admin', 'src/app', 'src/site'].map(d => join(ROOT, d));
const BASELINE_FILE = join(ROOT, '.rawhex-baseline');

/* globals.css is where literals belong. Tests and stories may pin values. */
const SKIP_FILE = /\.(test|spec|stories)\.tsx?$/;

const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;
/* rgb()/rgba()/hsl() with literal numbers, not var() */
const FUNC = /\b(?:rgba?|hsla?)\(\s*\d/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name) && !SKIP_FILE.test(name)) out.push(p);
  }
  return out;
}

for (const d of SRCS) if (!existsSync(d)) { console.error(`raw-hex lint: cannot read ${d}`); process.exit(2); }

const files = SRCS.flatMap(d => walk(d));
const perFile = [];
let total = 0;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  /* strip comments so a documented ratio like "#356B5A — 6.17" is not a bypass */
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const n = (code.match(HEX) || []).length + (code.match(FUNC) || []).length;
  if (n) { perFile.push([relative(ROOT, f), n]); total += n; }
}

perFile.sort((a, b) => b[1] - a[1]);

const baseline = existsSync(BASELINE_FILE)
  ? parseInt(readFileSync(BASELINE_FILE, 'utf8').trim(), 10) || 0
  : Number.MAX_SAFE_INTEGER;

console.log(`raw colour literals in src/{admin,app,site}: ${total} across ${perFile.length} files (baseline ${baseline === Number.MAX_SAFE_INTEGER ? 'unset' : baseline})`);
console.log('');
for (const [f, n] of perFile.slice(0, 15)) console.log(`  ${String(n).padStart(4)}  ${f}`);
if (perFile.length > 15) console.log(`  ...and ${perFile.length - 15} more files`);
console.log('');

if (total > baseline) {
  console.error(`FAIL: raw literals rose by ${total - baseline} above the baseline.`);
  console.error(`Use a token from src/styles/globals.css, or raise .rawhex-baseline and say why.`);
  process.exit(1);
}
if (total < baseline && baseline !== Number.MAX_SAFE_INTEGER) console.log(`Baseline can be lowered to ${total}.`);
process.exit(0);
