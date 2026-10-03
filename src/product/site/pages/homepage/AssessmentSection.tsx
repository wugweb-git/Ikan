import React, { useMemo } from 'react';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { DEFAULT_CMS_CONTENT } from '../../content/cms-defaults';
import { useIsMobile } from '../../ui/hooks/useIsMobile';
import imgPhoneMockup from "../../content/assets/25d8d01a36eaa618a0c4fdd22ae73fb856925905.png";
import { CONTENT_MAX } from '../../ui/Container';

interface AssessmentSectionProps {
  onGetStarted: () => void;
}

/**
 * Keyword highlight colors matching the hero section palette
 */
const HIGHLIGHT_WORDS: Record<string, string> = {
  'well-being': 'var(--brand-teal)',
  'wellbeing': 'var(--brand-teal)',
  'assessments': 'var(--brand-amber)',
  'programs': 'var(--brand-coral)',
  'journey': 'var(--brand-teal)',
  'support': 'var(--brand-amber)',
};

function highlightKeywords(text: string): React.ReactNode[] {
  const words = Object.keys(HIGHLIGHT_WORDS);
  const regex = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    const lowerPart = part.toLowerCase();
    const color = HIGHLIGHT_WORDS[lowerPart];
    if (color) {
      return (
        <span key={i} style={{ color, fontStyle: 'italic' }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export function AssessmentSection({ onGetStarted }: AssessmentSectionProps) {
  const content = DEFAULT_CMS_CONTENT['homepage-assessment'];
  const isMobile = useIsMobile();

  const assessmentData = useMemo(() => {
    if (!content?.content) return null;
    try {
      return JSON.parse(content.content);
    } catch (e) {
      console.error('Failed to parse assessment content', e);
      return null;
    }
  }, [content]);

  if (!assessmentData) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[3px]" style={{ borderColor: 'var(--secondary)', borderTopColor: 'var(--foreground)' }}></div>
      </div>
    );
  }

  const { title, description, ctaText } = assessmentData;

  // Fallback short text — must not exceed 2 lines
  const displayTitle = title || 'Your wellbeing journey starts here';
  const displayDescription =
    description ||
    'Clinically backed assessments, guided programs, and professional support — all in one place.';

  return (
    <ErrorBoundary>
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--canvas)',
          padding: isMobile ? '56px 0' : '80px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: CONTENT_MAX,
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: isMobile ? '40px' : '64px',
            }}
          >
            {/* Left: Text Content */}
            <div
              style={{
                flex: '1 1 0',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '20px' : '28px',
                textAlign: isMobile ? 'center' : 'left',
                alignItems: isMobile ? 'center' : 'flex-start',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isMobile ? '28px' : '38px',
                  fontWeight: '500',
                  color: 'var(--foreground)',
                  lineHeight: '1.25',
                  margin: 0,
                  maxWidth: '520px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}
              >
                {highlightKeywords(displayTitle)}
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: isMobile ? '15px' : '17px',
                  fontWeight: '400',
                  color: 'var(--muted-foreground)',
                  lineHeight: '1.7',
                  margin: 0,
                  maxWidth: '460px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}
              >
                {displayDescription}
              </p>

              <button
                onClick={onGetStarted}
                className="site-cta"
              >
                {ctaText || 'Get Started'}
              </button>
            </div>

            {/* Right: Phone Mockup */}
            <div
              style={{
                flex: isMobile ? undefined : '0 0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                position: 'relative',
                width: isMobile ? '280px' : '400px',
                height: isMobile ? '320px' : '440px',
              }}
            >
              {/* Phone frame container */}
              <div
                style={{
                  position: 'relative',
                  width: isMobile ? '220px' : '300px',
                  height: '100%',
                }}
              >
                {/* Shadow / glow */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '70%',
                    height: '40px',
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                  }}
                />

                {/* Phone device frame */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: 'var(--radius-4xl)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--foreground)',
                    border: '6px solid var(--foreground)',
                    boxShadow: 'var(--shadow-dock)',
                  }}
                >
                  {/* Status bar */}
                  <div
                    style={{
                      height: '28px',
                      backgroundColor: 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Notch */}
                    <div
                      style={{
                        width: '80px',
                        height: '18px',
                        backgroundColor: 'var(--foreground)',
                        borderRadius: '0 0 14px 14px',
                        position: 'absolute',
                        top: 0,
                      }}
                    />
                  </div>

                  {/*
                    THE APP SCREEN, built from iKAN 2's own primitives rather
                    than drawn by hand. The version this replaces was a
                    miniature of the home screen typeset at 8-12px: it had its
                    own greeting, its own card shapes and its own stat tiles,
                    none of which existed in the product, and it could not be
                    read on a phone.

                    `program-band`, `metric-pill`, `mini-score` and
                    `semantic-chip` are iKAN 2's, ported in `ikan2.css`. Using
                    them means this preview changes when the system does.
                  */}
                  <div className="app-screen">
                    <div className="app-screen__top">
                      <span>
                        <small>Good morning</small>
                        <strong>Today</strong>
                      </span>
                      <span className="semantic-chip app-screen__chip">Day 3</span>
                    </div>

                    <div className="app-screen__mood">
                      <p>How are you feeling?</p>
                      <div>
                        {['\u{1F62B}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F604}'].map((e, i) => (
                          <span key={e} className={i === 3 ? 'is-on' : undefined} aria-hidden="true">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="program-band app-screen__band">
                      <span>
                        <span>PROGRAMME</span>
                        <strong>A day at a time</strong>
                      </span>
                      <span className="mini-score app-screen__ring" aria-hidden="true">
                        <span>3</span>
                      </span>
                    </div>

                    <div className="app-screen__metrics">
                      <div className="metric-pill">
                        <span>Day streak</span>
                        <strong>7</strong>
                      </div>
                      <div className="metric-pill">
                        <span>Well-being</span>
                        <strong>85%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second phone (partially visible, behind) — desktop only */}
              {!isMobile && (
                <div
                  style={{
                    position: 'absolute',
                    right: '-30px',
                    top: '30px',
                    width: '220px',
                    height: '380px',
                    borderRadius: 'var(--radius-4xl)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--foreground)',
                    border: '5px solid var(--foreground)',
                    boxShadow: 'var(--shadow-dock)',
                    zIndex: -1,
                    transform: 'rotate(4deg)',
                  }}
                >
                  <img
                    src={imgPhoneMockup}
                    alt="iKAN app screen"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}