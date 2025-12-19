import React from 'react';

export interface InfoHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface InfoNote {
  icon: string;
  title: string;
  description: string;
}

interface InfoBlockProps {
  // Section 1: Main content
  mainTitle?: string;
  mainContent?: string[];
  
  // Section 2: Highlights
  highlightsTitle?: string;
  highlights?: InfoHighlight[];
  
  // Section 3: Notes
  notesTitle?: string;
  notes?: InfoNote[];
  
  className?: string;
}

export function InfoBlock({ 
  mainTitle = "About this assessment",
  mainContent = [],
  highlightsTitle = "Key Features",
  highlights = [],
  notesTitle = "Things to keep in mind",
  notes = [],
  className = ''
}: InfoBlockProps) {
  const hasMainContent = mainTitle || mainContent.length > 0;
  const hasHighlights = highlights.length > 0;
  const hasNotes = notes.length > 0;

  // Don't render if no content
  if (!hasMainContent && !hasHighlights && !hasNotes) {
    return null;
  }

  return (
    <section 
      className={`w-full ${className}`}
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
        {/* Section 1: Main Information */}
        {hasMainContent && (
          <div 
            className="mb-12 lg:mb-16"
            style={{ marginBottom: 'var(--spacing-12)' }}
          >
            <div className="max-w-4xl mx-auto">
              {mainTitle && (
                <h2 
                  className="mb-6"
                  style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    marginBottom: 'var(--spacing-6)'
                  }}
                >
                  {mainTitle}
                </h2>
              )}
              <div 
                className="space-y-4"
                style={{ 
                  gap: 'var(--spacing-4)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--line-height-md)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {mainContent.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Highlights Grid */}
        {hasHighlights && (
          <div 
            className="mb-12 lg:mb-16"
            style={{ marginBottom: 'var(--spacing-12)' }}
          >
            {highlightsTitle && (
              <h2 
                className="mb-6 md:mb-8"
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  marginBottom: 'var(--spacing-6)'
                }}
              >
                {highlightsTitle}
              </h2>
            )}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              style={{ gap: 'var(--spacing-6)' }}
            >
              {highlights.map((highlight, index) => (
                <HighlightCard key={index} {...highlight} />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Important Notes */}
        {hasNotes && (
          <div 
            className="p-6 md:p-8 lg:p-12 rounded-2xl"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-8)'
            }}
          >
            {notesTitle && (
              <h3 
                className="mb-6"
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  marginBottom: 'var(--spacing-6)'
                }}
              >
                {notesTitle}
              </h3>
            )}
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
              style={{ gap: 'var(--spacing-6)' }}
            >
              {notes.map((note, index) => (
                <InfoCard key={index} {...note} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function HighlightCard({ icon, title, description }: InfoHighlight) {
  return (
    <div 
      className="p-6 rounded-xl border hover:shadow-md transition-shadow"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        padding: 'var(--spacing-6)'
      }}
    >
      <div 
        className="text-3xl mb-3"
        style={{ marginBottom: 'var(--spacing-3)' }}
      >
        {icon}
      </div>
      <h3 
        className="mb-2"
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)',
          marginBottom: 'var(--spacing-2)'
        }}
      >
        {title}
      </h3>
      <p 
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-md)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {description}
      </p>
    </div>
  );
}

function InfoCard({ icon, title, description }: InfoNote) {
  return (
    <div 
      className="p-6 rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-6)'
      }}
    >
      <div 
        className="rounded-full flex items-center justify-center text-3xl mb-4"
        style={{
          backgroundColor: 'var(--color-neutral-100)',
          borderRadius: 'var(--radius-pill)',
          width: '80px',
          height: '80px',
          marginBottom: 'var(--spacing-4)'
        }}
      >
        {icon}
      </div>
      <h4 
        className="mb-3"
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)',
          marginBottom: 'var(--spacing-3)'
        }}
      >
        {title}
      </h4>
      <p 
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-md)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {description}
      </p>
    </div>
  );
}