// Surface-boundary ratchet (restructure Stage 4).
//
// eslint.config.js blocks imports between admin/, app/ and site/, and from
// shared/ into any surface or components/. The rule is `warn`, so on its own a
// new crossing would disappear into the general lint count. This counts only
// those messages and fails when the number RISES above scripts/baselines/boundary.
//
// The baseline is 0. Admin's two previews (BlockRenderer, ProgramPlayer) are
// allowed by name in eslint.config.js rather than counted here.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_FILE = join(ROOT, 'scripts/baselines/boundary');
const SURFACES = ['src/admin', 'src/product/app', 'src/product/site', 'src/product/org', 'src/shared'];

let report;
try {
  report = execFileSync('npx', ['eslint', ...SURFACES, '--format', 'json'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  report = e.stdout; // eslint exits non-zero when it finds errors of any kind
}

const hits = [];
for (const file of JSON.parse(report)) {
  for (const m of file.messages) {
    if (m.ruleId === 'no-restricted-imports') hits.push(`${relative(ROOT, file.filePath)}:${m.line}  ${m.message.split(' — ')[0]}`);
  }
}

const baseline = Number.parseInt(readFileSync(BASELINE_FILE, 'utf8').trim(), 10);
console.log(`surface-boundary crossings: ${hits.length} (baseline ${baseline})`);
for (const h of hits) console.log(`  ${h}`);

if (hits.length > baseline) {
  console.error(`✗ crossings rose: ${baseline} -> ${hits.length}. Move the shared piece to shared/ (non-UI) or give the surface its own copy.`);
  process.exit(1);
}
if (hits.length < baseline) {
  console.log(`✓ crossings fell — lower the baseline:\n  echo ${hits.length} > scripts/baselines/boundary`);
}
