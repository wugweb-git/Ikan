import React from 'react';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton-loader';
import { ResourcePost, ResourceCard } from './ResourceCard';

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

function MobileResourceCard({ post, onClick }: { post: ResourcePost; onClick: () => void }) {
  return (
    <div 
      className="bg-white h-[113px] relative rounded-[16px] shrink-0 w-full cursor-pointer transition-transform active:scale-[0.98]"
      onClick={onClick}
    >
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="flex flex-col items-start justify-center p-[16px] relative size-full">
          <div className="h-[80px] relative shrink-0 w-full">
             
             {/* Text Content (Right) */}
             <div className="absolute flex flex-col gap-[4px] h-[80px] items-start left-[92px] top-0 w-[calc(100%-92px)]">
                <div className="h-[16px] opacity-60 relative shrink-0 w-full">
                  <p className="font-['Ubuntu',sans-serif] font-normal leading-[16px] text-[#151515] text-[12px] tracking-[0.72px] uppercase truncate">
                    {post.category || "RESOURCE"}
                  </p>
                </div>
                <div className="h-[60px] relative shrink-0 w-full overflow-hidden">
                  <p className="font-['Ubuntu',sans-serif] font-medium leading-[20px] text-[#151515] text-[16px] line-clamp-3">
                    {post.title}
                  </p>
                </div>
             </div>

             {/* Image (Left) */}
             <div className="absolute bg-[#aeaeae] left-0 overflow-hidden rounded-[12px] size-[80px] top-0">
                <ImageWithFallback src={post.image} alt={post.title} className="w-full h-full object-cover" />
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export function ResourceBlock({ 
  title = "Recent Thoughts", 
  posts = [], 
  loading = false,
  onPostClick, 
  maxPosts = 3,
  className 
}: ResourceBlockProps) {
  
  const displayPosts = posts.slice(0, maxPosts);

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-[16px] items-center justify-center py-[36px] w-full", className)}>
        <Skeleton height="48px" width="200px" />
        <div className="w-full max-w-7xl px-4 flex flex-col md:flex-row gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height="300px" width="100%" className="rounded-[16px]" />
          ))}
        </div>
      </div>
    );
  }

  if (displayPosts.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-[16px] items-center justify-center py-[36px] w-full", className)}>
      <p className="font-['Ubuntu',sans-serif] font-medium leading-[48px] text-[32px] text-black text-center w-full mb-4">
        {title}
      </p>
      
      {/* Mobile Layout */}
      <div className="w-full max-w-md flex flex-col items-center gap-[16px] px-[20px] md:hidden">
        {displayPosts.map((post, index) => (
          <MobileResourceCard
            key={post.id || index}
            post={post}
            onClick={() => onPostClick?.(post)}
          />
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 w-full max-w-7xl px-8">
        {displayPosts.map((post, index) => (
          <ResourceCard
            key={post.id || index}
            post={post}
            onClick={() => onPostClick?.(post)}
            className="h-full bg-white border border-[#0000001a] shadow-none hover:shadow-lg transition-all"
          />
        ))}
      </div>
    </div>
  );
}
