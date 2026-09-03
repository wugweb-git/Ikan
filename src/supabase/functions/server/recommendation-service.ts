import * as kv from './kv_dual_write.ts';
import { 
  RecommendationRule, 
  RecommendationResult, 
  SeverityLevel 
} from './shared-types.ts';
import { EquipService } from './program-service.ts';

const generateId = () => crypto.randomUUID();

// ------------------------------------------------------------------
// RULE SERVICE
// ------------------------------------------------------------------

export const RecommendationRuleService = {
  async createRule(data: Omit<RecommendationRule, 'id' | 'created_at'>): Promise<RecommendationRule> {
    const id = generateId();
    const rule: RecommendationRule = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    await kv.set(`recommendation_rule:${id}`, rule);
    return rule;
  },

  async listRules(): Promise<RecommendationRule[]> {
    const all = await kv.getByPrefix('recommendation_rule:');
    return all.filter((r: any) => r);
  },

  async updateRule(id: string, updates: Partial<RecommendationRule>): Promise<RecommendationRule> {
    const existing = await kv.get(`recommendation_rule:${id}`);
    if (!existing) throw new Error('Rule not found');
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`recommendation_rule:${id}`, updated);
    return updated;
  },

  async deleteRule(id: string): Promise<void> {
    await kv.del(`recommendation_rule:${id}`);
  },

  async clearRules(): Promise<void> {
     // Helper for admin cleanup to avoid duplicates if needed
     const rules = await this.listRules();
     for (const r of rules) {
       await kv.del(`recommendation_rule:${r.id}`);
     }
  }
};

// ------------------------------------------------------------------
// RECOMMENDATION ENGINE
// ------------------------------------------------------------------

export const RecommendationService = {
  
  async getRecommendations(userId: string): Promise<RecommendationResult[]> {
    // Fixed 2026-08-06 — this function was live (called by Dashboard.tsx and
    // EquipProgramCompletion.tsx via GET /recommendations) but had returned
    // an empty list for every user since it was written, for three stacked
    // reasons: (1) it read `assessment_response_by_user:`, whose `severity`/
    // `interpretation` fields are null on every real record — severity
    // always fell through to the hardcoded 'low' default; (2) it matched
    // rules by `latestAssessments.get(rule.assessment_category)` where the
    // map was keyed by the raw `assessment_id` (e.g. `asm_1767...`), which
    // never equals a rule's `assessment_category` (e.g. "Anxiety") — the
    // category was never actually resolved; (3) even a matched equip's name
    // was read from `equip.name`, a field that doesn't exist on real equip
    // records (they use `title`). Fixed by reading real score/max_score from
    // `assessment_result:`, resolving category via each result's
    // `assessment_def.category` field, and computing severity from the
    // score percentage instead of trusting fields that are never populated.

    const results = await kv.getByPrefix(`assessment_result:${userId}:`);
    const realResults = (results || []).filter((r: any) =>
      r?.assessment_id &&
      !String(r.assessment_id).startsWith('checkin_') &&
      typeof r.score === 'number' &&
      typeof r.max_score === 'number' &&
      r.max_score > 0
    );
    if (realResults.length === 0) return [];

    const rules = await RecommendationRuleService.listRules();
    if (rules.length === 0) return [];

    // Resolve each result's category via its assessment definition — rules
    // key on assessment_category (e.g. "Anxiety"); assessment_def.category
    // is lowercase (e.g. "anxiety"), so match case-insensitively.
    const assessmentIds = [...new Set(realResults.map((r: any) => r.assessment_id))];
    const categoryByAssessmentId = new Map<string, string>();
    // Kept, not discarded: the band lookup below needs the same records, and
    // re-fetching them per rule would be a KV read per rule per user.
    const defByAssessmentId = new Map<string, any>();
    for (const id of assessmentIds) {
      const def = await kv.get(`assessment_def:${id}`);
      if (!def) continue;
      defByAssessmentId.set(id, def);
      if (def.category) categoryByAssessmentId.set(id, String(def.category).toLowerCase());
    }

    // Latest real result per category
    const sorted = [...realResults].sort((a: any, b: any) =>
      new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
    );
    const latestByCategory = new Map<string, any>();
    for (const r of sorted) {
      const category = categoryByAssessmentId.get(r.assessment_id);
      if (category && !latestByCategory.has(category)) {
        latestByCategory.set(category, r);
      }
    }

    // Evaluate Rules & Deduplicate (Highest Priority Wins)
    const candidateMap = new Map<string, { rec: RecommendationResult, priority: number }>();

    for (const rule of rules) {
        const assessment = latestByCategory.get(String(rule.assessment_category || '').toLowerCase());
        if (!assessment) continue;

        // Banded against the instrument's own profile. Null means the score
        // could not be placed, and an unplaced score matches nothing — it is
        // not evidence of a low severity.
        const userSeverity = await severityForResult(assessment, defByAssessmentId.get(assessment.assessment_id));
        if (!userSeverity) continue;

        const equipId = rule.target_id || rule.equip_id;
        if (!equipId) continue;

        if (compareSeverity(userSeverity, rule.min_severity) >= 0) {
            const existing = candidateMap.get(equipId);

            // If we already have a candidate for this equip, only replace if this rule is higher priority (lower val)
            if (existing && existing.priority <= rule.priority) {
                continue;
            }

            const equip = await EquipService.getEquip(equipId);
            if (!equip) continue;

            candidateMap.set(equipId, {
                rec: {
                    equip_id: equip.id,
                    equip_name: equip.title,
                    category: equip.category,
                    confidence: 'high',
                    reason: rule.rationale
                },
                priority: rule.priority
            });
        }
    }

    // Convert to array and sort by priority
    const finalRecs = Array.from(candidateMap.values())
        .sort((a, b) => a.priority - b.priority)
        .map(x => x.rec);

    return finalRecs;
  }
};

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

/**
 * Severity for a stored result, from the instrument's own band cut points.
 *
 * ## What this replaces, and why the old comment was wrong
 *
 * `severityFromScore` banded the raw percentage at fixed 25/50/75 thresholds.
 * Two things were broken:
 *
 * 1. **It was direction-blind.** Three live profiles are `higher_is_better`
 *    (`who5`, `ngse`, `brs`). A person scoring 90% on WHO-5 wellbeing came out
 *    `'high'` severity — the worst tier — for being well.
 * 2. **A percentage is not a cut point.** Sleep's own bands are 8-25 / 25-33 /
 *    33-40 on an 8-40 scale, so its "moderate" starts at 42% of range, not
 *    50%. Every instrument has its own edges, which is exactly what the bands
 *    are; a flat percentage overrides all seven with one guess.
 *
 * The comment above it claimed "Real assessment_result: records never carry
 * severity/interpretation". Measured 2026-09-03: all 104 carry
 * `interpretation.label`, but **89 of those are `Completed`, `Complete` or
 * `New Category`** — placeholders, not bands — and **0 of 104 carry a
 * `severity_ref` anywhere**. So the fields genuinely cannot be trusted, but
 * the conclusion drawn from that was wrong: the fix is not to invent a
 * severity from a percentage, it is to band the stored score against the
 * profile the assessment already declares.
 *
 * Returns null when the assessment declares no profile, the score falls in no
 * band, or the band names no severity. Null means **no rule matches**, which
 * is correct: General deliberately has no overall score (five independent
 * scales), so a single severity for it would be a fiction.
 */
async function severityForResult(result: any, def: any): Promise<SeverityLevel | null> {
    const profileId = def?.scoring_profile_id
        ?? (Array.isArray(def?.scores) && def.scores.length === 1 ? def.scores[0]?.profile_id : null);
    if (!profileId) return null;

    const profile = await kv.get(`scoring-profile:${profileId}`);
    const bands = Array.isArray(profile?.bands) ? profile.bands : [];
    if (bands.length === 0) return null;

    /**
     * Band the value the client computed, not the legacy raw sum.
     *
     * `section_scores.overall.value` is in the profile's own units. The
     * top-level `score` is a raw sum kept for the iKAN aggregate, and for a
     * `calc: mean` profile they are different quantities: the live Burnout
     * record holds `score: 60, max_score: 115` next to `overall.value:
     * 2.6087, max: 5`, against bands running 1-5. Banding 60 places it
     * nowhere and the user gets no recommendation; banding 2.6087 places it
     * in "Low", agreeing with what that record's own breakdown already says.
     */
    const overall = result?.section_scores?.overall ?? result?.sectionScores?.overall ?? null;
    const score = typeof overall?.value === 'number' ? overall.value : result?.score;
    if (typeof score !== 'number') return null;

    // Half-open [min, max) with the last band closed, matching the client's
    // `bandForValue`. A closed reader would put a value on a shared edge in
    // the lower band, which is the opposite of what the authoring means.
    for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        const min = typeof b?.min === 'number' ? b.min : -Infinity;
        const max = typeof b?.max === 'number' ? b.max : Infinity;
        const last = i === bands.length - 1;
        const hit = last ? score >= min && score <= max : score >= min && score < max;
        if (hit) return isSeverityLevel(b?.severity_ref) ? b.severity_ref : null;
    }

    /**
     * The score fell outside every band, which almost always means the stored
     * score and the profile's bands are in different units.
     *
     * Live example on 2026-09-03: Burnout results are stored as a raw sum
     * (60/115) while `bat-mean` bands are 1-5 means with decimal edges, so no
     * band can contain 60. That is a real data problem and it is logged rather
     * than papered over — banding a sum against a mean would produce a
     * confident, wrong severity, which is the failure this whole function was
     * rewritten to stop.
     */
    console.warn(
        `[recommendations] Score ${score} fell in no band of profile "${profileId}" ` +
        `(bands span ${bands[0]?.min}-${bands[bands.length - 1]?.max}). ` +
        `Likely a units mismatch between the stored score and the profile. No severity, so no rule matches.`
    );
    return null;
}

/**
 * The five-term clinical vocabulary, in order.
 *
 * This table used to hold four keys — `low`, `mild`, `moderate`, `high` — and
 * **five of the eighteen live rules are gated at `moderately-severe`**, which
 * was not one of them. `SEVERITY_RANK['moderately-severe']` was `undefined`,
 * so `compareSeverity` returned `NaN`, `NaN >= 0` is false, and those five
 * rules had never fired in production. `low` and `high` are response tiers,
 * not clinical severities; they moved to their own vocabulary on 2026-09-02
 * and should never have been ranked here alongside the other three.
 */
const SEVERITY_RANK: Record<SeverityLevel, number> = {
    'minimal': 1,
    'mild': 2,
    'moderate': 3,
    'moderately-severe': 4,
    'severe': 5,
};

export function isSeverityLevel(v: unknown): v is SeverityLevel {
    return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SEVERITY_RANK, v);
}

/**
 * Positive when the user's severity meets or exceeds the rule's threshold.
 *
 * An unrecognised term on either side means **no match**, rather than the
 * arithmetic silently producing `NaN`. A typo'd threshold now fails closed and
 * visibly, instead of quietly disabling a rule for four months.
 */
function compareSeverity(user: SeverityLevel, rule: SeverityLevel): number {
    if (!isSeverityLevel(user) || !isSeverityLevel(rule)) {
        console.warn(
            `[recommendations] Unrecognised severity in comparison: user="${user}", rule="${rule}". ` +
            `Valid terms are ${Object.keys(SEVERITY_RANK).join(', ')}. No match.`
        );
        return -1;
    }
    return SEVERITY_RANK[user] - SEVERITY_RANK[rule];
}