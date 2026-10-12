/**
 * The disclosure rules for the organisation dashboard, as pure functions.
 *
 * Separated from `org-routes.ts` so they can be unit-tested under
 * `node --test` with no Deno, no network and no database — the same reason
 * `recommendation-matching.ts` and `storage-urls.ts` sit beside their tests.
 * This is the one piece of the B2B product whose correctness is a promise to
 * somebody's employee rather than a feature, so "it looked right on the
 * screen" is not good enough evidence.
 *
 * No imports, deliberately: the deploy script copies only this directory, and
 * a pure module is also what lets the test import it directly.
 */

export interface GroupRow {
  /** How many people's data produced this figure. NOT the group's headcount. */
  n: number;
  [key: string]: unknown;
}

export interface Suppressed {
  suppressed: true;
  reason: string;
  n: number;
}

export function belowFloorReason(n: number, floor: number): string {
  return (
    `Fewer than ${floor} people with data in this group (${n}). ` +
    `Showing a figure here could point at an individual.`
  );
}

export const COMPLEMENT_REASON =
  'Withheld so the group below the threshold cannot be worked out by ' +
  'subtracting the rest from the organisation total.';

/**
 * Which groups may not be reported on.
 *
 * Two rules, and the second is the one a bare minimum-group-size misses:
 *
 *   1. A group with fewer than `floor` contributors is withheld.
 *
 *   2. If EXACTLY ONE group is withheld, a second must be — otherwise the
 *      organisation total minus every group shown is the withheld group's
 *      figure, and the floor has protected nothing. The second is the
 *      smallest of those still eligible, because withholding the largest
 *      would cost the most information for the same protection.
 *
 * With two or more already below the floor, the remainder is their combined
 * figure and isolates none of them, so no extra group is withheld — being
 * stricter there would cost information and buy nothing.
 *
 * Returns the set of keys to withhold, so the caller decides what a withheld
 * row looks like.
 */
export function groupsToWithhold<T extends GroupRow>(
  rows: T[],
  floor: number,
  keyOf: (row: T) => string,
): Map<string, string> {
  const withheld = new Map<string, string>();
  for (const r of rows) {
    if (r.n < floor) withheld.set(keyOf(r), belowFloorReason(r.n, floor));
  }

  if (withheld.size === 1 && rows.length > 1) {
    const smallestShown = rows
      .filter((r) => !withheld.has(keyOf(r)))
      .sort((a, b) => a.n - b.n)[0];
    if (smallestShown) withheld.set(keyOf(smallestShown), COMPLEMENT_REASON);
  }

  return withheld;
}

/**
 * A period in a trend line. Periods are independent of each other — hiding a
 * second month would not stop anyone differencing two months of the same
 * group, and that is defended at the write path instead, by never recomputing
 * a closed period.
 */
export function withholdPeriod(n: number, floor: number): Suppressed | null {
  return n < floor ? { suppressed: true, n, reason: belowFloorReason(n, floor) } : null;
}
