import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ButtonPrimary } from '../../buttons';
import { cn } from '../../ui/utils';
import { usePageContent } from '../../../hooks/usePageContent';
import { useMemo, useState, useEffect, useRef } from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

// Extra portrait images for carousel rotation within each card
const EXTRA_PORTRAITS = [
  'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcxOTA3NzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1770363758981-e4753a7d2219?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjb25maWRlbnQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcxOTA3NzkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1732154478254-f94aebec9501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMHBvcnRyYWl0JTIwZnJpZW5kbHklMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzE5MDc3OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1760124146290-a896872ae49a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbmElMjB3b21hbiUyMHBvcnRyYWl0JTIwaGFwcHklMjBuYXR1cmFsfGVufDF8fHx8MTc3MTkwNzc5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1446161543652-83eaa65fddab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBwb3J0cmFpdCUyMGdlbnRsZSUyMGtpbmQlMjBzbWlsZXxlbnwxfHx8fDE3NzE5MDc3OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1763474509376-4a66513b324d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGhlYWRzaG90JTIwc3R1ZGlvJTIwd2FybXxlbnwxfHx8fDE3NzE5MDc3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

// Distinct colors for each label card
const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  acceptance: { bg: '#4ABDAC', text: '#FFFFFF' },       // Teal
  understanding: { bg: '#F0A830', text: '#FFFFFF' },    // Warm amber
  compassion: { bg: '#E87B7B', text: '#FFFFFF' },       // Soft rose
};

function getLabelColor(title: string): { bg: string; text: string } {
  const key = title?.toLowerCase?.().trim() || '';
  return LABEL_COLORS[key] || { bg: 'var(--color-primary-default)', text: 'var(--color-primary-on)' };
}

const CAROUSEL_INTERVAL = 4000;

/**
 * CarouselImage: crossfades between the stat's original image + extra portraits
 */
function CarouselImage({ stat, cardIndex }: { stat: any; cardIndex: number }) {
  const images = useMemo(() => {
    const pool: string[] = [];
    if (stat.videoImage) pool.push(stat.videoImage);
    if (stat.videoImage2 && stat.videoImage2 !== stat.videoImage) pool.push(stat.videoImage2);
    const offset = cardIndex * 2;
    for (let i = 0; i < 2; i++) {
      const extra = EXTRA_PORTRAITS[(offset + i) % EXTRA_PORTRAITS.length];
      if (!pool.includes(extra)) pool.push(extra);
    }
    return pool;
  }, [stat.videoImage, stat.videoImage2, cardIndex]);

  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const startDelay = cardIndex * 800;
    const startTimer = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % images.length);
      }, CAROUSEL_INTERVAL);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, cardIndex]);

  return (
    <>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${stat.title || stat.number || 'Portrait'} ${i + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 20%',
            opacity: i === activeIdx ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            willChange: 'opacity',
          }}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </>
  );
}

function StatisticCard({ stat, index }: { stat: any; index: number }) {
  const labelColor = stat.type === 'label' ? getLabelColor(stat.title) : null;

  return (
    <ErrorBoundary>
      <div
        className={cn(
          'flex flex-col w-full h-full flex-shrink-0',
          index % 2 === 0 ? 'lg:pt-8' : ''
        )}
        style={{
          gap: 'var(--spacing-3)',
          width: '180px',   // Fixed width for marquee items
          minWidth: '180px',
        }}
      >
        {/* Label Card — unique color per keyword */}
        {stat.type === 'label' && (
          <div
            className="flex items-center justify-center h-12 lg:h-14"
            style={{
              backgroundColor: labelColor?.bg,
              color: labelColor?.text,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                textAlign: 'center',
              }}
            >
              {stat.title}
            </span>
          </div>
        )}

        {/* Image Card */}
        <div
          className="relative overflow-hidden flex-1"
          style={{
            borderRadius: 'var(--radius-lg)',
            minHeight: index % 3 === 1 ? '240px' : index % 3 === 2 ? '180px' : '210px',
          }}
        >
          {stat.bgImage && (
            <div
              className="absolute inset-0 bg-repeat bg-cover"
              style={{ backgroundImage: `url('${stat.bgImage}')` }}
            />
          )}
          {(stat.videoImage || stat.videoImage2) ? (
            <CarouselImage stat={stat} cardIndex={index} />
          ) : null}
        </div>

        {/* Stat Card */}
        {stat.type === 'stat' && (
          <div
            className="flex flex-col justify-center p-4 lg:p-5"
            style={{
              backgroundColor: 'var(--color-accent-default)',
              color: 'var(--color-accent-on)',
              borderRadius: 'var(--radius-lg)',
              gap: 'var(--spacing-3)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: 'var(--line-height-sm)',
              }}
            >
              {stat.number}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: 'var(--line-height-md)',
              }}
            >
              {stat.description}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

/**
 * Marquee: infinite horizontal auto-scroll from left to right
 */
function MarqueeRow({ statistics, speed = 30 }: { statistics: any[]; speed?: number }) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Inject marquee keyframes once
  useEffect(() => {
    const styleId = 'ikan-hero-marquee-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes ikan-marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ikan-marquee-track {
          display: flex;
          width: max-content;
          animation: ikan-marquee-scroll var(--marquee-duration, 40s) linear infinite;
        }
        .ikan-marquee-track:hover,
        .ikan-marquee-track.paused {
          animation-play-state: paused;
        }
        .ikan-marquee-container {
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        .ikan-marquee-container::before,
        .ikan-marquee-container::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
          pointer-events: none;
        }
        .ikan-marquee-container::before {
          left: 0;
          background: linear-gradient(to right, var(--color-bg-page, #F5F5F5), transparent);
        }
        .ikan-marquee-container::after {
          right: 0;
          background: linear-gradient(to left, var(--color-bg-page, #F5F5F5), transparent);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Calculate duration based on content count for smooth speed
  const duration = Math.max(statistics.length * speed / 6, 20);

  return (
    <div
      className="ikan-marquee-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={marqueeRef}
        className={cn('ikan-marquee-track', isPaused ? 'paused' : '')}
        style={{
          '--marquee-duration': `${duration}s`,
          gap: 'var(--spacing-4)',
          alignItems: 'flex-start',
        } as React.CSSProperties}
      >
        {/* Render items twice for seamless loop */}
        {[...statistics, ...statistics].map((stat: any, index: number) => (
          <StatisticCard
            key={`marquee-${index}`}
            stat={stat}
            index={index % statistics.length}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { content, loading } = usePageContent('homepage-hero');

  const heroData = useMemo(() => {
    if (!content?.content) return null;
    try {
      return JSON.parse(content.content);
    } catch (e) {
      console.error('Failed to parse hero content', e);
      return null;
    }
  }, [content]);

  if (loading || !heroData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary-default)' }}></div>
      </div>
    );
  }

  const { title, description, ctaText, statistics } = heroData;

  return (
    <ErrorBoundary>
      <section
        className="w-full pt-24 lg:pt-36"
        style={{
          backgroundColor: 'transparent',
          paddingBottom: 'var(--spacing-8)',
        }}
      >
        {/* Mobile Layout */}
        <div className="block lg:hidden w-full">
          <div
            className="flex flex-col items-center text-center space-y-6 px-4 mobile-optimized animate-fade-in"
            style={{ padding: 'var(--spacing-6) var(--spacing-4)' }}
          >
            {/* Hero Content */}
            <div className="space-y-4 max-w-md">
              <h1
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-sm)',
                  fontFamily: 'var(--font-family-base)',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)',
                }}
              >
                {description}
              </p>
              <ButtonPrimary
                onClick={onGetStarted}
                className="ikan-button w-full mobile-button touch-target"
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)',
                  height: 'var(--ikan-component-button-height)',
                }}
              >
                {ctaText}
              </ButtonPrimary>
            </div>

            {/* Mobile: horizontal auto-scroll marquee */}
            <div className="w-full -mx-4" style={{ width: 'calc(100% + 32px)' }}>
              <MarqueeRow statistics={statistics} speed={35} />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block w-full">
          <div className="w-full animate-fade-in">
            {/* Hero Content — centered with max-width */}
            <div
              className="max-w-7xl mx-auto"
              style={{ padding: '0 var(--spacing-8)' }}
            >
              <div
                className="text-center"
                style={{
                  marginBottom: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-6)',
                }}
              >
                <h1
                  className="max-w-4xl"
                  style={{
                    fontSize: 'var(--text-4xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--line-height-sm)',
                    fontFamily: 'var(--font-family-base)',
                    margin: 0,
                  }}
                >
                  {title}
                </h1>
                <p
                  className="max-w-2xl"
                  style={{
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)',
                    fontFamily: 'var(--font-family-base)',
                    margin: 0,
                  }}
                >
                  {description}
                </p>
                <ButtonPrimary
                  onClick={onGetStarted}
                  className="ikan-button"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                    height: 'var(--ikan-component-button-height)',
                  }}
                >
                  {ctaText}
                </ButtonPrimary>
              </div>
            </div>

            {/* Desktop: full-width horizontal auto-scroll marquee */}
            <MarqueeRow statistics={statistics} speed={30} />
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}