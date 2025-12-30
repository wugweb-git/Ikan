import React from 'react';
import { Check, Info, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
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
  className?: string;
}

const AbstractImageTile = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("relative w-full h-full overflow-hidden bg-neutral-100", className)}>
    {/* Abstract Background - Calm/Neutral */}
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-teal-50 blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-50 blur-3xl opacity-60" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')] opacity-20 mix-blend-overlay" />
    </div>
    <div className="relative z-10 w-full h-full">
      {children}
    </div>
  </div>
);

const TileLabel = ({ number }: { number: number }) => (
  <div className="absolute top-3 right-3 px-2 py-0.5 bg-neutral-100/80 border border-neutral-200 rounded text-[10px] font-mono text-neutral-500 z-20 pointer-events-none select-none">
    TILE {number}
  </div>
);

export function AssessmentBentoGrid({
  section1,
  section2,
  section3,
  section4,
  className
}: AssessmentBentoGridProps) {
  
  // Helper to render rich text or array
  const renderContent = (html?: string, textArray?: string[], limit?: number) => {
    if (html) {
      return (
        <div 
          className="rich-text-content text-base text-[var(--color-text-muted)] leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (textArray && textArray.length > 0) {
      const items = limit ? textArray.slice(0, limit) : textArray;
      return items.map((p, i) => (
        <p key={i} className="text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
          {p}
        </p>
      ));
    }
    return null;
  };

  return (
    <section 
      className={cn("w-full py-12 md:py-16", className)}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Mobile View: Stacked Column */}
        <div className="flex flex-col gap-6 md:hidden">
          
          {/* TILE 1: About This Test (Section 2) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
            <TileLabel number={1} />
            <h2 className="text-2xl font-medium text-[var(--color-text-primary)] mb-4">
              {section2.title || "What is this assessment?"}
            </h2>
            <div className="mb-6">
              {renderContent(section2.contentHtml, section2.content ? section2.content.split('\n') : [])}
            </div>
            {section2.bullets && section2.bullets.length > 0 && (
              <ul className="space-y-3 pt-4 border-t border-[var(--color-border-default)]">
                 {section2.bullets.slice(0, 3).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[var(--color-text-primary)] text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-default)] shrink-0" />
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* TILE 2: Visual / Image Tile */}
          <div className="relative rounded-2xl overflow-hidden h-48">
            <TileLabel number={2} />
            <AbstractImageTile className="w-full h-full">
               {section2.image ? (
                   <ImageWithFallback 
                       src={section2.image} 
                       alt="" 
                       aria-hidden="true"
                       className="w-full h-full object-cover"
                   />
               ) : (
                   <div className="w-full h-full flex items-center justify-center">
                       <span className="sr-only">Abstract background</span>
                   </div>
               )}
            </AbstractImageTile>
          </div>

          {/* TILE 3: Who Is This Test For? (Section 1) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
             <TileLabel number={3} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section1.title || "Who is this test for?"}
             </h3>
             {section1.eligibilityTitle && (
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
                    {section1.eligibilityTitle}
                </p>
             )}
             <div className="space-y-3">
                {(section1.eligibilityPoints || []).slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0 text-[var(--color-primary-default)]">
                      <Check size={18} strokeWidth={2.5} />
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
             </div>
          </div>

          {/* TILE 5: Things To Remember (Section 4 Notes) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
             <TileLabel number={5} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section4.notesTitle || "Things to remember"}
             </h3>
             <div className="space-y-4">
                 {(section4.notes || []).slice(0, 3).map((n, idx) => (
                     <div key={idx} className="flex gap-3">
                         <AlertCircle size={18} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                         <div>
                             <p className="font-medium text-sm text-[var(--color-text-primary)]">{n.title}</p>
                             <p className="text-xs text-[var(--color-text-muted)] mt-1">{n.description}</p>
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* TILE 4: What You'll See (Section 3) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
             <TileLabel number={4} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section3.title || "What you'll see"}
             </h3>
             {section3.subtitle && (
                <p className="text-sm text-[var(--color-text-muted)] mb-4 italic">
                    {section3.subtitle}
                </p>
             )}
             <div>
                {renderContent(section3.contentHtml, section3.content)}
             </div>
          </div>

        </div>

        {/* Desktop View: Bento Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-fr">
          
          {/* ROW 1 */}
          
          {/* TILE 1: About This Test (Section 2) - 8 cols */}
          <div className="relative md:col-span-2 lg:col-span-8 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)] flex flex-col justify-between">
            <TileLabel number={1} />
            <div>
                <h2 className="text-2xl font-medium text-[var(--color-text-primary)] mb-4">
                    {section2.title || "What is this assessment?"}
                </h2>
                <div className="mb-6">
                     {renderContent(section2.contentHtml, section2.content ? section2.content.split('\n') : [])}
                </div>
            </div>
            {section2.bullets && section2.bullets.length > 0 && (
                <div className="bg-[var(--color-bg-muted)] p-6 rounded-xl mt-auto">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                        Key Details:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {section2.bullets.slice(0, 4).map((bullet, idx) => (
                             <div key={idx} className="flex items-start gap-3 text-[var(--color-text-primary)] text-sm">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-default)] shrink-0" />
                                <span className="leading-relaxed">{bullet}</span>
                             </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* TILE 2: Visual / Image Tile - 4 cols */}
          <div className="relative md:col-span-2 lg:col-span-4 rounded-2xl overflow-hidden relative min-h-[300px]">
             <TileLabel number={2} />
             <AbstractImageTile className="h-full">
                {section2.image ? (
                    <ImageWithFallback 
                        src={section2.image} 
                        alt="" 
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="sr-only">Abstract background</span>
                    </div>
                )}
             </AbstractImageTile>
          </div>

          {/* ROW 2 */}

          {/* TILE 3: Who Is This Test For? (Section 1) - 4 cols */}
          <div className="relative md:col-span-1 lg:col-span-4 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)]">
             <TileLabel number={3} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section1.title || "Who is this test for?"}
             </h3>
             {section1.eligibilityTitle && (
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
                    {section1.eligibilityTitle}
                </p>
             )}
             <div className="space-y-4">
                {(section1.eligibilityPoints || []).slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0 text-[var(--color-primary-default)]">
                      <Check size={18} strokeWidth={2.5} />
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
             </div>
          </div>

          {/* TILE 5: Things To Remember (Section 4 Notes) - 4 cols */}
          <div className="relative md:col-span-1 lg:col-span-4 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)]">
             <TileLabel number={5} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section4.notesTitle || "Things to remember"}
             </h3>
             <div className="space-y-6">
                 {(section4.notes || []).slice(0, 3).map((n, idx) => (
                     <div key={idx} className="flex gap-3">
                         <AlertCircle size={20} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                         <div>
                             <p className="font-medium text-sm text-[var(--color-text-primary)]">{n.title}</p>
                             <p className="text-xs text-[var(--color-text-muted)] mt-1">{n.description}</p>
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* TILE 4: What You'll See (Section 3) - 4 cols */}
          <div className="relative md:col-span-2 lg:col-span-4 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)]">
             <TileLabel number={4} />
             <div className="flex flex-col h-full">
                <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
                    {section3.title || "What you'll see"}
                </h3>
                {section3.subtitle && (
                    <p className="text-sm text-[var(--color-text-muted)] mb-4 italic">
                        {section3.subtitle}
                    </p>
                )}
                <div>
                    {renderContent(section3.contentHtml, section3.content)} 
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
