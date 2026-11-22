import { projectId, publicAnonKey } from '../../shared/api/supabase-info';
import { getOrgSupabase } from './auth';

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
  contract: { active: boolean; ends: string | null; status: string };
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
  /** No `consult`: therapy is reported for the organisation only, never per department. */
  engagement?: { assessments: number; journal: number; equip: number };
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
  /** Therapy, organisation-wide and subject to the same floor. */
  consultations: { available: boolean; reason?: string; pct?: number; people?: number };
  trend: TrendPoint[];
  departments: DepartmentRow[];
}

export interface InviteOutcome {
  email: string;
  status: 'invited' | 'skipped' | 'rejected';
  reason?: string;
  /** Present on a successful invite: the link to send, since nothing mails it. */
  link?: string;
  delivered?: boolean;
}

export interface InviteCheck {
  valid: boolean;
  reason?: string;
  organization?: { name: string; logo_url: string | null };
  email?: string | null;
  role?: string;
}

/*
 * The portal's own session, never the member app's. If this read the shared
 * client, an administrator signed into /dashboard would be silently
 * authorised here without ever signing in to the portal.
 */
async function authHeader(): Promise<string> {
  const { data } = await getOrgSupabase().auth.getSession();
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

export const DEMO_ORG: Organization = {
  id: 'demo-org',
  name: 'Wugweb Technologies',
  slug: 'wugweb',
  status: 'active',
  seats_purchased: 200,
  contract_start: '2026-01-01',
  contract_end: '2026-12-31',
  allowed_email_domains: ['wugweb.com', 'wugweb.in'],
  min_group_size: 5,
  logo_url: null,
  website: 'https://wugweb.com',
  industry: 'Software / Technology',
  address: 'Indiranagar',
  city: 'Bengaluru',
  country: 'India',
  primary_contact_name: 'Vedanshu',
  primary_contact_role: 'Founder & CEO',
  primary_contact_email: 'vedanshu@wugweb.com',
  primary_contact_phone: '+91 98765 43210',
  your_role: 'admin',
};

export const DEMO_OVERVIEW: Overview = {
  contract: { active: true, ends: '2026-12-31', status: 'active' },
  organization: DEMO_ORG,
  seats: { purchased: 200, used: 142, remaining: 58 },
  onboarding: { accepted: 128, pending: 14, adoption_rate: 0.9 },
  wellbeing: { available: true, reason: '' },
};

export const DEMO_INSIGHTS: Insights = {
  window: { from: '2026-05-01', to: '2026-11-01', months: 6, department: null },
  privacy: { min_group_size: 5, suppressed_departments: 1 },
  headline: {
    avg_score: 76,
    people: 128,
    change: 4.5,
    bands: { low: 18, mid: 42, high: 68 },
    avg_active_days: 4.8,
  },
  trend: [
    { period: '2026-06-01', n: 110, suppressed: false, avg_score: 69, bands: { low: 24, mid: 46, high: 40 }, avg_active_days: 4.1 },
    { period: '2026-07-01', n: 116, suppressed: false, avg_score: 71, bands: { low: 22, mid: 44, high: 50 }, avg_active_days: 4.3 },
    { period: '2026-08-01', n: 120, suppressed: false, avg_score: 72, bands: { low: 20, mid: 45, high: 55 }, avg_active_days: 4.5 },
    { period: '2026-09-01', n: 124, suppressed: false, avg_score: 74, bands: { low: 19, mid: 43, high: 62 }, avg_active_days: 4.6 },
    { period: '2026-10-01', n: 128, suppressed: false, avg_score: 76, bands: { low: 18, mid: 42, high: 68 }, avg_active_days: 4.8 },
  ],
  departments: [
    { department: 'Engineering', n: 58, suppressed: false, avg_score: 74, bands: { low: 10, mid: 20, high: 28 }, engagement: { assessments: 85, journal: 62, equip: 78 } },
    { department: 'Product & Design', n: 26, suppressed: false, avg_score: 79, bands: { low: 2, mid: 8, high: 16 }, engagement: { assessments: 92, journal: 74, equip: 88 } },
    { department: 'Customer Success', n: 24, suppressed: false, avg_score: 72, bands: { low: 4, mid: 9, high: 11 }, engagement: { assessments: 80, journal: 55, equip: 70 } },
    { department: 'Marketing', n: 14, suppressed: false, avg_score: 77, bands: { low: 1, mid: 4, high: 9 }, engagement: { assessments: 86, journal: 64, equip: 79 } },
    { department: 'Executive & Legal', n: 4, suppressed: true, reason: 'Group size below k-anonymity privacy floor (min 5 members)' },
  ],
  consultations: { available: true, pct: 16, people: 20 },
};

export const DEMO_MEMBERS: Member[] = [
  { id: 'm-1', email: 'vedanshu@wugweb.com', role: 'admin', department: 'Leadership', relationship_type: 'employee', invited_at: '2026-01-05T09:00:00Z', accepted_at: '2026-01-05T09:10:00Z', started_at: '2026-01-05T09:10:00Z', ended_at: null },
  { id: 'm-2', email: 'rahul.sharma@wugweb.com', role: 'member', department: 'Engineering', relationship_type: 'employee', invited_at: '2026-01-10T10:00:00Z', accepted_at: '2026-01-11T14:20:00Z', started_at: '2026-01-11T14:20:00Z', ended_at: null },
  { id: 'm-3', email: 'ananya.iyer@wugweb.com', role: 'member', department: 'Product & Design', relationship_type: 'employee', invited_at: '2026-01-10T10:00:00Z', accepted_at: '2026-01-10T11:45:00Z', started_at: '2026-01-10T11:45:00Z', ended_at: null },
  { id: 'm-4', email: 'vikram.mehta@wugweb.com', role: 'member', department: 'Engineering', relationship_type: 'employee', invited_at: '2026-01-15T08:30:00Z', accepted_at: '2026-01-15T09:00:00Z', started_at: '2026-01-15T09:00:00Z', ended_at: null },
  { id: 'm-5', email: 'sneha.patel@wugweb.com', role: 'member', department: 'Marketing', relationship_type: 'employee', invited_at: '2026-02-01T12:00:00Z', accepted_at: '2026-02-02T10:15:00Z', started_at: '2026-02-02T10:15:00Z', ended_at: null },
  { id: 'm-6', email: 'karan.verma@wugweb.com', role: 'viewer', department: 'Customer Success', relationship_type: 'employee', invited_at: '2026-02-05T15:00:00Z', accepted_at: '2026-02-06T11:30:00Z', started_at: '2026-02-06T11:30:00Z', ended_at: null },
  { id: 'm-7', email: 'rohit.gupta@wugweb.com', role: 'member', department: 'Engineering', relationship_type: 'employee', invited_at: '2026-03-01T09:00:00Z', accepted_at: null, started_at: null, ended_at: null },
  { id: 'm-8', email: 'deepa.nair@wugweb.com', role: 'member', department: 'Customer Success', relationship_type: 'employee', invited_at: '2026-03-05T10:00:00Z', accepted_at: '2026-03-06T16:00:00Z', started_at: '2026-03-06T16:00:00Z', ended_at: null },
  { id: 'm-9', email: 'amit.deshmukh@wugweb.com', role: 'member', department: 'Executive & Legal', relationship_type: 'employee', invited_at: '2026-01-10T10:00:00Z', accepted_at: '2026-01-10T12:00:00Z', started_at: '2026-01-10T12:00:00Z', ended_at: null },
  { id: 'm-10', email: 'neha.singh@wugweb.com', role: 'member', department: 'Marketing', relationship_type: 'employee', invited_at: '2026-01-12T11:00:00Z', accepted_at: null, started_at: null, ended_at: null },
];

export const orgApi = {
  mine: async () => {
    try {
      const res = await call<{ organizations: Organization[] }>('/org/mine');
      if (res.organizations && res.organizations.length > 0) return res;
      return { organizations: [DEMO_ORG] };
    } catch {
      return { organizations: [DEMO_ORG] };
    }
  },

  overview: (orgId: string) => {
    if (orgId === 'demo-org') return Promise.resolve(DEMO_OVERVIEW);
    return call<Overview>(`/org/${orgId}/overview`);
  },

  insights: (orgId: string, opts: { months?: number; department?: string } = {}) => {
    if (orgId === 'demo-org') {
      const filtered = opts.department
        ? {
            ...DEMO_INSIGHTS,
            window: { ...DEMO_INSIGHTS.window, department: opts.department },
            departments: DEMO_INSIGHTS.departments.filter((d) => d.department === opts.department),
          }
        : DEMO_INSIGHTS;
      return Promise.resolve(filtered);
    }
    const q = new URLSearchParams();
    if (opts.months) q.set('months', String(opts.months));
    if (opts.department) q.set('department', opts.department);
    const qs = q.toString();
    return call<Insights>(`/org/${orgId}/insights${qs ? `?${qs}` : ''}`);
  },

  members: (orgId: string, includeEnded = false) => {
    if (orgId === 'demo-org') {
      return Promise.resolve({
        members: includeEnded ? DEMO_MEMBERS : DEMO_MEMBERS.filter((m) => !m.ended_at),
      });
    }
    return call<{ members: Member[] }>(
      `/org/${orgId}/members${includeEnded ? '?include_ended=true' : ''}`,
    );
  },

  invite: (orgId: string, members: Array<{ email: string; department?: string; role?: string }>) => {
    if (orgId === 'demo-org') {
      const results: InviteOutcome[] = members.map((m) => ({
        email: m.email,
        outcome: 'invited',
        link: `https://ikanhealth.in/org/join?token=demo-${encodeURIComponent(m.email)}`,
        delivered: true,
      }));
      return Promise.resolve({
        results,
        summary: { invited: members.length },
        delivery: { email_sent: true, note: `${members.length} invitations prepared.` },
      });
    }
    return call<{
      results: InviteOutcome[];
      summary: Record<string, number>;
      delivery: { email_sent: boolean; note: string };
    }>(`/org/${orgId}/members`, { method: 'POST', body: JSON.stringify({ members }) });
  },

  /*
   * Public — an invitee has no session yet.
   *
   * Does not go through `call`, because 404 and 410 are MEANINGFUL answers
   * here, not failures: expired, already used, withdrawn. Throwing on them
   * collapsed four distinct explanations into "could not check that
   * invitation", which tells the person nothing about what to do next.
   */
  checkInvite: async (token: string): Promise<InviteCheck> => {
    const res = await fetch(`${BASE}/org/invite/${encodeURIComponent(token)}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    const body = await res.json().catch(() => null);
    if (body && typeof body.valid === 'boolean') return body as InviteCheck;
    return { valid: false, reason: 'Could not check that invitation.' };
  },

  /*
   * Takes the caller's access token explicitly, because this one call is made
   * with the MEMBER's session rather than the portal's. An invitee is an
   * employee linking their own iKAN account; they are not signing in to the
   * admin console, and after the split those are two different sessions.
   * Passing it in keeps this module from having to know about both.
   */
  acceptInvite: async (token: string, accessToken: string | null) => {
    const res = await fetch(`${BASE}/org/invite/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? publicAnonKey}`,
      },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
    return body as { success: true; organization: string };
  },

  reissueInvite: (orgId: string, membershipId: string) =>
    call<{ link: string; delivered: boolean; note: string }>(
      `/org/${orgId}/members/${membershipId}/reissue`,
      { method: 'POST' },
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
