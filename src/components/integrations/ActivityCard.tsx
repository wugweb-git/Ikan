import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGoogleFit, HealthData } from './GoogleFitContext';
import { GoogleFitConsentModal } from './GoogleFitConsentModal';
import { ManualEntryModal } from './ManualEntryModal';
import { cn } from '../ui/utils';
import {
  Moon, Heart, Activity, RefreshCw,
  Flame, MapPin, BedDouble, Sunrise,
  Droplets, Weight, Thermometer, Wind, TrendingUp,
  Layers, CircleGauge, Clock, PenLine,
} from 'lucide-react';

// ─── FONT HELPER ────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── Health Connect logo — official style ───────────────────────
function HealthConnectLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" aria-hidden="true">
      {/* Health Connect brand colors — mandated by brand guidelines, must remain as hex */}
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

// ─── Default fitness goals — single source of truth ─────────────
const FITNESS_GOALS = {
  steps: 10_000,
  activeMinutes: 60,
  calories: 500,
  heartPoints: 50,
  sleepHours: 8,
} as const;

// ─── Stat Row ───────────────────────────────────────────────────
function StatRow({ icon: Icon, label, value, unit, accent }: {
  icon: React.ElementType; label: string; value: string | number; unit?: string; accent?: string;
}) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: accent ? `color-mix(in srgb, ${accent} 10%, transparent)` : 'var(--color-bg-muted)',
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
    { label: 'Deep', m: sleep.deepSleepMins, c: 'var(--color-sleep-deep)' },
    { label: 'Light', m: sleep.lightSleepMins, c: 'var(--color-sleep-light)' },
    { label: 'REM', m: sleep.remSleepMins, c: 'var(--color-sleep-rem)' },
    { label: 'Awake', m: sleep.awakeMins, c: 'var(--color-sleep-awake)' },
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
          style={{ height: '100%', borderRadius: 4, backgroundColor: 'var(--color-viz-hydration)' }} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════

export function ActivityCard({ className }: { className?: string }) {
  const { isConnected, isSyncing, data, connect, sync, submitManualEntry } = useGoogleFit();
  const [showConsent, setShowConsent] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('activity');

  // ─── NOT CONNECTED — Figma design ──────────────────────────
  if (!isConnected) {
    return (
      <>
        <div className={cn(className)} style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          border: '1px solid var(--color-border-default)',
          padding: '20px',
        }}>
          {/* Header with HC logo */}
          <div className="flex items-start" style={{ gap: 12, marginBottom: 12 }}>
            <HealthConnectLogo size={28} />
            <h3 style={{ ...f('base', 500), margin: 0, lineHeight: 1.3 }}>
              Want more detailed workout data?
            </h3>
          </div>

          {/* Description */}
          <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: '0 0 20px', lineHeight: 1.5 }}>
            With Health Connect, you can sync your favorite fitness apps to see calories, heart rate, and more from your runs. Set it up today.
          </p>

          {/* Single CTA button */}
          <button
            onClick={() => setShowConsent(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-text-inverse)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            Sync with Health Connect
          </button>
        </div>

        <GoogleFitConsentModal isOpen={showConsent} onClose={() => setShowConsent(false)}
          onConfirm={() => { connect('health-connect'); setShowConsent(false); }} />
      </>
    );
  }

  // ─── CONNECTED BUT NO DATA ────────────────────────────────
  if (!data) {
    return (
      <>
        <div className={cn(className)} style={{
          backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        }}>
          <div className="flex items-center justify-between" style={{ padding: '16px 20px 12px' }}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <HealthConnectLogo size={22} />
              <span style={f('base', 500)}>Health Connect</span>
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

          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
              backgroundColor: 'color-mix(in srgb, var(--color-status-info) 10%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-status-info)',
            }}>
              <Clock size={24} />
            </div>
            <p style={{ ...f('sm', 500), margin: '0 0 4px' }}>Waiting for data</p>
            <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '0 0 16px', lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
              No data has synced yet. You can log your health metrics manually while waiting for Health Connect to sync.
            </p>

            <button
              onClick={() => setShowManualEntry(true)}
              className="flex items-center justify-center"
              style={{
                gap: 8, margin: '0 auto', padding: '10px 20px',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-text-inverse)',
                fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'var(--font-family-base)',
              }}
            >
              <PenLine size={14} />
              Log Manually
            </button>
          </div>

          <div className="flex items-center" style={{
            padding: '10px 20px', borderTop: '1px solid var(--color-border-default)',
            gap: 8, fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-status-warning)' }} />
            Connected · Awaiting first sync
          </div>
        </div>

        <ManualEntryModal
          isOpen={showManualEntry}
          onClose={() => setShowManualEntry(false)}
          onSubmit={submitManualEntry}
          isSyncing={isSyncing}
        />
      </>
    );
  }

  // ─── CONNECTED WITH DATA ──────────────────────────────────
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className={cn(className)} style={{
      backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between" style={{ padding: '16px 20px 12px' }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <HealthConnectLogo size={22} />
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
                    <MiniRing pct={data.steps / FITNESS_GOALS.steps} color="var(--color-viz-orange)" label="Steps" value={data.steps.toLocaleString()} />
                    <MiniRing pct={data.activeMinutes / FITNESS_GOALS.activeMinutes} color="var(--color-viz-green)" label="Active" value={`${data.activeMinutes}m`} />
                    <MiniRing pct={data.calories / FITNESS_GOALS.calories} color="var(--color-viz-red)" label="Cal" value={String(data.calories)} />
                    <MiniRing pct={data.heartPoints / FITNESS_GOALS.heartPoints} color="var(--color-viz-purple)" label="Pts" value={String(data.heartPoints)} />
                  </div>

                  {/* Detail stats */}
                  <div>
                    <StatRow icon={MapPin} label="Distance" value={data.distanceKm} unit="km" accent="var(--color-viz-deep-blue)" />
                    <StatRow icon={Layers} label="Floors climbed" value={data.floorsClimbed} accent="var(--color-viz-teal)" />
                    {data.vo2Max && <StatRow icon={Wind} label="VO₂ Max" value={data.vo2Max} unit="mL/kg/min" accent="var(--color-viz-deep-purple)" />}
                  </div>

                  {/* Weekly steps chart */}
                  {data.weekly && (
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <span style={f('sm', 500)}>Steps this week</span>
                        <span style={f('xs', 400, 'var(--color-text-muted)')}>{data.weekly.goalsAchieved}/7 goals</span>
                      </div>
                      <BarChart data={data.weekly.stepsPerDay} color="var(--color-viz-orange)" labels={days} />
                    </div>
                  )}
                </div>
              )}

              {/* ── SLEEP TAB ── */}
              {activeTab === 'sleep' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Main metric */}
                  <div className="flex items-center" style={{ gap: 16 }}>
                    <MiniRing pct={data.sleepHours / FITNESS_GOALS.sleepHours} color="var(--color-viz-deep-purple)" size={64} label="" value="" />
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
                      <StatRow icon={BedDouble} label="Bedtime" value={data.sleep.bedtime} accent="var(--color-viz-deep-purple)" />
                      <StatRow icon={Sunrise} label="Wake time" value={data.sleep.wakeTime} accent="var(--color-viz-amber)" />
                      <StatRow icon={CircleGauge} label="Efficiency" value={`${data.sleep.efficiency}%`} accent="var(--color-viz-green)" />
                    </div>
                  )}

                  {/* Weekly sleep chart */}
                  {data.weekly?.sleepPerDay && (
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <span style={f('sm', 500)}>Sleep this week</span>
                        <span style={f('xs', 400, 'var(--color-text-muted)')}>Avg {data.weekly.avgSleep}h</span>
                      </div>
                      <BarChart data={data.weekly.sleepPerDay} color="var(--color-viz-deep-purple)" labels={days} />
                    </div>
                  )}
                </div>
              )}

              {/* ── VITALS TAB ── */}
              {activeTab === 'vitals' && data.vitals && (
                <div>
                  <StatRow icon={Heart} label="Resting heart rate" value={data.vitals.restingHeartRate} unit="bpm" accent="var(--color-viz-red)" />
                  <StatRow icon={Activity} label="Blood pressure" value={`${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic}`} unit="mmHg" accent="var(--color-viz-pink)" />
                  <StatRow icon={Wind} label="SpO₂" value={data.vitals.oxygenSaturation} unit="%" accent="var(--color-viz-deep-blue)" />
                  <StatRow icon={Wind} label="Respiratory rate" value={data.vitals.respiratoryRate} unit="br/min" accent="var(--color-viz-teal)" />
                  <StatRow icon={Thermometer} label="Body temperature" value={data.vitals.bodyTemperature} unit="°C" accent="var(--color-viz-orange)" />
                  {data.vitals.bloodGlucose !== null && (
                    <StatRow icon={Droplets} label="Blood glucose" value={data.vitals.bloodGlucose} unit="mg/dL" accent="var(--color-viz-purple)" />
                  )}
                </div>
              )}

              {/* ── BODY TAB ── */}
              {activeTab === 'body' && data.body && (
                <div>
                  <StatRow icon={Weight} label="Weight" value={data.body.weight} unit="kg" accent="var(--color-viz-brown)" />
                  <StatRow icon={TrendingUp} label="Height" value={data.body.height} unit="cm" accent="var(--color-viz-slate)" />
                  <StatRow icon={CircleGauge} label="BMI" value={data.body.bmi} accent={
                    data.body.bmi < 18.5 ? 'var(--color-bmi-caution)' : data.body.bmi < 25 ? 'var(--color-bmi-normal)' : data.body.bmi < 30 ? 'var(--color-bmi-caution)' : 'var(--color-bmi-danger)'
                  } />
                  {data.body.bodyFatPct !== null && (
                    <StatRow icon={Layers} label="Body fat" value={data.body.bodyFatPct} unit="%" accent="var(--color-viz-orange)" />
                  )}
                  {/* BMI indicator */}
                  <div style={{ marginTop: 16 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <span style={f('xs', 400, 'var(--color-text-muted)')}>BMI Range</span>
                      <span style={f('xs', 500, data.body.bmi < 18.5 ? 'var(--color-bmi-caution)' : data.body.bmi < 25 ? 'var(--color-bmi-normal)' : data.body.bmi < 30 ? 'var(--color-bmi-caution)' : 'var(--color-bmi-danger)')}>
                        {data.body.bmi < 18.5 ? 'Underweight' : data.body.bmi < 25 ? 'Normal' : data.body.bmi < 30 ? 'Overweight' : 'Obese'}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg, var(--color-bmi-caution), var(--color-bmi-normal) 30%, var(--color-bmi-normal) 55%, var(--color-bmi-caution) 75%, var(--color-bmi-danger))', position: 'relative' }}>
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
                        { label: 'Protein', g: data.nutrition.proteinG, c: 'var(--color-viz-red)' },
                        { label: 'Carbs', g: data.nutrition.carbsG, c: 'var(--color-viz-orange)' },
                        { label: 'Fat', g: data.nutrition.fatG, c: 'var(--color-viz-purple)' },
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

                  <StatRow icon={Flame} label="Calories consumed" value={data.nutrition.caloriesConsumed.toLocaleString()} unit="kcal" accent="var(--color-viz-red)" />

                  {/* Weekly calories chart */}
                  {data.weekly?.caloriesPerDay && (
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <span style={f('sm', 500)}>Active calories this week</span>
                        <span style={f('xs', 400, 'var(--color-text-muted)')}>{data.weekly.totalCalories.toLocaleString()} total</span>
                      </div>
                      <BarChart data={data.weekly.caloriesPerDay} color="var(--color-viz-red)" labels={days} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between" style={{
        padding: '10px 20px', borderTop: '1px solid var(--color-border-default)',
        fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)',
      }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-status-success)' }} className="animate-pulse" />
          Synced with Health Connect · {data.source === 'manual-entry' ? 'Manual entry' : 'Read-only'}
        </div>
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center"
          style={{
            gap: 4, border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-family-base)',
            color: 'var(--color-primary-default)', padding: '2px 0',
          }}
        >
          <PenLine size={11} />
          Update
        </button>
      </div>

      <ManualEntryModal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSubmit={submitManualEntry}
        isSyncing={isSyncing}
      />
    </div>
  );
}