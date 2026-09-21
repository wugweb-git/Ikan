import { useState, useEffect } from 'react';
import { projectId } from '../../utils/supabase/info';
import { getAuthHeaders } from '../../shared/supabase-client';
import { SectionHero } from '../ui/blocks/SectionHero';
import { AssessmentBentoGrid } from '../ui/blocks/AssessmentBentoGrid';
import { AssessmentBlock } from '../ui/blocks/AssessmentBlock';
import { ResourceBlock } from '../ui/blocks/ResourceBlock';
import { NewsletterBlock } from '../ui/blocks/NewsletterBlock';
import { ResourcePost } from '../ui/blocks/ResourceCard';
import { MobileHeader } from '../shell/navigation/MobileHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSeo } from '../../hooks/useSeo';
import { Skeleton } from '../ui/skeleton-loader';
import { Button } from '../ui/button';
import defaultBentoImage from "../../assets/8ce2a19aab5abaf51a83cb99ea2d61447f96d8b2.png";
import { ASSESSMENT_CONTENT, NEWSLETTER_CONTENT } from '../../lib/constants/content';
import { assessmentMeta, assessmentImage } from '../../lib/assessment-meta';

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
            headers: await getAuthHeaders(),
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

/**
 * @param assessmentId id or slug. There is deliberately NO default.
 *
 * It used to default to `'anxiety'`, so `/assessment-detail` with no id
 * rendered the anxiety assessment — hero, description, question count, start
 * button — presented as though it were the one that had been asked for. A page
 * that answers a question nobody asked is worse than a page that says it
 * cannot find what you wanted.
 */
export function AssessmentDetail({ assessmentId, onNavigate }: AssessmentDetailProps) {
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
    // No id means nothing to fetch. Falling through would leave isLoading true
    // forever and hold the skeleton on screen.
    if (!assessmentId) { setIsLoading(false); return; }
    const controller = new AbortController();
    const fetchAssessmentData = async () => {
      try {
        // Fetch main assessment data (works for both id and slug — backend resolves either)
        const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`;
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${apiBase}/assessments/${assessmentId}?t=${Date.now()}`,
          { signal: controller.signal, headers }
        );

        let rawAssessment: any = null;
        if (response.ok) {
          rawAssessment = (await response.json()).assessment;
        } else {
          // Fallback (deploy-safe): older backend may not resolve slugs — match from the list
          const listRes = await fetch(`${apiBase}/assessments?t=${Date.now()}`, { signal: controller.signal, headers });
          if (listRes.ok) {
            const body = await listRes.json();
            const all = Array.isArray(body) ? body : (body.assessments || []);
            rawAssessment = all.find((a: any) => a.slug === assessmentId || a.id === assessmentId) || null;
          }
        }

        if (!rawAssessment) {
          throw new Error('API Error');
        }
        
        setAssessmentData({
          title: rawAssessment.title || "",
          slug: rawAssessment.slug || "",
          description: rawAssessment.description || "",
          hero_image: rawAssessment.hero_image || rawAssessment.image_url || rawAssessment.thumbnail_url || rawAssessment.thumbnail || "",
          cta_button_text: rawAssessment.cta_button_text || "Start Assessment",
          cta_button_link: rawAssessment.cta_button_link || `/assessment-flow?type=${assessmentId}`,
          
          // Basic Info for Tile 2 (Stats)
          questions: rawAssessment.questions || [],
          // Authored or absent. A default here is a number the user reads
          // as a promise about their own time.
          duration: typeof rawAssessment.duration === 'number' && rawAssessment.duration > 0 ? rawAssessment.duration : null,
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
          { signal: controller.signal, headers: await getAuthHeaders() }
        );
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          /**
           * Exclude the assessment being viewed.
           *
           * `?limit=3` is not a parameter this endpoint implements, so the
           * fetch returned all seven and the first three were taken — which
           * put "you might also like" under an assessment's own page,
           * recommending itself. Matched on id AND slug because the route
           * accepts either, so the param may be either.
           */
          const all = (relatedData.assessments || []).filter(
            (a: any) => a?.id !== assessmentId && a?.slug !== assessmentId
          );
          if (!controller.signal.aborted) setRelatedAssessments(all);
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

  useSeo({
    enabled: !!assessmentData,
    title: assessmentData?.title,
    description: assessmentData?.description,
    image: assessmentData?.hero_image,
    canonicalPath: assessmentData ? `/assessment/${assessmentData.slug || assessmentId}` : undefined,
    type: 'article',
    jsonLd: assessmentData ? {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: assessmentData.title,
      description: assessmentData.description,
      url: `https://ikanhealth.in/assessment/${assessmentData.slug || assessmentId}`,
      isPartOf: { '@type': 'WebSite', name: 'iKan Health', url: 'https://ikanhealth.in' },
    } : null,
  });

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
    ? relatedAssessments.slice(0, 3).map((a: any) => {
        // One source for both facts, and no defaults: this used to claim
        // "10 Questions • 5 min" for anything that had not authored them.
        const { count, minutes } = assessmentMeta(a);
        const info = [
          count !== null ? `${count} Questions` : null,
          minutes !== null ? `${minutes} min` : null,
        ].filter(Boolean).join(' • ');
        return {
          title: a.title || a.name,
          description: a.description || a.short_description || '',
          image: assessmentImage(a) ?? '',
          category: a.category || 'Assessment',
          questionCount: count,
          duration: minutes,
          info,
          link: a.slug ? `/assessment/${a.slug}` : `/assessment-detail?id=${a.id}`,
        };
      })
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
        <SectionHero
          title={assessmentData.title}
          description={assessmentData.description}
          buttonText={assessmentData.cta_button_text}
          buttonLink={assessmentData.cta_button_link}
          onButtonClick={() => handleNavigate(assessmentData.cta_button_link || `/assessment-flow?type=${assessmentId}`)}
          /* Was `hero_image` alone, which the stress assessment does not carry —
             its hero rendered blank. `assessmentImage` is the same ladder this
             file already uses for cards. */
          backgroundImage={assessmentImage(assessmentData) ?? undefined}
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
          questionCount={assessmentMeta(assessmentData).count}
          duration={assessmentMeta(assessmentData).minutes}
          difficulty={assessmentData.difficulty || 'Beginner'}
          importantNote1={assessmentData.metadata?.important_note_1}
          importantNote2={assessmentData.metadata?.important_note_2}
          /* The two tiles the grid had no props for. `section3_content` is empty
             on all seven assessments — the text has always been in these. */
          whatYoullSeeHtml={assessmentData.metadata?.tile4_content}
          importantNotesHtml={assessmentData.metadata?.tile5_content}
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