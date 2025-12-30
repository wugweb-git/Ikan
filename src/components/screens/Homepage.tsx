import React, { useEffect, useState, useMemo } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Import modular sections
import { HeroSection } from './homepage/HeroSection';
import { AssessmentSection } from './homepage/AssessmentSection';
import { MissionSection } from './homepage/MissionSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { TestimonialSection } from './homepage/TestimonialSection';
import { FAQSection } from './homepage/FAQSection';
import { NewsletterSection } from './homepage/NewsletterSection';

// Import new Blocks
import { AssessmentBlock, AssessmentProgram } from '../blocks/AssessmentBlock';

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { usePageContent } from '../../hooks/usePageContent';

interface HomepageProps {
  onNavigate: (route: string, resourceId?: string) => void;
  onGetStarted: () => void;
}

export function Homepage({ onNavigate, onGetStarted }: HomepageProps) {
  const [assessments, setAssessments] = useState<AssessmentProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const { content: equipContent } = usePageContent('homepage-equip-intro');

  const equipIntroData = useMemo(() => {
    if (!equipContent?.content) return null;
    try {
      return JSON.parse(equipContent.content);
    } catch (e) {
      console.error('Failed to parse equip intro content', e);
      return null;
    }
  }, [equipContent]);

  // Default values if CMS fails
  const ASSESSMENT_PROGRAMS_TITLE = equipIntroData?.title || "Equip Programs";
  const ASSESSMENT_PROGRAMS_SUBTITLE = equipIntroData?.subtitle || "PROGRAM";
  const ASSESSMENT_BUTTON_TEXT = equipIntroData?.ctaText || "LEARN MORE";
  const ASSESSMENT_SEE_MORE_TEXT = "SEE MORE";

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
        
        // 1. Fetch Assessments with error handling
        try {
          const assessmentsRes = await fetch(`${baseUrl}/assessments`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          
          if (assessmentsRes.ok) {
            const assessmentsData = await assessmentsRes.json();
            
            if (assessmentsData.assessments && assessmentsData.assessments.length > 0) {
              const mappedAssessments = assessmentsData.assessments.map((a: any) => ({
                 title: a.title,
                 description: a.description,
                 image: a.image_url || "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000",
                 info: a.info || (a.metadata?.estimated_minutes ? `${a.metadata.estimated_minutes} min Quiz` : "5 min Quiz"),
                 link: `/assessment-detail?id=${a.slug || a.id}`
              }));
              setAssessments(mappedAssessments.slice(0, 3));
            } else {
              setAssessments([]); // Ensure empty if no data
            }
          }
        } catch (err) {
          console.log('Assessments fetch failed:', err);
          setAssessments([]);
        }

      } catch (error) {
        console.log("Homepage data fetch encountered an issue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        
        {/* Assessment Section (Intro/CTA) */}
        <ErrorBoundary>
          <AssessmentSection onGetStarted={onGetStarted} />
        </ErrorBoundary>
        
        {/* Mission Section */}
        <ErrorBoundary>
          <MissionSection />
        </ErrorBoundary>
        
        {/* Assessment Programs Block */}
        <ErrorBoundary>
          <AssessmentBlock 
            title={ASSESSMENT_PROGRAMS_TITLE}
            subtitle={ASSESSMENT_PROGRAMS_SUBTITLE}
            buttonText={ASSESSMENT_BUTTON_TEXT}
            seeMoreText={ASSESSMENT_SEE_MORE_TEXT}
            programs={assessments} 
            loading={loading}
            onNavigate={onNavigate} 
          />
        </ErrorBoundary>
        
        {/* Benefits Section */}
        <ErrorBoundary>
          <BenefitsSection />
        </ErrorBoundary>
        
        {/* Testimonial Section */}
        <ErrorBoundary>
          <TestimonialSection />
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