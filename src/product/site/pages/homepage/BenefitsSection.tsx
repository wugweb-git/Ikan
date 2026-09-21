import { useMemo } from 'react';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { ImageWithFallback } from '../../ui/ImageWithFallback';
import { useIsMobile } from '../../../../shared/hooks/useIsMobile';
import { DEFAULT_CMS_CONTENT } from '../../lib/cms-defaults';

interface AudienceCard {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
}

const DEFAULT_CARDS: AudienceCard[] = [
  {
    title: 'For Individuals',
    subtitle: 'Your mental wellness, your pace.',
    description:
      'Access self-guided programs, mood journaling, and professional consultations — all in a private, stigma-free space designed around your comfort.',
    image:
      'https://images.unsplash.com/photo-1726377240070-19b747fc9f19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwZWFjZWZ1bCUyMGpvdXJuYWxpbmclMjBzZWxmJTIwY2FyZXxlbnwxfHx8fDE3NzE5MDYwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    imageAlt: 'Person journaling for self care',
  },
  {
    title: 'For Organizations',
    subtitle: 'Invest in your people.',
    description:
      'Bring mental wellness into the workplace. Equip your teams with assessments, curated programs, and professional support that scales with your organization.',
    image:
      'https://images.unsplash.com/photo-1758691737182-d42aefd6dee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB3b3JrcGxhY2UlMjB3ZWxsbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc3MTkwNjA3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    imageAlt: 'Workplace wellness team meeting',
  },
  {
    title: 'For Healthcare Providers',
    subtitle: 'Extend care beyond the clinic.',
    description:
      'Use clinically validated assessments, track patient progress, and recommend structured programs — all on a platform built with privacy at its core.',
    image:
      'https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFsJTIwc3RldGhvc2NvcGUlMjBzbWlsaW5nfGVufDF8fHx8MTc3MTkwNjA3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    imageAlt: 'Healthcare professional smiling',
  },
];

interface BenefitsSectionProps {
  onNavigate?: (route: string) => void;
  ctaText?: string;
  ctaRoute?: string;
}

export function BenefitsSection({ onNavigate, ctaText = 'Learn more', ctaRoute = '/about' }: BenefitsSectionProps) {
  const isMobile = useIsMobile();

  const cmsContent = DEFAULT_CMS_CONTENT['homepage-benefits-section'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const heading = cms?.heading || 'Who is it for';
  const resolvedCtaText = cms?.ctaText || ctaText;
  const resolvedCtaRoute = cms?.ctaRoute || ctaRoute;
  const cards: AudienceCard[] = cms?.cards || DEFAULT_CARDS;

  const handleCTA = () => {
    if (onNavigate) onNavigate(resolvedCtaRoute);
  };

  return (
    <ErrorBoundary>
      <section
        style={{
          backgroundColor: 'var(--color-bg-card)',
          paddingTop: '80px',
          paddingBottom: '80px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1.2',
                margin: '0',
              }}
            >
              {heading}
            </h2>
          </div>

          {/* Decorative dots */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: isMobile ? '32px' : '48px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-text-primary)',
              }}
            />
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Cards */}
          {isMobile ? (
            <MobileLayout cards={cards} />
          ) : (
            <DesktopFanLayout cards={cards} />
          )}

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginTop: isMobile ? '32px' : '48px' }}>
            <button
              onClick={handleCTA}
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: '15px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'white',
                backgroundColor: 'var(--color-primary-default)',
                border: 'none',
                borderRadius: '999px',
                padding: '16px 40px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                boxShadow: '0 4px 16px rgba(42, 42, 42, 0.12)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {resolvedCtaText}
            </button>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}

/* ─── Desktop Fan Layout ─── */
function DesktopFanLayout({ cards }: { cards: AudienceCard[] }) {
  return (
    <div
      style={{
        position: 'relative',
        height: '460px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Left card — tilted clockwise */}
      <div
        style={{
          position: 'absolute',
          left: '0',
          transform: 'rotate(6deg)',
          transformOrigin: 'bottom center',
          zIndex: 1,
          transition: 'transform 0.35s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(3deg) translateY(-6px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(6deg)')}
      >
        <FanCard card={cards[0]} />
      </div>

      {/* Center card — straight, accent gradient */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          transition: 'transform 0.35s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <FanCard card={cards[1]} isCenter />
      </div>

      {/* Right card — tilted counter-clockwise */}
      <div
        style={{
          position: 'absolute',
          right: '0',
          transform: 'rotate(-6deg)',
          transformOrigin: 'bottom center',
          zIndex: 1,
          transition: 'transform 0.35s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(-3deg) translateY(-6px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(-6deg)')}
      >
        <FanCard card={cards[2]} />
      </div>
    </div>
  );
}

/* ─── Fan Card (Desktop) ─── */
function FanCard({ card, isCenter }: { card: AudienceCard; isCenter?: boolean }) {
  return (
    <div
      style={{
        width: '340px',
        borderRadius: '28px',
        overflow: 'hidden',
        background: isCenter
          ? 'linear-gradient(170deg, #E8F4F0 0%, #B8E0D2 50%, #7CC5B0 100%)'
          : 'var(--color-bg-card)',
        border: isCenter ? 'none' : '1px solid #EFE8DE',
        boxShadow: isCenter
          ? '0 10px 28px 4px rgba(17, 17, 17, 0.08)'
          : '0 10px 20px 4px rgba(17, 17, 17, 0.05)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '420px',
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '24px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.25',
          margin: 0,
          letterSpacing: '-0.3px',
        }}
      >
        {card.title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '15px',
          fontWeight: 'var(--font-weight-medium)',
          color: isCenter ? '#3D7A66' : 'var(--color-text-muted)',
          lineHeight: '1.4',
          margin: 0,
        }}
      >
        {card.subtitle}
      </p>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '15px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.7',
          margin: 0,
        }}
      >
        {card.description}
      </p>

      {/* Image */}
      <div
        style={{
          marginTop: 'auto',
          borderRadius: '16px',
          overflow: 'hidden',
          height: '140px',
          flexShrink: 0,
        }}
      >
        <ImageWithFallback
          src={card.image}
          alt={card.imageAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Mobile Layout ─── */
function MobileLayout({ cards }: { cards: AudienceCard[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {cards.map((card, index) => (
        <MobileCard key={index} card={card} />
      ))}
    </div>
  );
}

/* ─── Mobile Card ─── */
function MobileCard({ card }: { card: AudienceCard }) {
  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'var(--color-bg-card)',
        border: '1px solid #EFE8DE',
        boxShadow: '0 4px 16px rgba(17, 17, 17, 0.05)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '20px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.25',
          margin: 0,
          letterSpacing: '-0.2px',
        }}
      >
        {card.title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-muted)',
          lineHeight: '1.4',
          margin: 0,
        }}
      >
        {card.subtitle}
      </p>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.65',
          margin: 0,
        }}
      >
        {card.description}
      </p>

      {/* Image */}
      <div
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          height: '140px',
          marginTop: '4px',
        }}
      >
        <ImageWithFallback
          src={card.image}
          alt={card.imageAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
}