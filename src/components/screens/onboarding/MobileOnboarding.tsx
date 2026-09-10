import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CalendarDays } from 'lucide-react';
import { markOnboardingSeen } from '../../../lib/first-run';

interface MobileOnboardingProps {
  onNavigate?: (route: string) => void;
}

const STEPS = [
  {
    icon: BarChart3,
    title: 'Understand where you stand',
    body: "Seven scientifically validated assessments turn how you're feeling into a number you can track over time.",
    cta: 'Next',
  },
  {
    icon: CalendarDays,
    title: 'A program built for you',
    body: 'Equip pairs your results with a day-by-day plan — sleep, stress, focus — paced to fit your life.',
    cta: 'Get started',
  },
];

/**
 * Two-panel onboarding shown once to a signed-out first visitor. No onboarding
 * route existed before. "Skip" and the final CTA both mark onboarding seen and
 * hand off to sign-in.
 */
export function MobileOnboarding({ onNavigate }: MobileOnboardingProps) {
  const [step, setStep] = useState(0);
  const finish = () => {
    markOnboardingSeen();
    onNavigate?.('/login');
  };
  const advance = () => (step === STEPS.length - 1 ? finish() : setStep(step + 1));

  const { icon: Icon, title, body, cta } = STEPS[step];

  const btn: React.CSSProperties = {
    width: '100%',
    minHeight: 48,
    border: 0,
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-primary-default)',
    color: 'var(--color-text-inverse)',
    font: 'inherit',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-card)', fontFamily: 'var(--font-family-base)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 18px 0' }}>
        <button
          onClick={finish}
          style={{ border: 0, background: 'transparent', color: 'var(--ikan-teal-on-wash)', font: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer', minHeight: 32 }}
        >
          Skip
        </button>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '8px 28px 6px', textAlign: 'center' }}
      >
        <span
          aria-hidden="true"
          style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--ikan-brand-teal-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ikan-teal-on-wash)' }}
        >
          <Icon size={40} strokeWidth={1.8} />
        </span>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-medium)', letterSpacing: '-.02em', margin: '4px 0 0', color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
          {body}
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '4px 0 0' }}>
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === step ? 18 : 7,
              height: 7,
              borderRadius: i === step ? 4 : '50%',
              background: i === step ? 'var(--ikan-brand-teal-dark)' : 'var(--color-border-default)',
              transition: 'width .2s',
            }}
          />
        ))}
      </div>

      <div style={{ padding: '18px 22px calc(28px + env(safe-area-inset-bottom))' }}>
        <button onClick={advance} style={btn}>{cta}</button>
      </div>
    </div>
  );
}

export default MobileOnboarding;
