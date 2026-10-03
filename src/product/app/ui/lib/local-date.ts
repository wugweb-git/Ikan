/**
 * Calendar-day keys in the viewer's LOCAL time zone.
 *
 * `date.toISOString().split('T')[0]` gives the UTC day. For a user in IST
 * (UTC+5:30) anything done between 00:00 and 05:30 lands on YESTERDAY's key —
 * a mood check-in at 1am shows up under the previous day, and "today" in the
 * calendar strip is wrong for the first five and a half hours of every day.
 *
 * Pure and dependency-free so it can be unit-tested under `node --test`.
 */
export function localDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
