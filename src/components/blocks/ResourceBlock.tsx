import React from 'react';
import { Button } from '../ui/button';
import { ResourceCard, ResourcePost } from './ResourceCard';
import { ErrorBoundary } from '../ErrorBoundary';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Skeleton } from '../ui/skeleton-loader';

interface ResourceBlockProps {
  title?: string;
  description?: string;
  posts: ResourcePost[];
  loading?: boolean;
  onPostClick?: (post: ResourcePost) => void;
  onViewAll?: () => void;
  viewAllText?: string;
  maxPosts?: number;
  variant?: 'grid' | 'list';
  className?: string;
}

export function ResourceBlock({ 
  title = "Our Recent Thoughts",
  description,
  posts,
  loading = false,
  onPostClick,
  onViewAll,
  viewAllText = "VIEW ALL",
  maxPosts = 3,
  variant = 'grid',
  className
}: ResourceBlockProps) {
  const isMobile = useIsMobile();
  
  // Safety check - ensure posts is an array
  const safePosts = Array.isArray(posts) ? posts : [];
  const displayPosts = safePosts.slice(0, maxPosts);
  
  const handlePostClick = (post: ResourcePost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const renderSkeletons = () => (
    <div 
      className={variant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-6'}
      style={{ gap: 'var(--spacing-6)' }}
    >
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="p-4 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]"
        >
          <div className="space-y-4 h-full flex flex-col">
            <Skeleton height="180px" width="100%" className="rounded-lg" />
            <div className="flex items-center gap-3">
               <Skeleton height="16px" width="60px" />
               <Skeleton height="16px" width="80px" />
            </div>
            <Skeleton height="28px" width="90%" />
            <div className="flex-1 space-y-4">
               <Skeleton height="16px" width="100%" />
               <Skeleton height="16px" width="80%" />
               <div className="pt-4 border-t border-[var(--color-border-default)]">
                 <Skeleton height="16px" width="100px" />
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ErrorBoundary>
      <section 
        className={`w-full ${className || ''}`}
        style={{
          backgroundColor: 'var(--color-bg-page)',
          paddingTop: 'clamp(var(--spacing-8), 6vw, var(--spacing-12))',
          paddingBottom: 'clamp(var(--spacing-8), 6vw, var(--spacing-12))'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          {/* Header */}
          <div 
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8"
            style={{ 
              marginBottom: 'var(--spacing-8)',
              gap: 'var(--spacing-4)'
            }}
          >
            <div>
              <h2 
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  marginBottom: description ? 'var(--spacing-2)' : 0
                }}
              >
                {title}
              </h2>
              {description && (
                <p 
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-base)',
                    maxWidth: '600px'
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            
            {onViewAll && displayPosts.length > 0 && !loading && (
              <Button 
                onClick={onViewAll}
                variant="secondary"
                className="self-start lg:self-auto mt-4 lg:mt-0"
                style={{
                  backgroundColor: 'var(--color-neutral-200)',
                  color: 'var(--color-text-muted)',
                  height: 'var(--ikan-component-button-height)',
                  borderRadius: 'var(--ikan-component-border-radius)'
                }}
              >
                {viewAllText}
              </Button>
            )}
          </div>

          {/* Content */}
          {loading ? renderSkeletons() : (
             <>
               {displayPosts.length === 0 ? (
                 <div className="text-center py-12 text-[var(--color-text-muted)]">
                   No resources available at the moment.
                 </div>
               ) : (
                 <div 
                  className={variant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-6'}
                  style={{ gap: 'var(--spacing-6)' }}
                >
                  {displayPosts.map((post, index) => (
                    <ResourceCard
                      key={`${post.id}-${index}`}
                      post={post}
                      onClick={() => handlePostClick(post)}
                      variant={index === 0 ? 'featured' : 'default'}
                    />
                  ))}
                </div>
               )}
             </>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
}