import { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api-client';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileHeader } from '../shell/navigation/MobileHeader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { BookOpen, Smile, BarChart3, ChevronDown, ChevronRight, FileText, Tag, Zap, Brain, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── font helper ─────────────────────────────────────────────────
const f = (size = 'sm', weight: 400 | 500 = 400, color?: string): React.CSSProperties => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  ...(color ? { color } : {}),
});

// ── Types ───────────────────────────────────────────────────────
interface DayEntry {
  type: 'program_day';
  dayNumber: number;
  dayTitle: string;
  completed: boolean;
  completedAt?: string;
  responses: {
    blockId: string;
    blockType: string;
    blockTitle: string;
    response: any;
  }[];
}

interface MoodEntry {
  type: 'mood';
  date: string;
  mood: number | string;
  energy?: number | string;
  stress?: number | string;
  note: string;
  tags: string[];
}

interface AssessmentEntry {
  type: 'assessment';
  date: string;
  assessmentId: string;
  assessmentName: string;
  score: number;
  maxScore: number | null;
  pct: number | null;
  severity?: string;
}

interface DiaryData {
  programId: string;
  programTitle: string;
  enrollment: {
    status: string;
    startedAt: string;
    completedAt: string | null;
    currentDay: number;
    totalDays: number;
  };
  days: DayEntry[];
  moods: MoodEntry[];
  assessments: AssessmentEntry[];
}

interface LearningDiaryProps {
  equipId: string;
  onNavigate?: (route: string) => void;
}

// ── Mood emoji helper ───────────────────────────────────────────
function moodToEmoji(mood: number | string): string {
  const n = typeof mood === 'string' ? parseInt(mood) : mood;
  if (isNaN(n)) return '🤔';
  if (n >= 5) return '😊';
  if (n >= 4) return '🙂';
  if (n >= 3) return '😐';
  if (n >= 2) return '😟';
  return '😢';
}

function severityColor(severity?: string): string {
  if (!severity) return 'var(--color-text-muted)';
  const s = severity.toLowerCase();
  if (s.includes('low') || s.includes('minimal') || s.includes('mild')) return 'var(--color-status-success)';
  if (s.includes('moderate')) return 'var(--color-status-warning)';
  return 'var(--color-status-danger)';
}

function severityBg(severity?: string): string {
  if (!severity) return 'var(--color-bg-muted)';
  const s = severity.toLowerCase();
  if (s.includes('low') || s.includes('minimal') || s.includes('mild')) return 'var(--color-status-success-light)';
  if (s.includes('moderate')) return 'var(--color-status-warning-light)';
  return 'var(--color-status-danger-light)';
}

// ── Day Card ────────────────────────────────────────────────────
function DayCard({ day, isMobile }: { day: DayEntry; isMobile: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-default)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full active:bg-black/[0.02] transition-colors"
        style={{
          padding: isMobile ? '14px 16px' : '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Day number badge */}
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: day.completed ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
          color: day.completed ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          ...f('sm', 500),
        }}>
          {day.completed ? <Check size={18} strokeWidth={2.5} /> : day.dayNumber}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ ...f('sm', 500, 'var(--color-text-primary)'), display: 'block' }}>{day.dayTitle}</span>
          {day.completedAt && (
            <span style={{ ...f('xs', 400, 'var(--color-text-muted)'), display: 'block', marginTop: 2 }}>
              {new Date(day.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {day.responses.length > 0 && (
            <span style={{ ...f('xs', 400, 'var(--color-text-muted)') }}>
              {day.responses.length} response{day.responses.length !== 1 ? 's' : ''}
            </span>
          )}
          {expanded ? <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && day.responses.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: isMobile ? '0 16px 16px' : '0 20px 20px',
              borderTop: '1px solid var(--color-border-default)',
              paddingTop: 14,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {day.responses.map((resp) => (
                <div key={resp.blockId} style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-muted)',
                }}>
                  <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}>
                    <FileText size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <span style={f('xs', 500, 'var(--color-text-muted)')}>{resp.blockTitle}</span>
                  </div>
                  <div style={f('sm', 400, 'var(--color-text-primary)')}>
                    {typeof resp.response === 'string' ? resp.response
                      : typeof resp.response === 'number' ? String(resp.response)
                      : Array.isArray(resp.response) ? resp.response.join(', ')
                      : resp.response?.value || resp.response?.text || JSON.stringify(resp.response)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export function LearningDiary({ equipId, onNavigate }: LearningDiaryProps) {
  const isMobile = useIsMobile();
  const [diary, setDiary] = useState<DiaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'moods' | 'assessments'>('timeline');

  useEffect(() => {
    if (!equipId) return;
    let m = true;
    (async () => {
      try {
        /*
          `equipId` may be a SLUG now that the diary lives at /equip/<slug>/diary.
          The diary endpoint takes an id, so a slug is resolved through the
          programme first — the same record the page needs anyway. A UUID is
          passed straight through, so the legacy `?id=` link costs nothing extra.
        */
        const looksLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(equipId);
        const realId = looksLikeId
          ? equipId
          : ((await apiClient.getEquipProgram(equipId).catch(() => null))?.id ?? equipId);
        const res = await apiClient.request(`/user/equip/${realId}/diary`, { method: 'GET' }, true);
        if (m && res?.diary) setDiary(res.diary);
      } catch (err) {
        console.error('Failed to load learning diary:', err);
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => { m = false; };
  }, [equipId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg-page)' }}>
        <LoadingSpinner message="Loading your learning diary..." />
      </div>
    );
  }

  if (!diary) {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: 'var(--color-bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <BookOpen size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <h2 style={{ ...f('lg', 500), margin: '0 0 8px' }}>No diary found</h2>
          <p style={f('sm', 400, 'var(--color-text-muted)')}>Complete program activities to see your learning diary.</p>
        </div>
      </div>
    );
  }

  const { enrollment, days, moods, assessments } = diary;
  const totalResponses = days.reduce((sum, d) => sum + d.responses.length, 0);
  const completedDays = days.filter(d => d.completed).length;
  const duration = enrollment.startedAt && enrollment.completedAt
    ? Math.ceil((new Date(enrollment.completedAt).getTime() - new Date(enrollment.startedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const tabs = [
    { key: 'timeline' as const, label: 'Program Days', icon: BookOpen, count: days.length },
    { key: 'moods' as const, label: 'Mood Journal', icon: Smile, count: moods.length },
    { key: 'assessments' as const, label: 'Assessments', icon: BarChart3, count: assessments.length },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
      {/* Mobile header */}
      {isMobile && (
        <MobileHeader
          title="Learning Diary"
          onBack={() => onNavigate?.('/equip')}
        />
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 120px' : '32px 24px 48px' }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: isMobile ? 20 : 28,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary-default) 0%, #3D3D3D 100%)',
            color: 'white',
            marginBottom: 24,
          }}
        >
          <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}>
            <BookOpen size={18} style={{ opacity: 0.8 }} />
            <span style={{ ...f('xs', 500), color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Learning Diary
            </span>
          </div>
          <h1 style={{ ...f('xl', 500), color: 'white', margin: '0 0 4px' }}>
            {diary.programTitle}
          </h1>
          {enrollment.completedAt && (
            <p style={{ ...f('xs', 400), color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              {new Date(enrollment.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' — '}
              {new Date(enrollment.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap" style={{ gap: 12, marginTop: 18 }}>
            <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} />
              <span style={f('xs', 500, 'white')}>{completedDays}/{enrollment.totalDays} days</span>
            </div>
            {totalResponses > 0 && (
              <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} />
                <span style={f('xs', 500, 'white')}>{totalResponses} responses</span>
              </div>
            )}
            {duration && (
              <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} />
                <span style={f('xs', 500, 'white')}>{duration} days</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Tab bar ────────────────────────────────────────────── */}
        <div className="flex" style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          padding: 4,
          marginBottom: 20,
          gap: 4,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: activeTab === tab.key ? 'var(--color-primary-default)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--color-text-muted)',
                transition: 'all 0.15s',
                ...f('xs', 500),
              }}
            >
              <tab.icon size={14} />
              {!isMobile && tab.label}
              {tab.count > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                  backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-muted)',
                  fontSize: 10, fontWeight: 500,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {days.length === 0 ? (
                  <EmptyState icon={BookOpen} text="No program activity yet." />
                ) : (
                  days.map(day => <DayCard key={day.dayNumber} day={day} isMobile={isMobile} />)
                )}
              </div>
            )}

            {/* MOODS TAB */}
            {activeTab === 'moods' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {moods.length === 0 ? (
                  <EmptyState icon={Smile} text="No mood entries during this program." />
                ) : (
                  moods.map((entry, i) => (
                    <div key={i} style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-default)',
                      padding: isMobile ? '14px 16px' : '16px 20px',
                    }}>
                      <div className="flex items-start" style={{ gap: 12 }}>
                        <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>
                          {moodToEmoji(entry.mood)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="flex items-center justify-between">
                            <span style={f('sm', 500)}>
                              {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex items-center" style={{ gap: 8 }}>
                              {entry.energy && (
                                <span className="flex items-center" style={{ gap: 3, ...f('xs', 400, 'var(--color-text-muted)') }}>
                                  <Zap size={12} /> {entry.energy}
                                </span>
                              )}
                              {entry.stress && (
                                <span className="flex items-center" style={{ gap: 3, ...f('xs', 400, 'var(--color-text-muted)') }}>
                                  <Brain size={12} /> {entry.stress}
                                </span>
                              )}
                            </div>
                          </div>
                          {entry.note && (
                            <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '6px 0 0', lineHeight: 1.5 }}>
                              {entry.note}
                            </p>
                          )}
                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap" style={{ gap: 4, marginTop: 8 }}>
                              {entry.tags.map((tag, ti) => (
                                <span key={ti} style={{
                                  ...f('xs', 400, 'var(--color-text-muted)'),
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-pill)',
                                  backgroundColor: 'var(--color-bg-muted)',
                                  display: 'flex', alignItems: 'center', gap: 3,
                                }}>
                                  <Tag size={10} /> {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ASSESSMENTS TAB */}
            {activeTab === 'assessments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assessments.length === 0 ? (
                  <EmptyState icon={BarChart3} text="No assessments taken during this program." />
                ) : (
                  assessments.map((entry, i) => (
                    <div key={i} style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-default)',
                      padding: isMobile ? '14px 16px' : '16px 20px',
                    }}>
                      <div className="flex items-center" style={{ gap: 12 }}>
                        {/* Score ring */}
                        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                          <svg viewBox="0 0 44 44" width={44} height={44}>
                            <circle cx={22} cy={22} r={18} fill="none" stroke="var(--color-bg-muted)" strokeWidth={3} />
                            <circle cx={22} cy={22} r={18} fill="none"
                              stroke={severityColor(entry.severity)} strokeWidth={3}
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 18}`}
                              strokeDashoffset={`${2 * Math.PI * 18 * (1 - (entry.pct || 0) / 100)}`}
                              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                          </svg>
                          <span style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                            color: severityColor(entry.severity),
                          }}>
                            {entry.pct != null ? `${entry.pct}%` : '—'}
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ ...f('sm', 500), display: 'block' }}>{entry.assessmentName}</span>
                          <span style={{ ...f('xs', 400, 'var(--color-text-muted)'), display: 'block', marginTop: 2 }}>
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' · '}{entry.score}{entry.maxScore ? `/${entry.maxScore}` : ''}
                          </span>
                        </div>

                        {entry.severity && (
                          <span style={{
                            ...f('xs', 500, severityColor(entry.severity)),
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: severityBg(entry.severity),
                            textTransform: 'capitalize',
                            flexShrink: 0,
                          }}>
                            {entry.severity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ icon: IconComp, text }: { icon: React.ElementType; text: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: 40,
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-default)',
    }}>
      <IconComp size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
      <p style={f('sm', 400, 'var(--color-text-muted)')}>{text}</p>
    </div>
  );
}
