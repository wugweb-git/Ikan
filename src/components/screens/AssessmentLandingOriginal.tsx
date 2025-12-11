import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

// Import the original Figma components
import AssesmentLpDesktop from '../../imports/AssesmentLpDesktop-214-18961';
import AssesmentLpMobiole from '../../imports/AssesmentLpMobiole-214-19797';

interface AssessmentLandingOriginalProps {
  onStartAssessment?: () => void;
  onBack?: () => void;
}

export function AssessmentLandingOriginal({ onStartAssessment, onBack }: AssessmentLandingOriginalProps) {
  const isMobile = useIsMobile();

  // Add click handlers to the original Figma components
  React.useEffect(() => {
    // Find all "Take Assessment" buttons and add click handlers
    const buttons = document.querySelectorAll('[data-name="Buttons"]');
    
    const handleButtonClick = (event: Event) => {
      event.preventDefault();
      if (onStartAssessment) {
        onStartAssessment();
      }
    };

    buttons.forEach(button => {
      button.addEventListener('click', handleButtonClick);
    });

    // Cleanup event listeners
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('click', handleButtonClick);
      });
    };
  }, [onStartAssessment]);

  // For mobile devices, use the mobile Figma component
  if (isMobile) {
    return (
      <div className="w-full min-h-screen">
        <AssesmentLpMobiole />
      </div>
    );
  }

  // For desktop devices, use the desktop Figma component
  return (
    <div className="w-full min-h-screen">
      <AssesmentLpDesktop />
    </div>
  );
}