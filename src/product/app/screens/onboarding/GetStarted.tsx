import { useState } from 'react';
import { ArrowLeft, Check, Info } from 'lucide-react';
import { markFirstRunComplete } from '../../lib/first-run';

interface GetStartedProps {
  onNavigate?: (route: string) => void;
}

const FOCUS_AREAS = ['Sleep', 'Stress', 'Anxiety', 'Low mood', 'Burnout', 'Focus', 'Work-life balance'];

/**
 * First-run "getting started" — shown once after a user's first sign-in, before
 * the dashboard. No first-run concept existed in the app. Picking focus areas
 * only decides which assessment is suggested first; both Skip and Continue mark
 * first-run complete and go to the dashboard.
 */
export function GetStarted({ onNavigate }: GetStartedProps) {
  const [picked, setPicked] = useState<Set<string>>(new Set(['Sleep', 'Stress']));

  const toggle = (area: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  };
  const done = () => {
    markFirstRunComplete();
    onNavigate?.('/dashboard');
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-page)', fontFamily: 'var(--font-family-base)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 12px', background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-light)' }}>
        <button
          onClick={done}
          aria-label="Go back"
          style={{ width: 36, height: 36, borderRadius: '50%', border: 0, background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', margin: 0, color: 'var(--color-text-primary)' }}>Getting started</h1>
        <span style={{ width: 36 }} />
      </header>

      <div style={{ padding: '14px 16px 12px', background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-light)' }}>
        <div style={{ height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--color-bg-muted)', overflow: 'hidden' }}>
          <div style={{ width: '33%', height: '100%', background: 'var(--ikan-brand-teal)', borderRadius: 'var(--radius-pill)' }} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 8, display: 'block' }}>Step 1 of 3</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)', margin: '0 0 8px', letterSpacing: '-.015em', color: 'var(--color-text-primary)' }}>What brings you here?</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
            Pick as many as fit. It decides which assessment we suggest first — nothing else.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FOCUS_AREAS.map((area) => {
            const on = picked.has(area);
            return (
              <button
                key={area}
                aria-pressed={on}
                onClick={() => toggle(area)}
                style={{
                  border: on ? '1px solid transparent' : '1px solid var(--color-border-default)',
                  background: on ? 'var(--color-primary-default)' : 'transparent',
                  color: on ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                  font: 'inherit',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                {area}
              </button>
            );
          })}
        </div>

        <section style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 12 }}>Then</span>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['A reminder time.', 'One notification a day, only if you have not checked in.'],
              ['Health Connect.', 'Optional. Sleep and steps, read-only, and you pick which.'],
            ].map(([b, rest]) => (
              <li key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                <Check size={14} strokeWidth={2.6} style={{ flex: 'none', marginTop: 2, color: 'var(--ikan-teal-on-wash)' }} />
                <span><b style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{b}</b> {rest}</span>
              </li>
            ))}
          </ul>
        </section>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
          <Info size={15} strokeWidth={1.8} style={{ flex: 'none', marginTop: 1 }} />
          <span>You can skip all of this. Nothing here is required to use iKan, and every answer is editable later in More → Settings.</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border-default)' }}>
        <button
          onClick={done}
          style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 'var(--radius-pill)', background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', font: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
        >
          Skip
        </button>
        <button
          onClick={done}
          style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 'var(--radius-pill)', background: 'var(--color-primary-default)', color: 'var(--color-text-inverse)', font: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default GetStarted;
