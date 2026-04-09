import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import {
  X, Footprints, Moon, Heart, Weight, Droplets,
  ChevronDown, Activity, Flame, Thermometer, Wind,
} from 'lucide-react';

// ─── FONT HELPER ────────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

// ─── FIELD COMPONENT ────────────────────────────────────────────
function EntryField({ icon: Icon, label, value, onChange, unit, placeholder, accent, min, max, step }: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void;
  unit?: string; placeholder?: string; accent?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="flex items-center" style={{
      padding: '12px 16px', gap: 12,
      backgroundColor: 'var(--color-bg-muted)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-default)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: accent ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'var(--color-bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent || 'var(--color-text-muted)', flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ ...f('xs', 500, 'var(--color-text-muted)'), display: 'block', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
          {label}
        </label>
        <div className="flex items-center" style={{ gap: 4 }}>
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || '0'}
            min={min}
            max={max}
            step={step || 1}
            style={{
              ...f('base', 500),
              border: 'none', background: 'transparent', outline: 'none',
              width: '100%', padding: 0, fontVariantNumeric: 'tabular-nums',
            }}
          />
          {unit && <span style={f('xs', 400, 'var(--color-text-muted)')}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── TIME FIELD COMPONENT ───────────────────────────────────────
function TimeField({ icon: Icon, label, value, onChange, accent }: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void; accent?: string;
}) {
  return (
    <div className="flex items-center" style={{
      padding: '12px 16px', gap: 12,
      backgroundColor: 'var(--color-bg-muted)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-default)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: accent ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'var(--color-bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent || 'var(--color-text-muted)', flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ ...f('xs', 500, 'var(--color-text-muted)'), display: 'block', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
          {label}
        </label>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...f('base', 500),
            border: 'none', background: 'transparent', outline: 'none',
            width: '100%', padding: 0,
          }}
        />
      </div>
    </div>
  );
}

// ─── SECTION HEADER ─────────────────────────────────────────────
function SectionHeader({ title, expanded, onToggle }: {
  title: string; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full"
      style={{
        padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
        borderTop: '1px solid var(--color-border-light)',
      }}
    >
      <span style={f('sm', 500)}>{title}</span>
      <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
      </motion.div>
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════
// MANUAL ENTRY MODAL
// ═════════════════════════════════════════════════════════════════

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Record<string, any>) => Promise<void>;
  isSyncing: boolean;
}

export function ManualEntryModal({ isOpen, onClose, onSubmit, isSyncing }: ManualEntryModalProps) {
  // ── Quick entry fields ──────────────────────────────────────
  const [steps, setSteps] = useState('');
  const [activeMinutes, setActiveMinutes] = useState('');
  const [calories, setCal] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');

  // ── Expanded sections ───────────────────────────────────────
  const [showVitals, setShowVitals] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  // ── Vitals ──────────────────────────────────────────────────
  const [heartRate, setHeartRate] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');

  // ── Body ────────────────────────────────────────────────────
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // ── Nutrition ───────────────────────────────────────────────
  const [waterMl, setWaterMl] = useState('');
  const [caloriesConsumed, setCaloriesConsumed] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const hasAnyValue = [steps, activeMinutes, calories, sleepHours, heartRate, weight, waterMl].some(v => v !== '');

  const handleSubmit = useCallback(async () => {
    const entry: Record<string, any> = {};

    // ── Activity ──
    if (steps) entry.steps = Number(steps);
    if (activeMinutes) entry.activeMinutes = Number(activeMinutes);
    if (calories) entry.calories = Number(calories);
    entry.distanceKm = entry.steps ? Math.round((entry.steps * 0.0008) * 10) / 10 : 0;
    entry.floorsClimbed = 0;
    entry.heartPoints = entry.activeMinutes ? Math.round(entry.activeMinutes * 0.8) : 0;
    entry.vo2Max = null;

    // ── Sleep ──
    if (sleepHours) {
      entry.sleepHours = Number(sleepHours);
      const totalMins = Math.round(Number(sleepHours) * 60);
      entry.sleep = {
        totalHours: Number(sleepHours),
        bedtime: bedtime || '22:30',
        wakeTime: wakeTime || '06:30',
        efficiency: Math.min(95, Math.max(70, 85 + Math.round((Number(sleepHours) - 7) * 3))),
        deepSleepMins: Math.round(totalMins * 0.2),
        lightSleepMins: Math.round(totalMins * 0.5),
        remSleepMins: Math.round(totalMins * 0.22),
        awakeMins: Math.round(totalMins * 0.08),
      };
    }

    // ── Vitals ──
    if (heartRate || bpSystolic || spo2 || bodyTemp) {
      entry.vitals = {
        restingHeartRate: heartRate ? Number(heartRate) : 72,
        bloodPressureSystolic: bpSystolic ? Number(bpSystolic) : 120,
        bloodPressureDiastolic: bpDiastolic ? Number(bpDiastolic) : 80,
        oxygenSaturation: spo2 ? Number(spo2) : 98,
        respiratoryRate: 16,
        bodyTemperature: bodyTemp ? Number(bodyTemp) : 36.6,
        bloodGlucose: null,
      };
    }

    // ── Body ──
    if (weight || height) {
      const w = weight ? Number(weight) : 70;
      const h = height ? Number(height) : 170;
      entry.body = {
        weight: w,
        height: h,
        bmi: Math.round((w / ((h / 100) ** 2)) * 10) / 10,
        bodyFatPct: null,
      };
    }

    // ── Nutrition ──
    if (waterMl || caloriesConsumed || protein) {
      entry.nutrition = {
        hydrationMl: waterMl ? Number(waterMl) : 0,
        hydrationGoalMl: 2500,
        caloriesConsumed: caloriesConsumed ? Number(caloriesConsumed) : 0,
        proteinG: protein ? Number(protein) : 0,
        carbsG: carbs ? Number(carbs) : 0,
        fatG: fat ? Number(fat) : 0,
      };
    }

    entry.lastUpdated = new Date().toISOString();

    await onSubmit(entry);
    onClose();
  }, [
    steps, activeMinutes, calories, sleepHours, bedtime, wakeTime,
    heartRate, bpSystolic, bpDiastolic, spo2, bodyTemp,
    weight, height, waterMl, caloriesConsumed, protein, carbs, fat,
    onSubmit, onClose,
  ]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative z-10 w-full sm:max-w-md"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* ── Handle bar ── */}
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--color-border-default)' }} />
          </div>

          {/* ── Header ── */}
          <div className="flex items-center justify-between" style={{ padding: '8px 20px 16px' }}>
            <div>
              <h2 style={{ ...f('lg', 500), margin: 0 }}>Log Health Data</h2>
              <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0' }}>
                Manually enter today's health metrics
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center"
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable content ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>

            {/* ── Quick Entry: Activity + Sleep ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ ...f('xs', 500, 'var(--color-text-muted)'), textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Quick Entry
              </span>

              <EntryField icon={Footprints} label="Steps" value={steps} onChange={setSteps}
                placeholder="10,000" accent="var(--color-viz-orange)" min={0} max={100000} />

              <div className="grid grid-cols-2" style={{ gap: 10 }}>
                <EntryField icon={Activity} label="Active min" value={activeMinutes} onChange={setActiveMinutes}
                  unit="min" placeholder="60" accent="var(--color-viz-green)" min={0} max={1440} />
                <EntryField icon={Flame} label="Calories" value={calories} onChange={setCal}
                  unit="kcal" placeholder="500" accent="var(--color-viz-red)" min={0} max={10000} />
              </div>

              <EntryField icon={Moon} label="Sleep" value={sleepHours} onChange={setSleepHours}
                unit="hrs" placeholder="8" accent="var(--color-viz-deep-purple)" min={0} max={24} step={0.5} />

              {sleepHours && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="grid grid-cols-2" style={{ gap: 10, overflow: 'hidden' }}
                >
                  <TimeField icon={Moon} label="Bedtime" value={bedtime} onChange={setBedtime} accent="var(--color-viz-deep-purple)" />
                  <TimeField icon={Activity} label="Wake time" value={wakeTime} onChange={setWakeTime} accent="var(--color-viz-amber)" />
                </motion.div>
              )}
            </div>

            {/* ── Vitals Section ── */}
            <div style={{ marginTop: 16 }}>
              <SectionHeader title="Vitals" expanded={showVitals} onToggle={() => setShowVitals(!showVitals)} />
              <AnimatePresence>
                {showVitals && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}
                  >
                    <EntryField icon={Heart} label="Resting heart rate" value={heartRate} onChange={setHeartRate}
                      unit="bpm" placeholder="72" accent="var(--color-viz-red)" min={30} max={220} />
                    <div className="grid grid-cols-2" style={{ gap: 10 }}>
                      <EntryField icon={Activity} label="BP systolic" value={bpSystolic} onChange={setBpSystolic}
                        unit="mmHg" placeholder="120" accent="var(--color-viz-pink)" min={60} max={250} />
                      <EntryField icon={Activity} label="BP diastolic" value={bpDiastolic} onChange={setBpDiastolic}
                        unit="mmHg" placeholder="80" accent="var(--color-viz-pink)" min={30} max={150} />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: 10 }}>
                      <EntryField icon={Wind} label="SpO₂" value={spo2} onChange={setSpo2}
                        unit="%" placeholder="98" accent="var(--color-viz-deep-blue)" min={70} max={100} />
                      <EntryField icon={Thermometer} label="Body temp" value={bodyTemp} onChange={setBodyTemp}
                        unit="°C" placeholder="36.6" accent="var(--color-viz-orange)" min={34} max={42} step={0.1} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Body Section ── */}
            <div>
              <SectionHeader title="Body" expanded={showBody} onToggle={() => setShowBody(!showBody)} />
              <AnimatePresence>
                {showBody && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}
                  >
                    <div className="grid grid-cols-2" style={{ gap: 10 }}>
                      <EntryField icon={Weight} label="Weight" value={weight} onChange={setWeight}
                        unit="kg" placeholder="70" accent="var(--color-viz-brown)" min={20} max={300} step={0.1} />
                      <EntryField icon={Activity} label="Height" value={height} onChange={setHeight}
                        unit="cm" placeholder="170" accent="var(--color-viz-slate)" min={50} max={250} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Nutrition Section ── */}
            <div>
              <SectionHeader title="Nutrition" expanded={showNutrition} onToggle={() => setShowNutrition(!showNutrition)} />
              <AnimatePresence>
                {showNutrition && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}
                  >
                    <EntryField icon={Droplets} label="Water intake" value={waterMl} onChange={setWaterMl}
                      unit="ml" placeholder="2500" accent="var(--color-viz-hydration)" min={0} max={10000} step={100} />
                    <EntryField icon={Flame} label="Calories consumed" value={caloriesConsumed} onChange={setCaloriesConsumed}
                      unit="kcal" placeholder="2000" accent="var(--color-viz-red)" min={0} max={10000} />
                    <div className="grid grid-cols-3" style={{ gap: 10 }}>
                      <EntryField icon={Activity} label="Protein" value={protein} onChange={setProtein}
                        unit="g" placeholder="60" accent="var(--color-viz-red)" min={0} max={500} />
                      <EntryField icon={Activity} label="Carbs" value={carbs} onChange={setCarbs}
                        unit="g" placeholder="250" accent="var(--color-viz-orange)" min={0} max={1000} />
                      <EntryField icon={Activity} label="Fat" value={fat} onChange={setFat}
                        unit="g" placeholder="70" accent="var(--color-viz-purple)" min={0} max={500} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Submit button ── */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-card)',
          }}>
            <Button
              onClick={handleSubmit}
              disabled={!hasAnyValue || isSyncing}
              className="w-full rounded-xl"
              style={{
                height: 'var(--ikan-component-button-height, 56px)',
                backgroundColor: hasAnyValue ? 'var(--color-primary-default)' : 'var(--color-bg-muted)',
                color: hasAnyValue ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                fontWeight: 500,
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family-base)',
                transition: 'all 0.15s',
              }}
            >
              {isSyncing ? 'Saving…' : 'Save Entry'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}