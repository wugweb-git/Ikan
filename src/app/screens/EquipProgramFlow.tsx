import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CircleCheck, Play, Clock, ChevronLeft, ChevronRight, Lock,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import { EquipProgram } from '../../shared/blocks/block-model';
import { ProgramPlayer } from '../features/player/ProgramPlayer';
import { apiClient } from '../../shared/api-client';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'sonner';
import tokens from '../../lib/design-tokens';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// ── design tokens ────────────────────────────────────────────────
const B = {
  primary: tokens.colors.primary.default,
  primaryOn: tokens.colors.primary.on,
  accent: tokens.colors.accent.default,
  success: tokens.colors.status.success,
  successLight: tokens.colors.status['success-light'],
  muted: tokens.colors.text.muted,
  textPrimary: tokens.colors.text.primary,
  bgPage: tokens.colors.background.page,
  bgCard: tokens.colors.background.card,
  bgMuted: tokens.colors.background.muted,
  border: tokens.colors.border.default,
};

const f = (size: string, weight: number = 400, color: string = B.textPrimary) => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ============================================================================
// TYPES
// ============================================================================

interface UserProgress {
  currentDay: number;
  completedDays: Record<number, {
    status: 'completed' | 'skipped';
    date: string;
    responses?: Record<string, any>;
  }>;
  currentDayState: {
    completedBlockIds: string[];
    responses: Record<string, any>;
  };
}

interface EquipProgramFlowProps {
  programId?: string;
  enrollmentId?: string;
  onBack?: () => void;
  onComplete?: () => void;
  onNavigate?: (path: string) => void;
}

// ============================================================================
// DAY STRIP — horizontal pill strip (CalendarStrip pattern for program days)
// ============================================================================

const PILL_W = 56;
const PILL_GAP = 8;
const STRIP_PAD = 16;

interface DayStripProps {
  days: { day: number; title: string; dayType?: string }[];
  progress: UserProgress;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

function DayStrip({ days, progress, selectedDay, onSelectDay }: DayStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(7);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth - STRIP_PAD * 2;
    setVisibleCount(Math.max(3, Math.floor((w + PILL_GAP) / (PILL_W + PILL_GAP))));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Compute page offset to ensure selectedDay is visible
  const totalDays = days.length;
  const [pageOffset, setPageOffset] = useState(0);

  // Reset page when selectedDay changes
  useEffect(() => {
    const idx = days.findIndex(d => d.day === selectedDay);
    if (idx >= 0) {
      const page = Math.floor(idx / visibleCount);
      setPageOffset(page);
    }
  }, [selectedDay, visibleCount, days]);

  const startIdx = pageOffset * visibleCount;
  const visibleDays = days.slice(startIdx, startIdx + visibleCount);
  const canPrev = pageOffset > 0;
  const canNext = startIdx + visibleCount < totalDays;

  const getStatus = (day: number) => {
    if (progress.completedDays[day]) return 'completed';
    if (day === progress.currentDay) return 'current';
    if (day < progress.currentDay) return 'skipped';
    return 'locked';
  };

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: B.bgCard,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: `1px solid ${B.border}`,
        padding: STRIP_PAD,
      }}
    >
      {/* Nav row */}
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <motion.button
          whileTap={canPrev ? { scale: 0.9 } : undefined}
          onClick={() => canPrev && setPageOffset(p => p - 1)}
          disabled={!canPrev}
          className="flex items-center justify-center"
          style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: B.bgMuted, border: 'none',
            cursor: canPrev ? 'pointer' : 'not-allowed',
            opacity: canPrev ? 1 : 0.3,
          }}
        >
          <ChevronLeft size={14} style={{ color: B.muted }} />
        </motion.button>
        <span style={{ ...f('xs', 500, B.muted), textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
          Your Journey
        </span>
        <motion.button
          whileTap={canNext ? { scale: 0.9 } : undefined}
          onClick={() => canNext && setPageOffset(p => p + 1)}
          disabled={!canNext}
          className="flex items-center justify-center"
          style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: B.bgMuted, border: 'none',
            cursor: canNext ? 'pointer' : 'not-allowed',
            opacity: canNext ? 1 : 0.3,
          }}
        >
          <ChevronRight size={14} style={{ color: B.muted }} />
        </motion.button>
      </div>

      {/* Day pills */}
      <div className="flex items-center justify-center" style={{ gap: PILL_GAP }}>
        <AnimatePresence mode="popLayout">
          {visibleDays.map((day, i) => {
            const status = getStatus(day.day);
            const isSelected = day.day === selectedDay;
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            const isDark = isSelected;
            const pillBg = isDark
              ? B.primary
              : isCompleted
                ? `color-mix(in srgb, ${B.success} 8%, transparent)`
                : B.accent;
            const topColor = isDark ? 'rgba(255,255,255,0.65)' : B.muted;
            const numColor = isDark ? B.primaryOn : isLocked ? B.muted : B.textPrimary;

            return (
              <motion.button
                key={day.day}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: isLocked ? 0.4 : 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.025, duration: 0.3, type: 'spring', stiffness: 350, damping: 22 }}
                whileHover={!isLocked ? { y: -3, scale: 1.04 } : undefined}
                whileTap={!isLocked ? { scale: 0.93 } : undefined}
                onClick={() => !isLocked && onSelectDay(day.day)}
                className="flex flex-col items-center justify-center"
                style={{
                  width: PILL_W,
                  height: 72,
                  borderRadius: 28,
                  backgroundColor: pillBg,
                  border: 'none',
                  cursor: isLocked ? 'default' : 'pointer',
                  gap: 4,
                  padding: '8px 0',
                  flexShrink: 0,
                  position: 'relative',
                  transition: 'background-color 0.25s ease',
                }}
              >
                {/* Label */}
                <span style={{
                  fontSize: 9,
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: topColor,
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  textTransform: 'uppercase' as const,
                }}>
                  {day.day === 0 ? 'INTRO' : `DAY`}
                </span>

                {/* Day number */}
                {isLocked ? (
                  <Lock size={16} style={{ color: B.muted }} />
                ) : isCompleted && !isDark ? (
                  <CircleCheck size={18} style={{ color: B.success }} />
                ) : (
                  <span style={{
                    ...f('lg', 500, numColor),
                    lineHeight: 1,
                  }}>
                    {day.day === 0 ? '0' : day.day}
                  </span>
                )}

                {/* Current day pulsing dot */}
                {isCurrent && !isDark && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', bottom: 6,
                      width: 5, height: 5, borderRadius: '50%',
                      backgroundColor: B.primary,
                    }}
                  />
                )}

                {/* Selected + completed: small check */}
                {isDark && isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute', bottom: 6,
                      width: 6, height: 6, borderRadius: '50%',
                      backgroundColor: B.success,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 1: HOME (ENTRY POINT) — now includes DayStrip
// ============================================================================

interface EquipProgramHomeProps {
  program: EquipProgram;
  progress: UserProgress;
  onStartSession: () => void;
  onSelectDay: (day: number) => void;
  onRestart: () => void;
  onBack: () => void;
  onLeaveProgram: () => void;
  onNavigate?: (path: string) => void;
}

function EquipProgramHome({ program, progress, onStartSession, onSelectDay, onRestart, onBack, onLeaveProgram, onNavigate }: EquipProgramHomeProps) {
  const [selectedDay, setSelectedDay] = useState(progress.currentDay);
  const selectedDayContent = program.daily_content?.find(d => d.day === selectedDay);
  // Compute max regular day number (exclude Day 0 onboarding)
  const regularDays = (program.daily_content || []).filter(d => d.day !== 0);
  const maxDayNum = regularDays.length > 0 ? Math.max(...regularDays.map(d => d.day)) : 0;
  const isProgramComplete = progress.currentDay > maxDayNum && maxDayNum > 0;
  const hasStartedDay = progress.currentDayState.completedBlockIds.length > 0;

  const days = useMemo(() =>
    (program.daily_content || []).map(d => ({
      day: d.day,
      title: d.title,
    })),
    [program.daily_content]
  );

  const getStatus = (day: number) => {
    if (progress.completedDays[day]) return 'completed';
    if (day === progress.currentDay) return 'current';
    if (day < progress.currentDay) return 'skipped';
    return 'locked';
  };

  const selectedStatus = getStatus(selectedDay);
  const isCurrentDay = selectedDay === progress.currentDay;
  const isCompleted = selectedStatus === 'completed';

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: B.bgPage }}>
      {/* Header */}
      <header
        className="flex-none flex items-center"
        style={{
          height: 60,
          paddingLeft: 8,
          paddingRight: 16,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${B.border}`,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="flex items-center justify-center"
          style={{
            width: 40, height: 40, borderRadius: 'var(--radius-pill)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: B.textPrimary,
          }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </motion.button>
        <div style={{ flex: 1, textAlign: 'center', paddingRight: 40 }}>
          <h1 className="truncate" style={{ ...f('sm', 500), letterSpacing: '-0.01em' }}>
            {program.title}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 24px)' }}>
        <div className="max-w-md mx-auto w-full" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Program complete banner */}
          {isProgramComplete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center', padding: '32px 20px',
                backgroundColor: B.bgCard,
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${B.border}`,
                boxShadow: tokens.shadow.sm,
              }}
            >
              <div
                className="mx-auto flex items-center justify-center"
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  backgroundColor: B.successLight, marginBottom: 16,
                }}
              >
                <CircleCheck size={32} style={{ color: B.success }} />
              </div>
              <h2 style={{ ...f('xl', 500), margin: '0 0 6px' }}>Journey Complete!</h2>
              <p style={{ ...f('sm', 400, B.muted), margin: '0 0 20px' }}>
                You've completed {program.title}. Tap any day to review.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => onNavigate?.(`/equip-program-completion?id=${program.id}`)}
                  style={{
                    background: B.primary, border: 'none',
                    borderRadius: 'var(--radius-md)', padding: '10px 24px',
                    cursor: 'pointer', ...f('sm', 500, tokens.colors.text.inverse),
                  }}
                >
                  View Summary
                </button>
                <button
                  onClick={onRestart}
                  style={{
                    background: 'none', border: `1.5px solid ${B.border}`,
                    borderRadius: 'var(--radius-md)', padding: '8px 20px',
                    cursor: 'pointer', ...f('sm', 500, tokens.colors.status.danger),
                  }}
                >
                  Restart Program
                </button>
              </div>
            </motion.div>
          )}

          {/* Day strip */}
          <DayStrip
            days={days}
            progress={progress}
            selectedDay={selectedDay}
            onSelectDay={handleDaySelect}
          />

          {/* Selected day card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selectedDayContent ? (
                <div
                  style={{
                    backgroundColor: B.bgCard,
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${B.border}`,
                    boxShadow: tokens.shadow.sm,
                    overflow: 'hidden',
                  }}
                >
                  {/* Accent bar */}
                  <div style={{
                    height: 3,
                    backgroundColor: isCurrentDay ? B.primary : isCompleted ? B.success : B.accent,
                  }} />

                  <div style={{ padding: '20px' }}>
                    {/* Day title + info */}
                    <div style={{ marginBottom: 16 }}>
                      <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
                        <span style={{
                          ...f('xs', 500, isCurrentDay ? B.primary : isCompleted ? B.success : B.muted),
                          textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                        }}>
                          {selectedDayContent.day === 0 ? 'Intro' : `Day ${selectedDayContent.day}`}
                          {isCompleted && ' · Completed'}
                          {isCurrentDay && ' · Current'}
                        </span>
                      </div>
                      <h3 style={{ ...f('lg', 500), margin: '0 0 4px' }}>
                        {selectedDayContent.title}
                      </h3>
                      {(selectedDayContent.description || selectedDayContent.subtitle) && (
                        <p style={{ ...f('sm', 400, B.muted), margin: 0, lineHeight: 1.5 }}>
                          {selectedDayContent.subtitle || selectedDayContent.description}
                        </p>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center flex-wrap" style={{ gap: 8, marginBottom: 20 }}>
                      <span className="flex items-center" style={{
                        gap: 4, padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                        backgroundColor: B.bgMuted, ...f('xs', 500, B.muted),
                      }}>
                        <Clock size={12} /> ~10 min
                      </span>
                      <span style={{
                        padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                        backgroundColor: B.bgMuted, ...f('xs', 500, B.muted),
                      }}>
                        {selectedDayContent.activities?.length || 0} activities
                      </span>
                    </div>

                    {/* Action button */}
                    {isCurrentDay && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onStartSession}
                        className="flex items-center justify-center"
                        style={{
                          width: '100%', height: 'var(--ikan-component-button-height)',
                          borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
                          backgroundColor: B.primary,
                          ...f('base', 500, B.primaryOn),
                          boxShadow: tokens.shadow.sm,
                          gap: 8,
                        }}
                      >
                        <Play fill="currentColor" size={16} />
                        {hasStartedDay ? 'Continue Session' : 'Start Today'}
                      </motion.button>
                    )}

                    {isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelectDay(selectedDay)}
                        className="flex items-center justify-center"
                        style={{
                          width: '100%', height: 'var(--ikan-component-button-height)',
                          borderRadius: 'var(--radius-lg)',
                          border: `1.5px solid ${B.border}`, cursor: 'pointer',
                          backgroundColor: B.bgCard,
                          ...f('sm', 500),
                          gap: 'var(--spacing-2)',
                        }}
                      >
                        Review Day
                      </motion.button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '40px 20px',
                  backgroundColor: B.bgCard,
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${B.border}`,
                }}>
                  <p style={f('sm', 400, B.muted)}>
                    Content for Day {selectedDay} not found.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Leave program option */}
          {!isProgramComplete && (
            <button
              onClick={onLeaveProgram}
              className="flex items-center justify-center w-full"
              style={{
                gap: 6, padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none', background: 'none',
                cursor: 'pointer',
                ...f('xs', 500, B.muted),
                opacity: 0.7,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
            >
              <LogOut size={14} />
              Leave Program
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 2: DAY SESSION (PLAYER RUNTIME)
// ============================================================================

interface DaySessionScreenProps {
  program: EquipProgram;
  dayNumber: number;
  initialResponses?: Record<string, any>;
  onCompleteDay: (results: any) => void;
  onProgress: (progress: { currentBlockIndex: number, responses: Record<string, any> }) => void;
  onExit: () => void;
  mode?: 'live' | 'preview';
  priorDayResponses?: Record<number, Record<string, any>>;
}

function DaySessionScreen({ program, dayNumber, initialResponses, onCompleteDay, onProgress, onExit, mode = 'live', priorDayResponses }: DaySessionScreenProps) {
  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--color-bg-card)' }}>
       <ProgramPlayer
         program={program}
         initialDay={dayNumber}
         initialResponses={initialResponses}
         onComplete={onCompleteDay}
         onProgressChange={onProgress}
         onExit={onExit}
         mode={mode}
         priorDayResponses={priorDayResponses}
       />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: EQUIP PROGRAM FLOW
// ============================================================================

export function EquipProgramFlow({ programId, enrollmentId, onBack, onComplete, onNavigate }: EquipProgramFlowProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'session' | 'review'>('home');
  const [reviewDay, setReviewDay] = useState<number | null>(null);

  const [program, setProgram] = useState<EquipProgram | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    currentDay: 1,
    completedDays: {},
    currentDayState: {
      completedBlockIds: [],
      responses: {}
    }
  });

  // Ref to always have the latest progress for async callbacks
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const handleBack = () => {
    if (onBack) onBack();
    else if (onNavigate) onNavigate('/dashboard');
  };

  // Fetch Program & Progress
  useEffect(() => {
    const init = async () => {
      if (!programId) return;

      try {
        setLoading(true);

        const programData = await apiClient.getEquipProgram(programId);
        if (!programData) throw new Error('Program not found');
        setProgram(programData as EquipProgram);

        try {
          const progressData = await apiClient.getEnrollmentProgress(programId);
          if (progressData) {
            // progressData shape: { enrollment: { current_day_number, ... }, days: [{ day_number, completed, ... }] }
            const enrollment = progressData.enrollment || progressData;
            const completedDayEntries = (progressData.days || progressData.completed_days || []);
            
            // Build completedDays map from backend progress records
            const completedDays: Record<number, any> = {};
            if (Array.isArray(completedDayEntries)) {
              completedDayEntries.forEach((d: any) => {
                // Handle both formats: array of day numbers or array of progress objects
                if (typeof d === 'number') {
                  completedDays[d] = { status: 'completed', date: new Date().toISOString() };
                } else if (d && d.completed) {
                  const dayNum = d.day_number ?? d.dayNumber;
                  if (dayNum != null) {
                    completedDays[dayNum] = { status: 'completed', date: d.completed_at || new Date().toISOString(), responses: d.block_responses };
                  }
                }
              });
            }

            setProgress(prev => ({
              ...prev,
              currentDay: enrollment.current_day_number || enrollment.current_day || 1,
              completedDays,
              currentDayState: { completedBlockIds: [], responses: {} }
            }));

            const todayContent = await apiClient.getTodayContent(programId);
            if (todayContent && todayContent.progress) {
              // Pre-populate if available
            }
          }
        } catch (e) {
          console.warn('Progress fetch failed (maybe not enrolled)', e);
        }

      } catch (err: any) {
        console.error('Failed to load program flow', err);
        setProgram(null);
        toast.error('Unable to load program. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [programId]);

  const handleProgress = async (p: { currentBlockIndex: number, responses: Record<string, any> }) => {
     setProgress(prev => ({
        ...prev,
        currentDayState: {
           completedBlockIds: Object.keys(p.responses),
           responses: p.responses
        }
     }));

     if (programId) {
        try {
            await apiClient.syncEquipProgress(programId, {
                dayNumber: progressRef.current.currentDay,
                responses: p.responses
            });
        } catch (e) {
            console.error('Failed to sync progress', e);
        }
     }
  };

  const handleCompleteDay = async () => {
     if (!programId) return;

     const currentProgress = progressRef.current;
     const currentDay = currentProgress.currentDay;
     const nextDay = currentDay + 1;
     const now = new Date().toISOString();

     const newProgress = {
        ...currentProgress,
        currentDay: nextDay,
        completedDays: {
           ...currentProgress.completedDays,
           [currentDay]: {
             status: 'completed' as const,
             date: now,
             responses: currentProgress.currentDayState.responses
           }
        },
        currentDayState: { completedBlockIds: [], responses: {} }
     };

     setProgress(newProgress);
     setView('home');
     showToast('success', 'Day Complete!', 'Great job.');

     try {
       await apiClient.completeDay(programId, currentDay);
       if (onComplete) onComplete();
     } catch (e) {
       console.error('Failed to sync completion status', e);
     }
  };

  const handleRestart = async () => {
    if (confirm('Are you sure you want to restart the program? Current progress will be reset.')) {
        const resetProgress: UserProgress = {
            currentDay: 1,
            completedDays: {},
            currentDayState: { completedBlockIds: [], responses: {} }
        };
        setProgress(resetProgress);
        setView('home');

        try {
            if ((apiClient as any).resetEquipProgress) {
               await (apiClient as any).resetEquipProgress(programId);
            }
            showToast('success', 'Program restarted');
        } catch (e) {
            console.error('Restart failed', e);
        }
    }
  };

  const handleLeaveProgram = async () => {
    if (!programId) return;
    const confirmed = confirm(
      'Are you sure you want to leave this program? Your progress will be saved and you can re-enroll later.'
    );
    if (!confirmed) return;

    try {
      await apiClient.leaveProgram(programId);
      showToast('success', 'You have left the program');
      handleBack();
    } catch (e) {
      console.error('Failed to leave program:', e);
      toast.error('Could not leave the program. Please try again.');
    }
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center flex-col gap-4" style={{ backgroundColor: B.bgPage }}>
              <LoadingSpinner message="Loading program..." />
          </div>
      );
  }

  if (error || !program) {
      return (
          <div className="flex h-screen items-center justify-center flex-col gap-4 p-8 text-center" style={{ backgroundColor: B.bgPage }}>
              <h2 style={{ ...f('xl', 500, tokens.colors.status.danger) }}>Error Loading Program</h2>
              <p style={f('sm', 400, B.muted)}>{error || 'Program data is missing'}</p>
              <Button onClick={onBack}>Go Back</Button>
          </div>
      );
  }

  return (
    <>
      {view === 'home' && (
        <EquipProgramHome
           program={program}
           progress={progress}
           onStartSession={() => setView('session')}
           onSelectDay={(day) => {
             if (day === progress.currentDay) {
               setView('session');
             } else if (progress.completedDays[day]) {
               setReviewDay(day);
               setView('review');
             }
           }}
           onRestart={handleRestart}
           onBack={handleBack}
           onLeaveProgram={handleLeaveProgram}
           onNavigate={onNavigate}
        />
      )}

      {view === 'session' && (
        <DaySessionScreen
           program={program}
           dayNumber={progress.currentDay}
           initialResponses={progress.currentDayState.responses}
           onCompleteDay={handleCompleteDay}
           onProgress={handleProgress}
           onExit={() => setView('home')}
           priorDayResponses={Object.fromEntries(
             Object.entries(progress.completedDays).map(
               ([d, v]: [string, any]) => [Number(d), v?.responses || {}]
             )
           )}
        />
      )}

      {view === 'review' && reviewDay && (
        <DaySessionScreen
           program={program}
           dayNumber={reviewDay}
           initialResponses={progress.completedDays[reviewDay]?.responses || {}}
           onCompleteDay={() => setView('home')}
           onProgress={() => {}}
           onExit={() => setView('home')}
           mode="preview"
        />
      )}
    </>
  );
}