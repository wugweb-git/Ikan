import { LegalPage } from './LegalPage';

/** The switcher needs the router, so this passes `onNavigate` straight through. */
export const PrivacyPolicy = ({ onNavigate }: { onNavigate?: (route: string) => void } = {}) => (
  <LegalPage
    cmsKey="privacy"
    title="Privacy Policy"
    subtitle="Your privacy and data security are fundamental to our mission."
    onNavigate={onNavigate}
  />
);
