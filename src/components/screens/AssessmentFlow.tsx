import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { TextArea } from '../inputs/TextArea';
import { AssessmentQuestion } from '../organisms/AssessmentQuestion';
import { Icon } from '../Icon';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ProgressIndicator } from '../ui/progress-indicator';
import { AssessmentResults } from './AssessmentResults';
import { useOfflineSync } from '../../hooks/useOfflineSync';

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
import { DUMMY_ASSESSMENT } from '../../lib/demo-data';
import { evaluateAssessment } from '../../lib/recommendation-engine';

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
  
  const [assessment, setAssessment] = useState<Assessment | null>(initialAssessment || null);
  const [equipProgram, setEquipProgram] = useState<any>(initialAssessment ? adaptAssessmentToProgram(initialAssessment as any) : null);
  const [loading, setLoading] = useState(!initialAssessment);
  const [error, setError] = useState<string | null>(null);

  // New state for handling local results display
  const [showResults, setShowResults] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<any>(null);

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

      // Calculate Score
      const numericResponses = Object.values(responses).map(val => {
        if (typeof val === 'number') return val;
        // Try parsing string to int if it looks like a number
        if (typeof val === 'string' && !isNaN(parseInt(val))) return parseInt(val);
        return 0;
      });
      
      let score = 0;
      // 1. First, try to calculate score using the legacy map method which might fail for text options
      const basicScore = numericResponses.reduce((sum, value) => sum + value, 0);

      // 2. Enhanced Scoring: Look up values from options if basic calculation yields 0 but we have responses
      if (basicScore === 0 && Object.keys(responses).length > 0) {
        assessment.questions.forEach(q => {
          const answer = responses[q.id];
          if (answer !== undefined && answer !== null) {
            // Find option that matches answer text
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
      
      // Handle Average Type
      if (assessment.scoring.type === 'average') {
        const count = assessment.questions.length || 1;
        score = score / count;
      }
      
      // Fallback if interpretation finding fails
      const interpretation = assessment.scoring.ranges.find(range => 
        score >= range.min && score <= range.max
      ) || assessment.scoring.ranges[0] || { 
         label: 'Complete', 
         interpretation: 'Assessment completed.', 
         icon: 'success' 
      };
      
      const maxScore = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]?.max || 21;
      
      // Run Recommendation Engine
      const recommendation = evaluateAssessment(
         assessment.id,
         score,
         maxScore
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
        recommendation // Include full engine result
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
                maxScore
               );
             } else {
               // B. Queue for offline sync
               queueItem('assessment_response', {
                 assessmentId: assessment.id,
                 responses,
                 status: 'completed',
                 score,
                 interpretation,
                 severityHint: interpretation.label
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
              interpretation,
              severityHint: interpretation.label
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
      setAssessment(initialAssessment);
      setEquipProgram(adaptAssessmentToProgram(initialAssessment as any));
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

        // DEMO MODE CHECK
        if (assessmentId === DUMMY_ASSESSMENT.id) {
           console.log('⚡ Loading Demo Assessment Flow (Offline Mode)');
           setAssessment(DUMMY_ASSESSMENT as any);
           setEquipProgram(adaptAssessmentToProgram(DUMMY_ASSESSMENT as any));
           setLoading(false);
           return;
        }

        // Add timestamp to prevent caching
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments/${assessmentId}?t=${Date.now()}`,
          {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
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

          const options = rawOptions.map((opt: any) => {
            if (typeof opt === 'string') return { id: opt, text: opt, value: opt };
            if (typeof opt === 'number') return { id: String(opt), text: String(opt), value: opt };
            return {
              id: opt.id || opt.value || opt.text || opt.label,
              text: opt.text || opt.label || opt.value || opt.name,
              value: opt.value || opt.text || opt.label
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
        // FALLBACK: Use Dummy Data if fetch fails
        console.warn('⚠️ Using DUMMY assessment data due to fetch failure');
        setAssessment(DUMMY_ASSESSMENT as any);
        setEquipProgram(adaptAssessmentToProgram(DUMMY_ASSESSMENT as any));
        // setError('Failed to load assessment. Please try again.'); // Don't show error, show dummy
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();

    return () => { controller.abort(); };
  }, [assessmentId, initialAssessment]);

  // Handle results view
  if (showResults && calculatedResults) {
    return (
      <AssessmentResults 
         assessmentId={calculatedResults.assessmentId}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-md w-full text-center space-y-4">
          <Icon name="alertCircle" size={48} className="text-[var(--color-status-error)] mx-auto" />
          <h2 className="text-xl font-medium">Unable to Load</h2>
          <p className="text-[var(--color-text-muted)]">{error}</p>
          <Button onClick={onBack || (() => onNavigate?.('/assessment'))}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Ensure program exists before rendering player
  if (!equipProgram) {
    return (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="max-w-md w-full text-center space-y-4">
          <Icon name="alertCircle" size={48} className="text-[var(--color-status-error)] mx-auto" />
          <h2 className="text-xl font-medium">Assessment Not Found</h2>
          <p className="text-[var(--color-text-muted)]">The assessment data could not be initialized.</p>
          <Button onClick={onBack || (() => onNavigate?.('/assessment'))}>Return to List</Button>
        </div>
      </div>
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