import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ArrowRight, Activity, Smile, Check, Brain, Compass, BarChart3, ClipboardList, Play } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SPECIAL_PROGRAM_IDS } from '../../lib/constants/content';
import { ProgramCheckIn } from '../equip/ProgramCheckIn';
import { ReassessmentPrompt } from '../assessments/ReassessmentPrompt';
import { checkReassessmentTriggers, ReassessmentReason } from '../../lib/reassessment-triggers';
import { ActivityCard } from '../integrations/ActivityCard';
import { useGoogleFit } from '../integrations/GoogleFitContext';
import { cn } from '../ui/utils';
import { evaluateAssessment, EngineResult } from '../../lib/recommendation-engine';
import { RecommendationCards } from '../RecommendationCards';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { HelloWidget } from '../HelloWidget';
import { ProgramProgressTracker } from '../ProgramProgressTracker';
import { DashboardActionBlocks } from '../DashboardActionBlocks';
import { LoadingSpinner } from '../LoadingSpinner';
import { CorporateProgramCard } from '../CorporateProgramCard';

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

// ─── Apple-style Explore Widget ───────────────────────────────────
function ExploreWidget({
  title,
  subtitle,
  icon,
  imageUrl,
  gradientFrom,
  gradientTo,
  onClick,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  imageUrl: string;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        height: 180,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background image */}
      <ImageWithFallback
        src={imageUrl}
        alt={title}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, ${gradientFrom}E6 0%, ${gradientTo}CC 50%, ${gradientTo}99 100%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: Icon badge */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-inverse)',
          }}
        >
          {icon}
        </div>

        {/* Bottom: text + arrow */}
        <div>
          <h3
            style={{
              ...f('base', 500, 'var(--color-text-inverse)'),
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
          <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
            <p
              style={{
                ...f('xs', 400, 'rgba(255,255,255,0.75)'),
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              <ArrowRight size={14} color="var(--color-text-inverse)" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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

  // Check-in State
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInProgram, setCheckInProgram] = useState<{ id: string; title: string; day: number } | null>(null);

  // Reassessment State
  const [reassessment, setReassessment] = useState<{ isOpen: boolean; reason: ReassessmentReason }>({ isOpen: false, reason: 'manual' });

  useEffect(() => {
    let isMounted = true;

    if (user?.user_metadata?.full_name || user?.email) {
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend');
    }
    if (user) {
      loadDashboardData(isMounted);
      runReassessmentChecks();
    }

    return () => { isMounted = false; };
  }, [user]);

  const runReassessmentChecks = async () => {
    if (!user) return;
    const dismissedAt = localStorage.getItem(`reassessment_dismissed_${user.id}`);
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }
    const { shouldTrigger, reason } = await checkReassessmentTriggers(user.id);
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
    if (user) localStorage.setItem(`reassessment_dismissed_${user.id}`, Date.now().toString());
  };

  const loadDashboardData = async (isMounted: boolean = true) => {
    if (!user) return;
    const CACHE_KEY = `dashboard_data_${user.id}`;

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
            .filter((r: any) => r.status === 'completed' && r.score !== undefined)
            .sort((a: any, b: any) => new Date(b.completed_at || b.created_at || 0).getTime() - new Date(a.completed_at || a.created_at || 0).getTime());

          // Build latest score per assessment type
          const latestByType = new Map<string, any>();
          for (const r of completedResponses) {
            const id = r.assessment_id || r.assessmentId || 'general';
            if (!latestByType.has(id)) latestByType.set(id, r);
          }
          const scores: AssessmentScore[] = Array.from(latestByType.entries()).map(([id, r]) => {
            const maxScore = r.max_score || r.maxScore || 100;
            const result = evaluateAssessment(id, r.score || 0, maxScore);
            const name = r.assessment_name || r.assessmentName || r.title || id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            return {
              assessmentId: id,
              assessmentName: name,
              score: r.score || 0,
              maxScore,
              severity: result.severity,
              completedAt: r.completed_at || r.created_at || '',
            };
          });
          setAssessmentScores(scores);

          // Engine result from latest overall
          if (completedResponses.length > 0) {
            const latest = completedResponses[0];
            const slug = latest.assessment_id || latest.assessmentId || 'general';
            const result = evaluateAssessment(slug, latest.score || 0, latest.max_score || latest.maxScore || 100);
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

  const handleManualCheckIn = () => {
    if (activeEnrollment && activeProgram) {
      setCheckInProgram({ id: activeEnrollment.equip_id, title: activeProgram.title, day: activeEnrollment.current_day_number });
      setShowCheckIn(true);
    } else {
      showToast('info', 'No Active Program', 'Join a program first to check your progress.');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className={cn('max-w-4xl mx-auto pb-28', className)} style={{ padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-28)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

        {/* ─── WIDGET 1: Header + HelloWidget ─── */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Dashboard greeting"
          data-widget="greeting"
        >
          <HelloWidget userName={userName} />
        </motion.header>

        {/* ─── WIDGET 1b: Corporate Program (if enrolled) ─── */}
        <CorporateProgramCard onNavigate={onNavigate} />

        {/* ─── WIDGET 2: Assessment Scores ─── */}
        <motion.section
          aria-label="Assessment scores"
          data-widget="assessment-scores"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <SectionLabel>Assessments</SectionLabel>
          <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>
            {assessmentScores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {assessmentScores.map((s, i) => {
                  const severityColor = s.severity === 'low' ? 'var(--color-status-success)' : s.severity === 'moderate' ? 'var(--color-status-warning)' : 'var(--color-status-danger)';
                  const severityBg = s.severity === 'low' ? 'var(--color-status-success-light)' : s.severity === 'moderate' ? 'var(--color-status-warning-light)' : 'var(--color-status-danger-light)';
                  return (
                    <div
                      key={s.assessmentId}
                      onClick={() => onNavigate?.('/assessment')}
                      style={{
                        padding: '16px 20px', cursor: 'pointer',
                        borderBottom: i < assessmentScores.length - 1 ? '1px solid var(--color-border-default)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-muted)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div className="flex items-center" style={{ gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          backgroundColor: severityBg, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: severityColor, flexShrink: 0,
                        }}>
                          <BarChart3 size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center" style={{ gap: 8 }}>
                            <span style={f('sm', 500)}>{s.assessmentName}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                              color: severityColor, backgroundColor: severityBg,
                              padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                              textTransform: 'capitalize' as const,
                            }}>
                              {s.severity}
                            </span>
                          </div>
                          <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                            Score: {s.score}/{s.maxScore} · {s.completedAt ? new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                          </p>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      </div>
                    </div>
                  );
                })}
                {/* CTA to take more */}
                <div
                  onClick={() => onNavigate?.('/assessment')}
                  style={{ padding: '14px 20px', cursor: 'pointer', borderTop: assessmentScores.length > 0 ? '1px solid var(--color-border-default)' : 'none' }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 8 }}>
                    <ClipboardList size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={f('sm', 500, 'var(--color-text-muted)')}>Take another assessment</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state: no assessments taken yet */
              <div style={{ padding: '24px 20px', textAlign: 'center' as const }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-muted)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', color: 'var(--color-text-muted)',
                }}>
                  <ClipboardList size={22} />
                </div>
                <h3 style={{ ...f('sm', 500), margin: '0 0 4px' }}>No assessments yet</h3>
                <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '0 0 16px', lineHeight: 1.5 }}>
                  Take a quick assessment to understand where you stand.
                </p>
                <button
                  onClick={() => onNavigate?.('/assessment')}
                  className="flex items-center justify-center"
                  style={{
                    margin: '0 auto', padding: '10px 24px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                    border: 'none', cursor: 'pointer', gap: 8,
                    ...f('sm', 500, 'var(--color-text-inverse)'),
                  }}
                >
                  <Play size={14} fill="currentColor" /> Begin Assessment
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── WIDGET 3: Equip Progress ─── */}
        <motion.section
          aria-label="Program progress"
          data-widget="program-progress"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <ProgramProgressTracker
            activeEnrollment={activeEnrollment}
            activeProgram={activeProgram}
            completedEnrollments={completedEnrollments}
            engineResult={null}
            onNavigate={onNavigate}
          />
        </motion.section>

        {/* ─── WIDGET 4: Today's Check-ins ─── */}
        <motion.section
          aria-label="Today's check-ins"
          data-widget="today-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <SectionLabel>Today</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {/* Mood Check-in */}
            <motion.div
              onClick={() => {
                if (hasLoggedMoodToday) { onNavigate?.('/mood-journal'); }
                else { onNavigate?.(`/equip-program-flow?id=${SPECIAL_PROGRAM_IDS.DAILY_TRACKER}`); }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                overflow: 'hidden',
                border: hasLoggedMoodToday
                  ? '1px solid var(--color-status-success-light)'
                  : '1px solid var(--color-border-default)',
              }}
            >
              <div className="flex items-center" style={{ padding: 'var(--spacing-4) var(--spacing-5)', gap: 'var(--spacing-4)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: hasLoggedMoodToday ? 'var(--color-status-success)' : 'var(--color-bg-muted)',
                  color: hasLoggedMoodToday ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                  transition: 'all 0.25s',
                }}>
                  {hasLoggedMoodToday ? <Check size={22} strokeWidth={3} /> : <Smile size={22} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ ...f('sm', 500), margin: 0 }}>
                    {hasLoggedMoodToday ? 'Mood logged for today' : 'Log your mood'}
                  </h3>
                  <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0', lineHeight: 1.4 }}>
                    {hasLoggedMoodToday
                      ? 'Nice work reflecting today. You can log again anytime.'
                      : 'A quick check-in to track your well-being.'}
                  </p>
                </div>
                {!hasLoggedMoodToday ? (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ArrowRight size={16} />
                  </div>
                ) : (
                  <span style={{
                    ...f('xs', 500, 'var(--color-status-success)'),
                    backgroundColor: 'var(--color-status-success-light)',
                    padding: '3px 10px', borderRadius: 'var(--radius-pill)', flexShrink: 0,
                  }}>
                    Done
                  </span>
                )}
              </div>
            </motion.div>

            {/* Activity (Health Connect) */}
            <ActivityCard />

            {/* Program Check-in (conditional) */}
            {activeEnrollment && (activeEnrollment.status === 'completed' || [7, 14, 30].includes(activeEnrollment.current_day_number)) && (
              <motion.div
                onClick={handleManualCheckIn}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className="flex items-center justify-between" style={{ gap: 'var(--spacing-4)' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      ...f('xs', 500, 'rgba(255,255,255,0.55)'),
                      display: 'block', marginBottom: 'var(--spacing-1)',
                      textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                    }}>
                      Check-in ready
                    </span>
                    <h3 style={{ ...f('sm', 500, 'var(--color-text-inverse)'), margin: 0 }}>
                      How is this program working for you?
                    </h3>
                    <p style={{ ...f('xs', 400, 'rgba(255,255,255,0.65)'), margin: '3px 0 0' }}>
                      Quick check-in for {activeProgram?.title || 'your journey'}
                    </p>
                  </div>
                  <button style={{
                    backgroundColor: 'var(--color-bg-card)', color: 'var(--color-primary-default)',
                    borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                    padding: 'var(--spacing-2) var(--spacing-4)', ...f('xs', 500, 'var(--color-primary-default)'),
                  }}>
                    Check Progress
                  </button>
                </div>
              </motion.div>
            )}

            {/* Re-check assessment (conditional inline) */}
            {reassessment.isOpen && reassessment.reason !== 'manual' && (
              <div style={{
                backgroundColor: 'var(--color-status-warning-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 20px',
                border: '1px solid var(--color-border-default)',
              }}>
                <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-status-warning)', flexShrink: 0,
                  }}>
                    <Activity size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ ...f('sm', 500), margin: 0 }}>Ready for a re-check?</h3>
                    <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                      See how things have changed since your last assessment.
                    </p>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                    <button onClick={handleReassessmentClose} style={{
                      background: 'none', border: 'none', cursor: 'pointer', ...f('xs', 400, 'var(--color-text-muted)'),
                    }}>
                      Not now
                    </button>
                    <button onClick={handleReassessmentConfirm} style={{
                      padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                      border: 'none', cursor: 'pointer', ...f('xs', 500, 'var(--color-text-inverse)'),
                    }}>
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── WIDGET 5: Explore — Equip & Assessment ─── */}
        <motion.section
          aria-label="Explore programs and assessments"
          data-widget="explore-grid"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <SectionLabel>Explore</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <ExploreWidget
              title="Explore Equip"
              subtitle="Guided programs for your mind"
              icon={<Compass size={20} />}
              imageUrl="https://images.unsplash.com/photo-1764192114257-ae9ecf97eb6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwbWVkaXRhdGlvbiUyMHBlYWNlZnVsJTIwbWluZGZ1bG5lc3MlMjBuYXR1cmV8ZW58MXx8fHwxNzcxOTMzNTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              gradientFrom="var(--ikan-gradient-equip-from)"
              gradientTo="var(--ikan-gradient-equip-to)"
              onClick={() => onNavigate?.('/equip')}
              delay={0.22}
            />
            <ExploreWidget
              title="Explore Assessment"
              subtitle="Understand where you stand"
              icon={<Brain size={20} />}
              imageUrl="https://images.unsplash.com/photo-1768335590901-9cf8b664db9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMGpvdXJuYWwlMjBzZWxmJTIwcmVmbGVjdGlvbiUyMHdyaXRpbmd8ZW58MXx8fHwxNzcxOTMzNTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              gradientFrom="var(--ikan-gradient-assessment-from)"
              gradientTo="var(--ikan-gradient-assessment-to)"
              onClick={() => onNavigate?.('/assessment')}
              delay={0.26}
            />
          </div>
        </motion.section>

        {/* ─── WIDGET 6: Wellness Insights ─── */}
        {engineResult && onNavigate && (
          <motion.section
            aria-label="Personalized wellness insights"
            data-widget="wellness-insights"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <SectionLabel>Wellness Insights</SectionLabel>
            <RecommendationCards
              engineResult={engineResult}
              onNavigate={onNavigate}
            />
          </motion.section>
        )}

        {/* ─── WIDGET 7: From Our Library ─── */}
        {(resources.length > 0 || resourcesLoading) && (
          <motion.section
            aria-label="From our library"
            data-widget="resource-library"
            style={{ marginLeft: -16, marginRight: -16 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <ResourceBlock
              title="From Our Library"
              posts={resources}
              loading={resourcesLoading}
              onPostClick={(post) => onNavigate?.(`/resource-detail?id=${post.id}`)}
              onViewAll={() => onNavigate?.('/library')}
              viewAllText="View All"
              maxPosts={6}
            />
          </motion.section>
        )}

        {/* ─── WIDGET 8: Professional Support ─── */}
        <motion.section
          aria-label="Professional consultation"
          data-widget="consultation"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
        >
          <SectionLabel>Support</SectionLabel>
          <DashboardActionBlocks onNavigate={onNavigate} />
        </motion.section>

      </div>

      {/* Program Check-in Modal */}
      {checkInProgram && (
        <ProgramCheckIn
          programId={checkInProgram.id}
          programTitle={checkInProgram.title}
          currentDay={checkInProgram.day}
          isOpen={showCheckIn}
          onClose={() => setShowCheckIn(false)}
        />
      )}
      {/* Reassessment Prompt - Manual Only */}
      <ReassessmentPrompt
        isOpen={reassessment.isOpen && reassessment.reason === 'manual'}
        onClose={handleReassessmentClose}
        onConfirm={handleReassessmentConfirm}
      />
    </div>
  );
}