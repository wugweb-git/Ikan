/**
 * Health Connect Native Bridge
 *
 * Exposes `window.__IKAN_HEALTH_BRIDGE__` so a TWA wrapper or companion
 * Android app can push real Health Connect data into the PWA.
 *
 * ──────────────────────────────────────────────────────────────────
 * ANDROID SIDE USAGE (Kotlin):
 *
 *   // In your TWA Activity or WebViewClient, after reading Health Connect:
 *   val json = Gson().toJson(healthPayload)
 *   webView.evaluateJavascript(
 *     "window.__IKAN_HEALTH_BRIDGE__.pushData($json)",
 *     null
 *   )
 *
 *   // To check connection status:
 *   webView.evaluateJavascript(
 *     "window.__IKAN_HEALTH_BRIDGE__.isReady()",
 *     { value -> Log.d("Bridge", "Ready: $value") }
 *   )
 *
 * ──────────────────────────────────────────────────────────────────
 * EXPECTED PAYLOAD SHAPE (HealthData):
 *
 *   {
 *     steps: 8432,
 *     activeMinutes: 45,
 *     calories: 312,
 *     distanceKm: 6.7,
 *     floorsClimbed: 4,
 *     heartPoints: 36,
 *     vo2Max: null,
 *     sleepHours: 7.5,
 *     sleep: {
 *       totalHours: 7.5,
 *       bedtime: "23:15",
 *       wakeTime: "06:45",
 *       efficiency: 88,
 *       deepSleepMins: 90,
 *       lightSleepMins: 210,
 *       remSleepMins: 105,
 *       awakeMins: 45
 *     },
 *     vitals: {
 *       restingHeartRate: 68,
 *       bloodPressureSystolic: 118,
 *       bloodPressureDiastolic: 76,
 *       oxygenSaturation: 98,
 *       respiratoryRate: 15,
 *       bodyTemperature: 36.5,
 *       bloodGlucose: null
 *     },
 *     body: { weight: 72, height: 175, bmi: 23.5, bodyFatPct: null },
 *     nutrition: {
 *       hydrationMl: 2100,
 *       hydrationGoalMl: 2500,
 *       caloriesConsumed: 1850,
 *       proteinG: 85,
 *       carbsG: 220,
 *       fatG: 65
 *     },
 *     weekly: {
 *       stepsPerDay: [6200, 8100, 7500, 9200, 8432, 0, 0],
 *       caloriesPerDay: [280, 350, 310, 420, 312, 0, 0],
 *       sleepPerDay: [7.2, 6.8, 7.5, 8.0, 7.5, 0, 0],
 *       goalsAchieved: 3,
 *       avgSleep: 7.4,
 *       avgActiveMinutes: 42,
 *       totalCalories: 1672
 *     }
 *   }
 * ──────────────────────────────────────────────────────────────────
 */

import { apiClient } from '../../shared/api-client';

interface BridgeCallbacks {
  onDataReceived?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

interface HealthBridge {
  /** Check if the bridge is initialized and the user is authenticated */
  isReady: () => boolean;
  /** Push a full Health Connect data snapshot to the server */
  pushData: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  /** Get the last sync timestamp */
  getLastSync: () => string | null;
  /** Bridge version identifier */
  version: string;
}

// Module-level state
let _lastSync: string | null = null;
let _callbacks: BridgeCallbacks = {};
let _ready = false;

/**
 * Initialize the Health Connect bridge.
 * Call this once from the HealthConnectProvider after auth is confirmed.
 */
export function initHealthBridge(callbacks: BridgeCallbacks = {}): void {
  _callbacks = callbacks;
  _ready = true;

  const bridge: HealthBridge = {
    version: '1.0.0',

    isReady: () => _ready,

    getLastSync: () => _lastSync,

    pushData: async (data) => {
      if (!_ready) {
        return { success: false, error: 'Bridge not ready — user may not be authenticated' };
      }

      try {
        // Validate minimum required fields
        if (!data || typeof data !== 'object') {
          return { success: false, error: 'Invalid data: expected an object' };
        }

        const required = ['steps', 'activeMinutes', 'calories', 'sleepHours'];
        const missing = required.filter(f => data[f] === undefined);
        if (missing.length > 0) {
          return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
        }

        // POST to server
        const res = await apiClient.post('/health-connect/data', data);

        if (res?.success) {
          _lastSync = res.receivedAt || new Date().toISOString();
          _callbacks.onDataReceived?.(data);
          return { success: true };
        }

        return { success: false, error: 'Server did not confirm receipt' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[HealthBridge] pushData error:', msg);
        _callbacks.onError?.(msg);
        return { success: false, error: msg };
      }
    },
  };

  // Expose on window for native access
  (window as any).__IKAN_HEALTH_BRIDGE__ = bridge;

  console.log('[HealthBridge] Initialized v1.0.0 — native bridge ready');
}

/**
 * Tear down the bridge (call on sign-out).
 */
export function destroyHealthBridge(): void {
  _ready = false;
  _callbacks = {};
  _lastSync = null;
  delete (window as any).__IKAN_HEALTH_BRIDGE__;
}
