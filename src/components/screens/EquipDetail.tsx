import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { EquipHero } from '../blocks/EquipHero';
import { ContextBlock } from '../blocks/ContextBlock';
import { InfoBlock } from '../blocks/InfoBlock';
import { EquipBlock } from '../blocks/EquipBlock';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';

interface EquipDetailProps {
  equipId?: string;
  onNavigate?: (path: string) => void;
}

/**
 * ResourceSection Component
 * Fetches resource posts from the backend and displays them.
 * Uses GLOBAL APPROACH: Shows loader indefinitely if backend fails.
 */
function ResourceSection() {
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
          console.error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
          // Don't set loading to false - keep showing loader (GLOBAL APPROACH)
          return;
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
        console.error('Error fetching resources:', err);
        // Don't set loading to false - keep showing loader (GLOBAL APPROACH)
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

  return <ResourceBlock posts={posts} />;
}

/**
 * EquipDetail Component
 * Main component that displays equip program detail page with all sections.
 * Fetches equip data from backend - Shows loader if data fails (GLOBAL APPROACH).
 * 
 * Replaces the Figma import: /imports/05EquipsLp-204-5204.tsx
 * Mapped to AdminEquipProgramManager for content management.
 */
export function EquipDetail({ equipId = 'burnout-prevention', onNavigate }: EquipDetailProps) {
  const [equipData, setEquipData] = useState<any>(null);
  const [relatedPrograms, setRelatedPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch equip program data from backend
  useEffect(() => {
    const fetchEquipData = async () => {
      try {
        // Fetch main equip program data
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-cc205da9/equip/programs/${equipId}`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }
        );
        
        if (!response.ok) {
          console.error(`Failed to load equip program: ${response.status} ${response.statusText}`);
          // Don't set loading to false - keep showing loader (GLOBAL APPROACH)
          return;
        }

        const data = await response.json();
        setEquipData(data);

        // Fetch related programs
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
        
        // Only set loading to false if we successfully got the main data
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching equip program data:', err);
        // Don't set loading to false - keep showing loader indefinitely
        // This is the GLOBAL APPROACH for backend failures
      }
    };

    fetchEquipData();
  }, [equipId]);

  // Loading state - shows indefinitely if backend fails (GLOBAL APPROACH)
  if (isLoading || !equipData) {
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
          Loading program...
        </p>
      </div>
    );
  }

  // Map related programs to EquipBlock format (only if data exists)
  const equipPrograms = relatedPrograms.length > 0 
    ? relatedPrograms.slice(0, 3).map((p: any) => ({
        title: p.title || p.name,
        description: p.summary || p.description || 'Mental wellness program',
        image: p.thumbnail || p.hero_image || '',
        duration: p.duration_days ? `${p.duration_days} days` : '18 days',
        activities: 'Self-paced modules',
        link: `/equip-detail?id=${p.equip_id || p.id}`
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

  // Parse weekly structure from days array if available
  const weeklyStructure = equipData.days && equipData.days.length > 0
    ? [
        {
          title: 'Week 1-3',
          content: equipData.days.slice(0, 21).map((d: any) => `Day ${d.day}: ${d.title}`).join('\n')
        },
        {
          title: 'Week 4-6',
          content: equipData.days.slice(21, 42).map((d: any) => `Day ${d.day}: ${d.title}`).join('\n')
        }
      ]
    : equipData.weekly_structure || equipData.program_structure || [];

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="w-full">
        {/* 1. Equip Hero - DYNAMIC */}
        <EquipHero
          title={equipData.title}
          description={equipData.description || equipData.summary}
          buttonText={equipData.cta_button_text || 'Start Program'}
          buttonLink={equipData.cta_button_link || `/equip-program-onboarding?id=${equipId}`}
          backgroundImage={equipData.hero_image || equipData.thumbnail}
          backgroundAlt={`${equipData.title} - Program landing page`}
        />
        
        {/* 2. Context Block - DYNAMIC */}
        {equipData.about_title && equipData.about_content && (
          <ContextBlock
            title={equipData.about_title}
            content={equipData.about_content}
            image={equipData.about_image}
            imageAlt={`${equipData.title} - Context image`}
            videoCaption={equipData.video_caption}
          />
        )}

        {/* Fallback if no specific about section */}
        {!equipData.about_title && (
          <ContextBlock
            title="About This Program"
            content={equipData.long_description || equipData.description || equipData.summary || ''}
            image={equipData.about_image}
            imageAlt={`${equipData.title} - Program overview`}
          />
        )}
        
        {/* 3. Info Block - DYNAMIC (Weekly Program Structure) */}
        {weeklyStructure && weeklyStructure.length > 0 && (
          <InfoBlock
            title={equipData.structure_title || 'Weekly Program Structure'}
            subtitle={equipData.structure_subtitle || `${equipData.duration_days || 18} days of guided activities`}
            items={weeklyStructure}
          />
        )}
        
        {/* 4. Equip Block - DYNAMIC (Related Programs) */}
        {equipPrograms.length > 0 && (
          <EquipBlock
            title={equipData.related_programs_title || 'More Equip Programs'}
            footerText={equipData.related_programs_subtitle || 'Explore other programs to support your mental wellness journey'}
            programs={equipPrograms}
            onNavigate={handleNavigate}
          />
        )}
        
        {/* 5. Resource Block - DYNAMIC */}
        <ResourceSection />
        
        {/* 6. Newsletter Block - STATIC */}
        <NewsletterBlock
          imageUrl={equipData.newsletter_image || ''}
          imageAlt="Newsletter subscription"
        />
      </div>
    </div>
  );
}

export default EquipDetail;