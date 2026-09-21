import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNotifications } from '../../../shared/contexts/NotificationContext';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { apiClient } from '../../../shared/api';
import { supabase } from '../../../shared/supabase';
import { fetchGoogleFitData, GOOGLE_FIT_SCOPES } from '../../lib/google-fit';

const GFIT_PENDING_KEY = 'ikan-gfit-connecting';

// ──────────────────────────────────────────────────────────────────
// Types — kept identical so ActivityCard / WellnessScoreCard work
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
  oxygenSaturation: number;
  respiratoryRate: number;
  bodyTemperature: number;
  bloodGlucose: number | null;
}

export interface BodyData {
  weight: number;
  height: number;
  bmi: number;
  bodyFatPct: number | null;
}

export interface NutritionData {
  hydrationMl: number;
  hydrationGoalMl: number;
  caloriesConsumed: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface WeeklyData {
  stepsPerDay: number[];
  caloriesPerDay: number[];
  sleepPerDay: number[];
  goalsAchieved: number;
  avgSleep: number;
  avgActiveMinutes: number;
  totalCalories: number;
}

export interface HealthData {
  // ─── Activity ───
  steps: number;
  activeMinutes: number;
  calories: number;
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
  source?: 'health-connect' | 'manual-entry';
}

export type FitnessProvider = 'health-connect' | null;

interface HealthConnectContextType {
  isConnected: boolean;
  provider: FitnessProvider;
  isSyncing: boolean;
  data: HealthData | null;
  lastSyncAt: string | null;
  connect: (provider?: FitnessProvider) => Promise<void>;
  connectGoogleFit: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<void>;
  submitManualEntry: (entry: Partial<HealthData>) => Promise<void>;
}

// ──────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────

const HealthConnectContext = createContext<HealthConnectContextType | undefined>(undefined);

// ──────────────────────────────────────────────────────────────────
// Provider — fetches real data from server, zero mock generation
// ──────────────────────────────────────────────────────────────────

export function GoogleFitProvider({ children }: { children: ReactNode }) {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<FitnessProvider>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<HealthData | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // ── Fetch status + data from server ────────────────────────
  const fetchFromServer = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);

      const [statusRes, dataRes] = await Promise.all([
        apiClient.get('/health-connect/status'),
        apiClient.get('/health-connect/data'),
      ]);

      const connected = statusRes?.connected === true;
      setIsConnected(connected);
      setProvider(connected ? 'health-connect' : null);
      setLastSyncAt(statusRes?.lastSyncAt || null);

      if (dataRes?.data) {
        setData(dataRes.data as HealthData);
      } else {
        setData(null);
      }
    } catch (err: any) {
      // Silently fail on auth errors (user not logged in yet), 404s (edge function cold start),
      // and network errors (server unreachable / offline)
      const msg = err?.message?.toLowerCase() || '';
      const isNetworkError = err?.name === 'TypeError' && msg.includes('failed to fetch');
      if (!err?.message?.includes('401') && !err?.message?.includes('404') && !err?.message?.includes('AbortError') && !isNetworkError) {
        console.error('Health Connect fetch error:', err);
      }
    } finally {
      if (!silent) setIsSyncing(false);
      setInitialLoadDone(true);
    }
  }, []);

  // Load on mount — only fetch when user is authenticated
  useEffect(() => {
    if (!user) {
      // Not logged in — reset to defaults
      setIsConnected(false);
      setProvider(null);
      setData(null);
      setLastSyncAt(null);
      setInitialLoadDone(true);
      // Lazily tear down native bridge if it was initialized
      import('../../lib/health-connect-bridge').then(m => m.destroyHealthBridge()).catch(() => {});
      return;
    }
    // Lazily init native bridge so TWA wrapper can push data (non-blocking)
    import('../../lib/health-connect-bridge').then(m => {
      m.initHealthBridge({
        onDataReceived: () => fetchFromServer(true),
        onError: (err) => console.error('[HealthBridge] Native push error:', err),
      });
    }).catch((err) => console.warn('[HealthBridge] Could not initialize:', err));
    const timer = setTimeout(() => fetchFromServer(true), 300);
    return () => {
      clearTimeout(timer);
      import('../../lib/health-connect-bridge').then(m => m.destroyHealthBridge()).catch(() => {});
    };
  }, [fetchFromServer, user]);

  // ── Connect ────────────────────────────────────────────────
  const connect = useCallback(async (_provider: FitnessProvider = 'health-connect') => {
    try {
      setIsSyncing(true);
      const res = await apiClient.post('/health-connect/connect', {
        deviceName: navigator.userAgent,
      });
      if (res?.success) {
        setIsConnected(true);
        setProvider('health-connect');
        showToast('success', 'Connected', 'Health Connect linked successfully.');
        // Fetch any existing data
        await fetchFromServer(true);
      }
    } catch (err) {
      console.error('Health Connect connect error:', err);
      showToast('error', 'Connection Failed', 'Could not connect to Health Connect. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [fetchFromServer, showToast]);

  // ── Connect Google Fit (web OAuth) ─────────────────────────
  // Starts a Google OAuth flow with Fitness scopes. The browser redirects to
  // Google; on return, the effect below reads `provider_token` and syncs.
  const connectGoogleFit = useCallback(async () => {
    try {
      setIsSyncing(true);
      localStorage.setItem(GFIT_PENDING_KEY, '1');
      const options = {
        scopes: GOOGLE_FIT_SCOPES,
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      };
      // Prefer linkIdentity (keeps the current account); fall back to OAuth sign-in.
      const supaAuth = supabase.auth as any;
      const { error } = typeof supaAuth.linkIdentity === 'function'
        ? await supaAuth.linkIdentity({ provider: 'google', options })
        : await supabase.auth.signInWithOAuth({ provider: 'google', options });
      if (error) {
        localStorage.removeItem(GFIT_PENDING_KEY);
        throw error;
      }
      // Browser redirects to Google now.
    } catch (err: any) {
      console.error('Google Fit connect error:', err);
      showToast('error', 'Google Fit', err?.message || 'Could not start the Google Fit connection.');
      setIsSyncing(false);
    }
  }, [showToast]);

  // After the Google OAuth redirect returns, import the data once.
  useEffect(() => {
    if (!user) return;
    if (typeof localStorage === 'undefined' || localStorage.getItem(GFIT_PENDING_KEY) !== '1') return;
    let cancelled = false;
    (async () => {
      try {
        setIsSyncing(true);
        const { data: sess } = await supabase.auth.getSession();
        const token = (sess.session as any)?.provider_token;
        if (!token) {
          showToast('error', 'Google Fit', 'Google did not return access — please reconnect and grant the fitness permissions.');
          return;
        }
        const payload = await fetchGoogleFitData(token);
        await apiClient.post('/health-connect/connect', { deviceName: 'Google Fit' });
        await apiClient.post('/health-connect/data', payload);
        if (!cancelled) {
          await fetchFromServer(true);
          showToast('success', 'Google Fit synced', 'Your fitness data has been imported.');
        }
      } catch (err: any) {
        console.error('Google Fit sync error:', err);
        showToast('error', 'Google Fit sync failed', err?.message || 'Could not import your data.');
      } finally {
        localStorage.removeItem(GFIT_PENDING_KEY);
        if (!cancelled) setIsSyncing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, fetchFromServer, showToast]);

  // ── Disconnect ─────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    try {
      setIsSyncing(true);
      await apiClient.post('/health-connect/disconnect', {});
      setIsConnected(false);
      setProvider(null);
      setData(null);
      setLastSyncAt(null);
      showToast('info', 'Disconnected', 'Health Connect has been unlinked.');
    } catch (err) {
      console.error('Health Connect disconnect error:', err);
      showToast('error', 'Error', 'Could not disconnect. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  // ── Sync (re-fetch from server) ────────────────────────────
  const sync = useCallback(async () => {
    if (!isConnected) return;
    setIsSyncing(true);
    try {
      await fetchFromServer(false);
      showToast('success', 'Synced', 'Health data refreshed.');
    } catch (err) {
      console.error('Health Connect sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, fetchFromServer, showToast]);

  // ── Manual entry ───────────────────────────────────────────
  const submitManualEntry = useCallback(async (entry: Partial<HealthData>) => {
    try {
      setIsSyncing(true);
      const res = await apiClient.post('/health-connect/manual-entry', entry);
      if (res?.data) {
        setData(res.data as HealthData);
        setIsConnected(true);
        setProvider('health-connect');
        showToast('success', 'Saved', 'Health data updated.');
      }
    } catch (err) {
      console.error('Manual entry error:', err);
      showToast('error', 'Error', 'Could not save health data.');
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  // Don't render children until initial load is done to avoid flash
  const value: HealthConnectContextType = {
    isConnected,
    provider,
    isSyncing: isSyncing && initialLoadDone, // don't show syncing spinner on initial load
    data,
    lastSyncAt,
    connect,
    connectGoogleFit,
    disconnect,
    sync,
    submitManualEntry,
  };

  return (
    <HealthConnectContext.Provider value={value}>
      {children}
    </HealthConnectContext.Provider>
  );
}

// ── Aliases ──────────────────────────────────────────────────────
// Keep the old name so existing imports don't break
export const HealthConnectProvider = GoogleFitProvider;

export function useGoogleFit() {
  const ctx = useContext(HealthConnectContext);
  if (!ctx) throw new Error('useGoogleFit must be used within GoogleFitProvider / HealthConnectProvider');
  return ctx;
}

export const useHealthConnect = useGoogleFit;