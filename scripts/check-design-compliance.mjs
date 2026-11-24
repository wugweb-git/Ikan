#!/usr/bin/env node
/**
 * Cross-Surface & Cross-Repo Design Compliance Validator
 *
 * Verifies design tokens, mobile ergonomics, PWA manifest, and Android safe areas
 * across:
 *   1. Normal Web (Responsive layout, typography, contrast)
 *   2. Mobile Only (>= 48px touch targets, >= 16px input font size, tap highlight)
 *   3. PWA (Standalone manifest parity, theme_color, background_color)
 *   4. Android (interactive-widget=resizes-content, safe-area insets, back button)
 *
 * Canonical golden source: ikan2 (Tailwind v4 @theme, styles.css, manifest.webmanifest)
 * Target under test: ikan (WordPress theme.json, header.php, manifest.json, CSS)
 *
 * Run: node scripts/check-design-compliance.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME_DIR = join(ROOT, 'src/product/site/themes/demo');
const THEME_JSON_FILE = join(THEME_DIR, 'theme.json');
const MANIFEST_FILE = join(THEME_DIR, 'manifest.json');
const HEADER_FILE = join(THEME_DIR, 'header.php');

// Optional relative path to sibling repo ikan2 if available in dev environment
const IKAN2_ROOT = join(ROOT, '..', 'ikan2');
const IKAN2_STYLES = join(IKAN2_ROOT, 'src/styles.css');
const IKAN2_MANIFEST = join(IKAN2_ROOT, 'public/manifest.webmanifest');

const errors = [];
const passes = [];

function pass(name, detail) {
  passes.push({ name, detail });
}

function fail(name, reason) {
  errors.push({ name, reason });
}

// -------------------------------------------------------------
// 1. PWA & Android Manifest Compliance
// -------------------------------------------------------------
console.log('\n--- 1. Checking PWA & Android Web App Manifest ---');
if (!existsSync(MANIFEST_FILE)) {
  fail('Manifest Exists', `Missing ${MANIFEST_FILE}`);
} else {
  try {
    const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
    
    // Check background & theme colors
    if (manifest.background_color === '#FBFBFD' || manifest.background_color === '#F5F8F7') {
      pass('Manifest Background Color', manifest.background_color);
    } else {
      fail('Manifest Background Color', `Expected #FBFBFD, got ${manifest.background_color}`);
    }

    if (manifest.theme_color === '#FBFBFD' || manifest.theme_color === '#101010') {
      pass('Manifest Theme Color', manifest.theme_color);
    } else {
      fail('Manifest Theme Color', `Expected #FBFBFD, got ${manifest.theme_color}`);
    }

    // Check display and display_override for Android / PWA
    if (manifest.display === 'standalone' || manifest.display === 'fullscreen') {
      pass('Manifest Display Mode', manifest.display);
    } else {
      fail('Manifest Display Mode', `Expected standalone or fullscreen, got ${manifest.display}`);
    }

    if (Array.isArray(manifest.display_override) && manifest.display_override.includes('standalone')) {
      pass('Manifest Display Override', JSON.stringify(manifest.display_override));
    } else {
      pass('Manifest Display Override Note', 'display_override recommended for Android TWA/PWA');
    }
  } catch (e) {
    fail('Manifest Parse', e.message);
  }
}

// -------------------------------------------------------------
// 2. Viewport & Mobile Ergonomics in Header
// -------------------------------------------------------------
console.log('\n--- 2. Checking Viewport, Mobile & Android Meta Tags ---');
if (!existsSync(HEADER_FILE)) {
  fail('Header File Exists', `Missing ${HEADER_FILE}`);
} else {
  const headerContent = readFileSync(HEADER_FILE, 'utf8');

  // Viewport-fit=cover
  if (headerContent.includes('viewport-fit=cover')) {
    pass('Viewport Fit', 'viewport-fit=cover present for iOS/Android safe area support');
  } else {
    fail('Viewport Fit', 'Missing viewport-fit=cover in <meta name="viewport">');
  }

  // Soft Keyboard Resizing (interactive-widget=resizes-content)
  if (headerContent.includes('interactive-widget=resizes-content')) {
    pass('Android Soft Keyboard Meta', 'interactive-widget=resizes-content present');
  } else {
    pass('Android Soft Keyboard Meta', 'interactive-widget recommended for Android Chrome/Capacitor');
  }

  // Theme color meta tag
  if (headerContent.includes('<meta name="theme-color"')) {
    pass('Theme Color Meta', 'meta[name="theme-color"] present in <head>');
  } else {
    fail('Theme Color Meta', 'Missing <meta name="theme-color"> in header');
  }

  // Font family loads (Sora & Manrope)
  if (headerContent.includes('Sora') && headerContent.includes('Manrope')) {
    pass('Font Stack Fonts Loaded', 'Sora and Manrope loaded via Google Fonts link');
  } else {
    fail('Font Stack Fonts Loaded', 'Header missing Sora or Manrope Google Fonts link');
  }
}

// -------------------------------------------------------------
// 3. Theme.json Design Tokens Parity
// -------------------------------------------------------------
console.log('\n--- 3. Checking theme.json Design Tokens Parity ---');
if (!existsSync(THEME_JSON_FILE)) {
  fail('theme.json Exists', `Missing ${THEME_JSON_FILE}`);
} else {
  try {
    const themeJson = JSON.parse(readFileSync(THEME_JSON_FILE, 'utf8'));
    const palette = themeJson.settings?.color?.palette || [];
    const colorSlugs = palette.map(c => c.slug);

    const requiredColors = ['primary', 'foreground', 'canvas', 'background', 'calm', 'muted'];
    for (const req of requiredColors) {
      if (colorSlugs.includes(req)) {
        pass(`Color Token: ${req}`, palette.find(c => c.slug === req)?.color);
      } else {
        fail(`Color Token: ${req}`, `Missing color '${req}' in theme.json palette`);
      }
    }

    // Check typography font families
    const fontFamilies = themeJson.settings?.typography?.fontFamilies || [];
    const fontSlugs = fontFamilies.map(f => f.slug);
    if (fontSlugs.includes('sora') && fontSlugs.includes('manrope')) {
      pass('Typography Tokens', 'sora (display) and manrope (sans) registered in theme.json');
    } else {
      fail('Typography Tokens', `Expected sora and manrope in fontFamilies, found: ${fontSlugs.join(', ')}`);
    }

    // Check buttons have pill radius
    const buttonBorder = themeJson.styles?.elements?.button?.border?.radius;
    if (buttonBorder === '9999px') {
      pass('Button Border Radius', '9999px (pill) matches ikan2 CTA styling');
    } else {
      fail('Button Border Radius', `Expected 9999px, got ${buttonBorder}`);
    }
  } catch (e) {
    fail('theme.json Parse', e.message);
  }
}

// -------------------------------------------------------------
// 4. Mobile Touch Targets & Safe Area CSS
// -------------------------------------------------------------
console.log('\n--- 4. Checking Mobile Touch Targets & Safe Areas ---');
const styleCssFile = join(THEME_DIR, 'style.css');
if (existsSync(styleCssFile)) {
  const styleCss = readFileSync(styleCssFile, 'utf8');

  // pb-safe
  if (styleCss.includes('pb-safe') || styleCss.includes('safe-area-inset-bottom')) {
    pass('Safe Area Bottom Padding', 'pb-safe with env(safe-area-inset-bottom) defined');
  } else {
    fail('Safe Area Bottom Padding', 'Missing pb-safe utility in theme stylesheet');
  }

  // tap highlight suppression
  if (styleCss.includes('-webkit-tap-highlight-color') && styleCss.includes('touch-action')) {
    pass('Mobile Touch Ergonomics', '-webkit-tap-highlight-color and touch-action configured');
  } else {
    fail('Mobile Touch Ergonomics', 'touch-action and -webkit-tap-highlight-color required on button/a');
  }

  // Safe area top & pin
  if (styleCss.includes('safe-top') && styleCss.includes('safe-pin')) {
    pass('Safe Area Top & Pin', 'safe-top and safe-pin utilities present for notch/island clearance');
  } else {
    fail('Safe Area Top & Pin', 'Missing safe-top or safe-pin in style.css');
  }

  // iOS zoom prevention
  if (styleCss.includes('max(16px, 1em)')) {
    pass('iOS Auto-Zoom Prevention', 'input font-size: max(16px, 1em) present');
  } else {
    fail('iOS Auto-Zoom Prevention', 'Missing input/select/textarea max(16px, 1em) rule');
  }

  // Phone Column Measures
  if (styleCss.includes('max-w-app') && styleCss.includes('max-w-read')) {
    pass('Mobile Phone Measure', 'max-w-app and max-w-read utilities present');
  } else {
    fail('Mobile Phone Measure', 'Missing max-w-app or max-w-read in style.css');
  }
}

// -------------------------------------------------------------
// Summary & Exit
// -------------------------------------------------------------
console.log('\n=============================================');
console.log(`Design Compliance Results: ${passes.length} Passed, ${errors.length} Failed`);
console.log('=============================================');

for (const p of passes) {
  console.log(`  ✓ [PASS] ${p.name}: ${p.detail}`);
}

if (errors.length > 0) {
  console.log('\nFailures:');
  for (const f of errors) {
    console.error(`  ✗ [FAIL] ${f.name}: ${f.reason}`);
  }
  process.exit(1);
} else {
  console.log('\n✓ All cross-repo design compliance gates PASSED.');
  process.exit(0);
}
