import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../ui/utils';
import { Search } from 'lucide-react';
import { ResourcePost } from '../blocks/ResourceCard';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';
import { PullToRefresh } from '../ui/touch-feedback';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { resolveImageUrl } from '../../utils/image-utils';

import { RESOURCE_TYPES, RESOURCE_CATEGORIES } from '../../lib/constants';

interface LibraryProps {
  onResourceSelect?: (resourceId: string) => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

interface Resource extends ResourcePost {
  type: string;
  published: boolean;
}

export function Library({ onResourceSelect, onNavigate, className }: LibraryProps) {
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All stories');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);

  // Ref to track if resources have been loaded
  const hasLoadedResources = useRef(false);

  // Manual refresh function
  const handleRefresh = () => {
    hasLoadedResources.current = false;
    loadResources();
  };

  // Load resources from API
  const loadResources = async () => {
    if (hasLoadedResources.current) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getResources();
      
      if (response && Array.isArray(response)) {
        const mappedResources: Resource[] = response
          .map((resource: any) => {
            const getResourceType = (contentType: string | undefined, category: string | undefined): string => {
              const typeStr = (contentType || category || '').toLowerCase();
              const match = RESOURCE_TYPES.find(t => typeStr.includes(t.value));
              return match ? match.value : 'article';
            };

            return {
              id: resource.id || resource.resource_id || `resource-${Math.random().toString(36).substr(2, 9)}`,
              title: resource.title || 'Untitled Resource',
              description: resource.description || resource.excerpt || '',
              category: resource.category || 'General',
              type: getResourceType(resource.contentType, resource.category),
              readTime: resource.read_time_minutes 
                ? `${resource.read_time_minutes} min read` 
                : (resource.readTime || '5 min read'),
              date: resource.created_at 
                ? new Date(resource.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : (resource.date || resource.publishedDate || 'Recently'),
              image: resource.thumbnail || resource.image || resource.image_url || 
                     'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
              slug: resource.id,
              published: resource.published !== false
            };
          })
          .filter((resource: any) => resource.published !== false)
          // Sort by date (newest first) - assuming ID or created_at correlates, but best to sort if date is reliable
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Deduplicate
        const loadedResources = mappedResources.reduce((acc: Resource[], current) => {
          if (!acc.find(item => item.id === current.id)) {
            return acc.concat([current]);
          }
          return acc;
        }, []);
        
        setResources(loadedResources);
      } else {
        setResources([]);
      }
      hasLoadedResources.current = true;
    } catch (error) {
      logger.error('Failed to load resources', error);
      setResources([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleResourceClick = (post: ResourcePost) => {
    if (onResourceSelect && post.id) {
      onResourceSelect(post.id);
    } else if (onNavigate && post.id) {
      onNavigate(`/resource-detail?id=${post.id}`);
    }
  };

  // Pull to refresh handler for mobile
  const handlePullToRefresh = async () => {
    hasLoadedResources.current = false;
    await loadResources();
  };

  const categories = ['All stories', ...RESOURCE_CATEGORIES.map(c => c.label)];

  // Derived state for featured and latest news
  const featuredResource = resources.length > 0 ? resources[0] : null;
  const latestNews = resources.slice(1, 5);

  // Filter remaining resources based on category and search
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if category matches (case insensitive)
    // Note: resource.category might be "Sleep" or "sleep"
    const resourceCat = (resource.category || '').toLowerCase();
    const filterCat = activeCategoryFilter.toLowerCase();
    
    const matchesCategory = activeCategoryFilter === 'All stories' || 
                           resourceCat === filterCat;
    
    return matchesSearch && matchesCategory;
  });

  const content = (
    <div className={cn("w-full min-h-screen", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 py-8 md:px-12 md:py-16">
        
        {/* Header Section */}
        <div className="mx-[0px] my-[48px]">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl mb-8"
            style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}
          >
            Latest news
          </h1>

          {/* Featured + Latest Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Featured Card (Left) */}
            <div className="lg:col-span-7 flex flex-col">
              {loading ? (
                 <div className="w-full h-[500px] bg-black/5 animate-pulse" style={{ borderRadius: 'var(--radius-xl)' }} />
              ) : featuredResource ? (
                <div 
                  className="p-6 md:p-8 flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                  onClick={() => handleResourceClick(featuredResource)}
                  style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)' }}
                >
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: 'var(--ikan-brand-library-accent)' }}>
                    <ImageWithFallback
                      src={resolveImageUrl(featuredResource.image)}
                      alt={featuredResource.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col items-start">
                    <span 
                      className="px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                      style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                    >
                      Featured story
                    </span>
                    
                    <h2 
                      className="text-3xl md:text-4xl mb-4 leading-tight"
                      style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}
                    >
                      {featuredResource.title}
                    </h2>
                    
                    <p 
                      className="mb-8 text-sm md:text-base"
                      style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}
                    >
                      {featuredResource.date}
                    </p>
                    
                    <button 
                      className="mt-auto px-8 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
                      style={{ 
                        background: 'linear-gradient(90deg, var(--ikan-brand-cta-gradient-start) 0%, var(--ikan-brand-cta-gradient-end) 100%)',
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-primary)'
                       }}
                    >
                      Read more
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Latest News Grid (Right) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 content-start">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="w-full aspect-[4/3] bg-black/5 rounded-2xl animate-pulse" />
                    <div className="h-4 bg-black/5 w-3/4 rounded animate-pulse" />
                    <div className="h-3 bg-black/5 w-1/2 rounded animate-pulse" />
                  </div>
                ))
              ) : latestNews.map((news) => (
                <div 
                  key={news.id} 
                  className="flex flex-col group cursor-pointer"
                  onClick={() => onNavigate?.(`/resource-detail?id=${news.id}`)}
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <ImageWithFallback
                      src={resolveImageUrl(news.image)}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 
                    className="text-lg leading-snug mb-2 transition-colors line-clamp-2"
                    style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}
                  >
                    {news.title}
                  </h3>
                  <span 
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}
                  >
                    {news.date}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* News by Topic Section */}
        <div className="mt-20">
          <div className="flex flex-col gap-8 mb-10">
            <h2 
              className="text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}
            >
              News by topic
            </h2>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const isActive = activeCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                      isActive
                        ? "border-[var(--color-primary-default)]"
                        : "border-transparent"
                    )}
                    style={{
                        backgroundColor: isActive ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                        color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-base)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Optional Search within topics */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <input 
                    type="text" 
                    placeholder="Search articles..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border-none text-sm focus:ring-1 focus:ring-black/10"
                    style={{ 
                        backgroundColor: 'var(--color-bg-card)',
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-primary)'
                    }}
                />
            </div>
          </div>

          {/* All Resources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="w-full aspect-[4/3] bg-black/5 rounded-2xl animate-pulse" />
                    <div className="h-4 bg-black/5 w-3/4 rounded animate-pulse" />
                    <div className="h-3 bg-black/5 w-1/2 rounded animate-pulse" />
                  </div>
                ))
            ) : filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                    <div 
                      key={resource.id} 
                      className="flex flex-col group cursor-pointer"
                      onClick={() => onNavigate?.(`/resource-detail?id=${resource.id}`)}
                    >
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                        <ImageWithFallback
                          src={resolveImageUrl(resource.image)}
                          alt={resource.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h3 
                        className="text-lg leading-snug mb-2 transition-colors line-clamp-2"
                        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}
                      >
                        {resource.title}
                      </h3>
                      <span 
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}
                      >
                        {resource.date}
                      </span>
                    </div>
                  ))
            ) : (
                <div className="col-span-full py-20 text-center">
                    <p style={{ fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)' }}>No articles found matching your criteria.</p>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return isMobile ? (
    <PullToRefresh onRefresh={handlePullToRefresh}>
      {content}
    </PullToRefresh>
  ) : (
    content
  );
}