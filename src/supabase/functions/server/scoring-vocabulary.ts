/**
 * Scoring vocabulary — the single source for the severity and tier terms.
 *
 * These lists were defined in FOUR places: `src/lib/scoring-engine.ts`,
 * `server/scoring-validation.ts`, `server/shared-types.ts`, and a second
 * `compareSeverity` in `server/recommendation-service.ts`. The VALUES agreed —
 * this was drift waiting to happen rather than drift already happened — but the
 * two `compareSeverity` implementations did not, and one of them was wrong.
 *
 * THE BUG THIS FIXES. The browser copy read:
 *
 *     SEVERITY_LEVELS.indexOf(a) - SEVERITY_LEVELS.indexOf(b)
 *
 * `indexOf` returns -1 for a term it does not know. So a typo'd threshold made
 * every comparison against it come out POSITIVE:
 *
 *     compareSeverity('severe', 'typo')  ->  4 - (-1)  =  5   // "greater than"
 *
 * i.e. an unrecognised rule threshold caused the rule to fire for everyone.
 * That is the exact failure CLAUDE.md records as already having cost a live
 * defect: "an unrecognised term on either side means no match — it previously
 * defaulted both sides to `moderate`, so a typo'd threshold became a live one."
 * The server's copy got this right and the browser's did not.
 *
 * Lives under `server/` for the same reason as `validation-core.ts`: the edge
 * function deploys by copying `server/*`, so a module outside that directory
 * would not ship. Pure TypeScript, no imports, no Deno or DOM APIs.
 */

/** The clinical vocabulary, ordered least to most severe. Rules match on this. */
export const SEVERITY_LEVELS = [
  'minimal',
  'mild',
  'moderate',
  'moderately-severe',
  'severe',
] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

/** What the product DOES about a score — tone and copy. Not on the matching path. */
export const RESPONSE_TIERS = ['low', 'moderate', 'high'] as const;
export type ResponseTier = (typeof RESPONSE_TIERS)[number];

export function isSeverityLevel(v: unknown): v is SeverityLevel {
  return typeof v === 'string' && (SEVERITY_LEVELS as readonly string[]).includes(v);
}

/**
 * Order two severities. Negative = `a` is less severe than `b`.
 *
 * An unrecognised term on EITHER side means **no match** — it returns -1 rather
 * than letting `indexOf`'s -1 leak into the arithmetic. A threshold nobody
 * recognises must never be one everybody clears.
 */
export function compareSeverity(a: SeverityLevel, b: SeverityLevel): number {
  if (!isSeverityLevel(a) || !isSeverityLevel(b)) return -1;
  return SEVERITY_LEVELS.indexOf(a) - SEVERITY_LEVELS.indexOf(b);
}
