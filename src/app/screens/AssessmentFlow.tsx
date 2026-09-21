import { projectId } from '../../shared/config/supabase-info';
import { getAuthHeaders } from '../../shared/supabase-client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../ui/Icon';
import { useNotifications } from '../../shared/contexts/NotificationContext';
import { useAuth } from '../../shared/contexts/AuthContext';
import { apiClient } from '../../shared/api-client';
import { severityForSection, resolveAnswerValue } from '../lib/assessment-sections';
import { triggerCrisisSupport } from '../features/safety/CrisisSupport';

/**
 * The crisis panel no longer opens from an answer. Turned off sitewide
 * 2026-09-08, by decision.
 *
 * Kept as a switch rather than deleted, because the machinery behind it is
 * correct and hard-won: `is_risk_indicator` is read from the question itself,
 * and the threshold is the question's OWN lowest option value rather than zero
 * — without which a 1-5 scale fires the panel on "Never". Deleting that would
 * mean rediscovering it.
 *
 * `general-q5` is the only flagged question live, so this switch is the whole
 * behaviour. The keyword trigger in `MoodJournal.tsx:345` is a separate path,
 * driven by journal text rather than by a question, and is untouched.
 *
 * Module scope so it is a constant, not a value the effect has to depend on.
 */
const CRISIS_ON_ANSWER_ENABLED = false;
import { buildScoringContext, toSectionScoreResult } from '../../shared/engine/scoring-context';
import { computeScores } from '../../shared/engine/scoring-engine';
import { createActiveTimer, type ActiveTimer } from '../lib/active-time';
import { severityForMatching } from '../../supabase/functions/server/recommendation-matching.ts';
import { slugify } from '../lib/slug';
import { AssessmentResults } from './AssessmentResults';
import { useOfflineSync } from '../../shared/hooks/useOfflineSync';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Question {
  id: string;
  text: string;
  type: 'scale' | 'single-choice' | 'multiple-choice' | 'text';
  options?: Array<{ id: string; text: string; value: number | string }>;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  required?: boolean;
  dependsOn?: {
    questionId: string;
    value: any;
  };
}

interface Assessment {
  id: string;
  /**
   * Slug from the backend. Used for provenance and logging; scoring keys on
   * carried through, sectioned scoring silently falls back to deriving it from
   * the title — which breaks the moment anyone renames an assessment.
   */
  slug?: string;
  title: string;
  description: string;
  subtitle?: string;
  questions: Question[];
  scoring: {
    type: 'sum' | 'average';
    ranges: Array<{
      min: number;
      max: number;
      label: string;
      interpretation: string;
      icon: 'success' | 'warning' | 'error';
    }>;
  };
}

interface AssessmentFlowProps {
  assessmentId?: string;
  assessment?: Assessment;
  onComplete?: (results: any) => void;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

import { ProgramPlayer, PlayerResults } from '../features/player/ProgramPlayer';
import { adaptAssessmentToProgram, normalizeLegacyQuestionType } from '../lib/assessment-adapter';
import { evaluateAssessment, loadScoringProfiles, loadAdminRules, getLoadedScoringProfiles } from '../../shared/engine/recommendation-engine';

/**
 * Full-screen error card shown when an assessment can't be loaded or built.
 * Offers a retry (most failures here are transient network/lookup errors)
 * alongside the way back out.
 */
function AssessmentErrorScreen({
  title,
  message,
  onRetry,
  onBack,
  backLabel = 'Go back',
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div
        className="w-full max-w-md p-8 text-center"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div
          className="mx-auto mb-5 flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-bg-muted)',
          }}
        >
          <Icon name="alertCircle" size={28} className="text-[var(--color-text-muted)]" />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h2>

        <p
          className="mt-2"
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            margin: '8px 0 0',
          }}
        >
          {message}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
          {onRetry && (
            <Button onClick={onRetry} className="sm:min-w-[130px]">
              Try again
            </Button>
          )}
          <Button variant="outline" onClick={onBack} className="sm:min-w-[130px]">
            {backLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AssessmentFlow({  
  assessmentId,
  assessment: initialAssessment, 
  onComplete,
  onBack,
  onNavigate,
  className 
}: AssessmentFlowProps) {
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const { isOnline, queueItem } = useOfflineSync();
  
  const [assessment, setAssessment] = useState<Assessment | null>(() => {
    if (!initialAssessment) return null;
    return normalizeAssessment(initialAssessment);
  });
  const [equipProgram, setEquipProgram] = useState<any>(() => {
    if (!initialAssessment) return null;
    return adaptAssessmentToProgram(normalizeAssessment(initialAssessment) as any);
  });
  const [loading, setLoading] = useState(!initialAssessment);
  const [error, setError] = useState<string | null>(null);
  // Bumped by the error screen's Retry button to re-run the fetch effect
  const [retryNonce, setRetryNonce] = useState(0);

  // New state for handling local results display
  const [showResults, setShowResults] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<any>(null);

  // Pre-load scoring profiles and admin rules for Score/Rules Engine integration
  useEffect(() => {
    Promise.all([
      loadScoringProfiles(),
      loadAdminRules(),
    ]).catch(() => {});
  }, []);

  const handleRetake = () => {
    setShowResults(false);
    setCalculatedResults(null);
  };

  /**
   * Fires the crisis pathway once per run when a risk-indicator question is
   * answered above its own lowest option.
   *
   * Guarded by a ref rather than state: this is called on every answer, and
   * re-offering the panel each time someone touches a later question would be
   * worse than not offering it at all.
   */
  /** A partial run to resume, loaded once the assessment id is known. */
  const [draft, setDraft] = useState<{
    responses: Record<string, any>;
    current_block_index: number;
    /** Active seconds banked by earlier sittings of this same run. */
    active_seconds?: number;
    /** ISO start of the first sitting, so a resume keeps the original. */
    started_at?: string;
  } | null>(null);
  const [draftChecked, setDraftChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user || !assessment?.id) { setDraftChecked(true); return; }
    (async () => {
      const drafts = await apiClient.getAssessmentDrafts();
      if (cancelled) return;
      const mine = drafts.find((d: any) => d?.assessment_id === assessment.id);
      setDraft(mine ? {
        responses: mine.responses ?? {},
        current_block_index: mine.current_block_index ?? 0,
        active_seconds: typeof mine.active_seconds === 'number' ? mine.active_seconds : undefined,
        started_at: typeof mine.started_at === 'string' ? mine.started_at : undefined,
      } : null);
      setDraftChecked(true);
    })();
    return () => { cancelled = true; };
  }, [user, assessment?.id]);

  /**
   * Time on task, counted only while the run is actually in front of someone.
   *
   * Started once the draft lookup has settled, because a resumed run must seed
   * from the seconds already banked — starting before that would reset the
   * total to this sitting and report four minutes of work as forty seconds.
   * Nothing is captured for runs that predate this, and absent stays absent:
   * neither field is written when there is no timer.
   */
  const timerRef = useRef<ActiveTimer | null>(null);
  useEffect(() => {
    if (!draftChecked || !assessment?.id || timerRef.current) return;
    timerRef.current = createActiveTimer({
      seedSeconds: draft?.active_seconds,
      seedStartedAt: draft?.started_at,
    });
    return () => {
      timerRef.current?.stop();
      timerRef.current = null;
    };
  }, [draftChecked, assessment?.id, draft?.active_seconds, draft?.started_at]);

  const riskFiredRef = useRef(false);
  const evaluateRisk = useCallback((responses: Record<string, any>) => {
    if (!CRISIS_ON_ANSWER_ENABLED) return;
    if (riskFiredRef.current) return;
    try {
      const questions = ((assessment?.questions as any[]) ?? []);
      const flagged = questions
        .filter((q) => q?.is_risk_indicator === true)
        .some((q) => {
          const v = resolveAnswerValue(q as any, responses[q.id]);
          if (typeof v !== 'number') return false;
          // Above the question's OWN lowest option, not above zero: option
          // values are declared per assessment and are not all 0-based, so on a
          // 1-5 scale `v > 0` is true for every possible answer.
          const optionValues = (Array.isArray(q.options) ? q.options : [])
            .map((o: any, i: number) => (o && typeof o === 'object' && typeof o.value === 'number' ? o.value : i));
          const floor = optionValues.length > 0 ? Math.min(...optionValues) : 0;
          return v > floor;
        });
      if (flagged) {
        riskFiredRef.current = true;
        triggerCrisisSupport('assessment_score');
      }
    } catch (e) {
      // Never let the risk check break the run.
      console.warn('[crisis] risk-indicator check failed', e);
    }
  }, [assessment]);

  /**
   * Called by the player on every answer.
   *
   * Two jobs, both of which need the partial responses: evaluate risk
   * indicators immediately rather than at submit, and keep a draft so closing
   * the tab at question 6 of 24 does not lose the run.
   *
   * The draft write is debounced — the player emits this per keystroke on
   * free-text blocks, and a request per character would be worse than no
   * draft at all.
   */
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleProgressChange = useCallback(
    ({ currentBlockIndex, responses }: { currentBlockIndex: number; responses: Record<string, any> }) => {
      evaluateRisk(responses);

      if (!user || !assessment?.id) return;
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        apiClient
          .saveAssessmentDraft(assessment.id, {
            responses,
            currentBlockIndex,
            // Banked on every draft write, so a run abandoned mid-way still has
            // an honest figure when it is resumed.
            activeSeconds: timerRef.current?.elapsedSeconds(),
            startedAt: timerRef.current?.startedAt(),
          })
          .catch(() => {
            // A failed draft save must never interrupt the run; the answers are
            // still in memory and the submit path is unaffected.
          });
      }, 1200);
    },
    [assessment, user, evaluateRisk],
  );

  useEffect(() => () => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
  }, []);

  const handlePlayerComplete = async (playerResults: PlayerResults) => {
    /**
     * Freeze the clock before anything else in this handler.
     *
     * Scoring, the engine call and the network write all happen after this
     * point, and none of them is time the person spent answering. Reading the
     * timer at the end of the handler would fold a slow round-trip into the
     * reported duration.
     *
     * Both fields are undefined for a run with no timer, and stay undefined
     * all the way to the record — never 0.
     */
    timerRef.current?.stop();
    const startedAt = timerRef.current?.startedAt();
    const durationSeconds = timerRef.current?.elapsedSeconds();

    // 1. Calculate Results Immediately (Synchronous)
    let results: any = null;
    try {
      if (!assessment) return;
      const responses = playerResults.responses;

      // Use ProgramPlayer's computed totalScore if available (most reliable — uses weight indices directly)
      let score = 0;
      if (typeof playerResults.totalScore === 'number') {
        score = playerResults.totalScore;
      } else {
        // Fallback: Calculate score from responses
        const numericResponses = Object.values(responses).map(val => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string' && !isNaN(parseInt(val))) return parseInt(val);
          return 0;
        });
        
        const basicScore = numericResponses.reduce((sum, value) => sum + value, 0);

        // Enhanced Scoring: Look up values from options if basic calculation yields 0 but we have responses
        if (basicScore === 0 && Object.keys(responses).length > 0) {
          assessment.questions.forEach(q => {
            const answer = responses[q.id];
            if (answer !== undefined && answer !== null) {
              const matchedOption = q.options?.find(opt => {
                const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || opt.value);
                return String(optText) === String(answer);
              });
              
              if (matchedOption && typeof matchedOption === 'object' && typeof matchedOption.value === 'number') {
                score += matchedOption.value;
              } else if (typeof answer === 'number') {
                 score += answer;
              } else if (typeof answer === 'string' && !isNaN(parseInt(answer))) {
                 score += parseInt(answer);
              }
            }
          });
        } else {
          score = basicScore;
        }
      }
      
      // Handle Average Type
      if (assessment.scoring.type === 'average') {
        const count = assessment.questions.length || 1;
        score = score / count;
      }
      
      // `ranges` is legitimately null on assessments that declare no bands —
      // the General questionnaire is one — so this must not assume an array.
      const bands: any[] = Array.isArray(assessment.scoring?.ranges)
        ? [...assessment.scoring.ranges].sort((a: any, b: any) => a.min - b.min)
        : [];

      let interpretation = bands.find(range =>
        score >= range.min && score <= range.max
      );

      if (!interpretation && bands.length > 0) {
        // Out of range. Clamping to the NEAREST band matters: falling back to
        // bands[0] reported the mildest band for most instruments, so an
        // above-maximum score was shown to the user as the least severe result.
        interpretation = score < bands[0].min ? bands[0] : bands[bands.length - 1];
        console.warn(
          `[assessment] score ${score} falls outside every band for "${assessment.title}" ` +
          `(${bands[0].min}-${bands[bands.length - 1].max}); clamped to "${interpretation.label}"`
        );
      }

      interpretation = interpretation || {
         label: 'Complete',
         interpretation: 'Assessment completed.',
         icon: 'success'
      };
      
      // Compute maxScore from questions: sum of highest option value per question
      // This is more accurate than relying on scoring range boundaries
      let computedMaxScore = 0;
      if (assessment.questions && assessment.questions.length > 0) {
        assessment.questions.forEach((q: any) => {
          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            // `q.scoring` is an option-text -> weight map and is the
            // authoritative source; it is populated on all live questions.
            // `opt.value` only exists on object-shaped options, and every
            // option in this database is a plain string — so reading it alone
            // always produced 0 and the denominator fell through to a band
            // ceiling (or the literal 21 below).
            let maxVal = 0;
            if (q.scoring && typeof q.scoring === 'object') {
              for (const w of Object.values(q.scoring)) {
                if (typeof w === 'number') maxVal = Math.max(maxVal, w);
              }
            }
            if (maxVal === 0) {
              q.options.forEach((opt: any) => {
                if (typeof opt === 'object' && typeof opt.value === 'number') {
                  maxVal = Math.max(maxVal, opt.value);
                }
              });
            }
            computedMaxScore += maxVal;
          }
        });
      }
      
      // Use computed max from questions if available, otherwise fall back to scoring range max
      let maxScore = computedMaxScore > 0
        ? computedMaxScore
        : (bands[bands.length - 1]?.max || 21);

      // Per-scale breakdown, computed from the assessment's own `scores[]`
      // spec. There is one scoring path: spec or nothing. The SECTION_PRESETS
      // fallback and the file behind it were deleted 2026-09-03 — it carried
      // pre-rescale bands, and falling back to it mis-banded a live Sleep
      // result of 18 as "Poor Sleep" when both live sources say "Healthy".
      const presetKey = assessment.slug || slugify(assessment.title || '');

      /**
       * Score from the assessment's own `scores[]` spec when one exists and its
       * profiles have loaded; otherwise from the code presets.
       *
       * The spec is the source of truth: it carries declared option values,
       * explicit reverse flags and a `severity_ref` on every band. If its
       * profiles cannot be resolved, no breakdown is produced — a wrong
       * breakdown is worse than none, which is what the old fallback proved.
       */
      const spec = Array.isArray((assessment as any).scores) ? (assessment as any).scores : null;
      const loadedProfiles = getLoadedScoringProfiles();
      const specProfilesResolve = !!spec && spec.length > 0 && !!loadedProfiles
        && spec.every((sc: any) => sc?.profile_id && loadedProfiles[sc.profile_id]);

      let sectionScores: any;
      if (specProfilesResolve) {
        const built = buildScoringContext({
          questions: (assessment.questions as any[]) ?? [],
          scores: spec,
          profiles: loadedProfiles as any,
        });
        sectionScores = toSectionScoreResult(computeScores(built.ctx, responses));
      } else {
        // The SECTION_PRESETS fallback is gone (2026-09-03) along with the file
        // that held it. There is one scoring path now: the assessment's own
        // scores[] spec. When it cannot run, produce NO breakdown rather than a
        // wrong one — the presets carried pre-rescale bands, and falling back to
        // them is what mis-banded a live Sleep result as "Poor Sleep" at 18.
        console.error(
          `[assessment] "${presetKey}" cannot be scored from its spec: ` +
          `${!spec ? 'no scores[] on the record' : !loadedProfiles ? 'scoring profiles did not load' : 'a referenced profile is missing'}. ` +
          `No section breakdown will be produced.`
        );
        sectionScores = { sectioned: false, sections: [] };
      }

      // Risk indicator, at submit. Also evaluated at answer time — see
      // `evaluateRiskAt` — so endorsing the flagged item at question 6 of 24
      // does not wait for eighteen more answers before anything happens.
      // Both, not either: an answer-time check can be missed if a user edits a
      // previous answer, and the submit check is the backstop.
      evaluateRisk(responses);

      if (!sectionScores.sectioned) {
        // Loud, because a silent miss here is what produced 133 results with
        // no breakdown and no signal that anything was wrong.
        console.warn(
          `[assessment] No section preset resolved for "${presetKey}" — ` +
          `section_scores will be saved as null for this result.`
        );
      }

      // Five assessments (Anxiety, Depression, Stress, Sleep, Balance) aren't
      // multi-scale bundles — they're single instruments whose stored
      // scoring.ranges is null and whose real result was never shown at all
      // (the player fell through to the generic "Assessment completed"
      // fallback above). Their presets declare zero named sections but do
      // declare an overall: scope the sum to only the clinically-scored
      // items, apply reversal where the scale mixes wording direction (see
      // Balance), and use real bands. Report-card assessments (General: 5
      // sections; Burnout: 4) are untouched here — sections.length >= 2 for
      // both, so this never fires for them, and their score/maxScore stay the
      // existing flat legacy sum used for iKAN aggregation, unchanged.
      if (sectionScores.sectioned && sectionScores.sections.length < 2 && sectionScores.overall) {
        const o = sectionScores.overall;
        score = o.value;
        maxScore = o.max;
        if (o.band) {
          const sev = severityForSection(o);
          interpretation = {
            label: o.band.label,
            interpretation: o.band.description ?? `${o.label}: ${o.band.label}.`,
            icon: sev === 'low' ? 'success' : sev === 'moderate' ? 'warning' : 'error',
          };
        }
      }

      // Run Recommendation Engine — pass scoring profile if assessment has one linked
      // Rules match on the assessment's CATEGORY slug. This used to pass
      // `assessment.id` as the first argument, which was then lower-cased and
      // compared against a rule's category — an `asm_…` id never matches one.
      /**
       * Report the spec's own overall, not the legacy flat sum.
       *
       * These are two different numbers whenever a profile does not band in
       * raw-sum space. Burnout's bands are 1-5 means; its legacy sum was
       * 60/115. The result showed four "Low" bands and a mean of 2.61 while
       * the engine was handed 60, found no band, and fell through to a 52%
       * guess reading "Some areas need attention". One result, two numbers.
       */
      const specOverall = sectionScores?.overall;
      const reportedScore = specOverall ? specOverall.value : score;
      const reportedMax = specOverall ? specOverall.max : maxScore;

      const recommendation = evaluateAssessment({
        slug: (assessment as any).slug,
        category: (assessment as any).category,
        score: reportedScore,
        maxScore: reportedMax,
        // The severity from the band the user is actually shown, so the
        // recommendation cannot disagree with the result. `scoring_profile_id`
        // is deliberately not passed: re-deriving from it needs the score and
        // the bands to be in the same units, which is the assumption that
        // broke here.
        // The overall band when the instrument declares one, else the worst of
        // its sections. General has five independent scales and no overall, so
        // it resolved null here and never reached the rule table at all —
        // three of seven assessments were in that state.
        severityLevel: severityForMatching(sectionScores as any),
      });

      // Construct Results Object
      results = {
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        score: reportedScore,
        maxScore: reportedMax,
        interpretation: {
          label: interpretation.label,
          description: interpretation.interpretation,
          icon: interpretation.icon,
          recommendations: recommendation.secondaryActions.map(a => a.title) // Use engine recommendations
        },
        responses,
        completedAt: new Date().toISOString(),
        // Time on task, so the screen shown straight after submitting can
        // report it. It was already being written to the record and then not
        // handed to the view that renders immediately afterwards.
        durationSeconds,
        recommendation, // Include full engine result
        // Must be JSON-serialisable: the standalone /assessment-results route
        // hydrates only from the sessionStorage blob written below.
        sectionScores: sectionScores.sectioned ? sectionScores : undefined
      };

      // 2. Set State to Show Results Immediately (Optimistic UI)
      try {
        sessionStorage.setItem('lastAssessmentResults', JSON.stringify(results));
      } catch (e) {
        // Ignore storage errors
      }
      setCalculatedResults(results);
      setShowResults(true);

      if (onComplete) {
        onComplete(results);
      }

      // 3. Save Data & Fetch Specific Recommendations in Background
      if (user) {
        // Run as side effects - do not await/block the UI
        (async () => {
          try {
             if (isOnline) {
               // A. Save Response directly
               const saved = await apiClient.saveAssessmentResponse(
                assessment.id,
                responses,
                'completed',
                reportedScore,
                interpretation,
                interpretation.label,
                reportedMax,
                sectionScores.sectioned ? sectionScores : undefined,
                assessment.slug,
                // The full engine result. Without this the stored record keeps
                // only a flattened interpretation string and the result can
                // never be rebuilt after the tab closes.
                recommendation,
                // Time on task. Undefined when untimed — the route omits the
                // fields entirely rather than storing a zero.
                { startedAt, durationSeconds }
               );
               // Remember which record this screen corresponds to, so the
               // result becomes linkable and survives a refresh. sessionStorage
               // is now only an optimisation for the moment after submit — if
               // this id resolves, the stored record wins.
               // The run is stored; the draft must not survive it or the card
               // would offer to resume a completed assessment.
               apiClient.deleteAssessmentDraft(assessment.id);
               const savedId = (saved as any)?.result?.id;
               if (savedId) {
                 try { sessionStorage.setItem('lastAssessmentResultId', savedId); } catch { /* ignore */ }
               }
             } else {
               // B. Queue for offline sync
               queueItem('assessment_response', {
                 assessmentId: assessment.id,
                 responses,
                 status: 'completed',
                 score: reportedScore,
                 maxScore: reportedMax,
                 interpretation,
                 severityHint: interpretation.label,
                 sectionScores: sectionScores.sectioned ? sectionScores : undefined,
                 slug: assessment.slug,
                 engineResult: recommendation,
                 startedAt,
                 durationSeconds
               });
               showToast('info', 'Saved Locally', 'Your results will sync when you are back online.');
             }
          } catch (saveError) {
            console.error('Background save failed, queuing offline:', saveError);
            // Fallback to offline queue
            queueItem('assessment_response', {
              assessmentId: assessment.id,
              responses,
              status: 'completed',
              score: reportedScore,
              maxScore: reportedMax,
              interpretation,
              severityHint: interpretation.label,
              sectionScores: sectionScores.sectioned ? sectionScores : undefined,
              slug: assessment.slug,
              engineResult: recommendation,
              startedAt,
              durationSeconds
            });
            showToast('warning', 'Saved Locally', 'Your results are saved locally and will sync later.');
          }
        })();
      } 
      
    } catch (error) {
      console.error('Error processing assessment:', error);
      showToast('error', 'Error', 'Failed to process results. Please try again.');
    }
  };

  // Fetch assessment data if not provided
  useEffect(() => {
    if (initialAssessment) {
      setAssessment(normalizeAssessment(initialAssessment));
      setEquipProgram(adaptAssessmentToProgram(normalizeAssessment(initialAssessment) as any));
      setLoading(false);
      return;
    }

    if (!assessmentId) {
      // Was: bail with both equipProgram and error null, which is the ONE
      // combination that renders a blank card with no explanation. A caller
      // reaching the player without a target is a bug in the caller, and it
      // should say so rather than look like an empty assessment.
      console.warn('[assessment] AssessmentFlow reached with no assessmentId — check the navigation that produced this URL.');
      setError('No assessment was specified. Please pick one from the assessments list.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add timestamp to prevent caching
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments/${assessmentId}?t=${Date.now()}`,
          {
            signal: controller.signal,
            headers: await getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load assessment');
        }

        const data = await response.json();
        const fetchedAssessment = data.assessment;

        // Validations...
        const rawQuestions = fetchedAssessment.questions || [];
        if (rawQuestions.length === 0) {
          setError('This assessment has no questions. Please contact admin.');
          setLoading(false);
          return;
        }

        // Map questions robustly to handle potential backend variations
        const questions: Question[] = rawQuestions.map((q: any) => {
          // 1. Resolve Question Text
          const text = q.text || q.question_text || q.title || q.prompt || q.label || 'Untitled Question';

          // 2. Resolve Options (handle strings, objects, stringified JSON)
          let rawOptions = q.options || q.choices || q.answers || q.items || [];
          
          // Handle case where options might be a stringified JSON
          if (typeof rawOptions === 'string') {
            try {
              rawOptions = JSON.parse(rawOptions);
            } catch (e) {
              console.warn('Failed to parse options string:', rawOptions);
              rawOptions = [];
            }
          }

          if (!Array.isArray(rawOptions)) {
            rawOptions = [];
          }

          const options = rawOptions.map((opt: any, optIndex: number) => {
            if (typeof opt === 'string') return { id: opt, text: opt, value: optIndex };
            if (typeof opt === 'number') return { id: String(opt), text: String(opt), value: opt };
            // Use nullish coalescing (??) instead of || to preserve 0 as a valid numeric value
            const optValue = (typeof opt.value === 'number') ? opt.value : (opt.score != null ? Number(opt.score) : optIndex);
            return {
              id: opt.id || String(opt.value ?? '') || opt.text || opt.label,
              text: opt.text || opt.label || String(opt.value ?? '') || opt.name,
              value: optValue
            };
          });

          // 3. Normalize Type — one shared map, see assessment-adapter.ts
          const type = normalizeLegacyQuestionType(q.type);

          return {
            ...q,
            text,
            type,
            options
          };
        });

        // Spread first, then override only what needs mapping.
        //
        // This literal used to hand-list its fields, and every field added to
        // the schema since has been silently dropped here by omission — first
        // `slug`, then `scoring_profile_id`, then `scores` and `category`.
        // Each failure looked like something else: no sectioned breakdown, no
        // severity, no recommendation. Nothing errors, because an absent field
        // is indistinguishable from an unset one.
        //
        // `category` and `scoring_profile_id` are what the recommendation join
        // and the band lookup key on; `scores` is the scoring spec. Listing
        // fields by hand is what broke them, so do not go back to it.
        const mappedAssessment: Assessment = {
          ...fetchedAssessment,
          id: fetchedAssessment.id,
          slug: fetchedAssessment.slug,
          title: fetchedAssessment.title,
          description: fetchedAssessment.description || '',
          subtitle: fetchedAssessment.subtitle || fetchedAssessment.sub_title || '',
          questions: questions,
          scoring: fetchedAssessment.scoring || {
            type: 'sum',
            ranges: [
              { min: 0, max: 100, label: 'Completed', interpretation: 'Assessment completed.', icon: 'success' }
            ]
          }
        };

        // Loud, because the whole scoring rollout is inert without these and
        // the failure is otherwise invisible — it just quietly scores the old way.
        if (!Array.isArray((mappedAssessment as any).scores) || !(mappedAssessment as any).category) {
          console.warn(
            `[assessment] "${mappedAssessment.slug}" reached the player without ` +
            `${!Array.isArray((mappedAssessment as any).scores) ? 'scores[] ' : ''}` +
            `${!(mappedAssessment as any).category ? 'category ' : ''}` +
            `— scoring falls back to presets and no recommendation rule can match.`
          );
        }

        setAssessment(mappedAssessment);
        // Convert to Unified Program
        setEquipProgram(adaptAssessmentToProgram(mappedAssessment as any));

      } catch (err: any) {
        if (err?.name === 'AbortError') return; // Component unmounted — ignore
        console.error('Error fetching assessment:', err);
        setError('Failed to load assessment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();

    return () => { controller.abort(); };
  }, [assessmentId, initialAssessment, retryNonce]);

  // Handle results view
  if (showResults && calculatedResults) {
    return (
      <AssessmentResults 
         assessmentId={calculatedResults.assessmentId}
       sectionScores={calculatedResults.sectionScores}
         score={calculatedResults.score}
         maxScore={calculatedResults.maxScore}
         recommendation={calculatedResults.recommendation}
         onRetake={handleRetake} 
         onNavigate={onNavigate || (() => {})} 
         className={className}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <LoadingSpinner message="Loading assessment..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <AssessmentErrorScreen
        title="We couldn't open this assessment"
        message={error}
        onRetry={() => setRetryNonce(n => n + 1)}
        onBack={onBack || (() => onNavigate?.('/assessment'))}
        backLabel="Back to assessments"
      />
    );
  }

  // Ensure program exists before rendering player
  if (!equipProgram) {
    return (
      <AssessmentErrorScreen
        title="Assessment not available"
        message="We couldn't set up this assessment. It may have been moved or unpublished."
        onRetry={assessmentId ? () => setRetryNonce(n => n + 1) : undefined}
        onBack={onBack || (() => onNavigate?.('/assessment'))}
        backLabel="Back to assessments"
      />
    );
  }

  // The player reads `initialResponses` on mount only, so it must not render
  // until the draft lookup has settled — otherwise a resumable run silently
  // starts from question one.
  if (!draftChecked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <p style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--color-bg-card)' }}>
       <ProgramPlayer
         program={equipProgram}
         initialDay={1}
         initialResponses={draft?.responses}
         onComplete={handlePlayerComplete}
         onProgressChange={handleProgressChange}
         onExit={onBack || (() => {})}
         mode="live"
       />
    </div>
  );
}

function normalizeAssessment(assessment: Assessment): Assessment {
  return {
    ...assessment,
    questions: assessment.questions.map(q => {
      // Resolve options to ensure all have numeric values
      const rawOptions = q.options || [];

      // Handle raw string arrays (from KV)
      const options = (rawOptions as any[]).map((opt: any, idx: number) => {
        if (typeof opt === 'string') return { id: opt, text: opt, value: idx };
        if (typeof opt === 'number') return { id: String(opt), text: String(opt), value: opt };
        const optValue = (typeof opt.value === 'number') ? opt.value : (opt.score != null ? Number(opt.score) : idx);
        return {
          id: opt.id || String(opt.value ?? '') || opt.text || opt.label,
          text: opt.text || opt.label || String(opt.value ?? '') || opt.name || String(idx),
          value: optValue
        };
      });

      // Normalize type — the same shared map as above
      const type = normalizeLegacyQuestionType(q.type) as Question['type'];

      return { ...q, text: q.text || (q as any).question_text || (q as any).title || 'Untitled', type, options };
    })
  };
}