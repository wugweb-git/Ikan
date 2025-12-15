import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ButtonPrimary, ButtonSecondary } from '../../buttons';
import { HERO_DATA } from '../../../lib/homepage-data';
import { cn } from '../../ui/utils';

// Desktop images - Using fallback URLs
const imgBackground = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop";
const imgBackground1 = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop";
const imgContainer = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop";
const imgContainer1 = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop";
const imgContainer2 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop";
const imgContainer3 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop";
const imgBackground2 = "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400&h=400&fit=crop";
const imgBackground3 = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop";
const imgBackground4 = "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=400&h=400&fit=crop";
const imgBackground5 = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop";
const imgContainer4 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop";
const imgContainer5 = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop";

interface HeroSectionProps {
  onGetStarted: () => void;
}

// Statistics data with English content
const statistics = [
  {
    type: 'label',
    title: 'Acceptance',
    bgImage: imgBackground,
    videoImage: imgBackground1
  },
  {
    type: 'stat',
    number: '2500+',
    description: 'People who have gained more wellbeing through our platform',
    bgImage: imgContainer,
    videoImage: imgContainer1
  },
  {
    type: 'label',
    title: 'Understanding',
    bgImage: imgContainer2,
    videoImage: imgContainer3
  },
  {
    type: 'stat',
    number: '52+',
    description: 'Qualified Psychologists',
    bgImage: imgBackground2,
    videoImage: imgBackground3
  },
  {
    type: 'label',
    title: 'Compassion',
    bgImage: imgBackground4,
    videoImage: imgBackground5
  },
  {
    type: 'stat',
    number: '96%',
    description: 'Recommend our courses',
    bgImage: null,
    videoImage: imgContainer4,
    videoImage2: imgContainer5
  }
];

function StatisticCard({ stat, index }: { stat: typeof statistics[0], index: number }) {
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
  const { title, description, ctaText } = HERO_DATA;
  
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