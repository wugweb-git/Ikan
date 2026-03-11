import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AssessmentHero } from '../blocks/AssessmentHero';
import { AssessmentBentoGrid } from '../blocks/AssessmentBentoGrid';
import { AssessmentBlock } from '../blocks/AssessmentBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { MobileHeader } from '../navigation/MobileHeader';
import { TopNavBar } from '../navigation/TopNavBar';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Skeleton } from '../ui/skeleton-loader';
import { Button } from '../ui/button';
import defaultBentoImage from "figma:asset/8ce2a19aab5abaf51a83cb99ea2d61447f96d8b2.png";
import { ASSESSMENT_CONTENT, NEWSLETTER_CONTENT, FALLBACK_IMAGES, ASSESSMENT_FALLBACKS, DEFAULT_METADATA } from '../../lib/constants/content';

interface AssessmentDetailProps {
  assessmentId?: string;
  onNavigate?: (path: string) => void;
}

interface ResourceSectionProps {
  onNavigate?: (path: string) => void;
}

/**
 * ResourceSection Component
 * Fetches resource posts from the backend and displays them.
 */
function ResourceSection({ onNavigate }: ResourceSectionProps) {
  const [posts, setPosts] = useState<ResourcePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchResources = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/library/resources?limit=3`,
          {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        
        const transformedPosts: ResourcePost[] = (data.resources || []).map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          description: resource.excerpt || resource.description || resource.content?.substring(0, 100) + '...' || '',
          date: new Date(resource.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          image: resource.thumbnail || resource.image || resource.image_url || resource.thumbnail_url || resource.featured_image || resource.metadata?.image || resource.metadata?.thumbnail || '',
          slug: resource.slug,
          author: resource.author?.name,
          category: resource.category || 'General',
          readTime: resource.read_time_minutes ? `${resource.read_time_minutes} min read` : (resource.metadata?.read_time || '5 min read'),
          type: 'article',
          link: resource.slug ? `/resources/${resource.slug}` : `/resources/${resource.id}`,
        }));

        if (!controller.signal.aborted) setPosts(transformedPosts);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Failed to fetch resources:', err);
        setPosts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchResources();

    return () => { controller.abort(); };
  }, []);

  // Always show block, let ResourceBlock handle empty state
  // if (!loading && posts.length === 0) return null;

  return (
    <ResourceBlock 
      posts={posts} 
      loading={loading}
      onPostClick={(post) => {
        // Navigate using the link field from the post
        if (post.link) {
          onNavigate?.(post.link);
        } else if (post.slug) {
          onNavigate?.(`/resource-detail?slug=${post.slug}`);
        } else {
          onNavigate?.(`/resource-detail?id=${post.id}`);
        }
      }}
      onViewAll={() => onNavigate?.('/resources')}
    />
  );
}

export function AssessmentDetail({ assessmentId = 'anxiety', onNavigate }: AssessmentDetailProps) {
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [relatedAssessments, setRelatedAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Define handleNavigate at the top so it's available everywhere
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // Fetch assessment data from backend
  useEffect(() => {
    const controller = new AbortController();
    const fetchAssessmentData = async () => {
      try {
        // Fetch main assessment data
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments/${assessmentId}?t=${Date.now()}`,
          {
            signal: controller.signal,
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('API Error');
        }

        const data = await response.json();
        const rawAssessment = data.assessment;
        
        setAssessmentData({
          title: rawAssessment.title || "",
          description: rawAssessment.description || "",
          hero_image: rawAssessment.hero_image || rawAssessment.image_url || rawAssessment.thumbnail_url || rawAssessment.thumbnail || "",
          cta_button_text: rawAssessment.cta_button_text || "Start Assessment",
          cta_button_link: rawAssessment.cta_button_link || `/assessment-flow?type=${assessmentId}`,
          
          // Basic Info for Tile 2 (Stats)
          questions: rawAssessment.questions || [],
          duration: rawAssessment.duration || 5,
          difficulty: rawAssessment.difficulty ? rawAssessment.difficulty.charAt(0).toUpperCase() + rawAssessment.difficulty.slice(1) : 'Beginner',
          metadata: rawAssessment.metadata || {},
          
          // Section 1: How it works (Tile 3)
          section1_title: rawAssessment.section1_title || "How it works",
          section1_eligibility_title: rawAssessment.section1_eligibility_title || "Simple process:",
          section1_eligibility_points: rawAssessment.section1_eligibility_points || [],
          section1_who_title: rawAssessment.section1_who_title || "Who can take this?",
          section1_who_content: rawAssessment.section1_who_content || "",
          
          // Section 2: What is this assessment? (Tile 1 & 2)
          section2_title: rawAssessment.section2_title || rawAssessment.about_title || "What is this assessment?",
          section2_content: rawAssessment.section2_content || rawAssessment.about_content || "",
          section2_image: rawAssessment.section2_image || rawAssessment.about_image || rawAssessment.image_url || rawAssessment.thumbnail_url || rawAssessment.thumbnail || defaultBentoImage,
          section2_bullets: rawAssessment.section2_bullets || [],
          
          // Section 3: What you'll see (Tile 4)
          section3_title: rawAssessment.section3_title || rawAssessment.highlights_title || "What you'll see",
          section3_subtitle: rawAssessment.section3_subtitle || "",
          section3_content: rawAssessment.section3_content || rawAssessment.highlights || [],
          
          // Section 4: Things to remember (Tile 3)
          section4_notes_title: rawAssessment.section4_notes_title || rawAssessment.notes_title || "Things to remember",
          section4_notes: (rawAssessment.section4_notes || rawAssessment.notes || []).map((n: any) => typeof n === 'string' ? { title: n, description: '' } : n),
        });

        // Fetch related assessments
        const relatedResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments?limit=3`,
          { signal: controller.signal, headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          if (!controller.signal.aborted) setRelatedAssessments(relatedData.assessments || []);
        }
        
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Failed to fetch assessment data:', err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchAssessmentData();

    return () => { controller.abort(); };
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-6 space-y-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="space-y-4">
          <Skeleton variant="text" width="60%" height="40px" />
          <Skeleton variant="text" width="80%" height="24px" />
        </div>
        <Skeleton variant="rectangular" height="300px" className="rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="card" height="200px" />
          <Skeleton variant="card" height="200px" />
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4">
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
            Assessment Not Found
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            We couldn't load the assessment details. Please try again later.
          </p>
          <Button onClick={() => handleNavigate('/assessment')}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const assessmentPrograms = relatedAssessments.length > 0 
    ? relatedAssessments.slice(0, 3).map((a: any) => ({
        title: a.title || a.name,
        description: a.description || a.short_description || 'Mental health assessment',
        image: a.image_url || a.thumbnail_url || a.hero_image || a.image || a.thumbnail || a.cover_image || a.metadata?.image || a.metadata?.thumbnail || '',
        category: a.category || 'Assessment', // Use actual category from database
        questionCount: a.questions?.length || a.metadata?.question_count || 10, // Get question count
        duration: a.duration || a.metadata?.estimated_minutes || 5, // Get duration
        info: `${a.questions?.length || a.metadata?.question_count || 10} Questions • ${a.duration || a.metadata?.estimated_minutes || 5} min`, // Combine both
        link: `/assessment-detail?id=${a.slug || a.id}`
      }))
    : [];

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Mobile Header */}
      <MobileHeader 
        title={assessmentData.title}
        onBack={() => handleNavigate('/assessment')}
        showShare={false}
        transparent={true}
      />
      
      <div className="w-full">
        {/* HERO SECTION */}
        <AssessmentHero
          title={assessmentData.title}
          description={assessmentData.description}
          buttonText={assessmentData.cta_button_text}
          buttonLink={assessmentData.cta_button_link}
          onButtonClick={() => handleNavigate(assessmentData.cta_button_link || `/assessment-flow?type=${assessmentId}`)}
          backgroundImage={assessmentData.hero_image}
          backgroundAlt={`${assessmentData.title} - Assessment landing page`}
        />
        
        {/* BENTO GRID (Replaces Sections 1-4) */}
        <AssessmentBentoGrid
          section1={{
             title: assessmentData.section1_title,
             eligibilityTitle: assessmentData.section1_eligibility_title,
             eligibilityPoints: assessmentData.section1_eligibility_points,
             whoTitle: assessmentData.section1_who_title,
             whoContent: assessmentData.section1_who_content
          }}
          section2={{
             title: assessmentData.section2_title,
             content: assessmentData.section2_content,
             image: assessmentData.section2_image,
             bullets: assessmentData.section2_bullets
          }}
          section3={{
             title: assessmentData.section3_title,
             subtitle: assessmentData.section3_subtitle,
             content: assessmentData.section3_content
          }}
          section4={{
             notesTitle: assessmentData.section4_notes_title,
             notes: assessmentData.section4_notes
          }}
          questionCount={assessmentData.questions?.length || 10}
          duration={assessmentData.duration || 5}
          difficulty={assessmentData.difficulty || 'Beginner'}
          importantNote1={assessmentData.metadata?.important_note_1}
          importantNote2={assessmentData.metadata?.important_note_2}
        />
        
        {/* RELATED ASSESSMENTS */}
        {assessmentPrograms.length > 0 && (
          <AssessmentBlock
            title={ASSESSMENT_CONTENT.BLOCK_TITLE}
            seeMoreText={ASSESSMENT_CONTENT.BLOCK_SEE_ALL}
            programs={assessmentPrograms}
            onNavigate={handleNavigate}
          />
        )}
        
        {/* RESOURCES */}
        <ResourceSection onNavigate={handleNavigate} />
        
        {/* NEWSLETTER */}
        <NewsletterBlock
          title={NEWSLETTER_CONTENT.ASSESSMENT.title}
          benefits={NEWSLETTER_CONTENT.ASSESSMENT.benefits}
          imageAlt={NEWSLETTER_CONTENT.ASSESSMENT.imageAlt}
          ctaText={NEWSLETTER_CONTENT.ASSESSMENT.ctaText}
          privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
        />
      </div>
    </div>
  );
}

export default AssessmentDetail;