import { useIsMobile } from '../ui/hooks/useIsMobile';
import { DEFAULT_CMS_CONTENT } from '../lib/cms-defaults';
import { PageHero } from '../ui/PageHero';

interface CancellationPolicyProps {
  className?: string;
  onNavigate?: (route: string) => void;
}

export function CancellationPolicy({ className, onNavigate }: CancellationPolicyProps) {
  const isMobile = useIsMobile();
  const content = DEFAULT_CMS_CONTENT['cancellation-policy'];

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      <PageHero 
        title={content?.heroTitle || content?.title || 'Cancellation Policy'}
        subtitle={content?.heroSubtitle || (content as any)?.subtitle || 'We understand plans change. Cancel anytime with no penalties or hidden fees.'}
        backgroundImage={content?.heroImage}
      />

      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: 'var(--banner-content-max, 1100px)',
          padding: isMobile ? '24px 16px' : '40px 24px',
        }}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: content?.content || '' }}
          className="prose max-w-none"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: isMobile ? '24px' : '40px',
            fontFamily: 'var(--font-family-base)',
          }}
        />
      </div>
    </div>
  );
}