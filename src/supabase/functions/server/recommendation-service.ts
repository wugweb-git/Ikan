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
    for (const id of assessmentIds) {
      const def = await kv.get(`assessment_def:${id}`);
      if (def?.category) categoryByAssessmentId.set(id, String(def.category).toLowerCase());
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

        const userSeverity = severityFromScore(assessment.score, assessment.max_score);
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

// Real assessment_result: records never carry severity/interpretation, only
// score/max_score — derive a 4-tier severity from the raw percentage instead
// of trusting fields that are always null.
function severityFromScore(score: number, maxScore: number): SeverityLevel {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (pct <= 25) return 'low';
    if (pct <= 50) return 'mild';
    if (pct <= 75) return 'moderate';
    return 'high';
}

const SEVERITY_RANK = {
    'low': 1,
    'mild': 2,
    'moderate': 3,
    'high': 4
};

function compareSeverity(user: SeverityLevel, rule: SeverityLevel): number {
    return SEVERITY_RANK[user] - SEVERITY_RANK[rule];
}