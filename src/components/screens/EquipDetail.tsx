import { equipMeta } from '../../lib/equip-meta';
import { useState, useEffect } from 'react';
import { projectId } from '../../utils/supabase/info';
import { getAuthHeaders } from '../../lib/supabase-client';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { EquipHero } from '../page-blocks/EquipHero';
import { EquipBentoGrid } from '../page-blocks/EquipBentoGrid';
import { EquipBlock } from '../page-blocks/EquipBlock';
import { ResourceBlock } from '../page-blocks/ResourceBlock';
import { NewsletterBlock } from '../page-blocks/NewsletterBlock';
import { ResourcePost } from '../page-blocks/ResourceCard';
import { MobileHeader } from '../navigation/MobileHeader';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSeo } from '../../hooks/useSeo';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton-loader';
import { NEWSLETTER_CONTENT, LEGACY_PROGRAM_IDS } from '../../lib/constants/content';

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
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckDone, setPurchaseCheckDone] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

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

        // Guard: non-admin users cannot view unpublished programs
        if (program.published === false && !user?.is_admin) {
            throw new Error('Program not available');
        }

        // Pick the first usable image, preferring stable public URLs over
        // expiring Supabase Storage signed URLs (`/object/sign/`).
        const imageCandidates = [program.hero_image, program.image_url, program.cover_image, program.thumbnail]
          .filter((u: any): u is string => typeof u === 'string' && u.trim() !== '');
        const heroImage = imageCandidates.find((u) => !u.includes('/object/sign/')) || imageCandidates[0] || '';

        setEquipData({
          ...program,
          hero_image: heroImage,
          cta_button_link: program.cta_button_link || `/equip-program-onboarding?id=${equipId}`,
        });

        // Fetch related programs
        try {
          const relatedProgramsList = await apiClient.getEquipPrograms();
          // Filter to published only, exclude current, limit to 3
          const filtered = relatedProgramsList
            .filter((p: any) => p.published === true && (p.id !== equipId && p.equip_id !== equipId));
          setRelatedPrograms(filtered.slice(0, 3) || []);
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

  // Check if user has purchased the program
  useEffect(() => {
    const checkPurchase = async () => {
      if (user && equipData?.is_paid) {
        try {
          const response = await apiClient.checkProgramPurchase(equipId);
          setHasPurchased(response.purchased);
        } catch (err) {
          console.error('Error checking program purchase:', err);
        } finally {
          setPurchaseCheckDone(true);
        }
      } else {
        // Free programs or not logged in — skip purchase check
        setPurchaseCheckDone(true);
      }
    };

    if (!isLoading && equipData) {
      checkPurchase();
    }
  }, [user, equipId, equipData, isLoading]);

  useSeo({
    enabled: !!equipData,
    title: equipData?.title,
    description: equipData?.description,
    image: equipData?.hero_image,
    canonicalPath: equipData ? `/equip/${equipData.slug || equipId}` : undefined,
    type: 'article',
    jsonLd: equipData ? {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: equipData.title,
      description: equipData.description,
      provider: { '@type': 'Organization', name: 'iKan Health', url: 'https://ikanhealth.in' },
      url: `https://ikanhealth.in/equip/${equipData.slug || equipId}`,
    } : null,
  });

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

  // Paid program helpers
  const isPaid = !!(equipData.is_paid && equipData.price > 0);
  const priceDisplay = isPaid
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: equipData.currency || 'INR', minimumFractionDigits: 0 }).format(equipData.price / 100)
    : null;
  const canStart = !isPaid || hasPurchased;

  // CTA button text depends on payment status
  const ctaButtonText = (() => {
    if (!isPaid) return equipData.cta_button_text || 'Start Program';
    if (hasPurchased) return 'Continue to Program';
    return `Pay ${priceDisplay} to Start`;
  })();

  const handleCtaClick = () => {
    if (!isPaid || hasPurchased) {
      handleNavigate(equipData.cta_button_link || `/equip-program-onboarding?id=${equipId}`);
    } else {
      // Navigate to onboarding which will handle payment gate
      handleNavigate(`/equip-program-onboarding?id=${equipId}`);
    }
  };

  // Map related programs to EquipBlock format
  const equipPrograms = relatedPrograms
    .filter(p => p.id !== equipId) // Exclude current program
    .filter(p => !legacyIds.includes(p.id || p.equip_id)) // Exclude legacy programs
    .slice(0, 3)
    .map((p: any) => ({
        title: p.title || p.name,
        description: p.summary || p.description || '',
        image: p.thumbnail || p.thumbnail_url || p.image_url || p.hero_image || p.image || p.cover_image || p.metadata?.image || p.metadata?.thumbnail || '',
        // From the programme's own content, not the authored field: the two
        // agree on exactly one of four live records. `''` renders no badge.
        duration: equipMeta(p).days !== null ? `${equipMeta(p).days} days` : '',
        // Was the literal string "Self-paced modules" on every card. The real
        // activity count is in the content and now gets counted; absent stays
        // absent rather than falling back to a phrase that says nothing.
        activities: equipMeta(p).activities !== null ? `${equipMeta(p).activities} activities` : '',
        link: p.slug ? `/equip/${p.slug}` : `/equip-detail?id=${p.equip_id || p.id}`
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

      <div className="w-full">
        {/* HERO SECTION */}
        <EquipHero
          title={equipData.title}
          description={equipData.description}
          buttonText={ctaButtonText}
          buttonLink={equipData.cta_button_link || `/equip-program-onboarding?id=${equipId}`}
          onButtonClick={handleCtaClick}
          backgroundImage={equipData.hero_image}
          backgroundAlt={`${equipData.title} - Program landing page`}
        />

        {/* PRICING BANNER (for paid programs) */}
        {isPaid && (
          <div style={{
            maxWidth: 800, margin: '0 auto', padding: '0 var(--spacing-4)',
          }}>
            <div style={{
              background: hasPurchased
                ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                : 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-5) var(--spacing-6)',
              border: `1px solid ${hasPurchased ? '#BBF7D0' : '#FDE68A'}`,
              marginTop: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap' as const,
              gap: 'var(--spacing-3)',
            }}>
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-base)',
                  color: hasPurchased ? 'var(--color-status-success)' : 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  {hasPurchased ? '✓ You have access to this program' : 'Premium Program'}
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 400,
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-muted)',
                  margin: '4px 0 0',
                }}>
                  {hasPurchased
                    ? 'Start or continue your program anytime.'
                    : `One-time payment of ${priceDisplay} for full access`}
                </p>
              </div>
              {/* Pay button intentionally removed — the hero CTA is the single pay action */}
            </div>
          </div>
        )}
        
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
          rightColumnItems={equipData.metadata?.right_column_items}
          howItWorksSubtitle={equipData.metadata?.how_it_works_subtitle}
          howItWorksFooter={equipData.metadata?.how_it_works_footer}
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