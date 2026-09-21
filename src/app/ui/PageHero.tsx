import React from 'react';
import { cn } from './utils';

// Default fallback image when no image is provided and no admin config exists
const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzczMzIxNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  /** Single background image URL */
  backgroundImage?: string;
  /** CTA button text — if set, renders an action button */
  ctaText?: string;
  /** CTA button link — where clicking the button navigates */
  ctaLink?: string;
  /** CTA button click handler (takes priority over ctaLink) */
  onCtaClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaLink,
  onCtaClick,
  className,
  children,
}: PageHeroProps) {
  const imageSrc = backgroundImage || DEFAULT_HERO_IMAGE;

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaLink) {
      window.location.hash = ctaLink;
    }
  };

  return (
    <section
      className={cn(
        'relative w-full flex flex-col items-center justify-center text-center overflow-hidden pt-[100px] pb-[36px] md:pt-[160px] md:pb-[80px]',
        className
      )}
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Background image — single static image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt={`${title} background`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 0.55,
            objectPosition: '50% 30%',
            transform: 'scale(1.08)',
          }}
          loading="eager"
          decoding="async"
        />
        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center">
        <h1
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: '1.2',
            color: '#FFFFFF',
            margin: '0 0 16px 0',
            maxWidth: '800px',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'clamp(15px, 2vw, 18px)',
              fontWeight: 'var(--font-weight-regular)',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.85)',
              margin: '0 0 8px 0',
              maxWidth: '600px',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* CTA Button */}
        {ctaText && (
          <button
            onClick={handleCtaClick}
            style={{
              marginTop: 20,
              padding: '12px 32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-primary-default)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 500,
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
              minHeight: 44,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '0.92'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
          >
            {ctaText}
          </button>
        )}

        {children}
      </div>
    </section>
  );
}