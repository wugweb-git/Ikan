import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { EngineResult, SeverityLevel, getSeverityBandFromProfile } from '../../lib/recommendation-engine';
import { apiClient } from '../../lib/api-client';
import { ContentImage } from '../ui/ContentImage';
import { ArrowRight } from 'lucide-react';

interface AssessmentResultsProps {
  assessmentId?: string;
  score?: number;
  maxScore?: number;
  recommendation?: EngineResult;
  onNavigate?: (route: string) => void;
  onReturnToDashboard?: () => void;
  onRetake?: () => void;
  className?: string;
}

// ─── Score Ring SVG ───────────────────────────────────────────
function ScoreRing({ score, maxScore, color, size = 140 }: { score: number; maxScore: number; color: string; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = maxScore > 0 ? score / maxScore : 0;
  const pctDisplay = Math.round(pct * 100);
  const offset = circumference - pct * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--color-bg-muted)" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: 36,
            fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
        >
          {pctDisplay}%
        </motion.span>
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 400,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-muted)',
          marginTop: 2,
        }}>
          {score} / {maxScore}
        </span>
      </div>
    </div>
  );
}

export function AssessmentResults({ 
  assessmentId, score, maxScore, recommendation,
  onNavigate, onReturnToDashboard, onRetake, className 
}: AssessmentResultsProps) {
  
  const [hydratedData, setHydratedData] = useState<any>(null);

  useEffect(() => {
    if (!assessmentId || !recommendation) {
      try {
        const stored = sessionStorage.getItem('lastAssessmentResults');
        if (stored) setHydratedData(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [assessmentId, recommendation]);

  const activeData = {
    assessmentId: assessmentId || hydratedData?.assessmentId,
    score: score ?? hydratedData?.score,
    maxScore: maxScore ?? hydratedData?.maxScore,
    recommendation: recommendation || hydratedData?.recommendation as EngineResult | undefined
  };

  if (!activeData.recommendation) {
    return (
      <div className={cn("w-full max-w-2xl mx-auto p-8 text-center", className)}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: 'var(--color-bg-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Icon name="clipboard" size={28} className="text-[var(--color-text-muted)]" />
        </div>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-primary)',
          marginBottom: 8,
        }}>No Results Found</h2>
        <p style={{
          fontSize: 'var(--text-base)',
          fontWeight: 400,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-muted)',
          marginBottom: 24,
        }}>
          We couldn't find recent assessment results. Please take an assessment first.
        </p>
        <Button onClick={() => onNavigate?.('/assessment')}>View Assessments</Button>
      </div>
    );
  }

  const { recommendation: rec, score: activeScore, maxScore: activeMax } = activeData;

  const getSeverityColor = (severity: SeverityLevel) => {
    // Try to get color from scoring profile band first
    const profileBand = activeData.assessmentId
      ? getSeverityBandFromProfile(activeScore || 0, (activeData as any).scoringProfileId || '')
      : null;
    if (profileBand?.color) return profileBand.color;

    switch (severity) {
      case 'low': return 'var(--color-status-success)';
      case 'moderate': return 'var(--color-status-warning)';
      case 'high': return 'var(--color-status-danger)';
      default: return 'var(--color-primary-default)';
    }
  };

  const severityColor = getSeverityColor(rec.severity);

  const [programDetails, setProgramDetails] = useState<any>(null);

  useEffect(() => {
    if (rec.primaryAction.type === 'equip_program' && rec.primaryAction.programId) {
      (async () => {
        try {
          const prog = await apiClient.getEquipProgram(rec.primaryAction.programId!);
          if (prog) setProgramDetails(prog);
        } catch { /* ignore */ }
      })();
    }
  }, [rec.primaryAction.programId]);

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-4 md:p-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
        style={{ gap: 32 }}
      >
        {/* ── Score Ring ── */}
        <div className="flex flex-col items-center" style={{ gap: 16, paddingTop: 16 }}>
          <ScoreRing
            score={activeScore || 0}
            maxScore={activeMax || 1}
            color={severityColor}
            size={140}
          />
          
          {/* Severity badge */}
          <span style={{
            display: 'inline-block',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            color: severityColor,
            backgroundColor: `color-mix(in srgb, ${severityColor} 10%, transparent)`,
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            textTransform: 'capitalize',
          }}>
            {rec.severity} severity
          </span>
        </div>

        {/* ── Message ── */}
        <div className="text-center" style={{ maxWidth: 440 }}>
          <p style={{
            fontSize: 'var(--text-base)',
            fontWeight: 400,
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.6,
          }}>
            {rec.severityMessage}
          </p>
        </div>

        <div style={{
          width: '100%', height: 1,
          backgroundColor: 'var(--color-border-default)',
        }} />

        {/* ── Primary Recommendation ── */}
        {rec.primaryAction.type === 'equip_program' && (
          <div style={{ width: '100%' }}>
            <span style={{
              display: 'block',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 12,
            }}>
              Recommended for you
            </span>

            <div
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                border: '1px solid var(--color-border-default)',
              }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-2/5 relative overflow-hidden" style={{ minHeight: 180, backgroundColor: 'var(--color-bg-muted)' }}>
                  <ContentImage
                    src={programDetails?.thumbnail || programDetails?.cover_image || ''}
                    alt="Program"
                    className="w-full h-full object-cover"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center" style={{ padding: 24, gap: 12 }}>
                  <h4 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    {rec.primaryAction.title}
                  </h4>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 400,
                    fontFamily: 'var(--font-family-base)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {rec.primaryAction.body}
                  </p>
                  <button
                    onClick={() => onNavigate && rec.primaryAction.programId && onNavigate(`/equip-program-onboarding?id=${rec.primaryAction.programId}`)}
                    style={{
                      marginTop: 4,
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-primary-default)',
                      color: 'var(--color-text-inverse)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-base)',
                      fontWeight: 500,
                      fontFamily: 'var(--font-family-base)',
                      width: 'fit-content',
                    }}
                  >
                    {rec.primaryAction.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Secondary Recommendations ── */}
        {rec.secondaryActions.length > 0 && (
          <div style={{ width: '100%' }}>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
              {rec.secondaryActions.map((action, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate && action.route && onNavigate(action.route)}
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xs)',
                    border: '1px solid var(--color-border-default)',
                    padding: 20,
                    cursor: action.route ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <div>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      fontFamily: 'var(--font-family-base)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}>
                      {action.title}
                    </span>
                    <p style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 500,
                      fontFamily: 'var(--font-family-base)',
                      color: 'var(--color-text-primary)',
                      margin: '6px 0 0',
                    }}>
                      {action.label}
                    </p>
                  </div>
                  {action.route && (
                    <span className="flex items-center" style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      fontFamily: 'var(--font-family-base)',
                      color: 'var(--color-text-muted)',
                      gap: 4,
                    }}>
                      Explore <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Professional Support Note ── */}
        {rec.showProfessionalSupportNote && (
          <div style={{
            width: '100%',
            backgroundColor: 'var(--color-status-info-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            border: '1px solid var(--color-border-default)',
          }}>
            <div className="flex items-start" style={{ gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: 'var(--color-status-info)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--color-text-inverse)',
              }}>
                <Icon name="info" size={14} />
              </div>
              <p style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 400,
                fontFamily: 'var(--font-family-base)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                If things feel overwhelming, professional support can make a real difference. You're not alone in this.
              </p>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-center" style={{ paddingTop: 16, paddingBottom: 24 }}>
          <button
            onClick={onReturnToDashboard}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-muted)',
              padding: '8px 16px',
            }}
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}