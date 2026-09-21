/**
 * RecommendationCards — Bento-style Wellness Insights
 */
import React from 'react';
import { cn } from '../../ui/utils';
import { useIsMobile } from '../../../hooks/useIsMobile';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Play,
  Phone,
  Heart,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Shield,
  ClipboardList,
  PenLine,
} from 'lucide-react';
import type { EngineResult, ResponseTier } from '../../../shared/engine/recommendation-engine';
import { tierPresentation } from '../../../lib/severity-presentation';

interface RecommendationCardsProps {
  engineResult: EngineResult;
  onNavigate: (route: string) => void;
  className?: string;
}

/**
 * Tier -> presentation. Colour and gradient come from `tierPresentation`; only
 * the label and the icon are this file's own, because they are copy.
 *
 * The six raw hex gradient stops that used to live here were a fifth private
 * copy of the tier colour map, and they drifted: `#FBE9E7` is a deep-orange
 * tint, not the danger red the `color` beside it resolved to.
 */
const SEVERITY_CONFIG: Record<ResponseTier, {
  color: string; bg: string; label: string; icon: React.ReactNode; gradient: string;
}> = {
  low: {
    color: tierPresentation('low').color,
    bg: tierPresentation('low').background,
    label: 'You\'re doing well',
    icon: <TrendingUp size={18} />,
    gradient: tierPresentation('low').gradient,
  },
  moderate: {
    color: tierPresentation('moderate').color,
    bg: tierPresentation('moderate').background,
    label: 'Room to grow',
    icon: <Lightbulb size={18} />,
    gradient: tierPresentation('moderate').gradient,
  },
  high: {
    color: tierPresentation('high').color,
    bg: tierPresentation('high').background,
    label: 'Needs attention',
    icon: <Shield size={18} />,
    gradient: tierPresentation('high').gradient,
  },
};

const SECONDARY_META: Record<string, { icon: React.ReactNode; heroIcon: React.ReactNode; bg: string; accent: string }> = {
  resources: {
    icon: <BookOpen size={18} aria-hidden="true" />,
    heroIcon: <BookOpen size={48} strokeWidth={1} aria-hidden="true" />,
    bg: '#EEF2FF',
    accent: '#6366F1',
  },
  trackers: {
    icon: <Heart size={18} aria-hidden="true" />,
    heroIcon: <Heart size={48} strokeWidth={1} aria-hidden="true" />,
    bg: '#FDF2F8',
    accent: '#EC4899',
  },
  related_program: {
    icon: <Sparkles size={18} aria-hidden="true" />,
    heroIcon: <Sparkles size={48} strokeWidth={1} aria-hidden="true" />,
    bg: '#F0FDF4',
    accent: '#22C55E',
  },
  professional_support: {
    icon: <Phone size={18} aria-hidden="true" />,
    heroIcon: <Phone size={48} strokeWidth={1} aria-hidden="true" />,
    bg: '#FFF7ED',
    accent: '#F97316',
  },
};

const FALLBACK_META = {
  icon: <ArrowRight size={18} aria-hidden="true" />,
  heroIcon: <ClipboardList size={48} strokeWidth={1} aria-hidden="true" />,
  bg: '#F3F4F6',
  accent: '#6B7280',
};

export function RecommendationCards({ engineResult, onNavigate, className }: RecommendationCardsProps) {
  const { tier, primaryAction, secondaryActions, showProfessionalSupportNote } = engineResult;
  const config = SEVERITY_CONFIG[tier];
  const isMobile = useIsMobile();

  const hasPrimary = primaryAction.type === 'equip_program' && !!primaryAction.programId;

  // For bento: take first 2 secondary actions to fit grid
  const bentoSecondary = secondaryActions.slice(0, 2);
  const extraSecondary = secondaryActions.slice(2);

  return (
    <section
      className={cn('flex flex-col', className)}
      style={{ gap: 'var(--spacing-3)', fontFamily: 'var(--font-family-base)' }}
      aria-label="Personalized recommendations based on your assessment"
    >
      {isMobile ? (
        /* ═══ MOBILE: stacked with 2-col bottom row ═══ */
        <>
          {/* Severity */}
          <SeverityCard engineResult={engineResult} config={config} />
          {/* Primary */}
          {hasPrimary && <PrimaryCard primaryAction={primaryAction} onNavigate={onNavigate} />}
          {/* Secondary 2-col */}
          {bentoSecondary.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
              {bentoSecondary.map((a, i) => (
                <SecondaryCard key={`${a.type}-${i}`} action={a} index={i} onNavigate={onNavigate} />
              ))}
            </div>
          )}
          {/* Overflow secondary */}
          {extraSecondary.map((a, i) => (
            <SecondaryCard key={`extra-${a.type}-${i}`} action={a} index={i + 2} onNavigate={onNavigate} />
          ))}
        </>
      ) : (
        /* ═══ DESKTOP: 2×2 bento grid ═══ */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.35fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: 'var(--spacing-3)',
          }}
        >
          {/* Top-left: Severity */}
          <SeverityCard engineResult={engineResult} config={config} />

          {/* Top-right: Secondary 1 */}
          {bentoSecondary[0] ? (
            <SecondaryCard action={bentoSecondary[0]} index={0} onNavigate={onNavigate} />
          ) : <div />}

          {/* Bottom-left: Primary CTA */}
          {hasPrimary ? (
            <PrimaryCard primaryAction={primaryAction} onNavigate={onNavigate} />
          ) : <div />}

          {/* Bottom-right: Secondary 2 */}
          {bentoSecondary[1] ? (
            <SecondaryCard action={bentoSecondary[1]} index={1} onNavigate={onNavigate} />
          ) : <div />}
        </div>
      )}

      {/* ── Professional Support Note ── */}
      {showProfessionalSupportNote && <ProfessionalSupportNote onNavigate={onNavigate} />}
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Sub-components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SeverityCard({ engineResult, config }: { engineResult: EngineResult; config: typeof SEVERITY_CONFIG[ResponseTier] }) {
  return (
    <div
      style={{
        background: config.gradient,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        fontFamily: 'var(--font-family-base)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        backgroundColor: `color-mix(in srgb, ${config.color} 8%, transparent)`,
        pointerEvents: 'none',
      }} />

      <div className="flex items-start" style={{ gap: 14, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
            color: config.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {config.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: 'var(--text-base)',
            fontWeight: 500,
            color: config.color,
            display: 'block',
            marginBottom: 4,
          }}>
            {config.label}
          </span>
          {(engineResult.assessmentName || engineResult.assessmentSlug) && (
            <p style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 400,
              color: 'var(--color-text-muted)',
              margin: '0 0 6px',
              lineHeight: 1.4,
            }}>
              Based on your {engineResult.assessmentName || engineResult.assessmentSlug} result
              {engineResult.score !== undefined && engineResult.maxScore ? ` (${engineResult.score}/${engineResult.maxScore})` : ''}
            </p>
          )}
          {/* No authored copy means none is shown. The former fallback,
              "Your assessment results have been analyzed.", said nothing and
              read as though something had been decided. */}
          {engineResult.severityMessage && (
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)',
              margin: 0,
            }}>
              {engineResult.severityMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimaryCard({ primaryAction, onNavigate }: { primaryAction: EngineResult['primaryAction']; onNavigate: (route: string) => void }) {
  return (
    <div
      onClick={() => onNavigate(`/equip-detail?id=${primaryAction.programId}`)}
      role="link"
      tabIndex={0}
      aria-label={`Start recommended program: ${primaryAction.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(`/equip-detail?id=${primaryAction.programId}`);
        }
      }}
      className="cursor-pointer group"
      style={{
        background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 20px',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Decorative sparkle pattern */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        opacity: 0.04, pointerEvents: 'none',
      }}>
        <Sparkles size={160} color="white" />
      </div>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', bottom: -40, left: '30%',
        width: 200, height: 100,
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center" style={{ gap: 6, marginBottom: 10 }}>
          <Sparkles size={12} style={{ color: 'rgba(255,255,255,0.45)' }} />
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
          }}>
            Recommended for you
          </span>
        </div>

        <h3 style={{
          color: '#FFFFFF',
          fontSize: 'var(--text-lg)',
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          margin: '0 0 6px',
          lineHeight: 1.35,
        }}>
          {primaryAction.title}
        </h3>

        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: 'var(--text-sm)',
          fontWeight: 400,
          fontFamily: 'var(--font-family-base)',
          lineHeight: 'var(--line-height-md)',
          margin: '0 0 18px',
          maxWidth: '92%',
        }}>
          {primaryAction.body}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`/equip-program-onboarding?id=${primaryAction.programId}`);
          }}
          className="flex items-center border-none cursor-pointer"
          style={{
            gap: 8,
            backgroundColor: 'white',
            color: '#1a1a1a',
            fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 22px',
            minHeight: 'var(--ikan-touch-target-min)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <Play size={13} fill="currentColor" aria-hidden="true" />
          {primaryAction.cta}
        </button>
      </div>
    </div>
  );
}

function SecondaryCard({ action, index, onNavigate }: {
  action: EngineResult['secondaryActions'][number];
  index: number;
  onNavigate: (route: string) => void;
}) {
  const meta = SECONDARY_META[action.type] || FALLBACK_META;

  return (
    <div
      onClick={() => action.route && onNavigate(action.route)}
      role="link"
      tabIndex={0}
      aria-label={action.label || action.title}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && action.route) {
          e.preventDefault();
          onNavigate(action.route);
        }
      }}
      className="cursor-pointer group"
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: meta.bg,
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: 120,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Decorative large icon */}
      <div style={{
        position: 'absolute', bottom: -8, right: -8,
        opacity: 0.08, color: meta.accent,
        pointerEvents: 'none',
      }}>
        {meta.heroIcon}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: `color-mix(in srgb, ${meta.accent} 14%, transparent)`,
            color: meta.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}
          aria-hidden="true"
        >
          {meta.icon}
        </div>

        <p style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-primary)',
          margin: '0 0 2px',
          lineHeight: 1.35,
        }}>
          {action.label}
        </p>
        <p style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 400,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-muted)',
          margin: 0,
          lineHeight: 1.4,
        }}>
          {action.title}
        </p>
      </div>

      <div className="flex items-center" style={{
        gap: 4, marginTop: 12,
        color: meta.accent,
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        fontFamily: 'var(--font-family-base)',
        transition: 'gap 0.2s',
      }}>
        <span>Open</span>
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function ProfessionalSupportNote({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-status-danger-light)',
        border: '1px solid color-mix(in srgb, var(--color-status-danger) 30%, transparent)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
      }}
      role="alert"
    >
      <div className="flex items-start" style={{ gap: 12 }}>
        <AlertTriangle
          size={18}
          style={{ color: 'var(--color-status-danger)', flexShrink: 0, marginTop: 2 }}
          aria-hidden="true"
        />
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            margin: '0 0 4px',
          }}>
            Consider speaking with a professional
          </p>
          <p style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-md)',
            margin: '0 0 12px',
          }}>
            Your responses suggest you may benefit from professional support. You don't have to face this alone.
          </p>
          <button
            onClick={() => onNavigate('/consultation')}
            className="flex items-center cursor-pointer"
            style={{
              gap: 6,
              backgroundColor: 'transparent',
              border: '1px solid var(--color-status-danger)',
              color: 'var(--color-status-danger)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              minHeight: 'var(--ikan-touch-target-min)',
            }}
          >
            <Phone size={14} aria-hidden="true" />
            Talk to a professional
          </button>
        </div>
      </div>
    </div>
  );
}
