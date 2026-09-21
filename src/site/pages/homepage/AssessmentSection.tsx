import React, { useMemo } from 'react';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { DEFAULT_CMS_CONTENT } from '../../lib/cms-defaults';
import { useIsMobile } from '../../../shared/hooks/useIsMobile';
import imgPhoneMockup from "../../assets/25d8d01a36eaa618a0c4fdd22ae73fb856925905.png";

interface AssessmentSectionProps {
  onGetStarted: () => void;
}

/**
 * Keyword highlight colors matching the hero section palette
 */
const HIGHLIGHT_WORDS: Record<string, string> = {
  'well-being': 'var(--color-chart-1)',
  'wellbeing': 'var(--color-chart-1)',
  'assessments': 'var(--color-chart-2)',
  'programs': 'var(--color-chart-3)',
  'journey': 'var(--color-chart-1)',
  'support': 'var(--color-chart-2)',
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
        <div className="animate-spin rounded-full h-8 w-8 border-[3px]" style={{ borderColor: 'var(--color-accent-default)', borderTopColor: 'var(--color-primary-default)' }}></div>
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
          backgroundColor: 'var(--color-bg-page)',
          padding: isMobile ? '56px 0' : '80px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
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
                  fontFamily: 'var(--font-family-base)',
                  fontSize: isMobile ? '28px' : '38px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
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
                  fontFamily: 'var(--font-family-base)',
                  fontSize: isMobile ? '15px' : '17px',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
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
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: '16px',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'white',
                  backgroundColor: 'var(--color-primary-default)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '16px 40px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  boxShadow: '0 4px 16px rgba(42, 42, 42, 0.12)',
                  marginTop: '8px',
                  width: isMobile ? '100%' : 'auto',
                  maxWidth: isMobile ? '300px' : undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
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
                    borderRadius: '32px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--grey-9)',
                    border: '6px solid #2A2A2A',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Status bar */}
                  <div
                    style={{
                      height: '28px',
                      backgroundColor: 'var(--grey-1)',
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
                        backgroundColor: '#2A2A2A',
                        borderRadius: '0 0 14px 14px',
                        position: 'absolute',
                        top: 0,
                      }}
                    />
                  </div>

                  {/* App screen content */}
                  <div
                    style={{
                      width: '100%',
                      height: 'calc(100% - 28px)',
                      backgroundColor: 'var(--grey-1)',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '16px 14px',
                      gap: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Greeting */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '11px', color: '#717182', margin: 0, fontWeight: 400 }}>Good morning</p>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '16px', color: '#151515', margin: '2px 0 0', fontWeight: 500 }}>Sarah ☀️</p>
                      </div>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E9EBEF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px' }}>👤</span>
                      </div>
                    </div>

                    {/* Mood card */}
                    <div
                      style={{
                        backgroundColor: 'var(--grey-0)',
                        borderRadius: '14px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '12px', fontWeight: 500, color: '#151515', margin: 0 }}>How are you feeling?</p>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                        {['😊', '😌', '😐', '😔', '😢'].map((emoji, i) => (
                          <div
                            key={i}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: i === 0 ? '#4ABDAC20' : 'var(--grey-1)',
                              border: i === 0 ? '2px solid #4ABDAC' : '1px solid #EBEBEB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                            }}
                          >
                            {emoji}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { label: 'Journal', color: '#4ABDAC', icon: '📝' },
                        { label: 'Assess', color: '#F0A830', icon: '📋' },
                        { label: 'Equip', color: '#E87B7B', icon: '🎯' },
                      ].map((action) => (
                        <div
                          key={action.label}
                          style={{
                            flex: 1,
                            backgroundColor: 'var(--grey-0)',
                            borderRadius: '12px',
                            padding: '10px 6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              backgroundColor: `${action.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                            }}
                          >
                            {action.icon}
                          </div>
                          <span style={{ fontFamily: 'var(--font-family-base)', fontSize: '9px', fontWeight: 500, color: '#151515' }}>
                            {action.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Program card */}
                    <div
                      style={{
                        backgroundColor: 'var(--grey-0)',
                        borderRadius: '14px',
                        padding: '12px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #4ABDAC, #2A8A7E)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>🧘</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '11px', fontWeight: 500, color: '#151515', margin: 0 }}>Continue Program</p>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '9px', color: '#717182', margin: '2px 0 0', fontWeight: 400 }}>Day 3 of 14 • Mindfulness</p>
                      </div>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--grey-1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                        }}
                      >
                        ▶
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, backgroundColor: 'var(--grey-0)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '14px', fontWeight: 500, color: 'var(--ikan-brand-teal)', margin: 0 }}>7</p>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '8px', color: '#717182', margin: '2px 0 0', fontWeight: 400 }}>Day Streak</p>
                      </div>
                      <div style={{ flex: 1, backgroundColor: 'var(--grey-0)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '14px', fontWeight: 500, color: 'var(--ikan-brand-amber)', margin: 0 }}>85%</p>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: '8px', color: '#717182', margin: '2px 0 0', fontWeight: 400 }}>Well-being</p>
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
                    borderRadius: '28px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--grey-9)',
                    border: '5px solid #2A2A2A',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                    zIndex: -1,
                    transform: 'rotate(4deg)',
                  }}
                >
                  <img
                    src={imgPhoneMockup}
                    alt="iKan app screen"
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