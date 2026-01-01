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
import { cn } from '../ui/utils';
import { apiClient } from '../../lib/api-client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ProgressIndicator } from '../ui/progress-indicator';

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

import { AssessmentResults } from './AssessmentResults';
import { Wizard } from '../wizard/Wizard';
import { TypeformWizard } from '../wizard/TypeformWizard';
import { mapAssessmentToWizard } from '../wizard/migration-utils';

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
  
  const [assessment, setAssessment] = useState<Assessment | null>(initialAssessment || null);
  const [loading, setLoading] = useState(!initialAssessment);
  const [error, setError] = useState<string | null>(null);

  // New state for handling local results display
  const [showResults, setShowResults] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<any>(null);

  // Fetch assessment data if not provided
  useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);
      setLoading(false);
      return;
    }

    if (!assessmentId) {
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments/${assessmentId}`,
          {
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

        console.log('🔍 DEBUG: Fetched Assessment Data:', {
          id: fetchedAssessment.id,
          title: fetchedAssessment.title,
          questionsCount: fetchedAssessment.questions?.length || 0,
          questionsRaw: fetchedAssessment.questions,
          firstQuestion: fetchedAssessment.questions?.[0]
        });

        // ✅ NO FALLBACKS - Use actual data from database
        const questions = fetchedAssessment.questions || [];
        
        // If no questions, show error instead of fallback
        if (questions.length === 0) {
          console.error('❌ Assessment has no questions!', {
            assessmentId,
            fetchedData: fetchedAssessment
          });
          setError('This assessment has no questions. Please contact admin.');
          setLoading(false);
          return;
        }

        // Map backend response to frontend Assessment interface if needed
        // Assuming backend returns a compatible structure for now, but adding safety checks
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
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, initialAssessment]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

  // Error State
  if (error || !assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-6">
        <Icon name="alertCircle" size={48} className="text-destructive mb-2" />
        <h3 className="text-xl font-semibold">Unable to Load Assessment</h3>
        <p className="text-muted-foreground max-w-md">{error || "Assessment not found or unavailable."}</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  // Results State
  if (showResults && calculatedResults) {
    return (
      <AssessmentResults 
        results={calculatedResults}
        onRetakeAssessment={handleRetake}
        onBackToAssessments={onBack}
        onReturnToDashboard={onBack}
        onNavigate={onNavigate}
        className={className}
      />
    );
  }

  const handleWizardComplete = async (responses: Record<string, any>) => {
    try {
      if (!assessment) return;

      // Calculate Score (Logic copied from original)
      const numericResponses = Object.values(responses).filter(
        response => typeof response === 'number'
      ) as number[];
      
      let score = 0;
      if (assessment.scoring.type === 'sum') {
        score = numericResponses.reduce((sum, value) => sum + value, 0);
      } else {
        score = numericResponses.length > 0 
          ? numericResponses.reduce((sum, value) => sum + value, 0) / numericResponses.length
          : 0;
      }
      
      const interpretation = assessment.scoring.ranges.find(range => 
        score >= range.min && score <= range.max
      ) || assessment.scoring.ranges[0];
      
      // Calculate max possible score
      const maxScore = assessment.scoring.ranges[assessment.scoring.ranges.length - 1]?.max || 21;
      
      const results = {
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        score,
        maxScore,
        interpretation: {
          label: interpretation.label,
          description: interpretation.interpretation,
          icon: interpretation.icon,
          recommendations: [
            'Practice deep breathing exercises for 5-10 minutes daily',
            'Maintain a regular sleep schedule of 7-9 hours per night',
            'Engage in regular physical activity or exercise',
            'Consider mindfulness meditation or relaxation techniques',
            'Connect with supportive friends, family, or community groups'
          ]
        },
        responses,
        completedAt: new Date().toISOString(),
        equipProgramSuggestion: {
          title: 'Personalized Support Program',
          description: 'A comprehensive program designed to help you develop effective coping strategies.',
          route: '/equip-programs'
        }
      };

      // Save to database if user is authenticated
      if (user) {
        try {
          console.log('💾 Saving assessment results to database...');
          
          await apiClient.saveAssessmentResponse(
            assessment.id,
            responses,
            'completed',
            score,
            interpretation,
            interpretation.label 
          );

          console.log('✅ Assessment results saved successfully');
          
          // Fetch personalized recommendations
          try {
            const recommendations = await apiClient.getRecommendations();
            if (recommendations && recommendations.length > 0) {
              const topRec = recommendations[0];
              results.equipProgramSuggestion = {
                title: topRec.equip_name || topRec.programTitle || 'Recommended Program',
                description: topRec.reason || topRec.rationale || 'Based on your assessment results, we recommend this program.',
                route: `/equip-detail?id=${topRec.equip_id || topRec.programId}`
              };
            }
          } catch (recError) {
             console.error('Failed to fetch recommendations:', recError);
          }
        } catch (saveError) {
          console.error('❌ Error saving assessment results:', saveError);
          showToast('warning', 'Assessment Complete!', 'Results processed but not saved to your account.');
        }
      } 
      
      setCalculatedResults(results);
      setShowResults(true);

      if (onComplete) {
        onComplete(results);
      }
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      showToast('error', 'Submission Failed', 'Please try again.');
    }
  };

  const handleRetake = () => {
    setShowResults(false);
    setCalculatedResults(null);
  };

  // Use the NEW Typeform Wizard
  console.log('📊 Converting assessment to Typeform format...');
  
  const typeformSteps = [
    // Intro step
    {
      id: 'intro',
      type: 'intro' as const,
      title: assessment.title,
      description: assessment.description || 'Please answer the following questions honestly.'
    },
    // Question steps
    ...assessment.questions.map((q, index) => {
      console.log(`🔍 Question ${index + 1}:`, {
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax
      });

      // Map question type
      let questionType: 'single_select' | 'multi_select' | 'text' | 'long_text' | 'scale' = 'text';
      let options = undefined;

      if (q.type === 'scale') {
        questionType = 'scale';
      } else if (q.type === 'single-choice') {
        questionType = 'single_select';
        // Convert options - handle both string[] and object[]
        options = q.options?.map((opt: any, idx: number) => {
          if (typeof opt === 'string') {
            return { id: `opt_${idx}`, label: opt, value: opt };
          }
          return {
            id: opt.id || `opt_${idx}`,
            label: opt.text || opt.label || opt,
            value: opt.value !== undefined ? opt.value : opt
          };
        });
      } else if (q.type === 'multiple-choice') {
        questionType = 'multi_select';
        options = q.options?.map((opt: any, idx: number) => {
          if (typeof opt === 'string') {
            return { id: `opt_${idx}`, label: opt, value: opt };
          }
          return {
            id: opt.id || `opt_${idx}`,
            label: opt.text || opt.label || opt,
            value: opt.value !== undefined ? opt.value : opt
          };
        });
      } else if (q.type === 'text') {
        questionType = 'long_text';
      }

      console.log(`✅ Mapped question ${index + 1}:`, { questionType, optionsCount: options?.length });

      return {
        id: `q_${index}`,
        type: 'question' as const,
        title: '', // Not used in question step
        question: {
          id: q.id,
          text: q.text,
          type: questionType,
          options,
          placeholder: q.type === 'text' ? 'Type your answer...' : undefined,
          required: q.required !== false,
          scaleMin: q.scaleMin,
          scaleMax: q.scaleMax,
          scaleLabels: q.scaleLabels
        }
      };
    }),
    // Outro step
    {
      id: 'outro',
      type: 'outro' as const,
      title: 'Thank you!',
      description: "You've completed the assessment. We're analyzing your responses..."
    }
  ];

  console.log('🎨 Typeform steps created:', typeformSteps.length);

  return (
    <TypeformWizard
      steps={typeformSteps}
      onComplete={handleWizardComplete}
      onExit={onBack}
    />
  );
}