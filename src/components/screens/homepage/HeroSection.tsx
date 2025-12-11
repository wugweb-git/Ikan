import React from 'react';
import { Button } from '../../ui/button';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ErrorBoundary } from '../../ErrorBoundary';
import { cn } from '../../ui/utils';

// Import SVG assets
import svgPaths from "../../../imports/svg-rdg85uq8eg";

// Desktop images
import imgBackground from "figma:asset/48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png";
import imgBackground1 from "figma:asset/3772e90563daca3ef206a824f43457199d087a9c.png";
import imgContainer from "figma:asset/1481db4e9380fb931a22b6513abff50802b2a49b.png";
import imgContainer1 from "figma:asset/a9781d0017d72468a9abd686b2bedd2a0030389e.png";
import imgContainer2 from "figma:asset/f73ff6b993a79e7afa25172e841a3b997424ffd3.png";
import imgContainer3 from "figma:asset/d003be95957c379a921874e4bda664014db0f9f1.png";
import imgBackground2 from "figma:asset/79f4819c58ba4b17081db7c51042e65ae3c80b63.png";
import imgBackground3 from "figma:asset/feac3db04deeeeeb57c0093c3c5f73704543a5ce.png";
import imgBackground4 from "figma:asset/3065945fcbf34255b3d9dd3f6a9d74bef33067aa.png";
import imgBackground5 from "figma:asset/533267b6ad03b6203bf651e6d6b242eeed7f4136.png";
import imgContainer4 from "figma:asset/9e350c1839007716e1f55e4a0242b288a034c6aa.png";
import imgContainer5 from "figma:asset/c9864a003bcad8a0740991d9dc9f0b5fa774146f.png";

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
                Reimagining mental health care.
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
                Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.
              </p>
              <Button 
                onClick={onGetStarted}
                className="ikan-button w-full mobile-button touch-target"
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Get Started
              </Button>
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
                Reimagining mental health care.
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
                Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.
              </p>
              <Button 
                onClick={onGetStarted}
                className="ikan-button"
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Get Started
              </Button>
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