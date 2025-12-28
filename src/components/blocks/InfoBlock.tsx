import React from 'react';
import { Check, Info } from 'lucide-react';

export interface InfoHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface InfoNote {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export type InfoBlockVariant = 'default' | 'checklist' | 'centered' | 'benefits';

interface InfoBlockProps {
  // Section 1: Main content
  mainTitle?: string;
  mainSubtitle?: string;
  mainContent?: string[];
  mainContentHtml?: string;
  
  // Section 2: Highlights
  highlightsTitle?: string;
  highlights?: InfoHighlight[];
  
  // Section 3: Notes
  notesTitle?: string;
  notes?: InfoNote[];
  
  variant?: InfoBlockVariant;
  className?: string;
}

export function InfoBlock({ 
  mainTitle,
  mainSubtitle,
  mainContent = [],
  mainContentHtml,
  highlightsTitle,
  highlights = [],
  notesTitle,
  notes = [],
  variant = 'default',
  className = ''
}: InfoBlockProps) {
  
  // -- RENDERERS --

  // SECTION 1: CHECKLIST VARIANT (Redesigned: Split View)
  if (variant === 'checklist') {
    return (
      <section className={`w-full py-16 md:py-24 ${className}`} style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Title & Checklist (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {mainTitle && (
                <h2 
                  className="text-3xl md:text-4xl font-medium text-[var(--color-text-primary)] tracking-tight"
                  style={{ fontFamily: 'var(--font-family-base)' }}
                >
                  {mainTitle}
                </h2>
              )}

              <div className="space-y-5">
                {highlights.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-white/50">
                    <div className="mt-1 shrink-0 text-[var(--color-primary-default)]">
                      <Check size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-lg text-[var(--color-text-primary)] leading-relaxed font-medium">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: "Who can participate" Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)] shadow-sm relative overflow-hidden">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-default)] opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                
                <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4 relative z-10">
                  {notesTitle || "Who can participate"}
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                    {notes[0]?.title || notes[0]?.description}
                  </p>
                  
                  {/* Visual indicator for medical disclaimer */}
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] pt-2 opacity-80">
                    <Info size={16} />
                    <span>Please consult a professional if needed</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    );
  }

  // SECTION 3: CENTERED EXPLANATION VARIANT (Redesigned: Improved Typography)
  if (variant === 'centered') {
    return (
      <section className={`w-full py-16 md:py-24 ${className}`} style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          {/* Section Title */}
          {mainTitle && (
            <h2 className="mb-4 text-3xl md:text-4xl font-medium text-[var(--color-text-primary)] tracking-tight">
              {mainTitle}
            </h2>
          )}
          
          {/* Subheading - Only render if not identical to first paragraph to avoid duplication */}
          {mainSubtitle && (
            <h3 className="mb-10 text-xl text-[var(--color-text-muted)] font-normal max-w-2xl mx-auto">
              {mainSubtitle}
            </h3>
          )}

          {/* Content Card */}
          <div className="bg-transparent md:bg-[var(--color-bg-card)] md:p-10 md:rounded-2xl md:border md:border-[var(--color-border-default)] md:shadow-sm">
            <div className="space-y-6 text-left">
              {mainContentHtml ? (
                <div 
                  className="rich-text-content space-y-6 text-lg leading-relaxed text-[var(--color-text-primary)]"
                  dangerouslySetInnerHTML={{ __html: mainContentHtml }}
                />
              ) : (
                mainContent.slice(0, 3).map((para, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-[var(--color-primary-default)]">
                    <p className="text-lg leading-relaxed text-[var(--color-text-primary)]">
                      {para}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // SECTION 4: BENEFITS & NOTES VARIANT
  if (variant === 'benefits') {
    return (
      <section className={`w-full py-12 md:py-16 ${className}`} style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="max-w-6xl mx-auto px-4">
          
          {/* PART A: BENEFITS GRID (2x2) */}
          <div className="mb-16">
            {highlightsTitle && (
              <h2 className="mb-8 text-3xl font-medium text-[var(--color-text-primary)]">
                {highlightsTitle}
              </h2>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highlights.slice(0, 4).map((benefit, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] flex flex-col h-full"
                >
                  <div className="mb-4 text-[var(--color-text-primary)]">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PART B: IMPORTANT NOTES PANEL */}
          <div className="rounded-2xl bg-[var(--color-bg-muted)] p-8">
            {notesTitle && (
              <h3 className="mb-6 text-xl font-medium text-[var(--color-text-primary)]">
                {notesTitle}
              </h3>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notes.slice(0, 3).map((note, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="text-[var(--color-text-muted)]">
                    {note.icon || <Info size={24} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)] text-base mb-1">
                      {note.title}
                    </h4>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {note.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    );
  }

  // DEFAULT FALLBACK (Legacy support if needed)
  return null;
}
