import React from 'react';
import { Button } from '../ui/button';
import { BlogCard, BlogPost } from './BlogCard';
import { ErrorBoundary } from '../ErrorBoundary';
import { useIsMobile } from '../../hooks/useIsMobile';

interface BlogSectionBlockProps {
  title?: string;
  posts: BlogPost[];
  onPostClick?: (post: BlogPost) => void;
  onViewAll?: () => void;
  viewAllText?: string;
  maxPosts?: number;
  variant?: 'grid' | 'list';
  className?: string;
}

export function BlogSectionBlock({ 
  title = "Our Recent Thoughts",
  posts,
  onPostClick,
  onViewAll,
  viewAllText = "VIEW ALL",
  maxPosts = 3,
  variant = 'grid',
  className
}: BlogSectionBlockProps) {
  const isMobile = useIsMobile();
  
  // Safety check - ensure posts is an array
  const safePosts = Array.isArray(posts) ? posts : [];
  const displayPosts = safePosts.slice(0, maxPosts);
  
  // If no posts, don't render anything
  if (displayPosts.length === 0) {
    return null;
  }

  const handlePostClick = (post: BlogPost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  return (
    <ErrorBoundary>
      <section 
        className={className}
        style={{
          backgroundColor: 'var(--color-bg-page)',
          paddingTop: 'var(--spacing-8)',
          paddingBottom: 'var(--spacing-8)'
        }}
      >
        <div 
          className="max-w-7xl mx-auto"
          style={{ padding: '0 var(--spacing-4)' }}
        >
          {/* Header */}
          <div 
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
            style={{ 
              marginBottom: 'var(--spacing-8)',
              gap: 'var(--spacing-4)'
            }}
          >
            <h2 
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              {title}
            </h2>
            {onViewAll && (
              <Button 
                onClick={onViewAll}
                variant="secondary"
                className="ikan-button self-start lg:self-auto mobile-button touch-target"
                style={{
                  backgroundColor: 'var(--color-neutral-200)',
                  color: 'var(--color-text-muted)',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {viewAllText}
              </Button>
            )}
          </div>

          {/* Content */}
          <>
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-6">
              {displayPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div 
                className={variant === 'grid' ? 'grid grid-cols-3 gap-6' : 'flex flex-col gap-6'}
                style={{ gap: 'var(--spacing-6)' }}
              >
                {displayPosts.map((post, index) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    onClick={() => handlePostClick(post)}
                    variant={index === 0 ? 'featured' : 'default'}
                  />
                ))}
              </div>
            </div>
          </>
        </div>
      </section>
    </ErrorBoundary>
  );
}