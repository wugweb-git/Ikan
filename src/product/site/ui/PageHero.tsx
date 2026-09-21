import React from 'react';
import { cn } from './utils';
import { buttonVariants } from './button';
import { ContentImage } from './ContentImage';
import { SiteLink } from './SiteLink';
import { Container } from './Container';

/**
 * The marketing site's one hero, in two layouts.
 *
 * - `banner` (default): dark, centred title over a dimmed photo — the listing,
 *   policy and company pages.
 * - `split`: headline and CTA on the left over a page-coloured scrim, photo on
 *   the right — the assessment and programme landing pages. This was
 *   `blocks/SectionHero`, which drew the same thing a second time.
 *
 * The homepage keeps its own custom HeroSection.
 *
 * The CTA is a real link (see SiteLink): internal routes stay in-app, the
 * member app's sign-in is a full-page link. It used to set
 * `window.location.hash`, which did nothing useful in this router.
 */

// Banner fallback when a page supplies no image.
const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzczMzIxNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080';

export interface HeroCta {
  label: string;
  to: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  variant?: 'banner' | 'split';
  /**
   * Banner: falls back to a stock photo. Split: no fallback — its images are
   * signed storage URLs that expire together, and a silent stock swap on that
   * day would hide the failure; ContentImage shows a neutral plate instead.
   */
  backgroundImage?: string;
  cta?: HeroCta;
  onNavigate?: (route: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({ variant = 'banner', ...props }: PageHeroProps) {
  return variant === 'split' ? <SplitHero {...props} /> : <BannerHero {...props} />;
}

function BannerHero({ title, subtitle, backgroundImage, cta, onNavigate, className, children }: Omit<PageHeroProps, 'variant'>) {
  return (
    <section
      className={cn(
        'relative w-full flex flex-col items-center justify-center text-center overflow-hidden pt-[100px] pb-[36px] md:pt-[160px] md:pb-[80px]',
        className
      )}
      style={{ backgroundColor: 'var(--grey-9)' }}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage || DEFAULT_BANNER_IMAGE}
          alt={`${title} background`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55, objectPosition: '50% 30%', transform: 'scale(1.08)' }}
          loading="eager"
          decoding="async"
        />
        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)' }}
        />
      </div>

      <Container className="relative z-10 flex flex-col items-center justify-center text-center">
        <h1
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: '1.2',
            color: 'var(--grey-0)',
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

        {cta && (
          <SiteLink
            to={cta.to}
            onNavigate={onNavigate}
            className="inline-flex items-center justify-center no-underline transition-opacity hover:opacity-90"
            style={{
              marginTop: 20,
              padding: '12px 32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--grey-0)',
              color: 'var(--color-primary-default)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 500,
              fontSize: 'var(--text-sm)',
              minHeight: 44,
            }}
          >
            {cta.label}
          </SiteLink>
        )}

        {children}
      </Container>
    </section>
  );
}

function SplitHero({ title, subtitle, backgroundImage, cta, onNavigate, className, children }: Omit<PageHeroProps, 'variant'>) {
  return (
    <section
      className={cn('relative w-full overflow-hidden flex flex-col justify-center min-h-[500px] lg:min-h-[600px]', className)}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0">
          {/* The LCP element, and decorative — the headline carries the meaning. */}
          <ContentImage
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sizes="100vw"
            onError={() => {
              console.warn('[PageHero] hero image failed to load:', backgroundImage);
            }}
          />
          {/* One scrim at every width: the left third is opaque page colour,
              which guarantees contrast under the headline whatever the photo. */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to right, var(--color-bg-page) 0%, var(--color-bg-page) 30%, color-mix(in srgb, var(--color-bg-page) 70%, transparent) 55%, transparent 85%)',
            }}
          />
        </div>
      )}

      <Container className="relative z-20 py-12 lg:py-0">
        <div className="max-w-[500px] flex flex-col items-start" style={{ gap: 'var(--spacing-6)' }}>
          <h1
            style={{
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--line-height-xs)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                fontWeight: 'var(--font-weight-regular)',
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--line-height-md)',
                color: 'var(--color-text-primary)',
                opacity: 0.9,
                fontFamily: 'var(--font-family-base)',
              }}
            >
              {subtitle}
            </p>
          )}

          {cta && (
            <SiteLink
              to={cta.to}
              onNavigate={onNavigate}
              className={cn(buttonVariants(), 'no-underline')}
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                height: 'var(--ikan-component-button-height)',
                minHeight: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                paddingLeft: 'var(--spacing-8)',
                paddingRight: 'var(--spacing-8)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {cta.label}
            </SiteLink>
          )}

          {children}
        </div>
      </Container>
    </section>
  );
}
