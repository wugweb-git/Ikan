import React from 'react';
import { 
  Check, 
  AlertCircle, 
  Clock, 
  FileText, 
  Activity, 
  CheckCircle2, 
  ClipboardList, 
  Timer, 
  ListTodo,
  Brain,
  Target
} from 'lucide-react';
import { cn } from '../ui/utils';

// Reuse interfaces for consistency with backend data structure
interface BentoSection1 {
  title?: string;
  eligibilityTitle?: string;
  eligibilityPoints?: string[];
  whoTitle?: string;
  whoContent?: string;
}

interface BentoSection2 {
  title?: string;
  subtitle?: string;
  content?: string;
  contentHtml?: string;
  image?: string;
  bullets?: string[];
}

interface BentoSection3 {
  title?: string;
  subtitle?: string;
  content?: string[];
  contentHtml?: string;
}

interface BentoSection4 {
  benefitsTitle?: string;
  benefits?: Array<{ title: string; description: string }>;
  notesTitle?: string;
  notes?: Array<{ title: string; description: string }>;
}

interface AssessmentBentoGridProps {
  section1: BentoSection1; // Who is this for?
  section2: BentoSection2; // About this test (and Image)
  section3: BentoSection3; // What you'll see
  section4: BentoSection4; // Things to remember
  // Stats data from Basic Info
  questionCount?: number;
  duration?: number;
  difficulty?: string;
  // Important notes from metadata
  importantNote1?: string;
  importantNote2?: string;
  className?: string;
}

export function AssessmentBentoGrid({
  section1,
  section2,
  section3,
  section4,
  questionCount = 10,
  duration = 5,
  difficulty = 'Beginner',
  importantNote1,
  importantNote2,
  className
}: AssessmentBentoGridProps) {
  
  // Helper to render rich text or array
  const renderContent = (html?: string, textArray?: string[], limit?: number) => {
    if (html) {
      return (
        <div 
          className="prose prose-neutral max-w-none text-neutral-600 font-sans leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (textArray && textArray.length > 0) {
      const items = limit ? textArray.slice(0, limit) : textArray;
      return items.map((p, i) => (
        <p key={i} className="text-base leading-relaxed text-neutral-600 font-sans mb-4 last:mb-0">
          {p}
        </p>
      ));
    }
    return null;
  };

  // Helper to choose icon based on content keyword
  const getMeasurementIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('stress') || lower.includes('anxiety')) return Brain;
    if (lower.includes('focus') || lower.includes('attention')) return Target;
    if (lower.includes('time') || lower.includes('speed')) return Timer;
    return ClipboardList;
  };

  // Common hover classes for interactive feel
  const hoverClasses = "transition-all duration-300 ease-out hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-default";

  return (
    <section 
      className={cn("w-full py-12 md:py-16 bg-[var(--color-bg-page)] font-sans", className)}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Responsive Grid: Reduced gap from 6 to 5 for tighter layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* TILE 1: What is this assessment? - 8 cols */}
          {/* Padding set to p-8 (32px) as requested */}
          <div className={cn("col-span-1 md:col-span-8 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-8 border border-[var(--color-border-default)] shadow-sm flex flex-col justify-between", hoverClasses)}>
            
            {/* Header & Content */}
            <div>
              <h2 className="text-[28px] md:text-[32px] leading-tight font-medium text-[var(--color-text-primary)] tracking-tight mb-6">
                What is this assessment?
              </h2>
              <div className="mb-8 md:mb-10 text-[var(--color-text-muted)]">
                 {renderContent(section2.contentHtml, section2.content ? section2.content.split('\n') : [])}
              </div>
            </div>
            
            {/* What it measures - Gray Cards */}
            {section2.bullets && section2.bullets.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-4 tracking-tight text-[18px] font-bold font-normal">
                  What it measures
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {section2.bullets.slice(0, 3).map((bullet, idx) => {
                    const Icon = getMeasurementIcon(bullet);
                    return (
                      <div key={idx} className="bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] p-4 flex flex-row items-center gap-4 transition-colors hover:bg-[var(--color-neutral-200)]">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center shrink-0 shadow-sm text-[var(--color-text-primary)]">
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <p className="text-[14px] leading-snug text-[var(--color-text-primary)] font-medium line-clamp-2">
                          {bullet}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - STATS (3 Separate Tiles) - 4 cols */}
          {/* Reduced gap between stat cards */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-3">
            
            {/* Card 1: Questions */}
            {/* Padding set to p-5 (20px) as requested */}
            <div className={cn("bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-border-default)] shadow-sm flex items-center gap-5 h-full", hoverClasses)}>
              <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0 text-[var(--color-text-primary)] transition-transform group-hover:scale-110">
                <ListTodo className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[var(--color-text-primary)] mb-0.5">
                  Task
                </p>
                <p className="text-[16px] text-[var(--color-text-muted)] font-normal">
                  {questionCount} Questions
                </p>
              </div>
            </div>

            {/* Card 2: Time */}
            {/* Padding set to p-5 (20px) as requested */}
            <div className={cn("bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-border-default)] shadow-sm flex items-center gap-5 h-full", hoverClasses)}>
              <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0 text-[var(--color-text-primary)]">
                <Timer className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[var(--color-text-primary)] mb-0.5">
                  Time
                </p>
                <p className="text-[16px] text-[var(--color-text-muted)] font-normal">
                  {duration} min
                </p>
              </div>
            </div>

            {/* Card 3: Level */}
            {/* Padding set to p-5 (20px) as requested */}
            <div className={cn("bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-border-default)] shadow-sm flex items-center gap-5 h-full", hoverClasses)}>
              <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center shrink-0 text-[var(--color-text-primary)]">
                <Activity className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[var(--color-text-primary)] mb-0.5">
                  Level
                </p>
                <p className="text-[16px] text-[var(--color-text-muted)] font-normal">
                  {difficulty}
                </p>
              </div>
            </div>
            
          </div>

          {/* TILE 3: Things to Remember - 8 cols */}
          {/* Padding set to p-8 (32px) as requested */}
          <div className={cn("col-span-1 md:col-span-8 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-8 border border-[var(--color-border-default)] shadow-sm", hoverClasses)}>
            <h3 className="text-[20px] md:text-[24px] font-medium text-[var(--color-text-primary)] mb-8 tracking-tight">
              Things to Remember Before You Start
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
              {(section4.notes || []).slice(0, 4).map((note, idx) => (
                <div key={idx} className="flex flex-row items-start gap-3">
                  <div className="mt-0.5 text-[var(--color-text-muted)] shrink-0">
                    <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p 
                    className="text-[15px] leading-relaxed text-[var(--color-text-primary)] font-normal" 
                    dangerouslySetInnerHTML={{ __html: note.title }} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* TILE 4: Important - 4 cols */}
          {/* Padding set to p-5 (20px) as requested for right-side boxes */}
          <div className={cn("col-span-1 md:col-span-4 bg-[var(--color-primary-default)] rounded-[var(--radius-lg)] p-5 shadow-sm text-[var(--color-primary-on)]", hoverClasses)}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                 <AlertCircle className="w-6 h-6 text-[var(--color-primary-on)]" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-medium text-[var(--color-primary-on)] tracking-tight">
                Important
              </h3>
            </div>
            <div className="space-y-4">
              {importantNote1 && (
                <div className="text-[15px] leading-relaxed text-neutral-200">
                   {importantNote1}
                </div>
              )}
              {importantNote2 && (
                <div className="text-[15px] leading-relaxed text-neutral-200">
                   {importantNote2}
                </div>
              )}
              {!importantNote1 && !importantNote2 && (
                 <p className="text-[15px] leading-relaxed text-neutral-200">
                   This is a self-help and awareness tool, not a medical diagnosis. Not intended for emergency or crisis situations.
                 </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}