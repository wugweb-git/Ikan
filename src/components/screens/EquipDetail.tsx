import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getEquipProgramContent } from '../../lib/equip-program-content';
import { EquipHero } from '../blocks/EquipHero';
import { EquipBentoGrid } from '../blocks/EquipBentoGrid';
import { EquipBlock } from '../blocks/EquipBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { MobileHeader } from '../navigation/MobileHeader';
import { TopNavBar } from '../navigation/TopNavBar';
import { useIsMobile } from '../../hooks/useIsMobile';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton-loader';
import { EQUIP_CONTENT, NEWSLETTER_CONTENT, LEGACY_PROGRAM_IDS, FALLBACK_IMAGES } from '../../lib/constants/content';
import { SLEEP_TIGHT_FALLBACK, FALLBACK_RELATED_PROGRAM, MOCK_RESOURCES } from '../../lib/content/equip';

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
          image: resource.image_url || resource.thumbnail_url || resource.featured_image || resource.thumbnail || resource.image || resource.metadata?.image || resource.metadata?.thumbnail || '',
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

  // Always show block, let ResourceBlock handle empty state
  // if (!loading && posts.length === 0) return null;

  return (
    <ResourceBlock 
      posts={posts} 
      loading={loading}
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
export function EquipDetail({ equipId = 'sleep-tight-9', onNavigate }: EquipDetailProps) {
  const [equipData, setEquipData] = useState<any>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Define handleNavigate at the top
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // Legacy IDs to filter out
  const legacyIds = LEGACY_PROGRAM_IDS;

  // Fetch equip program data from backend
  useEffect(() => {
    const fetchEquipData = async () => {
      try {
        setIsLoading(true);
        // Fetch main equip program data using apiClient
        const program = await apiClient.getEquipProgram(equipId);
        
        if (!program) {
            throw new Error('Program not found');
        }

        setEquipData({
          ...program,
          // Use hero_image if available, otherwise fallback to cover_image, thumbnail, or default
          hero_image: program.hero_image || program.cover_image || program.thumbnail || FALLBACK_IMAGES.DEFAULT,
          cta_button_link: program.cta_button_link || `/equip-program-onboarding?id=${equipId}`,
        });

        // Fetch related programs
        try {
          const relatedProgramsList = await apiClient.getEquipPrograms();
          // Filter to just a few
          setRelatedPrograms(relatedProgramsList.slice(0, 3) || []);
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
    .filter(p => !legacyIds.includes(p.id || p.equip_id)) // Exclude legacy programs
    .slice(0, 3)
    .map((p: any) => ({
        title: p.title || p.name,
        description: p.summary || p.description || '',
        image: p.thumbnail || p.thumbnail_url || p.image_url || p.hero_image || p.image || p.cover_image || p.metadata?.image || p.metadata?.thumbnail || '',
        duration: p.duration_days ? `${p.duration_days} days` : '',
        activities: 'Self-paced modules',
        link: `/equip-detail?id=${p.equip_id || p.id}`
      }));

  // Parse Benefits from Strings if needed (e.g. "Title | Description")
  const parsedBenefits = (equipData.overview_benefits || equipData.section4_benefits || []).map((b: any) => {
    if (typeof b === 'string' && b.includes('|')) {
      const [title, desc] = b.split('|').map((s: string) => s.trim());
      return { title, description: desc };
    }
    return b;
  });

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Mobile Header */}
      <MobileHeader 
        title={equipData.title}
        onBack={() => handleNavigate('/equip')}
        showShare={false}
        transparent={true}
      />

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <TopNavBar 
          currentRoute="/equip-detail" 
          onNavigate={handleNavigate}
        />
      </div>
      
      <div className="w-full">
        {/* HERO SECTION */}
        <EquipHero
          title={equipData.title}
          description={equipData.description}
          buttonText={equipData.cta_button_text || 'Start Program'}
          buttonLink={equipData.cta_button_link || `/equip-program-onboarding?id=${equipId}`}
          onButtonClick={() => handleNavigate(equipData.cta_button_link || `/equip-program-onboarding?id=${equipId}`)}
          backgroundImage={equipData.hero_image}
          backgroundAlt={`${equipData.title} - Program landing page`}
        />
        
        {/* MIDDLE SECTION: BENTO GRID (Replaces Sections 1-4) */}
        <EquipBentoGrid
          tile1Content={equipData.metadata?.tile1_content}
          tile2Content={equipData.metadata?.tile2_content}
          tile3Content={equipData.metadata?.tile3_content}
          tile4Content={equipData.metadata?.tile4_content}
          eligibilityIntro={equipData.metadata?.eligibility_intro}
          eligibilityPoint1={equipData.metadata?.eligibility_point_1}
          eligibilityPoint2={equipData.metadata?.eligibility_point_2}
          eligibilityPoint3={equipData.metadata?.eligibility_point_3}
          eligibilityPoint4={equipData.metadata?.eligibility_point_4}
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
          title={NEWSLETTER_CONTENT.EQUIP.title}
          benefits={NEWSLETTER_CONTENT.EQUIP.benefits}
          imageAlt={NEWSLETTER_CONTENT.EQUIP.imageAlt}
          ctaText={NEWSLETTER_CONTENT.EQUIP.ctaText}
          privacyText={NEWSLETTER_CONTENT.PRIVACY_TEXT}
        />
      </div>
    </div>
  );
}

export default EquipDetail;