import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-client';

interface ResetPasswordProps {
  onNavigate?: (route: string) => void;
}

/**
 * Password-reset completion screen. Reached from the Supabase recovery email
 * link (`…/reset-password#…type=recovery`). The singleton client has
 * `detectSessionInUrl: true`, so it exchanges the recovery token for a
 * temporary session and emits `PASSWORD_RECOVERY`; we then let the user set a
 * new password via `supabase.auth.updateUser`.
 */
export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    // The recovery session may already be present (detectSessionInUrl), or it
    // arrives via the PASSWORD_RECOVERY event a moment later.
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) setHasSession(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true);
    });

    // Give the URL-token exchange a brief moment before deciding it's invalid.
    const t = setTimeout(() => mounted && setReady(true), 1200);

    return () => { mounted = false; clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      setDone(true);
      // Sign out the temporary recovery session and send them to login.
      await supabase.auth.signOut().catch(() => {});
      setTimeout(() => onNavigate?.('/login'), 1800);
    } catch (err: any) {
      setError(err?.message || 'Could not update your password. The link may have expired — request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  const card: React.CSSProperties = {
    width: '100%', maxWidth: 420, margin: '0 auto',
    backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border-default)', padding: 32,
  };
  const input: React.CSSProperties = {
    width: '100%', height: 48, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-input)',
    padding: '0 14px', fontSize: 15, fontFamily: 'var(--font-family-base)', outline: 'none',
    color: 'var(--color-text-primary)', marginTop: 8,
  };
  const label: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)',
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div style={card}>
        <h1 style={{ fontSize: 24, fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          {done ? 'Password updated' : 'Set a new password'}
        </h1>

        {done ? (
          <p style={{ ...label, fontSize: 15 }}>Your password has been changed. Redirecting you to sign in…</p>
        ) : !hasSession && ready ? (
          <div>
            <p style={{ ...label, fontSize: 15, marginBottom: 16 }}>
              This reset link is invalid or has expired. Please request a new password reset email.
            </p>
            <button onClick={() => onNavigate?.('/login')} style={{ ...input, height: 48, cursor: 'pointer', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', border: 'none', fontWeight: 600 }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ ...label, fontSize: 15, margin: '0 0 16px' }}>Choose a strong new password for your account.</p>
            <label style={label}>New password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} placeholder="At least 8 characters" autoComplete="new-password" required />
            </label>
            <div style={{ height: 14 }} />
            <label style={label}>Confirm password
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={input} placeholder="Re-enter password" autoComplete="new-password" required />
            </label>
            {error && <p style={{ color: 'var(--color-status-danger, #dc2626)', fontSize: 13, marginTop: 12 }}>{error}</p>}
            <button type="submit" disabled={submitting} style={{ ...input, marginTop: 20, height: 50, cursor: submitting ? 'not-allowed' : 'pointer', backgroundColor: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', border: 'none', fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
