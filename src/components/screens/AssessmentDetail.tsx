import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AssessmentHero } from '../blocks/AssessmentHero';
import { ContextBlock } from '../blocks/ContextBlock';
import { InfoBlock } from '../blocks/InfoBlock';
import { AssessmentBlock } from '../blocks/AssessmentBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';

interface AssessmentDetailProps {
  assessmentId?: string;
  onNavigate?: (path: string) => void;
}

/**
 * ResourceSection Component
 * Fetches resource posts from the backend and displays them.
 * Uses GLOBAL APPROACH: Shows loader indefinitely if backend fails.
 */
function ResourceSection() {
  const [posts, setPosts] = useState<ResourcePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/resources?limit=3`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
          // Don't set loading to false - keep showing loader (GLOBAL APPROACH)
          return;
        }

        const data = await response.json();
        
        // Transform the API response to match ResourcePost interface
        const transformedPosts: ResourcePost[] = (data.resources || []).map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          content: resource.content || resource.description || '',
          category: resource.category || 'General',
          imageUrl: resource.thumbnail_url || resource.featured_image || '',
          readTime: resource.metadata?.read_time || '5 min read',
          link: resource.slug ? `/resources/${resource.slug}` : `/resources/${resource.id}`,
        }));

        setPosts(transformedPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resources:', err);
        // Don't set loading to false - keep showing loader (GLOBAL APPROACH)
      }
    };

    fetchResources();
  }, []);

  if (loading || posts.length === 0) {
    return (
      <div style={{ 
        padding: 'var(--spacing-8) var(--spacing-4)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-regular)'
      }}>
        Loading resources...
      </div>
    );
  }

  return <ResourceBlock posts={posts} />;
}

/**
 * AssessmentDetail Component
 * Main component that displays assessment detail page with all sections.
 * Fetches assessment data from backend - Shows loader if data fails (GLOBAL APPROACH).
 * 
 * This replaces the Figma import: /imports/AssesmentLpDesktop-214-18961.tsx
 */
export function AssessmentDetail({ assessmentId = 'k10', onNavigate }: AssessmentDetailProps) {
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [relatedAssessments, setRelatedAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assessment data from backend
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        // Fetch main assessment data
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments/${assessmentId}`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }
        );
        
        if (!response.ok) {
          console.error(`Failed to load assessment: ${response.status} ${response.statusText}`);
          // Don't set loading to false - keep showing loader (GLOBAL APPROACH)
          return;
        }

        const data = await response.json();
        setAssessmentData(data.assessment); // Extract assessment from wrapper

        // Fetch related assessments
        const relatedResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments?limit=3`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }
        );
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedAssessments(relatedData.assessments || []);
        }
        
        // Only set loading to false if we successfully got the main data
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        // Don't set loading to false - keep showing loader indefinitely
        // This is the GLOBAL APPROACH for backend failures
      }
    };

    fetchAssessmentData();
  }, [assessmentId]);

  // Loading state - shows indefinitely if backend fails (GLOBAL APPROACH)
  if (isLoading || !assessmentData) {
    return (
      <div 
        className="w-full min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: 'var(--color-bg-page)' }}
      >
        <p style={{ 
          color: 'var(--color-text-muted)', 
          fontSize: 'var(--text-base)', 
          fontWeight: 'var(--font-weight-regular)' 
        }}>
          Loading assessment...
        </p>
      </div>
    );
  }

  // Map related assessments to AssessmentBlock format (only if data exists)
  const assessmentPrograms = relatedAssessments.length > 0 
    ? relatedAssessments.slice(0, 3).map((a: any) => ({
        title: a.title || a.name,
        description: a.description || a.short_description || 'Mental health assessment',
        image: a.thumbnail_url || a.hero_image || '',
        info: a.metadata?.estimated_minutes ? `${a.metadata.estimated_minutes} min Quiz` : '5 min Quiz',
        link: `/assessment-landing?id=${a.id}`
      }))
    : [];

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path);
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="w-full">
        {/* 1. Assessment Hero - DYNAMIC */}
        <AssessmentHero
          title={assessmentData.title}
          description={assessmentData.description}
          buttonText={assessmentData.cta_button_text || 'Take Assessment'}
          buttonLink={assessmentData.cta_button_link || `/assessment-flow?type=${assessmentId}`}
          backgroundImage={assessmentData.hero_image}
          backgroundAlt={`${assessmentData.title} - Assessment landing page`}
        />
        
        {/* 2. Context Block - DYNAMIC */}
        {assessmentData.about_title && assessmentData.about_content && (
          <ContextBlock
            title={assessmentData.about_title}
            content={assessmentData.about_content}
            image={assessmentData.about_image}
            imageAlt={`${assessmentData.title} - Context image`}
            videoCaption={assessmentData.video_caption}
            showPlayButton={!!assessmentData.video_caption}
            onVideoClick={() => console.log('Play video')}
          />
        )}
        
        {/* 3. Info Block - DYNAMIC */}
        {assessmentData.main_title && (
          <InfoBlock 
            mainTitle={assessmentData.main_title}
            mainContent={assessmentData.main_content || []}
            highlightsTitle={assessmentData.highlights_title || 'Assessment Highlights'}
            highlights={assessmentData.highlights || []}
            notesTitle={assessmentData.notes_title || 'Things to keep in mind'}
            notes={assessmentData.notes || []}
          />
        )}
        
        {/* 4. Assessment Block - DYNAMIC (only shows if related assessments exist) */}
        {assessmentPrograms.length > 0 && (
          <AssessmentBlock
            title="Related Mental Health Assessments"
            seeMoreText="SEE ALL"
            programs={assessmentPrograms}
            onNavigate={handleNavigate}
          />
        )}
        
        {/* 5. Resource Block - DYNAMIC (fetches from backend) */}
        <ResourceSection />
        
        {/* 6. Newsletter Block - DYNAMIC */}
        <NewsletterBlock
          title="Stay Informed About Mental Health"
          benefits={[
            'Get weekly mental health tips and insights',
            'Early access to new assessments and programs',
            'Exclusive resources and guided exercises'
          ]}
          imageUrl={assessmentData.newsletter_image || ''}
          imageAlt="Mental health newsletter subscription"
          ctaText="Subscribe Now"
          privacyText="Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time."
          onSubmit={(formData) => {
            console.log('Newsletter signup:', formData);
            // TODO: Connect to backend newsletter API
            alert(`Thank you for subscribing! We've sent a confirmation email to ${formData.email}`);
          }}
        />
      </div>
    </div>
  );
}

export default AssessmentDetail;