import * as kv from './kv_store.tsx';
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
     // Helper for seeding/migration to avoid duplicates if needed
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
    // 1. Fetch User Assessments
    // We fetch all responses for the user
    const responses = await kv.getByPrefix(`assessment_response_by_user:${userId}`);
    if (!responses || responses.length === 0) {
      return [];
    }

    // 2. Fetch All Rules
    const rules = await RecommendationRuleService.listRules();
    if (rules.length === 0) return [];

    // 3. Process Assessments (Latest per category)
    const latestAssessments = new Map<string, any>(); // category -> assessment
    
    // Sort by date desc
    const sortedResponses = responses.sort((a: any, b: any) => 
      new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime()
    );

    for (const resp of sortedResponses) {
        // Infer category from assessment_id (slug) or explicit field
        const category = resp.assessment_id; 
        
        if (!latestAssessments.has(category)) {
            latestAssessments.set(category, resp);
        }
    }

    // 4. Evaluate Rules & Deduplicate (Highest Priority Wins)
    const candidateMap = new Map<string, { rec: RecommendationResult, priority: number }>();

    for (const rule of rules) {
        const assessment = latestAssessments.get(rule.assessment_category);
        if (!assessment) continue;

        const userSeverity = normalizeSeverity(assessment);
        
        if (compareSeverity(userSeverity, rule.min_severity) >= 0) {
            const existing = candidateMap.get(rule.equip_id);
            
            // If we already have a candidate for this equip, only replace if this rule is higher priority (lower val)
            if (existing && existing.priority <= rule.priority) {
                continue; 
            }

            // Fetch equip details
            const equip = await EquipService.getEquip(rule.equip_id);
            if (!equip) continue;

            candidateMap.set(rule.equip_id, {
                rec: {
                    equip_id: equip.id,
                    equip_name: equip.name,
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

function normalizeSeverity(assessment: any): SeverityLevel {
    // 1. Check explicit severity field
    if (assessment.severity) {
        const s = assessment.severity.toLowerCase();
        if (['low', 'mild', 'moderate', 'high'].includes(s)) return s as SeverityLevel;
    }

    // 2. Check interpretation label
    if (assessment.interpretation) {
        const label = typeof assessment.interpretation === 'string' 
            ? assessment.interpretation 
            : assessment.interpretation.label;
        
        if (label) {
            const l = label.toLowerCase();
            if (l.includes('severe') || l.includes('high')) return 'high';
            if (l.includes('moderate')) return 'moderate';
            if (l.includes('mild')) return 'mild';
            if (l.includes('low') || l.includes('minimal') || l.includes('none')) return 'low';
        }
    }

    // 3. Fallback
    return 'low';
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
