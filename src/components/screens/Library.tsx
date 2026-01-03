import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { Search, BookOpen, Play, Video, Wrench, FileText, RefreshCw, Activity, Mic, GraduationCap } from 'lucide-react';
import { CardSkeleton, LibraryEmptyState, StaggeredReveal } from '../utils/LoadingStates';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { ResourceType } from '../blocks/ResourceType';
import { ResourceCard, ResourcePost } from '../blocks/ResourceCard';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';
import { SkeletonCard } from '../ui/skeleton-loader';
import { ErrorState } from '../ui/error-state';
import { EmptyState } from '../ui/empty-state';
import { OptimizedImage } from '../ui/optimized-image';
import { PullToRefresh } from '../ui/touch-feedback';
import { PageHero } from '../ui/PageHero';

import { RESOURCE_TYPES, RESOURCE_CATEGORIES } from '../../lib/constants';

const ICON_MAP: Record<string, any> = {
  'file-text': FileText,
  'tool': Wrench,
  'activity': Activity,
  'video': Video,
  'mic': Mic,
  'book': BookOpen,
  'graduation-cap': GraduationCap
};

interface LibraryProps {
  onResourceSelect?: (resourceId: string) => void;
  className?: string;
}

interface Resource extends ResourcePost {
  type: string;
}

export function Library({ onResourceSelect, className }: LibraryProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);

  // Ref to track if resources have been loaded
  const hasLoadedResources = useRef(false);

  // Manual refresh function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    hasLoadedResources.current = false;
    loadResources();
  };

  // Load resources from API
  const loadResources = async () => {
    if (hasLoadedResources.current) return;
    
    try {
      setLoading(true);
      
      console.log('📚 Loading resources from API...');
      
      const response = await apiClient.getResources();
      
      console.log('📚 API Response:', {
        isArray: Array.isArray(response),
        count: response?.length,
        firstResource: response?.[0]
      });
      
      // getResources() already returns the array directly
      if (response && Array.isArray(response)) {
        // Map the response to match ResourcePost interface
        const mappedResources: Resource[] = response
          .map((resource: any) => {
            // Log each resource for debugging
            console.log('📄 Mapping resource:', {
              id: resource.id,
              title: resource.title,
              category: resource.category,
              contentType: resource.contentType,
              published: resource.published
            });

            // Helper to determine resource type from category or contentType
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
              
              // Map contentType/category to type for filtering
              type: getResourceType(resource.contentType, resource.category),
              
              // Format read time
              readTime: resource.read_time_minutes 
                ? `${resource.read_time_minutes} min read` 
                : (resource.readTime || '5 min read'),
              
              // Format date
              date: resource.created_at 
                ? new Date(resource.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : (resource.date || resource.publishedDate || 'Recently'),
              
              // Use thumbnail or fallback
              image: resource.thumbnail || resource.image || resource.image_url || 
                     'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
              
              slug: resource.id,
              
              // Store published status for filtering
              published: resource.published !== false
            };
          })
          // Filter out unpublished resources (drafts)
          .filter((resource: any) => resource.published !== false);

        // Deduplicate resources by ID
        const loadedResources = mappedResources.reduce((acc: Resource[], current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        setResources(loadedResources);
        
        console.log('✅ Resources loaded and mapped:', {
          total: response.length,
          published: loadedResources.length,
          categories: [...new Set(loadedResources.map(r => r.category))],
          types: [...new Set(loadedResources.map(r => r.type))]
        });
        
        logger.info('Resources loaded successfully from API', { count: loadedResources.length });
      } else {
        logger.warn('No resources returned from API');
        console.warn('❌ API returned non-array response:', response);
        setResources([]);
      }
      
      hasLoadedResources.current = true;
      
    } catch (error) {
      logger.error('Failed to load resources', error);
      console.error('❌ Resource load error:', error);
      setResources([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTypeFilter === 'all' || resource.type === activeTypeFilter;
    const matchesCategory = activeCategoryFilter === 'all' || 
                           (resource.category || '').toLowerCase() === activeCategoryFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleResourceClick = (post: ResourcePost) => {
    logger.info('Resource clicked:', post.id);
    // Navigate to resource detail with the resource ID
    if (onResourceSelect && post.id) {
      onResourceSelect(post.id);
    } else {
      logger.warn('Cannot navigate: missing onResourceSelect or post.id', { 
        hasHandler: !!onResourceSelect, 
        postId: post.id 
      });
    }
  };

  // Derive unique categories from resources
  const categoryFilters = useMemo(() => {
    return [
      { id: 'all', label: 'All Resources' },
      ...RESOURCE_CATEGORIES.map(c => ({ id: c.value, label: c.label }))
    ];
  }, []);

  // Pull to refresh handler for mobile
  const handlePullToRefresh = async () => {
    hasLoadedResources.current = false;
    await loadResources();
  };

  const content = (
    <div className={cn("w-full bg-[#f5f5f5]", className)}>
      {/* Custom Hero Section with Search & Filters */}
      <div className="w-full bg-black pt-[140px] pb-[60px] md:pt-[160px] md:pb-[80px] px-4 flex flex-col items-center justify-center text-center">
        <h1 
          className="font-['Ubuntu',sans-serif] font-medium text-white mb-4"
          style={{ fontSize: '48px', lineHeight: '1.2' }}
        >
          Resources
        </h1>
        <p 
          className="font-['Ubuntu',sans-serif] text-white max-w-2xl mx-auto opacity-80 mb-10"
          style={{ fontSize: '18px', lineHeight: '28px' }}
        >
          Gain insight into your mental and emotional health and find ways to support yourself.
        </p>

        {/* Search & Filters Container */}
        <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
          
          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-5">
              <Search size={20} className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-5 rounded-2xl border-none bg-white text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap justify-center gap-3">
             <Button
                onClick={() => setActiveTypeFilter('all')}
                variant="ghost"
                className={cn(
                  "rounded-full border transition-all h-10 px-5 gap-2",
                  activeTypeFilter === 'all' 
                    ? "bg-white text-black border-white hover:bg-white/90" 
                    : "bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
                )}
              >
                <BookOpen size={16} />
                All
              </Button>
              {RESOURCE_TYPES.map(t => {
                const Icon = ICON_MAP[t.icon] || BookOpen;
                const isActive = activeTypeFilter === t.value;
                return (
                  <Button
                    key={t.value}
                    onClick={() => setActiveTypeFilter(t.value)}
                    variant="ghost"
                    className={cn(
                      "rounded-full border transition-all h-10 px-5 gap-2",
                      isActive
                        ? "bg-white text-black border-white hover:bg-white/90" 
                        : "bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={16} />
                    {t.label}
                  </Button>
                )
              })}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
             {categoryFilters.map(c => {
               const isActive = activeCategoryFilter === c.id;
               return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategoryFilter(c.id)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 border",
                      isActive 
                        ? "bg-white text-black border-white shadow-sm" 
                        : "bg-transparent text-white/70 border-transparent hover:bg-white/10 hover:text-white"
                    )}
                    style={{ fontFamily: 'Ubuntu, sans-serif' }}
                  >
                    {c.label}
                  </button>
               )
             })}
          </div>

        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Resources Grid */}
      <div className="w-full">
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 'var(--spacing-4)' }}
        >
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              post={resource}
              onClick={() => handleResourceClick(resource)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen 
              size={48} 
              className="mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <h3 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              No resources found
            </h3>
            <p 
              className="mt-2"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}
            >
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: 'var(--spacing-4)' }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-xl">
                <CardContent style={{ padding: 'var(--spacing-4)' }}>
                  <div 
                    className="animate-pulse flex flex-col"
                    style={{ gap: 'var(--spacing-4)' }}
                  >
                    <div className="aspect-video bg-gray-200 rounded-xl"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div 
                      className="flex flex-col"
                      style={{ gap: 'var(--spacing-2)' }}
                    >
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Resource Section */}
        {/* Removed duplicate Featured Resource Section */}

        {/* More Resources Section */}
        {/* Removed duplicate More Resources Section */}
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