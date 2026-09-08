/**
 * Which recommendation rule wins, for a user at a given severity.
 *
 * Its own module rather than a function inside `recommendation-engine`, because
 * that file imports the API client and so cannot be loaded by a unit test —
 * and this is the piece of the engine most worth testing directly.
 *
 * ## The bug this replaces, which was live
 *
 * The old ordering was `sort((a, b) => a.priority - b.priority)` and the caller
 * took `[0]`, so the LOWEST priority number won. Against the 18 live rules a
 * moderately-severe burnout user matches four:
 *
 *     mild               priority 7   <- selected
 *     moderate           priority 8
 *     moderate           priority 10
 *     moderately-severe  priority 10
 *
 * The most severe user was handed the programme authored for the mildest case.
 * The data's intent runs the other way: `min_severity` rises with `priority` in
 * five of the six categories, so a bigger number is a stronger rule.
 *
 * ## The ordering, and why specificity comes first
 *
 * **Most specific threshold first, then priority descending.** A threshold-gated
 * rule means "written for people at least this severe", so for someone
 * moderately severe the rule authored AT moderately-severe is the one about
 * them; the mild rule merely also applies. Priority alone would have left the
 * two rules at 10 tied and resolved by creation order.
 *
 * Priority is the tie-break within a threshold and reads the way the data is
 * written: higher wins. No migration of the 18 rows is needed.
 */
// Imported from the vocabulary module directly, with an explicit extension,
// rather than via `scoring-engine`.
//
// `scoring-engine` re-exports these, but it also pulls in modules that reach
// `api-client`, and an extensionless specifier anywhere in that chain makes the
// whole file unloadable by `node --test` (Node's TypeScript stripping does not
// resolve extensionless relative imports). `scoring-vocabulary` is
// dependency-free and is the single definition of the five-term ordering, so
// this is the shortest path to it and not a second copy.
import {
  compareSeverity, isSeverityLevel, type SeverityLevel,
} from '../supabase/functions/server/scoring-vocabulary.ts';

/** True when the user is at least as severe as the rule requires. */
export function severityMeetsThreshold(actual: string, minRequired: string): boolean {
  if (!isSeverityLevel(actual) || !isSeverityLevel(minRequired)) return false;
  return compareSeverity(actual, minRequired) >= 0;
}

export interface RankableRule {
  min_severity: string;
  priority: number;
}

/** Rules the user qualifies for, strongest first. */
export function rankMatchingRules<T extends RankableRule>(rules: T[], severity: SeverityLevel): T[] {
  return rules
    .filter(rule => severityMeetsThreshold(severity, rule.min_severity))
    .sort((a, b) => {
      const bySpecificity = compareSeverity(
        b.min_severity as SeverityLevel,
        a.min_severity as SeverityLevel,
      );
      if (bySpecificity !== 0) return bySpecificity;
      return (b.priority ?? 0) - (a.priority ?? 0);
    });
}
