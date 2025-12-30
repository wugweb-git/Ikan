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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionDirection, setQuestionDirection] = useState<'forward' | 'backward'>('forward');
  const [showMilestone, setShowMilestone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
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

        // Map backend response to frontend Assessment interface if needed
        // Assuming backend returns a compatible structure for now, but adding safety checks
        const mappedAssessment: Assessment = {
          id: fetchedAssessment.id,
          title: fetchedAssessment.title,
          description: fetchedAssessment.description || '',
          questions: fetchedAssessment.questions || [],
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

  // Filter questions based on dependencies
  const visibleQuestions = assessment.questions.filter(question => {
    if (!question.dependsOn) return true;
    
    const dependentValue = responses[question.dependsOn.questionId];
    if (question.dependsOn.value && typeof question.dependsOn.value === 'number') {
      return dependentValue >= question.dependsOn.value;
    }
    return dependentValue === question.dependsOn.value;
  });

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = visibleQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswer = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setQuestionDirection('forward');
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Show milestone celebration at 25%, 50%, 75%
      const nextProgress = ((currentQuestionIndex + 2) / totalQuestions) * 100;
      if (nextProgress === 25 || nextProgress === 50 || nextProgress === 75) {
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 2000);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setQuestionDirection('backward');
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (questionId: string, value: any) => {
    setSelectedAnswer(value);
    handleAnswer(questionId, value);
    
    // Auto-advance after a brief delay for visual feedback
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < totalQuestions - 1) {
        handleNext();
      }
    }, 800);
  };

  const calculateScore = () => {
    const numericResponses = Object.values(responses).filter(
      response => typeof response === 'number'
    ) as number[];
    
    if (assessment.scoring.type === 'sum') {
      return numericResponses.reduce((sum, value) => sum + value, 0);
    } else {
      return numericResponses.length > 0 
        ? numericResponses.reduce((sum, value) => sum + value, 0) / numericResponses.length
        : 0;
    }
  };

  const getScoreInterpretation = (score: number) => {
    return assessment.scoring.ranges.find(range => 
      score >= range.min && score <= range.max
    ) || assessment.scoring.ranges[0];
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const score = calculateScore();
      const interpretation = getScoreInterpretation(score);
      
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
            interpretation.label // Pass label as severity hint
          );

          console.log('✅ Assessment results saved successfully');
          
          // Fetch personalized recommendations
          try {
            console.log('🔍 Fetching recommendations...');
            const recommendations = await apiClient.getRecommendations();
            console.log('✨ Recommendations received:', recommendations);
            
            if (recommendations && recommendations.length > 0) {
              const topRec = recommendations[0];
              // Update results with real recommendation
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
      
      // Set local results state to show the results screen
      setCalculatedResults(results);
      setShowResults(true);

      // Call onComplete callback if provided (optional, for parent tracking)
      if (onComplete) {
        onComplete(results);
      }
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      showToast('error', 'Submission Failed', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResponses({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setCalculatedResults(null);
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return false;
    const answer = responses[currentQuestion.id];
    
    if (currentQuestion.type === 'multiple-choice') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return answer !== undefined && answer !== null && answer !== '';
  };

  const canProceed = !currentQuestion?.required || isCurrentQuestionAnswered();

  if (!currentQuestion) {
    return (
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }}
        >
          <Icon name="checkCircle" size={48} style={{ color: 'var(--color-status-success)' }} />
        </motion.div>
        <motion.h2 
          style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          Assessment Complete
        </motion.h2>
        <motion.p 
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          No questions available to display.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div 
      className={cn("relative", className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-5)',
        minWidth: 'var(--constraint-content-min)',
        maxWidth: 'var(--constraint-content-max)',
        margin: '0 auto'
      }}
      role="form"
      aria-label={`${assessment.title} - Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
    >
      {/* Milestone Celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl text-center"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-lg)'
              }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 1 }}
                className="text-4xl mb-2"
              >
                🎉
              </motion.div>
              <p style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)' 
              }}>
                Great Progress!
              </p>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)' 
              }}>
                {Math.round(progress)}% Complete
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header Section */}
      <div className="relative">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute -top-2 -left-2 md:-left-8 p-2 h-auto text-muted-foreground hover:text-foreground"
            aria-label="Exit assessment"
          >
            <Icon name="x" size={24} />
          </Button>
        )}
        <motion.div 
          className="space-y-2 pt-8 md:pt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.h1 
          style={{ 
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-semibold)', 
            color: 'var(--color-text-primary)' 
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {assessment.title}
        </motion.h1>
        <motion.p 
          style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {assessment.description}
        </motion.p>
        
        {/* Divider */}
        <motion.div 
          style={{ 
            height: '1px', 
            backgroundColor: 'var(--color-border-default)',
            margin: 'var(--spacing-4) 0'
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex justify-between items-center">
          <motion.span 
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
            key={currentQuestionIndex}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </motion.span>
          <motion.span 
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}
            key={progress}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            {Math.round(progress)}% Complete
          </motion.span>
        </div>
        <div className="relative">
          <div 
            className="h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
          <motion.div
            className="absolute top-0 left-0 h-2 rounded-full"
            style={{ 
              backgroundColor: `hsl(${120 * (progress / 100)}, 70%, 50%)`,
              backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.2) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.2) 75%)',
              backgroundSize: '20px 20px'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 25,
              duration: 0.8
            }}
          />
          {/* Sparkle effect for milestones */}
          {progress >= 25 && (
            <motion.div
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ left: '25%' }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Question Card - Using the proper AssessmentQuestion organism */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div 
          key={currentQuestionIndex}
          className={cn(
            // Apply proper focus management
            "focus-within:ring-2 focus-within:ring-offset-2",
            // Ensure accessibility
            "[&>*]:focus-visible:outline-none [&>*]:focus-visible:ring-2 [&>*]:focus-visible:ring-offset-2"
          )}
          style={{
            ringColor: 'var(--color-primary-default)',
            ringOpacity: 0.3
          }}
          initial={{ 
            opacity: 0, 
            x: questionDirection === 'forward' ? 100 : -100,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            x: questionDirection === 'forward' ? -100 : 100,
            scale: 0.95
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4
          }}
        >
        <AssessmentQuestion
          question={{
            id: currentQuestion.id,
            text: currentQuestion.text || currentQuestion.prompt,
            type: currentQuestion.type as 'scale' | 'single-choice' | 'multiple-choice',
            options: currentQuestion.options?.map((opt, index) => ({
              id: opt.id || `opt_${index}`,
              text: opt.text || opt.label,
              value: opt.value
            })),
            scaleMin: currentQuestion.scaleMin,
            scaleMax: currentQuestion.scaleMax,
            scaleLabels: currentQuestion.scaleLabels,
            required: currentQuestion.required
          }}
          value={responses[currentQuestion.id]}
          onAnswer={(questionId, value) => {
            if (currentQuestion.type === 'single-choice' || currentQuestion.type === 'scale') {
              handleAnswerSelect(questionId, value);
            } else {
              handleAnswer(questionId, value);
            }
          }}
          showNext={false} // We'll handle navigation separately
          className="w-full"
        />

        {/* Custom TextArea for text questions (not handled by AssessmentQuestion organism) */}
        {currentQuestion.type === 'text' && (
          <Card 
            style={{
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
              marginTop: 'var(--spacing-4)'
            }}
          >
            <CardContent style={{ padding: 'var(--spacing-4)' }}>
              <div className="space-y-4">
                <h2 
                  style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-md)'
                }}
                id={`question-${currentQuestion.id}`}
              >
                {currentQuestion.text}
                {currentQuestion.required && (
                  <span style={{ color: 'var(--color-status-danger)' }} aria-label="Required">
                    {' '}*
                  </span>
                )}
              </h2>
              
              <TextArea
                value={responses[currentQuestion.id] || ''}
                onChange={(value) => handleAnswer(currentQuestion.id, value)}
                placeholder="Please share your thoughts..."
                rows={4}
                maxLength={500}
                style={{
                  borderRadius: 'var(--ikan-component-border-radius)',
                  borderColor: 'var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-input)',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-base)',
                  lineHeight: 'var(--line-height-md)'
                }}
                aria-labelledby={`question-${currentQuestion.id}`}
              />
            </div>
          </CardContent>
        </Card>
      )}
      </motion.div>
    </AnimatePresence>

    {/* Navigation Footer */}
    <div 
      className="flex justify-between items-center"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 'var(--spacing-4)'
      }}
    >
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentQuestionIndex === 0}
        className="gap-2"
        style={{
          backgroundColor: 'var(--color-accent-default)',
          color: 'var(--color-accent-on)',
          borderColor: 'var(--color-border-default)',
          borderRadius: 'var(--ikan-component-border-radius)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: 'var(--font-family-base)',
          height: 'var(--ikan-component-button-height)'
        }}
      >
        <Icon name="arrowLeft" variant="outline" size={16} />
        Back
      </Button>

      {currentQuestionIndex === totalQuestions - 1 ? (
        <Button
          onClick={handleSubmit}
          disabled={!canProceed || isSubmitting}
          className="gap-2"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)',
            height: 'var(--ikan-component-button-height)'
          }}
        >
          {isSubmitting ? (
            <>
              <div 
                className={cn(
                  "motion-safe:animate-spin motion-reduce:animate-pulse",
                  "rounded-full h-4 w-4 border-b-2"
                )}
                style={{ borderColor: 'var(--color-primary-on)' }}
              />
              Submitting...
            </>
          ) : (
            <>
              <Icon name="checkCircle" variant="roundedOutline" size={16} />
              Submit Assessment
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)',
            height: 'var(--ikan-component-button-height)'
          }}
        >
          Next
          <Icon name="arrowRight" variant="outline" size={16} />
        </Button>
      )}
    </div>
  </div>
);
}