import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { EquipHero } from '../blocks/EquipHero';
import { EquipBentoGrid } from '../blocks/EquipBentoGrid';
import { EquipBlock } from '../blocks/EquipBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { MobileHeader } from '../navigation/MobileHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton-loader';

interface EquipDetailProps {
  equipId?: string;
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
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/resources?limit=3`,
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
          content: resource.content || resource.description || '',
          category: resource.category || 'General',
          imageUrl: resource.thumbnail_url || resource.featured_image || '',
          readTime: resource.metadata?.read_time || '5 min read',
          link: resource.slug ? `/resources/${resource.slug}` : `/resources/${resource.id}`,
        }));

        setPosts(transformedPosts);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load resources:', err);
        setPosts([]);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
             <Skeleton variant="rectangular" height={200} className="rounded-xl" />
             <Skeleton variant="text" width="80%" />
             <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show section if no resources
  }

  return (
    <ResourceBlock 
      posts={posts} 
      onPostClick={(post) => onNavigate?.(`/resource-detail?id=${post.id}`)}
    />
  );
}

/**
 * EquipDetail Component
 * Main component that displays equip program detail page with all sections.
 * Fetches equip data from backend - Shows loader if data fails (GLOBAL APPROACH).
 * 
 * NEW 4-SECTION STRUCTURE (Sleep Tight):
 * HERO: Title, Description (max 150 chars), CTA, Background Image
 * 
 * MIDDLE SECTIONS:
 * 1. IS THIS FOR YOU? (InfoBlock)
 *    - Eligibility criteria (4 points)
 *    - Who can participate
 * 
 * 2. WHAT IS SLEEP TIGHT? (ContextBlock)
 *    - Image (left) + Content card (right)
 *    - Program includes (3 bullets)
 * 
 * 3. HOW IT WORKS (InfoBlock)
 *    - What to expect (explanation)
 * 
 * 4. WHAT YOU'LL GAIN & IMPORTANT NOTES (InfoBlock)
 *    - Benefits grid (4 cards)
 *    - Important notes panel (3 cards)
 * 
 * BOTTOM SECTIONS:
 * - EquipBlock (related programs)
 * - ResourceBlock (related resources)
 * - NewsletterBlock
 * 
 * Replaces the Figma import: /imports/05EquipsLp-204-5204.tsx
 * Mapped to AdminEquipProgramManager (Step 2: Equip Details) for content management.
 */
export function EquipDetail({ equipId = 'burnout-recovery-32', onNavigate }: EquipDetailProps) {
  const [equipData, setEquipData] = useState<any>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Fetch equip program data from backend
  useEffect(() => {
    const fetchEquipData = async () => {
      try {
        setIsLoading(true);
        // Fetch main equip program data
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip/programs/${equipId}`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to load equip program: ${response.status}`);
        }

        const data = await response.json();
        
        // Use the backend data directly
        // Ensure backward compatibility with old field names
        const program = data.program || data;
        
        setEquipData({
          ...program,
          hero_image: program.hero_image || program.thumbnail || program.image_url || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop",
          cta_button_link: program.cta_button_link || `/equip-program-onboarding?id=${equipId}`,
        });

        // Fetch related programs
        try {
          const relatedResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip/programs?limit=3`,
            {
              headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            }
          );
          
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedPrograms(relatedData.programs || []);
          }
        } catch (relatedError) {
          console.warn('Failed to load related programs:', relatedError);
        }
        
      } catch (err) {
        console.error('Error fetching equip program data:', err);
        // If specific program not found, show error state rather than fallback "Sleep Tight"
        // This prevents confusion when viewing a deleted or non-existent program
        setEquipData(null); 
      } finally {
        setIsLoading(false);
      }
    };

    if (equipId) {
      fetchEquipData();
    }
  }, [equipId]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="w-full min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: 'var(--color-bg-page)' }}
      >
         <div className="text-center space-y-4">
           <Skeleton variant="rectangular" width={60} height={60} className="mx-auto rounded-full" />
           <p style={{ 
             color: 'var(--color-text-muted)', 
             fontSize: 'var(--text-base)'
           }}>
             Loading program...
           </p>
         </div>
      </div>
    );
  }

  // Error/Empty state
  if (!equipData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[var(--color-bg-page)] p-4">
        <EmptyState
          variant="search"
          title="Program Not Found"
          description="The program you are looking for does not exist or has been removed."
          actionLabel="View All Programs"
          onAction={() => handleNavigate('/equip')}
        />
      </div>
    );
  }

  // Map related programs to EquipBlock format
  const equipPrograms = relatedPrograms
    .filter(p => p.id !== equipId) // Exclude current program
    .slice(0, 3)
    .map((p: any) => ({
        title: p.title || p.name,
        description: p.summary || p.description || 'Mental wellness program',
        image: p.thumbnail || p.hero_image || '',
        duration: p.duration_days ? `${p.duration_days} days` : '18 days',
        activities: 'Self-paced modules',
        link: `/equip-detail?id=${p.equip_id || p.id}`
      }));

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
      {/* Mobile Header */}
      <MobileHeader 
        title={equipData.title}
        onBack={() => handleNavigate('/equip')}
        showShare={false}
      />
      
      <div className="w-full mobile-content-clearance">
        {/* HERO SECTION */}
        <EquipHero
          title={equipData.title}
          description={equipData.description}
          buttonText={equipData.cta_button_text || 'Start Program'}
          buttonLink={equipData.cta_button_link || `/equip-program-onboarding?id=${equipId}`}
          backgroundImage={equipData.hero_image}
          backgroundAlt={`${equipData.title} - Program landing page`}
        />
        
        {/* MIDDLE SECTION: BENTO GRID (Replaces Sections 1-4) */}
        <EquipBentoGrid
          section1={{
             title: equipData.section1_title,
             eligibilityPoints: equipData.section1_eligibility_points,
             whoTitle: equipData.section1_who_title,
             whoContent: equipData.section1_who_content
          }}
          section2={{
             title: equipData.section2_title,
             content: equipData.section2_content,
             contentHtml: equipData.section2_content_html,
             image: equipData.section2_image,
             bullets: equipData.section2_bullets
          }}
          section3={{
             title: equipData.section3_title,
             subtitle: equipData.section3_subtitle,
             content: equipData.section3_content,
             contentHtml: equipData.section3_content_html
          }}
          section4={{
             benefitsTitle: equipData.section4_benefits_title,
             benefits: equipData.section4_benefits,
             notesTitle: equipData.section4_notes_title,
             notes: equipData.section4_notes
          }}
        />
        
        {/* BOTTOM SECTION: EQUIP BLOCK - Related Programs */}
        {equipPrograms.length > 0 && (
          <EquipBlock
            title="More Equip Programs"
            footerText="Explore other programs to support your mental wellness journey"
            programs={equipPrograms}
            onNavigate={handleNavigate}
          />
        )}
        
        {/* BOTTOM SECTION: RESOURCE BLOCK - Related Resources */}
        <ResourceSection onNavigate={handleNavigate} />
        
        {/* BOTTOM SECTION: NEWSLETTER BLOCK */}
        <NewsletterBlock
          title="Stay Updated on Mental Wellness"
          benefits={[
            'Get weekly mental wellness tips and strategies',
            'Early access to new programs and resources',
            'Exclusive guided exercises and content'
          ]}
          imageAlt="Mental wellness newsletter subscription"
          ctaText="Subscribe Now"
          privacyText="Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time."
        />
      </div>
    </div>
  );
}

export default EquipDetail;