import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

export interface DatabaseSyncResult {
  success: boolean;
  message: string;
  assessments_found: number;
  assessments_expected: number;
  equip_programs_found: number;
  missing_data: string[];
  sync_actions: string[];
}

async function apiRequest(path: string): Promise<any> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function apiPost(path: string, body?: unknown): Promise<any> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Check the current state of the database — how many assessments and
 * equip programs exist vs. what is expected.
 */
export async function checkDatabaseState(): Promise<DatabaseSyncResult> {
  const missing: string[] = [];
  const syncActions: string[] = [];
  let assessmentsFound = 0;
  let equipProgramsFound = 0;
  const assessmentsExpected = 2; // PHQ-9, GAD-7

  try {
    // Check assessments
    try {
      const assessments = await apiRequest('/assessments');
      const list = Array.isArray(assessments) ? assessments : assessments?.data ?? [];
      assessmentsFound = list.length;

      if (assessmentsFound < assessmentsExpected) {
        const names = list.map((a: any) => (a.name || a.title || '').toLowerCase());
        if (!names.some((n: string) => n.includes('phq'))) missing.push('PHQ-9 assessment');
        if (!names.some((n: string) => n.includes('gad'))) missing.push('GAD-7 assessment');
      }
    } catch (err) {
      console.error('Failed to check assessments:', err);
      missing.push('Could not verify assessments');
    }

    // Check equip programs
    try {
      const programs = await apiRequest('/equip/programs');
      const list = Array.isArray(programs) ? programs : programs?.data ?? [];
      equipProgramsFound = list.length;

      if (equipProgramsFound === 0) {
        missing.push('Equip program (32-day)');
      }
    } catch (err) {
      console.error('Failed to check equip programs:', err);
      missing.push('Could not verify equip programs');
    }

    const success = missing.length === 0;

    return {
      success,
      message: success
        ? 'All expected data is present'
        : `Missing ${missing.length} item(s)`,
      assessments_found: assessmentsFound,
      assessments_expected: assessmentsExpected,
      equip_programs_found: equipProgramsFound,
      missing_data: missing,
      sync_actions: syncActions,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Database check failed: ${msg}`,
      assessments_found: assessmentsFound,
      assessments_expected: assessmentsExpected,
      equip_programs_found: equipProgramsFound,
      missing_data: [...missing, msg],
      sync_actions: syncActions,
    };
  }
}

/**
 * Attempt a full sync — seed any missing assessments and equip program data
 * via the server's seed / init endpoints, then re-check state.
 */
export async function syncCompleteDatabase(): Promise<DatabaseSyncResult> {
  const syncActions: string[] = [];

  try {
    // First, check what's missing
    const state = await checkDatabaseState();

    if (state.success) {
      return {
        ...state,
        message: 'Database already fully synced — no action needed',
        sync_actions: ['Verified: all data present'],
      };
    }

    // Try to seed missing data via server endpoints
    try {
      const seedResult = await apiPost('/seed');
      syncActions.push(
        `Seed endpoint responded: ${seedResult?.message || 'OK'}`
      );
    } catch (err) {
      // Seed endpoint may not exist — try individual endpoints
      console.warn('Seed endpoint not available, trying individual sync:', err);

      // Try assessment seeding
      if (state.assessments_found < state.assessments_expected) {
        try {
          await apiPost('/assessments/seed');
          syncActions.push('Seeded assessments');
        } catch {
          syncActions.push('Assessment seed endpoint not available');
        }
      }

      // Try equip program seeding
      if (state.equip_programs_found === 0) {
        try {
          await apiPost('/equip/seed');
          syncActions.push('Seeded equip program');
        } catch {
          syncActions.push('Equip seed endpoint not available');
        }
      }
    }

    // Re-check state after sync attempt
    const postSyncState = await checkDatabaseState();

    return {
      ...postSyncState,
      message: postSyncState.success
        ? 'Database synced successfully'
        : `Sync partially completed — ${postSyncState.missing_data.length} item(s) still missing`,
      sync_actions: syncActions,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Full sync failed: ${msg}`,
      assessments_found: 0,
      assessments_expected: 2,
      equip_programs_found: 0,
      missing_data: [msg],
      sync_actions: syncActions,
    };
  }
}
