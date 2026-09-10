/**
 * The private mobile nav, on its own — DEV ONLY, not part of the build.
 *
 * `BottomNavBarMobile` only renders for a signed-in user, so the five tabs and
 * the More sheet cannot be looked at without a session. This mounts the real
 * component.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { BottomNavBarMobile } from '../components/navigation/BottomNavBarMobile';
import '../index.css';

function Harness() {
  const [route, setRoute] = useState('/dashboard');
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)', padding: 16 }}>
      <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 14 }}>
        route: <code>{route}</code>
      </p>
      <BottomNavBarMobile currentRoute={route} onNavigate={setRoute} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <Harness />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);
