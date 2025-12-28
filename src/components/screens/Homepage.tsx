import React, { useEffect, useState } from 'react';
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
import { ResourceBlock } from '../blocks/ResourceBlock';
import { ResourcePost } from '../blocks/ResourceCard';

// Import data dependencies
import { 
  ASSESSMENT_PROGRAMS as STATIC_ASSESSMENT_PROGRAMS, 
  ASSESSMENT_PROGRAMS_TITLE,
  ASSESSMENT_PROGRAMS_SUBTITLE,
  ASSESSMENT_BUTTON_TEXT,
  ASSESSMENT_SEE_MORE_TEXT,
  RESOURCE_BLOCK_TITLE,
  RESOURCE_VIEW_ALL_TEXT
} from '../../lib/homepage-data';

import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface HomepageProps {
  onNavigate: (route: string, resourceId?: string) => void;
  onGetStarted: () => void;
}

export function Homepage({ onNavigate, onGetStarted }: HomepageProps) {
  const [assessments, setAssessments] = useState<AssessmentProgram[]>(STATIC_ASSESSMENT_PROGRAMS);
  const [resources, setResources] = useState<ResourcePost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
        
        // 1. Trigger Seed (Idempotent) to ensure data exists
        try {
          await fetch(`${baseUrl}/seed/data`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
        } catch (err) {
          console.log('Seed trigger skipped (expected in production):', err);
        }

        // 2. Fetch Assessments with error handling
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
            }
          }
        } catch (err) {
          console.log('Assessments fetch failed, using static data:', err);
        }

        // 3. Fetch Resources with error handling
        try {
          const resourcesRes = await fetch(`${baseUrl}/library/resources?limit=3`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          
          if (resourcesRes.ok) {
            const resourcesData = await resourcesRes.json();

            if (resourcesData.resources && resourcesData.resources.length > 0) {
              const mappedResources = resourcesData.resources.map((r: any) => ({
                id: r.id,
                title: r.title,
                description: r.excerpt,
                image: r.image_url,
                category: r.category,
                author: r.author,
                readTime: `${r.read_time_minutes} min read`,
                date: new Date(r.created_at).toLocaleDateString()
              }));
              setResources(mappedResources);
            }
          }
        } catch (err) {
          console.log('Resources fetch failed, using empty state:', err);
        }

      } catch (error) {
        console.log("Homepage data fetch encountered an issue:", error);
        // Fallback to static data is automatic since initial state is set
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
        
        {/* Resource Block */}
        <ErrorBoundary>
          <ResourceBlock 
            title={RESOURCE_BLOCK_TITLE}
            viewAllText={RESOURCE_VIEW_ALL_TEXT}
            posts={resources}
            onPostClick={(post) => onNavigate('/resource-detail', post.id)}
            onViewAll={() => onNavigate('/resource')}
          />
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