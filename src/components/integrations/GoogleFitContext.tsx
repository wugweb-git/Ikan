import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export interface SleepDetails {
  totalHours: number;
  bedtime: string;
  wakeTime: string;
  efficiency: number;
  deepSleepMins: number;
  lightSleepMins: number;
  remSleepMins: number;
  awakeMins: number;
}

export interface VitalsData {
  restingHeartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;      // SpO2 %
  respiratoryRate: number;       // breaths/min
  bodyTemperature: number;       // °C
  bloodGlucose: number | null;   // mg/dL — null if not tracked
}

export interface BodyData {
  weight: number;                // kg
  height: number;                // cm
  bmi: number;
  bodyFatPct: number | null;
}

export interface NutritionData {
  hydrationMl: number;           // mL today
  hydrationGoalMl: number;
  caloriesConsumed: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface WeeklyData {
  stepsPerDay: number[];
  caloriesPerDay: number[];
  sleepPerDay: number[];         // hours each day
  goalsAchieved: number;
  avgSleep: number;
  avgActiveMinutes: number;
  totalCalories: number;
}

export interface HealthData {
  // ─── Activity ───
  steps: number;
  activeMinutes: number;
  calories: number;              // active cal burned
  distanceKm: number;
  floorsClimbed: number;
  heartPoints: number;
  vo2Max: number | null;
  // ─── Sleep ───
  sleepHours: number;
  sleep: SleepDetails;
  // ─── Vitals ───
  vitals: VitalsData;
  // ─── Body ───
  body: BodyData;
  // ─── Nutrition ───
  nutrition: NutritionData;
  // ─── Weekly ───
  weekly: WeeklyData;
  // ─── Meta ───
  lastUpdated: string;
}

export type FitnessProvider = 'google-fit' | 'health-connect' | null;

interface FitnessContextType {
  isConnected: boolean;
  provider: FitnessProvider;
  isSyncing: boolean;
  data: HealthData | null;
  connect: (provider?: FitnessProvider) => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<void>;
}

// ──────────────────────────────────────────────────────────────────
// Mock Data Generator
// ──────────────────────────────────────────────────────────────────

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max));

const generateMockData = (): HealthData => {
  const steps = rndInt(3000, 13000);
  const sleepHours = Number(rnd(5, 9).toFixed(1));
  const activeMinutes = rndInt(12, 95);
  const calories = rndInt(140, 650);
  const distanceKm = Number((steps * 0.00072).toFixed(1));
  const heartPoints = rndInt(8, 85);

  // Sleep
  const bedH = rndInt(22, 25);
  const wakeH = rndInt(5, 8);
  const totalM = Math.round(sleepHours * 60);
  const dp = 0.14 + Math.random() * 0.1;
  const rp = 0.18 + Math.random() * 0.07;
  const ap = 0.04 + Math.random() * 0.05;
  const lp = 1 - dp - rp - ap;

  const fmtH = (h: number) => {
    const h12 = h > 12 ? h - 12 : h;
    const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
    return `${h12}:${String(rndInt(0, 59)).padStart(2, '0')} ${ampm}`;
  };

  const sleep: SleepDetails = {
    totalHours: sleepHours,
    bedtime: fmtH(bedH > 24 ? bedH - 24 : bedH),
    wakeTime: fmtH(wakeH),
    efficiency: rndInt(78, 96),
    deepSleepMins: Math.round(totalM * dp),
    lightSleepMins: Math.round(totalM * lp),
    remSleepMins: Math.round(totalM * rp),
    awakeMins: Math.round(totalM * ap),
  };

  // Vitals
  const vitals: VitalsData = {
    restingHeartRate: rndInt(54, 78),
    bloodPressureSystolic: rndInt(108, 135),
    bloodPressureDiastolic: rndInt(65, 88),
    oxygenSaturation: rndInt(95, 100),
    respiratoryRate: rndInt(12, 20),
    bodyTemperature: Number(rnd(36.2, 37.1).toFixed(1)),
    bloodGlucose: Math.random() > 0.5 ? rndInt(70, 140) : null,
  };

  // Body
  const weight = Number(rnd(55, 95).toFixed(1));
  const height = rndInt(155, 190);
  const body: BodyData = {
    weight,
    height,
    bmi: Number((weight / ((height / 100) ** 2)).toFixed(1)),
    bodyFatPct: Math.random() > 0.4 ? Number(rnd(12, 35).toFixed(1)) : null,
  };

  // Nutrition
  const nutrition: NutritionData = {
    hydrationMl: rndInt(400, 2800),
    hydrationGoalMl: 2500,
    caloriesConsumed: rndInt(800, 2400),
    proteinG: rndInt(20, 120),
    carbsG: rndInt(80, 300),
    fatG: rndInt(20, 100),
  };

  // Weekly
  const stepsPerDay = Array.from({ length: 7 }, () => rndInt(2000, 14000));
  stepsPerDay[6] = steps;
  const caloriesPerDay = Array.from({ length: 7 }, () => rndInt(100, 700));
  caloriesPerDay[6] = calories;
  const sleepPerDay = Array.from({ length: 7 }, () => Number(rnd(4.5, 9.5).toFixed(1)));
  sleepPerDay[6] = sleepHours;

  const weekly: WeeklyData = {
    stepsPerDay,
    caloriesPerDay,
    sleepPerDay,
    goalsAchieved: rndInt(2, 7),
    avgSleep: Number((sleepPerDay.reduce((a, b) => a + b, 0) / 7).toFixed(1)),
    avgActiveMinutes: rndInt(20, 70),
    totalCalories: caloriesPerDay.reduce((a, b) => a + b, 0),
  };

  return {
    steps,
    activeMinutes,
    calories,
    distanceKm,
    floorsClimbed: rndInt(0, 20),
    heartPoints,
    vo2Max: Math.random() > 0.3 ? Number(rnd(28, 55).toFixed(1)) : null,
    sleepHours,
    sleep,
    vitals,
    body,
    nutrition,
    weekly,
    lastUpdated: new Date().toISOString(),
  };
};

// ──────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────

const GoogleFitContext = createContext<FitnessContextType | undefined>(undefined);

export function GoogleFitProvider({ children }: { children: ReactNode }) {
  const { showToast } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<FitnessProvider>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<HealthData | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('google_fit_connected');
    const storedProvider = localStorage.getItem('google_fit_provider') as FitnessProvider;
    const storedData = localStorage.getItem('google_fit_data');

    if (storedAuth === 'true') {
      setIsConnected(true);
      setProvider(storedProvider || 'google-fit');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // Guard: if old shape, regenerate
          if (!parsed.vitals || !parsed.body || !parsed.nutrition) {
            const fresh = generateMockData();
            setData(fresh);
            localStorage.setItem('google_fit_data', JSON.stringify(fresh));
          } else {
            setData(parsed);
          }
        } catch {
          const fresh = generateMockData();
          setData(fresh);
          localStorage.setItem('google_fit_data', JSON.stringify(fresh));
        }
      } else {
        const fresh = generateMockData();
        setData(fresh);
        localStorage.setItem('google_fit_data', JSON.stringify(fresh));
      }
    }
  }, []);

  const connect = async (prov: FitnessProvider = 'google-fit') => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsConnected(true);
    setProvider(prov);
    localStorage.setItem('google_fit_connected', 'true');
    localStorage.setItem('google_fit_provider', prov || 'google-fit');
    const d = generateMockData();
    setData(d);
    localStorage.setItem('google_fit_data', JSON.stringify(d));
    setIsSyncing(false);
    showToast('success', 'Connected', `${prov === 'health-connect' ? 'Health Connect' : 'Google Fit'} connected successfully.`);
  };

  const disconnect = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 500));
    setIsConnected(false);
    setProvider(null);
    setData(null);
    localStorage.removeItem('google_fit_connected');
    localStorage.removeItem('google_fit_provider');
    localStorage.removeItem('google_fit_data');
    setIsSyncing(false);
    showToast('info', 'Disconnected', 'Fitness tracker disconnected.');
  };

  const sync = async () => {
    if (!isConnected) return;
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1800));
    const d = generateMockData();
    setData(d);
    localStorage.setItem('google_fit_data', JSON.stringify(d));
    setIsSyncing(false);
  };

  return (
    <GoogleFitContext.Provider value={{ isConnected, provider, isSyncing, data, connect, disconnect, sync }}>
      {children}
    </GoogleFitContext.Provider>
  );
}

export function useGoogleFit() {
  const ctx = useContext(GoogleFitContext);
  if (!ctx) throw new Error('useGoogleFit must be used within GoogleFitProvider');
  return ctx;
}
