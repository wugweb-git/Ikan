import React from 'react';
import { Button } from '../ui/button';
import { ErrorBoundary } from '../ErrorBoundary';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Clock, FileQuestion } from 'lucide-react';
import { Skeleton } from '../ui/skeleton-loader';

export interface AssessmentProgram {
  title: string;
  description: string;
  image: string;
  category?: string; // Dynamic category from database
  questionCount?: number; // Number of questions
  duration?: number; // Duration in minutes
  info: string; // Formatted info string (e.g., "10 Questions • 5 min")
  link: string;
}

export interface AssessmentBlockProps {
  title?: string;
  subtitle?: string; // DEPRECATED: Use category from program data instead
  buttonText?: string;
  seeMoreText?: string;
  programs: AssessmentProgram[];
  loading?: boolean;
  onProgramClick?: (program: AssessmentProgram) => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function AssessmentBlock({ 
  title = "Assessment Programs",
  subtitle = "PROGRAM",
  buttonText = "Take Assessment",
  seeMoreText = "SEE MORE",
  programs = [],
  loading = false,
  onProgramClick,
  onNavigate,
  className
}: AssessmentBlockProps) {
  
  const handleProgramClick = (program: AssessmentProgram) => {
    if (onProgramClick) {
      onProgramClick(program);
    } else if (onNavigate) {
      onNavigate(program.link);
    }
  };

  const handleSeeMore = () => {
    if (onNavigate) {
      onNavigate('/assessment');
    }
  };

  const renderSkeletons = () => (
    <>
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
            <div className="space-y-6 h-full flex flex-col">
              <div className="space-y-4 flex-1">
                <Skeleton height="20px" width="30%" className="mb-2" />
                <Skeleton height="28px" width="80%" />
                <Skeleton height="20px" width="100%" />
                <Skeleton height="20px" width="90%" />
              </div>
              <div className="flex items-end justify-between">
                <Skeleton height="128px" width="128px" className="rounded-md" />
                <div className="flex flex-col items-end space-y-4">
                  <Skeleton height="20px" width="80px" />
                  <Skeleton height="48px" width="140px" className="rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="block lg:hidden space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
            <div className="space-y-4">
              <Skeleton height="20px" width="30%" className="mb-2" />
              <Skeleton height="28px" width="80%" />
              <Skeleton height="60px" width="100%" />
              <div className="flex items-center justify-between mt-4">
                <Skeleton height="96px" width="96px" className="rounded-md" />
                <div className="flex flex-col items-end space-y-4">
                  <Skeleton height="20px" width="80px" />
                  <Skeleton height="48px" width="140px" className="rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <ErrorBoundary>
      <section 
        className={`w-full ${className || ''}`}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          paddingTop: 'clamp(var(--spacing-8), 6vw, var(--spacing-12))',
          paddingBottom: 'clamp(var(--spacing-8), 6vw, var(--spacing-12))'
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
              {title}
            </h2>
            {programs.length > 0 && !loading && (
              <Button 
                onClick={handleSeeMore}
                variant="secondary"
                className="ikan-button self-start lg:self-auto mobile-button touch-target"
                style={{
                  backgroundColor: 'var(--color-neutral-200)',
                  color: 'var(--color-text-muted)',
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              >
                {seeMoreText}
              </Button>
            )}
          </div>

          {loading ? renderSkeletons() : (
            <>
               {programs.length === 0 ? (
                 <div className="text-center py-12 text-[var(--color-text-muted)]">
                   No assessments available at the moment.
                 </div>
               ) : (
                 <>
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
                              {program.category || subtitle}
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

                          <div className="flex items-end justify-between">
                            <div 
                              className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
                              style={{ borderRadius: 'var(--radius-md)' }}
                            >
                              <ImageWithFallback 
                                src={program.image}
                                alt={program.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div 
                              className="flex flex-col items-end"
                              style={{ gap: 'var(--spacing-4)' }}
                            >
                              {/* Stacked Time and Questions with Icons */}
                              <div 
                                className="flex flex-col items-end"
                                style={{ gap: 'var(--spacing-2)' }}
                              >
                                <div className="flex items-center gap-2">
                                  <FileQuestion className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                                  <span 
                                    className="text-sm"
                                    style={{
                                      fontSize: 'var(--text-sm)',
                                      color: 'var(--color-text-primary)',
                                      fontFamily: 'var(--font-family-base)'
                                    }}
                                  >
                                    {program.questionCount || 10} Questions
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                                  <span 
                                    className="text-sm"
                                    style={{
                                      fontSize: 'var(--text-sm)',
                                      color: 'var(--color-text-primary)',
                                      fontFamily: 'var(--font-family-base)'
                                    }}
                                  >
                                    {program.duration || 5} min
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => handleProgramClick(program)}
                                className="ikan-button"
                                style={{
                                  backgroundColor: 'var(--color-accent-default)',
                                  color: 'var(--color-accent-on)',
                                  height: 'var(--ikan-component-button-height)',
                                  borderRadius: 'var(--ikan-component-border-radius)',
                                  paddingLeft: 'var(--spacing-6)',
                                  paddingRight: 'var(--spacing-6)'
                                }}
                              >
                                {buttonText}
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
                            className="space-y-4 h-full flex flex-col"
                            style={{ gap: 'var(--spacing-3)' }}
                          >
                            {/* Content */}
                            <div 
                              className="flex-1"
                              style={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--spacing-3)'
                              }}
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
                                  {program.category || subtitle}
                                </div>
                                <h3 
                                  style={{
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-text-primary)',
                                    fontFamily: 'var(--font-family-base)',
                                    lineHeight: 'var(--line-height-md)',
                                    whiteSpace: 'pre-line' // Allow natural wrapping or explicit newlines from data
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
                            </div>

                            {/* Bottom Section */}
                            <div className="flex items-end justify-between">
                              <div 
                                className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0"
                                style={{ borderRadius: 'var(--radius-md)' }}
                              >
                                <ImageWithFallback 
                                  src={program.image}
                                  alt={program.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div 
                                className="flex flex-col items-end"
                                style={{ gap: 'var(--spacing-4)' }}
                              >
                                {/* Stacked Time and Questions with Icons */}
                                <div 
                                  className="flex flex-col items-end"
                                  style={{ gap: 'var(--spacing-2)' }}
                                >
                                  <div className="flex items-center gap-2">
                                    <FileQuestion className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                                    <span 
                                      className="text-sm"
                                      style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text-primary)',
                                        fontFamily: 'var(--font-family-base)'
                                      }}
                                    >
                                      {program.questionCount || 10} Questions
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                                    <span 
                                      className="text-sm"
                                      style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text-primary)',
                                        fontFamily: 'var(--font-family-base)'
                                      }}
                                    >
                                      {program.duration || 5} min
                                    </span>
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => handleProgramClick(program)}
                                  className="ikan-button"
                                  style={{
                                    backgroundColor: 'var(--color-accent-default)',
                                    color: 'var(--color-accent-on)',
                                    height: 'var(--ikan-component-button-height)',
                                    borderRadius: 'var(--ikan-component-border-radius)',
                                    paddingLeft: 'var(--spacing-6)',
                                    paddingRight: 'var(--spacing-6)'
                                  }}
                                >
                                  {buttonText}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                 </>
               )}
            </>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
}