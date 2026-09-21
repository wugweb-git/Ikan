import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../../shared/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ArrowRight, Activity, Smile, Check, BarChart3, ClipboardList, Play, TrendingUp, Brain, Compass, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { SPECIAL_PROGRAM_IDS } from '../../lib/constants/content';
import { checkReassessmentTriggers, ReassessmentReason } from '../../lib/reassessment-triggers';
import { ActivityCard } from '../features/integrations/ActivityCard';
import { useGoogleFit } from '../features/integrations/GoogleFitContext';
import { cn } from '../ui/utils';
import { tierPresentation, tonePresentation } from '../../lib/severity-presentation';
import { isProgramCheckIn } from '../../lib/assessment-record';
import { evaluateAssessment, EngineResult, initEngineConfig, getLoadedScoringProfiles } from '../../shared/engine/recommendation-engine';
import { resolveResultPresentation, type Tone, type Integrity } from '../../lib/result-presentation';
import { RecommendationCards } from '../features/widgets/RecommendationCards';
import { ResourceBlock } from '../ui/blocks/ResourceBlock';
import { ResourcePost } from '../ui/blocks/ResourceCard';
import { HelloWidget } from '../features/widgets/HelloWidget';
import { DashboardActionBlocks } from '../features/widgets/DashboardActionBlocks';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CorporateProgramCard } from '../../components/CorporateProgramCard';
import { ProgramProgressTracker } from '../features/widgets/ProgramProgressTracker';
import { IkanScoreCard } from '../features/widgets/IkanScoreCard';
import { usePublicSettings } from '../../hooks/usePublicSettings';

interface DashboardProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

// ─── Assessment score type ────────────────────────────────────────
interface AssessmentScore {
  assessmentId: string;
  assessmentName: string;
  score: number;
  /** Null when no real maximum resolved. Never substitute one. */
  maxScore: number | null;
  /**
   * The band the score was PLACED in, against the instrument's own cut points.
   *
   * Null renders no pill. There is deliberately no fallback to the label the
   * record carries: 89 of 104 live results hold `Completed`, `Complete` or
   * `New Category` there, and rendering one of those where the outcome goes
   * tells a user their assessment came out "Completed".
   */
  bandLabel: string | null;
  /** Authored on the band. Drives colour; null renders neutral. */
  tone: Tone | null;
  /** Not comparable to the others, and the row should say so. */
  integrity: Integrity;
  completedAt: string;
}

// ─── Helper: filter out raw internal entries and map to readable names ──
function isRealAssessment(r: any): boolean {
  const id = (r.assessment_id || r.assessmentId || '').toLowerCase();
  // Skip program check-ins stored as assessments
  if (isProgramCheckIn(r)) return false;
  // Skip explicitly zero-score completed check-ins (program check-ins use score: 0)
  return true;
}

function cleanAssessmentName(id: string, rawName: string, nameMap?: Map<string, string>): string {
  // 1. Check server-fetched definitions map first (most accurate)
  if (nameMap?.has(id)) return nameMap.get(id)!;

  // 2. Map known well-known IDs to readable names
  const wellKnown: Record<string, string> = {
    'phq-9': 'Depression',
    'phq9': 'Depression',
    'gad-7': 'Anxiety (GAD-7)',
    'gad7': 'Anxiety (GAD-7)',
    'pss': 'Perceived Stress',
    'who-5': 'Well-being (WHO-5)',
    'general': 'General Wellness',
  };
  const lower = id.toLowerCase();
  if (wellKnown[lower]) return wellKnown[lower];

  // 3. If the raw name looks human-readable (has spaces, no internal prefixes), use it
  if (rawName && rawName.includes(' ') && !rawName.startsWith('checkin') && !rawName.startsWith('asm_')) {
    return rawName;
  }

  // 4. Strip auto-generated prefix pattern "asm_<timestamp>_" and prettify
  const cleaned = id
    .replace(/^asm_\d+_/, '')  // strip asm_<timestamp>_ prefix
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
    .replace(/^Assessment /, '');
  return cleaned || rawName || 'Assessment';
}

// ─── Font helper (design-token compliant) ─────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Section label component (Apple-style uppercase) ──────────────
function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        fontFamily: 'var(--font-family-base)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        display: 'block',
        marginBottom: 10,
      }}
    >
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function Dashboard({ className, onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const { settings: publicSettings } = usePublicSettings();
  useGoogleFit(); // Hook must be called; ActivityCard uses it internally
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [topRecDetails, setTopRecDetails] = useState<any>(null);
  const [userName, setUserName] = useState('Friend');
  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);

  // Server-sourced activity feed
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // Engine-driven recommendations from assessment results
  const [engineResult, setEngineResult] = useState<EngineResult | null>(null);

  // Latest scores per assessment type
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([]);

  // Resources for the ResourceBlock
  const [resources, setResources] = useState<ResourcePost[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  // Reassessment State
  const [reassessment, setReassessment] = useState<{ isOpen: boolean; reason: ReassessmentReason }>({ isOpen: false, reason: 'manual' });

  useEffect(() => {
    let isMounted = true;

    if (user?.name || user?.email) {
      setUserName(user.name || user.email?.split('@')[0] || 'Friend');
    }
    if (user) {
      initEngineConfig().then(() => {
        loadDashboardData(isMounted);
      });
      runReassessmentChecks();

      // Fire-and-forget: check for stale program reminders (debounced, max once per session)
      const reminderKey = 'ikan_reminder_checked';
      const lastCheck = sessionStorage.getItem(reminderKey);
      if (!lastCheck) {
        sessionStorage.setItem(reminderKey, Date.now().toString());
        apiClient.checkReminders().catch(() => { /* non-critical */ });
      }
    }

    return () => { isMounted = false; };
  }, [user]);

  const runReassessmentChecks = async () => {
    if (!user) return;
    const userId = user.user_id;
    const dismissedAt = localStorage.getItem(`reassessment_dismissed_${userId}`);
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }
    const { shouldTrigger, reason } = await checkReassessmentTriggers(userId);
    if (shouldTrigger && reason) {
      setTimeout(() => setReassessment({ isOpen: true, reason }), 2000);
    }
  };

  const handleReassessmentConfirm = () => {
    setReassessment({ ...reassessment, isOpen: false });
    // The list, not the player: checkReassessmentTriggers returns only a
    // reason, never an assessment id, so `/assessment-flow?reason=…` reached
    // the player with no target and rendered a blank card.
    onNavigate?.(`/assessment?reason=${reassessment.reason}`);
  };

  const handleReassessmentClose = () => {
    setReassessment({ ...reassessment, isOpen: false });
    const userId = user?.user_id;
    if (userId) localStorage.setItem(`reassessment_dismissed_${userId}`, Date.now().toString());
  };

  const loadDashboardData = async (isMounted: boolean = true) => {
    if (!user) return;
    const userId = user.user_id;
    const CACHE_KEY = `dashboard_data_${userId}`;

    let hasCachedData = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { enrollments, recommendations, activeProgram, topRecDetails } = JSON.parse(cached);
        if (enrollments) {
          setEnrollments(enrollments);
          setRecommendations(recommendations || []);
          setActiveProgram(activeProgram || null);
          setTopRecDetails(topRecDetails || null);
          setLoading(false);
          hasCachedData = true;
        }
      }
    } catch { console.warn('Failed to parse dashboard cache'); }

    if (!hasCachedData) setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const journalData = await apiClient.getJournalEntries(today, today).catch(() => ({ entries: [] }));
      if (!isMounted) return;
      const entries = (journalData as any).entries || [];
      setHasLoggedMoodToday(entries.length > 0);

      const [enrollData, recData, feedData] = await Promise.all([
        apiClient.getUserEnrollments(),
        apiClient.getRecommendations(),
        apiClient.getActivityFeed(10).catch(() => ({ feed: [] }))
      ]);
      if (!isMounted) return;

      // Store activity feed
      const feedItems = feedData?.feed || [];
      if (feedItems.length > 0) setActivityFeed(feedItems);

      let programDetails = null;
      const active = enrollData.find((e: any) => e.status === 'active');
      if (active) {
        try {
          programDetails = await apiClient.getEquipProgram(active.equip_id);
          setActiveProgram(programDetails);
        } catch (e: any) {
          if (!e.message?.includes('404')) console.error("Failed to load active program details", e);
          setActiveProgram(null);
        }
      } else {
        setActiveProgram(null);
      }

      let topRec = null;
      if (recData && recData.length > 0) {
        try { topRec = await apiClient.getEquipProgram(recData[0].equip_id); setTopRecDetails(topRec); }
        catch (e) { console.error("Failed to load top recommendation details", e); }
      } else { setTopRecDetails(null); }

      setEnrollments(enrollData);
      setRecommendations(recData);

      // Recommendation Engine
      try {
        const assessmentHistory = await apiClient.getUserAssessmentResponses().catch(() => ({ history: [] }));
        if (!isMounted) return;
        const responses = (assessmentHistory as any)?.history || (assessmentHistory as any)?.responses || (assessmentHistory as any)?.assessments || [];
        if (Array.isArray(responses) && responses.length > 0) {
          const seen = new Set<string>();
          const dedupedResponses = responses.filter((r: any) => { if (!r.id || seen.has(r.id)) return false; seen.add(r.id); return true; });
          const completedResponses = dedupedResponses
            .filter((r: any) => (r.status === 'completed' || r.completed_at) && (r.score !== undefined || r.total_score !== undefined))
            .filter(isRealAssessment)
            .sort((a: any, b: any) => new Date(b.completed_at || b.created_at || 0).getTime() - new Date(a.completed_at || a.created_at || 0).getTime());

          // Build latest score per assessment type
          const latestByType = new Map<string, any>();
          for (const r of completedResponses) {
            const id = r.assessment_id || r.assessmentId || 'general';
            if (!latestByType.has(id)) latestByType.set(id, r);
          }

          // Fetch available assessment definitions to build name lookup
          let assessmentNameMap: Map<string, string> | undefined;
          let assessmentMaxScoreMap: Map<string, number> | undefined;
          // Rules match on the assessment's category slug, and the profile
          // supplies the band a score falls in. Without both, evaluateAssessment
          // can only produce a tier-level default and no rule can ever match.
          let assessmentMetaMap: Map<string, { category?: string; profileId?: string }> | undefined;
          try {
            const assessmentDefs = await apiClient.request('/assessments', { method: 'GET' }, false);
            const defs = assessmentDefs?.assessments || assessmentDefs || [];
            if (Array.isArray(defs) && defs.length > 0) {
              assessmentNameMap = new Map<string, string>();
              assessmentMaxScoreMap = new Map<string, number>();
              assessmentMetaMap = new Map<string, { category?: string; profileId?: string }>();
              for (const d of defs) {
                const defId = d.id || d.slug;
                const defTitle = d.title || d.name;
                if (defId && defTitle) {
                  assessmentNameMap.set(defId, defTitle);
                  if (d.slug && d.id !== d.slug) assessmentNameMap.set(d.slug, defTitle);
                }
                if (defId) {
                  const meta = { category: d.category, profileId: d.scoring_profile_id };
                  assessmentMetaMap.set(defId, meta);
                  if (d.slug && d.id !== d.slug) assessmentMetaMap.set(d.slug, meta);
                }
                // Compute max score from questions (sum of highest option value per question)
                let computedMax = 0;
                if (d.questions && Array.isArray(d.questions) && d.questions.length > 0) {
                  for (const q of d.questions) {
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
                // Fall back to scoring ranges if question-level computation yields 0
                if (computedMax === 0 && d.scoring?.ranges?.length > 0) {
                  const maxFromRanges = d.scoring.ranges[d.scoring.ranges.length - 1]?.max;
                  if (maxFromRanges) computedMax = maxFromRanges;
                }
                if (defId && computedMax > 0) {
                  assessmentMaxScoreMap.set(defId, computedMax);
                  if (d.slug && d.id !== d.slug) assessmentMaxScoreMap.set(d.slug, computedMax);
                }
              }
            }
          } catch { /* non-critical — skip if defs unavailable */ }

          // Loaded by `initEngineConfig()` above, which this component already
          // awaits before calling `loadDashboardData`.
          const scoringProfiles = getLoadedScoringProfiles() ?? {};

          const scores: AssessmentScore[] = Array.from(latestByType.entries())
            .filter(([_, r]) => r.score !== undefined && r.score !== null)
            .map(([id, r]) => {
            const resolvedMax = r.max_score || r.maxScore || assessmentMaxScoreMap?.get(id);
            if (!resolvedMax) console.warn(`[Dashboard] No maxScore resolved for assessment "${id}", score=${r.score}. Backend enrichment may have failed.`);
            // No invented denominator. `|| r.score || 1` rendered a missing
            // maximum as a full bar (score/score = 100%) or as score x 100%.
            // A percentage without a real max is a wrong number, not a smaller
            // one; skip the row instead.
            const maxScore: number | null = typeof resolvedMax === 'number' && resolvedMax > 0 ? resolvedMax : null;
            const rawName = r.assessment_name || r.assessmentName || r.title || id;
            /**
             * One view model, shared with the history screen.
             *
             * This used to call `evaluateAssessment` per row and take its
             * `tier` — a 3-term response tier computed back out of score and
             * max — while the history screen read the authored band. The two
             * screens were not merely disagreeing; they were answering
             * different questions. Measured on production 3 Sep: Burnout
             * 60/115 read "Low" green here and "Moderate" yellow one tap
             * later.
             *
             * `resolveResultPresentation` places the score against the
             * instrument's own bands, so both screens now compute the same
             * thing from the same input. `evaluateAssessment` still runs below
             * for the engineResult path, where it genuinely produces a
             * recommendation rather than relabelling a stored one.
             */
            const meta = assessmentMetaMap?.get(id);
            const view = resolveResultPresentation(
              r,
              { id, title: rawName, category: meta?.category, scoring_profile_id: meta?.profileId },
              scoringProfiles,
            );
            return {
              assessmentId: id,
              assessmentName: cleanAssessmentName(id, rawName, assessmentNameMap),
              score: r.score || 0,
              maxScore,
              bandLabel: view.band?.label ?? null,
              tone: view.band?.tone ?? null,
              integrity: view.integrity,
              completedAt: r.completed_at || r.created_at || '',
            };
          });
          console.log('[Dashboard] Assessment history: found', completedResponses.length, 'completed responses,', scores.length, 'display scores');
          setAssessmentScores(scores);

          // Engine result from latest real assessment (not check-ins)
          if (completedResponses.length > 0) {
            const latest = completedResponses.find((r: any) => (r.score || 0) > 0) || completedResponses[0];
            const slug = latest.assessment_id || latest.assessmentId || 'general';
            const latestMeta = assessmentMetaMap?.get(slug);
            const result = evaluateAssessment({
              slug,
              category: latestMeta?.category,
              score: latest.score || 0,
              maxScore: latest.max_score ?? latest.maxScore ?? assessmentMaxScoreMap?.get(slug) ?? 0,
              scoringProfileId: latestMeta?.profileId,
            });
            // Attach assessment name for display in RecommendationCards
            result.assessmentName = cleanAssessmentName(slug, latest.assessment_name || latest.assessmentName || latest.title || slug, assessmentNameMap);
            setEngineResult(result);
          }
        }
      } catch (engineError) {
        console.warn('Recommendation engine evaluation failed (non-critical):', engineError);
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        enrollments: enrollData, recommendations: recData,
        activeProgram: programDetails, topRecDetails: topRec, timestamp: Date.now()
      }));

      // Resources (background)
      try {
        const resourcesData = await apiClient.request('/library/resources?limit=6', { method: 'GET' }, false);
        if (!isMounted) return;
        if (resourcesData?.resources && resourcesData.resources.length > 0) {
          const mappedResources: ResourcePost[] = resourcesData.resources.map((r: any) => ({
            id: r.id, title: r.title,
            description: r.excerpt || r.description || '',
            date: new Date(r.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image: r.thumbnail || r.image || r.image_url || r.thumbnail_url || r.featured_image || '',
            slug: r.slug, author: r.author?.name, category: r.category || 'General',
            readTime: r.read_time_minutes ? `${r.read_time_minutes} min read` : (r.metadata?.read_time || '5 min read'),
            type: 'article' as const,
            link: r.slug ? `/resources/${r.slug}` : `/resources/${r.id}`,
          }));
          setResources(mappedResources);
        }
      } catch (resourceErr) {
        console.log('Dashboard resources fetch failed (non-critical):', resourceErr);
      } finally { if (isMounted) setResourcesLoading(false); }

    } catch (error) {
      if (!isMounted) return;
      console.error('Dashboard load error', error);
    } finally { if (isMounted) setLoading(false); }
  };

  const activeEnrollment = enrollments.find(e => e.status === 'active');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]" style={{ gap: 'var(--spacing-4)' }}>
        <LoadingSpinner message="Loading your wellness space..." />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // DERIVED: Latest Activity (merge server feed + local state)
  // ═══════════════════════════════════════════════════════════════════
  const latestActivity = (() => {
    const candidates: { type: string; label: string; detail: string; date: string; ts: number; route: string }[] = [];

    // 1. Server-sourced activity feed (resource reads, mood logs, program days, etc.)
    for (const item of activityFeed) {
      candidates.push({
        type: item.type || 'activity',
        label: item.label || 'Activity',
        detail: item.detail || '',
        date: item.timestamp || '',
        ts: item.timestamp ? new Date(item.timestamp).getTime() : 0,
        route: item.route || '/dashboard',
      });
    }

    // 2. In-memory enrichments (these may duplicate server data but dedup handles it)
    for (const score of assessmentScores) {
      // Same reasoning as the history row: no percentage. It encodes magnitude,
      // magnitude is direction-dependent, and this line never says which way
      // the instrument runs. The band is the part that carries meaning.
      candidates.push({
        type: 'assessment', label: score.assessmentName,
        detail: [
          score.bandLabel ?? 'Not banded',
          score.maxScore !== null ? `${score.score} of ${score.maxScore}` : null,
        ].filter(Boolean).join(' · '),
        date: score.completedAt, ts: score.completedAt ? new Date(score.completedAt).getTime() : 0,
        route: '/assessment',
      });
    }
    if (activeEnrollment && activeProgram) {
      candidates.push({
        type: 'program', label: activeProgram.title || 'Active Program',
        detail: `Day ${activeEnrollment.current_day_number || 1} of ${activeProgram.daily_content?.length || '?'}`,
        date: activeEnrollment.updated_at || activeEnrollment.enrolled_at || '',
        ts: new Date(activeEnrollment.updated_at || activeEnrollment.enrolled_at || 0).getTime(),
        route: `/equip-program-flow?id=${activeEnrollment.equip_id}`,
      });
    }
    for (const enrollment of completedEnrollments) {
      candidates.push({
        type: 'completed', label: `Completed program`,
        detail: enrollment.equip_id?.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Program',
        date: enrollment.completed_at || enrollment.updated_at || '',
        ts: new Date(enrollment.completed_at || enrollment.updated_at || 0).getTime(),
        route: '/equip',
      });
    }
    if (hasLoggedMoodToday) {
      candidates.push({
        type: 'mood', label: 'Mood check-in logged', detail: 'Today',
        date: new Date().toISOString(), ts: Date.now(), route: '/mood-journal',
      });
    }

    // Sort by timestamp, deduplicate by label+date combo, return top 5
    candidates.sort((a, b) => b.ts - a.ts);
    const seen = new Set<string>();
    const deduped: typeof candidates = [];
    for (const c of candidates) {
      const key = `${c.label}:${c.date?.slice(0, 10) || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(c);
      }
    }
    return deduped.slice(0, 5);
  })();

  // ═══════════════════════════════════════════════════════════════════
  // RENDER — follows dashboard-layout.md reference (11 widgets)
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className={cn('max-w-4xl mx-auto', className)} style={{ padding: '0 var(--spacing-4) 120px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ─── 1. Greeting + Weather ─── */}
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} aria-label="Dashboard greeting" data-widget="greeting">
          <HelloWidget userName={userName} />
        </motion.header>

        {/* ─── 1b. Corporate Program (if enrolled) ─── */}
        <CorporateProgramCard onNavigate={onNavigate} />

        {/* ─── 2. Latest Activity ─── */}
        <motion.section aria-label="Latest activity" data-widget="latest-activity" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.03 }}>
          <SectionLabel>Latest Activity</SectionLabel>
          {latestActivity.length > 0 ? (
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border-default)',
              overflow: 'hidden',
            }}>
              {latestActivity.map((item, idx) => {
                const isAssessment = item.type === 'assessment' || item.type === 'assessment_completed';
                const isProgram = item.type === 'program' || item.type === 'program_day_completed' || item.type === 'enrolled';
                const isMood = item.type === 'mood' || item.type === 'mood_logged';
                const isResource = item.type === 'resource_view';
                const isCompleted = item.type === 'completed' || item.type === 'program_completed';

                const iconBg = isAssessment ? 'var(--color-status-info-light)'
                  : (isProgram || isCompleted) ? 'var(--color-accent-default)'
                  : isResource ? 'var(--color-viz-purple-light)'
                  : isMood ? 'var(--color-status-success-light)'
                  : 'var(--color-bg-muted)';
                const iconColor = isAssessment ? 'var(--color-status-info)'
                  : (isProgram || isCompleted) ? 'var(--color-primary-default)'
                  : isResource ? 'var(--color-viz-purple)'
                  : isMood ? 'var(--color-status-success)'
                  : 'var(--color-text-muted)';
                const IconComp = isAssessment ? BarChart3
                  : isProgram ? Play
                  : isCompleted ? Check
                  : isResource ? BookOpen
                  : isMood ? Smile
                  : Calendar;

                const dateStr = item.date && item.type !== 'mood'
                  ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '';

                return (
                  <button type="button" key={`${item.type}-${idx}`}
                    onClick={() => onNavigate?.(item.route)}
                    className="active:bg-black/[0.03] transition-colors"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '14px 16px',
                      border: 0,
                      background: 'none',
                      font: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: idx < latestActivity.length - 1 ? '1px solid var(--color-border-default)' : 'none',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        backgroundColor: iconBg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, color: iconColor,
                      }}>
                        <IconComp size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ ...f('sm', 500), margin: 0 }}>{item.label}</h3>
                        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '1px 0 0' }}>
                          {item.detail}{dateStr ? ` · ${dateStr}` : ''}
                        </p>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, opacity: 0.4 }} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '20px', border: '1px solid var(--color-border-default)', textAlign: 'center' as const }}>
              <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: 0 }}>No activity yet. Start with an assessment or mood check-in.</p>
            </div>
          )}
        </motion.section>

        {/* ─── 3. Health Connect (small widget) ─── */}
        <motion.section aria-label="Health Connect" data-widget="health-connect" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}>
          <ActivityCard />
        </motion.section>

        {/* ─── 4. iKAN Score ─── */}
        <motion.section aria-label="iKAN wellness score" data-widget="ikan-score" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.09 }}>
          <IkanScoreCard onNavigate={onNavigate} isLoggedIn={!!user} />
        </motion.section>

        {/* ─── 5. Recommendations ─── */}
        {engineResult && onNavigate && (
          <motion.section aria-label="Personalized recommendations" data-widget="recommendations" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
            <SectionLabel>Recommended for You</SectionLabel>
            <RecommendationCards engineResult={engineResult} onNavigate={onNavigate} />
          </motion.section>
        )}

        {/* ─── 6. Program Progress ─── */}
        {(activeEnrollment || completedEnrollments.length > 0) && (
          <motion.section aria-label="Program progress" data-widget="program-progress" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
            <SectionLabel>Your Program</SectionLabel>
            <ProgramProgressTracker
              activeEnrollment={activeEnrollment}
              activeProgram={activeProgram}
              completedEnrollments={completedEnrollments}
              engineResult={null}
              onNavigate={onNavigate}
            />
          </motion.section>
        )}

        {/* ─── 7. Mood Check-in | Wellness Insight (side-by-side on desktop) ─── */}
        <motion.section aria-label="Daily check-in and wellness insight" data-widget="mood-insight" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}>
          <SectionLabel>Today</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--spacing-3)' }}>
            {/* Left: Mood Check-in */}
            <motion.button
              type="button"
              onClick={() => { if (hasLoggedMoodToday) { onNavigate?.('/mood-journal'); } else { onNavigate?.(`/equip-program-flow?id=${SPECIAL_PROGRAM_IDS.DAILY_TRACKER}`); } }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              style={{ display: 'block', width: '100%', font: 'inherit', textAlign: 'left', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', overflow: 'hidden', border: hasLoggedMoodToday ? '1px solid var(--color-status-success-light)' : '1px solid var(--color-border-default)' }}
            >
              <div className="flex items-center" style={{ padding: 'var(--spacing-4) var(--spacing-5)', gap: 'var(--spacing-4)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: hasLoggedMoodToday ? 'var(--color-status-success)' : 'var(--color-bg-muted)', color: hasLoggedMoodToday ? 'var(--color-text-inverse)' : 'var(--color-text-muted)', transition: 'all 0.25s' }}>
                  {hasLoggedMoodToday ? <Check size={22} strokeWidth={3} /> : <Smile size={22} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ ...f('sm', 500), margin: 0 }}>{hasLoggedMoodToday ? 'Mood logged for today' : 'Log your mood'}</h3>
                  <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0', lineHeight: 1.4 }}>{hasLoggedMoodToday ? 'Nice work reflecting today.' : 'A quick check-in to track your well-being.'}</p>
                </div>
                {!hasLoggedMoodToday ? (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ArrowRight size={16} /></div>
                ) : (
                  <span style={{ ...f('xs', 500, 'var(--color-status-success)'), backgroundColor: 'var(--color-status-success-light)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', flexShrink: 0 }}>Done</span>
                )}
              </div>
            </motion.button>

            {/* Right: Wellness Insight */}
            <button
              type="button"
              onClick={() => onNavigate?.(engineResult ? '/timeline' : '/mood-journal')}
              style={{
                display: 'block',
                width: '100%',
                font: 'inherit',
                textAlign: 'left',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                overflow: 'hidden',
                // Colour comes from one place, in tokens. These were six raw
                // hex stops and three translucent literals duplicating the
                // tier -> colour map that four other files also had a copy of.
                border: `1px solid ${engineResult ? tierPresentation(engineResult.tier).background : 'var(--color-border-default)'}`,
                background: engineResult ? tierPresentation(engineResult.tier).gradient : 'var(--color-bg-card)',
              }}
            >
              <div className="flex items-center" style={{ padding: 'var(--spacing-4) var(--spacing-5)', gap: 'var(--spacing-4)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  backgroundColor: tierPresentation(engineResult?.tier).background,
                  color: tierPresentation(engineResult?.tier).color,
                }}>
                  {engineResult
                    ? (engineResult.tier === 'low' ? <Check size={22} strokeWidth={2.5} /> : engineResult.tier === 'moderate' ? <Activity size={22} /> : <Brain size={22} />)
                    : <TrendingUp size={22} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ ...f('sm', 500), margin: 0 }}>
                    {engineResult
                      ? (engineResult.tier === 'low' ? 'Looking good' : engineResult.tier === 'moderate' ? 'Needs attention' : 'Let\'s talk about it')
                      : 'Wellness Insight'
                    }
                  </h3>
                  <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0', lineHeight: 1.4 }}>
                    {engineResult
                      ? (engineResult.tier === 'low' ? "You're doing well. Keep up the positive habits." : engineResult.tier === 'moderate' ? 'A few areas could use some care. Explore your recommendations.' : 'Your well-being needs support. We\'re here for you.')
                      : 'Complete an assessment to see your wellness insights.'}
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            </button>
          </div>

          {/* Reassessment prompt (conditional) */}
          {reassessment.isOpen && reassessment.reason !== 'manual' && (
            <div style={{ backgroundColor: 'var(--color-status-warning-light)', borderRadius: 'var(--radius-lg)', padding: '14px 20px', border: '1px solid var(--color-border-default)', marginTop: 'var(--spacing-3)' }}>
              <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-status-warning)', flexShrink: 0 }}><Activity size={18} /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ ...f('sm', 500), margin: 0 }}>Ready for a re-check?</h3>
                  <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>See how things have changed since your last assessment.</p>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                  <button onClick={handleReassessmentClose} style={{ background: 'none', border: 'none', cursor: 'pointer', ...f('xs', 400, 'var(--color-text-muted)') }}>Not now</button>
                  <button onClick={handleReassessmentConfirm} style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', border: 'none', cursor: 'pointer', ...f('xs', 500, 'var(--color-text-inverse)') }}>Retake</button>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* ─── 8. Explore Programs & Assessments ─── */}
        <motion.section aria-label="Explore" data-widget="explore" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.24 }}>
          <SectionLabel>Explore</SectionLabel>
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-3)' }}>
            {/* Programs card — uses admin hero image if configured */}
            <motion.button
              type="button"
              onClick={() => onNavigate?.('/equip')}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{
                display: 'block',
                width: '100%',
                font: 'inherit',
                background: publicSettings.exploreCardProgramsImage ? 'none' : 'linear-gradient(135deg, color-mix(in srgb, var(--color-viz-purple) 4%, var(--color-bg-card)) 0%, var(--color-viz-purple-light) 50%, color-mix(in srgb, var(--color-viz-purple) 22%, var(--color-bg-card)) 100%)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: publicSettings.exploreCardProgramsImage ? '1px solid var(--color-border-default)' : '1px solid color-mix(in srgb, var(--color-viz-purple) 22%, var(--color-bg-card))',
                cursor: 'pointer',
                textAlign: 'center' as const,
                position: 'relative',
                overflow: 'hidden',
                ...(publicSettings.exploreCardProgramsImage ? { padding: 0 } : { padding: '24px 16px' }),
              }}
            >
              {publicSettings.exploreCardProgramsImage ? (
                <>
                  <div style={{ height: 100, overflow: 'hidden' }}>
                    <img
                      src={publicSettings.exploreCardProgramsImage}
                      alt="Programs"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '12px 16px 16px' }}>
                    <h3 style={{ ...f('sm', 500), margin: 0 }}>Programs</h3>
                    <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>Guided wellness journeys</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'color-mix(in srgb, var(--color-viz-purple) 8%, transparent)' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'var(--color-viz-purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--color-viz-purple)' }}>
                      <Brain size={24} />
                    </div>
                    <h3 style={{ ...f('sm', 500), margin: 0 }}>Programs</h3>
                    <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>Guided wellness journeys</p>
                  </div>
                </>
              )}
            </motion.button>

            {/* Assessments card — uses admin hero image if configured */}
            <motion.button
              type="button"
              onClick={() => onNavigate?.('/assessment')}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{
                display: 'block',
                width: '100%',
                font: 'inherit',
                background: publicSettings.exploreCardAssessmentsImage ? 'none' : 'linear-gradient(135deg, color-mix(in srgb, var(--color-viz-blue) 4%, var(--color-bg-card)) 0%, var(--color-viz-blue-light) 50%, color-mix(in srgb, var(--color-viz-blue) 22%, var(--color-bg-card)) 100%)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: publicSettings.exploreCardAssessmentsImage ? '1px solid var(--color-border-default)' : '1px solid color-mix(in srgb, var(--color-viz-blue) 22%, var(--color-bg-card))',
                cursor: 'pointer',
                textAlign: 'center' as const,
                position: 'relative',
                overflow: 'hidden',
                ...(publicSettings.exploreCardAssessmentsImage ? { padding: 0 } : { padding: '24px 16px' }),
              }}
            >
              {publicSettings.exploreCardAssessmentsImage ? (
                <>
                  <div style={{ height: 100, overflow: 'hidden' }}>
                    <img
                      src={publicSettings.exploreCardAssessmentsImage}
                      alt="Assessments"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '12px 16px 16px' }}>
                    <h3 style={{ ...f('sm', 500), margin: 0 }}>Assessments</h3>
                    <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>Understand your well-being</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'color-mix(in srgb, var(--color-viz-blue) 8%, transparent)' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'var(--color-viz-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--color-viz-blue)' }}>
                      <Compass size={24} />
                    </div>
                    <h3 style={{ ...f('sm', 500), margin: 0 }}>Assessments</h3>
                    <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>Understand your well-being</p>
                  </div>
                </>
              )}
            </motion.button>
          </div>
        </motion.section>

        {/* ─── 9. Resource Library ─── */}
        {(resources.length > 0 || resourcesLoading) && (
          <motion.section aria-label="From our library" data-widget="resource-library" style={{ marginLeft: -16, marginRight: -16 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.27 }}>
            <ResourceBlock title="From Our Library" posts={resources} loading={resourcesLoading} onPostClick={(post) => onNavigate?.(`/resource-detail?id=${post.id}`)} onViewAll={() => onNavigate?.('/resource')} viewAllText="View All" maxPosts={6} />
          </motion.section>
        )}

        {/* ─── 10. Assessment History ─── */}
        <motion.section aria-label="Assessment history" data-widget="assessment-history" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 }}>
          <SectionLabel>Assessment History</SectionLabel>
          <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>
            {assessmentScores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {assessmentScores.slice(0, 5).map((s, i) => {
                  // Colour from the band's authored tone. Neutral when the
                  // score could not be placed — never the most severe.
                  const band = tonePresentation(s.tone);
                  return (
                    <button type="button" key={`${s.assessmentId}-${i}`} onClick={() => onNavigate?.(`/assessment-history-detail?id=${s.assessmentId}`)}
                      className="active:bg-black/[0.03] transition-colors"
                      style={{
                        display: 'block', width: '100%', border: 0, background: 'none', font: 'inherit', textAlign: 'left',
                        padding: '14px 16px', cursor: 'pointer',
                        borderBottom: i < Math.min(assessmentScores.length, 5) - 1 ? '1px solid var(--color-border-default)' : 'none',
                      }}
                    >
                      {/* The band label leads.
                          It is the only thing on this row that is
                          direction-correct, scale-free and safe to read across
                          instruments, and it was the smallest, palest element,
                          parked far right where it is read last.

                          The ring and the percentage are gone. The ring
                          encodes magnitude, magnitude is direction-dependent,
                          and the row never said which way an instrument runs:
                          burnout at 52% and sleep at 60% drew a FULLER ring on
                          the healthier result. And 52% of a burnout scale is
                          not the same quantity as 60% of a sleep scale, so
                          putting both in one column invited a comparison that
                          is not valid. The raw fraction stays, worded so it
                          reads as a score and not a proportion. */}
                      <div className="flex items-center" style={{ gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            ...f('base', 500, s.bandLabel ? band.color : 'var(--color-text-muted)'),
                            display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {/* "Not banded" is the honest reading when a score
                                cannot be placed against its instrument. The
                                alternative was rendering the record's stored
                                label, which for most rows is the word
                                "Completed" sitting where the result goes. */}
                            {s.bandLabel ?? 'Not banded'}
                          </span>
                          <span style={{
                            ...f('sm', 400, s.bandLabel ? 'var(--color-text-muted)' : 'var(--color-text-primary)'),
                            display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            marginTop: s.bandLabel ? 2 : 0,
                          }}>
                            {s.assessmentName}
                          </span>
                          <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                            {s.completedAt ? new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                            {s.maxScore !== null && ` · ${s.score} of ${s.maxScore}`}
                            {/* 31 stored results are flagged excluded_from_trends
                                and nothing said so. A row that cannot be
                                compared to the others should admit it rather
                                than sit silently in a list that implies it can. */}
                            {(s.integrity === 'excluded' || s.integrity === 'pre-spec') && ' · scored under an older version'}
                            {s.integrity === 'partial' && ' · partly answered'}
                          </p>
                        </div>
                        <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, opacity: 0.4 }} />
                      </div>
                    </button>
                  );
                })}
                <button type="button" onClick={() => onNavigate?.('/assessment')}
                  className="active:bg-black/[0.03] transition-colors"
                  style={{ display: 'block', width: '100%', border: 0, background: 'none', font: 'inherit', textAlign: 'left', padding: '12px 16px', cursor: 'pointer', borderTop: '1px solid var(--color-border-default)' }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 8 }}>
                    <ClipboardList size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={f('xs', 500, 'var(--color-text-muted)')}>Take another assessment</span>
                  </div>
                </button>
              </div>
            ) : (
              <div style={{ padding: '24px 20px', textAlign: 'center' as const }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--color-text-muted)' }}>
                  <ClipboardList size={20} />
                </div>
                <h3 style={{ ...f('sm', 500), margin: '0 0 4px' }}>No assessments yet</h3>
                <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '0 0 14px', lineHeight: 1.5 }}>Take a quick assessment to understand where you stand.</p>
                <button onClick={() => onNavigate?.('/assessment')} className="flex items-center justify-center"
                  style={{ margin: '0 auto', padding: '10px 24px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', border: 'none', cursor: 'pointer', gap: 8, ...f('sm', 500, 'var(--color-text-inverse)') }}>
                  <Play size={14} fill="currentColor" /> Begin Assessment
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── 11. Talk to Professional ─── */}
        <motion.section aria-label="Professional consultation" data-widget="consultation" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.33 }}>
          <SectionLabel>Support</SectionLabel>
          <DashboardActionBlocks onNavigate={onNavigate} />
        </motion.section>

      </div>
    </div>
  );
}