import React, { useMemo } from 'react';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { ImageWithFallback } from '../../ui/ImageWithFallback';
import { ClipboardCheck, Users, Sparkles } from 'lucide-react';
import { useIsMobile } from '../../../../shared/hooks/useIsMobile';
import { DEFAULT_CMS_CONTENT } from '../../lib/cms-defaults';

interface HowItWorksCard {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  iconName?: string;
  icon?: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'clipboard-check': <ClipboardCheck style={{ width: 22, height: 22 }} />,
  'users': <Users style={{ width: 22, height: 22 }} />,
  'sparkles': <Sparkles style={{ width: 22, height: 22 }} />,
};

const DEFAULT_CARDS: HowItWorksCard[] = [
  {
    step: 1,
    title: 'Take an Assessment',
    subtitle: 'Understand where you are.',
    description:
      'Answer a few simple, clinically backed questions. Our assessments help you understand your emotional well-being — privately, at your own pace.',
    image:
      'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRhYmxldHxlbnwxfHx8fDE3NzE5MDU3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    imageAlt: 'Mental health assessment on tablet',
    iconName: 'clipboard-check',
  },
  {
    step: 2,
    title: 'Connect with a Professional',
    subtitle: 'Find the right support for you.',
    description:
      'Browse therapists, psychiatrists, and counselors. Pick your preferred language, session mode, and availability — we handle the rest.',
    image:
      'https://images.unsplash.com/photo-1758273241078-8eec353836be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXB5JTIwc2Vzc2lvbiUyMGNvdW5zZWxpbmclMjBjb252ZXJzYXRpb258ZW58MXx8fHwxNzcxOTA1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    imageAlt: 'Therapy counseling session',
    iconName: 'users',
  },
  {
    step: 3,
    title: 'Build Daily Habits',
    subtitle: 'Make wellness your ritual.',
    description:
      'Join an Equip program with self-paced modules. Track your mood, practice mindfulness, and build lasting habits — one day at a time.',
    image:
      'https://images.unsplash.com/photo-1758272422634-e8ed8e252a14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwbWluZGZ1bG5lc3MlMjBkYWlseSUyMHdlbGxuZXNzJTIwcm91dGluZXxlbnwxfHx8fDE3NzE5MDU3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    imageAlt: 'Mindfulness and daily wellness',
    iconName: 'sparkles',
  },
];

interface HowItWorksSectionProps {
  onNavigate?: (route: string) => void;
}

function resolveIcon(card: HowItWorksCard): React.ReactNode {
  if (card.icon) return card.icon;
  return ICON_MAP[card.iconName || ''] || <ClipboardCheck style={{ width: 22, height: 22 }} />;
}

export function HowItWorksSection({ onNavigate }: HowItWorksSectionProps) {
  const isMobile = useIsMobile();

  const cmsContent = DEFAULT_CMS_CONTENT['homepage-howitworks-section'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const heading = cms?.heading || 'How it works';
  const ctaText = cms?.ctaText || 'Get Started';
  const ctaRoute = cms?.ctaRoute || '/assessments';

  const cards: HowItWorksCard[] = useMemo(() => {
    if (!cms?.cards) return DEFAULT_CARDS;
    return cms.cards.map((c: any, i: number) => ({
      ...DEFAULT_CARDS[i],
      ...c,
    }));
  }, [cms]);

  const handleCTA = () => {
    if (onNavigate) onNavigate(ctaRoute);
  };

  return (
    <ErrorBoundary>
      <section
        style={{
          backgroundColor: 'var(--color-bg-page)',
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
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1.2',
                margin: '0 0 12px 0',
              }}
            >
              {heading}
            </h2>

            {/* Decorative dots */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '12px',
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
          </div>

          {/* Cards Fan Layout (Desktop) / Stacked (Mobile) */}
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cards.map((card) => (
                <MobileCard key={card.step} card={card} />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                height: '440px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  transform: 'rotate(6deg)',
                  transformOrigin: 'bottom center',
                  zIndex: 1,
                }}
              >
                <DesktopCard card={cards[0]} />
              </div>

              <div
                style={{
                  position: 'relative',
                  zIndex: 3,
                }}
              >
                <DesktopCard card={cards[1]} isCenter />
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: '0',
                  transform: 'rotate(-6deg)',
                  transformOrigin: 'bottom center',
                  zIndex: 1,
                }}
              >
                <DesktopCard card={cards[2]} />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginTop: isMobile ? '32px' : '40px' }}>
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
                boxShadow: '0 4px 16px rgba(42, 42, 42, 0.15)',
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
              {ctaText}
            </button>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}

/* Desktop card component */
function DesktopCard({
  card,
  isCenter,
}: {
  card: HowItWorksCard;
  isCenter?: boolean;
}) {
  return (
    <div
      style={{
        width: '340px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: isCenter
          ? 'linear-gradient(180deg, #D4E8E0 0%, #A8D8C8 100%)'
          : 'var(--color-bg-card)',
        border: isCenter ? 'none' : '1px solid #EBEBEB',
        boxShadow: isCenter
          ? '0 12px 32px rgba(0, 0, 0, 0.1)'
          : '0 8px 24px rgba(0, 0, 0, 0.06)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '400px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '22px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.25',
          margin: 0,
        }}
      >
        {card.title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: isCenter ? '#4A7A6A' : 'var(--color-text-muted)',
          lineHeight: '1.4',
          margin: 0,
        }}
      >
        {card.subtitle}
      </p>

      <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: isCenter
              ? 'rgba(255, 255, 255, 0.6)'
              : 'var(--grey-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
          }}
        >
          {resolveIcon(card)}
        </div>
      </div>

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

      <div
        style={{
          marginTop: 'auto',
          borderRadius: '14px',
          overflow: 'hidden',
          height: '130px',
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

/* Mobile card component */
function MobileCard({ card }: { card: HowItWorksCard }) {
  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'var(--color-bg-card)',
        border: '1px solid #EBEBEB',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--grey-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            flexShrink: 0,
          }}
        >
          {resolveIcon(card)}
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: '18px',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            lineHeight: '1.3',
            margin: 0,
          }}
        >
          {card.title}
        </h3>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '13px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        {card.subtitle}
      </p>

      <p
        style={{
          fontFamily: 'var(--font-family-base)',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.6',
          margin: 0,
        }}
      >
        {card.description}
      </p>

      <div
        style={{
          borderRadius: '12px',
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
