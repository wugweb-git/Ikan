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

const manifest = {
  js: jsMatch ? jsMatch[1] : null,
  css: cssMatch ? cssMatch[1] : null,
  updated_at: new Date().toISOString(),
};

if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('✓ Updated theme manifest:', manifest);
