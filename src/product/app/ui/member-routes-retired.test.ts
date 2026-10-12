import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { routes } from './route-config.ts';

/**
 * ikanhealth.in does not serve the member app, and this is what keeps it that
 * way.
 *
 * The member surface moved to app.ikanhealth.in (iKAN 2) on 2026-10-12. Its
 * routes still exist in this bundle as unreachable code, and every one of them
 * 301s away at the edge — which is exactly the arrangement that rots quietly.
 * Someone adds a screen, or removes a redirect while tidying `vercel.json`, and
 * a member sign-in reappears on the marketing host with nothing to catch it.
 *
 * So: any route that declares `requiresAuth` must either be an admin route
 * (the admin console still signs in here, at its own URL) or be redirected off
 * this host. There is no third option, and adding one should fail here.
 */

const ROOT = join(import.meta.dirname, '../../../..');
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));

const redirected = new Set<string>(
  (vercel.redirects ?? []).map((r: { source: string }) => r.source),
);

const isAdmin = (p: string) => p === '/admin' || p.startsWith('/admin/');

test('every member route is redirected off this host', () => {
  const stranded = routes
    .filter((r) => r.requiresAuth && !isAdmin(r.path))
    .map((r) => r.path)
    .filter((p) => !redirected.has(p));

  assert.deepEqual(
    stranded,
    [],
    `These routes need a member session but do not leave ikanhealth.in. ` +
      `Either redirect them to app.ikanhealth.in in vercel.json, or — if the ` +
      `member app is genuinely coming back to this host — delete this test ` +
      `deliberately rather than loosening it: ${stranded.join(', ')}`,
  );
});

test('the member login does not exist on this host', () => {
  assert.ok(
    redirected.has('/login'),
    '/login must 301 to app.ikanhealth.in — the member login lives there, not here.',
  );
});

test('every member redirect points at the member app, not somewhere on this host', () => {
  const wrong = (vercel.redirects ?? [])
    .filter((r: { source: string }) => {
      const cfg = routes.find((x) => x.path === r.source);
      return cfg?.requiresAuth && !isAdmin(r.source);
    })
    .filter((r: { destination: string }) => !r.destination.startsWith('https://app.ikanhealth.in'))
    .map((r: { source: string; destination: string }) => `${r.source} -> ${r.destination}`);

  assert.deepEqual(wrong, [], `Member routes must leave this origin: ${wrong.join(', ')}`);
});

test('the admin console keeps its own sign-in here', () => {
  // The counterpart to the rule above: closing the member app must not take
  // /admin with it. Its login is the one that still belongs on this host.
  assert.ok(!redirected.has('/admin'), '/admin must stay on this host.');
  assert.ok(!redirected.has('/admin/login'), '/admin/login must stay on this host.');
});
