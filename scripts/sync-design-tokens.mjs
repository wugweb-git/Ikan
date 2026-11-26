#!/usr/bin/env node
/**
 * iKAN Design Token Sync — ikan2 → ikan
 *
 * Reads canonical design tokens from ikan2/src/styles.css (:root block)
 * and applies them to the ikan WordPress block theme:
 *
 *   1. style.css          (.ikan2-theme variables — both use oklch, no conversion)
 *   2. theme.json         (color palette — oklch → hex conversion)
 *   3. manifest.json      (background_color / theme_color — hex copied directly)
 *
 * Modes:
 *   node scripts/sync-design-tokens.mjs            — report-only (dry run)
 *   node scripts/sync-design-tokens.mjs --apply    — write changed files
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME_DIR = join(ROOT, 'src/product/site/themes/demo');
const STYLE_CSS = join(THEME_DIR, 'style.css');
const THEME_JSON = join(THEME_DIR, 'theme.json');
const MANIFEST_JSON = join(THEME_DIR, 'manifest.json');

const IKAN2_ROOT = join(ROOT, '..', 'ikan2');
const IKAN2_STYLES = join(IKAN2_ROOT, 'src/styles.css');
const IKAN2_MANIFEST = join(IKAN2_ROOT, 'public/manifest.webmanifest');

const APPLY = process.argv.includes('--apply');

const report = { changed: [], unchanged: [], errors: [], skipped: [] };
function log(kind, msg) {
  const prefix = { changed: '  ◎', unchanged: '  ·', errors: '  ✗', skipped: '  −' }[kind] || '  ';
  process.stdout.write(prefix + ' ' + msg + '\n');
}

function read(p) {
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}

/* ─────────────────────────────────────────────────────────────
 * OKLCH → sRGB hex (correct inverse-matrix conversion)
 * ───────────────────────────────────────────────────────────── */

// OKLab → XYZ (D65) uses this matrix; we need its inverse → XYZ→linear RGB.
// Computed once: the inverse of the standard OKLab RGB→LMS matrix.
const INV_M = [
  [ 4.1009788302, -3.2291260120,  0.7524923882],
  [-1.2819364894,  2.4780136155, -0.4024729899],
  [ 0.0335374962, -0.0234610256,  1.0662072306],
];

function oklabToXyz(l, a, b) {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2918457977 * b;
  return { x: l_**3, y: m_**3, z: s_**3 };
}

function xyzToLinearRgb(x, y, z) {
  const r = INV_M[0][0]*x + INV_M[0][1]*y + INV_M[0][2]*z;
  const g = INV_M[1][0]*x + INV_M[1][1]*y + INV_M[1][2]*z;
  const bb = INV_M[2][0]*x + INV_M[2][1]*y + INV_M[2][2]*z;
  return { r, g, b: bb };
}

function srgb(v) {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1/2.4) - 0.055;
}

function oklchToHex(l, c, h) {
  const hr = (h / 360) * 2 * Math.PI;
  const a = c * Math.cos(hr);
  const bb = c * Math.sin(hr);
  const { x, y, z } = oklabToXyz(l, a, bb);
  const { r, g, b } = xyzToLinearRgb(x, y, z);
  const toByte = (v) => Math.round(Math.min(1, Math.max(0, srgb(v))) * 255);
  const hex = (n) => n.toString(16).padStart(2, '0');
  return '#' + hex(toByte(r)) + hex(toByte(g)) + hex(toByte(b)).toUpperCase();
}

/* ─────────────────────────────────────────────────────────────
 * Parse CSS custom properties from a scoped block
 * ───────────────────────────────────────────────────────────── */

const OKLCH_RE = /oklch\(\s*([\d.]+)\s+(?:([\d.]+)\s+)?([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/;

function parseCustomProperties(css, scopeSelector) {
  const props = new Map();
  const blockRe = new RegExp(scopeSelector + '\\s*\\{([^}]*)\\}', 's');
  const m = css.match(blockRe);
  if (!m) return props;
  const body = m[1];
  const declRe = /(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g;
  let d;
  while ((d = declRe.exec(body)) !== null) {
    const name = d[1].trim();
    const raw = d[2].trim();
    const om = raw.match(OKLCH_RE);
    if (om) {
      props.set(name, { raw, l: parseFloat(om[1]), c: parseFloat(om[2]),
        h: parseFloat(om[3]),
        alpha: om[4] !== undefined ? parseFloat(om[4]) : 1 });
    } else {
      props.set(name, { raw });
    }
  }
  return props;
}

/* ─────────────────────────────────────────────────────────────
 * Load sources
 * ───────────────────────────────────────────────────────────── */

const ikan2Styles = read(IKAN2_STYLES);
if (!ikan2Styles) { report.errors.push('ikan2 source not found: ' + IKAN2_STYLES); process.exit(1); }

const ikan2Root = parseCustomProperties(ikan2Styles, ':root');
const ikan2ManifestRaw = read(IKAN2_MANIFEST);
const ikan2Manifest = ikan2ManifestRaw ? JSON.parse(ikan2ManifestRaw) : null;

const ikanStyle = read(STYLE_CSS);
if (!ikanStyle) { report.errors.push('ikan target not found: ' + STYLE_CSS); process.exit(1); }

const ikanThemeJsonRaw = read(THEME_JSON);
const ikanThemeJson = ikanThemeJsonRaw ? JSON.parse(ikanThemeJsonRaw) : null;
const ikanManifestRaw = read(MANIFEST_JSON);
const ikanManifest = ikanManifestRaw ? JSON.parse(ikanManifestRaw) : null;

const ikanRoot = parseCustomProperties(ikanStyle, '.ikan2-theme');

/* ─────────────────────────────────────────────────────────────
 * Token map
 * ───────────────────────────────────────────────────────────── */

const TOKEN_MAP = {
  background:  { target: '--background',   themeJson: 'background' },
  foreground:  { target: '--foreground',   themeJson: 'foreground' },
  canvas:      { target: '--canvas',       themeJson: 'canvas' },
  primary:     { target: '--primary',      themeJson: 'primary' },
  muted:       { target: '--muted',        themeJson: 'muted' },
  calm:        { target: '--calm',         themeJson: 'calm' },
  mind:        { target: '--mind',         themeJson: 'mind' },
  rest:        { target: '--rest',         themeJson: 'rest' },
  alert:       { target: '--alert',        themeJson: 'alert' },
  'brand-teal':   { target: '--brand-teal',   themeJson: null },
  'brand-amber':  { target: '--brand-amber',  themeJson: null },
  'brand-coral':  { target: '--brand-coral',  themeJson: null },
  'brand-slate':  { target: '--brand-slate',  themeJson: null },
  radius:       { target: '--radius',     themeJson: null },
};

function valuesEqual(a, b) {
  if (!a || !b) return false;
  if (a.l !== undefined && b.l !== undefined) {
    return Math.abs((a.l||0)-(b.l||0))<1e-4 && Math.abs((a.c||0)-(b.c||0))<1e-4 &&
           Math.abs((a.h||0)-(b.h||0))<1e-4 && Math.abs((a.alpha||1)-(b.alpha||1))<1e-4;
  }
  return a.raw === b.raw;
}

function fmtToken(v) {
  if (!v) return 'missing';
  if (v.l !== undefined) return 'oklch(' + v.l + ' ' + v.c + ' ' + v.h + (v.alpha<1 ? ' / '+v.alpha : '') + ')';
  return v.raw;
}

/* ─────────────────────────────────────────────────────────────
 * 1. Sync style.css (.ikan2-theme variables)
 *    Both ikan2 and ikan use oklch → direct copy, no conversion.
 * ───────────────────────────────────────────────────────────── */

function syncStyleCss() {
  log('unchanged', 'style.css — scanning .ikan2-theme block');
  let newCss = ikanStyle;
  let anyChange = false;

  for (const [sourceName, mapping] of Object.entries(TOKEN_MAP)) {
    const source = ikan2Root.get(sourceName);
    const target = ikanRoot.get(mapping.target);
    if (!source) { report.skipped.push('style.css: source token ' + sourceName + ' not in ikan2 :root'); continue; }
    if (valuesEqual(source, target)) { report.unchanged.push('style.css: .ikan2-theme ' + mapping.target + ' = ' + fmtToken(source)); continue; }

    const oldRaw = target ? target.raw : '(absent)';
    const newRaw = fmtToken(source);

    const blockRe = /\.ikan2-theme\s*\{([^}]*)\}/s;
    const blockMatch = newCss.match(blockRe);
    if (!blockMatch) { report.errors.push('style.css: cannot find .ikan2-theme block'); continue; }
    const blockBody = blockMatch[1];
    const newBody = blockBody.replace(
      new RegExp(mapping.target + '\\s*:\\s*[^;]+(;)'),
      '$1' + newRaw + '$2'
    );
    newCss = newCss.replace(blockRe, (match) => match.replace(blockBody, newBody));

    anyChange = true;
    report.changed.push('style.css: .ikan2-theme ' + mapping.target + ': ' + oldRaw + ' → ' + newRaw);
    log('changed', '.ikan2-theme ' + mapping.target + ': ' + oldRaw + ' → ' + newRaw);
  }

  if (anyChange && APPLY) { writeFileSync(STYLE_CSS, newCss); log('changed', 'style.css written'); }
  else if (!anyChange) { log('unchanged', 'style.css — no token drift'); }
}

/* ─────────────────────────────────────────────────────────────
 * 2. Sync theme.json (color palette, oklch → hex)
 * ───────────────────────────────────────────────────────────── */

function syncThemeJson() {
  if (!ikanThemeJson) { report.errors.push('theme.json: could not parse target'); return; }
  const palette = ikanThemeJson.settings?.color?.palette || [];
  let anyChange = false;

  for (const [sourceName, mapping] of Object.entries(TOKEN_MAP)) {
    if (!mapping.themeJson) continue;
    const source = ikan2Root.get(sourceName);
    if (!source || source.l === undefined) { report.skipped.push('theme.json: source ' + sourceName + ' not an oklch color'); continue; }

    const hex = oklchToHex(source.l, source.c, source.h);
    const entry = palette.find((c) => c.slug === mapping.themeJson);
    if (!entry) { report.skipped.push('theme.json: palette slug "' + mapping.themeJson + '" not found'); continue; }
    if (entry.color.toUpperCase() === hex) { report.unchanged.push('theme.json: color ' + mapping.themeJson + ' = ' + hex); continue; }

    report.changed.push('theme.json: color ' + mapping.themeJson + ': ' + entry.color + ' → ' + hex);
    log('changed', 'theme.json color ' + mapping.themeJson + ': ' + entry.color + ' → ' + hex);
    entry.color = hex;
    anyChange = true;
  }

  const fontSizes = ikanThemeJson.settings?.typography?.fontSizes || [];
  const sizeSlugs = new Set(fontSizes.map((s) => s.slug));
  for (const role of ['display-lg','display-md','display-sm','headline-lg','headline-md','headline-sm','title-lg','title-md','body-lg','body-md','body-sm','label-lg','label-md']) {
    if (!sizeSlugs.has(role)) { report.skipped.push('theme.json: font size slug "' + role + '" missing from typography'); }
  }

  if (anyChange && APPLY) { writeFileSync(THEME_JSON, JSON.stringify(ikanThemeJson, null, 2) + '\n'); log('changed', 'theme.json written'); }
  else if (!anyChange) { log('unchanged', 'theme.json — no palette drift'); }
}

/* ─────────────────────────────────────────────────────────────
 * 3. Sync manifest.json (background_color / theme_color)
 * ───────────────────────────────────────────────────────────── */

function syncManifest() {
  if (!ikan2Manifest || !ikanManifest) { report.skipped.push('manifest: missing ikan2 or ikan manifest'); return; }
  let anyChange = false;

  if (ikanManifest.background_color !== ikan2Manifest.background_color) {
    report.changed.push('manifest: background_color ' + ikanManifest.background_color + ' → ' + ikan2Manifest.background_color);
    log('changed', 'manifest background_color: ' + ikanManifest.background_color + ' → ' + ikan2Manifest.background_color);
    ikanManifest.background_color = ikan2Manifest.background_color;
    anyChange = true;
  } else { report.unchanged.push('manifest: background_color = ' + ikan2Manifest.background_color); }

  if (ikanManifest.theme_color !== ikan2Manifest.theme_color) {
    report.changed.push('manifest: theme_color ' + ikanManifest.theme_color + ' → ' + ikan2Manifest.theme_color);
    log('changed', 'manifest theme_color: ' + ikanManifest.theme_color + ' → ' + ikan2Manifest.theme_color);
    ikanManifest.theme_color = ikan2Manifest.theme_color;
    anyChange = true;
  } else { report.unchanged.push('manifest: theme_color = ' + ikan2Manifest.theme_color); }

  if (anyChange && APPLY) { writeFileSync(MANIFEST_JSON, JSON.stringify(ikanManifest, null, 2) + '\n'); log('changed', 'manifest.json written'); }
  else if (!anyChange) { log('unchanged', 'manifest.json — no color drift'); }
}

/* ─────────────────────────────────────────────────────────────
 * Run
 * ───────────────────────────────────────────────────────────── */

console.log('\n iKAN Design Token Sync — ikan2 → ikan\n ' + (APPLY ? 'MODE: APPLY (writing files)' : 'MODE: report-only (dry-run)') + '\n');

syncStyleCss();
syncThemeJson();
syncManifest();

console.log('\n ─────────────────────────────────────────────');
console.log(' Summary: ' + report.changed.length + ' changed, ' + report.unchanged.length + ' unchanged, ' + report.skipped.length + ' skipped, ' + report.errors.length + ' errors');
console.log(' ─────────────────────────────────────────────\n');

if (report.errors.length > 0) {
  console.log(' Errors:');
  for (const e of report.errors) console.log('   ✗ ' + e);
  console.log('');
}

if (!APPLY && report.changed.length > 0) {
  console.log(' Run with --apply to write the changed files.\n');
}

process.exit(report.errors.length > 0 ? 1 : 0);
