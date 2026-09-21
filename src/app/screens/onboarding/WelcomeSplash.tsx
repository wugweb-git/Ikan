import { motion } from 'framer-motion';
import { markOnboardingSeen } from '../../../lib/first-run';

// The iKan mark, inlined so the splash never falls back to an admin-uploaded
// icon and needs no cross-branch dependency. Colour comes from `currentColor`.
const MARK_D =
  'M27.0893 49.0455H30.534V33.6987L41.6648 44.3411L44.0111 41.9975L33.3519 30.8777H48.5428C49.184 30.3946 49.0948 29.2904 49.0287 28.5112C49.0028 28.2207 49.0517 27.9217 48.9626 27.637L48.5428 27.1165H33.3519L44.0111 15.9967L41.6648 13.6531L30.534 24.2956V8.95449H27.0893V19.2921C26.4164 18.8608 26.1174 17.7336 25.7838 16.9974C24.7401 14.6941 23.8113 12.3016 23.0062 9.9063L19.5816 11.3268L23.3282 20.8593L15.9701 13.6618C15.5502 14.3117 13.3534 15.6833 13.7589 16.4712L20.8238 23.6745L11.2659 19.6343L9.88568 22.8463L19.2567 27.1223H8.91954V30.8806H19.2567L9.88568 35.1566L11.2659 38.3686L20.8238 34.3284L13.7589 41.5317C13.3506 42.3196 15.5502 43.6912 15.9701 44.3411L23.3282 37.1436L19.5816 46.6761L23.0062 48.0966C23.8113 45.6984 24.7401 43.3088 25.7838 41.0055C26.1174 40.2693 26.4164 39.1392 27.0893 38.7108V49.0484V49.0455ZM0 29C0 12.9831 12.9854 0 29.0014 0C45.0175 0 58 12.9831 58 29C58 45.0169 45.0175 58 29.0014 58C12.9854 58 0.00287603 45.0169 0.00287603 29H0Z';

interface WelcomeSplashProps {
  onNavigate?: (route: string) => void;
}

/**
 * Splash — the first screen a signed-out first-time visitor sees. No app
 * equivalent existed; this is the entry to the onboarding flow.
 */
export function WelcomeSplash({ onNavigate }: WelcomeSplashProps) {
  const goOnboarding = () => onNavigate?.('/onboarding');
  const goLogin = () => {
    markOnboardingSeen();
    onNavigate?.('/login');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: '32px 28px',
        background: 'var(--ikan-brand-teal-dark)',
        textAlign: 'center',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--color-bg-card)',
          display: 'grid',
          placeItems: 'center',
          flex: 'none',
        }}
      >
        <svg width={40} height={40} viewBox="0 0 58 58" style={{ color: 'var(--ikan-brand-teal-dark)', display: 'block' }} aria-label="iKan" role="img">
          <path d={MARK_D} fill="currentColor" />
        </svg>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-medium)', letterSpacing: '-.02em', color: 'var(--color-bg-card)' }}
      >
        iKan
      </motion.span>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-bg-card)', margin: '-8px 0 26px' }}>
        Mental wellness, measured.
      </p>
      <button
        onClick={goOnboarding}
        style={{
          minWidth: 200,
          width: '100%',
          minHeight: 48,
          border: 0,
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-bg-card)',
          color: 'var(--ikan-brand-teal-dark)',
          font: 'inherit',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          cursor: 'pointer',
        }}
      >
        Get started
      </button>
      <button
        onClick={goLogin}
        style={{
          border: 0,
          background: 'transparent',
          color: 'var(--color-bg-card)',
          font: 'inherit',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          cursor: 'pointer',
          minHeight: 36,
        }}
      >
        I already have an account
      </button>
    </div>
  );
}

export default WelcomeSplash;
