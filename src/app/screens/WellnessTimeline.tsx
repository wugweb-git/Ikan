import React, { useState, useEffect } from 'react';
import { isProgramCheckIn } from '../../lib/assessment-record';
import { severityPresentation, severityOfResult } from '../../lib/severity-presentation';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Smile, Play, Activity, Check, Heart, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../../components/ui/utils';

interface WellnessTimelineProps {
  onNavigate?: (route: string) => void;
}

interface TimelineEvent {
  id: string;
  type: 'assessment' | 'mood' | 'program' | 'checkin' | 'milestone';
  title: string;
  detail: string;
  date: string;
  ts: number;
  route?: string;
  severity?: string;
  score?: number;
  maxScore?: number;
}

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

function getEventIcon(type: string) {
  switch (type) {
    case 'assessment': return <BarChart3 size={16} />;
    case 'mood': return <Smile size={16} />;
    case 'program': return <Play size={16} />;
    case 'checkin': return <Check size={16} />;
    case 'milestone': return <Heart size={16} />;
    default: return <Activity size={16} />;
  }
}

function getEventColors(type: string, severity?: string) {
  if (type === 'assessment' && severity) {
    // One map, on the 5-term clinical vocabulary. The ternary pair this
    // replaces spoke the retired 3 terms with no else-branch but danger, so
    // `minimal` and `mild` — the two reassuring results — rendered red.
    const p = severityPresentation(severity);
    return { bg: p.background, fg: p.color };
  }
  switch (type) {
    case 'mood': return { bg: 'var(--color-status-success-light)', fg: 'var(--color-status-success)' };
    case 'program': return { bg: 'var(--color-accent-default)', fg: 'var(--color-primary-default)' };
    case 'checkin': return { bg: '#EDE9FE', fg: '#7C3AED' };
    case 'milestone': return { bg: '#FEF3C7', fg: '#D97706' };
    default: return { bg: 'var(--color-bg-muted)', fg: 'var(--color-text-muted)' };
  }
}

export function WellnessTimeline({ onNavigate }: WellnessTimelineProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadTimelineData();
  }, [user]);

  const loadTimelineData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const allEvents: TimelineEvent[] = [];

      // Pre-fetch assessment definitions for name resolution
      let assessmentNameMap: Map<string, string> | undefined;
      let assessmentMaxScoreMap: Map<string, number> | undefined;
      try {
        const assessmentDefs = await apiClient.getAssessments();
        if (Array.isArray(assessmentDefs) && assessmentDefs.length > 0) {
          assessmentNameMap = new Map<string, string>();
          assessmentMaxScoreMap = new Map<string, number>();
          for (const d of assessmentDefs) {
            const defId = d.id || d.slug;
            const defTitle = d.title || d.name;
            if (defId && defTitle) {
              assessmentNameMap.set(defId, defTitle);
              if (d.slug && d.id !== d.slug) assessmentNameMap.set(d.slug, defTitle);
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
      } catch { /* non-critical */ }

      // Helper to resolve assessment name
      const resolveAssessmentName = (id: string, rawName: string): string => {
        if (assessmentNameMap?.has(id)) return assessmentNameMap.get(id)!;
        if (rawName && rawName.includes(' ') && !rawName.startsWith('asm_') && !rawName.startsWith('checkin_')) return rawName;
        return id.replace(/^asm_\d+_/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Assessment';
      };

      // Fetch assessment history
      try {
        const assessmentData = await apiClient.getUserAssessmentResponses().catch(() => ({ history: [] }));
        const responses = (assessmentData as any)?.history || (assessmentData as any)?.responses || [];
        if (Array.isArray(responses)) {
          for (const r of responses) {
            if (r.status !== 'completed' || !r.score) continue;
            const id = r.assessment_id || r.assessmentId || 'general';
            // Skip check-ins
            if (isProgramCheckIn(r)) continue;
            
            /**
             * Denominator from the record, or none.
             *
             * `|| 100` was the hardcoded fallback that made a Stress result of
             * 20/28 read as 20%. The history endpoint now enriches `max_score`
             * from the definition, so the local map below is a fourth
             * computation of a number the server already resolved; it is kept
             * only as a last resort and no longer invents one.
             */
            const resolvedMax = r.max_score || r.maxScore || assessmentMaxScoreMap?.get(id) || null;
            /**
             * Severity is the band the score actually fell in — the same band
             * the user was shown on their result. It used to be re-derived here
             * from a 33/66 split of the percentage, which is a fourth scoring
             * path and disagreed with the result page whenever the instrument's
             * own bands were not evenly spaced. Null renders no badge rather
             * than a guess.
             */
            const severity = severityOfResult(r) ?? undefined;
            const rawName = r.assessment_name || r.assessmentName || r.title || id;
            const name = resolveAssessmentName(id, rawName);

            allEvents.push({
              id: r.id || `assessment-${Date.now()}-${Math.random()}`,
              type: 'assessment',
              title: name,
              detail: resolvedMax
                ? `${Math.round((r.score / resolvedMax) * 100)}% (${r.score}/${resolvedMax})`
                : `Score ${r.score}`,
              date: r.completed_at || r.created_at || '',
              ts: new Date(r.completed_at || r.created_at || 0).getTime(),
              route: '/assessment',
              severity,
              score: r.score,
              maxScore: resolvedMax ?? undefined,
            });
          }
        }
      } catch (e) { console.warn('Timeline: assessment fetch failed', e); }

      // Fetch enrollments
      try {
        const enrollments = await apiClient.getUserEnrollments();
        for (const e of enrollments) {
          // Try to get program name
          let programTitle = e.equip_id;
          try {
            const program = await apiClient.getEquipProgram(e.equip_id);
            if (program?.title) programTitle = program.title;
          } catch { /* use ID as fallback */ }

          allEvents.push({
            id: `enrollment-${e.equip_id}-${e.enrolled_at}`,
            type: e.status === 'completed' ? 'milestone' : 'program',
            title: e.status === 'completed' ? `Completed ${programTitle}` : `Enrolled in ${programTitle}`,
            detail: e.status === 'completed'
              ? 'Program completed'
              : `Day ${e.current_day_number || 1}`,
            date: e.status === 'completed' ? (e.completed_at || e.updated_at || e.enrolled_at) : e.enrolled_at,
            ts: new Date(e.status === 'completed' ? (e.completed_at || e.updated_at || e.enrolled_at) : e.enrolled_at).getTime(),
            route: `/equip-program-flow?id=${e.equip_id}`,
          });
        }
      } catch (e) { console.warn('Timeline: enrollment fetch failed', e); }

      // Fetch mood journal entries (last 30 days)
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const journalData = await apiClient.getJournalEntries(
          thirtyDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ).catch(() => ({ entries: [] }));
        const entries = (journalData as any)?.entries || [];
        for (const entry of entries) {
          allEvents.push({
            id: entry.id || `mood-${entry.date || entry.created_at}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'mood',
            title: 'Mood check-in',
            detail: entry.mood_label || entry.mood || 'Logged',
            date: entry.date || entry.created_at || '',
            ts: new Date(entry.date || entry.created_at || 0).getTime(),
            route: '/mood-journal',
          });
        }
      } catch (e) { console.warn('Timeline: mood fetch failed', e); }

      // Sort by timestamp descending
      allEvents.sort((a, b) => b.ts - a.ts);
      setEvents(allEvents);
    } catch (error) {
      console.error('Timeline load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = event.date ? new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className={cn('max-w-3xl mx-auto pb-28')} style={{ padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-28)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 'var(--spacing-6)' }}
      >
        <div className="flex items-center" style={{ gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
          <button
            onClick={() => onNavigate?.('/dashboard')}
            className="flex items-center justify-center shrink-0 hover:bg-black/5 active:bg-black/10 transition-colors"
            style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <div>
            <h1 style={{ ...f('2xl', 500), margin: 0, lineHeight: 1.2 }}>Wellness Timeline</h1>
            <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>Your mental health journey</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{
          backgroundColor: 'var(--color-primary-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 'var(--spacing-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', opacity: 0.05 }} viewBox="0 0 200 200" preserveAspectRatio="none">
          <path d="M100 0 Q120 50 100 100 Q80 150 100 200 L200 200 L200 0 Z" fill="white" />
        </svg>
        <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ ...f('xs', 500, 'color-mix(in srgb, var(--color-text-inverse) 60%, transparent)'), margin: 0, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Total Events</p>
            <h2 style={{ ...f('3xl', 500, 'var(--color-text-inverse)'), margin: '4px 0 0' }}>{events.length}</h2>
          </div>
          <div className="flex" style={{ gap: 16 }}>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ ...f('lg', 500, 'var(--color-text-inverse)'), margin: 0 }}>{events.filter(e => e.type === 'assessment').length}</p>
              <p style={{ ...f('xs', 400, 'color-mix(in srgb, var(--color-text-inverse) 60%, transparent)'), margin: '2px 0 0' }}>Assessments</p>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ ...f('lg', 500, 'var(--color-text-inverse)'), margin: 0 }}>{events.filter(e => e.type === 'mood').length}</p>
              <p style={{ ...f('xs', 400, 'color-mix(in srgb, var(--color-text-inverse) 60%, transparent)'), margin: '2px 0 0' }}>Moods</p>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ ...f('lg', 500, 'var(--color-text-inverse)'), margin: 0 }}>{events.filter(e => e.type === 'program' || e.type === 'milestone').length}</p>
              <p style={{ ...f('xs', 400, 'color-mix(in srgb, var(--color-text-inverse) 60%, transparent)'), margin: '2px 0 0' }}>Programs</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse" style={{ height: 70, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-muted)' }} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-default)',
            padding: '40px 24px',
            textAlign: 'center' as const,
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-text-muted)' }}>
            <TrendingUp size={24} />
          </div>
          <h3 style={{ ...f('base', 500), margin: '0 0 6px' }}>Your timeline is empty</h3>
          <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '0 0 20px', lineHeight: 1.5 }}>
            Start an assessment, log your mood, or join a program to build your wellness timeline.
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
        </motion.div>
      )}

      {/* Timeline */}
      {!loading && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {Object.entries(groupedEvents).map(([dateKey, dayEvents], groupIdx) => (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(groupIdx * 0.05, 0.3) }}
            >
              {/* Date Header */}
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                  {dateKey}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border-default)' }} />
              </div>

              {/* Events for this date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayEvents.map((event) => {
                  const colors = getEventColors(event.type, event.severity);
                  const pct = event.type === 'assessment' && event.score !== undefined && event.maxScore
                    ? Math.round((event.score / event.maxScore) * 100)
                    : null;
                  return (
                    <div
                      key={event.id}
                      onClick={() => event.route && onNavigate?.(event.route)}
                      className="active:bg-black/[0.03] transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border-default)',
                        padding: '14px 16px',
                        cursor: event.route ? 'pointer' : 'default',
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 12 }}>
                        {/* Show mini ring for assessments, icon for others */}
                        {pct !== null ? (
                          <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
                            <svg viewBox="0 0 36 36" width={36} height={36}>
                              <circle cx={18} cy={18} r={14} fill="none" stroke="var(--color-bg-muted)" strokeWidth={2.5} />
                              <circle cx={18} cy={18} r={14} fill="none" stroke={colors.fg} strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 14}`}
                                strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                              />
                            </svg>
                            <span style={{
                              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 500, fontFamily: 'var(--font-family-base)', color: colors.fg,
                            }}>
                              {pct}%
                            </span>
                          </div>
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: colors.bg, color: colors.fg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {getEventIcon(event.type)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ ...f('sm', 500), margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h4>
                          <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '1px 0 0' }}>
                            {event.detail}
                            {event.date && ` \u00B7 ${new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                          </p>
                        </div>
                        {event.severity && (
                          <span style={{
                            fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                            color: colors.fg, backgroundColor: colors.bg,
                            padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                            textTransform: 'capitalize' as const, flexShrink: 0,
                          }}>
                            {event.severity}
                          </span>
                        )}
                        {event.route && <ChevronRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0, opacity: 0.4 }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}