import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ResourcePost } from '../blocks/ResourceCard';
import { apiClient } from '../../lib/api-client';
import { Play } from 'lucide-react';
import { cn } from '../ui/utils';
import { NEWSLETTER_CONTENT } from '../../lib/constants/content';

interface AboutUsProps {
  onNavigate?: (route: string, resourceId?: string) => void;
  onGetStarted?: () => void;
  className?: string;
}

export function AboutUs({ onNavigate, onGetStarted, className }: AboutUsProps) {
  const isMobile = useIsMobile();
  const { showToast } = useNotifications();
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Data State
  const [pageData, setPageData] = useState<any>(null);
  const [resources, setResources] = useState<ResourcePost[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      
      // 1. Fetch 'About' Page Content (CMS)
      const fetchPage = async () => {
        try {
          setLoadingPage(true);
          // Try to fetch 'about' page first, fallback to 'about-us' logic handled by server if mapped
          // Server endpoint: /cms/pages/:pageId
          // We use 'about' as the standard ID/slug
          const page = await apiClient.getPage('about');
          setPageData(page);
        } catch (error) {
          console.error('Failed to fetch about page:', error);
          // Fallback content if CMS fails? 
          // We'll leave pageData null and render hardcoded if needed, 
          // but server creates default if missing, so it should return something.
        } finally {
          setLoadingPage(false);
        }
      };

      // 2. Fetch Resources via API Client
      const fetchResources = async () => {
        try {
          setLoadingResources(true);
          const resourcesData = await apiClient.getResources();
          
          if (resourcesData && Array.isArray(resourcesData) && resourcesData.length > 0) {
              const mappedResources = resourcesData.slice(0, 3).map((r: any) => ({
                id: r.id,
                title: r.title,
                description: r.excerpt,
                image: r.image_url,
                category: r.category,
                author: r.author,
                readTime: `${r.read_time_minutes || 5} min read`,
                date: new Date(r.created_at).toLocaleDateString()
              }));
              setResources(mappedResources);
          } else {
              setResources([]);
          }
        } catch (err) {
          console.log('Resources fetch failed:', err);
          setResources([]);
        } finally {
          setLoadingResources(false);
        }
      };
      
      // Execute fetches
      await Promise.all([fetchPage(), fetchResources()]);
    };
    
    fetchData();
  }, []);

  const handleVideoPlay = () => {
    setShowVideoModal(true);
    showToast('info', 'Video Player', 'Opening video demo...');
  };

  // Default Header Data (if CMS missing)
  const headerTitle = pageData?.title || "To us, mental health matters.";
  const headerSubtitle = pageData?.metaDescription || "At ikan, we believe mental health is for everyone.";
  const headerImage = pageData?.heroImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop";

  return (
    <div className={`w-full ${className || ''}`} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header Section */}
      <section className="relative w-full h-[400px] lg:h-[500px]">
        <ImageWithFallback 
          src={headerImage}
          alt="About Us Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
           <h1 
             className="text-white mb-4 max-w-4xl"
             style={{ 
               fontSize: 'var(--text-4xl)', 
               fontWeight: 'var(--font-weight-medium)',
               fontFamily: 'var(--font-family-base)'
             }}
           >
             {headerTitle}
           </h1>
           <p 
             className="text-white/90 max-w-2xl text-lg"
             style={{ fontFamily: 'var(--font-family-base)' }}
           >
             {headerSubtitle}
           </p>
        </div>
      </section>

      {/* Content Section (CMS Powered) */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {loadingPage ? (
           <div className="text-center py-12">
             <div className="animate-spin rounded-full border-4 mx-auto mb-4 w-12 h-12 border-primary border-t-transparent" />
             <p className="text-muted-foreground">Loading content...</p>
           </div>
        ) : (
           <div className="prose max-w-none" style={{ fontFamily: 'var(--font-family-base)' }}>
              {pageData?.content ? (
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Content not available. Please configure the "About" page in the Admin Panel.</p>
                </div>
              )}
           </div>
        )}
      </section>

      {/* Resources Section */}
      <ResourceBlock 
        title="Resources"
        posts={resources}
        loading={loadingResources}
        onPostClick={(post) => onNavigate?.('/resource-detail', post.id)}
        onViewAll={() => onNavigate?.('/resource')}
      />

      {/* Newsletter Section */}
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

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Our Story</h3>
                <button onClick={() => setShowVideoModal(false)} className="text-gray-500 hover:text-black">Close</button>
             </div>
             <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white">
                <p>Video Player Placeholder</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}