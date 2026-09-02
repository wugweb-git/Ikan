import { cn } from '../ui/utils';
import { ContentImage } from '../ui/ContentImage';
import { Skeleton } from '../ui/skeleton-loader';
import { resolveImageUrl } from '../../utils/image-utils';
import { ArrowRight } from 'lucide-react';

export interface AssessmentProgram {
  title: string;
  description: string;
  image: string;
  category?: string;
  questionCount?: number;
  duration?: number;
  info: string;
  link: string;
  id?: string;
}

export interface AssessmentBlockProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  seeMoreText?: string;
  programs: AssessmentProgram[];
  loading?: boolean;
  onProgramClick?: (program: AssessmentProgram) => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

function MobileAssessmentCard({ program, onClick }: { program: AssessmentProgram; onClick: () => void }) {
  const imageSrc = resolveImageUrl(program.image);

  return (
    <div 
      className="relative shrink-0 w-full cursor-pointer transition-transform active:scale-[0.98]" 
      style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}
      onClick={onClick}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ border: '0.586px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }} />
      <div className="size-full">
        <div className="flex flex-col items-start p-[16px] relative w-full">
          <div className="flex items-start justify-end relative shrink-0 w-full">
            <div className="flex gap-[16px] items-start relative shrink-0 w-full">
              {/* Image Container */}
              <div className="flex h-[93px] items-end relative shrink-0 w-[98px]">
                <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-accent-default)', borderRadius: 'var(--radius-md)' }}>
                  <ContentImage 
                    src={imageSrc} 
                    alt={program.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="basis-0 flex flex-col gap-[6px] grow items-start justify-end min-h-px min-w-px relative self-stretch shrink-0">
                <div className="flex items-center justify-center relative shrink-0">
                  <p className="font-medium leading-[20px] text-[12px] tracking-[0.84px] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    {program.category || "ASSESSMENT"}
                  </p>
                </div>
                <div className="flex flex-col justify-end leading-[0] min-w-full relative shrink-0 text-[24px] w-[min-content]" style={{ color: 'var(--color-text-primary)' }}>
                  <p className="font-medium leading-[30px] line-clamp-2">
                    {program.title}
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

function DesktopAssessmentCard({ program, onClick }: { program: AssessmentProgram; onClick: () => void }) {
  const imageSrc = resolveImageUrl(program.image);

  return (
    <div 
      className="flex flex-col h-full cursor-pointer transition-all hover:shadow-lg overflow-hidden" 
      style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}
      onClick={onClick}
    >
      {/* Image Top */}
      <div className="h-[200px] w-full relative overflow-hidden" style={{ backgroundColor: 'var(--color-accent-default)' }}>
        <ContentImage 
          src={imageSrc} 
          alt={program.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>

      {/* Content Bottom */}
      <div className="flex flex-col p-[24px] gap-[12px] flex-1">
        <p className="font-medium text-[12px] tracking-[0.84px] uppercase" style={{ color: 'var(--color-text-muted)' }}>
          {program.category || "ASSESSMENT"}
        </p>
        <h3 className="font-medium text-[24px] leading-[30px] line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
          {program.title}
        </h3>
        <p className="opacity-80 text-[14px] leading-[20px] line-clamp-3 mt-auto"
           style={{ fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-primary)' }}>
          {program.description}
        </p>
        {program.info && (
          <p className="opacity-60 text-[12px] mt-4"
             style={{ fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-primary)' }}>
            {program.info}
          </p>
        )}
      </div>
    </div>
  );
}

export function AssessmentBlock({ 
  title = "More assessments",
  programs = [],
  loading = false,
  onProgramClick,
  onNavigate,
  className
}: AssessmentBlockProps) {
  
  const handleProgramClick = (program: AssessmentProgram) => {
    if (onProgramClick) {
      onProgramClick(program);
    } else if (onNavigate) {
      onNavigate(program.link);
    }
  };

  if (loading) {
    return (
      <div className={cn("py-[24px] px-[20px] relative w-full", className)} style={{ backgroundColor: 'var(--color-primary-default)' }}>
        <div className="flex flex-col items-center gap-[32px] w-full max-w-7xl mx-auto">
          <Skeleton height="48px" width="60%" className="bg-white/10" />
          <div className="flex flex-col md:grid md:grid-cols-3 gap-[16px] w-full">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="125px" width="100%" style={{ borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (programs.length === 0) return null;

  return (
    <div className={cn("py-[24px] lg:py-[48px] px-[20px] relative w-full", className)} style={{ backgroundColor: 'var(--color-primary-default)' }}>
      <div className="flex flex-col items-center justify-center size-full gap-[32px] max-w-7xl mx-auto">
        <h2 className="font-medium leading-[48px] text-[32px] text-center w-full" style={{ color: 'var(--color-primary-on)' }}>
          {title}
        </h2>
        
        {/* Mobile Layout */}
        <div className="flex flex-col gap-[16px] w-full max-w-md mx-auto md:hidden">
          {programs.map((program, index) => (
            <MobileAssessmentCard
              key={program.id || index}
              program={program}
              onClick={() => handleProgramClick(program)}
            />
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-[24px] w-full">
          {programs.map((program, index) => (
            <DesktopAssessmentCard
              key={program.id || index}
              program={program}
              onClick={() => handleProgramClick(program)}
            />
          ))}
        </div>

        {/* CTA — View All Assessments */}
        <button
          onClick={() => onNavigate?.('/assessments')}
          className="flex items-center justify-center cursor-pointer border-none transition-all hover:opacity-90"
          style={{
            gap: '8px',
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-primary-default)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 32px',
            fontFamily: 'var(--font-family-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-base)',
          }}
        >
          View All Assessments
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}