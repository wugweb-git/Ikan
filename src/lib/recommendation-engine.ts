// Recommendation Engine — loads rules from backend KV (admin-configured),
// falls back to built-in defaults only when no admin rules exist.

import { apiClient } from './api-client';
import {
  compareSeverity, tierFor, isSeverityLevel,
  type SeverityLevel as ClinicalSeverity, type ResponseTier,
} from './scoring-engine';

/**
 * NOTE: this module deliberately does **not** export a `SeverityLevel`.
 *
 * It used to export one as an alias of `ResponseTier` (3 terms) while
 * `scoring-engine.ts` exports a different `SeverityLevel` (5 clinical terms).
 * Two types, one name, different domains — and an auditor reading this file's
 * `severity` field reasonably concluded the Dashboard's three-way branches were
 * dropping `minimal` and `mild` into a danger branch. They were not: the field
 * only ever held a tier. The name was the defect.
 *
 * `scoring-engine.ts` owns `SeverityLevel` (clinical, 5 terms). This module
 * re-exports `ResponseTier` and names its field `tier`, so neither can be
 * mistaken for the other.
 *
 * A third one still exists server-side: `shared-types.ts` declares
 * `SeverityLevel = 'low' | 'mild' | 'moderate' | 'high'` — four terms, a fourth
 * vocabulary — and types `min_severity` with it even though live rules hold
 * `moderately-severe`, which is not in that union. It belongs to the parallel
 * backend recommendation service; see PENDING.md.
 */
export type { ResponseTier };

/** @deprecated `low`/`high` are tiers, not severities. Use ClinicalSeverity. */
export type ExtendedSeverityLevel = ClinicalSeverity | 'low' | 'high';

export type { ClinicalSeverity };

export interface SeverityBand {
  key: ResponseTier;
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
  if: { tier: ResponseTier };
  recommend: {
    primary: string[];
    equipIds?: string[];
    secondary: string[];
    message: string;
  };
}

const DEFAULT_RECOMMENDATION_RULES: Record<ResponseTier, RecommendationRule> = {
  low: {
    if: { tier: 'low' },
    recommend: {
      primary: [],
      secondary: ['resources', 'trackers'],
      message: "You're doing relatively well. A few small habits and regular check-ins can help you stay balanced."
    }
  },
  moderate: {
    if: { tier: 'moderate' },
    recommend: {
      primary: ['equip_program'],
      equipIds: ['stress', 'sleep-tight'],
      secondary: ['trackers', 'journaling'],
      message: "Some areas need attention. A short guided program can help you regain balance."
    }
  },
  high: {
    if: { tier: 'high' },
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
    /** Response tier — tone and copy branch on this. NOT a clinical severity. */
  tier: ResponseTier;
  };
  alsoRecommend: string[];
}

// Short category tokens used throughout this file's default rules/overlap
// map ('stress', 'burnout', 'sleep') aren't real equip identifiers — the
// actual equip slugs are 'stress-buster', 'burnout-reset', 'sleep-tight'.
// Only 'sleep' happened to collide with a real id ('sleep-tight' was already
// spelled out at some call sites but not others), so every program-id
// lookup must resolve through this map before being used to fetch/link an
// equip, or 'stress'/'burnout' silently 404 against a nonexistent program.
const PROGRAM_SLUG_ALIASES: Record<string, string> = {
  sleep: 'sleep-tight',
  stress: 'stress-buster',
  burnout: 'burnout-reset',
};

function resolveProgramSlug(id: string): string {
  return PROGRAM_SLUG_ALIASES[id] ?? id;
}

const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    if: { assessment: 'sleep', tier: 'high' },
    alsoRecommend: ['stress']
  },
  {
    if: { assessment: 'stress', tier: 'high' },
    alsoRecommend: ['burnout', 'sleep']
  }
];

// ══════════════════════════════════════════════════════════════════
// CACHED ENGINE CONFIG — fetched from backend on first use
// ══════════════════════════════════════════════════════════════════

interface EngineConfig {
  rules: Record<ResponseTier, RecommendationRule>;
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
        const rulesMap: Record<ResponseTier, RecommendationRule> = { ...DEFAULT_RECOMMENDATION_RULES };
        const overlapMap: Record<string, string[]> = { ...DEFAULT_OVERLAP_MAP };
        const escalationRules: EscalationRule[] = [...DEFAULT_ESCALATION_RULES];
        const severityBands: SeverityBand[] = [...DEFAULT_SEVERITY_BANDS];

        // Real recommendation_rule: records (see RecommendationRulesManager /
        // admin-routes.ts) only ever carry {assessment_category, min_severity,
        // equip_id, priority, rationale} — the per-category equip targeting
        // consumed separately by loadAdminRules()/findMatchingAdminRules().
        // None of them have ever had .severity/.message/.severity_bands/
        // .overlap_map/.escalation_rules, so this loop was always a no-op in
        // production while still reporting loadedFromBackend: true — a false
        // positive that made it look like admin-configured global severity
        // bands/messaging were live when nothing had ever actually overridden
        // the defaults. Track whether anything was really applied instead of
        // inferring it from "the KV scan returned rows".
        let appliedAnyOverride = false;

        for (const rule of backendRules) {
          // Admin rules may have various shapes — adapt to our interface
          if (rule.severity && rule.message) {
            // `rule.severity` is the backend config's key for a TIER, not a
            // clinical severity — the two vocabularies again, in stored data.
            const tier = rule.severity as ResponseTier;
            rulesMap[tier] = {
              if: { tier },
              recommend: {
                primary: rule.primary_actions || rule.primary || rulesMap[tier]?.recommend.primary || [],
                equipIds: rule.equip_ids || rule.equipIds || rulesMap[tier]?.recommend.equipIds,
                secondary: rule.secondary_actions || rule.secondary || rulesMap[tier]?.recommend.secondary || [],
                message: rule.message || rulesMap[tier]?.recommend.message || '',
              }
            };
            appliedAnyOverride = true;
          }

          // Severity bands override
          if (rule.severity_bands && Array.isArray(rule.severity_bands)) {
            severityBands.length = 0;
            severityBands.push(...rule.severity_bands);
            appliedAnyOverride = true;
          }

          // Overlap map override
          if (rule.overlap_map && typeof rule.overlap_map === 'object') {
            Object.assign(overlapMap, rule.overlap_map);
            appliedAnyOverride = true;
          }

          // Escalation rules override
          if (rule.escalation_rules && Array.isArray(rule.escalation_rules)) {
            escalationRules.length = 0;
            escalationRules.push(...rule.escalation_rules);
            appliedAnyOverride = true;
          }
        }

        _cachedConfig = { rules: rulesMap, overlapMap, escalationRules, severityBands, loadedFromBackend: appliedAnyOverride };
        console.log(appliedAnyOverride
          ? `[RecommendationEngine] Applied global overrides from ${backendRules.length} backend rule(s)`
          : `[RecommendationEngine] ${backendRules.length} backend rule(s) found, but none carry global-override fields (severity/message/severity_bands/overlap_map/escalation_rules) — using built-in defaults. Per-category equip targeting still works via loadAdminRules().`);
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
  await Promise.all([
    loadEngineConfig(),
    loadScoringProfiles(),
  ]);
}

// ══════════════════════════════════════════════════════════════════
// ADMIN RULES INTEGRATION
// Admin-configured rules from RecommendationRulesManager (KV).
// These map assessment_category + min_severity → target content.
// ══════════════════════════════════════════════════════════════════

interface AdminRule {
  id: string;
  /** Category slug, lower-cased on read so the join cannot fail on casing. */
  assessment_category: string;
  min_severity: string;
  recommendation_type: 'equip' | 'resource' | 'assessment';
  target_id: string;
  priority: number;
  rationale: string;
  /**
   * Copy, authored on the rule. Empty means render nothing — the engine no
   * longer substitutes a slogan ("A guided program that can help right now",
   * "Recommended reading", "Track your progress") for missing content.
   */
  title: string;
  body: string;
  cta: string;
}

let _adminRulesCache: AdminRule[] | null = null;

/** Load admin-configured recommendation rules for rule matching */
export async function loadAdminRules(): Promise<void> {
  try {
    const data = await apiClient.request('/admin/recommendations/rules', { method: 'GET' }, true, 0).catch(() => null);
    if (data?.rules && Array.isArray(data.rules)) {
      _adminRulesCache = data.rules.map((r: any) => ({
        id: r.id,
        assessment_category: String(r.assessment_category || '').trim().toLowerCase(),
        min_severity: r.min_severity || 'moderate',
        recommendation_type: r.recommendation_type || 'equip',
        target_id: r.target_id || r.equip_id || '',
        priority: r.priority || 10,
        rationale: r.rationale || '',
        title: r.title || '',
        body: r.body || '',
        cta: r.cta || '',
      }));
      console.log(`[RecommendationEngine] Loaded ${_adminRulesCache?.length ?? 0} admin rules`);
    }
  } catch {
    // Admin rules not available
  }
}

/**
 * Does the measured severity meet the rule's threshold?
 *
 * Both sides are clinical severity (5 ordered terms). An unrecognised value on
 * either side means no match — previously both defaulted to `moderate`, so a
 * typo'd threshold silently became a live one.
 */
function severityMeetsThreshold(actual: string, minRequired: string): boolean {
  if (!isSeverityLevel(actual) || !isSeverityLevel(minRequired)) return false;
  return compareSeverity(actual, minRequired) >= 0;
}

/**
 * Rules matching this assessment's category and severity.
 *
 * The join key is the assessment's **category slug** (`anxiety`, `burnout`, …),
 * which both sides genuinely hold: `assessment_def.category` and
 * `recommendation_rule.assessment_category`. It used to compare a capitalised
 * display word ("Anxiety") against an assessment id, so no rule had ever
 * matched anything — every recommendation in the product came from a hardcoded
 * default.
 */
function findMatchingAdminRules(category: string, severity: ClinicalSeverity | null): AdminRule[] {
  if (!_adminRulesCache || _adminRulesCache.length === 0) return [];
  if (!category || !severity) return [];
  const key = category.trim().toLowerCase();
  return _adminRulesCache
    .filter(rule =>
      rule.assessment_category === key &&
      severityMeetsThreshold(severity, rule.min_severity)
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
  /** v2: the clinical term the system reasons on, separate from `label`. */
  severity_ref?: string;
  tone?: string;
}

interface ScoringProfile {
  id: string;
  method?: string;
  /** v2 field. */
  bands?: ScoringProfileBand[];
  /** v1 field, kept so an un-migrated profile still resolves. */
  severity_bands?: ScoringProfileBand[];
  normalize_to_100?: boolean;
}

/** v2 `bands` if present, else v1 `severity_bands`. */
function bandsOf(profile: ScoringProfile): ScoringProfileBand[] {
  return profile.bands ?? profile.severity_bands ?? [];
}

/**
 * Band containing `score`, half-open: [min, max), last band closed.
 * Matches scoring-engine's bandForValue so the engine and the result page
 * cannot disagree about which band a boundary score falls in.
 */
function bandAt(profile: ScoringProfile, score: number): ScoringProfileBand | null {
  const sorted = [...bandsOf(profile)].sort((a, b) => a.min - b.min);
  if (sorted.length === 0) return null;
  const last = sorted[sorted.length - 1];
  for (const b of sorted) {
    if (b === last) { if (score >= b.min && score <= b.max) return b; }
    else if (score >= b.min && score < b.max) return b;
  }
  return null;
}

let _scoringProfilesCache: Record<string, ScoringProfile> | null = null;

/** Pre-load scoring profiles from backend for score→severity mapping */
export async function loadScoringProfiles(): Promise<void> {
  try {
    // Read path first: the admin route is requireAdmin, so a normal user taking
    // an assessment got a 403 here and the cache stayed null — which meant no
    // clinical severity and therefore no rule match, for everyone but admins.
    const data =
      await apiClient.request('/scoring-profiles', { method: 'GET' }, true, 0).catch(() => null)
      ?? await apiClient.request('/admin/scoring-profiles', { method: 'GET' }, true, 0).catch(() => null);
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

/**
 * Profiles loaded by `loadScoringProfiles()`, or null if that has not run or
 * failed. The player needs these to score against a spec.
 */
export function getLoadedScoringProfiles(): Record<string, any> | null {
  return _scoringProfilesCache;
}

/** Get severity from a scoring profile's bands (raw score, not percentage) */
export function getSeverityFromProfile(score: number, profileId: string): ClinicalSeverity | null {
  const profile = _scoringProfilesCache?.[profileId];
  if (!profile) return null;
  const band = bandAt(profile, score);
  // The clinical term is a field on the band. It used to be derived by
  // lower-casing and hyphenating the *user-facing label*, which resolved
  // "Moderately severe" by luck and turned "Poor Sleep" into `poor-sleep` —
  // not a severity at all. A band declaring none is unbanded, not "high".
  return isSeverityLevel(band?.severity_ref) ? band!.severity_ref as ClinicalSeverity : null;
}

/** Get the detailed severity band info from a scoring profile */
export function getSeverityBandFromProfile(score: number, profileId: string): ScoringProfileBand | null {
  const profile = _scoringProfilesCache?.[profileId];
  return profile ? bandAt(profile, score) : null;
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
export function getSeverity(score: number, maxScore: number): ResponseTier {
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
  /** Response tier — tone and copy branch on this. NOT a clinical severity. */
  tier: ResponseTier;
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
  /**
   * Clinical severity (5 terms). Null when the assessment has no scoring
   * profile or the band declares no `severity_ref`. `severity` above is the
   * 3-term response tier derived from this — the two are different vocabularies.
   */
  severityLevel?: ClinicalSeverity | null;
  /** Category slug the rules matched on. */
  category?: string;
  /**
   * Programme ids from the overlap/escalation map — adjacent, not prescribed.
   *
   * This was computed and then dropped on the floor, which is why the results
   * page had no real related programmes and rendered a label manufactured from
   * the slug ("Explore Stress") instead. Ids only: the page fetches the records
   * so a card can show the programme's actual name, image and length, and a
   * name is never derived from its own slug again.
   *
   * These are NOT the primary recommendation. The primary comes from a matched
   * rule; these come from a category overlap map, and the page must not present
   * the two at the same weight.
   */
  relatedPrograms: string[];
}

export interface EvaluateInput {
  /** Assessment slug. Display/provenance only — never a matching key. */
  slug?: string;
  /**
   * The assessment's category slug (`anxiety`, `burnout`, …). This is the
   * rule-matching key, and it must be passed: without it no admin rule can
   * match, which is the state the product was in.
   */
  category?: string;
  score: number;
  maxScore: number;
  /**
   * Clinical severity already resolved by `computeScores` from the band the
   * score actually fell in. Prefer this: it is the same band the user is
   * shown, so the recommendation cannot disagree with the result.
   */
  severityLevel?: ClinicalSeverity | null;
  /**
   * @deprecated Re-derives severity from a profile id and a raw score. Those
   * two are only in the same units when the profile bands happen to be in
   * raw-sum space — true for Sleep, false for Burnout, whose bands are 1-5
   * means. Pass `severityLevel` instead.
   */
  scoringProfileId?: string;
}

// Main Evaluation Function — uses cached config from backend
export function evaluateAssessment(input: EvaluateInput): EngineResult {
  const { slug, category, score, maxScore, scoringProfileId } = input;
  const config = _cachedConfig || {
    rules: DEFAULT_RECOMMENDATION_RULES,
    overlapMap: DEFAULT_OVERLAP_MAP,
    escalationRules: DEFAULT_ESCALATION_RULES,
    severityBands: DEFAULT_SEVERITY_BANDS,
    loadedFromBackend: false,
  };

  /**
   * Clinical severity, from the band the score actually falls in. Null when the
   * assessment has no scoring profile, or the band declares no severity_ref —
   * in which case no rule can match, rather than a severity being invented.
   */
  const severityLevel: ClinicalSeverity | null =
    input.severityLevel ?? (scoringProfileId ? getSeverityFromProfile(score, scoringProfileId) : null);

  /**
   * Response tier — what copy and tone branch on. Derived from the clinical
   * severity when there is one; otherwise the legacy percentage bands, so an
   * assessment without a spec still renders something.
   */
  /**
   * Tone only. Every assessment carries a spec now, so a null severity means
   * something upstream failed — the old `getSeverity(score, maxScore)`
   * percentage fallback hid exactly that, turning a Burnout result whose four
   * bands all read "Low" into "Some areas need attention" from a 52% guess.
   * Default to the lowest tier and say so, rather than inventing a level.
   */
  const tier: ResponseTier = severityLevel ? tierFor(severityLevel) : 'low';
  if (!severityLevel) {
    console.warn(
      `[RecommendationEngine] No clinical severity resolved for "${category ?? slug ?? 'unknown'}" — ` +
      `no rule can match and no copy will be shown. Expected only where an assessment has no overall score.`
    );
  }
  const rule = config.rules[tier] || DEFAULT_RECOMMENDATION_RULES[tier];

  // ── Admin rules ─────────────────────────────────────────────────
  // Matched on the category slug and the 5-term clinical severity. The old
  // code compared a capitalised display word against an assessment id, so no
  // rule ever matched and every recommendation came from a hardcoded default.
  const matchingAdminRules = findMatchingAdminRules(category ?? '', severityLevel);

  const adminEquipRule = matchingAdminRules.find(r => r.recommendation_type === 'equip');
  const adminResourceRules = matchingAdminRules.filter(r => r.recommendation_type === 'resource');
  const adminAssessmentRules = matchingAdminRules.filter(r => r.recommendation_type === 'assessment');

  /**
   * Target program comes from a matching rule, or nowhere.
   *
   * Removed: a slug substring sniff (`slug.includes('sleep')` → 'sleep-tight')
   * and a fall-through to `rule.recommend.equipIds[0]`. Between them they meant
   * every user got a hardcoded program keyed only on a coarse tier, dressed up
   * as a recommendation. No matching rule now means no primary action.
   */
  let targetProgramId = adminEquipRule?.target_id || '';
  if (targetProgramId) targetProgramId = resolveProgramSlug(targetProgramId);

  // Cross-program overlap, keyed on category rather than a substring of the slug.
  const relatedPrograms: string[] = [];
  const cat = (category ?? '').trim().toLowerCase();
  const escalation = cat
    ? config.escalationRules.find(r => r.if.assessment === cat && r.if.tier === tier)
    : undefined;
  if (escalation) {
    relatedPrograms.push(...escalation.alsoRecommend);
  } else if (cat && config.overlapMap[cat] && tier !== 'low') {
    relatedPrograms.push(...config.overlapMap[cat]);
  }

  // Build the result object
  const result: EngineResult = {
    tier,
    /** The 5-term clinical severity. Null when the score is unbanded. */
    severityLevel,
    assessmentSlug: slug || undefined,
    category: category || undefined,
    score,
    maxScore,
    // Empty when no rule matched. Step 3 removed the fabricated primary
    // ACTION but left this fabricating the COPY, so the results page printed
    // "You're doing relatively well…" from DEFAULT_RECOMMENDATION_RULES under
    // an action that was correctly empty. Copy is authored on the rule or it
    // is not shown.
    severityMessage: adminEquipRule?.rationale || '',
    primaryAction: {
      // No matching rule means no primary action. It used to claim
      // 'equip_program' whenever the tier's default mentioned one, and then
      // fill in a hardcoded programme.
      type: targetProgramId ? 'equip_program' : 'none',
      programId: targetProgramId,
      // Copy is authored on the rule. Empty renders nothing rather than the
      // former hardcoded "A guided program that can help right now".
      title: adminEquipRule?.title || '',
      body: adminEquipRule?.body || adminEquipRule?.rationale || '',
      cta: adminEquipRule?.cta || ''
    },
    secondaryActions: [],
    // Resolved through the same slug->id lookup the primary uses, and
    // de-duplicated against it: recommending a programme twice, once as "start
    // this" and once as "you may also like", reads as two findings.
    relatedPrograms: Array.from(new Set(
      relatedPrograms.map(p => resolveProgramSlug(p)).filter(p => p && p !== targetProgramId)
    )),
    showProfessionalSupportNote: tier === 'high'
  };

  // Add admin-configured resource recommendations
  adminResourceRules.forEach(rule => {
    result.secondaryActions.push({
      type: 'resource',
      title: rule.title || '',
      label: rule.rationale || '',
      route: `/resource/${rule.target_id}`,
    });
  });

  // Add admin-configured assessment recommendations
  adminAssessmentRules.forEach(rule => {
    result.secondaryActions.push({
      type: 'assessment',
      title: rule.title || '',
      label: rule.rationale || '',
      route: `/assessment-flow?id=${rule.target_id}`,
    });
  });

  /**
   * Removed 2026-09-03 — the other half of "no matching rule renders nothing".
   *
   * Two builders used to run here and neither consulted a rule:
   *
   *  - **Related programs**, with the literal title "You may also find this
   *    helpful" and a label generated from the programme slug by string
   *    manipulation (`slug.replace('-', ' ')` replaces only the FIRST hyphen,
   *    so a three-word slug kept its second one). That is where "Explore
   *    Stress" came from on a Burnout result.
   *  - **Generic secondaries**, three literal blocks driven by
   *    `rule.recommend.secondary` — from DEFAULT_RECOMMENDATION_RULES, the same
   *    constant `severityMessage` was just weaned off. "Track your progress",
   *    "Reflect on your journey".
   *
   * With the primary action and the message correctly going quiet when no rule
   * matched, these four cards kept talking — so the page read MORE confident
   * the less the engine actually knew. `secondaryActions` now comes only from
   * admin resource and assessment rules, and is empty when none match.
   *
   * If "explore the journal" is worth recommending it is a rule row; if it is
   * permanent chrome it belongs in the page layout, not in an EngineResult.
   */

  return result;
}