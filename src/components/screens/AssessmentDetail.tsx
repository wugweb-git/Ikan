import React, { useState, useEffect } from 'react';
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
    const fetchResources = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/library/resources?limit=3`,
          {
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
          image: resource.image_url || resource.thumbnail_url || resource.featured_image || '',
          slug: resource.slug,
          author: resource.author?.name,
          category: resource.category || 'General',
          readTime: resource.read_time_minutes ? `${resource.read_time_minutes} min read` : (resource.metadata?.read_time || '5 min read'),
          type: 'article',
          link: resource.slug ? `/resources/${resource.slug}` : `/resources/${resource.id}`,
        }));

        setPosts(transformedPosts);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Don't show block if no resources at all
  if (!loading && posts.length === 0) return null;

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
          throw new Error('API Error');
        }

        const data = await response.json();
        const rawAssessment = data.assessment;
        
        setAssessmentData({
          title: rawAssessment.title || "Mental Health Assessment",
          description: rawAssessment.description || "Take this assessment to better understand your mental health.",
          hero_image: rawAssessment.hero_image || rawAssessment.image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
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
          section1_eligibility_points: rawAssessment.section1_eligibility_points || [
            "Answer a few questions",
            "Your progress is saved automatically",
            "Get immediate results and insights"
          ],
          section1_who_title: rawAssessment.section1_who_title || "Who can take this?",
          section1_who_content: rawAssessment.section1_who_content || "This assessment is designed for adults 18+.",
          
          // Section 2: What is this assessment? (Tile 1 & 2)
          section2_title: rawAssessment.section2_title || rawAssessment.about_title || "What is this assessment?",
          section2_content: rawAssessment.section2_content || rawAssessment.about_content || "A clinically validated tool to help you understand your mental health.",
          section2_image: rawAssessment.section2_image || rawAssessment.about_image || rawAssessment.image_url || defaultBentoImage,
          section2_bullets: rawAssessment.section2_bullets || [
            `Takes ${rawAssessment.metadata?.estimated_minutes || 5} minutes`,
            "Based on validated clinical research",
            "Provides immediate results"
          ],
          
          // Section 3: What you'll see (Tile 4)
          section3_title: rawAssessment.section3_title || rawAssessment.highlights_title || "What you'll see",
          section3_subtitle: rawAssessment.section3_subtitle || "Understanding your mental health is the first step.",
          section3_content: rawAssessment.section3_content || rawAssessment.highlights || [
            "Answer a series of questions about your recent experiences.",
            "Your responses are scored using evidence-based methods.",
            "Receive personalized insights and recommendations based on your results."
          ],
          
          // Section 4: Things to remember (Tile 3)
          section4_notes_title: rawAssessment.section4_notes_title || rawAssessment.notes_title || "Things to remember",
          section4_notes: (rawAssessment.section4_notes || rawAssessment.notes || [
            { title: "Not a diagnosis", description: "Only a professional can diagnose." },
            { title: "Confidential", description: "Your answers are private." },
            { title: "Free", description: "This assessment is completely free." }
          ]).map((n: any) => typeof n === 'string' ? { title: n, description: '' } : n),
        });

        // Fetch related assessments
        const relatedResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/assessments?limit=3`,
          { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
        );
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedAssessments(relatedData.assessments || []);
        }
        
      } catch (err) {
        console.error('Failed to fetch assessment data:', err);
        // Fallback data for specific IDs to prevent "Assessment Not Found" on demo
        if (assessmentId === 'anxiety' || assessmentId === 'gad-7') {
             setAssessmentData({
                title: "Anxiety Assessment (GAD-7)",
                description: "A clinical tool to help you understand your anxiety symptoms.",
                hero_image: "https://images.unsplash.com/photo-1620052087057-bfd8231f584e?q=80&w=2000",
                cta_button_text: "Start Assessment",
                cta_button_link: `/assessment-flow?type=gad-7`,
                section1_title: "How it works",
                section1_eligibility_title: "Simple process:",
                section1_eligibility_points: ["7 questions", "Takes ~3 minutes", "Instant results"],
                section1_who_title: "Who is this for?",
                section1_who_content: "Anyone experiencing worry or nervousness.",
                section2_title: "About GAD-7",
                section2_content: "The Generalized Anxiety Disorder 7-item scale is a validated screening tool.",
                section2_image: defaultBentoImage,
                section2_bullets: ["Clinically validated", "Used by doctors", "Private"],
                section3_title: "What you'll learn",
                section3_subtitle: "Gain clarity on your symptoms",
                section3_content: ["Severity of anxiety", "Recommended next steps", "Tracking over time"],
                section4_notes_title: "Important Notes",
                section4_notes: [{ title: "Screening only", description: "Not a medical diagnosis." }]
             });
        } else if (assessmentId === 'depression' || assessmentId === 'phq-9') {
             setAssessmentData({
                title: "Depression Assessment (PHQ-9)",
                description: "Understand your mood and energy levels with this standard screening tool.",
                hero_image: "https://images.unsplash.com/photo-1616870633658-5af666991942?q=80&w=2000",
                cta_button_text: "Start Assessment",
                cta_button_link: `/assessment-flow?type=phq-9`,
                section1_title: "How it works",
                section1_eligibility_title: "Simple process:",
                section1_eligibility_points: ["9 questions", "Takes ~5 minutes", "Instant results"],
                section1_who_title: "Who is this for?",
                section1_who_content: "Anyone feeling down, hopeless, or tired.",
                section2_title: "About PHQ-9",
                section2_content: "The Patient Health Questionnaire-9 is the gold standard for depression screening.",
                section2_image: defaultBentoImage,
                section2_bullets: ["Clinically validated", "Used by doctors", "Private"],
                section3_title: "What you'll learn",
                section3_subtitle: "Understand your mood",
                section3_content: ["Severity of depression", "Impact on daily life", "Tracking over time"],
                section4_notes_title: "Important Notes",
                section4_notes: [{ title: "Screening only", description: "Not a medical diagnosis." }]
             });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
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
        image: a.image_url || a.thumbnail_url || a.hero_image || 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000',
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
      />

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <TopNavBar 
          currentRoute="/assessment-detail" 
          onNavigate={handleNavigate}
        />
      </div>
      
      <div className="w-full mobile-content-clearance">
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