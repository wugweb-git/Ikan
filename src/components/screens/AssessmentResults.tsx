import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { EngineResult } from '../../lib/recommendation-engine';
import { apiClient } from '../../lib/api-client';
import { ContentImage } from '../ui/ContentImage';
import { ArrowRight } from 'lucide-react';
import { SectionReportCard } from '../player/SectionReportCard';
import type { SectionScoreResult } from '../../lib/assessment-sections';

interface AssessmentResultsProps {
  /**
   * Stored result id, from `/assessment-results?id=…`. Passed as a prop rather
   * than read from `window.location` inside the component so a client-side
   * navigation between two results actually re-reads.
   */
  resultId?: string;
  assessmentId?: string;
  score?: number;
  maxScore?: number;
  recommendation?: EngineResult;
  sectionScores?: SectionScoreResult;
  onNavigate?: (route: string) => void;
  onReturnToDashboard?: () => void;
  onRetake?: () => void;
  className?: string;
}

export function AssessmentResults({ 
  resultId: resultIdProp, assessmentId, score, maxScore, recommendation, sectionScores,
  onNavigate, onReturnToDashboard, onRetake, className 
}: AssessmentResultsProps) {
  
  const [hydratedData, setHydratedData] = useState<any>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [programDetails, setProgramDetails] = useState<any>(null);

  /**
   * Resolve the result id this screen is showing.
   *
   * `?id=` in the URL wins, so a result is linkable and survives a refresh.
   * Otherwise fall back to the id of the result just submitted.
   */
  const resultId = useMemo(() => {
    if (resultIdProp) return resultIdProp;
    if (typeof window === 'undefined') return null;
    const fromUrl = new URLSearchParams(window.location.search).get('id');
    if (fromUrl) return fromUrl;
    // Nothing addressed explicitly: fall back to the result just submitted.
    try { return sessionStorage.getItem('lastAssessmentResultId'); } catch { return null; }
  }, [resultIdProp]);

  /**
   * Load the stored record.
   *
   * The stored record is the source of truth. sessionStorage is demoted to an
   * optimisation for the instant after submit — it is read first so the screen
   * paints immediately, then replaced when the record arrives. If the id
   * resolves, the stored record wins.
   *
   * Previously this screen could only ever be rendered from a sessionStorage
   * blob, so a result died with the tab and could never be linked to.
   */
  useEffect(() => {
    let cancelled = false;

    if (!assessmentId || !recommendation) {
      try {
        const stored = sessionStorage.getItem('lastAssessmentResults');
        if (stored) setHydratedData(JSON.parse(stored));
      } catch { /* ignore */ }
    }

    if (!resultId) return;
    setLoadingRecord(true);
    (async () => {
      try {
        const record = await apiClient.getAssessmentResult(resultId);
        if (cancelled || !record) return;
        setHydratedData({
          assessmentId: record.assessment_id,
          score: record.score,
          maxScore: record.max_score,
          // The full EngineResult, persisted at submit. Without it only a
          // flattened interpretation survived and this screen could not be
          // rebuilt from the record.
          recommendation: record.engine_result,
          sectionScores: record.section_scores ?? undefined,
          invalidReason: record.invalid_reason ?? null,
          completedAt: record.completed_at,
          fromRecord: true,
        });
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message ?? 'Could not load this result.');
      } finally {
        if (!cancelled) setLoadingRecord(false);
      }
    })();

    return () => { cancelled = true; };
  }, [assessmentId, recommendation, resultId]);

  const activeData = {
    assessmentId: assessmentId || hydratedData?.assessmentId,
    score: score ?? hydratedData?.score,
    maxScore: maxScore ?? hydratedData?.maxScore,
    recommendation: (recommendation || hydratedData?.recommendation) as EngineResult | undefined,
    // Present only for multi-instrument assessments. Arrives via prop in the
    // in-flow render and from the stored record on the standalone route.
    sectionScores: (sectionScores ?? hydratedData?.sectionScores) as SectionScoreResult | undefined,
    /** Set when the engine refused to produce a score. Never fabricated. */
    invalidReason: (hydratedData?.invalidReason ?? null) as string | null,
    /**
     * The band the score landed in. Its `label` is instrument copy ("Poor
     * Sleep"), not a severity term — the two are different fields.
     */
    interpretation: hydratedData?.interpretation as { label?: string; description?: string } | undefined,
  };

  const primaryProgramId = activeData.recommendation?.primaryAction?.type === 'equip_program'
    ? activeData.recommendation.primaryAction.programId
    : undefined;

  /**
   * Hooks must run on every render, so this sits above the early returns
   * below. It previously lived after them, which meant the render that
   * hydrated from storage called four hooks where the render before it called
   * two — React throws "Rendered more hooks than during the previous render",
   * crashing the standalone route on its own hydration path.
   */
  useEffect(() => {
    if (!primaryProgramId) return;
    let cancelled = false;
    (async () => {
      try {
        const prog = await apiClient.getEquipProgram(primaryProgramId);
        if (prog && !cancelled) setProgramDetails(prog);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [primaryProgramId]);

  // Still fetching the stored record — distinct from "nothing to show", which
  // is what the empty state below means.
  if (loadingRecord && !activeData.recommendation) {
    return (
      <div className={cn("w-full max-w-2xl mx-auto p-8 text-center", className)}>
        <p style={{
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-muted)',
        }}>Loading your result…</p>
      </div>
    );
  }

  /**
   * The engine refused to produce a score, and says why.
   *
   * This renders the reason rather than a label. A result that cannot be scored
   * is a real state with a real explanation — presenting it as a band, or
   * falling back to a placeholder word, tells the user something untrue about
   * their own answers.
   */
  if (activeData.invalidReason) {
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
          fontSize: 'var(--text-xl)', fontWeight: 500,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-primary)', marginBottom: 8,
        }}>This result could not be scored</h2>
        <p style={{
          fontSize: 'var(--text-base)', fontFamily: 'var(--font-family-base)',
          color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6,
        }}>
          {activeData.invalidReason}
        </p>
        {onRetake && <Button onClick={onRetake}>Retake assessment</Button>}
      </div>
    );
  }

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
          {loadError
            ? `We couldn't load this result: ${loadError}`
            : "We couldn't find recent assessment results. Please take an assessment first."}
        </p>
        <Button onClick={() => onNavigate?.('/assessment')}>View Assessments</Button>
      </div>
    );
  }

  const { recommendation: rec, score: activeScore, maxScore: activeMax } = activeData;
  const sections = activeData.sectionScores;

  /**
   * One template.
   *
   * A single-score assessment is one score, not a different screen. It used to
   * render through a parallel branch — its own ring, its own severity badge,
   * its own `paddingTop: 8` vs `16` — which meant every change to the results
   * layout had to be made twice and the two drifted. Here a single-score result
   * is normalised into the same shape a sectioned one already has, and both go
   * through `SectionReportCard`.
   */
  const unified: SectionScoreResult | null = (() => {
    if (sections?.sectioned && (sections.sections.length > 0 || sections.overall)) return sections;
    if (typeof activeScore !== 'number') return null;

    const max = typeof activeMax === 'number' && activeMax > 0 ? activeMax : 0;
    return {
      sectioned: true,
      sections: [],
      overall: {
        id: 'overall',
        label: activeData.interpretation?.label ? 'Your score' : 'Score',
        direction: 'higher-is-distress',
        value: activeScore,
        max,
        percent: max > 0 ? Math.round((activeScore / max) * 100) : 0,
        answered: 0,
        expected: 0,
        complete: true,
        // Present only when the record actually carries one. An absent band
        // renders as "Not banded" rather than as a fabricated label.
        band: activeData.interpretation?.label
          ? { min: 0, max, label: activeData.interpretation.label, description: activeData.interpretation.description }
          : undefined,
      },
    };
  })();


  return (
    <div className={cn("w-full max-w-2xl mx-auto p-4 md:p-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
        style={{ gap: 32 }}
      >
        {/* ── Score ──
            Multi-instrument assessments show a per-scale breakdown instead of
            one ring: a single total across GAD-2, WHO-5, resilience etc. mixes
            scales with different ranges and opposite directions, so it is not
            a meaningful number. */}
        {unified && (
          <div className="w-full" style={{ paddingTop: 8 }}>
            <SectionReportCard result={unified} />
          </div>
        )}

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
            onClick={onReturnToDashboard || (() => onNavigate?.('/dashboard'))}
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