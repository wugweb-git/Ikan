import React from 'react';
import { Button } from '../../ui/button';
import { BlogCard, BlogPost } from '../../blocks/BlogCard';
import { DUMMY_BLOGS, formatBlogsForSection } from '../../../lib/dummy-blogs';

interface BlogSectionProps {
  onNavigate: (route: string, resourceId?: string) => void;
}

export function BlogSection({ onNavigate }: BlogSectionProps) {
  // Use dummy blogs data
  const blogPosts = formatBlogsForSection(DUMMY_BLOGS.slice(0, 3));
  const title = "Our Recent Thoughts";
  const viewAllText = "VIEW ALL";

  const handleBlogClick = (post: BlogPost) => {
    // Navigate to resource detail with the blog ID
    onNavigate('/resource-detail', post.id);
  };

  const handleViewAll = () => {
    onNavigate('/library');
  };

  // If no posts, don't render anything
  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section 
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
          <Button 
            onClick={handleViewAll}
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
        </div>

        {/* Content */}
        <>
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-6">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onClick={() => handleBlogClick(post)}
              />
            ))}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div 
              className="grid grid-cols-3 gap-6"
              style={{ gap: 'var(--spacing-6)' }}
            >
              {blogPosts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onClick={() => handleBlogClick(post)}
                  variant={index === 0 ? 'featured' : 'default'}
                />
              ))}
            </div>
          </div>
        </>
      </div>
    </section>
  );
}
