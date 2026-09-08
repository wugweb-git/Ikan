/**
 * Run with:  npm test
 *
 * No DOM here, so the timer takes the never-pauses branch. The pause/resume
 * arithmetic is exercised by driving the injected clock, which is the part
 * that can actually be wrong; the listener wiring is a browser concern.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createActiveTimer } from './active-time.ts';

/** A clock the test moves by hand. */
function fakeClock(start = 1_757_000_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

test('a fresh run starts at zero', () => {
  const c = fakeClock();
  const timer = createActiveTimer({ now: c.now });
  assert.equal(timer.elapsedSeconds(), 0);
  timer.stop();
});

test('elapsed accumulates while foregrounded', () => {
  const c = fakeClock();
  const timer = createActiveTimer({ now: c.now });
  c.advance(90_000);
  assert.equal(timer.elapsedSeconds(), 90);
  timer.stop();
});

test('stop freezes the value', () => {
  const c = fakeClock();
  const timer = createActiveTimer({ now: c.now });
  c.advance(30_000);
  timer.stop();
  c.advance(600_000);
  assert.equal(timer.elapsedSeconds(), 30, 'time after stop must not count');
});

test('stop is idempotent and does not double-bank', () => {
  const c = fakeClock();
  const timer = createActiveTimer({ now: c.now });
  c.advance(10_000);
  timer.stop();
  timer.stop();
  assert.equal(timer.elapsedSeconds(), 10);
});

test('a resumed run seeds from the seconds already banked', () => {
  // The point of the whole module: two sittings of two minutes are four
  // minutes, not the nineteen hours between them.
  const c = fakeClock();
  const timer = createActiveTimer({ seedSeconds: 120, now: c.now });
  c.advance(120_000);
  assert.equal(timer.elapsedSeconds(), 240);
  timer.stop();
});

test('a resumed run keeps the original start, not the resume time', () => {
  const c = fakeClock();
  const first = '2026-09-01T09:00:00.000Z';
  const timer = createActiveTimer({ seedStartedAt: first, seedSeconds: 60, now: c.now });
  assert.equal(timer.startedAt(), first);
  timer.stop();
});

test('a fresh run stamps startedAt from the clock', () => {
  const c = fakeClock(1_757_000_000_000);
  const timer = createActiveTimer({ now: c.now });
  assert.equal(timer.startedAt(), new Date(1_757_000_000_000).toISOString());
  timer.stop();
});

test('a negative or absent seed cannot make elapsed go backwards', () => {
  const c = fakeClock();
  const timer = createActiveTimer({ seedSeconds: -500, now: c.now });
  c.advance(5_000);
  assert.equal(timer.elapsedSeconds(), 5, 'a bad seed is floored at zero, never subtracted');
  timer.stop();
});

test('sub-second time rounds rather than truncating to zero', () => {
  const c = fakeClock();
  const timer = createActiveTimer({ now: c.now });
  c.advance(1_600);
  assert.equal(timer.elapsedSeconds(), 2);
  timer.stop();
});
