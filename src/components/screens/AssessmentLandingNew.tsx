import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArrowLeft, Clock, FileText, Tag, Play } from 'lucide-react';

// Use proper screen component instead of Figma import
import { AssessmentDetail } from './AssessmentDetail';

interface AssessmentLandingNewProps {
  onStartAssessment?: () => void;
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export function AssessmentLandingNew({ onStartAssessment, onBack, onNavigate }: AssessmentLandingNewProps) {
  const isMobile = useIsMobile();
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Assessment details for modal (this would typically come from an API)
  const assessmentDetails = {
    title: 'Anxiety Assessment',
    description: 'This assessment helps identify symptoms of anxiety and their severity.',
    category: 'Anxiety',
    estimatedTime: '5 minutes',
    questionCount: '10 questions',
    instructions: [
      'Find a quiet place where you can focus without distractions',
      'Answer honestly - there are no right or wrong answers',
      'This assessment will take approximately 5 minutes to complete',
      'You can pause and resume the assessment later if needed'
    ]
  };

  // Handle starting assessment from modal
  const handleStartAssessmentFromModal = () => {
    setShowAssessmentModal(false);
    if (onStartAssessment) {
      onStartAssessment();
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Back button overlay for mobile */}
      {onBack && isMobile && (
        <div 
          className="absolute z-50"
          style={{
            top: 'var(--ikan-component-spacing-default)',
            left: 'var(--ikan-component-spacing-default)'
          }}
        >
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="mobile-button touch-target backdrop-blur-sm"
            style={{
              width: 'var(--ikan-touch-target-min)',
              height: 'var(--ikan-touch-target-min)',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ArrowLeft 
              className="w-5 h-5" 
              style={{ color: 'var(--color-text-primary)' }}
            />
          </Button>
        </div>
      )}
      
      {/* Main Assessment Detail Component */}
      <AssessmentDetail onNavigate={onNavigate} />
      
      {/* Assessment Details Modal */}
      <Dialog open={showAssessmentModal} onOpenChange={setShowAssessmentModal}>
        <DialogContent 
          className="w-full max-w-md mx-auto"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: `1px solid var(--color-border-light)`,
            borderRadius: 'var(--ikan-component-border-radius)',
            padding: 'var(--spacing-6)',
          }}
        >
          <DialogHeader className="space-y-4">
            <DialogTitle 
              style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                textAlign: 'center'
              }}
            >
              {assessmentDetails.description}
            </DialogTitle>
          </DialogHeader>

          {/* Assessment Info Grid */}
          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: 'var(--color-status-info-light)' }}
              >
                <Tag size={20} style={{ color: 'var(--color-status-info)' }} />
              </div>
              <div>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-regular)'
                }}>
                  Category
                </p>
                <p style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  {assessmentDetails.category}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: 'var(--color-status-info-light)' }}
              >
                <Clock size={20} style={{ color: 'var(--color-status-info)' }} />
              </div>
              <div>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-regular)'
                }}>
                  Estimated Time
                </p>
                <p style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  {assessmentDetails.estimatedTime}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: 'var(--color-status-info-light)' }}
              >
                <FileText size={20} style={{ color: 'var(--color-status-info)' }} />
              </div>
              <div>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-regular)'
                }}>
                  Questions
                </p>
                <p style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  {assessmentDetails.questionCount}
                </p>
              </div>
            </div>
          </div>

          {/* Before You Begin Section */}
          <div className="space-y-4">
            <h3 style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)'
            }}>
              Before You Begin:
            </h3>
            <ul className="space-y-3">
              {assessmentDetails.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-text-muted)' }}
                  />
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)',
                    fontWeight: 'var(--font-weight-regular)'
                  }}>
                    {instruction}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              variant="ghost"
              onClick={() => setShowAssessmentModal(false)}
              className="flex-1"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAssessmentFromModal}
              className="flex-1 gap-2"
              style={{
                height: 'var(--ikan-component-button-height)',
                borderRadius: 'var(--ikan-component-border-radius)',
                backgroundColor: 'var(--semantic-button-primary-bg)',
                color: 'var(--semantic-button-primary-fg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              <Play size={16} />
              Start Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}