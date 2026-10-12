import { projectId, publicAnonKey } from '../../shared/api/supabase-info';
import { supabase } from '../../shared/api/supabase';

/**
 * The organisation portal's API client.
 *
 * Its own, not the member app's `apiClient`: that one carries sixty methods
 * for assessments, journals and programmes, and this surface must not be able
 * to reach any of them. The import boundary forbids it anyway — this file
 * exists so there is a legal way to make the handful of calls the portal
 * actually needs.
 *
 * Every call carries the signed-in user's JWT. The anon key is only a
 * fallback so an unauthenticated request reaches the edge function and comes
 * back as a clean 401 rather than failing at the gateway.
 */

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'ended';
  seats_purchased: number;
  contract_start: string | null;
  contract_end: string | null;
  allowed_email_domains: string[];
  min_group_size: number;
  your_role?: 'admin' | 'viewer';
}

export interface Member {
  id: string;
  email: string;
  role: 'member' | 'admin' | 'viewer';
  department: string | null;
  relationship_type: string;
  invited_at: string;
  accepted_at: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export interface Overview {
  organization: Organization;
  seats: { purchased: number; used: number; remaining: number };
  onboarding: { accepted: number; pending: number; adoption_rate: number | null };
  /** Always `available: false` today — see `org-routes.ts` for why. */
  wellbeing: { available: boolean; reason: string };
}

export interface InviteOutcome {
  email: string;
  status: 'invited' | 'skipped' | 'rejected';
  reason?: string;
}

async function authHeader(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return `Bearer ${data.session?.access_token ?? publicAnonKey}`;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: await authHeader(),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    /*
     * The server's own message when it has one — "No seats remaining" is
     * worth showing; a raw status code is not. Parsing is guarded because an
     * error from the gateway rather than the function is not JSON.
     */
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const orgApi = {
  mine: () => call<{ organizations: Organization[] }>('/org/mine'),

  overview: (orgId: string) => call<Overview>(`/org/${orgId}/overview`),

  members: (orgId: string, includeEnded = false) =>
    call<{ members: Member[] }>(
      `/org/${orgId}/members${includeEnded ? '?include_ended=true' : ''}`,
    ),

  invite: (orgId: string, members: Array<{ email: string; department?: string; role?: string }>) =>
    call<{ results: InviteOutcome[]; summary: Record<string, number> }>(
      `/org/${orgId}/members`,
      { method: 'POST', body: JSON.stringify({ members }) },
    ),

  updateMember: (orgId: string, id: string, patch: { department?: string | null; role?: string }) =>
    call<{ member: Member }>(`/org/${orgId}/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  /** Ends a membership. Never deletes — the row is the historical record. */
  endMembership: (orgId: string, id: string) =>
    call<{ success: true }>(`/org/${orgId}/members/${id}`, { method: 'DELETE' }),

  updateOrg: (orgId: string, patch: Partial<Organization>) =>
    call<{ organization: Organization }>(`/org/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
};
