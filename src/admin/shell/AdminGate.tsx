import '../ui/styles/index.css'; // admin's own stylesheet — loads with the admin chunk
import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../shared/state/AuthContext';

interface AdminGateProps {
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

/**
 * Client-side admin gate.
 *
 * Renders `children` only once the SERVER profile (`GET /users/profile`) says
 * `is_admin === true` for the signed-in user. The cached
 * `ikan_is_admin_{uid}` localStorage hint is deliberately ignored: it is
 * writable by anyone with devtools and was previously the only thing standing
 * between any signed-in patient and the admin console UI.
 *
 * While verification is pending a spinner is shown — never the admin UI, so
 * nothing flashes for a non-admin. The API enforces admin on every admin route
 * regardless; this gate is what stops the console rendering at all.
 */
export function AdminGate({ onNavigate, children }: AdminGateProps) {
  const { user, verifiedIsAdmin, verifyAdmin, signOut } = useAuth();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user || verifiedIsAdmin !== null) return;
    let cancelled = false;
    setVerifyError(null);
    verifyAdmin().catch((err: unknown) => {
      if (cancelled) return;
      console.error('Admin verification failed:', err);
      setVerifyError("We couldn't verify admin access. Check your connection and try again.");
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, verifiedIsAdmin, attempt]);

  const handleSignOut = useCallback(async () => {
    try { await signOut(); } catch { /* local state is cleared regardless */ }
    onNavigate('/admin/login');
  }, [signOut, onNavigate]);

  if (verifiedIsAdmin === true) return <>{children}</>;

  const shell = (content: React.ReactNode) => (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl p-6 text-center space-y-4"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        {content}
      </div>
    </div>
  );

  if (verifiedIsAdmin === null && !verifyError) {
    return shell(
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
          Checking admin access…
        </p>
      </div>
    );
  }

  const isDenied = verifiedIsAdmin === false;
  return shell(
    <>
      <ShieldAlert className="w-8 h-8 mx-auto" style={{ color: 'var(--color-status-warning)' }} aria-hidden="true" />
      <h1
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        {isDenied ? 'Not authorised' : 'Admin access not verified'}
      </h1>
      <p role="alert" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
        {isDenied ? "This account doesn't have admin access." : verifyError}
      </p>
      <div className="flex flex-col gap-2 pt-2">
        {!isDenied && (
          <Button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </Button>
        )}
        <Button type="button" variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
        <Button type="button" variant="ghost" onClick={() => onNavigate('/')}>
          Back to app
        </Button>
      </div>
    </>
  );
}
