import { useEffect, useState, useMemo } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Import modular sections
import { HeroSection } from './homepage/HeroSection';
import { AssessmentSection } from './homepage/AssessmentSection';
import { MissionSection } from './homepage/MissionSection';
import { BenefitsSection } from './homepage/BenefitsSection';
import { TestimonialSection } from './homepage/TestimonialSection';
import { FAQSection } from './homepage/FAQSection';
import { HowItWorksSection } from './homepage/HowItWorksSection';
import { ReviewsSection } from './homepage/ReviewsSection';

// Import RECYCLED Blocks
import { AssessmentBlock, AssessmentProgram } from '../blocks/AssessmentBlock';
import { EquipBlock, EquipProgram } from '../blocks/EquipBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';

import { apiClient } from '../../lib/api-client';
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
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        // 1. Fetch Assessments
        try {
          const assessmentsData = await apiClient.request('/assessments', { method: 'GET', signal }, false);
          
          if (assessmentsData.assessments && assessmentsData.assessments.length > 0) {
            const mappedAssessments = assessmentsData.assessments.map((a: any) => ({
               title: a.title,
               description: a.description,
               image: a.thumbnail || a.image || a.hero_image || a.image_url || a.thumbnail_url || "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000",
               category: a.category || 'Assessment',
               questionCount: a.questions?.length || a.metadata?.question_count || 10,
               duration: a.duration || a.metadata?.estimated_minutes || 5,
               info: `${a.questions?.length || a.metadata?.question_count || 10} Questions • ${a.duration || a.metadata?.estimated_minutes || 5} min`,
               link: a.slug ? `/assessment/${a.slug}` : `/assessment-detail?id=${a.id}`
            }));
            if (!signal.aborted) setAssessments(mappedAssessments.slice(0, 3));
          } else {
            if (!signal.aborted) setAssessments([]);
          }
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
          console.log('Assessments fetch failed:', err);
          if (!signal.aborted) setAssessments([]);
        } finally {
          if (!signal.aborted) setLoading(false);
        }

        // 2. Fetch Equip Programs
        try {
          const equipData = await apiClient.request('/equip-programs', { method: 'GET', signal }, false);
          
          if (equipData.programs && equipData.programs.length > 0) {
            const mappedEquip = equipData.programs.map((e: any) => ({
              title: e.title || e.name,
              description: e.summary || e.description || 'Mental wellness program',
              duration: e.duration_days ? `${e.duration_days} days` : '18 days',
              activities: 'Self-paced modules',
              link: e.slug ? `/equip/${e.slug}` : `/equip-detail?id=${e.equip_id || e.id}`,
              image: e.thumbnail || e.hero_image || ''
            }));
            if (!signal.aborted) setEquipPrograms(mappedEquip.slice(0, 3));
          } else {
            if (!signal.aborted) setEquipPrograms([]);
          }
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
          console.log('Equip programs fetch failed:', err);
          if (!signal.aborted) setEquipPrograms([]);
        } finally {
          if (!signal.aborted) setEquipLoading(false);
        }

        // 3. Fetch Resources
        try {
          const resourcesData = await apiClient.request('/library/resources?limit=3', { method: 'GET', signal }, false);
          
          if (resourcesData.resources && resourcesData.resources.length > 0) {
            const mappedResources = resourcesData.resources.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.excerpt || r.description || r.content?.substring(0, 100) + '...' || '',
              date: new Date(r.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              image: r.thumbnail || r.image || r.image_url || r.thumbnail_url || r.featured_image || '',
              slug: r.slug,
              author: r.author?.name,
              category: r.category || 'General',
              readTime: r.read_time_minutes ? `${r.read_time_minutes} min read` : (r.metadata?.read_time || '5 min read'),
              type: 'article',
              link: r.slug ? `/resources/${r.slug}` : `/resources/${r.id}`,
            }));
            if (!signal.aborted) setResources(mappedResources);
          } else {
            if (!signal.aborted) setResources([]);
          }
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
          console.log('Resources fetch failed:', err);
          if (!signal.aborted) setResources([]);
        } finally {
          if (!signal.aborted) setResourcesLoading(false);
        }

      } catch (error: any) {
        if (error?.name === 'AbortError') return; // Component unmounted
        console.log("Homepage data fetch encountered an issue:", error);
      }
    };

    fetchData();

    return () => { controller.abort(); };
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

        {/* How It Works Section */}
        <ErrorBoundary>
          <HowItWorksSection onNavigate={onNavigate} />
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
          <BenefitsSection onNavigate={onNavigate} />
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
            <FAQSection onNavigate={onNavigate} />
          </div>
        </ErrorBoundary>
        
        {/* Reviews Section */}
        <ErrorBoundary>
          <ReviewsSection />
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