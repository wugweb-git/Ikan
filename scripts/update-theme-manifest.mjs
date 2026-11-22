import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distHtmlPath = path.join(rootDir, 'dist', 'index.html');
const manifestDir = path.join(rootDir, 'src', 'product', 'site', 'themes', 'demo', 'assets');
const manifestPath = path.join(manifestDir, 'manifest.json');

if (!fs.existsSync(distHtmlPath)) {
  console.error('dist/index.html does not exist. Run npm run build first.');
  process.exit(1);
}

const html = fs.readFileSync(distHtmlPath, 'utf8');
const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);

const js = jsMatch ? jsMatch[1] : null;
const css = cssMatch ? cssMatch[1] : null;

let existing = null;
if (fs.existsSync(manifestPath)) {
  try {
    existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {}
}

if (existing && existing.js === js && existing.css === css) {
  console.log('✓ Theme manifest already up to date:', existing);
  process.exit(0);
}

const manifest = {
  js,
  css,
  updated_at: new Date().toISOString(),
};

if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('✓ Updated theme manifest:', manifest);
