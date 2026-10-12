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
  /** The organisation's own mark. Null is normal; the UI falls back to an initial. */
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  /** Whoever is responsible for the account — often not a portal admin. */
  primary_contact_name: string | null;
  primary_contact_role: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  your_role?: 'admin' | 'viewer';
  /** True when visibility comes from iKAN staff access, not a membership. */
  via_staff?: boolean;
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

export interface TrendPoint {
  period: string;
  n: number;
  suppressed: boolean;
  reason?: string;
  avg_score?: number;
  bands?: { low: number; mid: number; high: number };
  avg_active_days?: number;
}

export interface DepartmentRow {
  department: string;
  n: number;
  suppressed: boolean;
  reason?: string;
  avg_score?: number;
  bands?: { low: number; mid: number; high: number };
  engagement?: { assessments: number; journal: number; equip: number; consult: number };
}

export interface Insights {
  window: { from: string; to: string; months: number; department: string | null };
  privacy: { min_group_size: number; suppressed_departments: number };
  headline: {
    avg_score: number;
    people: number;
    change: number | null;
    bands: { low: number; mid: number; high: number };
    avg_active_days: number;
  } | null;
  trend: TrendPoint[];
  departments: DepartmentRow[];
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

  insights: (orgId: string, opts: { months?: number; department?: string } = {}) => {
    const q = new URLSearchParams();
    if (opts.months) q.set('months', String(opts.months));
    if (opts.department) q.set('department', opts.department);
    const qs = q.toString();
    return call<Insights>(`/org/${orgId}/insights${qs ? `?${qs}` : ''}`);
  },

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

  /** multipart, so no Content-Type header — the browser sets the boundary. */
  uploadLogo: async (orgId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/org/${orgId}/logo`, {
      method: 'POST',
      headers: { Authorization: await authHeader() },
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `Upload failed (${res.status})`);
    }
    return res.json() as Promise<{ organization: Organization }>;
  },

  updateOrg: (orgId: string, patch: Partial<Organization>) =>
    call<{ organization: Organization }>(`/org/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
};
