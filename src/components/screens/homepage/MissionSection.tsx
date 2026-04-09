import { useEffect, useMemo, useRef } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { usePageContent } from '../../../hooks/usePageContent';

// Client logo imports from Figma
import imgLogo2 from "../../../assets/1fa377842c0edee2e6d99526877c4abfe5cffba4.png";
import imgLogo4 from "../../../assets/bed3a7c577bcfb0b6fc0334b0f93d8eddb9275f8.png";
import imgLogo6 from "../../../assets/e12e76c2f5940d65dbebba2615815d6b5552f1cc.png";
import imgLogo7 from "../../../assets/d246862ee8771400424ba422593c855cabc9ba4a.png";
import imgLogo8 from "../../../assets/4d70d16cfc423d83c6ca9941c4d3da923cf039ac.png";
import imgLogo9 from "../../../assets/17b5fecba5e52eb9055025402d9b0c25a870d0d2.png";
import imgLogo10 from "../../../assets/7a674497643e29f384a4eaeb5616eeb32e4aa50b.png";
import imgLogo11 from "../../../assets/ac0292f75b641a157de9af130cc05ecea5dd193f.png";

const clientLogos = [
  { src: imgLogo2, alt: 'Client logo 1' },
  { src: imgLogo4, alt: 'Client logo 2' },
  { src: imgLogo6, alt: 'Client logo 3' },
  { src: imgLogo7, alt: 'Client logo 4' },
  { src: imgLogo8, alt: 'Client logo 5' },
  { src: imgLogo9, alt: 'Client logo 6' },
  { src: imgLogo10, alt: 'Client logo 7' },
  { src: imgLogo11, alt: 'Client logo 8' },
];

export function MissionSection() {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  // ── CMS content with fallback ──
  const { content: cmsContent } = usePageContent('homepage-mission-section');
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const label = cms?.label || 'Our Mission';
  const description = cms?.description || 'We believe everyone deserves support on their mental health journey. iKan combines clinical expertise with thoughtful technology to meet you where you are.';
  const trustedByLabel = cms?.trustedByLabel || 'Trusted by leading organizations';

  // Parse heading with <highlighted> markers
  const highlightColors = cms?.highlightColors || { accessible: '#7ED4C8', affordable: '#F5A623', 'stigma-free': '#E84FAF' };

  // Inject keyframes once
  useEffect(() => {
    const styleId = 'ikan-logo-carousel-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes ikan-logo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <ErrorBoundary>
      <section
        style={{
          backgroundColor: 'var(--color-bg-card)',
          paddingTop: isMobile ? '56px' : '80px',
          paddingBottom: isMobile ? '48px' : '64px',
        }}
      >
        {/* ── Mission Statement ── */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
            marginBottom: isMobile ? '40px' : '56px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-muted)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              margin: '0 0 20px 0',
            }}
          >
            {label}
          </p>

          <h2
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: isMobile ? '26px' : '40px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              lineHeight: '1.35',
              margin: '0 auto',
              maxWidth: '820px',
              letterSpacing: '-0.5px',
            }}
          >
            Making mental healthcare{' '}
            <span
              style={{
                color: highlightColors['accessible'] || '#7ED4C8',
                position: 'relative',
                display: 'inline',
              }}
            >
              accessible
            </span>
            ,{' '}
            <span
              style={{
                color: highlightColors['affordable'] || '#F5A623',
                position: 'relative',
                display: 'inline',
              }}
            >
              affordable
            </span>
            , and{' '}
            <span
              style={{
                color: highlightColors['stigma-free'] || '#E84FAF',
                position: 'relative',
                display: 'inline',
              }}
            >
              stigma-free
            </span>{' '}
            for everyone.
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: isMobile ? '15px' : '17px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)',
              lineHeight: '1.7',
              margin: '24px auto 0',
              maxWidth: '640px',
            }}
          >
            {description}
          </p>
        </div>

        {/* ── Trusted-by label ── */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: '13px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {trustedByLabel}
          </p>
        </div>

        {/* ── Logo Carousel ── */}
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            height: '60px',
            opacity: 0.6,
          }}
        >
          {/* Fade edges */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '120px',
              background:
                'linear-gradient(to right, var(--color-bg-card), transparent)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '120px',
              background:
                'linear-gradient(to left, var(--color-bg-card), transparent)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />

          {/* Scrolling track */}
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '48px',
              width: 'max-content',
              animation: 'ikan-logo-scroll 30s linear infinite',
            }}
          >
            {/* Render logos twice for seamless loop */}
            {[...clientLogos, ...clientLogos].map((logo, i) => (
              <img
                key={i}
                src={logo.src}
                alt={logo.alt}
                style={{
                  height: 'var(--ikan-component-button-height)',
                  width: 'auto',
                  objectFit: 'contain',
                  flexShrink: 0,
                  filter: 'grayscale(100%)',
                }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}