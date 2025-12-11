import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArrowLeft, Clock, FileText, Tag, Play } from 'lucide-react';

// Import the original Figma components  
import AssesmentLpDesktop from '../../imports/AssesmentLpDesktop-214-18961';
import AssesmentLpMobiole from '../../imports/AssesmentLpMobiole-214-19797';

interface AssessmentLandingNewProps {
  onStartAssessment?: () => void;
  onBack?: () => void;
}

export function AssessmentLandingNew({ onStartAssessment, onBack }: AssessmentLandingNewProps) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [tipsConsent, setTipsConsent] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Assessment details (this would typically come from an API)
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

  // Clear any stored assessment data since we're using original Figma design
  React.useEffect(() => {
    try {
      localStorage.removeItem('ikan-selected-assessment');
    } catch (error) {
      // Ignore localStorage errors
    }
  }, []);

  // Handle form submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && firstName) {
      console.log('Newsletter signup:', { email, firstName, newsletterConsent, tipsConsent });
      // Here you would typically call an API to submit the form
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
      setFirstName('');
      setNewsletterConsent(false);
      setTipsConsent(false);
    }
  };

  // Handle assessment button click - show modal first
  const handleTakeAssessment = () => {
    setShowAssessmentModal(true);
  };

  // Handle starting assessment from modal
  const handleStartAssessmentFromModal = () => {
    setShowAssessmentModal(false);
    if (onStartAssessment) {
      onStartAssessment();
    }
  };

  // Add interactive functionality to existing Figma components
  React.useEffect(() => {
    const addInteractivity = () => {
      // Primary Assessment Buttons - Updated to English
      const assessmentButtons = document.querySelectorAll('[data-name="Buttons"]');
      assessmentButtons.forEach(button => {
        const textElement = button.querySelector('p');
        if (textElement && textElement.textContent?.includes('Take Assesment')) {
          // Update German text to proper English
          textElement.textContent = 'Take Assessment';
          
          button.addEventListener('click', (e) => {
            e.preventDefault();
            handleTakeAssessment();
          });
          
          // Add cursor pointer styling
          (button as HTMLElement).style.cursor = 'pointer';
          (button as HTMLElement).style.transition = 'all 0.2s ease';
          
          button.addEventListener('mouseenter', () => {
            (button as HTMLElement).style.transform = 'translateY(-1px)';
            (button as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          });
          
          button.addEventListener('mouseleave', () => {
            (button as HTMLElement).style.transform = 'translateY(0)';
            (button as HTMLElement).style.boxShadow = 'none';
          });
        }
      });

      // Newsletter Form - Make functional
      const emailInputs = document.querySelectorAll('[data-name="Input"]');
      emailInputs.forEach((input, index) => {
        const container = input.querySelector('[data-name="Container"]');
        const label = container?.querySelector('p');
        
        if (label) {
          // Create functional input element
          const inputElement = document.createElement('input');
          inputElement.className = 'ikan-input';
          inputElement.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            background: transparent;
            font-family: Ubuntu, sans-serif;
            font-size: 14px;
            color: #0a0a0f;
            padding: 0;
          `;
          
          if (label.textContent?.includes('Vorname') || label.textContent?.includes('First name')) {
            // First name input
            label.textContent = 'First Name';
            inputElement.type = 'text';
            inputElement.placeholder = 'Enter your first name';
            inputElement.value = firstName;
            inputElement.addEventListener('input', (e) => {
              setFirstName((e.target as HTMLInputElement).value);
            });
          } else if (label.textContent?.includes('Email')) {
            // Email input
            label.textContent = 'Email Address';
            inputElement.type = 'email';
            inputElement.placeholder = 'Enter your email address';
            inputElement.value = email;
            inputElement.addEventListener('input', (e) => {
              setEmail((e.target as HTMLInputElement).value);
            });
          }
          
          // Replace static content with interactive input
          container.innerHTML = '';
          container.appendChild(inputElement);
        }
      });

      // Newsletter checkboxes - Make functional
      const checkboxItems = document.querySelectorAll('[data-name="Item"]');
      checkboxItems.forEach((item, index) => {
        const textElement = item.querySelector('span');
        if (textElement) {
          // Update German text to English
          if (textElement.textContent?.includes('Neuigkeiten')) {
            textElement.textContent = 'News & Offers';
          } else if (textElement.textContent?.includes('Tipps')) {
            textElement.textContent = 'Practical Tips and Exercises';
          }
          
          // Make checkbox interactive
          const checkbox = item.querySelector('[data-name*="checkbox"]');
          if (checkbox) {
            checkbox.addEventListener('click', (e) => {
              e.preventDefault();
              if (index === 0) {
                setNewsletterConsent(!newsletterConsent);
                (checkbox as HTMLElement).style.backgroundColor = !newsletterConsent ? '#2e2a2f' : 'transparent';
              } else if (index === 1) {
                setTipsConsent(!tipsConsent);
                (checkbox as HTMLElement).style.backgroundColor = !tipsConsent ? '#2e2a2f' : 'transparent';
              }
            });
            
            (checkbox as HTMLElement).style.cursor = 'pointer';
          }
        }
      });

      // Newsletter submit button - Make functional
      const submitButtons = document.querySelectorAll('[data-name="Buttons"]');
      submitButtons.forEach(button => {
        const textElement = button.querySelector('p');
        if (textElement && textElement.textContent?.includes('Sign up now')) {
          textElement.textContent = 'Subscribe Now';
          
          button.addEventListener('click', handleNewsletterSubmit);
          (button as HTMLElement).style.cursor = 'pointer';
          (button as HTMLElement).style.transition = 'all 0.2s ease';
          
          button.addEventListener('mouseenter', () => {
            (button as HTMLElement).style.transform = 'translateY(-1px)';
            (button as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          });
          
          button.addEventListener('mouseleave', () => {
            (button as HTMLElement).style.transform = 'translateY(0)';
            (button as HTMLElement).style.boxShadow = 'none';
          });
        }
      });

      // Update German headings to English
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      headings.forEach(heading => {
        if (heading.textContent?.includes('Anmeldung zum Newsletter')) {
          heading.textContent = 'Newsletter Subscription';
        }
      });

      // Interview video play button - Make functional
      const playButtons = document.querySelectorAll('[data-name*="Component"]');
      playButtons.forEach(button => {
        const container = button.closest('[data-name="Container"]');
        if (container) {
          const textElement = container.querySelector('p');
          if (textElement && textElement.textContent?.includes('Interview anschauen')) {
            textElement.textContent = 'Watch Full Interview';
            
            button.addEventListener('click', (e) => {
              e.preventDefault();
              // Simulate video play
              alert('Video player would open here');
            });
            
            (button as HTMLElement).style.cursor = 'pointer';
            (button as HTMLElement).style.transition = 'all 0.2s ease';
            
            button.addEventListener('mouseenter', () => {
              (button as HTMLElement).style.transform = 'scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
              (button as HTMLElement).style.transform = 'scale(1)';
            });
          }
        }
      });
    };

    // Add interactivity after component mounts
    const timer = setTimeout(addInteractivity, 500);
    
    // Also try immediately in case content is already ready
    addInteractivity();

    return () => clearTimeout(timer);
  }, [handleTakeAssessment, email, firstName, newsletterConsent, tipsConsent]);

  // For mobile devices, use the mobile Figma component
  if (isMobile) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden relative">
        {/* Back button overlay for mobile */}
        {onBack && (
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
        
        <AssesmentLpMobiole />
        
        {/* Mobile overlay for primary assessment button */}
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 mobile-button touch-target"
          style={{
            top: '795px', // Adjusted for mobile layout
            left: 'var(--ikan-component-spacing-default)',
            right: 'var(--ikan-component-spacing-default)',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            backgroundColor: 'transparent'
          }}
          onClick={handleTakeAssessment}
        />
      </div>
    );
  }

  // For desktop devices, use the desktop Figma component
  return (
    <div className="w-full min-h-screen overflow-x-hidden relative">
      {/* Back button overlay for desktop */}
      {onBack && (
        <div 
          className="absolute z-50"
          style={{
            top: 'var(--spacing-8)',
            left: 'var(--spacing-8)'
          }}
        >
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="touch-target backdrop-blur-sm"
            style={{
              width: 'var(--ikan-component-button-height)',
              height: 'var(--ikan-component-button-height)',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ArrowLeft 
              className="w-6 h-6" 
              style={{ color: 'var(--color-text-primary)' }}
            />
          </Button>
        </div>
      )}
      
      <AssesmentLpDesktop />
      
      {/* Desktop overlays for interactive elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary assessment button overlay */}
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 touch-target"
          style={{
            top: '680px',
            left: '100px',
            width: '468px',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            backgroundColor: 'transparent'
          }}
          onClick={handleTakeAssessment}
        />
        
        {/* Additional assessment buttons in cards */}
        <div 
          className="absolute pointer-events-auto cursor-pointer z-10 touch-target"
          style={{
            top: '1230px', // Adjusted for desktop card layout
            left: '320px',
            width: '177px',
            height: 'var(--ikan-component-button-height)',
            borderRadius: 'var(--ikan-component-border-radius)',
            backgroundColor: 'transparent'
          }}
          onClick={handleTakeAssessment}
        />
      </div>

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