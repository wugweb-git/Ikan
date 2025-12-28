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
        setLoading(false);
      } catch (err) {
        // Fallback mock resources
        setPosts([
          {
            id: '1',
            title: 'Understanding Anxiety Triggers',
            description: 'Learn how to identify and manage the triggers that cause your anxiety spikes.',
            date: 'Mar 10, 2024',
            category: 'Anxiety',
            image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=800&auto=format&fit=crop&q=60',
            readTime: '5 min read',
            type: 'article',
            link: '#'
          },
          {
            id: '2',
            title: 'The Benefits of Mindfulness',
            description: 'Discover how daily mindfulness practice can improve your mental well-being.',
            date: 'Mar 12, 2024',
            category: 'Wellness',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60',
            readTime: '3 min read',
            type: 'article',
            link: '#'
          },
          {
            id: '3',
            title: 'Better Sleep Habits',
            description: 'Simple changes to your routine that can drastically improve sleep quality.',
            date: 'Mar 15, 2024',
            category: 'Sleep',
            image: 'https://images.unsplash.com/photo-1541781777621-3914296d36e3?w=800&auto=format&fit=crop&q=60',
            readTime: '7 min read',
            type: 'article',
            link: '#'
          }
        ]);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <ResourceBlock 
      posts={posts} 
      onPostClick={(post) => onNavigate?.(`/resource-detail?id=${post.id}`)}
    />
  );
}

export function AssessmentDetail({ assessmentId = 'anxiety', onNavigate }: AssessmentDetailProps) {
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [relatedAssessments, setRelatedAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

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
          
          // Section 1: Who is this for?
          section1_title: rawAssessment.section1_title || "Who is this test for?",
          section1_eligibility_title: rawAssessment.section1_eligibility_title || "This assessment may be helpful if you:",
          section1_eligibility_points: rawAssessment.section1_eligibility_points || [
            "Want to understand your mental health better",
            "Are experiencing emotional or psychological distress",
            "Seek personalized insights and recommendations"
          ],
          section1_who_title: rawAssessment.section1_who_title || "Who can take this?",
          section1_who_content: rawAssessment.section1_who_content || "This assessment is designed for adults 18+.",
          
          // Section 2: About (Tile 1 & 2)
          section2_title: rawAssessment.section2_title || rawAssessment.about_title || "About this test",
          section2_content: rawAssessment.section2_content || rawAssessment.about_content || "A clinically validated tool to help you understand your mental health.",
          section2_image: rawAssessment.section2_image || rawAssessment.about_image || rawAssessment.image_url || "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop",
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
          
          // Section 4: Things to remember (Tile 5)
          section4_notes_title: rawAssessment.section4_notes_title || rawAssessment.notes_title || "Things to remember",
          section4_notes: (rawAssessment.section4_notes || rawAssessment.notes || [
            { title: "Not a diagnosis", description: "Only a professional can diagnose." },
            { title: "Confidential", description: "Your answers are private." },
            { title: "Free", description: "This assessment is completely free." }
          ]).map((n: any) => typeof n === 'string' ? { title: n, description: '' } : n)
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
        // Fallback data
        setAssessmentData({
            title: "Anxiety Assessment",
            description: "Understand your anxiety levels and get personalized insights with our clinically validated assessment.",
            hero_image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
            cta_button_text: "Start Assessment",
            cta_button_link: `/assessment-flow?type=${assessmentId}`,
            
            section1_title: "Who is this test for?",
            section1_eligibility_title: "This assessment may be helpful if you:",
            section1_eligibility_points: [
              "Often feel worried, nervous, or on edge",
              "Have trouble relaxing or calming down",
              "Experience physical symptoms like rapid heartbeat",
              "Find anxiety interfering with daily activities"
            ],
            
            section2_title: "About this test",
            section2_content: "Our anxiety assessment uses the GAD-7 (Generalized Anxiety Disorder-7) scale, a clinically validated tool widely used by healthcare professionals. It helps measure the severity of anxiety symptoms you may be experiencing.",
            section2_image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop",
            section2_bullets: [
              "Takes 3-5 minutes to complete",
              "Based on validated clinical research",
              "Provides immediate, personalized results"
            ],
            
            section3_title: "What you'll see",
            section3_subtitle: "Understanding your anxiety is the first step toward managing it effectively.",
            section3_content: [
              "You'll answer 7 questions about how you've been feeling over the past two weeks.",
              "Each question asks about the frequency of specific anxiety symptoms.",
              "Your responses generate a score that indicates your anxiety severity level.",
              "You'll receive personalized insights and recommendations."
            ],
            
            section4_notes_title: "Things to remember",
            section4_notes: [
              { title: "This is not a diagnosis", description: "This assessment is a screening tool. Only a qualified mental health professional can provide a formal diagnosis." },
              { title: "Your privacy matters", description: "Your responses are confidential and used only to generate your personalized results." },
              { title: "Seek help if needed", description: "If you're experiencing severe anxiety or crisis, please contact a mental health professional immediately." }
            ]
          });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessmentId]);

  if (isLoading || !assessmentData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>Loading assessment...</p>
      </div>
    );
  }

  const assessmentPrograms = relatedAssessments.length > 0 
    ? relatedAssessments.slice(0, 3).map((a: any) => ({
        title: a.title || a.name,
        description: a.description || a.short_description || 'Mental health assessment',
        image: a.image_url || a.thumbnail_url || a.hero_image || 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000',
        info: a.metadata?.estimated_minutes ? `${a.metadata.estimated_minutes} min Quiz` : '5 min Quiz',
        link: `/assessment-detail?id=${a.slug || a.id}`
      }))
    : [];

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

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
        />
        
        {/* RELATED ASSESSMENTS */}
        {assessmentPrograms.length > 0 && (
          <AssessmentBlock
            title="More Mental Health Assessments"
            seeMoreText="SEE ALL"
            programs={assessmentPrograms}
            onNavigate={handleNavigate}
          />
        )}
        
        <div className="flex flex-col relative z-0">
          {/* RESOURCES */}
          <ResourceSection onNavigate={handleNavigate} />
          
          {/* NEWSLETTER */}
          <NewsletterBlock
            title="Stay Informed About Mental Health"
            benefits={[
              'Get weekly mental health tips and insights',
              'Early access to new assessments and programs',
              'Exclusive resources and guided exercises'
            ]}
            imageAlt="Mental health newsletter subscription"
            ctaText="Subscribe Now"
            privacyText="Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time."
            onSubmit={(formData) => {
              console.log('Newsletter signup:', formData);
              alert(`Thank you for subscribing! We've sent a confirmation email to ${formData.email}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AssessmentDetail;
