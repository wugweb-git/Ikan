import { LegalPage } from './LegalPage';

/** The switcher needs the router, so this passes `onNavigate` straight through. */
export const ReturnPolicy = ({ onNavigate }: { onNavigate?: (route: string) => void } = {}) => (
  <LegalPage
    cmsKey="return-policy"
    title="Return & Refund Policy"
    subtitle="Understanding our refund and return policy for iKAN services."
    onNavigate={onNavigate}
  />
);
