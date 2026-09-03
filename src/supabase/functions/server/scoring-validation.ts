/**
 * Server-side validation for scoring profiles (v2).
 *
 * ⚠ This file deliberately duplicates the vocabulary and tiling rules from
 * `src/lib/scoring-engine.ts`. It cannot import them: the edge function is
 * deployed by flat-copying only `src/supabase/functions/server/*` into a
 * staging directory (see BUILD.md), so any import that reaches outside this
 * directory breaks the deploy.
 *
 * The duplication is guarded — `scratchpad/verify-scoring.ts` asserts the two
 * vocabularies are identical. If you change SEVERITY_LEVELS, RESPONSE_TIERS or
 * DEFAULT_TIER_MAP here, change them there in the same commit.
 *
 * Validation runs on the server because the admin UI is not the only writer:
 * a restored backup or a direct KV write would otherwise install a profile
 * whose bands overlap, and overlap makes the resulting severity depend on
 * which band the lookup loop happens to reach first.
 */

export const SEVERITY_LEVELS = [
  "minimal",
  "mild",
  "moderate",
  "moderately-severe",
  "severe",
] as const;

export const RESPONSE_TIERS = ["low", "moderate", "high"] as const;

export const DEFAULT_TIER_MAP: Record<string, string> = {
  minimal: "low",
  mild: "low",
  moderate: "moderate",
  "moderately-severe": "high",
  severe: "high",
};

const CALCS = ["sum", "mean", "sum_times_k", "from_scores"] as const;
const DIRECTIONS = ["higher_is_distress", "higher_is_better"] as const;
const BASES = ["percent", "absolute"] as const;
const TONES = ["success", "warning", "error"] as const;
const ON_MISSING = ["prorate", "zero", "invalidate"] as const;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Validate a scoring profile.
 *
 * Band tiling is checked against the profile's own declared basis. For
 * `percent` the target is 0-100 and can be checked here; for `absolute` the
 * achievable range depends on the assessment's items and scales, which the
 * profile does not know — so absolute band sets are checked for internal
 * consistency (ordering, overlap, zero-width) and the floor/ceiling match is
 * left to the coverage meter, which does know the range.
 */
export function validateScoringProfile(profile: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile || typeof profile !== "object") {
    return { ok: false, errors: ["Profile must be an object."], warnings };
  }
  if (!profile.id || typeof profile.id !== "string") {
    errors.push("Profile requires a string id.");
  }
  if (!profile.name || typeof profile.name !== "string") {
    errors.push("Profile requires a name.");
  }

  if (!CALCS.includes(profile.calc)) {
    errors.push(
      `calc must be one of ${CALCS.join(", ")} (got ${JSON.stringify(profile.calc)}). ` +
        `v1's "average" is now "mean"; "weighted" and "custom" are retired — ` +
        `weight is a per-item property, and "custom" was a trapdoor.`,
    );
  }
  if (profile.calc === "sum_times_k" && !isNum(profile.k)) {
    errors.push('calc "sum_times_k" requires a numeric k (WHO-5 uses 4).');
  }
  if (profile.calc !== "sum_times_k" && profile.k !== undefined) {
    warnings.push(`k is ignored for calc "${profile.calc}".`);
  }

  if (!DIRECTIONS.includes(profile.direction)) {
    errors.push(`direction must be one of ${DIRECTIONS.join(", ")}.`);
  }
  if (!BASES.includes(profile.band_basis)) {
    errors.push(`band_basis must be one of ${BASES.join(", ")}.`);
  }

  if (profile.normalize_to_100 !== undefined) {
    errors.push(
      "normalize_to_100 is removed in v2 — it conflated two jobs. Use " +
        'calc "sum_times_k" with an explicit k, or band_basis "percent".',
    );
  }
  if (profile.severity_bands !== undefined) {
    errors.push('severity_bands is renamed to bands, and each band now requires id and severity_ref.');
  }
  if (profile.offset !== undefined) {
    errors.push(
      "offset is removed in v2. It existed only to undo index-based option " +
        "scoring; state the option values explicitly on the scale instead.",
    );
  }

  const missing = profile.missing;
  if (!missing || typeof missing !== "object") {
    errors.push("missing policy is required: { min_answered, on_missing }.");
  } else {
    if (!isNum(missing.min_answered) || missing.min_answered < 0) {
      errors.push("missing.min_answered must be a non-negative number.");
    }
    if (!ON_MISSING.includes(missing.on_missing)) {
      errors.push(`missing.on_missing must be one of ${ON_MISSING.join(", ")}.`);
    }
  }

  if (profile.tier_map && typeof profile.tier_map === "object") {
    for (const [k, v] of Object.entries(profile.tier_map)) {
      if (!SEVERITY_LEVELS.includes(k as any)) {
        errors.push(`tier_map key "${k}" is not a severity level.`);
      }
      if (!RESPONSE_TIERS.includes(v as any)) {
        errors.push(`tier_map["${k}"] = "${v}" is not a response tier.`);
      }
    }
  }

  // ── Bands ────────────────────────────────────────────────────────────────
  const bands = profile.bands;
  if (!Array.isArray(bands) || bands.length === 0) {
    errors.push("Profile requires at least one band.");
    return { ok: errors.length === 0, errors, warnings };
  }

  const seenIds = new Set<string>();
  bands.forEach((b: any, i: number) => {
    const where = `bands[${i}]`;
    if (!b || typeof b !== "object") {
      errors.push(`${where} must be an object.`);
      return;
    }
    if (!b.id || typeof b.id !== "string") {
      errors.push(`${where} requires a stable id (minted once, not derived from the label).`);
    } else if (seenIds.has(b.id)) {
      errors.push(`${where} duplicates band id "${b.id}".`);
    } else {
      seenIds.add(b.id);
    }
    if (!b.label || typeof b.label !== "string") {
      errors.push(`${where} requires a label.`);
    }
    if (!SEVERITY_LEVELS.includes(b.severity_ref)) {
      errors.push(
        `${where}.severity_ref must be one of ${SEVERITY_LEVELS.join(", ")} ` +
          `(got ${JSON.stringify(b.severity_ref)}). The user-facing label and the ` +
          `clinical term are separate fields — "Poor Sleep" is a label, not a severity.`,
      );
    }
    if (!TONES.includes(b.tone)) {
      errors.push(`${where}.tone must be one of ${TONES.join(", ")}.`);
    }
    if (!isNum(b.min) || !isNum(b.max)) {
      errors.push(`${where} requires numeric min and max.`);
      return;
    }
    if (b.max < b.min) {
      errors.push(`${where} "${b.label}" ends (${b.max}) before it starts (${b.min}).`);
    } else if (b.max === b.min) {
      errors.push(
        `${where} "${b.label}" is zero-width at ${b.min}. Bands are half-open ` +
          `[min, max), so no score can ever fall inside it.`,
      );
    }
    if (profile.band_basis === "percent" && (b.min < 0 || b.max > 100)) {
      errors.push(`${where} percent edges must lie within 0-100.`);
    }
  });

  const ordered = bands
    .filter((b: any) => isNum(b?.min) && isNum(b?.max))
    .slice()
    .sort((a: any, b: any) => a.min - b.min);

  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1];
    const cur = ordered[i];
    if (cur.min < prev.max) {
      errors.push(
        `Bands "${prev.label}" and "${cur.label}" both claim ${cur.min}-${prev.max}. ` +
          `Overlap makes the result depend on lookup order.`,
      );
    } else if (cur.min > prev.max) {
      warnings.push(`${prev.max}-${cur.min} uncovered between "${prev.label}" and "${cur.label}".`);
    }
  }

  if (profile.band_basis === "percent" && ordered.length > 0) {
    if (ordered[0].min !== 0) warnings.push(`0-${ordered[0].min}% uncovered at the floor.`);
    const last = ordered[ordered.length - 1];
    if (last.max !== 100) warnings.push(`${last.max}-100% uncovered at the ceiling.`);
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Project half-open v2 bands down to the closed intervals the legacy
 * `scoring.ranges` reader expects.
 *
 *     [a, b)  ->  [a, b-1]   every band except the last
 *     [a, b]  ->  [a, b]     the last band keeps its ceiling
 *
 * This is the one conversion rule every legacy band set in this product needs,
 * because they were all authored closed. Stated once here rather than
 * re-derived per assessment.
 *
 * Returns null for non-integer edges: a closed reader takes the first matching
 * band, so a value sitting exactly on a decimal boundary would resolve to the
 * lower band — the opposite of what half-open asserts. Better no projection
 * than one that is wrong at a point.
 */
export function projectBandsToClosedRanges(bands: any[]): any[] | null {
  if (!Array.isArray(bands) || bands.length === 0) return null;
  const sorted = [...bands].sort((a, b) => a.min - b.min);
  if (!sorted.every((b) => Number.isInteger(b.min) && Number.isInteger(b.max))) return null;

  return sorted.map((b, i) => ({
    min: b.min,
    max: i === sorted.length - 1 ? b.max : b.max - 1,
    label: b.label,
    interpretation: b.interpretation || b.label,
    icon: b.tone === "success" ? "success" : b.tone === "error" ? "error" : "warning",
  }));
}

export interface ImmutabilityResult {
  ok: boolean;
  errors: string[];
  /** Ids retired by this save, to be merged into `retired_question_ids`. */
  newlyRetired: string[];
}

/**
 * Guardrail 11 — question-id immutability.
 *
 * Once any **saved** scoring spec references a `question.id`, that id is
 * immutable for the life of the assessment. Content stays mutable; identity
 * does not. Editing text, changing options or `scale_ref`, toggling
 * `is_scored` / `is_risk_indicator`, and reordering are all allowed —
 * reordering because after the id rename an id is a name, not a slot.
 *
 * Enforced at the **assessment save**, not the spec save, because that is where
 * an id can actually disappear. A draft that has never been saved references
 * nothing and is unaffected.
 *
 * The escape hatch is **retire, don't delete**: drop the id from every score
 * and list it in `retired_question_ids`. It then stays in the ledger forever
 * and can never be reused, so the stored responses keyed to it keep resolving.
 */
export function validateQuestionIdImmutability(existing: any, incoming: any): ImmutabilityResult {
  const errors: string[] = [];

  const idsOf = (a: any): string[] =>
    (Array.isArray(a?.questions) ? a.questions : [])
      .map((q: any) => q?.id).filter((x: any) => typeof x === "string");

  // question id -> the score labels referencing it
  const refsOf = (a: any): Map<string, string[]> => {
    const m = new Map<string, string[]>();
    for (const sc of Array.isArray(a?.scores) ? a.scores : []) {
      for (const item of Array.isArray(sc?.items) ? sc.items : []) {
        const qid = item?.question_id;
        if (typeof qid !== "string") continue;
        const list = m.get(qid) ?? [];
        list.push(sc?.label || sc?.id || "(unnamed score)");
        m.set(qid, list);
      }
    }
    return m;
  };

  const existingIds = new Set(idsOf(existing));
  const incomingIds = idsOf(incoming);
  const incomingIdSet = new Set(incomingIds);
  const existingRefs = refsOf(existing);
  const incomingRefs = refsOf(incoming);
  const alreadyRetired: string[] = Array.isArray(existing?.retired_question_ids)
    ? existing.retired_question_ids : [];
  const declaredRetired: string[] = Array.isArray(incoming?.retired_question_ids)
    ? incoming.retired_question_ids : [];

  // A duplicate id makes "which question is this" unanswerable.
  const seen = new Set<string>();
  for (const id of incomingIds) {
    if (seen.has(id)) errors.push(`Duplicate question id "${id}".`);
    seen.add(id);
  }

  // 1. An id that a saved score references may not vanish. A rename shows up
  //    here too: the old id disappears while a new one appears.
  for (const [qid, scores] of existingRefs) {
    if (incomingIdSet.has(qid)) continue;
    const beingRetired = declaredRetired.includes(qid) && !incomingRefs.has(qid);
    if (!beingRetired) {
      errors.push(
        `"${qid}" is referenced by score${scores.length === 1 ? "" : "s"} ` +
        `${scores.map((l) => `"${l}"`).join(", ")}. Retire it instead, or remove it ` +
        `from those scores first.`,
      );
    }
  }

  // 2. A retired id is never reusable — the responses keyed to it still resolve.
  for (const id of incomingIds) {
    if (alreadyRetired.includes(id)) {
      errors.push(`"${id}" was retired and cannot be reused as a question id.`);
    }
  }

  // 3. A score pointing at an id that is not in the question list is a broken
  //    reference. It renders as invalid rather than scoring the item as zero.
  for (const [qid, scores] of incomingRefs) {
    if (!incomingIdSet.has(qid)) {
      errors.push(
        `Score${scores.length === 1 ? "" : "s"} ${scores.map((l) => `"${l}"`).join(", ")} ` +
        `reference${scores.length === 1 ? "s" : ""} unknown question "${qid}".`,
      );
    }
  }

  const newlyRetired = declaredRetired
    .filter((id) => existingIds.has(id) && !alreadyRetired.includes(id));

  return { ok: errors.length === 0, errors, newlyRetired };
}

/**
 * Structural validation of an assessment's `scores[]`.
 *
 * `POST /admin/assessments` spreads its payload with no whitelist, so without
 * this the only check on a spec is the wizard's client-side gate — a direct
 * write could install a score with no profile, no items, or a duplicate id.
 *
 * `knownProfileIds` is passed in rather than looked up here so this stays pure;
 * pass null to skip the reference check.
 */
export function validateAssessmentScores(
  scores: any,
  knownProfileIds: Set<string> | null,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (scores === undefined || scores === null) return { ok: true, errors, warnings };
  if (!Array.isArray(scores)) {
    return { ok: false, errors: ["scores must be an array."], warnings };
  }

  const seen = new Set<string>();
  scores.forEach((sc: any, i: number) => {
    const where = `scores[${i}]`;
    if (!sc || typeof sc !== "object") { errors.push(`${where} must be an object.`); return; }
    if (!sc.id || typeof sc.id !== "string") errors.push(`${where} requires a string id.`);
    else if (seen.has(sc.id)) errors.push(`${where} duplicates score id "${sc.id}".`);
    else seen.add(sc.id);

    if (!sc.label || typeof sc.label !== "string") errors.push(`${where} requires a label.`);
    if (!sc.profile_id || typeof sc.profile_id !== "string") {
      errors.push(`${where} requires a profile_id — a score has no calc, direction or bands of its own.`);
    } else if (knownProfileIds && !knownProfileIds.has(sc.profile_id)) {
      errors.push(`${where} references unknown scoring profile "${sc.profile_id}".`);
    }

    const hasItems = Array.isArray(sc.items) && sc.items.length > 0;
    const hasFrom = Array.isArray(sc.from_scores) && sc.from_scores.length > 0;
    if (!hasItems && !hasFrom) {
      errors.push(`${where} has neither items nor from_scores, so it can never produce a value.`);
    }
    if (hasItems && hasFrom) {
      errors.push(`${where} declares both items and from_scores; a score is one or the other.`);
    }

    for (const [j, item] of (Array.isArray(sc.items) ? sc.items : []).entries()) {
      if (!item || typeof item.question_id !== "string" || !item.question_id) {
        errors.push(`${where}.items[${j}] requires a question_id.`);
      }
      if (item?.weight !== undefined && !Number.isFinite(item.weight)) {
        errors.push(`${where}.items[${j}].weight must be numeric.`);
      }
      if (item?.reverse !== undefined && typeof item.reverse !== "boolean") {
        errors.push(`${where}.items[${j}].reverse must be a boolean.`);
      }
    }

    for (const memberId of (Array.isArray(sc.from_scores) ? sc.from_scores : [])) {
      if (typeof memberId !== "string" || !scores.some((o: any) => o?.id === memberId)) {
        errors.push(`${where} composes "${memberId}", which is not a score on this assessment.`);
      }
      if (memberId === sc.id) errors.push(`${where} composes itself.`);
    }
  });

  return { ok: errors.length === 0, errors, warnings };
}

export interface TextChange {
  question_id: string;
  from: string;
  to: string;
}

/**
 * Question texts that differ between the saved record and an incoming save.
 *
 * Guardrail 11 protects **identity**: an id referenced by a score cannot be
 * renamed or deleted. It deliberately permits content edits, and it walks both
 * question sets to do that — then discards the diff. That gap is exactly the
 * `burnout-q9` failure: its id survived and only its text changed, so every
 * guard passed while the original wording was lost. Recovering it meant tracing
 * six backups across two representations, because nothing had written down what
 * the question used to say.
 *
 * This does not block anything. Text must stay editable. It exists so the
 * change is *recorded*.
 */
export function diffQuestionText(existing: any, incoming: any): TextChange[] {
  const before = new Map<string, string>();
  for (const q of Array.isArray(existing?.questions) ? existing.questions : []) {
    if (q?.id) before.set(q.id, String(q.text ?? ""));
  }

  const changes: TextChange[] = [];
  for (const q of Array.isArray(incoming?.questions) ? incoming.questions : []) {
    if (!q?.id || !before.has(q.id)) continue; // a new question has no prior text
    const from = before.get(q.id)!;
    const to = String(q.text ?? "");
    if (from !== to) changes.push({ question_id: q.id, from, to });
  }
  return changes;
}

/**
 * Append each text change to its question's `text_history`.
 *
 * Additive and schema-free: an array of `{from, to, at, by}` on the question
 * itself. It turns "what did this question used to say" from an archaeology
 * exercise across backups into a field lookup. Capped so a record cannot grow
 * without bound; the oldest entries drop first, and the backups remain the
 * long-tail record.
 *
 * Returns a new questions array — the caller decides whether to use it.
 */
export function applyTextHistory(
  questions: any[],
  changes: TextChange[],
  actor: string,
  cap = 20,
): any[] {
  if (!Array.isArray(questions) || changes.length === 0) return questions;
  const byId = new Map(changes.map((c) => [c.question_id, c]));

  return questions.map((q: any) => {
    const change = q?.id ? byId.get(q.id) : undefined;
    if (!change) return q;
    const prior = Array.isArray(q.text_history) ? q.text_history : [];
    return {
      ...q,
      text_history: [
        ...prior,
        { from: change.from, to: change.to, at: new Date().toISOString(), by: actor },
      ].slice(-cap),
    };
  });
}
