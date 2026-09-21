import { useState, useEffect, useRef, useMemo } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useMetadata } from '../../hooks/useMetadata';
import { cn } from '../ui/utils';
import { Search, BookOpen, Video, Headphones, FileText, Image as ImageIcon } from 'lucide-react';
import { ResourcePost } from '../ui/blocks/ResourceCard';
import { toResourcePost } from '../../lib/resource-presentation';
import { LibraryResourceCard } from '../ui/blocks/LibraryResourceCard';
import { apiClient } from '../../shared/api-client';
import { logger } from '../../shared/logger';
import { PullToRefresh } from '../ui/touch-feedback';
import { ContentImage } from '../ui/ContentImage';
import { resolveImageUrl } from '../../utils/image-utils';
import { LIBRARY_LABELS } from '../../lib/constants/content';
import { PageHero } from '../ui/PageHero';

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
              // The record -> card mapping lives in `resource-presentation`,
              // because the stored field names are not the ones the card
              // declares (`thumbnail`, not `image`), and a second copy of that
              // knowledge is how one screen ends up with an empty image well
              // while another renders fine. `type` stays here: it depends on
              // `kvFilterTypes`, which is this screen's own fetched state.
              ...toResourcePost(resource),
              type: getResourceType(resource.contentType, resource.category),
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

  // ── Only show categories / content types that have active posts ──
  const activeCategoriesSet = useMemo(() => {
    const cats = new Set<string>();
    resources.forEach(r => { if (r.category) cats.add(r.category); });
    return cats;
  }, [resources]);

  const categories = useMemo(() => {
    const allCats = kvCategories.map(c => c.label).filter(label => activeCategoriesSet.has(label));
    return ['All', ...allCats];
  }, [kvCategories, activeCategoriesSet]);

  const activeContentTypesSet = useMemo(() => {
    const types = new Set<string>();
    types.add('all');
    resources.forEach(r => { if (r.type) types.add(r.type); });
    return types;
  }, [resources]);

  const visibleContentTypes = useMemo(() => {
    return CONTENT_TYPES.filter(ct => activeContentTypesSet.has(ct.value));
  }, [activeContentTypesSet]);

  const content = (
    <div className={cn("w-full min-h-screen", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <PageHero
        title={LIBRARY_LABELS.PAGE_TITLE}
        subtitle={LIBRARY_LABELS.PAGE_SUBTITLE}
      />

      <div className="w-full max-w-[1400px] mx-auto px-4 py-8 md:px-12 md:py-12">
        
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
            visibleContentTypes.map((type) => {
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

        {/* ─── Featured Bento Section ─── */}
        {!loading && featuredResources.length > 0 && !searchQuery && activeCategoryFilter === 'All' && activeContentType === 'all' && (
          <div style={{ marginBottom: 'var(--spacing-10, 40px)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-4)' }}>
              <h2 style={{
                fontSize: 'var(--text-lg)',
                fontFamily: 'var(--font-family-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                {LIBRARY_LABELS.FEATURED}
              </h2>
            </div>

            {/* Bento grid: left hero + right 2×2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '16px' : '20px',
              }}
            >
              {/* Left — Large featured card */}
              <div
                className="group cursor-pointer overflow-hidden flex flex-col"
                onClick={() => onNavigate?.(`/resource-detail?id=${featuredResources[0].id}`)}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)',
                  transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                  gridRow: isMobile ? undefined : 'span 1',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Image */}
                <div
                  className="relative overflow-hidden w-full"
                  style={{
                    aspectRatio: isMobile ? '16/9' : '16/10',
                    backgroundColor: 'var(--color-bg-muted)',
                  }}
                >
                  <ContentImage
                    src={resolveImageUrl(featuredResources[0].image)}
                    alt={featuredResources[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Category pill overlay */}
                  {featuredResources[0].category && (
                    <div
                      className="absolute top-3 left-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        borderRadius: 'var(--radius-pill, 999px)',
                        padding: '4px 12px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family-base)', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        {featuredResources[0].category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div style={{ padding: isMobile ? '16px' : '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-muted)',
                      backgroundColor: 'var(--color-bg-muted)',
                      borderRadius: 'var(--radius-pill, 999px)',
                      padding: '3px 10px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    Featured story
                  </span>

                  <h3
                    className="line-clamp-3"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                      margin: '4px 0 0 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {featuredResources[0].title}
                  </h3>

                  <div className="flex items-center" style={{ gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                      {featuredResources[0].date}
                    </span>
                    {featuredResources[0].readTime && (
                      <>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>•</span>
                        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-base)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                          {featuredResources[0].readTime}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate?.(`/resource-detail?id=${featuredResources[0].id}`); }}
                    style={{
                      marginTop: '8px',
                      alignSelf: 'flex-start',
                      padding: '8px 20px',
                      borderRadius: 'var(--radius-pill, 999px)',
                      backgroundColor: 'var(--ikan-brand-coral-bg, #FFF0ED)',
                      color: 'var(--ikan-brand-coral, #E8604C)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--text-sm)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Read more
                  </button>
                </div>
              </div>

              {/* Right — 2×2 grid of smaller cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr',
                  gap: isMobile ? '12px' : '16px',
                }}
              >
                {featuredResources.slice(1, 5).map((resource) => (
                  <LibraryResourceCard
                    key={`featured-${resource.id}`}
                    resource={resource}
                    onClick={() => onNavigate?.(`/resource-detail?id=${resource.id}`)}
                    size="small"
                  />
                ))}
              </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: isMobile ? '16px' : '20px' }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-bg-card)' }}>
                <div className="w-full aspect-[4/3] bg-black/5 animate-pulse" />
                <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="h-3 bg-black/5 w-1/2 rounded animate-pulse" />
                  <div className="h-4 bg-black/5 w-3/4 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <LibraryResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => onNavigate?.(`/resource-detail?id=${resource.id}`)}
              />
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