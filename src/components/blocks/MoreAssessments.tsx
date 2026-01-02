import React from 'react';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AssessmentCardProps {
  title: string;
  category: string;
  image?: string;
  onClick?: () => void;
}

function AssessmentCard({ title, category, image, onClick }: AssessmentCardProps) {
  return (
    <div 
      className="bg-white relative rounded-[16px] shrink-0 w-full cursor-pointer transition-transform active:scale-[0.98]" 
      onClick={onClick}
    >
      <div aria-hidden="true" className="absolute border-[0.586px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="flex flex-col items-start p-[16px] relative w-full">
          <div className="flex items-start justify-end relative shrink-0 w-full">
            <div className="flex gap-[16px] items-start relative shrink-0 w-full">
              {/* Image Container */}
              <div className="flex h-[93px] items-end relative shrink-0 w-[98px]">
                <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden">
                  {image ? (
                    <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="basis-0 flex flex-col gap-[6px] grow items-start justify-end min-h-px min-w-px relative self-stretch shrink-0">
                <div className="flex items-center justify-center relative shrink-0">
                  <p className="font-['Ubuntu',sans-serif] font-medium leading-[20px] text-[#969696] text-[12px] tracking-[0.84px] uppercase">
                    {category}
                  </p>
                </div>
                <div className="flex flex-col justify-end leading-[0] min-w-full relative shrink-0 text-[#151515] text-[24px] w-[min-content]">
                  <p className="font-['Ubuntu',sans-serif] font-medium leading-[30px]">
                    {title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MoreAssessmentsProps {
  title?: string;
  assessments?: Array<{
    id: string;
    title: string;
    category: string;
    image?: string;
  }>;
  onAssessmentClick?: (id: string) => void;
  className?: string;
}

export function MoreAssessments({ 
  title = "More assessments", 
  assessments = [], 
  onAssessmentClick,
  className 
}: MoreAssessmentsProps) {
  return (
    <div className={cn("bg-[#414141] py-[24px] px-[20px] relative w-full", className)}>
      <div className="flex flex-col items-center justify-center size-full gap-[32px]">
        <h2 className="font-['Ubuntu',sans-serif] font-medium leading-[48px] text-[32px] text-white text-center w-full">
          {title}
        </h2>
        
        <div className="flex flex-col gap-[16px] w-full max-w-md mx-auto">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              title={assessment.title}
              category={assessment.category}
              image={assessment.image}
              onClick={() => onAssessmentClick?.(assessment.id)}
            />
          ))}
          {assessments.length === 0 && (
             // Fallback/Demo content if no assessments provided
             <>
                <AssessmentCard 
                  title="Struggling to balance life" 
                  category="BALANCE" 
                />
                <AssessmentCard 
                   title="Feeling constantly tired" 
                   category="ENERGY" 
                />
             </>
          )}
        </div>
      </div>
    </div>
  );
}
