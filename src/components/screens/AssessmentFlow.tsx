import { projectId } from '../../utils/supabase/info';
import { getAuthHeaders } from '../../lib/supabase-client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';
import { computeSectionScores, severityForSection, resolveAnswerValue } from '../../lib/assessment-sections';
import { triggerCrisisSupport } from '../safety/CrisisSupport';
import { SECTION_PRESETS } from '../../lib/assessment-section-presets';
import { slugify } from '../../lib/slug';
import { ProgressIndicator } from '../ui/progress-indicator';
import { AssessmentResults } from './AssessmentResults';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { LoadingSpinner } from '../LoadingSpinner';

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

import { ProgramPlayer, PlayerResults } from '../player/ProgramPlayer';
import { adaptAssessmentToProgram } from '../../lib/assessment-adapter';
import { evaluateAssessment, loadScoringProfiles, loadAdminRules } from '../../lib/recommendation-engine';

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

  const handlePlayerComplete = async (playerResults: PlayerResults) => {
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
      
      // Fallback if interpretation finding fails
      let interpretation = assessment.scoring.ranges.find(range =>
        score >= range.min && score <= range.max
      ) || assessment.scoring.ranges[0] || {
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
            let maxVal = 0;
            q.options.forEach((opt: any) => {
              if (typeof opt === 'object' && typeof opt.value === 'number') {
                maxVal = Math.max(maxVal, opt.value);
              }
            });
            computedMaxScore += maxVal;
          }
        });
      }
      
      // Use computed max from questions if available, otherwise fall back to scoring range max
      let maxScore = computedMaxScore > 0
        ? computedMaxScore
        : (assessment.scoring.ranges[assessment.scoring.ranges.length - 1]?.max || 21);

      // Per-scale breakdown, when this assessment declares sections or has a
      // corrected-scoring preset. Falls back to the presets keyed by slug until
      // sections/overrides are authored directly in admin. Returns
      // { sectioned: false } for ordinary single-score assessments with no
      // preset at all, so the existing presentation is untouched for those.
      // Resolve the preset by slug, falling back to the slugified title.
      //
      // Why the fallback: every result saved since this shipped (2026-08-07)
      // carries `section_scores` as a KEY with a NULL value — 10 of them, and
      // none populated. The backend writes `data.sectionScores ?? null`, so a
      // null value means the client sent nothing, which means `sectioned` was
      // false, which means this lookup missed. The stored slugs do match the
      // SECTION_PRESETS keys exactly, so the miss is an absent `slug` on the
      // assessment object reaching this scope, not a wrong one. Deriving it
      // from the title costs nothing and closes that hole; if slug is present
      // the fallback never fires.
      const presetKey =
        (assessment as any).slug || slugify((assessment as any).title || '');
      const sectionConfig =
        (assessment as any).sections
          ? assessment
          : { ...assessment, ...(SECTION_PRESETS[presetKey] ?? {}) };
      const sectionScores = computeSectionScores(sectionConfig as any, responses);

      // Risk indicator. The presets declare `riskIndicatorQuestionIds` — for the
      // General questionnaire that is block-1773736126142, PHQ-9 item 9,
      // "Thoughts that you would be better off dead or of hurting yourself".
      // The field was declared and then never read anywhere: assessment-sections.ts
      // has no reference to it, so a non-zero answer to the single most
      // clinically urgent question in the product did nothing at all.
      //
      // Any answer above the lowest option offers the crisis panel. Scoring and
      // saving continue unchanged — this is offered alongside the result, never
      // instead of it.
      try {
        const riskIds: string[] = (sectionConfig as any).riskIndicatorQuestionIds ?? [];
        const flagged = riskIds.some((qid) => {
          const q = (assessment.questions as any[]).find((x) => x.id === qid);
          if (!q) return false;
          const v = resolveAnswerValue(q as any, responses[qid]);
          return typeof v === 'number' && v > 0;
        });
        if (flagged) triggerCrisisSupport('assessment_score');
      } catch (e) {
        // Never let the risk check break scoring.
        console.warn('[crisis] risk-indicator check failed', e);
      }

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
      const recommendation = evaluateAssessment(
         assessment.id,
         score,
         maxScore,
         (assessment as any).scoring_profile_id || (assessment as any).scoringProfileId
      );

      // Construct Results Object
      results = {
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        score,
        maxScore,
        interpretation: {
          label: interpretation.label,
          description: interpretation.interpretation,
          icon: interpretation.icon,
          recommendations: recommendation.secondaryActions.map(a => a.title) // Use engine recommendations
        },
        responses,
        completedAt: new Date().toISOString(),
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
               await apiClient.saveAssessmentResponse(
                assessment.id,
                responses,
                'completed',
                score,
                interpretation,
                interpretation.label,
                maxScore,
                sectionScores.sectioned ? sectionScores : undefined
               );
             } else {
               // B. Queue for offline sync
               queueItem('assessment_response', {
                 assessmentId: assessment.id,
                 responses,
                 status: 'completed',
                 score,
                 maxScore,
                 interpretation,
                 severityHint: interpretation.label,
                 sectionScores: sectionScores.sectioned ? sectionScores : undefined
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
              score,
              maxScore,
              interpretation,
              severityHint: interpretation.label,
              sectionScores: sectionScores.sectioned ? sectionScores : undefined
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

          // 3. Normalize Type
          let type = q.type;
          // Map backend specific types to our internal types
          const typeMap: Record<string, string> = {
            'multiple_choice': 'multiple-choice',
            'multiselect': 'multiple-choice',
            'single_choice': 'single-choice',
            'select': 'single-choice',
            'radio': 'single-choice',
            'mcq': 'single-choice',
            'rating': 'scale',
            'scale': 'scale',
            'text': 'text',
            'input': 'text',
            'textarea': 'text'
          };
          
          if (typeMap[type]) {
            type = typeMap[type];
          }

          return {
            ...q,
            text,
            type,
            options
          };
        });

        const mappedAssessment: Assessment = {
          id: fetchedAssessment.id,
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

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--color-bg-card)' }}>
       <ProgramPlayer
         program={equipProgram}
         initialDay={1}
         onComplete={handlePlayerComplete}
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
      let rawOptions = q.options || [];

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

      // Normalize type
      const typeMap: Record<string, string> = {
        'multiple_choice': 'multiple-choice', 'multiselect': 'multiple-choice',
        'single_choice': 'single-choice', 'select': 'single-choice',
        'radio': 'single-choice', 'mcq': 'single-choice',
        'rating': 'scale', 'scale': 'scale',
        'text': 'text', 'input': 'text', 'textarea': 'text'
      };
      const type = (typeMap[q.type] || q.type) as Question['type'];

      return { ...q, text: q.text || (q as any).question_text || (q as any).title || 'Untitled', type, options };
    })
  };
}