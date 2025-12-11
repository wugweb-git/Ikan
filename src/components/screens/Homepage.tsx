import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Import modular sections
import { HeroSection } from './homepage/HeroSection';
import { AssessmentSection } from './homepage/AssessmentSection';
import { MissionSection } from './homepage/MissionSection';
import { AssessmentProgramsSection } from './homepage/AssessmentProgramsSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { TestimonialSection } from './homepage/TestimonialSection';
import { EquipProgramsSection } from './homepage/EquipProgramsSection';
import { BlogSection } from './homepage/BlogSection';
import { FAQSection } from './homepage/FAQSection';
import { NewsletterSection } from './homepage/NewsletterSection';

interface HomepageProps {
  onNavigate: (route: string) => void;
  onGetStarted: () => void;
}

export function Homepage({ onNavigate, onGetStarted }: HomepageProps) {
  return (
    <ErrorBoundary>
      <div 
        className="w-full"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          fontFamily: 'var(--font-family-base)'
        }}
      >
        {/* Hero Section */}
        <ErrorBoundary>
          <HeroSection onGetStarted={onGetStarted} />
        </ErrorBoundary>
        
        {/* Assessment Section */}
        <ErrorBoundary>
          <AssessmentSection onGetStarted={onGetStarted} />
        </ErrorBoundary>
        
        {/* Mission Section */}
        <ErrorBoundary>
          <MissionSection />
        </ErrorBoundary>
        
        {/* Assessment Programs Section */}
        <ErrorBoundary>
          <AssessmentProgramsSection onNavigate={onNavigate} />
        </ErrorBoundary>
        
        {/* Benefits Section */}
        <ErrorBoundary>
          <BenefitsSection />
        </ErrorBoundary>
        
        {/* Testimonial Section */}
        <ErrorBoundary>
          <TestimonialSection />
        </ErrorBoundary>
        
        {/* Equip Programs Section */}
        <ErrorBoundary>
          <EquipProgramsSection onNavigate={onNavigate} />
        </ErrorBoundary>
        
        {/* Blog Section */}
        <ErrorBoundary>
          <BlogSection onNavigate={onNavigate} />
        </ErrorBoundary>
        
        {/* FAQ Section */}
        <ErrorBoundary>
          <FAQSection />
        </ErrorBoundary>
        
        {/* Newsletter Section */}
        <ErrorBoundary>
          <NewsletterSection />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}