import { ErrorBoundary } from '../ErrorBoundary';
import { ArrowRight, Clock } from 'lucide-react';
import { ContentImage } from '../ContentImage';

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
  /**
   * A default only fires on `undefined`, so an explicit `buttonText=""` — which
   * is what a CMS field left blank sends — reached the button and rendered an
   * arrow with no words next to it. Blank is treated as unset.
   */
  const cta = buttonText?.trim() || "LEARN MORE";

  const handleProgramClick = (program: EquipProgram) => {
    if (onProgramClick) {
      onProgramClick(program);
    } else if (onNavigate && program.link) {
      onNavigate(program.link);
    } else if (onNavigate) {
      onNavigate('/equip');
    }
  };

  if (!programs || programs.length === 0) return null;

  return (
    <ErrorBoundary>
      <section
        style={{
          backgroundColor: 'var(--color-bg-page)',
          paddingTop: '64px',
          paddingBottom: '64px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Section Header
              Guarded so the block can be embedded inside a page that already
              has its own heading. `footerText` was already guarded; `title` was
              not, so `title=""` left an empty <h2> and its 32px margin —
              invisible in isolation and a gap nobody could account for once the
              block sat inside another section. */}
          {(title || onNavigate) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            {title ? (
            <h2
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: '28px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: '1.3',
                margin: 0,
              }}
            >
              {title}
            </h2>
            ) : <span />}
            {onNavigate && (
              <button
                onClick={() => onNavigate('/equip')}
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                View all
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
          )}

          {/* Program Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {programs.map((program, index) => (
              <div
                key={`${program.title}-${index}`}
                onClick={() => handleProgramClick(program)}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border-light)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Card Image */}
                {program.image && (
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <ContentImage
                      src={program.image}
                      alt={program.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                {/* Card Content */}
                <div style={{ padding: '20px' }}>
                  {/* Label. Guarded for the same reason as the section title:
                      `programLabel=""` left an empty <p> and its 8px margin. */}
                  {programLabel && (
                  <p
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: '11px',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-muted)',
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {programLabel}
                  </p>
                  )}

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: '18px',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      lineHeight: '1.4',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-muted)',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {program.description}
                  </p>

                  {/* Meta Info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {program.duration && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Clock
                          style={{
                            width: '14px',
                            height: '14px',
                            color: 'var(--color-text-muted)',
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: '13px',
                            fontWeight: 'var(--font-weight-regular)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {program.duration}
                        </span>
                      </div>
                    )}

                    <span
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: '13px',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {cta}
                      <ArrowRight style={{ width: '14px', height: '14px' }} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Text */}
          {footerText && (
            <p
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                marginTop: '32px',
                margin: '32px 0 0 0',
              }}
            >
              {footerText}
            </p>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
}