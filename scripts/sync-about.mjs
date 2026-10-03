#!/usr/bin/env node
/**
 * EMIT iKAN 2's `about` BLOCK FROM THIS REPO'S CANONICAL COPY.
 *
 * The About text lives in `src/product/site/content/about.ts`. iKAN 2 holds a
 * second copy in `src/lib/content/pages.json` under `about`, whose own header
 * records that it was "copied from the site's built-in page content
 * (src/utils/cms-defaults.ts)" — a hand copy, with nothing keeping the two in
 * step. They had already drifted on casing before anyone noticed.
 *
 * This prints the iKAN 2 shape so that copy can be regenerated rather than
 * retyped. It deliberately WRITES NOTHING into the other repo — that is a
 * separate codebase with its own deploys, and a script that reaches across and
 * edits it would be a worse problem than the duplication it fixes.
 *
 *   node scripts/sync-about.mjs            print the JSON
 *   node scripts/sync-about.mjs --check    diff against iKAN 2, exit 1 if stale
 *   node scripts/sync-about.mjs --out F    write the JSON to F
 *
 * --check takes the sibling checkout at ../ikan2 by default; pass --ikan2 DIR
 * for anywhere else. It is a reporting step, not a gate: this repo's build must
 * not depend on another repo being present on the same disk.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const SOURCE = join(REPO, 'src/product/site/content/about.ts');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : (argv[i + 1] ?? true);
};

/* about.ts is TypeScript, and this script runs under plain node. Rather than
   pull in a transpiler for one object, take the literal and evaluate it: the
   file is ours, it is a pure data declaration, and the alternative is a build
   step for a script whose whole job is to avoid ceremony. */
function readCanonical() {
  const src = readFileSync(SOURCE, 'utf8');
  const start = src.indexOf('export const ABOUT_PAGE');
  if (start === -1) throw new Error(`ABOUT_PAGE not found in ${SOURCE}`);
  const open = src.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error('ABOUT_PAGE literal is unbalanced');
  // eslint-disable-next-line no-new-func
  return new Function(`return (${src.slice(open, end + 1)});`)();
}

/** iKAN 2 renders the heading plain, so the highlight markers come out. */
const unmark = (s) => s.replace(/[<>]/g, '');

function toIkan2(a) {
  return {
    hero: a.hero,
    story: {
      label: a.story.label,
      heading: a.story.heading,
      headingHighlightColor: a.story.headingHighlightColor,
      paragraphs: a.story.paragraphs,
      image: a.story.image,
      imageAlt: a.story.imageAlt,
    },
    mission: a.mission,
    vision: a.vision,
    values: a.values,
    valuesHeading: a.valuesHeading,
    teamHeading: a.teamHeading,
    teamDescription: a.teamDescription,
    founders: a.founders,
    team: a.team,
    howItWorks: a.howItWorks,
    whoFor: a.whoFor,
  };
}

const canonical = toIkan2(readCanonical());
const json = JSON.stringify(canonical, null, 2);

if (flag('--out')) {
  writeFileSync(resolve(String(flag('--out'))), json + '\n');
  console.log(`wrote ${flag('--out')}`);
} else if (argv.includes('--check')) {
  const dir = String(flag('--ikan2') ?? resolve(REPO, '../ikan2'));
  const pages = join(dir, 'src/lib/content/pages.json');
  if (!existsSync(pages)) {
    console.log(`skipped: no iKAN 2 checkout at ${dir}`);
    process.exit(0);
  }
  const theirs = JSON.parse(readFileSync(pages, 'utf8')).about;
  const drift = [];
  const walk = (mine, other, path) => {
    if (typeof mine === 'string' || typeof other === 'string') {
      // Compare unmarked, since iKAN 2 may store the heading either way.
      if (unmark(String(mine)) !== unmark(String(other))) drift.push(path);
      return;
    }
    if (Array.isArray(mine)) {
      if (!Array.isArray(other) || mine.length !== other.length) return drift.push(path);
      mine.forEach((v, i) => walk(v, other[i], `${path}[${i}]`));
      return;
    }
    if (mine && other && typeof mine === 'object') {
      for (const k of Object.keys(mine)) {
        if (!(k in other)) drift.push(`${path}.${k} (missing in iKAN 2)`);
        else walk(mine[k], other[k], `${path}.${k}`);
      }
      return;
    }
    if (mine !== other) drift.push(path);
  };
  walk(canonical, theirs ?? {}, 'about');
  if (drift.length === 0) {
    console.log('about: iKAN 2 is in step with this repo');
    process.exit(0);
  }
  console.error(`about: ${drift.length} field(s) differ from iKAN 2's pages.json`);
  for (const d of drift.slice(0, 40)) console.error(`  ${d}`);
  if (drift.length > 40) console.error(`  …and ${drift.length - 40} more`);
  console.error(`\nRegenerate with:\n  node scripts/sync-about.mjs --out /tmp/about.json`);
  process.exit(1);
} else {
  console.log(json);
}
