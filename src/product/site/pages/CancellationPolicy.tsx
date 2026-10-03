import { LegalPage } from './LegalPage';

/** The switcher needs the router, so this passes `onNavigate` straight through. */
export const CancellationPolicy = ({ onNavigate }: { onNavigate?: (route: string) => void } = {}) => (
  <LegalPage
    cmsKey="cancellation-policy"
    title="Cancellation Policy"
    subtitle="We understand plans change. Cancel anytime with no penalties or hidden fees."
    onNavigate={onNavigate}
  />
);
