// IkanScoreCard — the hero iKAN Score wellness ring card
// Shows: score ring, trend indicator, data source pills, CTA to timeline
import React, { useMemo } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Minus, ClipboardList, Smile, Check, Play } from 'lucide-react';
import { useIkanScore, IkanScoreData } from '../../hooks/useIkanScore';

interface IkanScoreCardProps {
  onNavigate?: (route: string) => void;
  isLoggedIn?: boolean;
}

// ─── Font helper (design-token compliant) ─────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Ring geometry ────────────────────────────────────────────────
const RING_SIZE = 130;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_THICKNESS = 12;

// Score → color gradient stops
function getScoreColor(score: number): { start: string; mid: string; end: string } {
  if (score >= 70) return { start: '#34D399', mid: '#4ADE80', end: '#16A34A' }; // green
  if (score >= 40) return { start: '#FBBF24', mid: '#F59E0B', end: '#D97706' }; // amber
  return { start: '#FB7185', mid: '#F43F5E', end: '#E11D48' };                  // rose
}

// Score → label
function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 45) return 'Fair';
  if (score >= 25) return 'Needs Attention';
  return 'Low';
}

export function IkanScoreCard({ onNavigate, isLoggedIn = true }: IkanScoreCardProps) {
  const { data, loading, error } = useIkanScore(isLoggedIn);

  // ── Skeleton / loading state ────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse" style={{ width: 120, height: 16, borderRadius: 8, background: 'var(--color-bg-muted)', margin: '0 auto 8px' }} />
          <div className="animate-pulse" style={{ width: 180, height: 12, borderRadius: 6, background: 'var(--color-bg-muted)', margin: '0 auto' }} />
        </div>
        <div className="flex justify-center" style={{ margin: '24px 0 20px' }}>
          <div className="animate-pulse" style={{ width: RING_SIZE, height: RING_SIZE, borderRadius: '50%', background: 'var(--color-bg-muted)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse" style={{ width: 160, height: 12, borderRadius: 6, background: 'var(--color-bg-muted)', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  // ── Error state — show card with message ────────────────────────
  if (error) {
    return (
      <div
        onClick={() => onNavigate?.('/timeline')}
        style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <h3 style={{ ...f('sm', 500), margin: 0 }}>iKAN Score</h3>
        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '6px 0 0' }}>Unable to compute score right now</p>
      </div>
    );
  }

  // ── No data state — encourage first actions ─────────────────────
  if (!data || !data.hasData) {
    return <NoDataCard onNavigate={onNavigate} />;
  }

  // ── Live score card ─────────────────────────────────────────────
  return <LiveScoreCard data={data} onNavigate={onNavigate} />;
}

// ═══════════════════════════════════════════════════════════════════
// NO DATA STATE
// ═══════════════════════════════════════════════════════════════════
function NoDataCard({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div
      onClick={() => onNavigate?.('/timeline')}
      style={{
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
        padding: '28px 24px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,255,180,0.15), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h3 style={{ ...f('base', 500), margin: 0 }}>iKAN Score</h3>
        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0' }}>Your Collective Wellness Index</p>
      </div>

      {/* Ghost ring */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', margin: '24px 0 20px' }}>
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={RING_THICKNESS} />
          <circle
            cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none"
            stroke="url(#ikanGradientGhost)" strokeWidth={RING_THICKNESS} strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={`${RING_CIRCUMFERENCE * 0.65}`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', opacity: 0.3 }}
          />
          <circle cx={RING_CENTER} cy={RING_CENTER} r={40} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={1} />
          <defs>
            <linearGradient id="ikanGradientGhost" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" /><stop offset="50%" stopColor="#4ADE80" /><stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <span style={{ ...f('2xl', 500, 'var(--color-text-muted)'), opacity: 0.5 }}>--</span>
          <p style={{ ...f('xs', 500, 'var(--color-text-muted)'), margin: '2px 0 0', opacity: 0.5 }}>Start Journey</p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '0 0 16px', lineHeight: 1.5 }}>
          Complete an assessment or log your mood to unlock your wellness score
        </p>
        <DataSourcePills assessments={false} mood={false} checkins={false} programs={false} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LIVE SCORE CARD
// ═══════════════════════════════════════════════════════════════════
function LiveScoreCard({ data, onNavigate }: { data: IkanScoreData; onNavigate?: (route: string) => void }) {
  const { score, breakdown, trend, trendLabel } = data;
  const colors = useMemo(() => getScoreColor(score), [score]);
  const label = useMemo(() => getScoreLabel(score), [score]);

  // Ring fill: score percentage
  const fillPortion = score / 100;
  const dashOffset = RING_CIRCUMFERENCE * (1 - fillPortion);

  const TrendIcon = trend > 2 ? ArrowUp : trend < -2 ? ArrowDown : Minus;
  const trendColor = trend > 2 ? '#22C55E' : trend < -2 ? '#EF4444' : 'var(--color-text-muted)';
  const trendText = trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : '±0';
  // Show the trend chip whenever we have a computed trend (including 0/stable)
  const hasTrendData = data.computedAt !== undefined;

  return (
    <div
      onClick={() => onNavigate?.('/timeline')}
      style={{
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
        padding: '28px 24px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient glow behind ring */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', width: 260, height: 260,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.start}25, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h3 style={{ ...f('base', 500), margin: 0 }}>iKAN Score</h3>
        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '4px 0 0' }}>Your Collective Wellness Index</p>
      </div>

      {/* Wellness Ring */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', margin: '24px 0 20px' }}>
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          {/* Background track */}
          <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={RING_THICKNESS} />
          {/* Score arc */}
          <circle
            cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none"
            stroke={`url(#ikanGradientLive)`}
            strokeWidth={RING_THICKNESS}
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={`${dashOffset}`}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
          {/* Inner shadow ring */}
          <circle cx={RING_CENTER} cy={RING_CENTER} r={40} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={1} />
          <defs>
            <linearGradient id="ikanGradientLive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="50%" stopColor={colors.mid} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center score text */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <span style={{ ...f('2xl', 500), letterSpacing: '-0.02em' }}>{score}</span>
          <p style={{ ...f('xs', 500, 'var(--color-text-muted)'), margin: '2px 0 0' }}>{label}</p>
        </div>
      </div>

      {/* Trend indicator */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {hasTrendData && (
          <div className="flex items-center justify-center" style={{ gap: 4, marginBottom: 8 }}>
            <TrendIcon size={14} style={{ color: trendColor }} />
            <span style={{ ...f('sm', 500, trendColor) }}>{trendText} this month</span>
          </div>
        )}
        <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '0 0 4px' }}>
          {trendLabel === 'improving' && 'Your wellness is improving'}
          {trendLabel === 'declining' && 'Focus on consistency to recover'}
          {trendLabel === 'stable' && (score >= 60 ? 'Keep up the great work' : 'Small daily actions make a difference')}
        </p>

        {/* Data source pills */}
        <div style={{ margin: '12px 0 0' }}>
          <DataSourcePills
            assessments={breakdown.assessments.count > 0}
            mood={breakdown.mood.entries > 0}
            checkins={breakdown.engagement.recentDays > 0}
            programs={breakdown.programs.active > 0 || breakdown.programs.completed > 0}
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center" style={{ marginTop: 16, gap: 6 }}>
          <span style={{ ...f('sm', 500, '#22C55E') }}>View Wellness Timeline</span>
          <ArrowRight size={14} style={{ color: '#22C55E' }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DATA SOURCE PILLS
// ═══════════════════════════════════════════════════════════════════
function DataSourcePills({ assessments, mood, checkins, programs }: { assessments: boolean; mood: boolean; checkins: boolean; programs: boolean }) {
  const sources = [
    { icon: <ClipboardList size={11} />, label: 'Assessments', active: assessments },
    { icon: <Smile size={11} />, label: 'Mood', active: mood },
    { icon: <Check size={11} />, label: 'Check-ins', active: checkins },
    { icon: <Play size={11} />, label: 'Programs', active: programs },
  ];

  return (
    <div className="flex items-center justify-center flex-wrap" style={{ gap: 8 }}>
      {sources.map((src, i) => (
        <span key={i} className="flex items-center" style={{
          gap: 4, fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-family-base)',
          color: src.active ? 'var(--color-primary-default)' : 'var(--color-text-muted)',
          backgroundColor: src.active ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0.04)',
          backdropFilter: 'blur(8px)',
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          opacity: src.active ? 1 : 0.6,
        }}>
          {src.active ? <Check size={10} style={{ color: '#22C55E' }} /> : src.icon} {src.label}
        </span>
      ))}
    </div>
  );
}