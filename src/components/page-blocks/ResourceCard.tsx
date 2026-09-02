import { ContentImage } from '../ui/ContentImage';
import { cn } from '../ui/utils';
import { resolveImageUrl } from '../../utils/image-utils';

export interface ResourcePost {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  slug?: string;
  author?: string;
  category?: string;
  readTime?: string;
  type?: 'article' | 'video' | 'tool';
}

interface ResourceCardProps {
  post: ResourcePost;
  onClick?: () => void;
  variant?: 'default' | 'featured';
  className?: string;
}

export function ResourceCard({ post, onClick, variant = 'default', className }: ResourceCardProps) {
  return (
    <div 
      className={cn("cursor-pointer group flex flex-col overflow-hidden", className)}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Image with category pill overlay */}
      <div 
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: '4/3',
          backgroundColor: 'var(--color-bg-muted)',
        }}
      >
        <ContentImage 
          src={resolveImageUrl(post.image)}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {/* Category pill overlay */}
        {post.category && (
          <div
            className="absolute top-3 left-3"
            style={{
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRadius: 'var(--radius-pill, 999px)',
              padding: '4px 12px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-base)',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              {post.category}
            </span>
          </div>
        )}
      </div>

      {/* Text content */}
      <div
        style={{
          padding: 'var(--spacing-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {/* Date + Read time */}
        <div className="flex items-center" style={{ gap: '6px' }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-regular)',
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-muted)',
            }}
          >
            {post.date}
          </span>
          {post.readTime && (
            <>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>•</span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-regular)',
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {post.readTime}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 
          className="line-clamp-2"
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-base)',
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          {post.title}
        </h3>
      </div>
    </div>
  );
}