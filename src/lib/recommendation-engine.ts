// Recommendation Engine — loads rules from backend KV (admin-configured),
// falls back to built-in defaults only when no admin rules exist.

import { apiClient } from './api-client';

export type SeverityLevel = 'low' | 'moderate' | 'high';

// Extended severity mapping from scoring profiles
export type ExtendedSeverityLevel = 'minimal' | 'low' | 'mild' | 'moderate' | 'moderately-severe' | 'high' | 'severe';

/** Map extended severity → engine's 3-tier severity for rule matching */
function normalizeToEngineSeverity(extended: string): SeverityLevel {
  switch (extended) {
    case 'minimal':
    case 'low':
      return 'low';
    case 'mild':
    case 'moderate':
      return 'moderate';
    case 'moderately-severe':
    case 'high':
    case 'severe':
      return 'high';
    default:
      return 'moderate';
  }
}

export interface SeverityBand {
  key: SeverityLevel;
  min: number;
  max: number;
}

// Built-in defaults — used ONLY as fallback when no KV rules exist
const DEFAULT_SEVERITY_BANDS: SeverityBand[] = [
  { key: 'low', min: 0, max: 30 },
  { key: 'moderate', min: 31, max: 60 },
  { key: 'high', min: 61, max: 100 }
];

export interface RecommendationRule {
  if: { severity: SeverityLevel };
  recommend: {
    primary: string[];
    equipIds?: string[];
    secondary: string[];
    message: string;
  };
}

const DEFAULT_RECOMMENDATION_RULES: Record<SeverityLevel, RecommendationRule> = {
  low: {
    if: { severity: 'low' },
    recommend: {
      primary: [],
      secondary: ['resources', 'trackers'],
      message: "You're doing relatively well. A few small habits and regular check-ins can help you stay balanced."
    }
  },
  moderate: {
    if: { severity: 'moderate' },
    recommend: {
      primary: ['equip_program'],
      equipIds: ['stress', 'sleep-tight'],
      secondary: ['trackers', 'journaling'],
      message: "Some areas need attention. A short guided program can help you regain balance."
    }
  },
  high: {
    if: { severity: 'high' },
    recommend: {
      primary: ['equip_program'],
      equipIds: ['burnout', 'stress'],
      secondary: ['professional_support'],
      message: "Your responses suggest significant distress. Structured support and professional help are strongly recommended."
    }
  }
};

const DEFAULT_OVERLAP_MAP: Record<string, string[]> = {
  "sleep": ["stress"],
  "stress": ["sleep", "burnout"],
  "burnout": ["stress", "sleep"]
};

export interface EscalationRule {
  if: {
    assessment: string;
    severity: SeverityLevel;
  };
  alsoRecommend: string[];
}

const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    if: { assessment: 'sleep', severity: 'high' },
    alsoRecommend: ['stress']
  },
  {
    if: { assessment: 'stress', severity: 'high' },
    alsoRecommend: ['burnout', 'sleep']
  }
];

// ══════════════════════════════════════════════════════════════════
// CACHED ENGINE CONFIG — fetched from backend on first use
// ══════════════════════════════════════════════════════════════════

interface EngineConfig {
  rules: Record<SeverityLevel, RecommendationRule>;
  overlapMap: Record<string, string[]>;
  escalationRules: EscalationRule[];
  severityBands: SeverityBand[];
  loadedFromBackend: boolean;
}

let _cachedConfig: EngineConfig | null = null;
let _configLoadPromise: Promise<EngineConfig> | null = null;

/**
 * Load engine config from backend KV rules.
 * Maps admin-configured rules (recommendation_rule:*) to severity-based lookup.
 * Falls back to built-in defaults if backend returns empty/error.
 */
async function loadEngineConfig(): Promise<EngineConfig> {
  if (_cachedConfig) return _cachedConfig;

  // Prevent duplicate concurrent loads
  if (_configLoadPromise) return _configLoadPromise;

  _configLoadPromise = (async () => {
    try {
      const res = await apiClient.request('/recommendations/engine-config', { method: 'GET' }, false);
      const backendRules = res?.rules || [];

      if (Array.isArray(backendRules) && backendRules.length > 0) {
        // Convert backend rules array to severity-keyed lookup
        const rulesMap: Record<SeverityLevel, RecommendationRule> = { ...DEFAULT_RECOMMENDATION_RULES };
        const overlapMap: Record<string, string[]> = { ...DEFAULT_OVERLAP_MAP };
        const escalationRules: EscalationRule[] = [...DEFAULT_ESCALATION_RULES];
        const severityBands: SeverityBand[] = [...DEFAULT_SEVERITY_BANDS];

        for (const rule of backendRules) {
          // Admin rules may have various shapes — adapt to our interface
          if (rule.severity && rule.message) {
            const severity = rule.severity as SeverityLevel;
            rulesMap[severity] = {
              if: { severity },
              recommend: {
                primary: rule.primary_actions || rule.primary || rulesMap[severity]?.recommend.primary || [],
                equipIds: rule.equip_ids || rule.equipIds || rulesMap[severity]?.recommend.equipIds,
                secondary: rule.secondary_actions || rule.secondary || rulesMap[severity]?.recommend.secondary || [],
                message: rule.message || rulesMap[severity]?.recommend.message || '',
              }
            };
          }

          // Severity bands override
          if (rule.severity_bands && Array.isArray(rule.severity_bands)) {
            severityBands.length = 0;
            severityBands.push(...rule.severity_bands);
          }

          // Overlap map override
          if (rule.overlap_map && typeof rule.overlap_map === 'object') {
            Object.assign(overlapMap, rule.overlap_map);
          }

          // Escalation rules override
          if (rule.escalation_rules && Array.isArray(rule.escalation_rules)) {
            escalationRules.length = 0;
            escalationRules.push(...rule.escalation_rules);
          }
        }

        _cachedConfig = { rules: rulesMap, overlapMap, escalationRules, severityBands, loadedFromBackend: true };
        console.log(`[RecommendationEngine] Loaded ${backendRules.length} rules from backend KV`);
      } else {
        // No admin rules configured — use defaults
        _cachedConfig = {
          rules: DEFAULT_RECOMMENDATION_RULES,
          overlapMap: DEFAULT_OVERLAP_MAP,
          escalationRules: DEFAULT_ESCALATION_RULES,
          severityBands: DEFAULT_SEVERITY_BANDS,
          loadedFromBackend: false,
        };
        console.log('[RecommendationEngine] No backend rules found, using built-in defaults');
      }
    } catch (err) {
      console.warn('[RecommendationEngine] Failed to load backend rules, using defaults:', err);
      _cachedConfig = {
        rules: DEFAULT_RECOMMENDATION_RULES,
        overlapMap: DEFAULT_OVERLAP_MAP,
        escalationRules: DEFAULT_ESCALATION_RULES,
        severityBands: DEFAULT_SEVERITY_BANDS,
        loadedFromBackend: false,
      };
    }
    _configLoadPromise = null;
    return _cachedConfig;
  })();

  return _configLoadPromise;
}

/** Clear cached config (call after admin saves new rules) */
export function clearEngineConfigCache(): void {
  _cachedConfig = null;
  _configLoadPromise = null;
}

/** Pre-warm the engine cache (call on app init) */
export async function initEngineConfig(): Promise<void> {
  await loadEngineConfig();
}

// ══════════════════════════════════════════════════════════════════
// ADMIN RULES INTEGRATION
// Admin-configured rules from RecommendationRulesManager (KV).
// These map assessment_category + min_severity → target content.
// ══════════════════════════════════════════════════════════════════

interface AdminRule {
  id: string;
  assessment_category: string;
  min_severity: string;
  recommendation_type: 'equip' | 'resource' | 'assessment';
  target_id: string;
  priority: number;
  rationale: string;
}

let _adminRulesCache: AdminRule[] | null = null;

/** Load admin-configured recommendation rules for rule matching */
export async function loadAdminRules(): Promise<void> {
  try {
    const data = await apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0).catch(() => null);
    if (data?.rules && Array.isArray(data.rules)) {
      _adminRulesCache = data.rules.map((r: any) => ({
        id: r.id,
        assessment_category: r.assessment_category || '',
        min_severity: r.min_severity || 'moderate',
        recommendation_type: r.recommendation_type || 'equip',
        target_id: r.target_id || r.equip_id || '',
        priority: r.priority || 10,
        rationale: r.rationale || '',
      }));
      console.log(`[RecommendationEngine] Loaded ${_adminRulesCache.length} admin rules`);
    }
  } catch {
    // Admin rules not available
  }
}

/** Severity ordering for comparison */
const SEVERITY_ORDER: Record<string, number> = {
  'minimal': 0, 'low': 1, 'mild': 2, 'moderate': 3,
  'moderately-severe': 4, 'high': 5, 'severe': 6,
};

/** Check if actual severity meets or exceeds the rule's min_severity threshold */
function severityMeetsThreshold(actual: string, minRequired: string): boolean {
  const actualOrder = SEVERITY_ORDER[actual] ?? 3;
  const requiredOrder = SEVERITY_ORDER[minRequired] ?? 3;
  return actualOrder >= requiredOrder;
}

/** Find admin rules matching a category and severity */
function findMatchingAdminRules(category: string, severity: SeverityLevel): AdminRule[] {
  if (!_adminRulesCache || _adminRulesCache.length === 0) return [];
  const normalizedSeverity = severity as string;
  return _adminRulesCache
    .filter(rule =>
      rule.assessment_category === category &&
      severityMeetsThreshold(normalizedSeverity, rule.min_severity)
    )
    .sort((a, b) => a.priority - b.priority);
}

// ══════════════════════════════════════════════════════════════════
// SCORING PROFILE INTEGRATION
// When an assessment has a linked scoring_profile_id, use that
// profile's severity bands instead of the default percentage bands.
// ══════════════════════════════════════════════════════════════════

interface ScoringProfileBand {
  label: string;
  min: number;
  max: number;
  color?: string;
  description?: string;
}

interface ScoringProfile {
  id: string;
  method: string;
  severity_bands: ScoringProfileBand[];
  normalize_to_100?: boolean;
}

let _scoringProfilesCache: Record<string, ScoringProfile> | null = null;

/** Pre-load scoring profiles from backend for score→severity mapping */
export async function loadScoringProfiles(): Promise<void> {
  try {
    const data = await apiClient.request('/admin/scoring-profiles', { method: 'GET' }, true, 0).catch(() => null);
    if (data?.profiles && Array.isArray(data.profiles)) {
      _scoringProfilesCache = {};
      for (const profile of data.profiles) {
        _scoringProfilesCache[profile.id] = profile;
      }
    }
  } catch {
    // Scoring profiles not available — use default percentage bands
  }
}

/** Get severity from a scoring profile's bands (raw score, not percentage) */
export function getSeverityFromProfile(score: number, profileId: string): SeverityLevel {
  if (!_scoringProfilesCache || !_scoringProfilesCache[profileId]) {
    // Fallback to percentage-based
    return getSeverity(score, 100);
  }
  const profile = _scoringProfilesCache[profileId];
  for (const band of profile.severity_bands) {
    if (score >= band.min && score <= band.max) {
      return normalizeToEngineSeverity(band.label.toLowerCase().replace(/\s+/g, '-'));
    }
  }
  // Fallback: if score exceeds all bands, treat as highest severity
  return 'high';
}

/** Get the detailed severity band info from a scoring profile */
export function getSeverityBandFromProfile(score: number, profileId: string): ScoringProfileBand | null {
  if (!_scoringProfilesCache || !_scoringProfilesCache[profileId]) return null;
  const profile = _scoringProfilesCache[profileId];
  return profile.severity_bands.find(band => score >= band.min && score <= band.max) || null;
}

// ══════════════════════════════════════════════════════════════════
// EXPORTS — kept identical for backward compat
// ══════════════════════════════════════════════════════════════════

// These are re-exported for consumers that import them directly,
// but the engine itself uses the cached/loaded versions.
export const SEVERITY_BANDS = DEFAULT_SEVERITY_BANDS;
export const RECOMMENDATION_RULES = DEFAULT_RECOMMENDATION_RULES;
export const OVERLAP_MAP = DEFAULT_OVERLAP_MAP;
export const ESCALATION_RULES = DEFAULT_ESCALATION_RULES;

// Helper to determine severity
export function getSeverity(score: number, maxScore: number): SeverityLevel {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  // Use cached bands if available
  const bands = _cachedConfig?.severityBands || DEFAULT_SEVERITY_BANDS;
  for (const band of bands) {
    if (percentage >= band.min && percentage <= band.max) return band.key;
  }
  
  if (percentage <= 30) return 'low';
  if (percentage <= 60) return 'moderate';
  return 'high';
}

// Result Interface
export interface EngineResult {
  severity: SeverityLevel;
  assessmentSlug?: string;
  assessmentName?: string;
  score?: number;
  maxScore?: number;
  primaryAction: {
    type: 'equip_program' | 'none';
    programId?: string;
    title: string;
    body: string;
    cta: string;
  };
  secondaryActions: {
    type: string;
    title: string;
    label?: string;
    route?: string;
  }[];
  severityMessage: string;
  showProfessionalSupportNote: boolean;
}

// Main Evaluation Function — uses cached config from backend
export function evaluateAssessment(assessmentSlug: string, score: number, maxScore: number, scoringProfileId?: string): EngineResult {
  const config = _cachedConfig || {
    rules: DEFAULT_RECOMMENDATION_RULES,
    overlapMap: DEFAULT_OVERLAP_MAP,
    escalationRules: DEFAULT_ESCALATION_RULES,
    severityBands: DEFAULT_SEVERITY_BANDS,
    loadedFromBackend: false,
  };

  const severity = scoringProfileId
    ? getSeverityFromProfile(score, scoringProfileId)
    : getSeverity(score, maxScore);
  const rule = config.rules[severity] || DEFAULT_RECOMMENDATION_RULES[severity];
  
  // ── Admin Rules Integration ────────────────────────────────────
  // Check if admin-configured rules exist for this assessment's category
  const lowerSlug = (assessmentSlug || '').toLowerCase();
  const matchingAdminRules = findMatchingAdminRules(lowerSlug, severity);
  
  // Find primary equip recommendation from admin rules
  const adminEquipRule = matchingAdminRules.find(r => r.recommendation_type === 'equip');
  const adminResourceRules = matchingAdminRules.filter(r => r.recommendation_type === 'resource');
  const adminAssessmentRules = matchingAdminRules.filter(r => r.recommendation_type === 'assessment');

  // Determine relevant program — prefer admin rule, then slug-based, then default
  let targetProgramId = adminEquipRule?.target_id || '';
  
  if (!targetProgramId) {
    // Fallback: slug-based matching
    if (lowerSlug.includes('sleep')) targetProgramId = 'sleep-tight';
    else if (lowerSlug.includes('stress') || lowerSlug.includes('anxiety')) targetProgramId = 'stress';
    else if (lowerSlug.includes('burnout')) targetProgramId = 'burnout';
  }
  
  // If specific program not found but rule suggests equip_program, pick from admin-configured equipIds
  if (!targetProgramId && rule.recommend.primary.includes('equip_program')) {
     targetProgramId = rule.recommend.equipIds?.[0] || '';
  }

  // Cross-Program Overlap (Add to secondary)
  const relatedPrograms: string[] = [];
  // 1. Check strict escalation rules
  const escalation = config.escalationRules.find(r => 
    (lowerSlug.includes(r.if.assessment)) && r.if.severity === severity
  );
  if (escalation) {
    relatedPrograms.push(...escalation.alsoRecommend);
  } else {
    // 2. Fallback to overlap map
    const genericOverlap = Object.entries(config.overlapMap).find(([key]) => lowerSlug.includes(key));
    if (genericOverlap && severity !== 'low') {
       relatedPrograms.push(...genericOverlap[1]);
    }
  }

  // Build the result object
  const result: EngineResult = {
    severity,
    assessmentSlug: assessmentSlug || undefined,
    score,
    maxScore,
    severityMessage: adminEquipRule?.rationale || rule.recommend.message,
    primaryAction: {
      type: (targetProgramId || rule.recommend.primary.includes('equip_program')) ? 'equip_program' : 'none',
      programId: targetProgramId,
      title: "A guided program that can help right now",
      body: adminEquipRule?.rationale || "Based on your responses, this program focuses on skills that can help reduce what you're experiencing.",
      cta: "Start program"
    },
    secondaryActions: [],
    showProfessionalSupportNote: severity === 'high'
  };

  // Add admin-configured resource recommendations
  adminResourceRules.forEach(rule => {
    result.secondaryActions.push({
      type: 'resource',
      title: 'Recommended reading',
      label: rule.rationale || 'View Resource',
      route: `/resource/${rule.target_id}`,
    });
  });

  // Add admin-configured assessment recommendations
  adminAssessmentRules.forEach(rule => {
    result.secondaryActions.push({
      type: 'assessment',
      title: 'Follow-up assessment',
      label: rule.rationale || 'Take Assessment',
      route: `/assessment-flow?id=${rule.target_id}`,
    });
  });

  // Add Secondary Recommendations
  // 1. Related Programs (from Overlap)
  relatedPrograms.forEach(progId => {
      if (progId !== targetProgramId) { 
          const normalizedId = progId === 'sleep' ? 'sleep-tight' : progId;
          
          result.secondaryActions.push({
            type: 'related_program',
            title: 'You may also find this helpful',
            label: `Explore ${progId.charAt(0).toUpperCase() + progId.slice(1).replace('-', ' ')}`, 
            route: `/equip-program-flow?id=${normalizedId}` 
          });
      }
  });
  
  // 2. Generic Secondaries (Resources, Trackers)
  rule.recommend.secondary.forEach(action => {
    if (action === 'professional_support') {
       // Handled by showProfessionalSupportNote
    } else if (action === 'resources') {
      result.secondaryActions.push({
        type: 'resources',
        title: 'You may also find this helpful',
        label: 'Explore Equip',
        route: '/equip'
      });
    } else if (action === 'trackers') {
      result.secondaryActions.push({
        type: 'trackers',
        title: 'Track your progress',
        label: 'Explore Assessment',
        route: '/assessment'
      });
    } else if (action === 'journaling') {
      result.secondaryActions.push({
        type: 'journaling',
        title: 'Reflect on your journey',
        label: 'Open Journal',
        route: '/mood-journal'
      });
    }
  });

  return result;
}