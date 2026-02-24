import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGoogleFit, HealthData } from './GoogleFitContext';
import { GoogleFitConsentModal } from './GoogleFitConsentModal';
import { cn } from '../ui/utils';
import {
  Moon, Footprints, Heart, Activity, RefreshCw, ChevronDown,
  Flame, MapPin, Zap, Clock, BedDouble, Sunrise,
  Droplets, Weight, Thermometer, Wind, TrendingUp,
  Layers, CircleGauge,
} from 'lucide-react';

// ─── FONT HELPER ────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Google Fit logo SVG ────────────────────────────────────────
function GoogleFitLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4L12 16l4.24 4.24L24 12.48l7.76 7.76L36 16z" fill="#4285F4" />
      <path d="M12 16l-8 8 8 8 4.24-4.24L8.48 20l7.76-7.76z" fill="#EA4335" />
      <path d="M36 16l8 8-8 8-4.24-4.24L39.52 20l-7.76-7.76z" fill="#34A853" />
      <path d="M24 44l12-12-4.24-4.24L24 35.52l-7.76-7.76L12 32z" fill="#FBBC05" />
    </svg>
  );
}

// ─── Health Connect logo — official style ───────────────────────
function HealthConnectLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" aria-hidden="true">
      <defs>
        <linearGradient id="hc-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#FBBC05" />
        </linearGradient>
      </defs>
      <path d="M96 170c-4 0-8-1.5-11-4.5C52 134 30 112 30 84c0-22 18-40 40-40 12 0 22 5 26 13 4-8 14-13 26-13 22 0 40 18 40 40 0 28-22 50-55 81.5-3 3-7 4.5-11 4.5z" fill="url(#hc-g1)" />
      <rect x="82" y="66" width="28" height="52" rx="6" fill="white" opacity="0.95" />
      <rect x="70" y="78" width="52" height="28" rx="6" fill="white" opacity="0.95" />
    </svg>
  );
}

// ─── Tab Data ───────────────────────────────────────────────────
type TabKey = 'activity' | 'sleep' | 'vitals' | 'body' | 'nutrition';
const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'sleep', label: 'Sleep', icon: Moon },
  { key: 'vitals', label: 'Vitals', icon: Heart },
  { key: 'body', label: 'Body', icon: Weight },
  { key: 'nutrition', label: 'Nutrition', icon: Droplets },
];

// ─── Stat Row ───────────────────────────────────────────────────
function StatRow({ icon: Icon, label, value, unit, accent }: {
  icon: React.ElementType; label: string; value: string | number; unit?: string; accent?: string;
}) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: accent ? `${accent}18` : 'var(--color-bg-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent || 'var(--color-text-muted)',
        }}>
          <Icon size={16} />
        </div>
        <span style={f('sm', 400, 'var(--color-text-muted)')}>{label}</span>
      </div>
      <span style={{ ...f('sm', 500), fontVariantNumeric: 'tabular-nums' }}>
        {value}{unit && <span style={f('xs', 400, 'var(--color-text-muted)')}> {unit}</span>}
      </span>
    </div>
  );
}

// ─── Mini progress ring ─────────────────────────────────────────
function MiniRing({ pct, color, size = 44, label, value }: {
  pct: number; color: string; size?: number; label: string; value: string;
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const o = c - Math.min(pct, 1) * c;
  return (
    <div className="flex flex-col items-center" style={{ gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} opacity={0.15} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: o }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...f('base', 500), lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: 'var(--font-family-base)' }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Bar chart ──────────────────────────────────────────────────
function BarChart({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end" style={{ gap: 5, height: 56 }}>
      {data.map((v, i) => {
        const h = Math.max(4, (v / max) * 48);
        const isToday = i === data.length - 1;
        return (
          <div key={i} className="flex flex-col items-center" style={{ flex: 1, gap: 4 }}>
            <motion.div
              initial={{ height: 0 }} animate={{ height: h }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              style={{ width: '100%', maxWidth: 24, borderRadius: 4, backgroundColor: isToday ? color : 'var(--grey-3)' }}
            />
            <span style={{ fontSize: 9, fontFamily: 'var(--font-family-base)', fontWeight: isToday ? 500 : 400, color: isToday ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sleep bar ──────────────────────────────────────────────────
function SleepStagesBar({ sleep }: { sleep: HealthData['sleep'] }) {
  const total = sleep.deepSleepMins + sleep.lightSleepMins + sleep.remSleepMins + sleep.awakeMins;
  if (!total) return null;
  const segs = [
    { label: 'Deep', m: sleep.deepSleepMins, c: '#1A237E' },
    { label: 'Light', m: sleep.lightSleepMins, c: '#7986CB' },
    { label: 'REM', m: sleep.remSleepMins, c: '#CE93D8' },
    { label: 'Awake', m: sleep.awakeMins, c: '#FFCC80' },
  ];
  return (
    <div>
      <div className="flex overflow-hidden" style={{ height: 10, borderRadius: 5, backgroundColor: 'var(--color-bg-muted)' }}>
        {segs.map(s => (
          <motion.div key={s.label} initial={{ width: 0 }} animate={{ width: `${(s.m / total) * 100}%` }}
            transition={{ duration: 0.5 }} style={{ backgroundColor: s.c }} />
        ))}
      </div>
      <div className="flex flex-wrap" style={{ gap: '6px 14px', marginTop: 8 }}>
        {segs.map(s => (
          <div key={s.label} className="flex items-center" style={{ gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: s.c }} />
            <span style={f('xs', 400, 'var(--color-text-muted)')}>
              {s.label} {Math.floor(s.m / 60)}h{s.m % 60}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hydration bar ──────────────────────────────────────────────
function HydrationBar({ current, goal }: { current: number; goal: number }) {
  const pct = Math.min(current / goal, 1);
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={f('sm', 400, 'var(--color-text-muted)')}>Water intake</span>
        <span style={{ ...f('sm', 500), fontVariantNumeric: 'tabular-nums' }}>
          {(current / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, backgroundColor: 'var(--color-bg-muted)', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6 }}
          style={{ height: '100%', borderRadius: 4, backgroundColor: '#2196F3' }} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════

export function ActivityCard({ className }: { className?: string }) {
  const { isConnected, provider, isSyncing, data, connect, sync } = useGoogleFit();
  const [showConsent, setShowConsent] = useState(false);
  const [connectProvider, setConnectProvider] = useState<'google-fit' | 'health-connect'>('google-fit');
  const [activeTab, setActiveTab] = useState<TabKey>('activity');

  // ─── NOT CONNECTED ────────────────────────────────────────
  if (!isConnected) {
    return (
      <>
        <div className={cn(className)} style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          border: '1px solid var(--color-border-default)',
        }}>
          <div style={{ padding: '20px 20px 0' }}>
            <h3 style={{ ...f('base', 500), margin: 0 }}>Track your health</h3>
            <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '4px 0 0', lineHeight: 1.4 }}>
              Connect a fitness service to see how movement, sleep & vitals affect your wellbeing.
            </p>
          </div>

          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Google Fit */}
            <button onClick={() => { setConnectProvider('google-fit'); setShowConsent(true); }}
              className="flex items-center w-full" style={{
                gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}>
              <GoogleFitLogo size={28} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={f('sm', 500)}>Google Fit</div>
                <div style={f('xs', 400, 'var(--color-text-muted)')}>Steps, sleep, heart rate & more</div>
              </div>
              <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', transform: 'rotate(-90deg)' }} />
            </button>

            {/* Health Connect */}
            <button onClick={() => { setConnectProvider('health-connect'); setShowConsent(true); }}
              className="flex items-center w-full" style={{
                gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-muted)',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}>
              <HealthConnectLogo size={28} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={f('sm', 500)}>Health Connect</div>
                <div style={f('xs', 400, 'var(--color-text-muted)')}>Activity, vitals, body, nutrition & sleep</div>
              </div>
              <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', transform: 'rotate(-90deg)' }} />
            </button>
          </div>
        </div>

        <GoogleFitConsentModal isOpen={showConsent} onClose={() => setShowConsent(false)}
          onConfirm={() => { connect(connectProvider); setShowConsent(false); }} />
      </>
    );
  }

  // ─── CONNECTED ────────────────────────────────────────────
  const pName = provider === 'health-connect' ? 'Health Connect' : 'Google Fit';
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className={cn(className)} style={{
      backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between" style={{ padding: '16px 20px 12px' }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          {provider === 'health-connect' ? <HealthConnectLogo size={22} /> : <GoogleFitLogo size={22} />}
          <span style={f('base', 500)}>Today's Health</span>
        </div>
        <button onClick={() => sync()} disabled={isSyncing}
          className="flex items-center justify-center"
          style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
            backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)',
          }}>
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </div>

      {!data ? (
        <div className="flex items-center justify-center" style={{ height: 80, ...f('sm', 400, 'var(--color-text-muted)') }}>
          Syncing data…
        </div>
      ) : (
        <>
          {/* ── Tabs ── */}
          <div className="flex" style={{
            padding: '0 20px', gap: 2, overflowX: 'auto',
            borderBottom: '1px solid var(--color-border-default)',
          }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="flex items-center shrink-0"
                  style={{
                    gap: 5, padding: '10px 12px', border: 'none', cursor: 'pointer',
                    background: 'none', borderBottom: isActive ? '2px solid var(--color-primary-default)' : '2px solid transparent',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    fontSize: 'var(--text-xs)', fontWeight: 500, fontFamily: 'var(--font-family-base)',
                    transition: 'all 0.15s',
                  }}>
                  <TabIcon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ── */}
          <div style={{ padding: '16px 20px 20px', minHeight: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>

                {/* ── ACTIVITY TAB ── */}
                {activeTab === 'activity' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Ring row */}
                    <div className="grid grid-cols-4" style={{ gap: 8 }}>
                      <MiniRing pct={data.steps / 10000} color="#F57C00" label="Steps" value={data.steps.toLocaleString()} />
                      <MiniRing pct={data.activeMinutes / 60} color="#2E7D32" label="Active" value={`${data.activeMinutes}m`} />
                      <MiniRing pct={data.calories / 500} color="#E53935" label="Cal" value={String(data.calories)} />
                      <MiniRing pct={data.heartPoints / 50} color="#7B1FA2" label="Pts" value={String(data.heartPoints)} />
                    </div>

                    {/* Detail stats */}
                    <div>
                      <StatRow icon={MapPin} label="Distance" value={data.distanceKm} unit="km" accent="#1565C0" />
                      <StatRow icon={Layers} label="Floors climbed" value={data.floorsClimbed} accent="#00897B" />
                      {data.vo2Max && <StatRow icon={Wind} label="VO₂ Max" value={data.vo2Max} unit="mL/kg/min" accent="#5E35B1" />}
                    </div>

                    {/* Weekly steps chart */}
                    {data.weekly && (
                      <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                          <span style={f('sm', 500)}>Steps this week</span>
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>{data.weekly.goalsAchieved}/7 goals</span>
                        </div>
                        <BarChart data={data.weekly.stepsPerDay} color="#F57C00" labels={days} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── SLEEP TAB ── */}
                {activeTab === 'sleep' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Main metric */}
                    <div className="flex items-center" style={{ gap: 16 }}>
                      <MiniRing pct={data.sleepHours / 8} color="#5E35B1" size={64} label="" value="" />
                      <div>
                        <div style={{ ...f('2xl', 500), lineHeight: 1 }}>{data.sleepHours}<span style={f('base', 400, 'var(--color-text-muted)')}> hrs</span></div>
                        <div style={f('xs', 400, 'var(--color-text-muted)')}>Last night's sleep</div>
                      </div>
                    </div>

                    {/* Stages */}
                    {data.sleep && <SleepStagesBar sleep={data.sleep} />}

                    {/* Details */}
                    {data.sleep && (
                      <div>
                        <StatRow icon={BedDouble} label="Bedtime" value={data.sleep.bedtime} accent="#5E35B1" />
                        <StatRow icon={Sunrise} label="Wake time" value={data.sleep.wakeTime} accent="#FF8F00" />
                        <StatRow icon={CircleGauge} label="Efficiency" value={`${data.sleep.efficiency}%`} accent="#2E7D32" />
                      </div>
                    )}

                    {/* Weekly sleep chart */}
                    {data.weekly?.sleepPerDay && (
                      <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                          <span style={f('sm', 500)}>Sleep this week</span>
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>Avg {data.weekly.avgSleep}h</span>
                        </div>
                        <BarChart data={data.weekly.sleepPerDay} color="#5E35B1" labels={days} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── VITALS TAB ── */}
                {activeTab === 'vitals' && data.vitals && (
                  <div>
                    <StatRow icon={Heart} label="Resting heart rate" value={data.vitals.restingHeartRate} unit="bpm" accent="#E53935" />
                    <StatRow icon={Activity} label="Blood pressure" value={`${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic}`} unit="mmHg" accent="#D81B60" />
                    <StatRow icon={Wind} label="SpO₂" value={data.vitals.oxygenSaturation} unit="%" accent="#1565C0" />
                    <StatRow icon={Wind} label="Respiratory rate" value={data.vitals.respiratoryRate} unit="br/min" accent="#00897B" />
                    <StatRow icon={Thermometer} label="Body temperature" value={data.vitals.bodyTemperature} unit="°C" accent="#F57C00" />
                    {data.vitals.bloodGlucose !== null && (
                      <StatRow icon={Droplets} label="Blood glucose" value={data.vitals.bloodGlucose} unit="mg/dL" accent="#7B1FA2" />
                    )}
                  </div>
                )}

                {/* ── BODY TAB ── */}
                {activeTab === 'body' && data.body && (
                  <div>
                    <StatRow icon={Weight} label="Weight" value={data.body.weight} unit="kg" accent="#5D4037" />
                    <StatRow icon={TrendingUp} label="Height" value={data.body.height} unit="cm" accent="#455A64" />
                    <StatRow icon={CircleGauge} label="BMI" value={data.body.bmi} accent={
                      data.body.bmi < 18.5 ? '#FF9800' : data.body.bmi < 25 ? '#4CAF50' : data.body.bmi < 30 ? '#FF9800' : '#E53935'
                    } />
                    {data.body.bodyFatPct !== null && (
                      <StatRow icon={Layers} label="Body fat" value={data.body.bodyFatPct} unit="%" accent="#F57C00" />
                    )}
                    {/* BMI indicator */}
                    <div style={{ marginTop: 16 }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                        <span style={f('xs', 400, 'var(--color-text-muted)')}>BMI Range</span>
                        <span style={f('xs', 500, data.body.bmi < 18.5 ? '#FF9800' : data.body.bmi < 25 ? '#4CAF50' : data.body.bmi < 30 ? '#FF9800' : '#E53935')}>
                          {data.body.bmi < 18.5 ? 'Underweight' : data.body.bmi < 25 ? 'Normal' : data.body.bmi < 30 ? 'Overweight' : 'Obese'}
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #FF9800, #4CAF50 30%, #4CAF50 55%, #FF9800 75%, #E53935)', position: 'relative' }}>
                        <motion.div
                          initial={{ left: 0 }} animate={{ left: `${Math.min(Math.max((data.body.bmi - 15) / 25, 0), 1) * 100}%` }}
                          transition={{ duration: 0.6 }}
                          style={{ position: 'absolute', top: -3, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--color-bg-card)', border: '2px solid var(--color-text-primary)', transform: 'translateX(-50%)' }}
                        />
                      </div>
                      <div className="flex justify-between" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>15</span>
                        <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>18.5</span>
                        <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>25</span>
                        <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>30</span>
                        <span style={{ fontSize: 8, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>40</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── NUTRITION TAB ── */}
                {activeTab === 'nutrition' && data.nutrition && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <HydrationBar current={data.nutrition.hydrationMl} goal={data.nutrition.hydrationGoalMl} />

                    <div>
                      <span style={{ ...f('sm', 500), display: 'block', marginBottom: 10 }}>Macros today</span>
                      <div className="grid grid-cols-3" style={{ gap: 10 }}>
                        {[
                          { label: 'Protein', g: data.nutrition.proteinG, c: '#E53935' },
                          { label: 'Carbs', g: data.nutrition.carbsG, c: '#F57C00' },
                          { label: 'Fat', g: data.nutrition.fatG, c: '#7B1FA2' },
                        ].map(m => (
                          <div key={m.label} style={{
                            backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)',
                            padding: '12px 8px', textAlign: 'center', border: '1px solid var(--color-border-light)',
                          }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: m.c, margin: '0 auto 6px' }} />
                            <div style={{ ...f('base', 500), fontVariantNumeric: 'tabular-nums' }}>{m.g}<span style={f('xs', 400, 'var(--color-text-muted)')}>g</span></div>
                            <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: 'var(--font-family-base)' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <StatRow icon={Flame} label="Calories consumed" value={data.nutrition.caloriesConsumed.toLocaleString()} unit="kcal" accent="#E53935" />

                    {/* Weekly calories chart */}
                    {data.weekly?.caloriesPerDay && (
                      <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                          <span style={f('sm', 500)}>Active calories this week</span>
                          <span style={f('xs', 400, 'var(--color-text-muted)')}>{data.weekly.totalCalories.toLocaleString()} total</span>
                        </div>
                        <BarChart data={data.weekly.caloriesPerDay} color="#E53935" labels={days} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center" style={{
        padding: '10px 20px', borderTop: '1px solid var(--color-border-default)',
        gap: 8, fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-status-success)' }} className="animate-pulse" />
        Synced with {pName} · Read-only
      </div>
    </div>
  );
}
