#!/usr/bin/env node
/**
 * iKAN Scheduled Worker: Health, Telemetry & Content Sync Monitor
 *
 * Runs scheduled checks against live WordPress REST APIs, validates content
 * schema parity, and logs structured telemetry to GitHub Actions summary.
 *
 * Usage:
 *   node scripts/sync-worker.mjs
 */

import { writeFileSync, existsSync, appendFileSync } from 'node:fs';

const PROD_ORIGIN = process.env.PROD_ORIGIN || 'https://ikanhealth.in';
const INGEST_USER = process.env.WP_INGEST_USER || 'ingest';
const INGEST_PASS = process.env.WP_INGEST_PASS || '';

const ENDPOINTS = [
  { name: 'Portal Home', path: '/', expectJson: false },
  { name: 'Shared Storybook', path: '/storybook/', expectJson: false },
  { name: 'Burnout Calculator', path: '/burnout-cost-calculator/', expectJson: false },
  { name: 'API App Config', path: '/wp-json/ikan/v1/app-config', expectJson: true },
  { name: 'API About Page', path: '/wp-json/ikan/v1/page/about', expectJson: true },
  { name: 'API Resources Catalog', path: '/wp-json/ikan/v1/resources', expectJson: true },
  { name: 'API Writeups Catalog', path: '/wp-json/ikan/v1/writeups', expectJson: true }
];

async function checkEndpoint(ep) {
  const url = `${PROD_ORIGIN}${ep.path}`;
  const start = Date.now();
  try {
    const headers = { 'User-Agent': 'iKAN-Sync-Worker/1.0' };
    if (INGEST_PASS) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${INGEST_USER}:${INGEST_PASS}`).toString('base64');
    }

    const res = await fetch(url, { headers });
    const duration = Date.now() - start;
    const ok = res.status >= 200 && res.status < 400;

    let payloadSize = 0;
    let extra = '';

    if (ep.expectJson) {
      const data = await res.json();
      payloadSize = JSON.stringify(data).length;
      if (Array.isArray(data.data)) {
        extra = `${data.data.length} items (${data.source || 'api'})`;
      } else if (data.data && typeof data.data === 'object') {
        extra = `keys: ${Object.keys(data.data).length}`;
      } else if (data.brand) {
        extra = `${data.brand.name}`;
      }
    } else {
      const text = await res.text();
      payloadSize = text.length;
      extra = `${Math.round(payloadSize / 1024)} KB`;
    }

    return {
      name: ep.name,
      path: ep.path,
      status: res.status,
      ok,
      duration,
      payloadSize,
      extra,
      error: null
    };
  } catch (err) {
    return {
      name: ep.name,
      path: ep.path,
      status: 0,
      ok: false,
      duration: Date.now() - start,
      payloadSize: 0,
      extra: 'Failed',
      error: err.message
    };
  }
}

async function run() {
  console.log(`[iKAN Sync Worker] Checking ${PROD_ORIGIN} ...`);
  const results = [];

  for (const ep of ENDPOINTS) {
    process.stdout.write(`  Checking ${ep.name} (${ep.path}) ... `);
    const r = await checkEndpoint(ep);
    if (r.ok) {
      console.log(`✓ ${r.status} (${r.duration}ms, ${r.extra})`);
    } else {
      console.log(`✗ ${r.status || 'ERROR'} (${r.error || 'Failed'})`);
    }
    results.push(r);
  }

  const allOk = results.every(r => r.ok);
  const now = new Date().toISOString();

  // Format Markdown table for GitHub Actions Summary
  let md = `## 🛰️ iKAN Production Sync & Telemetry Report\n\n`;
  md += `**Timestamp**: \`${now}\`  \n`;
  md += `**Target**: [${PROD_ORIGIN}](${PROD_ORIGIN})  \n`;
  md += `**Status**: ${allOk ? '🟢 **ALL SYSTEMS OPERATIONAL**' : '🔴 **DEGRADATION DETECTED**'}\n\n`;
  md += `| Endpoint | Path | Status | Latency | Content / Items |\n`;
  md += `| :--- | :--- | :---: | :---: | :--- |\n`;

  for (const r of results) {
    const statusBadge = r.ok ? `✅ ${r.status}` : `❌ ${r.status || 'FAIL'}`;
    md += `| **${r.name}** | \`${r.path}\` | ${statusBadge} | ${r.duration}ms | ${r.extra || '-'} |\n`;
  }

  md += `\n*Worker identity: \`${INGEST_USER}\`*  \n`;

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  }

  if (!allOk) {
    console.error('\n[iKAN Sync Worker] Warning: One or more health checks failed.');
    process.exit(1);
  }

  console.log('\n[iKAN Sync Worker] All checks passed successfully.');
}

run();
