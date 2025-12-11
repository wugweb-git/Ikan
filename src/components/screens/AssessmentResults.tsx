import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { BannerNotification } from '../notifications/BannerNotification';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../ui/utils';
import { AssessmentSection } from './homepage/AssessmentSection';
import { BlogSection } from './homepage/BlogSection';
import { ErrorBoundary } from '../ErrorBoundary';
import ConsultantCard from '../../imports/ConsultantCard';

interface AssessmentResults {
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  interpretation: {
    label: string;
    description: string;
    icon: 'success' | 'warning' | 'error';
    recommendations: string[];
  };
  completedAt: string;
  equipProgramSuggestion?: {
    title: string;
    description: string;
    route: string;
  };
}

// Sample results data
const sampleResults: AssessmentResults = {
  assessmentId: 'anxiety-assessment',
  assessmentTitle: 'Anxiety Assessment (GAD-7)',
  score: 8,
  maxScore: 21,
  interpretation: {
    label: 'Mild Anxiety',
    description: 'Your responses suggest mild anxiety symptoms. While this level of anxiety is manageable, incorporating stress-reduction techniques and healthy coping strategies can help improve your overall well-being.',
    icon: 'warning',
    recommendations: [
      'Practice deep breathing exercises for 5-10 minutes daily',
      'Maintain a regular sleep schedule of 7-9 hours per night',
      'Engage in regular physical activity or exercise',
      'Consider mindfulness meditation or relaxation techniques',
      'Limit caffeine intake, especially in the afternoon and evening',
      'Connect with supportive friends, family, or community groups'
    ]
  },
  completedAt: new Date().toISOString(),
  equipProgramSuggestion: {
    title: 'Anxiety Management Program',
    description: 'A comprehensive 8-week program designed to help you develop effective coping strategies for managing anxiety.',
    route: '/equip-programs/anxiety-management'
  }
};

interface AssessmentResultsProps {
  results?: AssessmentResults;
  onNavigate?: (route: string) => void;
  onReturnToDashboard?: () => void;
  onBackToAssessments?: () => void;
  onRetakeAssessment?: () => void;
  className?: string;
}

export function AssessmentResults({ 
  results = sampleResults,
  onNavigate,
  onReturnToDashboard,
  onBackToAssessments,
  onRetakeAssessment,
  className 
}: AssessmentResultsProps) {
  const { showToast } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage <= 30) return 'var(--color-status-success)';
    if (percentage <= 70) return 'var(--color-status-warning)';
    return 'var(--color-status-danger)';
  };

  const getIconName = (icon: string) => {
    switch (icon) {
      case 'success': return 'checkCircle';
      case 'warning': return 'alertTriangle';
      case 'error': return 'alertCircle';
      default: return 'info';
    }
  };

  const getIconColor = (icon: string) => {
    switch (icon) {
      case 'success': return 'var(--color-status-success)';
      case 'warning': return 'var(--color-status-warning)';
      case 'error': return 'var(--color-status-danger)';
      default: return 'var(--color-status-info)';
    }
  };

  const scorePercentage = (results.score / results.maxScore) * 100;

  if (isLoading) {
    return (
      <div 
        className={cn("flex items-center justify-center min-h-96", className)}
        style={{
          padding: 'var(--spacing-5)',
          maxWidth: 'var(--constraint-card-max)',
          margin: '0 auto'
        }}
      >
        <div className="text-center space-y-4">
          <Icon name="loader" size={48} className="animate-spin" style={{ color: 'var(--color-primary-default)' }} />
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
            Analyzing Your Results...
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Please wait while we process your assessment.
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div 
        className={cn("space-y-4", className)}
        style={{
          padding: 'var(--spacing-5)',
          maxWidth: 'var(--constraint-card-max)',
          margin: '0 auto'
        }}
      >
        <BannerNotification
          type="error"
          title="Error Loading Results"
          message="We encountered an issue while loading your assessment results. Please try again."
          dismissible={false}
        />
        
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1500);
            }}
            className="gap-2"
            style={{
              backgroundColor: 'var(--color-accent-default)',
              color: 'var(--color-accent-on)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-5", className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-5)',
        padding: 'var(--spacing-5)',
        maxWidth: 'var(--constraint-card-max)',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          Your Results
        </h1>
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-muted)' }}>
          {results.assessmentTitle}
        </h2>
      </div>

      {/* Score Summary Card */}
      <Card 
        className={cn(
          // Motion with prefers-reduced-motion support
          "motion-safe:animate-fadeIn motion-reduce:animate-none",
          // Focus management
          "focus-within:ring-2 focus-within:ring-offset-2"
        )}
        style={{
          padding: 'var(--spacing-4)', // Use proper spacing token
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-default)',
          ringColor: 'var(--color-primary-default)',
          ringOpacity: 0.3
        }}
        role="status"
        aria-live="polite"
        aria-label={`Assessment complete. Your score is ${results.score} out of ${results.maxScore}, indicating ${results.interpretation.label}`}
      >
        <CardContent style={{ padding: 0 }}>
          <div className="text-center space-y-4">
            {/* Score Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Icon 
                  name={getIconName(results.interpretation.icon)} 
                  variant="roundedOutline"
                  size={32} 
                  style={{ color: getIconColor(results.interpretation.icon) }}
                />
                <div>
                  <div 
                    style={{ 
                      fontSize: 'var(--text-4xl)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: getScoreColor(results.score, results.maxScore),
                      lineHeight: '1'
                    }}
                  >
                    {results.score}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    out of {results.maxScore}
                  </div>
                </div>
              </div>
              
              <h3 
                style={{ 
                  fontSize: 'var(--text-xl)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  color: getIconColor(results.interpretation.icon)
                }}
              >
                {results.interpretation.label}
              </h3>
            </div>

            {/* Progress Chart */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  0
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  Your score compared to possible range
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {results.maxScore}
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={scorePercentage} 
                  className="h-3"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                />
                <div 
                  className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${scorePercentage}%`,
                    backgroundColor: getScoreColor(results.score, results.maxScore),
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
              
              <div className="text-center">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {Math.round(scorePercentage)}% of maximum score
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <div className="space-y-4">
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          What this means
        </h3>
        
        <p 
          style={{ 
            fontSize: 'var(--text-base)', 
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          {results.interpretation.description}
        </p>

        {results.interpretation.recommendations && results.interpretation.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              Recommended Actions:
            </h4>
            <ul className="space-y-2">
              {results.interpretation.recommendations.map((recommendation, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}
                >
                  <Icon 
                    name="checkCircle" 
                    variant="roundedOutline"
                    size={16} 
                    style={{ 
                      color: 'var(--color-status-success)',
                      marginTop: '2px',
                      flexShrink: 0
                    }} 
                  />
                  <span style={{ lineHeight: 'var(--line-height-md)' }}>
                    {recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Equip Program Suggestion */}
      {results.equipProgramSuggestion && (
        <Card 
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-status-info-light)',
            border: `1px solid var(--color-status-info)`
          }}
        >
          <CardContent style={{ padding: 0 }}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon 
                  name="info" 
                  variant="roundedOutline"
                  size={20} 
                  style={{ color: 'var(--color-status-info)', marginTop: '2px' }} 
                />
                <div className="flex-1">
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    Recommended Program
                  </h4>
                  <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-status-info)' }}>
                    {results.equipProgramSuggestion.title}
                  </h5>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-md)' }}>
                    {results.equipProgramSuggestion.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action Row */}
      <div 
        className="flex gap-4 justify-end"
        style={{
          display: 'flex',
          gap: 'var(--spacing-4)',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}
      >
        <Button
          onClick={() => {
            if (onReturnToDashboard) {
              onReturnToDashboard();
            } else if (onNavigate) {
              onNavigate('/dashboard');
            }
          }}
          className="gap-2"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-base)',
            minHeight: '44px' // Accessibility touch target
          }}
        >
          <Icon name="home" variant="roundedOutline" size={16} />
          Continue to Dashboard
        </Button>

        {results.equipProgramSuggestion && (
          <Button
            variant="outline"
            onClick={() => {
              if (onNavigate && results.equipProgramSuggestion) {
                onNavigate(results.equipProgramSuggestion.route);
              }
            }}
            className="gap-2"
            style={{
              backgroundColor: 'var(--color-accent-default)',
              color: 'var(--color-accent-on)',
              borderColor: 'var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)',
              minHeight: '44px' // Accessibility touch target
            }}
          >
            <Icon name="tools" variant="roundedOutline" size={16} />
            Explore Program
          </Button>
        )}
      </div>

      {/* Additional Assessment Showcase */}
      <div className="space-y-8 pt-8 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        <h3 style={{ 
          fontSize: 'var(--text-xl)', 
          fontWeight: 'var(--font-weight-medium)', 
          color: 'var(--color-text-primary)',
          textAlign: 'center'
        }}>
          Explore More Resources
        </h3>
        
        {/* Assessment Showcase */}
        <div className="space-y-6">
          <h4 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)', 
            color: 'var(--color-text-primary)'
          }}>
            Additional Assessments
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Depression Assessment',
                description: 'Evaluate symptoms of depression with our scientifically validated PHQ-9 assessment.',
                duration: '5 min',
                type: 'PHQ-9'
              },
              {
                title: 'Stress Assessment', 
                description: 'Measure your stress levels and identify triggers affecting your wellbeing.',
                duration: '7 min',
                type: 'PSS-10'
              },
              {
                title: 'Sleep Quality Assessment',
                description: 'Assess your sleep patterns and quality for better mental health.',
                duration: '4 min',
                type: 'PSQI'
              }
            ].map((assessment, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)'
                }}
                onClick={() => onNavigate && onNavigate('/assessments')}
              >
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--color-status-info)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {assessment.type}
                      </span>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-text-muted)'
                      }}>
                        {assessment.duration}
                      </span>
                    </div>
                    <h5 style={{ 
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)'
                    }}>
                      {assessment.title}
                    </h5>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--line-height-md)'
                    }}>
                      {assessment.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate('/assessment-landing');
                      }}
                    >
                      <Icon name="clipboard" size={16} />
                      Take Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Blog Showcase */}
        <div className="space-y-6">
          <h4 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)', 
            color: 'var(--color-text-primary)'
          }}>
            Recommended Reading
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Managing Anxiety: Daily Techniques',
                description: 'Practical strategies to help manage anxiety symptoms and improve daily functioning.',
                date: 'March 15, 2024',
                readTime: '8 min read'
              },
              {
                title: 'Understanding Your Assessment Results',
                description: 'Learn how to interpret mental health assessments and next steps for your journey.',
                date: 'March 10, 2024', 
                readTime: '6 min read'
              },
              {
                title: 'Building Healthy Coping Strategies',
                description: 'Develop effective coping mechanisms for stress, anxiety, and challenging emotions.',
                date: 'March 5, 2024',
                readTime: '10 min read'
              }
            ].map((article, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)'
                }}
                onClick={() => onNavigate && onNavigate('/library')}
              >
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-text-muted)'
                      }}>
                        {article.date}
                      </span>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-status-info)'
                      }}>
                        {article.readTime}
                      </span>
                    </div>
                    <h5 style={{ 
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      color: 'var(--color-text-primary)'
                    }}>
                      {article.title}
                    </h5>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--line-height-md)'
                    }}>
                      {article.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      style={{
                        height: 'var(--ikan-component-button-height)',
                        borderRadius: 'var(--ikan-component-border-radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate('/library');
                      }}
                    >
                      <Icon name="book" size={16} />
                      Read Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Consultant Showcase */}
        <div className="space-y-6">
          <h4 style={{ 
            fontSize: 'var(--text-lg)', 
            fontWeight: 'var(--font-weight-medium)', 
            color: 'var(--color-text-primary)'
          }}>
            Professional Support
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              {
                professional_id: '1',
                name: 'Dr. Sarah Johnson',
                title: 'Clinical Psychologist',
                specialties: ['Anxiety', 'Depression'],
                location: 'Mumbai',
                phone: '+91-9876543210',
                available: true
              },
              {
                professional_id: '2',
                name: 'Dr. Raj Patel',
                title: 'Counseling Psychologist',
                specialties: ['Stress Management', 'CBT'],
                location: 'Delhi',
                phone: '+91-9876543211',
                available: true
              }
            ].map((professional) => (
              <div key={professional.professional_id} className="w-full">
                <ErrorBoundary>
                  <ConsultantCard professional={professional} />
                </ErrorBoundary>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              onClick={() => onNavigate && onNavigate('/consultation')}
              className="gap-2"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                backgroundColor: 'var(--semantic-button-primary-bg)',
                color: 'var(--semantic-button-primary-fg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              <Icon name="users" size={16} />
              View All Consultants
            </Button>
          </div>
        </div>
      </div>

      {/* Completion timestamp */}
      <div className="text-center pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Assessment completed on {new Date(results.completedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}