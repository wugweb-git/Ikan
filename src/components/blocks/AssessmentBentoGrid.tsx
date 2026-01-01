import React from 'react';
import { Check, Info, AlertCircle, Clock, FileText, Activity, Save, Eye, CheckCircle2 } from 'lucide-react';
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
  // Stats data from Basic Info
  questionCount?: number;
  duration?: number;
  difficulty?: string;
  // Important notes from metadata
  importantNote1?: string;
  importantNote2?: string;
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

const richTextClasses = "prose prose-sm md:prose-base max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_img]:rounded-lg [&_img]:max-w-full [&_a]:text-blue-600 [&_a]:underline text-[var(--color-text-primary)]";

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
          className="rich-text-content"
          style={{ fontSize: '16px', lineHeight: '24px' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (textArray && textArray.length > 0) {
      const items = limit ? textArray.slice(0, limit) : textArray;
      return items.map((p, i) => (
        <p key={i} style={{ fontSize: '16px', lineHeight: '24px' }} className="text-[#151515]">
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
          
          {/* TILE 1: What is this assessment? */}
          <div className="bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <p style={{ fontSize: '26px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515] mb-9">
              What is this assessment?
            </p>
            <div className="mb-8 space-y-6">
              {renderContent(section2.contentHtml, section2.content ? section2.content.split('\n') : [])}
            </div>
            
            {section2.bullets && section2.bullets.length > 0 && (
              <div>
                <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[17px]">
                  What it measures
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  {section2.bullets.slice(0, 3).map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-[11.5px]">
                      <Check className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0" strokeWidth={2} />
                      <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TILE 2: Stats */}
          <div className="bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <div className="space-y-[34px]">
              <div className="flex items-start gap-[17px]">
                <FileText className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[6px]" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[6px]">
                    Number of questions
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                    {questionCount} questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-[17px]">
                <Clock className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[6px]" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[6px]">
                    Time
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                    {duration} min
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-[17px]">
                <Activity className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[6px]" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[6px]">
                    Level
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                    {difficulty}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TILE 3: Things to Remember */}
          <div className="bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <p style={{ fontSize: '24px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515] mb-3">
              Things to Remember Before You Start
            </p>
            <div className="flex flex-col md:grid md:grid-cols-4 gap-3 pl-5">
              {(section4.notes || []).slice(0, 4).map((note, idx) => (
                <div key={idx}>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]" dangerouslySetInnerHTML={{ __html: note.title }} />
                </div>
              ))}
            </div>
          </div>

          {/* TILE 4: Important */}
          <div className="bg-[#ededed] rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <div className="flex items-start gap-[13px] mb-3">
              <AlertCircle className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[5px]" strokeWidth={2} />
              <p style={{ fontSize: '24px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                Important
              </p>
            </div>
            <div className="pl-5">
              <ul style={{ fontSize: '16px', lineHeight: '0', fontWeight: 400, listStyleType: 'disc' }} className="ml-[24px] text-[#151515]">
                {importantNote1 && (
                  <li className="mb-0">
                    <span style={{ lineHeight: '24px' }}>{importantNote1}</span>
                  </li>
                )}
                {importantNote2 && (
                  <li>
                    <span style={{ lineHeight: '24px' }}>{importantNote2}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

        </div>

        {/* Desktop View: Clean 2x2 Bento Grid */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          
          {/* ROW 1 */}
          
          {/* TILE 1: What is this assessment? - 8 cols */}
          <div className="col-span-8 bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <p style={{ fontSize: '26px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515] mb-9">
              What is this assessment?
            </p>
            <div className="mb-8 space-y-6">
              {renderContent(section2.contentHtml, section2.content ? section2.content.split('\n') : [])}
            </div>
            
            {section2.bullets && section2.bullets.length > 0 && (
              <div>
                <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[17px]">
                  What it measures
                </p>
                <div className="flex gap-6">
                  {section2.bullets.slice(0, 3).map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-[11.5px] flex-1">
                      <Check className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0" strokeWidth={2} />
                      <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TILE 2: Stats - 4 cols */}
          <div className="col-span-4 bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <div className="space-y-[34px]">
              <div className="flex items-start gap-[17px]">
                <FileText className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[6px]" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[6px]">
                    Number of questions
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                    {questionCount} questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-[17px]">
                <Clock className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[6px]" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[6px]">
                    Time
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                    {duration} min
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-[17px]">
                <Activity className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[6px]" strokeWidth={2} />
                <div>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }} className="text-[#151515] mb-[6px]">
                    Level
                  </p>
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                    {difficulty}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2 */}

          {/* TILE 3: Things to Remember - 8 cols */}
          <div className="col-span-8 bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <p style={{ fontSize: '24px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515] mb-6">
              Things to Remember Before You Start
            </p>
            <div className="grid grid-cols-4 gap-6">
              {(section4.notes || []).slice(0, 4).map((note, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#717182] shrink-0 mt-0.5" strokeWidth={2} />
                  <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400 }} className="text-[#717182]" dangerouslySetInnerHTML={{ __html: note.title }} />
                </div>
              ))}
            </div>
          </div>

          {/* TILE 4: Important - 4 cols */}
          <div className="col-span-4 bg-[#ededed] rounded-2xl p-8 border border-[rgba(0,0,0,0.1)]">
            <div className="flex items-start gap-[13px] mb-3">
              <AlertCircle className="w-[25px] h-[24px] text-[#2A2A2A] shrink-0 mt-[5px]" strokeWidth={2} />
              <p style={{ fontSize: '24px', lineHeight: '24px', fontWeight: 400 }} className="text-[#151515]">
                Important
              </p>
            </div>
            <div className="pl-5">
              <ul style={{ fontSize: '16px', lineHeight: '0', fontWeight: 400, listStyleType: 'disc' }} className="ml-[24px] text-[#151515]">
                {importantNote1 && (
                  <li className="mb-0">
                    <span style={{ lineHeight: '24px' }}>{importantNote1}</span>
                  </li>
                )}
                {importantNote2 && (
                  <li>
                    <span style={{ lineHeight: '24px' }}>{importantNote2}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}