import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ButtonPrimary } from '../../buttons';
import { cn } from '../../ui/utils';
import { usePageContent } from '../../../hooks/usePageContent';
import { useMemo } from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

function StatisticCard({ stat, index }: { stat: any, index: number }) {
  return (
    <ErrorBoundary>
      <div 
        className={cn(
          "flex flex-col gap-2 lg:gap-5 w-full h-full",
          index % 2 === 0 ? "lg:pt-8" : ""
        )}
      >
        {/* Label Card */}
        {stat.type === 'label' && (
          <div 
            className="flex items-center justify-center h-12 lg:h-16 rounded-lg lg:rounded-xl"
            style={{
              backgroundColor: 'var(--color-primary-default)',
              color: 'var(--color-primary-on)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <span 
              className="font-medium text-center"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              {stat.title}
            </span>
          </div>
        )}

        {/* Video/Image Card */}
        <div 
          className="relative rounded-lg lg:rounded-xl overflow-hidden flex-1 min-h-[160px] lg:min-h-60"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          {stat.bgImage && (
            <div 
              className="absolute inset-0 bg-repeat bg-cover"
              style={{ backgroundImage: `url('${stat.bgImage}')` }}
            />
          )}
          {stat.videoImage && (
            <ImageWithFallback 
              src={stat.videoImage}
              alt={`${stat.title || stat.number} background`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          {stat.videoImage2 && (
            <ImageWithFallback 
              src={stat.videoImage2}
              alt={`${stat.title || stat.number} overlay`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>

        {/* Stat Card */}
        {stat.type === 'stat' && (
          <div 
            className="flex flex-col justify-center p-4 lg:p-6 rounded-lg lg:rounded-xl"
            style={{
              backgroundColor: 'var(--color-accent-default)',
              color: 'var(--color-accent-on)',
              borderRadius: 'var(--radius-lg)',
              gap: 'var(--spacing-4)'
            }}
          >
            <div 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: 'var(--line-height-sm)'
              }}
            >
              {stat.number}
            </div>
            <div 
              className="leading-tight"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-family-base)',
                lineHeight: 'var(--line-height-md)'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
          paddingBottom: 'var(--spacing-8)'
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
                className="leading-tight"
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-sm)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {title}
              </h1>
              <p 
                className="leading-relaxed"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
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
                  height: '48px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {ctaText}
              </ButtonPrimary>
            </div>

            {/* Mobile Statistics Grid - 2 columns */}
            <div 
              className="grid grid-cols-2 w-full mobile-optimized"
              style={{ gap: 'var(--spacing-3)' }}
            >
              {statistics.map((stat, index) => (
                <div 
                  key={index}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <StatisticCard stat={stat} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block w-full">
          <div 
            className="max-w-7xl mx-auto animate-fade-in"
            style={{ padding: '0 var(--spacing-8)' }}
          >
            {/* Hero Content */}
            <div 
              className="text-center space-y-8 mb-16"
              style={{ marginBottom: 'var(--spacing-8)' }}
            >
              <h1 
                className="leading-tight max-w-4xl mx-auto"
                style={{
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-sm)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {title}
              </h1>
              <p 
                className="max-w-2xl mx-auto leading-relaxed"
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
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
                  height: '48px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {ctaText}
              </ButtonPrimary>
            </div>

            {/* Desktop Statistics Grid - 6 columns */}
            <div 
              className="grid grid-cols-6 max-w-6xl mx-auto"
              style={{ gap: 'var(--spacing-5)' }}
            >
              {statistics.map((stat, index) => (
                <StatisticCard key={index} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}