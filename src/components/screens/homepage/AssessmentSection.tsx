import React from 'react';
import { Button } from '../../ui/button';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ASSESSMENT_INTRO_DATA } from '../../../lib/homepage-data';

interface AssessmentSectionProps {
  onGetStarted: () => void;
}

export function AssessmentSection({ onGetStarted }: AssessmentSectionProps) {
  const { title, description, ctaText, image } = ASSESSMENT_INTRO_DATA;

  return (
    <ErrorBoundary>
      <section 
        className="w-full"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-8)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            
            {/* Text Content */}
            <div className="flex-1 space-y-6 text-center lg:text-left animate-fade-in">
              <h2 
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-sm)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {title}
              </h2>
              
              <p 
                className="leading-relaxed"
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {description}
              </p>
              
              <div className="pt-2">
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
                  {ctaText}
                </Button>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 w-full animate-slide-up">
              <div 
                className="relative rounded-2xl overflow-hidden shadow-lg aspect-video lg:aspect-auto lg:h-[400px]"
                style={{ 
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-neutral-200)'
                }}
              >
                 <ImageWithFallback 
                    src={image}
                    alt="Mental health analytics and insights"
                    className="w-full h-full object-cover"
                    loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}