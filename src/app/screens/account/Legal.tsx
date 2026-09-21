import { FileText, CircleHelp, Info, ChevronRight, Shield, RotateCcw, CircleX } from 'lucide-react';
import { AccountPageHeader } from '../../ui/blocks/AccountPageHeader';
import { useIsMobile } from '../../../shared/hooks/useIsMobile';

// ─── Font helper ──────────────────────────────────────────────
const f = (size: string, weight: number = 400, color: string = 'var(--color-text-primary)') => ({
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  fontFamily: 'var(--font-family-base)',
  color,
});

interface LegalPage {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  description: string;
}

const LEGAL_PAGES: LegalPage[] = [
  { id: 'terms', label: 'Terms of Use', icon: <FileText size={20} />, color: 'var(--color-primary-default)', bg: 'var(--color-accent-default)', description: 'Service terms and conditions' },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: <Shield size={20} />, color: 'var(--color-status-info)', bg: 'var(--color-status-info-light)', description: 'How we handle your data' },
  { id: 'return-policy', label: 'Return Policy', icon: <RotateCcw size={20} />, color: 'var(--color-status-warning)', bg: 'var(--color-status-warning-light)', description: 'Refund and return guidelines' },
  { id: 'cancellation-policy', label: 'Cancellation Policy', icon: <CircleX size={20} />, color: 'var(--color-status-danger)', bg: 'var(--color-status-danger-light)', description: 'How to cancel subscriptions' },
  { id: 'faq', label: 'FAQ', icon: <CircleHelp size={20} />, color: '#7C3AED', bg: '#EDE9FE', description: 'Frequently asked questions' },
  { id: 'about', label: 'About iKAN', icon: <Info size={20} />, color: 'var(--color-status-success)', bg: 'var(--color-status-success-light)', description: 'Our mission and story' },
];

interface LegalProps {
  onNavigate?: (route: string) => void;
}

export function Legal({ onNavigate }: LegalProps) {
  const isMobile = useIsMobile();

  const handlePageClick = (pageId: string) => {
    onNavigate?.(`/${pageId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <AccountPageHeader
        title="Legal & Info"
        subtitle="Policies, terms, and helpful information"
      />

      {/* 2x3 grid on desktop, 1-column on mobile */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 'var(--spacing-3)',
        }}
      >
        {LEGAL_PAGES.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageClick(page.id)}
            className="text-left transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: page.bg,
                color: page.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {page.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ ...f('sm', 500), margin: 0 }}>{page.label}</h3>
              <p style={{ ...f('xs', 400, 'var(--color-text-muted)'), margin: '2px 0 0', lineHeight: 1.4 }}>
                {page.description}
              </p>
            </div>

            {/* Chevron */}
            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default Legal;