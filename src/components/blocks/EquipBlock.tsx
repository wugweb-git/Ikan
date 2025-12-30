import React from 'react';
import { Button } from '../ui/button';
import { ErrorBoundary } from '../ErrorBoundary';
import { ArrowRight, Clock, User, Check } from 'lucide-react';
import svgPaths from "../../imports/svg-rdg85uq8eg";

export interface EquipProgram {
  title: string;
  description: string;
  duration: string;
  activities: string;
  link?: string;
  image?: string;
}

export interface EquipBlockProps {
  title?: string;
  footerText?: string;
  programLabel?: string;
  buttonText?: string;
  features?: string[];
  programs: EquipProgram[];
  onProgramClick?: (program: EquipProgram) => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function EquipBlock({ 
  title = "Equip Programs",
  footerText = "Supported by leading healthcare providers",
  programLabel = "PROGRAM",
  buttonText = "LEARN MORE",
  features = [],
  programs,
  onProgramClick,
  onNavigate,
  className
}: EquipBlockProps) {
  
  const handleProgramClick = (program: EquipProgram) => {
    if (onProgramClick) {
      onProgramClick(program);
    } else if (onNavigate && program.link) {
      onNavigate(program.link);
    } else if (onNavigate) {
      onNavigate('/equip');
    }
  };

  // Helper to split title "Equip Programs" into two lines
  const renderTitle = () => {
    if (title === "Equip Programs") {
      return (
        <>
          <div>Equip</div>
          <div>Programs</div>
        </>
      );
    }
    return title;
  };

  return (
    <ErrorBoundary>
      <section 
        className={className}
        style={{
          backgroundColor: 'transparent',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-8)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <h2 
                className="mb-6"
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  lineHeight: '1.2'
                }}
              >
                {renderTitle()}
              </h2>
              
              {features.length > 0 && (
                <div 
                  className="space-y-4 mb-6"
                  style={{ gap: 'var(--spacing-4)' }}
                >
                  {features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                         <Check className="w-full h-full text-[var(--color-text-primary)]" strokeWidth={2} />
                      </div>
                      <p 
                        className="leading-relaxed"
                        style={{
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-primary)',
                          lineHeight: 'var(--line-height-md)',
                          fontFamily: 'var(--font-family-base)'
                        }}
                      >
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div 
                className="h-px mb-6 w-16"
                style={{ backgroundColor: 'var(--color-border-default)' }}
              />

              <p 
                className="text-sm max-w-[200px]"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {footerText}
              </p>
            </div>

            <div 
              className="space-y-6"
              style={{ gap: 'var(--spacing-6)' }}
            >
              {programs.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-muted)] border rounded-xl border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
                  No programs available at the moment.
                </div>
              ) : (
                programs.map((program, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border flex flex-col h-full"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  <div 
                    className="space-y-4 flex-1"
                    style={{ gap: 'var(--spacing-4)' }}
                  >
                    <div>
                      <div 
                        className="uppercase tracking-wide mb-2"
                        style={{
                          fontSize: '0.75rem', // Smaller label
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {programLabel}
                      </div>
                      <h3 
                        style={{
                          fontSize: '1.5rem', // Large title
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)',
                          lineHeight: '1.3'
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

                  <div className="flex items-end justify-between mt-8">
                      {program.image ? (
                        <img 
                          src={program.image} 
                          alt={program.title}
                          className="w-24 h-24 rounded-lg object-cover"
                          style={{
                            borderRadius: 'var(--radius-md)'
                          }}
                        />
                      ) : (
                        <div 
                          className="w-24 h-24 rounded-lg bg-neutral-200"
                          style={{
                            borderRadius: 'var(--radius-md)'
                          }}
                        />
                      )}
                      
                      <div 
                        className="flex flex-col items-start space-y-4 ml-4 flex-1"
                        style={{ gap: 'var(--spacing-4)' }}
                      >
                        <div 
                          className="space-y-1 w-full"
                          style={{ gap: 'var(--spacing-1)' }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <span 
                              className="text-xs font-medium uppercase tracking-wide"
                              style={{
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-base)',
                                letterSpacing: '0.05em'
                              }}
                            >
                              {program.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-neutral-500" />
                            <span 
                              className="text-xs font-medium uppercase tracking-wide"
                              style={{
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-base)',
                                letterSpacing: '0.05em'
                              }}
                            >
                              {program.activities}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleProgramClick(program)}
                          className="w-full flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: '#2A2A2A', // Dark grey/black from image
                            color: '#FFFFFF',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            letterSpacing: '0.05em'
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                          {buttonText}
                        </Button>
                      </div>
                    </div>
                </div>
              )))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div 
              className="flex items-start gap-8"
              style={{ gap: 'var(--spacing-8)' }}
            >
              {/* Left Content */}
              <div className="w-64 flex-shrink-0 pt-4">
                <h2 
                  className="mb-8"
                  style={{
                    fontSize: '2rem', // Larger size
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    lineHeight: '1.2'
                  }}
                >
                  {renderTitle()}
                </h2>
                
                {features.length > 0 && (
                  <div 
                    className="space-y-5 mb-8"
                  >
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                           <Check className="w-full h-full text-[var(--color-text-primary)]" strokeWidth={2} />
                        </div>
                        <p 
                          className="leading-snug"
                          style={{
                            fontSize: '0.95rem',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family-base)',
                            fontWeight: '500'
                          }}
                        >
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div 
                  className="h-px mb-6 w-full opacity-20"
                  style={{ backgroundColor: 'var(--color-text-primary)' }}
                />

                <p 
                  className="text-sm max-w-[180px] opacity-60 font-medium"
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-primary)', // Using primary but opacitied to match grey look
                    fontFamily: 'var(--font-family-base)',
                    lineHeight: '1.4'
                  }}
                >
                  {footerText}
                </p>
              </div>

              {/* Right Content - Program Cards */}
              <div 
                className="flex-1"
              >
                {programs.length === 0 ? (
                  <div className="text-center py-12 text-[var(--color-text-muted)] border rounded-xl border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
                    No programs available at the moment.
                  </div>
                ) : (
                  <div 
                    className="grid grid-cols-3 gap-6"
                    style={{ gap: 'var(--spacing-6)' }}
                  >
                    {programs.map((program, index) => (
                      <div 
                        key={index}
                        className="p-6 rounded-xl border flex flex-col h-full bg-white transition-shadow hover:shadow-md"
                        style={{
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border-default)',
                          minHeight: '420px' // Ensure tall cards
                        }}
                      >
                          {/* Top Section */}
                          <div 
                            className="space-y-4 flex-1"
                          >
                            <div>
                              <div 
                                className="uppercase tracking-wide mb-3"
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--color-text-primary)',
                                  fontFamily: 'var(--font-family-base)',
                                  letterSpacing: '0.1em'
                                }}
                              >
                                {programLabel}
                              </div>
                              <h3 
                                className="mb-3"
                                style={{
                                  fontSize: '1.5rem',
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--color-text-primary)',
                                  fontFamily: 'var(--font-family-base)',
                                  lineHeight: '1.2'
                                }}
                              >
                                {program.title}
                              </h3>
                            </div>
                            
                            <p 
                              style={{
                                fontSize: '0.95rem',
                                color: 'var(--color-text-muted)',
                                lineHeight: '1.5',
                                fontFamily: 'var(--font-family-base)'
                              }}
                            >
                              {program.description}
                            </p>
                          </div>

                          {/* Bottom Section */}
                          <div className="flex items-end justify-between mt-8 pt-4">
                            {/* Image or Placeholder */}
                            {program.image ? (
                              <img 
                                src={program.image} 
                                alt={program.title}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                style={{
                                  borderRadius: 'var(--radius-md)'
                                }}
                              />
                            ) : (
                              <div 
                                className="w-24 h-24 rounded-lg bg-neutral-200 flex-shrink-0"
                                style={{
                                  borderRadius: 'var(--radius-md)'
                                }}
                              />
                            )}
                            
                            {/* Metadata & Button Column */}
                            <div 
                              className="flex flex-col items-start justify-end h-full pl-4 w-full"
                            >
                              <div 
                                className="space-y-2 mb-4 w-full"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-neutral-900" strokeWidth={1.5} />
                                  <span 
                                    className="text-xs font-medium uppercase tracking-wider"
                                    style={{
                                      color: 'var(--color-text-primary)',
                                      fontFamily: 'var(--font-family-base)'
                                    }}
                                  >
                                    {program.duration}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-neutral-900" strokeWidth={1.5} />
                                  <span 
                                    className="text-xs font-medium uppercase tracking-wider"
                                    style={{
                                      color: 'var(--color-text-primary)',
                                      fontFamily: 'var(--font-family-base)'
                                    }}
                                  >
                                    {program.activities}
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => handleProgramClick(program)}
                                className="w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                style={{
                                  backgroundColor: '#2A2A2A',
                                  color: '#FFFFFF',
                                  height: '42px',
                                  borderRadius: 'var(--radius-md)', // Slightly smaller radius for button
                                  fontSize: '0.75rem',
                                  fontWeight: 'var(--font-weight-medium)',
                                  letterSpacing: '0.05em'
                                }}
                              >
                                <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                                {buttonText}
                              </Button>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}