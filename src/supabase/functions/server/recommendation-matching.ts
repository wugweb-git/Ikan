/**
 * Which recommendation rule wins, for a user at a given severity.
 *
 * **The single matching path for both engines.** The client
 * (`src/lib/recommendation-engine.ts`) and the server
 * (`./recommendation-service.ts`) each used to carry their own copy, and the
 * copies disagreed on the thing that matters most: the client ranks priority
 * DESCENDING (a bigger number is a stronger rule, which is how the 18 rows are
 * written), the server sorted ASCENDING and its own comment called the lower
 * number "higher priority". One field, two opposite meanings, both live.
 *
 * It lives under `server/` and not `src/lib/` for a deployment reason: the
 * edge function is shipped by `cp src/supabase/functions/server/*` into a
 * staging directory (BUILD.md), a flat non-recursive copy of this one folder.
 * A shared module anywhere else is simply absent at runtime, and the failure
 * is a resolution error inside a deployed function rather than a build error
 * here. The client reaches in the other way, which is already the established
 * direction — see `scoring-vocabulary.ts`.
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
// Imported with an explicit extension: required by Deno at runtime, and by
// Node's TypeScript stripping under `node --test`, which does not resolve
// extensionless relative specifiers.
//
// `scoring-engine` re-exports these, but it also pulls in modules that reach
// `api-client`, and an extensionless specifier anywhere in that chain makes the
// whole file unloadable by `node --test` (Node's TypeScript stripping does not
// resolve extensionless relative imports). `scoring-vocabulary` is
// dependency-free and is the single definition of the five-term ordering, so
// this is the shortest path to it and not a second copy.
import {
  compareSeverity, isSeverityLevel, type SeverityLevel,
} from './scoring-vocabulary.ts';

/** True when the user is at least as severe as the rule requires. */
export function severityMeetsThreshold(actual: string, minRequired: string): boolean {
  if (!isSeverityLevel(actual) || !isSeverityLevel(minRequired)) return false;
  return compareSeverity(actual, minRequired) >= 0;
}

export interface RankableRule {
  min_severity: string;
  priority: number;
}

export interface EligibleRule extends RankableRule {
  assessment_category?: string;
  enabled?: boolean;
  title?: string;
  body?: string;
  cta?: string;
}

/**
 * A rule with nothing to say must not match.
 *
 * The save path guards this too, but a row written any other way — a bulk
 * import, a direct KV write, or the 18 rows that predate the copy fields —
 * would still match and render a card with a blank heading and an unlabelled
 * button. `rationale` deliberately does NOT satisfy it: that field is the
 * author's internal note ("Awareness of overload"), and substituting it showed
 * a memo written to a clinician to the person who took the assessment.
 */
export function hasRenderableCopy(rule: EligibleRule): boolean {
  return !!(rule.title?.trim() && rule.body?.trim() && rule.cta?.trim());
}

/**
 * The rules that may be considered at all, before severity is looked at.
 *
 * `enabled` is honoured HERE rather than in each engine, which is the defect
 * this module exists to end: the client honoured it and the server did not, so
 * disabling all 18 rules silenced the results screen while `GET
 * /recommendations` — the dashboard and the programme-completion screen — went
 * on serving them.
 */
export function eligibleRules<T extends EligibleRule>(rules: T[], category: string): T[] {
  const key = category.trim().toLowerCase();
  if (!key) return [];
  return rules.filter(rule =>
    String(rule.assessment_category ?? '').trim().toLowerCase() === key &&
    rule.enabled !== false &&
    hasRenderableCopy(rule));
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


/**
 * The severity a recommendation rule matches on, for one completed assessment.
 *
 * `findMatchingAdminRules` returns `[]` at its null guard, so an assessment that
 * resolves no severity never reaches the rule table at all. Three of the seven
 * were in that state: depression, anxiety and general each run more than one
 * instrument, and only some of them declare a single headline score.
 *
 * ## Why General takes the worst of five rather than a nominated headline
 *
 * General runs GAD-2, PHQ-2, WHO-5, NGSE and BRS — two distress screens, a
 * wellbeing index and two strengths measures. It is the triage instrument:
 * someone picks it precisely because they do not know which domain is the
 * problem. Nominating any one of the five as primary goes blind to the other
 * four, so a healthy WHO-5 sitting beside a positive PHQ-2 would read as
 * "fine". The worst domain is the one worth acting on.
 *
 * **Direction needs no special case.** A band's `severity_ref` already encodes
 * it: `who5`'s "Poor" band is `moderately-severe` and its "Good" band is
 * `minimal`, so a low wellbeing score contributes a high severity on its own.
 * Taking the maximum works identically for higher-is-distress and
 * higher-is-better scales.
 *
 * All-minimal returns `minimal`, which matches no rule — correct, not a gap.
 * No section carrying a placeable band returns null, and null means no
 * recommendation rather than a guessed one.
 */
export function severityForMatching(sectionScores: {
  overall?: { band?: { severity_ref?: unknown } | null } | null;
  sections?: { band?: { severity_ref?: unknown } | null }[] | null;
} | null | undefined): SeverityLevel | null {
  const overall = sectionScores?.overall?.band?.severity_ref;
  if (isSeverityLevel(overall)) return overall;

  const refs = (Array.isArray(sectionScores?.sections) ? sectionScores.sections : [])
    .map(s => s?.band?.severity_ref)
    .filter(isSeverityLevel);
  if (refs.length === 0) return null;

  return refs.reduce((worst, r) => (compareSeverity(r, worst) > 0 ? r : worst));
}
