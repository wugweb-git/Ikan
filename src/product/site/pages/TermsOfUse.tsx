import { LegalPage } from './LegalPage';

/** The switcher needs the router, so this passes `onNavigate` straight through. */
export const TermsOfUse = ({ onNavigate }: { onNavigate?: (route: string) => void } = {}) => (
  <LegalPage
    cmsKey="terms"
    title="Terms of Service"
    subtitle="Important legal terms governing your use of iKAN's mental health platform and services."
    onNavigate={onNavigate}
  />
);
