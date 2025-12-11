import React from 'react';
import { Button } from '../../ui/button';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ArrowRight, Clock, Users } from 'lucide-react';

// Import assets
import svgPaths from "../../../imports/svg-rdg85uq8eg";

interface EquipProgramsSectionProps {
  onNavigate: (route: string) => void;
}

export function EquipProgramsSection({ onNavigate }: EquipProgramsSectionProps) {
  const features = [
    "Flexible — whenever and wherever you want",
    "Self-paced learning modules",
    "Expert-designed curriculum",
    "Community support included",
    "Progress tracking tools"
  ];

  const programs = [
    {
      title: "Stress Management",
      description: "A highly-curated selection of evidence-based techniques, mindfulness practices, and proven strategies for managing stress effectively.",
      duration: "14 days",
      activities: "23 Activities"
    },
    {
      title: "Anxiety Relief",
      description: "Comprehensive program combining cognitive behavioral techniques with practical exercises to help you overcome anxiety and build confidence.",
      duration: "21 days", 
      activities: "31 Activities"
    }
  ];

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
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <h2 
                className="mb-6"
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                Equip Programs
              </h2>
              
              <div 
                className="space-y-4 mb-6"
                style={{ gap: 'var(--spacing-4)' }}
              >
                {features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                      <svg viewBox="0 0 15 11" className="w-full h-full">
                        <path d={svgPaths.p25a5e700} fill="var(--color-text-primary)" />
                      </svg>
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

              <div 
                className="h-px mb-6"
                style={{ backgroundColor: 'var(--color-border-light)' }}
              />

              <p 
                className="text-sm"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                Supported by leading healthcare providers
              </p>
            </div>

            <div 
              className="space-y-6"
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
                    className="space-y-4"
                    style={{ gap: 'var(--spacing-4)' }}
                  >
                    <div>
                      <div 
                        className="uppercase tracking-wide mb-2"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-base)',
                          letterSpacing: 'var(--letter-spacing-wide)'
                        }}
                      >
                        PROGRAM
                      </div>
                      <h3 
                        style={{
                          fontSize: 'var(--text-2xl)',
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
                        className="w-24 h-24 rounded-lg"
                        style={{
                          backgroundColor: 'var(--color-neutral-300)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      />
                      
                      <div 
                        className="flex flex-col items-end space-y-4"
                        style={{ gap: 'var(--spacing-4)' }}
                      >
                        <div 
                          className="space-y-2"
                          style={{ gap: 'var(--spacing-2)' }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span 
                              className="text-sm font-medium uppercase tracking-wide"
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-base)',
                                letterSpacing: 'var(--letter-spacing-wide)'
                              }}
                            >
                              {program.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span 
                              className="text-sm font-medium uppercase tracking-wide"
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family-base)',
                                letterSpacing: 'var(--letter-spacing-wide)'
                              }}
                            >
                              {program.activities}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => onNavigate('/equip-programs-landing')}
                          className="ikan-button"
                          style={{
                            backgroundColor: 'var(--color-primary-default)',
                            color: 'var(--color-primary-on)',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          LEARN MORE
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div 
              className="flex items-stretch gap-8"
              style={{ gap: 'var(--spacing-8)' }}
            >
              {/* Left Content */}
              <div className="w-96 flex flex-col justify-center">
                <h2 
                  className="mb-6"
                  style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  Equip Programs
                </h2>
                
                <div 
                  className="space-y-4 mb-6"
                  style={{ gap: 'var(--spacing-4)' }}
                >
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                        <svg viewBox="0 0 15 11" className="w-full h-full">
                          <path d={svgPaths.p25a5e700} fill="var(--color-text-primary)" />
                        </svg>
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

                <div 
                  className="h-px mb-6"
                  style={{ backgroundColor: 'var(--color-border-light)' }}
                />

                <p 
                  className="text-sm"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  Supported by leading healthcare providers
                </p>
              </div>

              {/* Right Content - Program Cards */}
              <div 
                className="flex-1 flex gap-6"
                style={{ gap: 'var(--spacing-6)' }}
              >
                {programs.map((program, index) => (
                  <div 
                    key={index}
                    className="flex-1 p-6 rounded-xl border"
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
                            className="uppercase tracking-wide mb-2"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)',
                              fontFamily: 'var(--font-family-base)',
                              letterSpacing: 'var(--letter-spacing-wide)'
                            }}
                          >
                            PROGRAM
                          </div>
                          <h3 
                            style={{
                              fontSize: 'var(--text-2xl)',
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
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-end justify-between">
                        <div 
                          className="w-32 h-32 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-neutral-300)',
                            borderRadius: 'var(--radius-md)'
                          }}
                        />
                        
                        <div 
                          className="flex flex-col items-end space-y-4"
                          style={{ gap: 'var(--spacing-4)' }}
                        >
                          <div 
                            className="space-y-2"
                            style={{ gap: 'var(--spacing-2)' }}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span 
                                className="text-sm font-medium uppercase tracking-wide"
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--color-text-primary)',
                                  fontFamily: 'var(--font-family-base)',
                                  letterSpacing: 'var(--letter-spacing-wide)'
                                }}
                              >
                                {program.duration}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span 
                                className="text-sm font-medium uppercase tracking-wide"
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--color-text-primary)',
                                  fontFamily: 'var(--font-family-base)',
                                  letterSpacing: 'var(--letter-spacing-wide)'
                                }}
                              >
                                {program.activities}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => onNavigate('/equip-programs-landing')}
                            className="ikan-button"
                            style={{
                              backgroundColor: 'var(--color-primary-default)',
                              color: 'var(--color-primary-on)',
                              height: '48px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            LEARN MORE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}