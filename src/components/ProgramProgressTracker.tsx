import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, CheckCircle2, ArrowRight, CalendarCheck, BarChart3 } from 'lucide-react';

interface ProgramProgressTrackerProps {
  activeEnrollment: any;
  activeProgram: any;
  completedEnrollments: any[];
  engineResult: any;
  onNavigate?: (route: string) => void;
}

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Circular progress ring ──────────────────────────────────
function ProgressRing({ pct, size = 90 }: { pct: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.8)"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{
          fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-inverse)', lineHeight: 1,
        }}>
          {pct}%
        </span>
        <span style={{
          fontSize: 8, fontWeight: 500, fontFamily: 'var(--font-family-base)',
          color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const,
          letterSpacing: '0.08em', marginTop: 2,
        }}>
          Complete
        </span>
      </div>
    </div>
  );
}

export function ProgramProgressTracker({
  activeEnrollment, activeProgram, completedEnrollments, engineResult, onNavigate,
}: ProgramProgressTrackerProps) {
  if (!activeEnrollment && !activeProgram && !engineResult) return null;

  const hasActive = activeEnrollment && activeProgram;
  const totalDays = hasActive ? (activeProgram.daily_content?.length || 7) : 0;
  const currentDay = hasActive ? (activeEnrollment.current_day_number || 1) : 0;
  const pct = totalDays > 0 ? Math.min(Math.round((currentDay / totalDays) * 100), 100) : 0;
  const isComplete = activeEnrollment?.status === 'completed' || currentDay > totalDays;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label="Your journey progress"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* ── Active Program Card (dark style) ── */}
      {hasActive && (
        <div style={{
          backgroundColor: 'var(--color-primary-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative background wave */}
          <svg
            style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', opacity: 0.06 }}
            viewBox="0 0 200 200" preserveAspectRatio="none"
          >
            <path d="M100 0 Q120 50 100 100 Q80 150 100 200 L200 200 L200 0 Z" fill="var(--color-bg-card)" />
            <path d="M130 0 Q150 50 130 100 Q110 150 130 200 L200 200 L200 0 Z" fill="var(--color-bg-card)" />
          </svg>

          <div style={{ padding: '20px 20px 18px', position: 'relative', zIndex: 1 }}>
            <div className="flex items-start justify-between" style={{ gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Tag */}
                <span style={{
                  display: 'inline-block', fontSize: 10, fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: isComplete ? 'var(--color-status-success)' : 'rgba(255,255,255,0.65)',
                  backgroundColor: isComplete ? 'var(--color-status-success-light)' : 'rgba(255,255,255,0.1)',
                  padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                  border: isComplete ? 'none' : '1px solid rgba(255,255,255,0.15)',
                }}>
                  {isComplete ? 'Completed' : 'Current Program'}
                </span>

                {/* Title */}
                <h3 style={{ ...f('2xl', 500, 'var(--color-text-inverse)'), margin: '10px 0 0', lineHeight: 1.2 }}>
                  {activeProgram.title || 'Your Program'}
                </h3>

                {/* Day indicator */}
                <p style={{
                  ...f('xs', 500, 'rgba(255,255,255,0.45)'),
                  margin: '4px 0 0',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}>
                  {isComplete
                    ? `All ${totalDays} days completed`
                    : `Day ${currentDay}  •  ${totalDays} days total`}
                </p>

                {/* Description */}
                <p style={{ ...f('sm', 400, 'rgba(255,255,255,0.6)'), margin: '10px 0 0', lineHeight: 1.5 }}>
                  {isComplete
                    ? 'Congratulations on finishing this program!'
                    : 'Ready for your next session? Takes about 10 minutes.'}
                </p>
              </div>

              {/* Progress ring */}
              <ProgressRing pct={pct} />
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: 10, marginTop: 18 }}>
              {!isComplete && (
                <button
                  onClick={() => onNavigate?.(`/equip-program-flow?id=${activeEnrollment.equip_id}`)}
                  className="flex items-center justify-center"
                  style={{
                    padding: '11px 20px', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-card)', color: 'var(--color-primary-default)',
                    border: 'none', cursor: 'pointer', gap: 8,
                    ...f('sm', 500, 'var(--color-primary-default)'),
                  }}
                >
                  <Play size={14} fill="currentColor" /> Start Session
                </button>
              )}
              <button
                onClick={() => onNavigate?.(`/equip-program-flow?id=${activeEnrollment.equip_id}`)}
                className="flex items-center justify-center"
                style={{
                  padding: '11px 20px', borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer', gap: 8,
                  ...f('sm', 500, 'rgba(255,255,255,0.8)'),
                }}
              >
                <CalendarCheck size={14} /> Check Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assessment status ── */}
      {engineResult && (
        <div
          onClick={() => onNavigate?.('/assessments')}
          style={{
            backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)', padding: '14px 20px',
            border: '1px solid var(--color-border-default)', cursor: 'pointer',
            transition: 'box-shadow 0.15s',
          }}
        >
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: engineResult.severity === 'low' ? 'var(--color-status-success-light)'
                : engineResult.severity === 'moderate' ? 'var(--color-status-warning-light)'
                : 'var(--color-status-danger-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: engineResult.severity === 'low' ? 'var(--color-status-success)'
                : engineResult.severity === 'moderate' ? 'var(--color-status-warning)'
                : 'var(--color-status-danger)',
              flexShrink: 0,
            }}>
              <BarChart3 size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center" style={{ gap: 6 }}>
                <span style={f('sm', 500)}>Assessment</span>
                <span style={{
                  fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-family-base)',
                  color: engineResult.severity === 'low' ? 'var(--color-status-success)'
                    : engineResult.severity === 'moderate' ? 'var(--color-status-warning)'
                    : 'var(--color-status-danger)',
                  backgroundColor: engineResult.severity === 'low' ? 'var(--color-status-success-light)'
                    : engineResult.severity === 'moderate' ? 'var(--color-status-warning-light)'
                    : 'var(--color-status-danger-light)',
                  padding: '2px 7px', borderRadius: 'var(--radius-pill)',
                  textTransform: 'capitalize' as const,
                }}>
                  {engineResult.severity}
                </span>
              </div>
              <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                Tap to retake or view detailed insights
              </p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          </div>
        </div>
      )}

      {/* ── Completed count ── */}
      {completedEnrollments.length > 0 && !hasActive && (
        <div style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)', padding: '14px 20px',
          border: '1px solid var(--color-border-default)',
        }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'var(--color-status-success-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-status-success)', flexShrink: 0,
            }}>
              <CheckCircle2 size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={f('sm', 500)}>
                {completedEnrollments.length} program{completedEnrollments.length > 1 ? 's' : ''} completed
              </span>
              <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                Great progress on your wellness journey
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('/equip')}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)',
                border: 'none', cursor: 'pointer', ...f('xs', 500, 'var(--color-text-inverse)'),
              }}
            >
              Explore
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}