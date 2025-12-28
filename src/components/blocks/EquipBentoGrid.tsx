import React from 'react';
import { Check, Info } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

// Interfaces for the data we need
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
  secondaryImage?: string; // Tile 6
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

interface EquipBentoGridProps {
  section1: BentoSection1;
  section2: BentoSection2;
  section3: BentoSection3;
  section4: BentoSection4;
  className?: string;
}

const AbstractImageTile = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("relative w-full h-full overflow-hidden bg-neutral-100", className)}>
    {/* Abstract Background - Calm/Neutral with subtle Indigo/Blue hints */}
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-50 blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-50 blur-3xl opacity-60" />
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

export function EquipBentoGrid({
  section1,
  section2,
  section3,
  section4,
  className
}: EquipBentoGridProps) {
  
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
          
          {/* TILE 2: What is Sleep Tight? (Primary Content) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
            <TileLabel number={2} />
            <h2 className="text-2xl font-medium text-[var(--color-text-primary)] mb-2">
              {section2.title || "Sleep Tight"}
            </h2>
            {section2.subtitle && (
                <p className="text-sm text-[var(--color-text-muted)] mb-4 italic">
                    {section2.subtitle}
                </p>
             )}
            <div className="mb-6 mt-4">
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

          {/* TILE 1: Is this for you? (Checklist) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
             <TileLabel number={1} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section1.title || "Is this for you?"}
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
             {(section1.whoContent) && (
                <div className="mt-6 pt-4 border-t border-[var(--color-border-default)]">
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {section1.whoTitle || "Who can participate"}
                    </h4>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {section1.whoContent}
                    </p>
                </div>
             )}
          </div>

          {/* TILE 3: How it works (Process) */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
             <TileLabel number={3} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section3.title || "How it works"}
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

          {/* TILE 4: Benefits & Notes */}
          <div className="relative bg-[var(--color-bg-card)] rounded-2xl p-6 border border-[var(--color-border-default)]">
              <TileLabel number={4} />
              <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-6">
                {section4.benefitsTitle || "What you'll gain"}
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {(section4.benefits || []).slice(0, 4).map((b, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[var(--color-bg-muted)]">
                        <h4 className="font-medium text-[var(--color-text-primary)] mb-1">{b.title}</h4>
                        <p className="text-sm text-[var(--color-text-muted)]">{b.description}</p>
                    </div>
                ))}
              </div>
              
              {section4.notesTitle && (
                <div className="border-t border-[var(--color-border-default)] pt-6">
                    <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
                        {section4.notesTitle}
                    </h4>
                    <div className="space-y-4">
                        {(section4.notes || []).slice(0, 3).map((n, idx) => (
                            <div key={idx} className="flex gap-3">
                                <Info size={16} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm text-[var(--color-text-primary)]">{n.title}</p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{n.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
          </div>

           {/* TILE 5: Primary Image (Decorative) */}
           {section2.image && (
             <div className="relative rounded-2xl overflow-hidden h-48">
               <TileLabel number={5} />
               <ImageWithFallback 
                 src={section2.image} 
                 alt="" 
                 aria-hidden="true"
                 className="w-full h-full object-cover"
               />
             </div>
           )}
           
           {/* TILE 6: Secondary Image (Optional) */}
           <div className="relative rounded-2xl overflow-hidden h-40 bg-neutral-100">
             <TileLabel number={6} />
             <AbstractImageTile className="w-full h-full">
                {section2.secondaryImage ? (
                    <ImageWithFallback 
                        src={section2.secondaryImage} 
                        alt="" 
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    /* Abstract Fallback if no image */
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="sr-only">Abstract calm background</span>
                    </div>
                )}
             </AbstractImageTile>
           </div>
        </div>

        {/* Tablet & Desktop View: Bento Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-fr">
          
          {/* TILE 2: What is Sleep Tight */}
          {/* Tablet: Full width (2 cols) | Desktop: 8 cols, 2 rows */}
          <div className="relative md:col-span-2 lg:col-span-8 lg:row-span-2 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)] flex flex-col justify-between">
            <TileLabel number={2} />
            <div>
                <h2 className="text-3xl font-medium text-[var(--color-text-primary)] mb-4 tracking-tight">
                    {section2.title || "Sleep Tight"}
                </h2>
                {section2.subtitle && (
                    <p className="text-lg text-[var(--color-text-muted)] mb-6 italic">
                        {section2.subtitle}
                    </p>
                )}
                <div className="mb-8">
                     {renderContent(section2.contentHtml, section2.content ? section2.content.split('\n') : [], 2)}
                </div>
            </div>
            {section2.bullets && section2.bullets.length > 0 && (
                <div className="bg-[var(--color-bg-muted)] p-6 rounded-xl">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                        The program includes:
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

          {/* TILE 5: Primary Image (Abstract/Decorative) */}
          {/* Tablet: 1 col (Shared row with C) | Desktop: 4 cols, 2 rows */}
          <div className="relative md:col-span-1 lg:col-span-4 lg:row-span-2 rounded-2xl overflow-hidden relative">
             <TileLabel number={5} />
             <AbstractImageTile className="h-full">
                {section2.image ? (
                    <ImageWithFallback 
                        src={section2.image} 
                        alt="" 
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    /* Abstract Fallback if no image */
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="sr-only">Abstract calm background</span>
                    </div>
                )}
             </AbstractImageTile>
          </div>

          {/* TILE 1: Is this for you? */}
          {/* Tablet: 1 col (Shared row with B) | Desktop: 4 cols, 1 row */}
          <div className="relative md:col-span-1 lg:col-span-4 lg:row-span-1 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)] flex flex-col justify-center">
             <TileLabel number={1} />
             <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-4">
               {section1.title || "Is this for you?"}
             </h3>
             {section1.eligibilityTitle && (
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
                    {section1.eligibilityTitle}
                </p>
             )}
             <div className="space-y-4">
                {(section1.eligibilityPoints || []).slice(0, 3).map((item, idx) => (
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

          {/* TILE 3: How it works */}
          {/* Tablet: Full width (2 cols) | Desktop: 8 cols, 1 row */}
          <div className="relative md:col-span-2 lg:col-span-8 lg:row-span-1 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)] flex flex-col justify-center">
             <TileLabel number={3} />
             <div className="flex flex-col h-full justify-center">
                <h3 className="text-2xl font-medium text-[var(--color-text-primary)] mb-3">
                    {section3.title || "How it works"}
                </h3>
                {section3.subtitle && (
                    <p className="text-base text-[var(--color-text-muted)] mb-4 italic">
                        {section3.subtitle}
                    </p>
                )}
                <div>
                    {renderContent(section3.contentHtml, section3.content, 1)} 
                </div>
             </div>
          </div>

          {/* TILE 4: Benefits & Notes */}
          {/* Tablet: Full width (2 cols) | Desktop: 8 cols, 2 rows */}
          <div className="relative md:col-span-2 lg:col-span-8 lg:row-span-2 bg-[var(--color-bg-card)] rounded-2xl p-8 border border-[var(--color-border-default)]">
             <TileLabel number={4} />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full">
                {/* Benefits Col */}
                <div className="flex flex-col h-full">
                    <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-6">
                        {section4.benefitsTitle || "What you'll gain"}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 flex-1">
                        {(section4.benefits || []).slice(0, 3).map((b, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-[var(--color-bg-muted)]">
                                <h4 className="font-medium text-[var(--color-text-primary)] text-sm mb-1">{b.title}</h4>
                                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{b.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Notes Col */}
                <div className="flex flex-col h-full pl-0 sm:pl-8 sm:border-l border-[var(--color-border-default)]">
                     <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-6 mt-8 sm:mt-0">
                        {section4.notesTitle || "Important Notes"}
                    </h3>
                    <div className="space-y-6 flex-1">
                        {(section4.notes || []).slice(0, 3).map((n, idx) => (
                            <div key={idx} className="flex gap-3">
                                <Info size={18} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm text-[var(--color-text-primary)]">{n.title}</p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{n.description}</p>
                                </div>
                            </div>
                        ))}
                         {(section1.whoContent) && (
                            <div className="mt-auto pt-6">
                                <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                    {section1.whoTitle || "Who can participate"}
                                </h4>
                                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                    {section1.whoContent}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          </div>

          {/* TILE 6: Secondary Image/Spacer (Optional) */}
          {/* Tablet: Full width (2 cols) | Desktop: 4 cols, 2 rows */}
          <div className="relative md:col-span-2 lg:col-span-4 lg:row-span-2 rounded-2xl overflow-hidden relative">
             <TileLabel number={6} />
             <AbstractImageTile className="h-full min-h-[200px]">
                {section2.secondaryImage ? (
                    <ImageWithFallback 
                        src={section2.secondaryImage} 
                        alt="" 
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    /* Abstract Fallback if no image */
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="sr-only">Abstract calm background</span>
                    </div>
                )}
             </AbstractImageTile>
          </div>

        </div>
      </div>
    </section>
  );
}
