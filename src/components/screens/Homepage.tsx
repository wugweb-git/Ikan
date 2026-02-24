import React, { useEffect, useState, useMemo } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Import modular sections
import { HeroSection } from './homepage/HeroSection';
import { AssessmentSection } from './homepage/AssessmentSection';
import { MissionSection } from './homepage/MissionSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { TestimonialSection } from './homepage/TestimonialSection';
import { FAQSection } from './homepage/FAQSection';

// Import RECYCLED Blocks
import { AssessmentBlock, AssessmentProgram } from '../blocks/AssessmentBlock';
import { EquipBlock, EquipProgram } from '../blocks/EquipBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { usePageContent } from '../../hooks/usePageContent';
import { NEWSLETTER_CONTENT } from '../../lib/constants/content';

interface HomepageProps {
  onNavigate: (route: string, resourceId?: string) => void;
  onGetStarted: () => void;
}

export function Homepage({ onNavigate, onGetStarted }: HomepageProps) {
  const [assessments, setAssessments] = useState<AssessmentProgram[]>([]);
  const [equipPrograms, setEquipPrograms] = useState<EquipProgram[]>([]);
  const [resources, setResources] = useState<ResourcePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipLoading, setEquipLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);
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
  const ASSESSMENT_PROGRAMS_TITLE = "Assessment Programs";
  const ASSESSMENT_PROGRAMS_SUBTITLE = "PROGRAM";
  const ASSESSMENT_BUTTON_TEXT = "Take Assessment";
  const ASSESSMENT_SEE_MORE_TEXT = "SEE MORE";
  
  const EQUIP_PROGRAMS_TITLE = equipIntroData?.title || "Equip Programs";
  const EQUIP_PROGRAMS_SUBTITLE = equipIntroData?.subtitle || "PROGRAM";
  const EQUIP_BUTTON_TEXT = equipIntroData?.ctaText || "LEARN MORE";
  const EQUIP_FOOTER_TEXT = "Supported by leading healthcare providers";

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
        
        // 1. Fetch Assessments
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
                 image: a.image_url || a.thumbnail_url || a.hero_image || "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000",
                 category: a.category || 'Assessment', // Use actual category from database
                 questionCount: a.questions?.length || a.metadata?.question_count || 10, // Get question count
                 duration: a.duration || a.metadata?.estimated_minutes || 5, // Get duration
                 info: `${a.questions?.length || a.metadata?.question_count || 10} Questions • ${a.duration || a.metadata?.estimated_minutes || 5} min`, // Combine both
                 link: `/assessment-detail?id=${a.slug || a.id}`
              }));
              setAssessments(mappedAssessments.slice(0, 3));
            } else {
              setAssessments([]);
            }
          }
        } catch (err) {
          console.log('Assessments fetch failed:', err);
          setAssessments([]);
        } finally {
          setLoading(false);
        }

        // 2. Fetch Equip Programs
        try {
          const equipRes = await fetch(`${baseUrl}/equip-programs`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          
          if (equipRes.ok) {
            const equipData = await equipRes.json();
            
            if (equipData.programs && equipData.programs.length > 0) {
              const mappedEquip = equipData.programs.map((e: any) => ({
                title: e.title || e.name,
                description: e.summary || e.description || 'Mental wellness program',
                duration: e.duration_days ? `${e.duration_days} days` : '18 days',
                activities: 'Self-paced modules',
                link: `/equip-detail?id=${e.equip_id || e.id}`,
                image: e.thumbnail || e.hero_image || ''
              }));
              setEquipPrograms(mappedEquip.slice(0, 3));
            } else {
              setEquipPrograms([]);
            }
          }
        } catch (err) {
          console.log('Equip programs fetch failed:', err);
          setEquipPrograms([]);
        } finally {
          setEquipLoading(false);
        }

        // 3. Fetch Resources
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
                description: r.excerpt || r.description || r.content?.substring(0, 100) + '...' || '',
                date: new Date(r.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                image: r.image_url || r.thumbnail_url || r.featured_image || '',
                slug: r.slug,
                author: r.author?.name,
                category: r.category || 'General',
                readTime: r.read_time_minutes ? `${r.read_time_minutes} min read` : (r.metadata?.read_time || '5 min read'),
                type: 'article',
                link: r.slug ? `/resources/${r.slug}` : `/resources/${r.id}`,
              }));
              setResources(mappedResources);
            } else {
              setResources([]);
            }
          }
        } catch (err) {
          console.log('Resources fetch failed:', err);
          setResources([]);
        } finally {
          setResourcesLoading(false);
        }

      } catch (error) {
        console.log("Homepage data fetch encountered an issue:", error);
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
          <div id="assessment">
            <AssessmentSection onGetStarted={onGetStarted} />
          </div>
        </ErrorBoundary>
        
        {/* Mission Section */}
        <ErrorBoundary>
          <MissionSection />
        </ErrorBoundary>
        
        {/* Assessment Programs Block */}
        <ErrorBoundary>
          <div id="programs">
            <AssessmentBlock 
              title={ASSESSMENT_PROGRAMS_TITLE}
              subtitle={ASSESSMENT_PROGRAMS_SUBTITLE}
              buttonText={ASSESSMENT_BUTTON_TEXT}
              seeMoreText={ASSESSMENT_SEE_MORE_TEXT}
              programs={assessments} 
              loading={loading}
              onNavigate={onNavigate} 
            />
          </div>
        </ErrorBoundary>
        
        {/* Equip Programs Block */}
        <ErrorBoundary>
          <EquipBlock 
            title={EQUIP_PROGRAMS_TITLE}
            programLabel={EQUIP_PROGRAMS_SUBTITLE}
            buttonText={EQUIP_BUTTON_TEXT}
            footerText={EQUIP_FOOTER_TEXT}
            programs={equipPrograms}
            onNavigate={onNavigate}
          />
        </ErrorBoundary>
        
        {/* Benefits Section */}
        <ErrorBoundary>
          <BenefitsSection />
        </ErrorBoundary>
        
        {/* Resource Block */}
        <ErrorBoundary>
          <ResourceBlock 
            title="Our Recent Thoughts"
            posts={resources}
            loading={resourcesLoading}
            onPostClick={(post) => onNavigate(`/resource-detail?id=${post.id}`)}
            onViewAll={() => onNavigate('/library')}
          />
        </ErrorBoundary>
        
        {/* Testimonial Section */}
        <ErrorBoundary>
          <TestimonialSection />
        </ErrorBoundary>
        
        {/* FAQ Section */}
        <ErrorBoundary>
          <div id="contact">
            <FAQSection />
          </div>
        </ErrorBoundary>
        
        {/* Newsletter Block - RECYCLED */}
        <ErrorBoundary>
          <NewsletterBlock 
            title="Stay Informed About Mental Health"
            benefits={[
              "Get weekly mental health tips and insights",
              "Early access to new features and programs",
              "Exclusive resources and guided exercises"
            ]}
            imageAlt="Mental health newsletter"
            ctaText="Subscribe Now"
            privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}