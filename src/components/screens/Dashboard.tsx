import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ArrowRight, Activity, Smile, Check, BarChart3, ClipboardList, Play, TrendingUp, Brain, Compass } from 'lucide-react';
import { SPECIAL_PROGRAM_IDS } from '../../lib/constants/content';
import { ReassessmentPrompt } from '../assessments/ReassessmentPrompt';
import { checkReassessmentTriggers, ReassessmentReason } from '../../lib/reassessment-triggers';
import { ActivityCard } from '../integrations/ActivityCard';
import { useGoogleFit } from '../integrations/GoogleFitContext';
import { cn } from '../ui/utils';
import { evaluateAssessment, EngineResult, initEngineConfig } from '../../lib/recommendation-engine';
import { RecommendationCards } from '../RecommendationCards';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { HelloWidget } from '../HelloWidget';
import { DashboardActionBlocks } from '../DashboardActionBlocks';
import { LoadingSpinner } from '../LoadingSpinner';
import { CorporateProgramCard } from '../CorporateProgramCard';
import { ProgramProgressTracker } from '../ProgramProgressTracker';
import { IkanScoreCard } from '../IkanScoreCard';

interface DashboardProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

// ─── Assessment score type ────────────────────────────────────────
interface AssessmentScore {
  assessmentId: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  severity: string;
  completedAt: string;
}

// ─── Helper: filter out raw internal entries and map to readable names ──
function isRealAssessment(r: any): boolean {
  const id = (r.assessment_id || r.assessmentId || '').toLowerCase();
  // Skip program check-ins stored as assessments
  if (id.startsWith('checkin_') || id.startsWith('checkin-')) return false;
  // Skip internal assessment prefixes
  if (id.startsWith('asm_') || id.startsWith('asm-')) return false;
  // Skip explicitly zero-score completed check-ins (program check-ins use score: 0)
  if (r.score === 0 && r.responses?.type === 'program_checkin') return false;
  return true;
}

function cleanAssessmentName(id: string, rawName: string): string {
  // Map known internal IDs to readable names
  const nameMap: Record<string, string> = {
    'phq-9': 'Depression (PHQ-9)',
    'phq9': 'Depression (PHQ-9)',
    'gad-7': 'Anxiety (GAD-7)',
    'gad7': 'Anxiety (GAD-7)',
    'pss': 'Perceived Stress',
    'who-5': 'Well-being (WHO-5)',
    'general': 'General Wellness',
  };
  const lower = id.toLowerCase();
  if (nameMap[lower]) return nameMap[lower];
  // If the raw name looks like an ID (has underscores/hyphens and no spaces), prettify it
  if (rawName && rawName.includes(' ') && !rawName.startsWith('checkin') && !rawName.startsWith('asm')) {
    return rawName;
  }
  // Fallback: prettify the ID
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
    .replace(/^Assessment /, '');
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
  useGoogleFit(); // Hook must be called; ActivityCard uses it internally
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [topRecDetails, setTopRecDetails] = useState<any>(null);
  const [userName, setUserName] = useState('Friend');
  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);

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
    const userId = user.user_id || (user as any).id;
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
    onNavigate?.(`/assessment-flow?reason=${reassessment.reason}`);
  };

  const handleReassessmentClose = () => {
    setReassessment({ ...reassessment, isOpen: false });
    const userId = user?.user_id || (user as any)?.id;
    if (userId) localStorage.setItem(`reassessment_dismissed_${userId}`, Date.now().toString());
  };

  const loadDashboardData = async (isMounted: boolean = true) => {
    if (!user) return;
    const userId = user.user_id || (user as any).id;
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

      const [enrollData, recData] = await Promise.all([
        apiClient.getUserEnrollments(),
        apiClient.getRecommendations()
      ]);
      if (!isMounted) return;

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

          // Fetch available assessment definitions to validate results
          let availableAssessmentIds: Set<string> | null = null;
          try {
            const assessmentDefs = await apiClient.request('/assessments', { method: 'GET' }, false);
            const defs = assessmentDefs?.assessments || assessmentDefs || [];
            if (Array.isArray(defs) && defs.length > 0) {
              availableAssessmentIds = new Set(defs.map((d: any) => d.id || d.slug).filter(Boolean));
            }
          } catch { /* non-critical — skip validation if defs unavailable */ }

          const scores: AssessmentScore[] = Array.from(latestByType.entries())
            .filter(([_, r]) => r.score !== undefined && r.score !== null) // Include all scored assessments (even 0)
            .filter(([id]) => {
              // If we have assessment definitions, validate the result references an existing assessment
              if (!availableAssessmentIds) return true;
              return availableAssessmentIds.has(id);
            })
            .map(([id, r]) => {
            const maxScore = r.max_score || r.maxScore || 100;
            const result = evaluateAssessment(id, r.score || 0, maxScore);
            const rawName = r.assessment_name || r.assessmentName || r.title || id;
            return {
              assessmentId: id,
              assessmentName: cleanAssessmentName(id, rawName),
              score: r.score || 0,
              maxScore,
              severity: result.severity,
              completedAt: r.completed_at || r.created_at || '',
            };
          });
          setAssessmentScores(scores);

          // Engine result from latest real assessment (not check-ins)
          if (completedResponses.length > 0) {
            const latest = completedResponses.find((r: any) => (r.score || 0) > 0) || completedResponses[0];
            const slug = latest.assessment_id || latest.assessmentId || 'general';
            const result = evaluateAssessment(slug, latest.score || 0, latest.max_score || latest.maxScore || 100);
            // Attach assessment name for display in RecommendationCards
            result.assessmentName = cleanAssessmentName(slug, latest.assessment_name || latest.assessmentName || latest.title || slug);
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

  // ═══════════════════════════════════════════════════════════════════
  // DERIVED: Latest Activity
  // ═══════════════════════════════════════════════════════════════════
  const latestActivity = (() => {
    const candidates: { type: string; label: string; detail: string; date: string; ts: number; route: string }[] = [];
    // Add ALL completed assessment types as separate entries
    for (const score of assessmentScores) {
      candidates.push({
        type: 'assessment', label: `Completed ${score.assessmentName}`,
        detail: `Score: ${score.score} / ${score.maxScore} · ${score.severity}`,
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
    // Add completed program entries
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
    candidates.sort((a, b) => b.ts - a.ts);
    return candidates.slice(0, 5); // Show up to 5 most recent activities
  })();

  // ═══════════════════════════════════════════════════════════════════
  // RENDER — follows dashboard-layout.md reference (11 widgets)
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className={cn('max-w-4xl mx-auto pb-28', className)} style={{ padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-28)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {latestActivity.map((item, idx) => {
                const iconBg = item.type === 'assessment' ? 'var(--color-status-info-light)' : item.type === 'program' ? 'var(--color-accent-default)' : 'var(--color-status-success-light)';
                const iconColor = item.type === 'assessment' ? 'var(--color-status-info)' : item.type === 'program' ? 'var(--color-primary-default)' : 'var(--color-status-success)';
                return (
                  <div key={`${item.type}-${idx}`}
                    onClick={() => onNavigate?.(item.route)}
                    style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '16px 20px', border: '1px solid var(--color-border-default)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  >
                    <div className="flex items-center" style={{ gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor }}>
                        {item.type === 'assessment' ? <BarChart3 size={20} /> : item.type === 'program' ? <Play size={20} /> : <Smile size={20} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ ...f('sm', 500), margin: 0 }}>{item.label}</h3>
                        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                          {item.detail}{item.date && item.type !== 'mood' ? ` · ${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                        </p>
                      </div>
                      <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    </div>
                  </div>
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
            <motion.div
              onClick={() => { if (hasLoggedMoodToday) { onNavigate?.('/mood-journal'); } else { onNavigate?.(`/equip-program-flow?id=${SPECIAL_PROGRAM_IDS.DAILY_TRACKER}`); } }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', overflow: 'hidden', border: hasLoggedMoodToday ? '1px solid var(--color-status-success-light)' : '1px solid var(--color-border-default)' }}
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
            </motion.div>

            {/* Right: Wellness Insight */}
            <div
              onClick={() => onNavigate?.(engineResult ? '/timeline' : '/mood-journal')}
              style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-default)', cursor: 'pointer', overflow: 'hidden' }}
            >
              <div className="flex items-center" style={{ padding: 'var(--spacing-4) var(--spacing-5)', gap: 'var(--spacing-4)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  backgroundColor: engineResult ? (engineResult.severity === 'low' ? 'var(--color-status-success-light)' : engineResult.severity === 'moderate' ? 'var(--color-status-warning-light)' : 'var(--color-status-danger-light)') : 'var(--color-bg-muted)',
                  color: engineResult ? (engineResult.severity === 'low' ? 'var(--color-status-success)' : engineResult.severity === 'moderate' ? 'var(--color-status-warning)' : 'var(--color-status-danger)') : 'var(--color-text-muted)',
                }}>
                  <TrendingUp size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ ...f('sm', 500), margin: 0 }}>Wellness Insight</h3>
                  <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0', lineHeight: 1.4 }}>
                    {engineResult
                      ? (engineResult.severity === 'low' ? "You're doing well. Keep up the positive habits." : engineResult.severity === 'moderate' ? 'Some areas need attention. Consider your recommendations.' : 'Your well-being needs support. Explore resources below.')
                      : 'Complete an assessment to see your wellness insights.'}
                  </p>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            </div>
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
            <motion.div
              onClick={() => onNavigate?.('/equip')}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid #DDD6FE', padding: '24px 16px', cursor: 'pointer', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}
            >
              {/* Decorative circle */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.06)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#7C3AED' }}>
                  <Brain size={24} />
                </div>
                <h3 style={{ ...f('sm', 500), margin: 0 }}>Programs</h3>
                <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>Guided wellness journeys</p>
              </div>
            </motion.div>
            <motion.div
              onClick={() => onNavigate?.('/assessment')}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid #BAE6FD', padding: '24px 16px', cursor: 'pointer', textAlign: 'center' as const, position: 'relative', overflow: 'hidden' }}
            >
              {/* Decorative circle */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(14,165,233,0.06)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(14,165,233,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0EA5E9' }}>
                  <Compass size={24} />
                </div>
                <h3 style={{ ...f('sm', 500), margin: 0 }}>Assessments</h3>
                <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>Understand your well-being</p>
              </div>
            </motion.div>
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
                  const severityColor = s.severity === 'low' ? 'var(--color-status-success)' : s.severity === 'moderate' ? 'var(--color-status-warning)' : 'var(--color-status-danger)';
                  const severityBg = s.severity === 'low' ? 'var(--color-status-success-light)' : s.severity === 'moderate' ? 'var(--color-status-warning-light)' : 'var(--color-status-danger-light)';
                  return (
                    <div key={s.assessmentId} onClick={() => onNavigate?.(`/assessment-history-detail?id=${s.assessmentId}`)}
                      style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: i < Math.min(assessmentScores.length, 5) - 1 ? '1px solid var(--color-border-default)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-muted)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div className="flex items-center" style={{ gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: severityBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: severityColor, flexShrink: 0 }}>
                          <BarChart3 size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={f('sm', 500)}>{s.assessmentName}</span>
                          <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '1px 0 0' }}>
                            {s.completedAt ? new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'} · Score: {s.score}/{s.maxScore}
                          </p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)', color: severityColor, backgroundColor: severityBg, padding: '2px 8px', borderRadius: 'var(--radius-pill)', textTransform: 'capitalize' as const }}>{s.severity}</span>
                      </div>
                    </div>
                  );
                })}
                <div onClick={() => onNavigate?.('/assessment')} style={{ padding: '12px 20px', cursor: 'pointer', borderTop: '1px solid var(--color-border-default)' }}>
                  <div className="flex items-center justify-center" style={{ gap: 8 }}>
                    <ClipboardList size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={f('xs', 500, 'var(--color-text-muted)')}>Take another assessment</span>
                  </div>
                </div>
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

      {/* Reassessment Prompt - Manual Only */}
      <ReassessmentPrompt isOpen={reassessment.isOpen && reassessment.reason === 'manual'} onClose={handleReassessmentClose} onConfirm={handleReassessmentConfirm} />
    </div>
  );
}