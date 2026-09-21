import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { CircleCheck, Trophy, Calendar, ArrowRight, Star, BookOpen, BarChart3, Sparkles } from 'lucide-react';
import { apiClient } from '../../shared/api';
import { equipDiaryUrl } from '../lib/slug';
import { EquipProgram } from '../../shared/blocks/block-model';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// ── Design token font helper ──────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface EquipProgramCompletionProps {
  programId?: string;
  onContinue?: () => void;
  onBackToDashboard?: () => void;
  onNavigate?: (route: string) => void;
}

interface CompletionStats {
  activitiesCompleted: number;
  totalActivities: number;
  daysCompleted: number;
  totalDays: number;
  topicsCovered: string[];
}

// Derive stats from real program + progress data
function deriveCompletionStats(program: EquipProgram, completedDays: number[]): CompletionStats {
  const totalDays = program.daily_content?.length || 0;
  const daysCompleted = completedDays.length;

  let totalActivities = 0;
  let activitiesCompleted = 0;
  const topicSet = new Set<string>();

  (program.daily_content || []).forEach(day => {
    const count = day.activities?.length || 0;
    totalActivities += count;
    if (completedDays.includes(day.day)) {
      activitiesCompleted += count;
    }
    // Collect topics from day titles
    if (day.title && day.title !== 'Assessment' && day.title !== 'Onboarding') {
      topicSet.add(day.title);
    }
  });

  return {
    activitiesCompleted,
    totalActivities: totalActivities || 1,
    daysCompleted,
    totalDays: totalDays || 1,
    topicsCovered: Array.from(topicSet).slice(0, 8),
  };
}

export function EquipProgramCompletion({ programId, onContinue, onBackToDashboard, onNavigate }: EquipProgramCompletionProps) {
  const isMobile = useIsMobile();
  const [program, setProgram] = useState<EquipProgram | null>(null);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleContinue = onContinue || (onNavigate ? () => onNavigate('/equip') : undefined);
  const handleBackToDashboard = onBackToDashboard || (onNavigate ? () => onNavigate('/dashboard') : undefined);

  // Resolve programId from props or URL query
  const resolvedId = programId || (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || '';
    } catch { return ''; }
  })();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!resolvedId) {
        setError('No program ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        /*
          `resolvedId` may be a SLUG now that this page lives at
          /equip/<slug>/result. `getEquipProgram` resolves either, and everything
          after it uses the id the record came back with — the progress endpoint
          takes an id only.
        */
        const programFirst = await apiClient.getEquipProgram(resolvedId);
        const realId: string = programFirst?.id || resolvedId;

        // Fetch program + progress in parallel
        const [programData, progressData] = await Promise.all([
          Promise.resolve(programFirst),
          apiClient.getEnrollmentProgress(realId).catch(() => null),
        ]);

        if (!isMounted) return;

        if (!programData) {
          setError('Program not found');
          setLoading(false);
          return;
        }

        setProgram(programData as EquipProgram);

        // Extract completed days from progress
        const completedDays: number[] = progressData?.completed_days || [];
        const derivedStats = deriveCompletionStats(programData as EquipProgram, completedDays);
        setStats(derivedStats);

        // Fetch recommendations (non-blocking)
        try {
          const recs = await apiClient.getRecommendations();
          if (isMounted && Array.isArray(recs)) {
            // Enrich each rec with a navigation link
            const enriched = recs.slice(0, 3).map((rec: any) => ({
              ...rec,
              link: rec.link || (rec.equip_id ? `/equip-detail?id=${rec.equip_id}` : null),
              title: rec.title || rec.name || 'Recommended Program',
              description: rec.description || rec.rationale || '',
            }));
            setRecommendations(enriched);
          }
        } catch {
          // Non-critical
        }

      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load completion data:', err);
          setError(err.message || 'Failed to load program data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    // Celebration auto-dismiss
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [resolvedId]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <LoadingSpinner message="Loading your results..." />
      </div>
    );
  }

  // ── Error state ──
  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4 max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--color-status-danger-light)' }}
          >
            <BarChart3 size={28} style={{ color: 'var(--color-status-danger)' }} />
          </div>
          <h2 style={f('xl', 500)}>Unable to load completion data</h2>
          <p style={f('sm', 400, 'var(--color-text-muted)')}>
            {error || 'Program data is unavailable. Please try again.'}
          </p>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // ── Stats ──
  const completionPct = stats ? (stats.activitiesCompleted / stats.totalActivities) * 100 : 0;
  const consistencyPct = stats ? (stats.daysCompleted / stats.totalDays) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Celebration Overlay */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-center space-y-4"
          >
            <div
              className="p-8 rounded-full mx-auto w-28 h-28 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-status-success)' }}
            >
              <Trophy size={56} style={{ color: 'white' }} />
            </div>
            <h1 style={f('3xl', 500, 'var(--color-status-success)')}>Congratulations!</h1>
            <p style={f('lg', 400)}>You've completed the program!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', overflow: 'hidden', marginBottom: 24 }}>
            <CardContent style={{ padding: isMobile ? 24 : 40 }}>
              <div className="text-center space-y-5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: 'var(--color-status-success)' }}
                >
                  <Trophy size={40} style={{ color: 'white' }} />
                </div>

                <div className="space-y-2">
                  <h1 style={f('2xl', 500)}>Program Completed!</h1>
                  <h2 style={f('lg', 500)}>{program.title}</h2>
                  <p style={{ ...f('base', 400, 'var(--color-text-muted)'), lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
                    You've successfully completed your journey. Here's a summary of what you achieved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            style={{ marginBottom: 24 }}
          >
            {[
              {
                icon: CircleCheck,
                value: stats.activitiesCompleted,
                label: 'Activities',
                color: 'var(--color-status-info)',
                bg: 'var(--color-status-info-light)',
                sub: `${completionPct.toFixed(0)}% complete`,
                pct: completionPct,
              },
              {
                icon: Calendar,
                value: stats.daysCompleted,
                label: 'Days Active',
                color: 'var(--color-status-success)',
                bg: 'var(--color-status-success-light)',
                sub: `of ${stats.totalDays} days`,
                pct: consistencyPct,
              },
              {
                icon: BookOpen,
                value: stats.topicsCovered.length,
                label: 'Topics Covered',
                color: 'var(--color-status-warning)',
                bg: 'var(--color-status-warning-light)',
                sub: null,
                pct: null,
              },
              {
                icon: Sparkles,
                value: stats.daysCompleted >= stats.totalDays ? 'Complete' : `${consistencyPct.toFixed(0)}%`,
                label: 'Journey Status',
                color: 'var(--color-primary-default)',
                bg: 'color-mix(in srgb, var(--color-primary-default) 10%, transparent)',
                sub: null,
                pct: null,
              },
            ].map((card, i) => (
              <Card key={i} style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
                <CardContent style={{ padding: 16, textAlign: 'center' }}>
                  <div className="space-y-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                      style={{ backgroundColor: card.bg }}
                    >
                      <card.icon size={20} style={{ color: card.color }} />
                    </div>
                    <div>
                      <p style={f('xl', 500)}>{card.value}</p>
                      <p style={f('xs', 400, 'var(--color-text-muted)')}>{card.label}</p>
                    </div>
                    {card.pct !== null && (
                      <>
                        <Progress value={card.pct} className="h-1.5" />
                        <p style={f('xs', 400, 'var(--color-text-muted)')}>{card.sub}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Topics Covered */}
        {stats && stats.topicsCovered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', marginBottom: 24 }}>
              <CardContent style={{ padding: 20 }}>
                <h3 style={{ ...f('base', 500), marginBottom: 16 }}>Topics You Explored</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.topicsCovered.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-muted)',
                      }}
                    >
                      <CircleCheck size={16} style={{ color: 'var(--color-status-success)', flexShrink: 0 }} />
                      <span style={f('sm', 400)}>{topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* No topics fallback */}
        {stats && stats.topicsCovered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', marginBottom: 24 }}>
              <CardContent style={{ padding: 24, textAlign: 'center' }}>
                <Star size={24} style={{ color: 'var(--color-status-warning)', margin: '0 auto 8px' }} />
                <p style={f('sm', 400, 'var(--color-text-muted)')}>
                  You completed {stats.daysCompleted} day{stats.daysCompleted !== 1 ? 's' : ''} of content across {stats.activitiesCompleted} activities.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommendations (from KV) */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', marginBottom: 24 }}>
              <CardContent style={{ padding: 20 }}>
                <h3 style={{ ...f('base', 500), marginBottom: 16 }}>What's Next?</h3>
                <div className="space-y-3">
                  {recommendations.map((rec: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => rec.link && onNavigate?.(rec.link)}
                      className="w-full flex items-center gap-4 text-left"
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-muted)',
                        border: 'none',
                        cursor: rec.link ? 'pointer' : 'default',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary-default) 10%, transparent)' }}
                      >
                        <ArrowRight size={16} style={{ color: 'var(--color-primary-default)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={f('sm', 500)}>{rec.title || rec.name || 'Recommendation'}</p>
                        {rec.description && (
                          <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), marginTop: 2 }}>
                            {rec.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            style={{ borderRadius: 'var(--radius-md)', height: 48, ...f('sm', 500) }}
          >
            Back to Dashboard
          </Button>
          {resolvedId && onNavigate && (
            <Button
              variant="outline"
              onClick={() => onNavigate(equipDiaryUrl(program ?? { id: resolvedId }))}
              className="gap-2"
              style={{ borderRadius: 'var(--radius-md)', height: 48, ...f('sm', 500) }}
            >
              <BookOpen size={16} />
              View Learning Diary
            </Button>
          )}
          <Button
            onClick={handleContinue}
            className="gap-2"
            style={{
              borderRadius: 'var(--radius-md)',
              height: 48,
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-text-inverse)',
              ...f('sm', 500, 'var(--color-text-inverse)'),
            }}
          >
            Explore More Programs
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}