import React from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { User, Building2, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { BENEFITS_TITLE, BENEFITS_DATA } from '../../../lib/homepage-data';

export function BenefitsSection() {
  const targets = BENEFITS_DATA.map(target => ({
    ...target,
    icon: target.targetType === 'individuals' ? <User className="w-8 h-8" /> : 
          target.targetType === 'employers' ? <Building2 className="w-8 h-8" /> : 
          <Stethoscope className="w-8 h-8" />
  }));

  return (
    <ErrorBoundary>
      <section 
        className="w-full animate-fade-in"
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
          {/* Header */}
          <div 
            className="text-center space-y-4 mb-12 animate-slide-up"
            style={{ marginBottom: 'var(--spacing-8)' }}
          >
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
              {BENEFITS_TITLE}
            </h2>
          </div>

          {/* Cards Grid */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            style={{ gap: 'var(--spacing-6)' }}
          >
            {targets.map((target, index) => (
              <div 
                key={index}
                className="p-8 rounded-xl flex flex-col h-full animate-slide-up"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: target.color,
                    color: target.iconColor
                  }}
                >
                  {target.icon}
                </div>

                <h3 
                  className="mb-2"
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {target.title}
                </h3>

                <p 
                  className="mb-4 font-medium"
                  style={{
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {target.subtitle}
                </p>

                <p 
                  className="leading-relaxed mb-6 flex-grow"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)',
                    fontFamily: 'var(--font-family-base)'
                  }}
                >
                  {target.description}
                </p>
                
                <div className="pt-2">
                   <Button
                      variant="ghost"
                      className="p-0 h-auto hover:bg-transparent hover:underline justify-start"
                      style={{
                          color: target.iconColor,
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)'
                      }}
                   >
                      Learn more <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}