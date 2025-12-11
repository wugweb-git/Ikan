import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { apiClient, Assessment } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, Users, CheckCircle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AssessmentCardProps {
  assessment: Assessment;
  onStartAssessment: (assessment: Assessment) => void;
  userResponses?: any;
}

function AssessmentCard({ assessment, onStartAssessment, userResponses }: AssessmentCardProps) {
  const hasCompleted = userResponses?.some((r: any) => 
    r.assessment_id === assessment.assessment_id && r.status === 'completed'
  );
  
  const hasInProgress = userResponses?.some((r: any) => 
    r.assessment_id === assessment.assessment_id && r.status === 'in_progress'
  );

  const getEstimatedTime = (questionCount: number) => {
    return `${Math.ceil(questionCount * 1.5)}-${Math.ceil(questionCount * 2)} minutes`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle 
              className="flex items-center gap-2"
              style={{ 
                fontSize: 'var(--text-lg)', 
                lineHeight: 'var(--line-height-sm)',
                color: 'var(--color-text-primary)'
              }}
            >
              <FileText size={20} style={{ color: 'var(--color-primary-default)' }} />
              {assessment.title}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              {hasCompleted && (
                <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                  <CheckCircle size={12} className="mr-1" />
                  Completed
                </Badge>
              )}
              {hasInProgress && (
                <Badge 
                  variant="secondary" 
                  style={{ 
                    fontSize: 'var(--text-xs)',
                    backgroundColor: 'var(--color-status-warning-light)',
                    color: 'var(--color-status-warning)'
                  }}
                >
                  <Clock size={12} className="mr-1" />
                  In Progress
                </Badge>
              )}
              {!hasCompleted && !hasInProgress && (
                <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                  Available
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p 
          style={{ 
            fontSize: 'var(--text-sm)', 
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          {assessment.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-1"
              style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}
            >
              <Clock size={14} />
              {getEstimatedTime(assessment.questions?.length || 0)}
            </div>
            <div 
              className="flex items-center gap-1"
              style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}
            >
              <Users size={14} />
              {assessment.questions?.length || 0} questions
            </div>
          </div>
          
          <Button 
            size="sm"
            onClick={() => onStartAssessment(assessment)}
            disabled={hasCompleted && !hasInProgress}
          >
            {hasInProgress ? 'Continue' : hasCompleted ? 'View Results' : 'Start Assessment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AssessmentModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (assessment: Assessment, responses: any, score: number) => void;
}

function AssessmentModal({ assessment, isOpen, onClose, onComplete }: AssessmentModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assessment) {
      setCurrentQuestion(0);
      setResponses({});
    }
  }, [assessment]);

  if (!assessment) return null;

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    return Object.values(responses).reduce((sum, value) => {
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const score = calculateScore();
      
      await apiClient.saveAssessmentResponse(
        assessment.assessment_id,
        responses,
        'completed',
        score
      );
      
      onComplete(assessment, responses, score);
      toast.success('Assessment completed successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;
  const canProceed = currentQ && responses[currentQ.question_id] !== undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} style={{ color: 'var(--color-primary-default)' }} />
            {assessment.title}
          </DialogTitle>
          <div className="flex items-center justify-between pt-2">
            <div 
              style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-muted)'
              }}
            >
              Question {currentQuestion + 1} of {assessment.questions.length}
            </div>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question */}
          <div className="space-y-4">
            <h3 
              style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-md)'
              }}
            >
              {currentQ?.text}
            </h3>

            {/* Response Options */}
            <div className="space-y-3">
              {currentQ?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleResponse(currentQ.question_id, option.value)}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 transition-all
                    hover:shadow-sm
                    ${responses[currentQ.question_id] === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }
                  `}
                  style={{
                    borderColor: responses[currentQ.question_id] === option.value
                      ? 'var(--color-primary-default)'
                      : 'var(--color-border-default)',
                    backgroundColor: responses[currentQ.question_id] === option.value
                      ? 'var(--color-primary-default)10'
                      : 'transparent',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`
                        w-4 h-4 rounded-full border-2 transition-colors
                        ${responses[currentQ.question_id] === option.value
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                        }
                      `}
                      style={{
                        borderColor: responses[currentQ.question_id] === option.value
                          ? 'var(--color-primary-default)'
                          : 'var(--color-border-default)',
                        backgroundColor: responses[currentQ.question_id] === option.value
                          ? 'var(--color-primary-default)'
                          : 'transparent'
                      }}
                    />
                    <span 
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-normal)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentQuestion === assessment.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Complete Assessment
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="gap-2"
                >
                  Next
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AssessmentFlowProps {
  className?: string;
}

export function AssessmentFlow({ className }: AssessmentFlowProps) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userResponses, setUserResponses] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
    if (user) {
      loadUserResponses();
    }
  }, [user]);

  const loadAssessments = async () => {
    try {
      const { assessments } = await apiClient.getAssessments();
      setAssessments(assessments || []);
    } catch (error) {
      console.error('Failed to load assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const loadUserResponses = async () => {
    try {
      const { responses } = await apiClient.getUserAssessmentResponses();
      setUserResponses(responses || []);
    } catch (error) {
      console.error('Failed to load user responses:', error);
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const handleAssessmentComplete = (assessment: Assessment, responses: any, score: number) => {
    // Refresh user responses
    loadUserResponses();
    toast.success(`Assessment completed! Your score: ${score}`);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle size={24} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>
            Please sign in to access assessments
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText size={24} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              No assessments available at this time
            </p>
          </CardContent>
        </Card>
      ) : (
        assessments.map((assessment) => (
          <AssessmentCard
            key={assessment.assessment_id}
            assessment={assessment}
            onStartAssessment={handleStartAssessment}
            userResponses={userResponses}
          />
        ))
      )}

      <AssessmentModal
        assessment={selectedAssessment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
}