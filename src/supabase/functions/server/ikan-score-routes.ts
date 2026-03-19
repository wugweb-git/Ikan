// iKAN Score Routes — Composite Wellness Index Calculation
// Reads from KV: assessments, mood journals, enrollments, check-ins
// Computes a 0-100 wellness score and stores daily snapshots for trends.

import { Hono } from 'npm:hono';
import * as kv from './kv_dual_write.ts';

// ─── Known assessment max scores ────────────────────────────────
// Fallback when max_score is not stored with the result.
// These are standard clinical instruments; "higher = more distress" for all.
const KNOWN_MAX_SCORES: Record<string, number> = {
  'phq9': 27, 'phq-9': 27,
  'gad7': 21, 'gad-7': 21,
  'pss': 40, 'pss-10': 40,
  'dass21': 126, 'dass-21': 126,
  'burnout': 50,
  'k10': 50, 'k-10': 50,
  'pcl5': 80, 'pcl-5': 80,
  'audit': 40, 'audit-c': 12,
  'epds': 30,
  'phq2': 6, 'phq-2': 6,
  // WHO-5 is "higher = better" — handled separately below
  'who5': 25, 'who-5': 25,
};

// Assessments where higher score = BETTER wellness (not more distress)
const HIGHER_IS_BETTER = new Set(['who5', 'who-5']);

// ─── Severity → Wellness mapping ────────────────────────────────
// Standard: higher score = MORE distress → invert for wellness
function assessmentScoreToWellness(score: number, maxScore: number, assessmentId: string): number {
  if (!maxScore || maxScore <= 0) return 50; // neutral default
  const pct = (score / maxScore) * 100;

  const idLower = (assessmentId || '').toLowerCase();
  if (HIGHER_IS_BETTER.has(idLower)) {
    // WHO-5 etc: higher score = better wellness
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  // Standard: invert (higher distress = lower wellness)
  const wellness = Math.max(0, Math.min(100, 100 - pct));
  return Math.round(wellness);
}

// ─── Mood rating → Wellness ──────────────────────────────────────
function moodToWellness(moodRating: number): number {
  if (moodRating <= 0) return 50;
  // 1-5 scale → 0-100
  if (moodRating <= 5) return Math.round(((moodRating - 1) / 4) * 100);
  // 1-10 scale → 0-100
  if (moodRating <= 10) return Math.round(((moodRating - 1) / 9) * 100);
  return 50;
}

// ─── Resolve max score ───────────────────────────────────────────
async function resolveMaxScore(result: any): Promise<number> {
  // 1. Stored max_score from submission
  if (result.max_score && result.max_score > 0) return result.max_score;
  if (result.maxScore && result.maxScore > 0) return result.maxScore;

  // 2. Known clinical assessment lookup
  const id = (result.assessment_id || '').toLowerCase();
  if (KNOWN_MAX_SCORES[id]) return KNOWN_MAX_SCORES[id];

  // 3. Try to infer from scoring ranges in interpretation
  if (result.interpretation?.ranges) {
    const ranges = result.interpretation.ranges;
    if (Array.isArray(ranges) && ranges.length > 0) {
      const lastRange = ranges[ranges.length - 1];
      if (lastRange?.max) return lastRange.max;
    }
  }

  // 4. Fetch assessment definition and compute from questions
  const assessmentId = result.assessment_id || result.assessmentId;
  if (assessmentId) {
    try {
      const def = await kv.get(`assessment_def:${assessmentId}`);
      if (def) {
        // Compute from questions (sum of highest option value per question)
        let computedMax = 0;
        if (def.questions && Array.isArray(def.questions) && def.questions.length > 0) {
          for (const q of def.questions) {
            if (q.options && Array.isArray(q.options)) {
              let maxVal = 0;
              for (const opt of q.options) {
                const v = typeof opt === 'object' ? (opt.value ?? opt.score ?? 0) : 0;
                if (typeof v === 'number' && v > maxVal) maxVal = v;
              }
              computedMax += maxVal;
            }
          }
        }
        if (computedMax > 0) return computedMax;
        // Fallback to scoring ranges from definition
        if (def.scoring?.ranges?.length > 0) {
          const rangeMax = def.scoring.ranges[def.scoring.ranges.length - 1]?.max;
          if (rangeMax && rangeMax > 0) return rangeMax;
        }
      }
    } catch { /* non-critical */ }
  }

  // 5. Absolute last resort: use 100 (may be inaccurate)
  console.log(`[ikan-score] WARNING: Could not resolve maxScore for assessment ${assessmentId || id}, falling back to 100`);
  return 100;
}

// ─── Resolve human-readable assessment name ──────────────────────
async function resolveAssessmentName(assessmentId: string): Promise<string> {
  try {
    const def = await kv.get(`assessment_def:${assessmentId}`);
    if (def?.title) return def.title;
  } catch { /* non-critical */ }

  // Fallback: prettify the ID
  const id = assessmentId || 'Unknown';
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Phq(\d)/i, 'PHQ-$1')
    .replace(/Gad(\d)/i, 'GAD-$1')
    .replace(/Who(\d)/i, 'WHO-$1')
    .replace(/Pss/i, 'PSS')
    .replace(/Dass/i, 'DASS');
}

// ─── Main score computation ──────────────────────────────────────
interface ScoreBreakdown {
  assessments: { score: number; weight: number; count: number; details: Array<{ id: string; name: string; wellness: number }> };
  mood:        { score: number; weight: number; entries: number; avgRating: number; consistency: number };
  programs:    { score: number; weight: number; active: number; completed: number; avgProgress: number };
  engagement:  { score: number; weight: number; recentDays: number };
}

interface IkanScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  trend: number;      // change from 30 days ago
  trendLabel: string;  // "improving" | "stable" | "declining"
  hasData: boolean;
  computedAt: string;
}

async function computeIkanScore(userId: string): Promise<IkanScoreResult> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // ── 1. Fetch assessment results ───────────────────────────────
  const assessmentResults = await kv.getByPrefix(`assessment_result:${userId}:`);

  // Deduplicate — `:latest` keys create copies with the same `id`
  const uniqueAssessments = new Map<string, any>();
  for (const r of assessmentResults) {
    if (!r) continue;
    const key = r.id || r.assessment_id || JSON.stringify(r);
    if (!uniqueAssessments.has(key)) {
      uniqueAssessments.set(key, r);
    }
  }

  // Filter to real completed assessments (exclude check-ins, program ASMs)
  const completedAssessments = Array.from(uniqueAssessments.values()).filter(r => {
    if (r.status !== 'completed') return false;
    const id = (r.assessment_id || '').toLowerCase();
    if (id.startsWith('checkin_') || id.startsWith('checkin-')) return false;
    if (id.startsWith('asm_') || id.startsWith('asm-')) return false;
    if (r.score === 0 && r.responses?.type === 'program_checkin') return false;
    return true;
  });

  // Get latest score per assessment type
  const latestByType = new Map<string, any>();
  const sorted = completedAssessments.sort(
    (a, b) => new Date(b.completed_at || b.created_at || 0).getTime() -
              new Date(a.completed_at || a.created_at || 0).getTime()
  );
  for (const r of sorted) {
    const typeId = r.assessment_id || 'general';
    if (!latestByType.has(typeId)) latestByType.set(typeId, r);
  }

  const assessmentDetails: Array<{ id: string; name: string; wellness: number }> = [];
  let assessmentWellnessSum = 0;
  for (const [id, r] of latestByType) {
    if (r.score === undefined || r.score === null) continue;
    const maxScore = await resolveMaxScore(r);
    const wellness = assessmentScoreToWellness(r.score, maxScore, id);
    const name = await resolveAssessmentName(id);
    assessmentDetails.push({ id, name, wellness });
    assessmentWellnessSum += wellness;
  }
  const assessmentAvg = assessmentDetails.length > 0
    ? Math.round(assessmentWellnessSum / assessmentDetails.length)
    : 0;

  // ── 2. Fetch mood journal entries (last 30 days) ──────────────
  // Note: trailing colon after userId prevents prefix collision
  const journalEntries = await kv.getByPrefix(`journal_by_user:${userId}:`);
  const recentMoods = (journalEntries || []).filter(
    (e: any) => e && e.date && e.date >= thirtyDaysAgoStr
  );

  let moodAvg = 0;
  let moodConsistency = 0;
  let avgRating = 0;
  if (recentMoods.length > 0) {
    const rated = recentMoods.filter((e: any) => e.mood_rating && e.mood_rating > 0);
    if (rated.length > 0) {
      avgRating = rated.reduce((sum: number, e: any) => sum + e.mood_rating, 0) / rated.length;
    }
    // Consistency: % of days in last 30 with a mood entry
    moodConsistency = Math.min(100, Math.round((recentMoods.length / 30) * 100));

    // Mood score: weighted blend of rating wellness + consistency
    const ratingWellness = avgRating > 0 ? moodToWellness(avgRating) : 50;
    moodAvg = Math.round(ratingWellness * 0.6 + moodConsistency * 0.4);
  }

  // ── 3. Fetch enrollments (program progress) ───────────────────
  // Query BOTH enrollment prefixes and merge (different modules write to different keys)
  const [enrollmentsByProgress, enrollmentsByCreation] = await Promise.all([
    kv.getByPrefix(`enrollment:${userId}:`),         // progress-service writes here
    kv.getByPrefix(`user_enrollment:${userId}:`),    // index.tsx writes here at creation
  ]);

  // Merge + deduplicate by program ID
  const enrollmentMap = new Map<string, any>();

  // Index.tsx enrollments use: programId, currentDay, status
  for (const e of (enrollmentsByCreation || [])) {
    if (!e) continue;
    const progId = e.programId || e.equip_id || e.program_id;
    if (!progId) continue;
    enrollmentMap.set(progId, {
      equip_id: progId,
      status: e.status || 'active',
      current_day_number: e.current_day_number || e.currentDay || 1,
      last_activity_at: e.last_activity_at || e.updated_at || e.started_at || e.created_at,
      started_at: e.started_at || e.startDate || e.created_at,
    });
  }

  // Progress-service enrollments override (more up-to-date): user_id, equip_id, current_day_number, status
  for (const e of (enrollmentsByProgress || [])) {
    if (!e) continue;
    const progId = e.equip_id || e.programId || e.program_id;
    if (!progId) continue;
    enrollmentMap.set(progId, {
      equip_id: progId,
      status: e.status || 'active',
      current_day_number: e.current_day_number || e.currentDay || 1,
      last_activity_at: e.last_activity_at || e.updated_at,
      started_at: e.started_at || e.startDate,
    });
  }

  const allEnrollments = Array.from(enrollmentMap.values());
  const activeEnrollments = allEnrollments.filter(e => e.status === 'active');
  const completedEnrollments = allEnrollments.filter(e => e.status === 'completed');

  let programAvg = 0;
  const totalPrograms = activeEnrollments.length + completedEnrollments.length;

  if (totalPrograms > 0) {
    let progressSum = 0;

    for (const e of activeEnrollments) {
      // Try to get the program to know total days
      const program = await kv.get(`equip_program:${e.equip_id}`).catch(() => null)
        || await kv.get(`equip:${e.equip_id}`).catch(() => null);
      const totalDays = program?.daily_content?.length || program?.days?.length || program?.duration_days || program?.total_days || 30;
      const currentDay = e.current_day_number || 1;
      const progress = Math.min(100, Math.round((currentDay / totalDays) * 100));
      progressSum += progress;
    }

    // Completed programs count as 100%
    progressSum += completedEnrollments.length * 100;
    programAvg = Math.round(progressSum / totalPrograms);
  }

  // ── 4. Engagement score (recent activity) ─────────────────────
  const activityDays = new Set<string>();

  // Assessment dates
  for (const r of completedAssessments) {
    const date = (r.completed_at || r.created_at || '').split('T')[0];
    if (date && date >= thirtyDaysAgoStr) activityDays.add(date);
  }

  // Mood journal dates
  for (const e of recentMoods) {
    if (e.date) activityDays.add(e.date);
  }

  // Enrollment activity dates
  for (const e of allEnrollments) {
    const date = (e.last_activity_at || e.started_at || '').split('T')[0];
    if (date && date >= thirtyDaysAgoStr) activityDays.add(date);
  }

  const engagementScore = Math.min(100, Math.round((activityDays.size / 30) * 100));

  // ── 5. Weighted composite ─────────────────────────────────────
  // Only include components that have data; redistribute weights
  const components: Array<{ score: number; baseWeight: number }> = [];

  if (assessmentDetails.length > 0) components.push({ score: assessmentAvg, baseWeight: 40 });
  if (recentMoods.length > 0)       components.push({ score: moodAvg, baseWeight: 20 });
  if (totalPrograms > 0)            components.push({ score: programAvg, baseWeight: 25 });
  if (activityDays.size > 0)        components.push({ score: engagementScore, baseWeight: 15 });

  let finalScore = 0;
  const hasData = components.length > 0;

  if (hasData) {
    const totalWeight = components.reduce((s, c) => s + c.baseWeight, 0);
    finalScore = Math.round(
      components.reduce((s, c) => s + c.score * (c.baseWeight / totalWeight), 0)
    );
    // Clamp to 1-100 when there's data
    finalScore = Math.max(1, Math.min(100, finalScore));
  }

  // ── 6. Trend: compare to stored snapshot from ~30 days ago ────
  let trend = 0;
  let trendLabel = 'stable';
  try {
    const snapshots = await kv.getByPrefix(`ikan_score:${userId}:`);
    if (snapshots && snapshots.length > 0) {
      // Find the snapshot closest to 30 days ago
      const sortedSnaps = snapshots
        .filter((s: any) => s && s.date && s.score !== undefined)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));

      if (sortedSnaps.length > 0) {
        // Find closest to 30 days ago
        let closest: any = null;
        let closestDiff = Infinity;
        for (const s of sortedSnaps) {
          const diff = Math.abs(new Date(s.date).getTime() - thirtyDaysAgo.getTime());
          if (diff < closestDiff) { closestDiff = diff; closest = s; }
        }

        if (closest && typeof closest.score === 'number') {
          trend = finalScore - closest.score;
          if (trend > 2) trendLabel = 'improving';
          else if (trend < -2) trendLabel = 'declining';
          else trendLabel = 'stable';
        }
      }
    }
  } catch { /* non-critical */ }

  // ── 7. Store today's snapshot ─────────────────────────────────
  const todayStr = now.toISOString().split('T')[0];
  if (hasData) {
    try {
      await kv.set(`ikan_score:${userId}:${todayStr}`, {
        score: finalScore,
        date: todayStr,
        components: components.length,
        assessmentCount: assessmentDetails.length,
        moodEntries: recentMoods.length,
        programCount: totalPrograms,
        engagementDays: activityDays.size,
        created_at: now.toISOString()
      });
    } catch { /* non-critical */ }
  }

  const breakdown: ScoreBreakdown = {
    assessments: {
      score: assessmentAvg,
      weight: assessmentDetails.length > 0 ? 40 : 0,
      count: assessmentDetails.length,
      details: assessmentDetails
    },
    mood: {
      score: moodAvg,
      weight: recentMoods.length > 0 ? 20 : 0,
      entries: recentMoods.length,
      avgRating: Math.round(avgRating * 10) / 10,
      consistency: moodConsistency
    },
    programs: {
      score: programAvg,
      weight: totalPrograms > 0 ? 25 : 0,
      active: activeEnrollments.length,
      completed: completedEnrollments.length,
      avgProgress: programAvg
    },
    engagement: {
      score: engagementScore,
      weight: activityDays.size > 0 ? 15 : 0,
      recentDays: activityDays.size
    }
  };

  return {
    score: finalScore,
    breakdown,
    trend,
    trendLabel,
    hasData,
    computedAt: now.toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════
// ROUTE REGISTRATION
// ═══════════════════════════════════════════════════════════════════
export function registerIkanScoreRoutes(app: Hono, requireAuth: any) {

  // GET /user/ikan-score — compute and return the current iKAN Score
  app.get("/user/ikan-score", requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) return c.json({ error: 'User not found' }, 401);

      const result = await computeIkanScore(userId);
      return c.json(result);
    } catch (error) {
      console.log('iKAN Score computation error:', error);
      return c.json({ error: `Failed to compute iKAN Score: ${error}` }, 500);
    }
  });

  // GET /user/ikan-score/history — return score snapshots for trend charts
  app.get("/user/ikan-score/history", requireAuth, async (c) => {
    try {
      const userId = c.get('userId');
      if (!userId) return c.json({ error: 'User not found' }, 401);

      const snapshots = await kv.getByPrefix(`ikan_score:${userId}:`);
      const sorted = (snapshots || [])
        .filter((s: any) => s && s.date && s.score !== undefined)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));

      return c.json({ history: sorted });
    } catch (error) {
      console.log('iKAN Score history error:', error);
      return c.json({ error: `Failed to fetch score history: ${error}` }, 500);
    }
  });
}