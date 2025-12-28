import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { Search, BookOpen, Play, Video, Wrench, FileText, RefreshCw } from 'lucide-react';
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

interface LibraryProps {
  onResourceSelect?: (resourceId: string) => void;
  className?: string;
}

interface Resource extends ResourcePost {
  type: 'article' | 'video' | 'tool';
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
            const getResourceType = (contentType: string | undefined, category: string | undefined): 'article' | 'video' | 'tool' => {
              const typeStr = (contentType || category || '').toLowerCase();
              if (typeStr.includes('video')) return 'video';
              if (typeStr.includes('tool') || typeStr.includes('workbook')) return 'tool';
              return 'article';
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
    const matchesCategory = activeCategoryFilter === 'all' || resource.category === activeCategoryFilter;
    
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

  // Type filter buttons
  const typeFilters = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'article', label: 'Articles', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'tool', label: 'Tools', icon: Wrench }
  ];

  // Derive unique categories from resources
  const categoryFilters = useMemo(() => {
    // Get all unique categories from loaded resources
    const categories = new Set(resources.map(r => r.category).filter(Boolean));
    
    // Start with "All Resources"
    const filters = [{ id: 'all', label: 'All Resources' }];
    
    // Add dynamic categories
    Array.from(categories).sort().forEach(category => {
      filters.push({ id: category, label: category });
    });
    
    return filters;
  }, [resources]);

  // Pull to refresh handler for mobile
  const handlePullToRefresh = async () => {
    hasLoadedResources.current = false;
    await loadResources();
  };

  const content = (
    <div className={cn("w-full max-w-7xl mx-auto px-4 py-8 space-y-8", className)}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-4"
      >
        <h1 style={{ 
          fontSize: 'var(--text-3xl)', 
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}>
          Resources
        </h1>
        <p className="text-lg text-[var(--ikan-color-text-muted)] max-w-2xl">
          Gain insight into your mental and emotional health and find ways to support yourself.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        {/* Search Bar */}
        <div className="w-full max-w-lg relative">
          <div 
            className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
            style={{ paddingLeft: 'var(--spacing-5)' }}
          >
            <Search size={14} style={{ color: '#D9D9D9' }} />
          </div>
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200"
            style={{
              paddingLeft: 'calc(var(--spacing-3) * 4)',
              paddingRight: 'var(--spacing-4)',
              paddingTop: 'var(--spacing-3)',
              paddingBottom: 'var(--spacing-3)',
              backgroundColor: 'white',
              fontSize: 'var(--text-sm)',
              color: '#757575'
            }}
          />
        </div>

        {/* Type Filter Buttons */}
        <ResourceType 
          activeType={activeTypeFilter} 
          onTypeChange={setActiveTypeFilter} 
        />
      </div>

      {/* Category Filter Pills */}
      <div 
        className="rounded-2xl inline-flex flex-wrap"
        style={{ 
          backgroundColor: '#F5F5F5',
          padding: 'var(--spacing-2)',
          gap: 'var(--spacing-2)'
        }}
      >
        {categoryFilters.map((filter) => {
          const isActive = activeCategoryFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              onClick={() => setActiveCategoryFilter(filter.id)}
              variant="ghost"
              className="rounded-2xl"
              style={{
                paddingLeft: 'var(--spacing-5)',
                paddingRight: 'var(--spacing-5)',
                paddingTop: 'var(--spacing-3)',
                paddingBottom: 'var(--spacing-3)',
                backgroundColor: isActive ? '#2e2a2f' : 'transparent',
                color: isActive ? 'white' : '#757575',
                fontSize: 'var(--text-sm)'
              }}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

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
  );

  return isMobile ? (
    <PullToRefresh onRefresh={handlePullToRefresh}>
      {content}
    </PullToRefresh>
  ) : (
    content
  );
}