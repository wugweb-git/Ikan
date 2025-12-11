import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';
import { ArrowLeft, Clock, FileText, Tag, CheckCircle, Play } from 'lucide-react';

interface AssessmentLandingProps {
  onStartAssessment?: () => void;
  onBack?: () => void;
}

export function AssessmentLanding({ onStartAssessment, onBack }: AssessmentLandingProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2 p-0 h-auto hover:bg-transparent"
        style={{
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-normal)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        <ArrowLeft size={16} />
        Back to Assessments
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h1 
          style={{ 
            fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)',
            lineHeight: 'var(--line-height-sm)',
            margin: 0
          }}
        >
          Generalized Anxiety Disorder Scale (GAD-7)
        </h1>
        <p 
          style={{ 
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-normal)',
            fontFamily: 'var(--font-family-base)',
            lineHeight: 'var(--line-height-md)',
            margin: 0
          }}
        >
          Learn more about this assessment before you begin
        </p>
      </div>

      {/* Assessment Card */}
      <Card 
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-default)',
          padding: 0
        }}
      >
        <CardHeader 
          style={{
            padding: 'var(--spacing-6)',
            paddingBottom: 'var(--spacing-4)'
          }}
        >
          <CardTitle 
            className="flex items-center gap-3"
            style={{ 
              fontSize: 'var(--text-lg)', 
              lineHeight: 'var(--line-height-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-medium)',
              margin: 0
            }}
          >
            <div 
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-status-warning-light)' }}
            >
              <FileText 
                size={16} 
                style={{ color: 'var(--color-status-warning)' }} 
              />
            </div>
            Generalized Anxiety Disorder Scale (GAD-7)
          </CardTitle>
        </CardHeader>
        
        <CardContent 
          className="space-y-6"
          style={{
            padding: 'var(--spacing-6)',
            paddingTop: 0
          }}
        >
          {/* About This Assessment */}
          <div className="space-y-3">
            <h3 style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              lineHeight: 'var(--line-height-sm)',
              margin: 0
            }}>
              About This Assessment
            </h3>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-normal)',
              lineHeight: 'var(--line-height-md)',
              margin: 0
            }}>
              7-item scale widely used to measure severity of anxiety symptoms over the past two weeks.
            </p>
          </div>

          {/* Assessment Details */}
          <div className="space-y-4">
            <h3 style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              lineHeight: 'var(--line-height-sm)',
              margin: 0
            }}>
              Assessment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time Required */}
              <div 
                className="flex items-center gap-3 p-4 rounded"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    lineHeight: 'var(--line-height-sm)',
                    margin: 0
                  }}>
                    Time Required
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    lineHeight: 'var(--line-height-md)',
                    margin: 0
                  }}>
                    2 minutes
                  </p>
                </div>
              </div>

              {/* Questions */}
              <div 
                className="flex items-center gap-3 p-4 rounded"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <FileText size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    lineHeight: 'var(--line-height-sm)',
                    margin: 0
                  }}>
                    Questions
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    lineHeight: 'var(--line-height-md)',
                    margin: 0
                  }}>
                    7 questions
                  </p>
                </div>
              </div>

              {/* Category */}
              <div 
                className="flex items-center gap-3 p-4 rounded"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-status-warning-light)' }}
                >
                  <Tag size={16} style={{ color: 'var(--color-status-warning)' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    lineHeight: 'var(--line-height-sm)',
                    margin: 0
                  }}>
                    Category
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-status-warning)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    lineHeight: 'var(--line-height-md)',
                    margin: 0
                  }}>
                    Anxiety
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="space-y-4">
            <h3 style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              lineHeight: 'var(--line-height-sm)',
              margin: 0
            }}>
              What to Expect
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--color-status-success-light)' }}
                >
                  <CheckCircle size={12} style={{ color: 'var(--color-status-success)' }} />
                </div>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: 'var(--line-height-md)'
                }}>
                  Answer questions honestly for the most accurate results
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--color-status-success-light)' }}
                >
                  <CheckCircle size={12} style={{ color: 'var(--color-status-success)' }} />
                </div>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: 'var(--line-height-md)'
                }}>
                  Take your time - there's no rush to complete
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--color-status-success-light)' }}
                >
                  <CheckCircle size={12} style={{ color: 'var(--color-status-success)' }} />
                </div>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: 'var(--line-height-md)'
                }}>
                  Your responses are private and secure
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--color-status-success-light)' }}
                >
                  <CheckCircle size={12} style={{ color: 'var(--color-status-success)' }} />
                </div>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: 'var(--line-height-md)'
                }}>
                  Receive personalized insights and recommendations
                </span>
              </div>
            </div>
          </div>

          {/* Begin Assessment Button */}
          <div className="pt-4">
            <Button 
              onClick={onStartAssessment}
              className="w-full gap-2 h-12"
              style={{
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-primary-on)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Play size={16} />
              Begin Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}