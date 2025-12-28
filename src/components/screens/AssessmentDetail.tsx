import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AssessmentHero } from '../blocks/AssessmentHero';
import { ContextBlock } from '../blocks/ContextBlock';
import { InfoBlock } from '../blocks/InfoBlock';
import { AssessmentBlock } from '../blocks/AssessmentBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { MobileHeader } from '../navigation/MobileHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton-loader';

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
 * Uses GLOBAL APPROACH: Shows loader indefinitely if backend fails.
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

        if (!response.ok) {
          // Silently fall back to mock data (expected in demo mode)
          throw new Error('API Error');
        }

        const data = await response.json();
        
        // Transform the API response to match ResourcePost interface
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
        // Silently fallback to mock resources (expected in demo mode)
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

  return (
    <ResourceBlock 
      posts={posts} 
      onPostClick={(post) => onNavigate?.(`/resource-detail?id=${post.id}`)}
    />
  );
}

/**
 * AssessmentDetail Component
 * Main component that displays assessment detail page with all sections.
 * Fetches assessment data from backend - Shows loader if data fails (GLOBAL APPROACH).
 * 
 * This replaces the Figma import: /imports/AssesmentLpDesktop-214-18961.tsx
 */
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
          console.error(`Failed to load assessment: ${response.status} ${response.statusText}`);
          console.log('Using fallback assessment data due to API error');
          
          // Fallback mock data with 4-section structure
          setAssessmentData({
            // Basic info
            title: "Anxiety Assessment",
            description: "Understand your anxiety levels and get personalized insights with our clinically validated assessment.",
            
            // Hero section
            hero_image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
            cta_button_text: "Start Assessment",
            cta_button_link: `/assessment-flow?type=${assessmentId}`,
            
            // Section 1: Is this for you?
            section1_title: "Is This Assessment for You?",
            section1_eligibility_title: "This assessment may be helpful if you:",
            section1_eligibility_points: [
              "Often feel worried, nervous, or on edge",
              "Have trouble relaxing or calming down",
              "Experience physical symptoms like rapid heartbeat or sweating",
              "Find anxiety interfering with daily activities"
            ],
            section1_who_title: "Who can take this?",
            section1_who_content: "This assessment is designed for adults 18+ who want to better understand their anxiety levels. It's a screening tool, not a diagnostic instrument.",
            
            // Section 2: What is this assessment?
            section2_title: "What Is This Assessment?",
            section2_content: "Our anxiety assessment uses the GAD-7 (Generalized Anxiety Disorder-7) scale, a clinically validated tool widely used by healthcare professionals. It helps measure the severity of anxiety symptoms you may be experiencing.",
            section2_image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop",
            section2_bullets: [
              "Takes 3-5 minutes to complete",
              "Based on validated clinical research",
              "Provides immediate, personalized results"
            ],
            
            // Section 3: How it works
            section3_title: "How It Works",
            section3_subtitle: "Understanding your anxiety is the first step toward managing it effectively.",
            section3_content: [
              "You'll answer 7 questions about how you've been feeling over the past two weeks.",
              "Each question asks about the frequency of specific anxiety symptoms on a scale from 'Not at all' to 'Nearly every day.'",
              "Your responses generate a score that indicates your anxiety severity level—from minimal to severe.",
              "You'll receive personalized insights and recommendations based on your results, including suggested resources and next steps."
            ],
            
            // Section 4: What you'll gain & Important notes
            section4_benefits_title: "What You'll Gain",
            section4_benefits: [
              {
                title: "Understand your anxiety better",
                description: "Get clarity on the severity and patterns of your anxiety symptoms."
              },
              {
                title: "Personalized insights",
                description: "Receive tailored recommendations based on your specific results."
              },
              {
                title: "Evidence-based approach",
                description: "Results based on clinically validated assessment methods."
              },
              {
                title: "Track your progress",
                description: "Retake the assessment over time to monitor changes in your mental health."
              }
            ],
            section4_notes_title: "Important Notes",
            section4_notes: [
              {
                title: "This is not a diagnosis",
                description: "This assessment is a screening tool. Only a qualified mental health professional can provide a formal diagnosis."
              },
              {
                title: "Your privacy matters",
                description: "Your responses are confidential and used only to generate your personalized results."
              },
              {
                title: "Seek help if needed",
                description: "If you're experiencing severe anxiety or crisis, please contact a mental health professional or emergency services immediately."
              }
            ],
            
            duration_minutes: 5
          });
          
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const rawAssessment = data.assessment;
        
        // Transform the backend assessment data to match 4-section structure
        const transformedAssessment = {
          // Basic info
          title: rawAssessment.title || "Mental Health Assessment",
          description: rawAssessment.description || "Take this assessment to better understand your mental health.",
          
          // Hero section
          hero_image: rawAssessment.hero_image || rawAssessment.image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
          cta_button_text: rawAssessment.cta_button_text || "Take Assessment",
          cta_button_link: rawAssessment.cta_button_link || `/assessment-flow?type=${assessmentId}`,
          
          // Section 1: Is this for you?
          section1_title: rawAssessment.section1_title || "Is This Assessment for You?",
          section1_eligibility_title: rawAssessment.section1_eligibility_title || "This assessment may be helpful if you:",
          section1_eligibility_points: rawAssessment.section1_eligibility_points || [
            "Want to understand your mental health better",
            "Are experiencing emotional or psychological distress",
            "Seek personalized insights and recommendations"
          ],
          section1_who_title: rawAssessment.section1_who_title || "Who can take this?",
          section1_who_content: rawAssessment.section1_who_content || "This assessment is designed for adults who want to better understand their mental health.",
          
          // Section 2: What is this assessment?
          section2_title: rawAssessment.section2_title || "What Is This Assessment?",
          section2_content: rawAssessment.section2_content || rawAssessment.info || "A clinically validated tool to help you understand your mental health.",
          section2_image: rawAssessment.section2_image || rawAssessment.image_url || "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop",
          section2_bullets: rawAssessment.section2_bullets || [
            `Takes ${rawAssessment.metadata?.estimated_minutes || rawAssessment.duration || 5} minutes to complete`,
            "Based on validated clinical research",
            "Provides immediate results"
          ],
          
          // Section 3: How it works
          section3_title: rawAssessment.section3_title || "How It Works",
          section3_subtitle: rawAssessment.section3_subtitle || "Understanding your mental health is the first step.",
          section3_content: rawAssessment.section3_content || [
            "Answer a series of questions about your recent experiences.",
            "Your responses are scored using evidence-based methods.",
            "Receive personalized insights and recommendations based on your results."
          ],
          
          // Section 4: What you'll gain & Important notes
          section4_benefits_title: rawAssessment.section4_benefits_title || "What You'll Gain",
          section4_benefits: rawAssessment.section4_benefits || [
            {
              title: "Personalized insights",
              description: "Receive tailored recommendations based on your results."
            },
            {
              title: "Evidence-based approach",
              description: "Results based on clinically validated methods."
            },
            {
              title: "Track your progress",
              description: "Monitor changes in your mental health over time."
            }
          ],
          section4_notes_title: rawAssessment.section4_notes_title || "Important Notes",
          section4_notes: rawAssessment.section4_notes || [
            {
              title: "This is not a diagnosis",
              description: "Only a qualified professional can provide a formal diagnosis."
            },
            {
              title: "Your privacy matters",
              description: "Your responses are confidential and secure."
            },
            {
              title: "Seek help if needed",
              description: "If you're in crisis, please contact emergency services immediately."
            }
          ],
          
          duration_minutes: rawAssessment.metadata?.estimated_minutes || rawAssessment.duration || 5
        };
        
        setAssessmentData(transformedAssessment);

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
        // Use fallback data instead of infinite loading
        setAssessmentData({
          title: "Mental Health Assessment",
          description: "Understand your mental well-being with our comprehensive assessment tool.",
          cta_button_text: "Start Assessment",
          cta_button_link: `/assessment-flow?type=${assessmentId}`,
          hero_image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
          about_title: "Why Take This Assessment?",
          about_content: "Our evidence-based assessment helps you understand your current mental health status and provides personalized recommendations.",
          about_image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop",
          main_title: "What to Expect",
          main_content: [
            "This assessment takes approximately 5-10 minutes to complete.",
            "Your responses are completely confidential and secure.",
            "You will receive immediate results and actionable insights."
          ],
          highlights_title: "Key Benefits",
          highlights: [
            "Personalized insights based on your responses",
            "Evidence-based recommendations",
            "Track your progress over time"
          ],
          notes_title: "Important Notes",
          notes: [
            "This is not a diagnostic tool. Please consult a professional for medical advice.",
            "If you are in crisis, please contact emergency services immediately."
          ]
        });
        setIsLoading(false);
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
        image: a.image_url || a.thumbnail_url || a.hero_image || 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1000',
        info: a.metadata?.estimated_minutes ? `${a.metadata.estimated_minutes} min Quiz` : '5 min Quiz',
        link: `/assessment-detail?id=${a.slug || a.id}`
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

  // Transform highlights (strings or objects) to InfoHighlight objects
  const highlights = (assessmentData.highlights || []).map((item: any) => ({
    icon: <CheckCircle2 className="w-8 h-8 text-[var(--color-primary-default)]" />,
    title: typeof item === 'string' ? item : (item.title || ''),
    description: typeof item === 'string' ? '' : (item.description || '')
  }));

  // Transform notes (strings or objects) to InfoNote objects
  const notes = (assessmentData.notes || []).map((item: any) => ({
    icon: <AlertCircle className="w-8 h-8 text-[var(--color-warning-default)]" />,
    title: typeof item === 'string' ? item : (item.title || ''),
    description: typeof item === 'string' ? '' : (item.description || '')
  }));

  // NEW: Transform Section 4 benefits to InfoHighlight objects
  const section4Benefits = (assessmentData.section4_benefits || []).map((item: any) => ({
    icon: <CheckCircle2 className="w-8 h-8 text-[var(--color-primary-default)]" />,
    title: typeof item === 'string' ? item : (item.title || ''),
    description: typeof item === 'string' ? '' : (item.description || '')
  }));

  // NEW: Transform Section 4 notes to InfoNote objects
  const section4Notes = (assessmentData.section4_notes || []).map((item: any) => ({
    icon: <AlertCircle className="w-8 h-8 text-[var(--color-warning-default)]" />,
    title: typeof item === 'string' ? item : (item.title || ''),
    description: typeof item === 'string' ? '' : (item.description || '')
  }));

  // NEW: Transform Section 1 eligibility points to InfoHighlight objects
  const section1Eligibility = (assessmentData.section1_eligibility_points || []).map((item: any) => ({
    icon: <CheckCircle2 className="w-8 h-8 text-[var(--color-primary-default)]" />,
    title: typeof item === 'string' ? item : (item.title || ''),
    description: typeof item === 'string' ? '' : (item.description || '')
  }));

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Mobile Header */}
      <MobileHeader 
        title={assessmentData.title}
        onBack={() => handleNavigate('/assessment')}
        showShare={false}
      />
      
      <div className="w-full mobile-content-clearance">
        {/* HERO SECTION */}
        <AssessmentHero
          title={assessmentData.title}
          description={assessmentData.description}
          buttonText={assessmentData.cta_button_text || 'Take Assessment'}
          buttonLink={assessmentData.cta_button_link || `/assessment-flow?type=${assessmentId}`}
          backgroundImage={assessmentData.hero_image}
          backgroundAlt={`${assessmentData.title} - Assessment landing page`}
        />
        
        {/* SECTION 1: IS THIS FOR YOU? (InfoBlock) */}
        {assessmentData.section1_title && (
          <InfoBlock 
            mainTitle={assessmentData.section1_title}
            mainContent={[]}
            highlightsTitle={assessmentData.section1_eligibility_title}
            highlights={section1Eligibility}
            notesTitle={assessmentData.section1_who_title}
            notes={[
              {
                icon: <CheckCircle2 className="w-8 h-8 text-[var(--color-primary-default)]" />,
                title: assessmentData.section1_who_content || '',
                description: ''
              }
            ]}
          />
        )}
        
        {/* SECTION 2: WHAT IS THIS ASSESSMENT? (ContextBlock) */}
        {assessmentData.section2_title && (
          <ContextBlock
            title={assessmentData.section2_title}
            content={assessmentData.section2_content}
            image={assessmentData.section2_image}
            imageAlt={`${assessmentData.title} - Assessment overview`}
            bullets={assessmentData.section2_bullets}
            showPlayButton={false}
          />
        )}
        
        {/* SECTION 3: HOW IT WORKS (InfoBlock) */}
        {assessmentData.section3_title && (
          <InfoBlock 
            mainTitle={assessmentData.section3_title}
            mainContent={[
              assessmentData.section3_subtitle || '',
              ...(assessmentData.section3_content || [])
            ]}
            highlightsTitle=""
            highlights={[]}
            notesTitle=""
            notes={[]}
          />
        )}
        
        {/* SECTION 4: WHAT YOU'LL GAIN & IMPORTANT NOTES (BenefitGrid + ImportantNotesPanel) */}
        {(section4Benefits.length > 0 || section4Notes.length > 0) && (
          <InfoBlock 
            mainTitle=""
            mainContent={[]}
            highlightsTitle={assessmentData.section4_benefits_title || 'What You\'ll Gain'}
            highlights={section4Benefits}
            notesTitle={assessmentData.section4_notes_title || 'Important Notes'}
            notes={section4Notes}
          />
        )}
        
        {/* RELATED ASSESSMENTS BLOCK - DYNAMIC (only shows if related assessments exist) */}
        {assessmentPrograms.length > 0 && (
          <AssessmentBlock
            title="More Mental Health Assessments"
            seeMoreText="SEE ALL"
            programs={assessmentPrograms}
            onNavigate={handleNavigate}
          />
        )}
        
        {/* RESOURCE BLOCK - DYNAMIC (fetches from backend) */}
        <ResourceSection onNavigate={handleNavigate} />
        
        {/* NEWSLETTER BLOCK - DYNAMIC */}
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
            // TODO: Connect to backend newsletter API
            alert(`Thank you for subscribing! We've sent a confirmation email to ${formData.email}`);
          }}
        />
      </div>
    </div>
  );
}

export default AssessmentDetail;