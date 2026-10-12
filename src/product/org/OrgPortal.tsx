import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../shared/state/AuthContext';
import { signOutLocal } from '../../shared/api/supabase';
import { orgApi, type Organization, type Overview as OverviewData } from './api';
import { Overview } from './pages/Overview';
import { People } from './pages/People';
import { Settings } from './pages/Settings';

/**
 * The organisation portal shell — `/org`.
 *
 * A fourth surface beside site, app and admin, with its own import boundary.
 * That boundary is the point: an org admin must never see an individual's
 * wellbeing data, and `app/` is where every component that renders exactly
 * that lives. Making the import a build failure is a stronger guarantee than
 * remembering not to write it.
 *
 * Access is decided by `org_memberships`, not by a flag on the user. A person
 * can admin one organisation and be an ordinary member of another, and a role
 * that lives on the user cannot express that.
 */

type Section = 'overview' | 'people' | 'settings';

const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'people', label: 'People' },
  { id: 'settings', label: 'Settings' },
];

/** `/org`, `/org/people`, `/org/settings` — the URL is the state. */
function sectionFromPath(path: string): Section {
  const tail = path.replace(/^\/org\/?/, '').split('?')[0];
  return tail === 'people' || tail === 'settings' ? tail : 'overview';
}

export interface OrgPortalProps {
  route?: string;
  onNavigate?: (route: string) => void;
}

export function OrgPortal({ route, onNavigate }: OrgPortalProps) {
  const { user, isInitialized, signIn } = useAuth();
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [active, setActive] = useState<Organization | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [error, setError] = useState('');

  const section = sectionFromPath(route ?? (typeof window !== 'undefined' ? window.location.pathname : '/org'));

  /* The shell's title is the marketing site's. org/ cannot import the site's
     `useSeo` across the boundary, and does not need it — there is nothing to
     optimise on a page that is disallowed in robots.txt. */
  useEffect(() => {
    const label = SECTIONS.find((s) => s.id === section)?.label ?? 'Organisation';
    document.title = `${label} · iKAN for Organisations`;
  }, [section]);

  const go = (s: Section) => onNavigate?.(s === 'overview' ? '/org' : `/org/${s}`);

  /* Which organisations may this person open? An empty list is a complete,
     correct answer — most signed-in users are not org admins — so it gets its
     own screen rather than an error. */
  useEffect(() => {
    if (!isInitialized || !user) return;
    let live = true;
    (async () => {
      try {
        const { organizations } = await orgApi.mine();
        if (!live) return;
        setOrgs(organizations);
        setActive((cur) => cur ?? organizations[0] ?? null);
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : 'Could not load your organisations.');
      }
    })();
    return () => { live = false; };
  }, [isInitialized, user]);

  const loadOverview = useCallback(async (org: Organization) => {
    try {
      setOverview(await orgApi.overview(org.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the overview.');
    }
  }, []);

  useEffect(() => {
    if (active) void loadOverview(active);
  }, [active, loadOverview]);

  if (!isInitialized) {
    return <div className="ikan2-theme org-portal"><div className="org-page">Loading…</div></div>;
  }

  if (!user) return <SignIn onSignIn={signIn} />;

  if (orgs === null && !error) {
    return <div className="ikan2-theme org-portal"><div className="org-page">Loading…</div></div>;
  }

  if (orgs !== null && orgs.length === 0) {
    return (
      <div className="ikan2-theme org-portal">
        <div className="org-page">
          <h1 className="org-page__title">No organisation</h1>
          <p className="org-page__lede">
            This account is not an administrator of any organisation. If your employer uses iKAN
            and you should have access here, ask whoever set it up to add you as an admin — or
            write to <a href="mailto:support@ikanhealth.in">support@ikanhealth.in</a>.
          </p>
          <div style={{ marginTop: 22 }}>
            <button type="button" className="org-button org-button--quiet" onClick={() => void signOutLocal()}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canWrite = active?.your_role === 'admin';

  return (
    <div className="ikan2-theme org-portal">
      <header className="org-bar">
        <div className="org-bar__inner">
          <a className="org-bar__brand" href="/org">
            <img src="/favicon.svg" alt="" width={32} height={32} />
            iKAN
          </a>
          {active && <span className="org-bar__org">{active.name}</span>}

          <span className="org-bar__spacer" />

          <nav className="org-tabs" aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="org-tab"
                aria-current={s.id === section ? 'page' : undefined}
                onClick={() => go(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <button type="button" className="org-button org-button--quiet" onClick={() => void signOutLocal()}>
            Sign out
          </button>
        </div>
      </header>

      {/* Someone who administers two organisations switches here. Hidden for
          the common case of one, where a picker is just a control that does
          nothing. */}
      {orgs && orgs.length > 1 && (
        <div className="org-page" style={{ paddingBottom: 0 }}>
          <label className="org-field" style={{ maxWidth: 320, marginTop: 0 }}>
            <span>Organisation</span>
            <select
              value={active?.id ?? ''}
              onChange={(e) => setActive(orgs.find((o) => o.id === e.target.value) ?? null)}
            >
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
        </div>
      )}

      {error && (
        <div className="org-page" style={{ paddingBottom: 0 }}>
          <div className="org-note org-note--error" role="alert">{error}</div>
        </div>
      )}

      {active && section === 'overview' && overview && <Overview data={overview} />}
      {active && section === 'people' && <People org={active} canWrite={canWrite} />}
      {active && section === 'settings' && (
        <Settings
          org={active}
          canWrite={canWrite}
          onSaved={(o) => {
            setActive(o);
            void loadOverview(o);
          }}
        />
      )}
    </div>
  );
}

/**
 * The portal's own sign-in.
 *
 * Separate from the member app's `/login` because the audiences do not
 * overlap: this is an HR or leadership account, and sending them through a
 * screen that offers "track your mood" is the wrong first impression of a
 * product they are paying for.
 */
function SignIn({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      setBusy(false);
    }
  };

  return (
    <div className="ikan2-theme org-portal">
      <div className="org-signin">
        <div className="org-signin__card">
          <h1 className="org-page__title" style={{ fontSize: 22, lineHeight: '30px' }}>
            Organisation sign in
          </h1>
          <p className="org-page__lede" style={{ fontSize: 14 }}>
            For administrators of an organisation that uses iKAN.
          </p>

          <form onSubmit={submit}>
            <label className="org-field">
              <span>Work email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="org-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && <div className="org-note org-note--error" role="alert">{error}</div>}

            <div style={{ marginTop: 20 }}>
              <button type="submit" className="org-button" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrgPortal;
