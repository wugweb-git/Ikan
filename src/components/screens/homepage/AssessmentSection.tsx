import React from 'react';
import { Button } from '../../ui/button';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface AssessmentSectionProps {
  onGetStarted: () => void;
}

export function AssessmentSection({ onGetStarted }: AssessmentSectionProps) {
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
                iKan is the mental health platform for the modern era.
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
                Get actionable and quantified insights about your mental health. Screen for issues prevent them from turning chronic with the help of our experts and evidence backed tools.
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
                  Get Started
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
                    src="https://images.unsplash.com/photo-1724176636904-394580bfedf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0ZWNobm9sb2d5JTIwYW5hbHl0aWNzJTIwaW5zaWdodHN8ZW58MXx8fHwxNzY1NDQ3NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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
