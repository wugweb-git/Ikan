import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap, Brain, Shield, Activity as ActivityIcon, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { EngineResult } from '../lib/recommendation-engine';

// ─── Types ────────────────────────────────────────────────────
interface Dimension {
  label: string;
  score: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

interface ScoreData {
  percentage: number;
  dimensions: Dimension[];
  level: string;
  levelColor: string;
}

interface TrendPoint { date: string; score: number; }

interface Props {
  hasLoggedMoodToday: boolean;
  activeEnrollment: any;
  activeProgram: any;
  completedEnrollments: any[];
  engineResult: EngineResult | null;
  enrollments: any[];
  recommendations: any[];
  onNavigate?: (route: string) => void;
  isFitnessConnected?: boolean;
  fitnessData?: any;
}

// ─── Trend storage ────────────────────────────────────────────
const TREND_KEY = 'ikan-wellness-trend';
function loadTrend(): TrendPoint[] {
  try { return JSON.parse(localStorage.getItem(TREND_KEY) || '[]'); }
  catch { return []; }
}
function saveTrendPoint(score: number) {
  const today = new Date().toISOString().split('T')[0];
  let t = loadTrend();
  const i = t.findIndex(x => x.date === today);
  if (i >= 0) t[i].score = score; else t.push({ date: today, score });
  if (t.length > 7) t = t.slice(-7);
  localStorage.setItem(TREND_KEY, JSON.stringify(t));
  return t;
}

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Concentric Rings Gauge ──────────────────────────────────
// Apple Watch-style concentric rings – one ring per dimension
function ConcentricRings({
  dimensions,
  percentage,
  level,
  levelColor,
}: {
  dimensions: Dimension[];
  percentage: number;
  level: string;
  levelColor: string;
}) {
  const size = 170;
  const center = size / 2;
  const ringWidth = 11;
  const ringGap = 3;
  // Outermost ring is first dimension, innermost is last
  const rings = dimensions.map((dim, i) => {
    const radius = center - (ringWidth / 2) - (i * (ringWidth + ringGap)) - 4;
    const circumference = 2 * Math.PI * radius;
    const pct = dim.max > 0 ? dim.score / dim.max : 0;
    return { ...dim, radius, circumference, pct };
  });

  return (
    <div className="relative" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => (
          <g key={ring.label}>
            {/* Track */}
            <circle
              cx={center} cy={center} r={ring.radius}
              fill="none" stroke={`${ring.color}18`}
              strokeWidth={ringWidth}
            />
            {/* Progress arc */}
            <motion.circle
              cx={center} cy={center} r={ring.radius}
              fill="none" stroke={ring.color}
              strokeWidth={ringWidth} strokeLinecap="round"
              strokeDasharray={ring.circumference}
              initial={{ strokeDashoffset: ring.circumference }}
              animate={{ strokeDashoffset: ring.circumference - ring.pct * ring.circumference }}
              transition={{ duration: 1.2, delay: i * 0.12, ease: [0.33, 1, 0.68, 1] }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </g>
        ))}
      </svg>
      {/* Center score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: 38, fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
        >
          {percentage}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: 10, fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            color: levelColor, marginTop: 2,
            textTransform: 'lowercase' as const,
          }}
        >
          {level}
        </motion.span>
      </div>
    </div>
  );
}

// ─── Trend sparkline ──────────────────────────────────────────
function TrendSparkline({ data, color }: { data: TrendPoint[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.score), 1);
  const min = Math.min(...data.map(d => d.score), 0);
  const range = max - min || 1;
  const w = 220, h = 44, px = 8;
  const pts = data.map((d, i) => ({
    x: px + (i / (data.length - 1)) * (w - 2 * px),
    y: h - 6 - ((d.score - min) / range) * (h - 12),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        {data.map((d, i) => (
          <span key={d.date} style={{
            fontSize: 9, fontFamily: 'var(--font-family-base)',
            fontWeight: i === data.length - 1 ? 500 : 400,
            color: i === data.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          }}>
            {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
          </span>
        ))}
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <motion.path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={color} />
      </svg>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════
export function WellnessScoreCard({
  hasLoggedMoodToday, activeEnrollment, activeProgram, completedEnrollments,
  engineResult, enrollments, recommendations, onNavigate,
  isFitnessConnected = false, fitnessData = null,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  const score = useMemo<ScoreData>(() => {
    const dims: Dimension[] = [];
    let total = 0, maxP = 0;

    // 1. Mood (20)
    const mood = hasLoggedMoodToday ? 20 : 0;
    dims.push({ label: 'Mood', score: mood, max: 20, icon: <Heart size={14} />, color: '#E53935', bg: '#FFEBEE' });
    total += mood; maxP += 20;

    // 2. Program (25)
    let prog = 0;
    if (activeEnrollment && activeProgram) {
      const d = activeEnrollment.current_day_number || 1;
      const t = activeProgram.daily_content?.length || 7;
      prog = Math.min(25, Math.round((d / t) * 25));
    }
    if (completedEnrollments.length > 0) prog = 25;
    dims.push({ label: 'Program', score: prog, max: 25, icon: <Zap size={14} />, color: '#43A047', bg: '#E8F5E9' });
    total += prog; maxP += 25;

    // 3. Awareness (20)
    let aw = 0;
    if (engineResult) {
      const s = engineResult.severity;
      if (s === 'low') aw = 20;
      else if (s === 'moderate') aw = 14;
      else if (s === 'high') aw = 10;
      else aw = 8;
    }
    dims.push({ label: 'Awareness', score: aw, max: 20, icon: <Brain size={14} />, color: '#1E88E5', bg: '#E3F2FD' });
    total += aw; maxP += 20;

    // 4. Engagement (15)
    let eng = 0;
    if (enrollments.length > 0) eng += 4;
    if (completedEnrollments.length > 0) eng += 3;
    if (hasLoggedMoodToday) eng += 3;
    if (engineResult) eng += 3;
    if (recommendations.length > 0) eng += 2;
    eng = Math.min(15, eng);
    dims.push({ label: 'Engagement', score: eng, max: 15, icon: <Shield size={14} />, color: '#8E24AA', bg: '#F3E5F5' });
    total += eng; maxP += 15;

    // 5. Activity (20)
    let act = 0;
    if (isFitnessConnected) {
      act += 6;
      if (fitnessData) {
        if (fitnessData.steps >= 8000) act += 5;
        else if (fitnessData.steps >= 5000) act += 3;
        else if (fitnessData.steps >= 2000) act += 2;
        const sh = fitnessData.sleepHours || 0;
        if (sh >= 7 && sh <= 9) act += 5;
        else if (sh >= 6) act += 3;
        else if (sh >= 4) act += 1;
        if (fitnessData.activeMinutes >= 30) act += 4;
        else if (fitnessData.activeMinutes >= 15) act += 2;
        else if (fitnessData.activeMinutes > 0) act += 1;
      }
    }
    act = Math.min(20, act);
    dims.push({ label: 'Activity', score: act, max: 20, icon: <ActivityIcon size={14} />, color: '#F57C00', bg: '#FFF3E0' });
    total += act; maxP += 20;

    const pct = maxP > 0 ? Math.round((total / maxP) * 100) : 0;
    let level: string, lc: string;
    if (pct >= 80) { level = 'Thriving'; lc = '#34C759'; }
    else if (pct >= 55) { level = 'Growing'; lc = '#007AFF'; }
    else if (pct >= 30) { level = 'Building'; lc = '#FF9500'; }
    else { level = 'Getting Started'; lc = '#8E8E93'; }

    return { percentage: pct, dimensions: dims, level, levelColor: lc };
  }, [hasLoggedMoodToday, activeEnrollment, activeProgram, completedEnrollments, engineResult, enrollments, recommendations, isFitnessConnected, fitnessData]);

  useEffect(() => {
    setTrend(saveTrendPoint(score.percentage));
  }, [score.percentage]);

  const delta = useMemo(() => {
    if (trend.length < 2) return null;
    return trend[trend.length - 1].score - trend[trend.length - 2].score;
  }, [trend]);

  return (
    <section aria-label="Wellness Score">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between" style={{ padding: '16px 20px 0' }}>
          <span style={{
            fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)', textTransform: 'uppercase' as const, letterSpacing: '0.04em',
          }}>
            Wellness Score
          </span>
          {delta !== null && (
            <span className="inline-flex items-center" style={{
              fontSize: 'var(--text-xs)', fontWeight: 500, fontFamily: 'var(--font-family-base)',
              color: delta > 0 ? '#34C759' : delta < 0 ? '#FF3B30' : 'var(--color-text-muted)',
              gap: 3, padding: '2px 8px', borderRadius: 'var(--radius-pill)',
              backgroundColor: delta > 0 ? '#34C75918' : delta < 0 ? '#FF3B3018' : 'var(--color-bg-muted)',
            }}>
              {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>

        {/* ── Rings + Legend layout ── */}
        <div className="flex items-center" style={{ padding: '16px 20px 20px', gap: 20 }}>
          {/* Concentric rings */}
          <ConcentricRings
            dimensions={score.dimensions}
            percentage={score.percentage}
            level={score.level}
            levelColor={score.levelColor}
          />

          {/* Legend */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {score.dimensions.map((dim, i) => {
              const pct = dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0;
              return (
                <motion.div
                  key={dim.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      backgroundColor: dim.color, flexShrink: 0,
                    }} />
                    <span style={f('sm', 500)}>{dim.label}</span>
                  </div>
                  <span style={{ ...f('sm', 400, 'var(--color-text-muted)'), fontVariantNumeric: 'tabular-nums' }}>
                    {pct}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Trend toggle ── */}
        {trend.length >= 2 && (
          <>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between"
              style={{
                padding: '12px 20px', background: 'none', border: 'none',
                borderTop: '1px solid var(--color-border-default)', cursor: 'pointer',
              }}
            >
              <span style={f('sm', 500)}>This week</span>
              <ChevronDown size={14} style={{
                color: 'var(--color-text-muted)',
                transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }} />
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  style={{ padding: '0 20px 16px', overflow: 'hidden' }}
                >
                  <TrendSparkline data={trend} color={score.levelColor} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </section>
  );
}
