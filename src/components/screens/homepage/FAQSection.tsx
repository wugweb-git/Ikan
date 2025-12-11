import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { ErrorBoundary } from '../../ErrorBoundary';
import { ChevronDown } from 'lucide-react';

// Import assets
import svgPaths from "../../../imports/svg-rdg85uq8eg";

export function FAQSection() {
  const [openModules, setOpenModules] = useState<Set<number>>(new Set());

  const modules = [
    "MODULE 1: Start your journey!",
    "MODULE 2: My symptoms and goals",
    "MODULE 3: Psychological stress model",
    "MODULE 4: Resources and resilience",
    "MODULE 5: Self-worth and personal beliefs",
    "MODULE 6: Open discussion session",
    "MODULE 7: Reflection and review"
  ];

  const features = [
    "1 month risk-free trial",
    "Self-paced learning modules",
    "Community support included"
  ];

  const toggleModule = (index: number) => {
    const newOpenModules = new Set(openModules);
    if (newOpenModules.has(index)) {
      newOpenModules.delete(index);
    } else {
      newOpenModules.add(index);
    }
    setOpenModules(newOpenModules);
  };

  return (
    <ErrorBoundary>
      <section 
        className="w-full animate-fade-in"
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
            className="text-center space-y-4 mb-12 animate-slide-up"
            style={{ marginBottom: 'var(--spacing-8)' }}
          >
            <div 
              className="tracking-wide uppercase"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-base)',
                letterSpacing: 'var(--letter-spacing-wide)'
              }}
            >
              Your Course
            </div>
            <h2 
              className="max-w-4xl mx-auto"
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-sm)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              Psychological Help for Stress.<br />
              What this course offers you:
            </h2>
            <p 
              className="max-w-3xl mx-auto leading-relaxed"
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-md)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              Change takes time. Similar to sports or meditation, you won't feel immediate improvement - a clear plan and persistence are the keys to success. That's why our courses are designed for sustainability.
            </p>
          </div>

          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-6">
            {/* Course Header */}
            <div 
              className="p-6 rounded-xl text-center"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h3 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                6 Month Group Course
              </h3>
            </div>

            {/* Modules List */}
            <div 
              className="space-y-2 mobile-optimized"
              style={{ gap: 'var(--spacing-2)' }}
            >
              {modules.map((module, index) => (
                <Button
                  key={index}
                  onClick={() => toggleModule(index)}
                  variant="ghost"
                  className="w-full p-4 rounded-xl justify-between h-auto text-left mobile-button touch-target"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  <span 
                    className="font-medium"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    {module}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${openModules.has(index) ? 'rotate-180' : ''}`}
                  />
                </Button>
              ))}
            </div>

            {/* Get Started Card */}
            <div 
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-default)'
              }}
            >
              <h3 
                className="mb-6"
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                Begin your journey
              </h3>
              
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
                        fontSize: 'var(--text-sm)',
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

              <Button 
                className="ikan-button w-full"
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

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div 
              className="flex gap-8"
              style={{ gap: 'var(--spacing-8)' }}
            >
              {/* Course Modules */}
              <div 
                className="flex-1 space-y-2"
                style={{ gap: 'var(--spacing-2)' }}
              >
                {/* Course Header */}
                <div 
                  className="p-6 rounded-xl text-center mb-4"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-primary-on)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-4)'
                  }}
                >
                  <h3 
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    6 Month Group Course
                  </h3>
                </div>

                {/* Modules List */}
                {modules.map((module, index) => (
                  <Button
                    key={index}
                    onClick={() => toggleModule(index)}
                    variant="ghost"
                    className="w-full p-6 rounded-xl justify-between h-auto text-left"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    <span 
                      className="font-medium"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      {module}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${openModules.has(index) ? 'rotate-180' : ''}`}
                    />
                  </Button>
                ))}
              </div>

              {/* Get Started Card */}
              <div 
                className="w-96 p-8 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <h3 
                  className="mb-8"
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  Begin your journey
                </h3>
                
                <div 
                  className="space-y-4 mb-8"
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
                          fontSize: 'var(--text-sm)',
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

                <Button 
                  className="ikan-button w-full"
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
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}