/**
 * Every `src/…` path hardcoded in a script must exist.
 *
 * WHY THIS EXISTS. The codebase separation moved files out from under scripts
 * that name paths as strings, and nothing failed. `deploy-edge.sh` kept reading
 * the anon key from `src/utils/supabase/info.tsx` after it had moved to
 * `src/shared/api/supabase-info.tsx`: the grep failed silently, the key was
 * empty, every smoke call went out unauthenticated, all four endpoints answered
 * 401 before AND after the deploy, and the script printed "smoke unchanged".
 *
 * A guard that reads like a pass while proving nothing is worse than no guard.
 * This makes the next move fail loudly instead.
 *
 * Paths beginning `src/lib/` are skipped: they belong to the iKAN 2 repo, which
 * `sync-about.mjs` reaches through `--ikan2`, not to this one.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'scripts';
const PATH_RE = /['"]((?:\.\/)?src\/[A-Za-z0-9/._-]+)['"]/g;
const FOREIGN = /^src\/lib\//;

let bad = 0;
let checked = 0;

for (const file of readdirSync(DIR).filter((f) => /\.(mjs|sh|js)$/.test(f))) {
  const text = readFileSync(join(DIR, file), 'utf8');
  const seen = new Set();
  for (const m of text.matchAll(PATH_RE)) {
    const p = m[1].replace(/^\.\//, '');
    if (seen.has(p) || FOREIGN.test(p)) continue;
    seen.add(p);
    checked += 1;
    if (!existsSync(p)) {
      console.error(`✗ ${file}: "${p}" does not exist`);
      bad += 1;
    }
  }
}

if (bad) {
  console.error(`\n${bad} missing path(s). A script naming a file that moved fails quietly — fix the path.`);
  process.exit(1);
}
console.log(`✓ script paths: ${checked} checked, all present`);
