import { motion } from 'framer-motion';
import { Play, CheckCircle2, ArrowRight, CalendarCheck, BarChart3 } from 'lucide-react';
import { HeroStatusCard } from './ui/HeroStatusCard';

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

export function ProgramProgressTracker({
  activeEnrollment, activeProgram, completedEnrollments, engineResult, onNavigate,
}: ProgramProgressTrackerProps) {
  if (!activeEnrollment && !activeProgram && !engineResult && completedEnrollments.length === 0) return null;

  const hasActive = activeEnrollment && activeProgram;
  const totalDays = hasActive ? (activeProgram.daily_content?.length || 7) : 0;
  const currentDay = hasActive ? (activeEnrollment.current_day_number || 1) : 0;
  const isComplete = activeEnrollment?.status === 'completed' || currentDay > totalDays;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label="Your journey progress"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* ── Active Program Card (using HeroStatusCard) ── */}
      {hasActive && (
        <HeroStatusCard
          tag={{ text: isComplete ? 'Completed' : 'Current Program', variant: isComplete ? 'complete' : 'active' }}
          title={activeProgram.title || 'Your Program'}
          subtitle={isComplete
            ? `All ${totalDays} days completed`
            : `Day ${currentDay}  \u2022  ${totalDays} days total`}
          description={isComplete
            ? 'Congratulations on finishing this program!'
            : 'Ready for your next session? Takes about 10 minutes.'}
          progress={{ current: currentDay, total: totalDays }}
          actions={[
            ...(!isComplete ? [{
              label: 'Start Session',
              icon: <Play size={14} fill="currentColor" />,
              onClick: () => onNavigate?.(`/equip-program-flow?id=${activeEnrollment.equip_id}`),
              variant: 'primary' as const,
            }] : []),
            {
              label: 'Check Progress',
              icon: <CalendarCheck size={14} />,
              onClick: () => onNavigate?.(`/equip-program-flow?id=${activeEnrollment.equip_id}`),
              variant: 'ghost' as const,
            },
          ]}
        />
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
