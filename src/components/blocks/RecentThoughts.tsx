import React from 'react';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ResourceCardProps {
  title: string;
  category: string;
  image?: string;
  onClick?: () => void;
}

function ResourceCard({ title, category, image, onClick }: ResourceCardProps) {
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
                    {category}
                  </p>
                </div>
                <div className="h-[60px] relative shrink-0 w-full overflow-hidden">
                  <p className="font-['Ubuntu',sans-serif] font-medium leading-[20px] text-[#151515] text-[16px] line-clamp-3">
                    {title}
                  </p>
                </div>
             </div>

             {/* Image (Left) */}
             <div className="absolute bg-[#aeaeae] left-0 overflow-hidden rounded-[12px] size-[80px] top-0">
                {image ? (
                  <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-200" />
                )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}

interface RecentThoughtsProps {
  title?: string;
  resources?: Array<{
    id: string;
    title: string;
    category: string;
    image?: string;
  }>;
  onResourceClick?: (id: string) => void;
  className?: string;
}

export function RecentThoughts({ 
  title = "Recent Thoughts", 
  resources = [], 
  onResourceClick, 
  className 
}: RecentThoughtsProps) {
  return (
    <div className={cn("flex flex-col gap-[16px] items-center justify-center py-[36px] w-full", className)}>
      <p className="font-['Ubuntu',sans-serif] font-medium leading-[48px] text-[32px] text-black text-center w-full">
        {title}
      </p>
      <div className="w-full max-w-md flex flex-col items-center gap-[16px] px-[20px]">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            title={resource.title}
            category={resource.category}
            image={resource.image}
            onClick={() => onResourceClick?.(resource.id)}
          />
        ))}
        {resources.length === 0 && (
           <>
              <ResourceCard 
                title="What Happens to Your Mood When You’re Low on Vitamin D" 
                category="CATEGORY" 
              />
              <ResourceCard 
                title="Prioritizing Mental Wellness: The Importance of Routine Mental Health Check-Ups." 
                category="CATEGORY" 
              />
              <ResourceCard 
                title="The Power of Measurement-Based Care" 
                category="CATEGORY" 
              />
           </>
        )}
      </div>
    </div>
  );
}
