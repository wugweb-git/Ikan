import { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { cn } from '../ui/utils';
import { EngineResult } from '../../lib/recommendation-engine';
import { apiClient } from '../../lib/api-client';
import { ContentImage } from '../ui/ContentImage';
import { ArrowRight } from 'lucide-react';
import { SectionReportCard } from '../player/SectionReportCard';
import { AssessmentCard } from '../assessment/AssessmentCard';
import { severityPresentation, severityOfResult } from '../../lib/severity-presentation';
import { resolveResultPresentation } from '../../lib/result-presentation';
import { getLoadedScoringProfiles, loadScoringProfiles } from '../../lib/recommendation-engine';
import type { SectionScoreResult } from '../../lib/assessment-sections';

/** Inline style helper, matching the convention across the results screens. */
const f = (size: string, weight = 400, color = 'var(--color-text-primary)') => ({
  fontFamily: 'var(--font-family-base)',
  fontSize: `var(--text-${size})`,
  fontWeight: weight,
  color,
});

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
  
  const reduceMotion = useReducedMotion();
  const [hydratedData, setHydratedData] = useState<any>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [programDetails, setProgramDetails] = useState<any>(null);
  /** The assessment record, for the result header and the context line. */
  const [assessmentDef, setAssessmentDef] = useState<any>(null);
  /** Records for the adjacent programmes, so a card can show a real name. */
  const [relatedDetails, setRelatedDetails] = useState<any[]>([]);

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

    /**
     * The paint-now blob, used only when nothing else addresses a result.
     *
     * It used to load whenever `assessmentId` or `recommendation` was absent,
     * without ever checking which result it held. So `/assessment-results?id=B`
     * whose fetch failed rendered result A — someone else's numbers under B's
     * URL, with nothing on screen saying so. The id is compared now, and a
     * mismatch leaves the screen empty for the fetch to fill.
     */
    if (!assessmentId || !recommendation) {
      try {
        const stored = sessionStorage.getItem('lastAssessmentResults');
        if (stored) {
          const parsed = JSON.parse(stored);
          const blobId = parsed?.resultId ?? parsed?.id ?? null;
          const addressesThisResult = !resultId || (blobId != null && String(blobId) === String(resultId));
          if (addressesThisResult) setHydratedData(parsed);
        }
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
          // Records written before the rename carry `severity` where the
          // engine now emits `tier`. Map on read rather than dual-writing.
          recommendation: record.engine_result
            ? { ...record.engine_result, tier: record.engine_result.tier ?? record.engine_result.severity }
            : record.engine_result,
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
    /** ISO timestamp off the stored record. Hydrated already; never was shown. */
    completedAt: hydratedData?.completedAt as string | undefined,
  };

  /**
   * The band this result actually falls in, resolved by the one module all
   * three result surfaces share. Computed here rather than at the render site
   * so it sits above the early returns with the other derived values.
   */
  const placed = resolveResultPresentation(
    {
      assessment_id: activeData.assessmentId,
      score: activeData.score,
      max_score: activeData.maxScore,
      section_scores: activeData.sectionScores,
      interpretation: activeData.interpretation,
      completed_at: activeData.completedAt,
    },
    assessmentDef,
    getLoadedScoringProfiles() ?? {},
  );

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

  /**
   * The assessment this result is of.
   *
   * Nothing on the page used to say. That was survivable while the only way
   * here was straight out of the flow — the user knew what they had just
   * answered — but a result is addressable by `?id=` now. Opened tomorrow, or
   * sent to someone, the page was a number with no subject: no instrument
   * name, no date, no description of what was measured, while `completed_at`
   * sat hydrated and unrendered.
   */
  const activeAssessmentId = assessmentId || hydratedData?.assessmentId;
  useEffect(() => {
    if (!activeAssessmentId) return;
    let cancelled = false;
    (async () => {
      try {
        // Bands live on scoring-profile records, not on the definition, and
        // the standalone /assessment-results route does not go through the
        // dashboard's engine init.
        await loadScoringProfiles().catch(() => { /* renders unbanded */ });
        const def = await apiClient.getAssessment(activeAssessmentId);
        if (def && !cancelled) setAssessmentDef(def);
      } catch { /* the header degrades to whatever the record carries */ }
    })();
    return () => { cancelled = true; };
  }, [activeAssessmentId]);

  /**
   * Records for the adjacent programmes.
   *
   * The engine hands over ids, never labels. The label used to be manufactured
   * from the slug by string manipulation — which is where "Explore Stress" came
   * from — so a card showed a truncated slug where a programme's real name
   * belongs. Fetching the records is the same call the primary action already
   * makes; mapped over the ids it yields a title, an image and a length.
   */
  const relatedIds = (activeData.recommendation?.relatedPrograms ?? []).slice(0, 4);
  const relatedKey = relatedIds.join(',');
  useEffect(() => {
    if (!relatedKey) { setRelatedDetails([]); return; }
    let cancelled = false;
    (async () => {
      const rows = await Promise.all(
        relatedKey.split(',').map(async (id) => {
          try { return await apiClient.getEquipProgram(id); } catch { return null; }
        }),
      );
      // A programme that failed to load is dropped, not rendered as an empty
      // card — an unnamed recommendation is worse than one fewer.
      if (!cancelled) setRelatedDetails(rows.filter(Boolean));
    })();
    return () => { cancelled = true; };
  }, [relatedKey]);

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
        label: placed.band ? 'Your score' : 'Score',
        direction: 'higher-is-distress',
        value: activeScore,
        max,
        percent: max > 0 ? Math.round((activeScore / max) * 100) : 0,
        answered: 0,
        expected: 0,
        complete: true,
        /**
         * The band the score was PLACED in, from the same module the dashboard
         * and the history screen use.
         *
         * This used to build a band straight out of `interpretation.label`,
         * which is a placeholder on 89 of 104 live records — so a completed
         * assessment rendered a band reading "Completed", with `min: 0, max`
         * invented around it to make it look like a range. Both parts were
         * fabricated: the label was a status word and the range was never
         * authored anywhere.
         */
        band: placed.band
          ? {
              min: 0,
              max,
              label: placed.band.label,
              description: activeData.interpretation?.description,
            }
          : undefined,
      },
    };
  })();



  // ── Header facts ───────────────────────────────────────────────────────────
  // Every one of these already existed on the record and none of them was
  // rendered. Each is null-checked separately rather than assembled into one
  // interpolated string, so a missing field drops a line instead of printing
  // "undefined questions".
  const def = assessmentDef;
  const title: string | null = def?.title ?? rec.assessmentName ?? null;
  const category: string | null = def?.category ?? rec.category ?? null;
  const description: string | null = def?.description ?? null;
  const questionCount: number | null = Array.isArray(def?.questions) && def.questions.length > 0
    ? def.questions.length : null;
  /**
   * Scales actually scored. A single-score assessment reports none: telling
   * someone their result covers "1 scale" is noise, not information.
   */
  const scaleCount: number | null = (() => {
    const n = sections?.sections?.length ?? (Array.isArray(def?.scores) ? def.scores.length : 0);
    return n > 1 ? n : null;
  })();

  const completedLabel: string | null = (() => {
    if (!activeData.completedAt) return null;
    const d = new Date(activeData.completedAt);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ` +
           `${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  })();

  // The band the score landed in, for the header's accent rule. Structure
  // carrying meaning rather than decoration — and neutral when unresolved,
  // never the most severe.
  const sev = severityPresentation(severityOfResult({ sectionScores: sections }) ?? rec.severityLevel ?? null);

  /**
   * The programme's real length, off its own record.
   *
   * Both halves are null-checked: a programme with no authored duration shows
   * no duration, rather than the "30 days" that would otherwise be typed in
   * here once and then be wrong for six of them.
   */
  const programMeta: string | null = (() => {
    if (!programDetails) return null;
    const days = typeof programDetails.duration_days === 'number' && programDetails.duration_days > 0
      ? programDetails.duration_days : null;
    const content = Array.isArray(programDetails.daily_content) ? programDetails.daily_content : [];
    const activities = content.reduce(
      (n: number, day: any) => n + (Array.isArray(day?.blocks) ? day.blocks.length : 0), 0);
    const parts = [
      days !== null ? `${days} days` : null,
      activities > 0 ? `${activities} activities` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' \u00b7 ') : null;
  })();

  const hasPrimary = rec.primaryAction.type === 'equip_program';
  const hasRelated = relatedDetails.length > 0;

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] as const },
      };

  /** Section eyebrow. Says what a group is; claims nothing about it. */
  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <p style={{
      ...f('xs', 500, 'var(--color-text-muted)'),
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      margin: '0 0 12px',
    }}>{children}</p>
  );

  return (
    <div className={cn('mx-auto w-full max-w-2xl px-4 pb-10 pt-4 sm:px-6', className)}>
      <div className="flex flex-col" style={{ gap: 28 }}>

        {/* ── Result header ──
            The page's subject line. Without it a linked result is a number
            with nothing attached to it. */}
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          style={{
            borderLeft: `3px solid ${sev.color}`,
            paddingLeft: 16,
          }}
        >
          {(category || completedLabel) && (
            <p className="flex flex-wrap items-center" style={{
              ...f('xs', 500, 'var(--color-text-muted)'),
              gap: 8, margin: '0 0 6px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {category && <span>{category}</span>}
              {category && completedLabel && (
                <span aria-hidden="true" style={{
                  width: 3, height: 3, borderRadius: '50%',
                  backgroundColor: 'var(--color-border-default)',
                }} />
              )}
              {completedLabel && <span style={{ textTransform: 'none', letterSpacing: 0 }}>{completedLabel}</span>}
            </p>
          )}

          {title && (
            <h1 style={{ ...f('2xl', 500), lineHeight: 1.2, margin: 0 }}>{title}</h1>
          )}

          {/* Two labelled facts, not one run-on. The middot is an element, so
              a language that separates differently can restyle it without
              re-translating a sentence. */}
          {(questionCount !== null || scaleCount !== null) && (
            <p className="flex flex-wrap items-center" style={{
              ...f('sm', 400, 'var(--color-text-muted)'), gap: 8, margin: '8px 0 0',
            }}>
              {questionCount !== null && <span>{questionCount} questions</span>}
              {questionCount !== null && scaleCount !== null && (
                <span aria-hidden="true" style={{
                  width: 3, height: 3, borderRadius: '50%',
                  backgroundColor: 'var(--color-border-default)',
                }} />
              )}
              {scaleCount !== null && <span>{scaleCount} scales</span>}
            </p>
          )}
        </motion.header>

        {/* ── Score ──
            Multi-instrument assessments show a per-scale breakdown instead of
            one ring: a single total across GAD-2, WHO-5, resilience etc. mixes
            scales with different ranges and opposite directions, so it is not
            a meaningful number. */}
        {unified && (
          <motion.div {...reveal} className="w-full">
            <SectionReportCard result={unified} />
          </motion.div>
        )}

        {/* ── What this measured ──
            The assessment's own description, verbatim. Not a summary of it,
            and not written here. */}
        {description && (
          <motion.section {...reveal}>
            <Eyebrow>What this measured</Eyebrow>
            <p style={{ ...f('base', 400, 'var(--color-text-muted)'), lineHeight: 1.6, margin: 0 }}>
              {description}
            </p>
          </motion.section>
        )}

        {/* ── Message ── Only when a rule authored one. Never a stand-in. */}
        {rec.severityMessage && (
          <motion.p {...reveal} style={{
            ...f('base', 400), lineHeight: 1.6, margin: 0,
            backgroundColor: sev.background,
            borderRadius: 'var(--radius-lg)',
            padding: 16,
          }}>
            {rec.severityMessage}
          </motion.p>
        )}

        {/* ── Tier 1 · the recommendation ──
            The heaviest element after the score, and the only thing on this
            page that was chosen for this person. It used to render in the same
            box as "go to the list of everything", which threw that away. */}
        {hasPrimary && (
          <motion.section {...reveal}>
            <Eyebrow>Recommended for you</Eyebrow>
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border-default)',
              overflow: 'hidden',
            }}>
              <div className="flex flex-col sm:flex-row">
                <div
                  className="relative w-full overflow-hidden sm:w-2/5"
                  style={{ minHeight: 160, backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <ContentImage
                    src={programDetails?.thumbnail || programDetails?.cover_image || ''}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-center" style={{ padding: 20, gap: 10 }}>
                  <h2 style={{ ...f('lg', 500), margin: 0, lineHeight: 1.25 }}>
                    {rec.primaryAction.title || programDetails?.title}
                  </h2>

                  {/* The programme's real length, from its own record. */}
                  {programMeta && (
                    <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), margin: 0 }}>{programMeta}</p>
                  )}

                  {rec.primaryAction.body && (
                    <p style={{ ...f('sm', 400, 'var(--color-text-muted)'), lineHeight: 1.5, margin: 0 }}>
                      {rec.primaryAction.body}
                    </p>
                  )}

                  {rec.primaryAction.cta && (
                    <button
                      onClick={() => onNavigate && rec.primaryAction.programId &&
                        onNavigate(`/equip-program-onboarding?id=${rec.primaryAction.programId}`)}
                      className="w-full sm:w-fit"
                      style={{
                        marginTop: 4, padding: '12px 24px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--color-primary-default)',
                        border: 'none', cursor: 'pointer',
                        ...f('base', 500, 'var(--color-text-inverse)'),
                      }}
                    >
                      {rec.primaryAction.cta}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Tier 2 · adjacent programmes ──
            One eyebrow above the pair, not a label repeated on every card.
            "Related" is what the overlap map actually knows; it does not claim
            these were picked for this person, because they weren't. */}
        {hasRelated && (
          <motion.section {...reveal}>
            <Eyebrow>Related programs</Eyebrow>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              {relatedDetails.map((p, i) => (
                <AssessmentCard
                  key={p.id ?? i}
                  variant="compact"
                  index={i}
                  item={{
                    id: p.id,
                    title: p.title ?? p.name ?? '',
                    image: p.thumbnail ?? p.cover_image ?? p.hero_image ?? null,
                    durationLabel: typeof p.duration_days === 'number' && p.duration_days > 0
                      ? `${p.duration_days} days` : null,
                    countLabel: null,
                  }}
                  onSelect={(id) => onNavigate?.(`/equip-program-onboarding?id=${id}`)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Secondary rule-authored actions ──
            Resource and assessment rules, when an admin wrote one. Distinct
            from the nav row below: these are authored, that is chrome. */}
        {rec.secondaryActions.length > 0 && (
          <motion.section {...reveal} className="flex flex-col" style={{ gap: 8 }}>
            {rec.secondaryActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => action.route && onNavigate?.(action.route)}
                className="flex w-full items-center justify-between text-left"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16, gap: 12, cursor: action.route ? 'pointer' : 'default',
                }}
              >
                <span>
                  {action.title && (
                    <span style={{ ...f('xs', 500, 'var(--color-text-muted)'), display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {action.title}
                    </span>
                  )}
                  <span style={{ ...f('base', 500), display: 'block', marginTop: 4 }}>{action.label}</span>
                </span>
                {action.route && <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
              </button>
            ))}
          </motion.section>
        )}

        {/* ── Professional support ── */}
        {/* Authored on the rule, or absent. This block used to carry its own
            sentence — the last hardcoded copy on a page whose whole point is
            that a recommendation says what a rule authored, or says nothing.
            `severityMessage` two sections up already works this way. */}
        {rec.showProfessionalSupportNote && rec.professionalSupportNote && (
          <motion.aside {...reveal} className="flex items-start" style={{
            gap: 12, padding: 16,
            backgroundColor: 'var(--color-status-info-light)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'var(--color-status-info)',
              color: 'var(--color-text-inverse)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="info" size={14} />
            </span>
            <p style={{ ...f('sm', 400), lineHeight: 1.5, margin: 0 }}>
              {rec.professionalSupportNote}
            </p>
          </motion.aside>
        )}

        {/* ── Tier 3 · keep going ──
            App navigation, and drawn as such. These were two cards identical to
            the recommendation above, which made "Explore" mean nothing and put
            a link to the full catalogue at the same weight as the one thing
            chosen for this person. */}
        <motion.nav {...reveal} style={{
          borderTop: '1px solid var(--color-border-default)',
          paddingTop: 20,
        }}>
          <Eyebrow>Keep going</Eyebrow>
          <div className="flex flex-col sm:flex-row" style={{ gap: 4 }}>
            {[
              { label: 'Your assessments', route: '/assessment' },
              { label: 'Your journal', route: '/mood-journal' },
            ].map((link) => (
              <button
                key={link.route}
                onClick={() => onNavigate?.(link.route)}
                className="flex items-center justify-between sm:justify-start"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 12px 10px 0', gap: 6,
                  ...f('base', 500, 'var(--color-primary-default)'),
                }}
              >
                {link.label}
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </motion.nav>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center">
          <button
            onClick={onReturnToDashboard || (() => onNavigate?.('/dashboard'))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px',
              ...f('sm', 500, 'var(--color-text-muted)'),
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
