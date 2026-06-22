/**
 * Web Google Fit sync.
 *
 * Uses a Google OAuth access token (obtained via Supabase `linkIdentity`/`signInWithOAuth`
 * with Fitness scopes) to read aggregated fitness data from the Google Fit REST API,
 * then maps it into the shape the existing `/health-connect/data` endpoint expects so the
 * dashboard renders it unchanged.
 *
 * NOTE: Google is sunsetting the Fit APIs in favour of Health Connect; this web path is a
 * pragmatic bridge. Requires the Fitness API enabled + scopes on the OAuth consent screen.
 */

export const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.body.read',
].join(' ');

const AGGREGATE_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
const DAY_MS = 86_400_000;

async function aggregate(token: string, dataTypeName: string, startMs: number, endMs: number) {
  const res = await fetch(AGGREGATE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aggregateBy: [{ dataTypeName }],
      bucketByTime: { durationMillis: DAY_MS },
      startTimeMillis: startMs,
      endTimeMillis: endMs,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Google Fit ${dataTypeName} ${res.status}: ${txt.slice(0, 120)}`);
  }
  return res.json();
}

/** Per-day summed totals (one entry per daily bucket). */
function perDayTotals(json: any): number[] {
  return (json?.bucket || []).map((b: any) => {
    let total = 0;
    for (const ds of b.dataset || []) {
      for (const p of ds.point || []) {
        for (const v of p.value || []) {
          total += (typeof v.fpVal === 'number' ? v.fpVal : (v.intVal || 0));
        }
      }
    }
    return total;
  });
}

/** Average of non-zero per-bucket point values (for heart rate). */
function latestAverage(json: any): number {
  const buckets = json?.bucket || [];
  for (let i = buckets.length - 1; i >= 0; i--) {
    for (const ds of buckets[i].dataset || []) {
      for (const p of ds.point || []) {
        for (const v of p.value || []) {
          if (typeof v.fpVal === 'number' && v.fpVal > 0) return Math.round(v.fpVal);
        }
      }
    }
  }
  return 0;
}

export interface GoogleFitPayload {
  steps: number;
  activeMinutes: number;
  calories: number;
  distanceKm: number;
  heartPoints: number;
  sleepHours: number;
  vitals?: { restingHeartRate: number };
  weekly: { stepsPerDay: number[]; caloriesPerDay: number[]; sleepPerDay: number[] };
  source: 'google-fit';
  lastUpdated: string;
}

/** Pull the last 7 days of Google Fit data and shape it for `/health-connect/data`. */
export async function fetchGoogleFitData(accessToken: string): Promise<GoogleFitPayload> {
  const end = Date.now();
  const start = end - 7 * DAY_MS;

  const [stepsJson, calJson, distJson, activeJson, hrJson] = await Promise.all([
    aggregate(accessToken, 'com.google.step_count.delta', start, end),
    aggregate(accessToken, 'com.google.calories.expended', start, end),
    aggregate(accessToken, 'com.google.distance.delta', start, end),
    aggregate(accessToken, 'com.google.active_minutes', start, end),
    aggregate(accessToken, 'com.google.heart_rate.bpm', start, end).catch(() => null),
  ]);

  const stepsPerDay = perDayTotals(stepsJson).map((n) => Math.round(n));
  const caloriesPerDay = perDayTotals(calJson).map((n) => Math.round(n));
  const distancePerDay = perDayTotals(distJson); // metres
  const activePerDay = perDayTotals(activeJson).map((n) => Math.round(n));

  const last = (arr: number[]) => (arr.length ? arr[arr.length - 1] : 0);
  const restingHeartRate = hrJson ? latestAverage(hrJson) : 0;
  const activeMinutes = last(activePerDay);

  return {
    steps: last(stepsPerDay),
    activeMinutes,
    calories: last(caloriesPerDay),
    distanceKm: Math.round((last(distancePerDay) / 1000) * 10) / 10,
    heartPoints: Math.round(activeMinutes * 0.8),
    sleepHours: 0, // sleep is read via Sessions API; left 0 for the activity-first MVP
    vitals: restingHeartRate ? { restingHeartRate } : undefined,
    weekly: {
      stepsPerDay,
      caloriesPerDay,
      sleepPerDay: [],
    },
    source: 'google-fit',
    lastUpdated: new Date().toISOString(),
  };
}
