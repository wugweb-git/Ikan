import { readFileSync } from 'node:fs';

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

try {
  const viteConfig = read('vite.config.ts');
  check(viteConfig.includes("import tailwindcss from '@tailwindcss/vite';"), 'vite.config.ts must import @tailwindcss/vite.');
  check(viteConfig.includes('tailwindcss()'), 'vite.config.ts must register tailwindcss() in plugins.');
} catch (error) {
  failures.push(`Unable to read vite.config.ts: ${error.message}`);
}

for (const path of ['vercel.json', 'src/vercel.json']) {
  try {
    const parsed = JSON.parse(read(path));
    const rewrites = Array.isArray(parsed.rewrites) ? parsed.rewrites : [];
    const hasSpaRewrite = rewrites.some(
      (item) => item?.source === '/(.*)' && item?.destination === '/index.html',
    );
    check(hasSpaRewrite, `${path} must include the SPA fallback rewrite /(.*) -> /index.html.`);
  } catch (error) {
    failures.push(`Invalid JSON in ${path}: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error('Configuration verification failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Configuration verification passed.');
