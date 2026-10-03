import React, { useMemo } from 'react';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { ClipboardCheck, Heart } from 'lucide-react';
import { useIsMobile } from '../../ui/hooks/useIsMobile';
import { DEFAULT_CMS_CONTENT } from '../../content/cms-defaults';
import { CONTENT_MAX } from '../../ui/Container';

interface StatItem {
  value: string;
  label: string;
  icon: 'avatars' | 'assessments' | 'sessions';
}

const DEFAULT_STATS: StatItem[] = [
  {
    value: '50,000+',
    label: 'Assessments completed',
    icon: 'avatars',
  },
  {
    value: '2M+',
    label: 'iKAN members',
    icon: 'assessments',
  },
  {
    value: '500+',
    label: 'Sessions a day',
    icon: 'sessions',
  },
];

/* ─── Avatar Stack (3 overlapping circles with emoji) ─── */
function AvatarStack() {
  const avatars = [
    { bg: 'var(--brand-coral)', emoji: '😊' },
    { bg: 'var(--brand-amber)', emoji: '😌' },
    { bg: 'var(--brand-teal)', emoji: '🤗' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {avatars.map((a, i) => (
        <div
          key={i}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: a.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: '3px solid white',
            marginLeft: i > 0 ? '-14px' : '0',
            position: 'relative',
            zIndex: 3 - i,
          }}
        >
          {a.emoji}
        </div>
      ))}
    </div>
  );
}

/* ─── Stat Icon ─── */
function StatIcon({ type }: { type: StatItem['icon'] }) {
  if (type === 'avatars') {
    return <AvatarStack />;
  }

  const iconStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (type === 'assessments') {
    return (
      <div style={{ ...iconStyle, backgroundColor: 'var(--brand-amber)' }}>
        <ClipboardCheck style={{ width: '26px', height: '26px', color: 'white' }} />
      </div>
    );
  }

  // sessions
  return (
    <div style={{ ...iconStyle, backgroundColor: 'var(--brand-coral)' }}>
      <Heart style={{ width: '26px', height: '26px', color: 'white', fill: 'white' }} />
    </div>
  );
}

export function TestimonialSection() {
  const isMobile = useIsMobile();

  const cmsContent = DEFAULT_CMS_CONTENT['homepage-stats-section'];
  const cms = useMemo(() => {
    if (!cmsContent?.content) return null;
    try { return JSON.parse(cmsContent.content); } catch { return null; }
  }, [cmsContent]);

  const stats: StatItem[] = cms?.stats || DEFAULT_STATS;

  return (
    <ErrorBoundary>
      <section
        style={{
          backgroundColor: 'var(--canvas)',
          paddingTop: '64px',
          paddingBottom: '64px',
        }}
      >
        <div
          style={{
            maxWidth: CONTENT_MAX,
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Card wrapper */}
          <div
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--radius-4xl)',
              border: '2px solid #EFE8DE',
              padding: isMobile ? '40px 24px' : '48px 80px',
              minHeight: isMobile ? 'auto' : '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: isMobile ? '40px' : '0',
                width: '100%',
              }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    flex: isMobile ? undefined : '1 0 0',
                    minWidth: 0,
                  }}
                >
                  {/* Icon */}
                  <StatIcon type={stat.icon} />

                  {/* Value */}
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: isMobile ? '30px' : '34px',
                      fontWeight: '500',
                      color: 'var(--foreground)',
                      lineHeight: '1.3',
                      letterSpacing: '-0.8px',
                      textAlign: 'center',
                    }}
                  >
                    {stat.value}
                  </span>

                  {/* Label */}
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'var(--muted-foreground)',
                      letterSpacing: '-0.18px',
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}