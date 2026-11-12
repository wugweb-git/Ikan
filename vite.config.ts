import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CALC_PATH, calcHeadHtml, calcBodyHtml } from './src/shared/content/burnout-calc-seo';

/**
 * Writes dist/burnout-cost-calculator/index.html: the built index.html with
 * the calculator's own head tags, JSON-LD and a plain-HTML summary in #root.
 *
 * Vercel serves a real file before it applies the SPA rewrite, so crawlers and
 * link unfurlers that skip JavaScript (LinkedIn, WhatsApp, Slack, most AI
 * bots) get the calculator's title, description, image and canonical instead
 * of the homepage's. The app boots exactly as on every other route.
 */
function calcPrerender(): Plugin {
  let outDir = 'dist';
  return {
    name: 'ikan-calc-prerender',
    apply: 'build',
    configResolved(cfg) {
      outDir = resolve(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      const shell = readFileSync(resolve(outDir, 'index.html'), 'utf8');
      const stripped = shell
        .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
        .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/i, '')
        .replace(/<meta\s+name="robots"[\s\S]*?\/>\s*/i, '')
        .replace(/<meta\s+property="og:[^"]*"[\s\S]*?\/>\s*/gi, '')
        .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/>\s*/gi, '')
        .replace(/<link\s+rel="canonical"[\s\S]*?\/>\s*/i, '');
      const page = stripped
        .replace('<html lang="en">', '<html lang="en-IN">')
        .replace('</head>', `    ${calcHeadHtml()}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">\n    ${calcBodyHtml()}\n    </div>`);
      if (page.includes('og:image" content="https://ikanhealth.in/pwa') || !page.includes(CALC_PATH)) {
        throw new Error('calcPrerender: head rewrite failed; index.html markup changed?');
      }
      const dir = resolve(outDir, CALC_PATH.slice(1));
      mkdirSync(dir, { recursive: true });
      writeFileSync(resolve(dir, 'index.html'), page);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), calcPrerender()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1700,
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  define: {
    global: 'globalThis',
  },
});
