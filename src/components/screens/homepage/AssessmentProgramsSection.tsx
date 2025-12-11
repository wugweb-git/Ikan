import React from 'react';
import { Button } from '../../ui/button';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Clock } from 'lucide-react';

// Import assets
import imgRectangle9 from "figma:asset/e14b378ba443955238f6e52a608bb6cfa341e5d8.png";
import imgRectangle10 from "figma:asset/33be9701c78a44f54392cf1bfcc20d8f8f00cd9d.png";
import imgRectangle11 from "figma:asset/2576c36c768010586aefac2ca3b21e8a5e123bd0.png";

interface AssessmentProgramsSectionProps {
  onNavigate: (route: string) => void;
}

export function AssessmentProgramsSection({ onNavigate }: AssessmentProgramsSectionProps) {
  const programs = [
    {
      title: "Adult Therapy",
      description: "Talk to a trained therapist who helps you make sense of things and feel more in control, one session at a time.",
      image: imgRectangle9,
      info: "5 min Quiz",
      link: "/assessment-landing"
    },
    {
      title: "Adult Psychiatry", 
      description: "Meet with a psychiatrist who helps with sleep, focus, energy, or mood and finds the right medication, if needed.",
      image: imgRectangle10,
      info: "5 min Quiz",
      link: "/assessment-landing"
    },
    {
      title: "Hospital Care",
      description: "Designed for acute mental health needs, with 24/7 support and a multi-disciplinary team that supports you.",
      image: imgRectangle11,
      info: "5 min Quiz",
      link: "/assessment-landing"
    }
  ];

  const handleSeeMore = () => {
    onNavigate('/assessments');
  };

  return (
    <ErrorBoundary>
      <section 
        className="w-full"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-8)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          {/* Header */}
          <div 
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
            style={{ 
              marginBottom: 'var(--spacing-8)',
              gap: 'var(--spacing-4)'
            }}
          >
            <h2 
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              Assessment Programs
            </h2>
            <Button 
              onClick={handleSeeMore}
              variant="secondary"
              className="ikan-button self-start lg:self-auto mobile-button touch-target"
              style={{
                backgroundColor: 'var(--color-neutral-200)',
                color: 'var(--color-text-muted)',
                height: '48px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              SEE MORE
            </Button>
          </div>

          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-6">
            {programs.map((program, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <div 
                  className="space-y-4"
                  style={{ gap: 'var(--spacing-4)' }}
                >
                  <div>
                    <div 
                      className="text-sm font-normal uppercase tracking-wide mb-2"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-normal)',
                        color: 'var(--color-primary-default)',
                        fontFamily: 'var(--font-family-base)',
                        letterSpacing: 'var(--letter-spacing-wide)'
                      }}
                    >
                      PROGRAM
                    </div>
                    <h3 
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      {program.title}
                    </h3>
                  </div>
                  
                  <p 
                    className="leading-relaxed"
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--line-height-md)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    {program.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div 
                      className="w-24 h-24 rounded-lg overflow-hidden"
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      <ImageWithFallback 
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div 
                      className="flex flex-col items-end space-y-4"
                      style={{ gap: 'var(--spacing-4)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span 
                          className="text-sm"
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family-base)'
                          }}
                        >
                          {program.info}
                        </span>
                      </div>
                      <Button
                        onClick={() => onNavigate(program.link)}
                        className="ikan-button"
                        style={{
                          backgroundColor: 'var(--color-accent-default)',
                          color: 'var(--color-accent-on)',
                          height: '48px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div 
              className="grid grid-cols-3 gap-6"
              style={{ gap: 'var(--spacing-6)' }}
            >
              {programs.map((program, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  <div 
                    className="space-y-6 h-full flex flex-col"
                    style={{ gap: 'var(--spacing-6)' }}
                  >
                    {/* Content */}
                    <div 
                      className="space-y-4 flex-1"
                      style={{ gap: 'var(--spacing-4)' }}
                    >
                      <div>
                        <div 
                          className="text-sm font-normal uppercase tracking-wide mb-2"
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-normal)',
                            color: 'var(--color-primary-default)',
                            fontFamily: 'var(--font-family-base)',
                            letterSpacing: 'var(--letter-spacing-wide)'
                          }}
                        >
                          PROGRAM
                        </div>
                        <h3 
                          style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family-base)',
                            lineHeight: index === 2 ? 'var(--line-height-sm)' : 'var(--line-height-md)'
                          }}
                        >
                          {index === 2 ? (
                            <>
                              Hospital<br />Care
                            </>
                          ) : (
                            program.title
                          )}
                        </h3>
                      </div>
                      
                      <p 
                        className="leading-relaxed"
                        style={{
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-muted)',
                          lineHeight: 'var(--line-height-md)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        {program.description}
                      </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-end justify-between">
                      <div 
                        className="w-32 h-32 rounded-lg overflow-hidden"
                        style={{ borderRadius: 'var(--radius-md)' }}
                      >
                        <ImageWithFallback 
                          src={program.image}
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div 
                        className="flex flex-col items-end space-y-6"
                        style={{ gap: 'var(--spacing-6)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span 
                            className="text-sm"
                            style={{
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-primary)',
                              fontFamily: 'var(--font-family-base)'
                            }}
                          >
                            {program.info}
                          </span>
                        </div>
                        <Button
                          onClick={() => onNavigate(program.link)}
                          className="ikan-button"
                          style={{
                            backgroundColor: 'var(--color-accent-default)',
                            color: 'var(--color-accent-on)',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          Take Assessment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
