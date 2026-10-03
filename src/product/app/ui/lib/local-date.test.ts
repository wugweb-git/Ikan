import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localDayKey } from './local-date.ts';

test('formats the local calendar day as YYYY-MM-DD with zero padding', () => {
  assert.equal(localDayKey(new Date(2026, 0, 5, 12, 0, 0)), '2026-01-05');
  assert.equal(localDayKey(new Date(2026, 11, 31, 23, 59, 59)), '2026-12-31');
});

test('just after local midnight is still the local day, never the previous UTC day', () => {
  // 00:30 local on 1 March. In any zone east of UTC (IST included) the UTC
  // date is still 28 Feb — the bug this helper exists to avoid.
  const justAfterMidnight = new Date(2026, 2, 1, 0, 30, 0);
  assert.equal(localDayKey(justAfterMidnight), '2026-03-01');
});

test('uses the local fields, matching getFullYear/getMonth/getDate', () => {
  const d = new Date(2024, 1, 29, 3, 15);
  const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  assert.equal(localDayKey(d), expected);
  assert.equal(localDayKey(d), '2024-02-29');
});

test('defaults to now', () => {
  const now = new Date();
  assert.equal(localDayKey(), localDayKey(now));
});

test('under TZ=Asia/Kolkata an early-morning instant keys to the local day', () => {
  // 2026-06-10T20:00:00Z is 01:30 IST on 11 June.
  const instant = new Date('2026-06-10T20:00:00Z');
  const ist = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
  assert.equal(ist, '2026-06-11');
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata') {
    assert.equal(localDayKey(instant), '2026-06-11');
  }
});
