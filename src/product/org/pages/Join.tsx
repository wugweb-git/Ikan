import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../shared/state/AuthContext';
import { orgApi, type InviteCheck } from '../api';

/**
 * `/org/join?token=…` — where an invitation lands.
 *
 * This is the step that turns a row on a roster into a person who belongs to
 * an organisation: accepting is what sets `user_id` on the membership, and
 * until it happens nothing can be grouped by them.
 *
 * STUB BOUNDARY, stated on the screen rather than hidden: creating an account
 * happens in the iKAN app, not here. Someone invited who has no account is
 * told so plainly and sent to make one. Closing that round trip is a product
 * decision — which app do they sign up in, and how do they come back — not a
 * missing function.
 */

export function Join({ token, onNavigate }: { token: string; onNavigate?: (r: string) => void }) {
  const { user, isInitialized, signIn } = useAuth();
  const [check, setCheck] = useState<InviteCheck | null>(null);
  const [state, setState] = useState<'checking' | 'ready' | 'accepting' | 'done' | 'invalid'>('checking');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const r = await orgApi.checkInvite(token);
        if (!live) return;
        setCheck(r);
        setState(r.valid ? 'ready' : 'invalid');
        if (r.valid && r.email) setEmail(r.email);
      } catch {
        if (live) { setState('invalid'); setCheck({ valid: false, reason: 'Could not check that invitation.' }); }
      }
    })();
    return () => { live = false; };
  }, [token]);

  const accept = async () => {
    setState('accepting');
    setError('');
    try {
      await orgApi.acceptInvite(token);
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not accept that invitation.');
      setState('ready');
    }
  };

  const signInThenAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email.trim(), password);
      // The accept call reads the session, so it runs after sign-in resolves.
      await accept();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="ikan2-theme org-portal">
      <div className="org-signin">
        <div className="org-signin__card">{children}</div>
      </div>
    </div>
  );

  if (state === 'checking' || !isInitialized) return shell(<p className="org-page__lede">Checking your invitation…</p>);

  if (state === 'invalid' || !check?.valid) {
    return shell(
      <>
        <h1 className="org-page__title" style={{ fontSize: 22, lineHeight: '30px' }}>
          This invitation can&rsquo;t be used
        </h1>
        <p className="org-page__lede" style={{ fontSize: 14 }}>{check?.reason}</p>
        <p className="org-login__help">
          Ask whoever invited you to send a new link, or write to{' '}
          <a href="mailto:support@ikanhealth.in">support@ikanhealth.in</a>.
        </p>
      </>,
    );
  }

  if (state === 'done') {
    return shell(
      <>
        <CheckCircle2 aria-hidden="true" style={{ width: 28, height: 28, color: 'var(--brand-teal-ink)' }} />
        <h1 className="org-page__title" style={{ fontSize: 22, lineHeight: '30px', marginTop: 12 }}>
          You&rsquo;re in
        </h1>
        <p className="org-page__lede" style={{ fontSize: 14 }}>
          Your iKAN account is now linked to {check.organization?.name}. Everything you do in iKAN
          stays private — your employer only ever sees anonymous figures for groups of ten or more.
        </p>
        <div style={{ marginTop: 20 }}>
          <button type="button" className="org-button" onClick={() => onNavigate?.('/org')}>
            Continue
          </button>
        </div>
      </>,
    );
  }

  return shell(
    <>
      <h1 className="org-page__title" style={{ fontSize: 22, lineHeight: '30px' }}>
        Join {check.organization?.name}
      </h1>
      <p className="org-page__lede" style={{ fontSize: 14 }}>
        {check.email} was invited to use iKAN, paid for by {check.organization?.name}.
      </p>

      {user ? (
        <>
          <p className="org-field__hint" style={{ marginTop: 14 }}>Signed in as {user.email}.</p>
          {error && <div className="org-note org-note--error" role="alert">{error}</div>}
          <div style={{ marginTop: 18 }}>
            <button type="button" className="org-button" disabled={state === 'accepting'} onClick={accept}
              style={{ width: '100%', justifyContent: 'center' }}>
              {state === 'accepting' ? 'Joining…' : 'Accept invitation'}
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={signInThenAccept}>
          <label className="org-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="org-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <div className="org-note org-note--error" role="alert">{error}</div>}
          <div style={{ marginTop: 18 }}>
            <button type="submit" className="org-button" style={{ width: '100%', justifyContent: 'center' }}>
              Sign in and join
            </button>
          </div>
          {/* The honest gap. */}
          <p className="org-login__help">
            No iKAN account yet? Create one in the iKAN app first, then open this link again.
            Account sign-up does not happen on this page.
          </p>
        </form>
      )}

      <aside className="org-privacy" style={{ marginTop: 24 }}>
        <p>
          <strong>What your employer can see:</strong> how many people use iKAN and how the
          organisation is doing overall. <strong>What they cannot see:</strong> your scores, your
          answers, your journal, whether you have had a therapy session — anything that is about
          you. <a href="/workplace-privacy">Read the detail</a>.
        </p>
      </aside>
    </>,
  );
}

export default Join;
