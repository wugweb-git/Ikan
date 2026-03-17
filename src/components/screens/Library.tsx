import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useMetadata } from '../../hooks/useMetadata';
import { cn } from '../ui/utils';
import { Search, BookOpen, Video, Headphones, FileText, Image as ImageIcon } from 'lucide-react';
import { ResourcePost } from '../blocks/ResourceCard';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';
import { PullToRefresh } from '../ui/touch-feedback';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { resolveImageUrl } from '../../utils/image-utils';

interface LibraryProps {
  onResourceSelect?: (resourceId: string) => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

interface Resource extends ResourcePost {
  type: string;
  published: boolean;
  featured?: boolean;
}

// Content type definitions with icons
const CONTENT_TYPES = [
  { value: 'all', label: 'All', icon: null },
  { value: 'article', label: 'Articles', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'podcast', label: 'Podcasts', icon: Headphones },
  { value: 'guide', label: 'Guides', icon: BookOpen },
  { value: 'infographic', label: 'Infographics', icon: ImageIcon },
];

export function Library({ onResourceSelect, onNavigate, className }: LibraryProps) {
  const isMobile = useIsMobile();
  const { categories: kvCategories, filterTypes: kvFilterTypes, loading: metaLoading } = useMetadata();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'content-type'>('categories');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [activeContentType, setActiveContentType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);

  const hasLoadedResources = useRef(false);

  const handleRefresh = () => {
    hasLoadedResources.current = false;
    loadResources();
  };

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
              const match = kvFilterTypes.find(t => typeStr.includes(t.value));
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
              published: resource.published !== false,
              featured: resource.featured === true
            };
          })
          .filter((resource: any) => resource.published !== false)
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

  const handlePullToRefresh = async () => {
    hasLoadedResources.current = false;
    await loadResources();
  };

  const categories = ['All', ...kvCategories.map(c => c.label)];

  // Featured resources (pinned from admin)
  const featuredResources = resources.filter(r => r.featured);

  // Filter resources based on search, category, and content type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const resourceCat = (resource.category || '').toLowerCase();
    const filterCat = activeCategoryFilter.toLowerCase();
    const matchesCategory = activeCategoryFilter === 'All' || resourceCat === filterCat;
    
    const matchesType = activeContentType === 'all' || resource.type === activeContentType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const content = (
    <div className={cn("w-full min-h-screen", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 py-8 md:px-12 md:py-12">
        
        {/* Page Title */}
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 
            style={{ 
              fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
              fontFamily: 'var(--font-family-base)', 
              fontWeight: 'var(--font-weight-medium)', 
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--spacing-2) 0'
            }}
          >
            Resources
          </h1>
          <p style={{ 
            fontSize: 'var(--text-sm)', 
            fontFamily: 'var(--font-family-base)', 
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            margin: 0
          }}>
            Explore articles, guides, and tools to support your mental health journey
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-lg" style={{ marginBottom: 'var(--spacing-6)' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border-none text-sm focus:ring-1 focus:ring-black/10"
            style={{ 
              backgroundColor: 'var(--color-bg-card)',
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-primary)',
              height: 44,
              fontSize: 'var(--text-sm)',
            }}
          />
        </div>

        {/* Tab Switcher: Categories / Content Type */}
        <div className="flex" style={{ gap: 0, marginBottom: 'var(--spacing-6)', borderBottom: '1px solid var(--color-border-default)' }}>
          {(['categories', 'content-type'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'var(--spacing-3) var(--spacing-5)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: isActive ? 'var(--font-weight-medium)' : 400,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary-default)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginBottom: -1,
                }}
              >
                {tab === 'categories' ? 'Categories' : 'Content Type'}
              </button>
            );
          })}
        </div>

        {/* Filter Pills based on active tab */}
        <div className="flex flex-wrap" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-8)' }}>
          {activeTab === 'categories' ? (
            categories.map((cat) => {
              const isActive = activeCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={cn(
                    "rounded-full text-sm transition-all duration-200 border",
                    isActive ? "border-[var(--color-primary-default)]" : "border-transparent"
                  )}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor: isActive ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                    color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: isActive ? 'var(--font-weight-medium)' : 400,
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              );
            })
          ) : (
            CONTENT_TYPES.map((type) => {
              const isActive = activeContentType === type.value;
              const IconComp = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setActiveContentType(type.value)}
                  className={cn(
                    "rounded-full text-sm transition-all duration-200 border flex items-center",
                    isActive ? "border-[var(--color-primary-default)]" : "border-transparent"
                  )}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    gap: 'var(--spacing-2)',
                    backgroundColor: isActive ? 'var(--color-primary-default)' : 'var(--color-bg-card)',
                    color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-base)',
                    fontWeight: isActive ? 'var(--font-weight-medium)' : 400,
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {IconComp && <IconComp size={14} />}
                  {type.label}
                </button>
              );
            })
          )}
        </div>

        {/* Featured Resource Highlight */}
        {!loading && featuredResources.length > 0 && !searchQuery && activeCategoryFilter === 'All' && activeContentType === 'all' && (
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-4)',
            }}>
              Featured
            </h2>
            <div className={cn(
              "grid gap-6",
              featuredResources.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            )}>
              {featuredResources.slice(0, 2).map((resource) => (
                <div
                  key={`featured-${resource.id}`}
                  className="group cursor-pointer flex flex-col md:flex-row overflow-hidden"
                  onClick={() => onNavigate?.(`/resource-detail?id=${resource.id}`)}
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div
                    className="w-full md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden"
                    style={{ backgroundColor: 'var(--color-bg-muted)', minHeight: isMobile ? undefined : 200 }}
                  >
                    <ImageWithFallback
                      src={resolveImageUrl(resource.image)}
                      alt={resource.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center" style={{ padding: 'var(--spacing-5)' }}>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-primary-default)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 'var(--spacing-2)',
                      }}
                    >
                      Featured · {resource.category}
                    </span>
                    <h3
                      className="line-clamp-2"
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
                        margin: '0 0 var(--spacing-2) 0',
                        lineHeight: 1.3,
                      }}
                    >
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p
                        className="line-clamp-2"
                        style={{
                          fontFamily: 'var(--font-family-base)',
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 400,
                          margin: '0 0 var(--spacing-3) 0',
                          lineHeight: 'var(--line-height-md)',
                        }}
                      >
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                      {resource.readTime && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-family-base)',
                          color: 'var(--color-text-muted)',
                          fontWeight: 400,
                        }}>
                          {resource.readTime}
                        </span>
                      )}
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-muted)',
                        fontWeight: 400,
                      }}>
                        {resource.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            fontFamily: 'var(--font-family-base)', 
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--spacing-4)',
            fontWeight: 400,
          }}>
            {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
          </p>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
                <div 
                  className="w-full aspect-[4/3] overflow-hidden mb-4" 
                  style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}
                >
                  <ImageWithFallback
                    src={resolveImageUrl(resource.image)}
                    alt={resource.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Type badge */}
                <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                  <span 
                    style={{ 
                      fontSize: 'var(--text-xs)', 
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {resource.category}
                  </span>
                  {resource.readTime && (
                    <>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>·</span>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        fontFamily: 'var(--font-family-base)',
                        color: 'var(--color-text-muted)',
                        fontWeight: 400,
                      }}>
                        {resource.readTime}
                      </span>
                    </>
                  )}
                </div>
                <h3 
                  className="leading-snug mb-2 transition-colors line-clamp-2"
                  style={{ 
                    fontFamily: 'var(--font-family-base)', 
                    fontWeight: 'var(--font-weight-medium)', 
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    margin: '0 0 var(--spacing-1) 0',
                  }}
                >
                  {resource.title}
                </h3>
                {resource.description && (
                  <p 
                    className="line-clamp-2"
                    style={{ 
                      fontFamily: 'var(--font-family-base)', 
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 400,
                      margin: '0 0 var(--spacing-2) 0',
                      lineHeight: 'var(--line-height-md)',
                    }}
                  >
                    {resource.description}
                  </p>
                )}
                <span 
                  style={{ 
                    fontFamily: 'var(--font-family-base)', 
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 400,
                  }}
                >
                  {resource.date}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div style={{ fontSize: 48, marginBottom: 'var(--spacing-4)' }}>📚</div>
              <p style={{ 
                fontFamily: 'var(--font-family-base)', 
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                fontWeight: 400,
              }}>
                No resources found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('All');
                  setActiveContentType('all');
                }}
                style={{
                  marginTop: 'var(--spacing-3)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-primary-default)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
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