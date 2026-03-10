/**
 * RecommendationCards — Wellness Insights
 * Redesigned: compact, card-based layout with clear visual hierarchy.
 * Shows severity insight, primary recommendation, secondary actions,
 * and professional support note.
 */
import React from 'react';
import { cn } from './ui/utils';
import { useIsMobile } from '../hooks/useIsMobile';
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
} from 'lucide-react';
import type { EngineResult, SeverityLevel } from '../lib/recommendation-engine';

interface RecommendationCardsProps {
  engineResult: EngineResult;
  onNavigate: (route: string) => void;
  className?: string;
}

const SEVERITY_CONFIG: Record<SeverityLevel, {
  color: string; bg: string; label: string; icon: React.ReactNode;
}> = {
  low: {
    color: 'var(--color-status-success)',
    bg: 'var(--color-status-success-light)',
    label: 'You\'re doing well',
    icon: <TrendingUp size={16} />,
  },
  moderate: {
    color: 'var(--color-status-warning)',
    bg: 'var(--color-status-warning-light)',
    label: 'Room to grow',
    icon: <Lightbulb size={16} />,
  },
  high: {
    color: 'var(--color-status-danger)',
    bg: 'var(--color-status-danger-light)',
    label: 'Needs attention',
    icon: <Shield size={16} />,
  },
};

const SECONDARY_ICONS: Record<string, React.ReactNode> = {
  resources: <BookOpen size={16} aria-hidden="true" />,
  trackers: <Heart size={16} aria-hidden="true" />,
  related_program: <Sparkles size={16} aria-hidden="true" />,
  professional_support: <Phone size={16} aria-hidden="true" />,
};

export function RecommendationCards({ engineResult, onNavigate, className }: RecommendationCardsProps) {
  const { severity, primaryAction, secondaryActions, severityMessage, showProfessionalSupportNote } = engineResult;
  const config = SEVERITY_CONFIG[severity];
  const isMobile = useIsMobile();

  return (
    <section
      className={cn('flex flex-col', className)}
      style={{ gap: 'var(--spacing-3)' }}
      aria-label="Personalized recommendations based on your assessment"
    >
      {/* ── Severity Insight Banner ── */}
      <div
        style={{
          backgroundColor: config.bg,
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          fontFamily: 'var(--font-family-base)',
        }}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start" style={{ gap: 12 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
              color: config.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {config.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              color: config.color,
              display: 'block',
              marginBottom: 2,
            }}>
              {config.label}
            </span>
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)',
              margin: 0,
            }}>
              {severityMessage}
            </p>
          </div>
        </div>
      </div>

      {/* ── Primary Recommendation ── */}
      {primaryAction.type === 'equip_program' && primaryAction.programId && (
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
            backgroundColor: 'var(--color-primary-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Decorative bg icon */}
          <div style={{
            position: 'absolute', top: -10, right: -10,
            opacity: 0.06, pointerEvents: 'none',
          }}>
            <Sparkles size={120} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Recommended for you
            </span>

            <h3 style={{
              color: 'var(--color-text-inverse)',
              fontSize: 'var(--text-lg)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              margin: '8px 0 6px',
            }}>
              {primaryAction.title}
            </h3>

            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              fontFamily: 'var(--font-family-base)',
              lineHeight: 'var(--line-height-md)',
              margin: '0 0 16px',
              maxWidth: '90%',
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
                color: 'var(--color-primary-default)',
                fontWeight: 500,
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 20px',
                minHeight: 'var(--ikan-touch-target-min)',
              }}
            >
              <Play size={14} fill="currentColor" aria-hidden="true" />
              {primaryAction.cta}
            </button>
          </div>
        </div>
      )}

      {/* ── Secondary Actions ── */}
      {secondaryActions.length > 0 && (
        <div
          className={cn(
            'grid gap-3',
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {secondaryActions.map((action, idx) => (
            <div
              key={`${action.type}-${idx}`}
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
                border: '1px solid var(--color-border-default)',
                backgroundColor: 'var(--color-bg-card)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary-default)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-default)';
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'var(--color-bg-muted)',
                  color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {SECONDARY_ICONS[action.type] || <ArrowRight size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 400,
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {action.title}
                </p>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-primary)',
                  margin: '2px 0 0',
                  lineHeight: 1.3,
                }}>
                  {action.label}
                </p>
              </div>
              <ArrowRight
                size={14}
                style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Professional Support Note ── */}
      {showProfessionalSupportNote && (
        <div
          style={{
            backgroundColor: 'var(--color-status-danger-light)',
            border: '1px solid var(--color-status-danger)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
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
                className="flex items-center border-none cursor-pointer"
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
      )}
    </section>
  );
}