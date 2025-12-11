import React from 'react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  slug?: string;
  author?: string;
  category?: string;
  readTime?: string;
}

interface BlogCardProps {
  post: BlogPost;
  onClick?: () => void;
  variant?: 'default' | 'featured';
  className?: string;
}

export function BlogCard({ post, onClick, variant = 'default', className }: BlogCardProps) {
  return (
    <div 
      className={cn("p-4 rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-300", className)}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)'
      }}
    >
      <div 
        className="space-y-4 h-full flex flex-col"
        style={{ gap: 'var(--spacing-4)' }}
      >
        {/* Image */}
        <div 
          className="relative rounded-lg overflow-hidden aspect-video"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <ImageWithFallback 
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3">
          <div 
            className="text-sm uppercase tracking-wide opacity-60"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)',
              letterSpacing: 'var(--letter-spacing-wide)'
            }}
          >
            {post.date}
          </div>
          {post.readTime && (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
              <div 
                className="text-sm"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {post.readTime}
              </div>
            </>
          )}
          {post.category && (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
              <div 
                className="text-sm"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-primary-default)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {post.category}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 
          style={{
            fontSize: variant === 'featured' ? 'var(--text-xl)' : 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)',
            lineHeight: 'var(--line-height-md)'
          }}
        >
          {post.title}
        </h3>

        {/* Description and Read More */}
        <div 
          className="flex-1 flex flex-col justify-between space-y-4"
          style={{ gap: 'var(--spacing-4)' }}
        >
          <p 
            className="leading-relaxed"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-md)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            {post.description}
          </p>
          <div 
            className="pt-4 border-t"
            style={{ 
              borderTopColor: 'var(--color-border-default)',
              paddingTop: 'var(--spacing-4)'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="p-0 h-auto bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)',
                letterSpacing: 'var(--letter-spacing-normal)'
              }}
            >
              Read more →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
