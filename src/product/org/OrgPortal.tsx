import { useCallback, useEffect, useState } from 'react';
import { OrgAuthProvider, useOrgAuth } from './auth';
import { orgApi, type Organization, type Overview as OverviewData } from './api';
import { Insights } from './pages/Insights';
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

/* The same photograph the member login uses, so the two front doors of one
   product do not look like two products. */
const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1759951609703-f03171e6f66e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwc3Vuc2V0JTIwbGFrZSUyMG5hdHVyZSUyMG1pbmRmdWxuZXNzJTIwcGVhY2VmdWx8ZW58MXx8fHwxNzczNjY4MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080';

/*
 * Three sections, not four. Overview and Insights were split only because
 * they were built in two passes: the first held four roster numbers and the
 * second everything an administrator actually comes for. Nobody reads
 * adoption and wellbeing as separate errands.
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

/**
 * The portal, inside its own auth provider.
 *
 * Wrapped here rather than in App.tsx so the member app's tree never mounts
 * a second GoTrue client, and so the portal's session begins and ends with
 * the portal.
 */
export function OrgPortal(props: OrgPortalProps) {
  return (
    <OrgAuthProvider>
      <OrgPortalInner {...props} />
    </OrgAuthProvider>
  );
}

function OrgPortalInner({ route, onNavigate }: OrgPortalProps) {
  const { user, isInitialized, signIn, signOut } = useOrgAuth();

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
            <button type="button" className="org-button org-button--quiet" onClick={() => void signOut()}>
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
          {active && (
            <span className="org-bar__org">
              {/* The organisation's own mark where it has one. The initial is
                  not a placeholder for a missing image — it is what most
                  organisations will show, so it has to look deliberate. */}
              {active.logo_url ? (
                <img className="org-bar__logo" src={active.logo_url} alt="" />
              ) : (
                <span className="org-bar__initial" aria-hidden="true">{active.name.charAt(0)}</span>
              )}
              {active.name}
            </span>
          )}

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

          <button type="button" className="org-button org-button--quiet" onClick={() => void signOut()}>
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

      {active && section === 'overview' && <Insights org={active} overview={overview} />}
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
    <div className="ikan2-theme org-portal org-login">
      {/* The member login's split: image left, form right, brand top-left of
          the form column. Rebuilt rather than imported — org/ may not reach
          into app/ — and reduced to what an administrator signing in needs:
          no sign-up, no social buttons, no "forgot password" to a flow this
          surface does not own. */}
      <aside className="org-login__art" aria-hidden="true">
        <img src={HERO_IMAGE_URL} alt="" />
        <div className="org-login__scrim" />
        <div className="org-login__words">
          <h2>Wellbeing your people can use, and you can measure.</h2>
          <p>Aggregate insight into how your organisation is doing — never a window into any
            one person.</p>
        </div>
      </aside>

      <div className="org-login__form">
        <a className="org-bar__brand" href="/">
          <img src="/favicon.svg" alt="" width={32} height={32} />
          iKAN
        </a>

        <div className="org-login__card">
          <h1 className="org-page__title" style={{ fontSize: 24, lineHeight: '32px' }}>
            Organisation sign in
          </h1>
          <p className="org-page__lede" style={{ fontSize: 14 }}>
            For administrators of an organisation that uses iKAN. Looking for your own iKAN
            account? That lives in the app.
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
                placeholder="you@yourcompany.com"
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
              <button
                type="submit"
                className="org-button"
                disabled={busy}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="org-login__help">
            No access yet? Ask whoever set up iKAN at your organisation, or write to{' '}
            <a href="mailto:support@ikanhealth.in">support@ikanhealth.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrgPortal;
