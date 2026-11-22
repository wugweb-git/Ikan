import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';

interface VerifyEmailProps {
  onNavigate?: (route: string) => void;
  /** The address the account was created with, if known. */
  email?: string;
}

/**
 * Verify-email screen. The app previously surfaced email verification only as a
 * toast; this gives it a screen after sign-up. Verification itself still happens
 * via the emailed link — this screen sets the expectation and offers a resend.
 */
export function VerifyEmail({ onNavigate, email }: VerifyEmailProps) {
  const [resent, setResent] = useState(false);
  const address = email || 'the address you signed up with';

  const linkBtn: React.CSSProperties = {
    border: 0,
    background: 'transparent',
    color: 'var(--ikan-teal-on-wash)',
    font: 'inherit',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer',
    minHeight: 36,
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-card)', fontFamily: 'var(--font-family-base)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 12px', borderBottom: '1px solid var(--color-border-light)' }}>
        <button
          onClick={() => onNavigate?.('/login')}
          aria-label="Go back"
          style={{ width: 36, height: 36, borderRadius: '50%', border: 0, background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', margin: 0, color: 'var(--color-text-primary)' }}>Verify email</h1>
        <span style={{ width: 36 }} />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: '32px 24px' }}
      >
        <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--ikan-brand-teal-bg)', color: 'var(--ikan-teal-on-wash)', display: 'grid', placeItems: 'center' }}>
          <Mail size={30} strokeWidth={1.5} />
        </span>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-medium)', letterSpacing: '-.025em', margin: 0, color: 'var(--color-text-primary)' }}>Verify your email</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, maxWidth: 320, lineHeight: 1.6 }}>
          Check your inbox to confirm your account, then sign in.
        </p>
        <div style={{ width: '100%', maxWidth: 360, background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '16px 18px' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.55 }}>
            We sent a link to <b style={{ color: 'var(--color-text-primary)' }}>{address}</b>. It expires in 24 hours.
          </p>
        </div>
        <button
          onClick={() => onNavigate?.('/login')}
          style={{ width: '100%', maxWidth: 360, minHeight: 48, border: 0, borderRadius: 'var(--radius-pill)', background: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', font: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer', marginTop: 4 }}
        >
          Back to sign in
        </button>
        <button style={linkBtn} onClick={() => setResent(true)} disabled={resent}>
          {resent ? 'Email sent — check your inbox' : 'Resend the email'}
        </button>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'auto 0 0' }}>
          Wrong address? <button style={{ ...linkBtn, minHeight: 'auto', display: 'inline' }} onClick={() => onNavigate?.('/login')}>Change it</button>
        </p>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
