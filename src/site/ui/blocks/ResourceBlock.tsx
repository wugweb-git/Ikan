import { useRef, useState, useEffect } from 'react';
import { cn } from '../utils';
import { ContentImage } from '../ContentImage';
import { Skeleton } from '../skeleton-loader';
import type { ResourcePost } from './ResourceCard';
import { resolveImageUrl } from '../../../shared/lib/image-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../../../shared/hooks/useIsMobile';

export type { ResourcePost };

// Hide scrollbar style ID
const SCROLLBAR_STYLE_ID = 'ikan-resource-slider-style';

export interface ResourceBlockProps {
  title?: string;
  description?: string;
  posts: ResourcePost[];
  loading?: boolean;
  onPostClick?: (post: ResourcePost) => void;
  onViewAll?: () => void;
  viewAllText?: string;
  maxPosts?: number;
  className?: string;
}

/** Resource slider card — prominent image + category + title (no description) */
/*
 * The card is an <a href>, not a div with a click handler — it goes to a URL.
 * The href is derived from the post rather than passed in, because every
 * caller already routes to the same place (`/resource-detail?id=<id>`); the
 * click handler still does the in-app navigation, and a modified click is
 * left to the browser. The scroll arrows below stay buttons: they act on the
 * page, they do not navigate.
 */
function SliderResourceCard({ post, onClick, isMobile }: { post: ResourcePost; onClick: (e: React.MouseEvent) => void; isMobile?: boolean }) {
  const imageSrc = resolveImageUrl(post.image);

  return (
    <a
      href={`/resource-detail?id=${post.id}`}
      className="flex-shrink-0 cursor-pointer group flex flex-col overflow-hidden no-underline text-inherit"
      onClick={onClick}
      style={{
        // Each card is a snap point for the row's `x proximity` snapping.
        scrollSnapAlign: 'start',
        width: isMobile ? 'calc(100vw - 48px)' : '300px',
        maxWidth: isMobile ? '340px' : '300px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image — prominent, top of card */}
      <div
        className="relative overflow-hidden w-full"
        style={{ height: '190px', backgroundColor: 'var(--color-accent-default)' }}
      >
        <ContentImage
          src={imageSrc}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {/* Category badge overlay */}
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
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-text-primary)',
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          {post.title}
        </h3>
      </div>
    </a>
  );
}

export function ResourceBlock({
  title = 'Recent Thoughts',
  posts = [],
  loading = false,
  onPostClick,
  onViewAll,
  viewAllText = 'View All Resources',
  maxPosts = 10,
  className,
}: ResourceBlockProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isMobile = useIsMobile();

  const displayPosts = posts.slice(0, maxPosts);

  // Check scroll state
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    // Small delay for layout to settle
    const timer = setTimeout(updateScrollState, 100);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
    }
    window.addEventListener('resize', updateScrollState);

    // Inject scrollbar-hide style once
    if (!document.getElementById(SCROLLBAR_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = SCROLLBAR_STYLE_ID;
      style.textContent = `.ikan-resource-slider::-webkit-scrollbar { display: none; }`;
      document.head.appendChild(style);
    }

    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [displayPosts.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={cn('flex flex-col gap-5 py-9 w-full max-w-[1100px] mx-auto', className)}>
        <Skeleton height="40px" width="240px" className="ml-6" />
        <div className="w-full flex gap-4 px-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="280px" width="300px" className="rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (displayPosts.length === 0) return null;

  return (
    <div
      className={cn('flex flex-col py-9 w-full', className)}
      style={{ gap: 'var(--spacing-5)' }}
    >
      {/* Header — aligned with page max-width */}
      <div
        className="flex items-center justify-between w-full max-w-[1100px] mx-auto"
        style={{
          paddingLeft: 'var(--spacing-6)',
          paddingRight: 'var(--spacing-6)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-text-primary)',
            lineHeight: '1.3',
            margin: 0,
          }}
        >
          {title}
        </p>

        {/* Nav arrows */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-2)' }}>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex items-center justify-center border-none cursor-pointer transition-all"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: canScrollLeft ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
              color: canScrollLeft ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
              opacity: canScrollLeft ? 1 : 0.4,
            }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex items-center justify-center border-none cursor-pointer transition-all"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: canScrollRight ? 'var(--color-primary-default)' : 'var(--color-accent-default)',
              color: canScrollRight ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
              opacity: canScrollRight ? 1 : 0.4,
            }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal slider — aligned with page max-width */}
      <div className="relative w-full max-w-[1100px] mx-auto">
        {/* Fade edges */}
        {canScrollLeft && (
          <div
            className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none"
            style={{
              width: '48px',
              background: 'linear-gradient(to right, var(--color-bg-page), transparent)',
            }}
          />
        )}
        {canScrollRight && (
          <div
            className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
            style={{
              width: '48px',
              background: 'linear-gradient(to left, var(--color-bg-page), transparent)',
            }}
          />
        )}

        <div
          ref={scrollRef}
          className="flex w-full overflow-x-auto ikan-resource-slider"
          style={{
            gap: 'var(--spacing-4)',
            paddingLeft: 'var(--spacing-6)',
            paddingRight: 'var(--spacing-6)',
            paddingBottom: 'var(--spacing-2)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {displayPosts.map((post, index) => (
            <SliderResourceCard
              key={post.id || index}
              post={post}
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (onPostClick) { e.preventDefault(); onPostClick(post); }
              }}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* CTA — View All */}
      {onViewAll && (
        null
      )}
    </div>
  );
}