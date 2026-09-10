import { cn } from '../ui/utils';
import { stripDuplicateHeading } from '../../lib/cms-content';
import {
  Timer,
  ListTodo,
  HeartPulse,
  ClipboardList,
  Gauge
} from 'lucide-react';

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
  section1: BentoSection1; 
  section2: BentoSection2; 
  section3: BentoSection3; 
  section4: BentoSection4; 
  /** Item count. Null renders no tile — never a stand-in number. */
  questionCount?: number | null;
  /** Authored minutes. Null renders no tile. */
  duration?: number | null;
  /** Authored difficulty. Null renders no tile. */
  difficulty?: string | null;
  importantNote1?: string;
  importantNote2?: string;
  /** `metadata.tile4_content` — the real "What you'll see", authored as HTML. */
  whatYoullSeeHtml?: string;
  /** `metadata.tile5_content` — the full Important notes list, authored as HTML. */
  importantNotesHtml?: string;
  className?: string;
}

// "What it measures" icons. These were previously hand-pasted Figma path
// exports; two of the three were truncated mid-export and rendered as stray
// fragments, so they use lucide (same as EquipBentoGrid) instead.
const MeasureIcon1 = () => (
  <HeartPulse className="shrink-0 size-[20px]" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.67} />
);

const MeasureIcon2 = () => (
  <ClipboardList className="shrink-0 size-[20px]" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.67} />
);

const MeasureIcon3 = () => (
  <Gauge className="shrink-0 size-[20px]" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.67} />
);

const CheckIcon = () => (
  <div className="relative shrink-0 size-[20px]" style={{ color: 'var(--color-text-muted)' }}>
    <svg className="block size-full" fill="none" viewBox="0 0 18 18">
      <path d="M8.9579 17.2908C13.5601 17.2908 17.2908 13.5601 17.2908 8.9579C17.2908 4.35575 13.5601 0.62497 8.9579 0.62497C4.35575 0.62497 0.62497 4.35575 0.62497 8.9579C0.62497 13.5601 4.35575 17.2908 8.9579 17.2908Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
      <path d="M5.62497 8.9583L7.29156 10.6249L12.2916 5.62497" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    </svg>
  </div>
);

const ImportantIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-primary-on)' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export function AssessmentBentoGrid({
  section1,
  section2,
  section3,
  section4,
  // No defaults. These three used to be 10 / 5 / 'Beginner', which every
  // assessment page printed as fact regardless of what its record said —
  // and `difficulty` has never been authored on any of them at all.
  questionCount = null,
  duration = null,
  difficulty = null,
  importantNote1,
  importantNote2,
  whatYoullSeeHtml,
  importantNotesHtml,
  className
}: AssessmentBentoGridProps) {
  
  // Prepare What it measures icons
  const measureIcons = [MeasureIcon1, MeasureIcon2, MeasureIcon3];

  return (
    <section 
      className={cn("w-full", className)}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[20px]">
          
          {/* LEFT COLUMN WRAPPER (Desktop) */}
          <div className="contents lg:flex lg:flex-col lg:gap-[20px] lg:col-span-9">
            
            {/* TOP ROW (Container10 in Figma) - Order 1 on Mobile */}
            <div 
              className="p-[24px] lg:p-[32px] relative order-1"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '0.586px solid var(--color-border-default)'
              }}
            >
              <div className="flex flex-col gap-[16px]">
                
                {/* What is this assessment? (Container1) */}
                <div className="flex flex-col gap-[24px]">
                  <h2 
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: '24px',
                      lineHeight: '35px',
                      letterSpacing: '-0.317px',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}
                  >
                    {section2.title || "What is this assessment?"}
                  </h2>
                  <div className="flex flex-col gap-[16px]">
                    {typeof section2.content === 'string' ? section2.content.split('\n').map((p, i) => (
                      <p 
                        key={i} 
                        style={{
                          fontFamily: 'var(--font-family-base)',
                          fontWeight: 'var(--font-weight-regular)',
                          fontSize: 'var(--text-base)',
                          lineHeight: '26px',
                          letterSpacing: '-0.313px',
                          color: 'var(--color-primary-default)',
                          margin: 0
                        }}
                      >
                        {p}
                      </p>
                    )) : null}
                  </div>
                </div>

                {/* What it measures (Container9) */}
                <div className="flex flex-col gap-[16px] pt-[8px]">
                  <h3 
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: '18px',
                      lineHeight: '27px',
                      letterSpacing: '-0.89px',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}
                  >
                    {/*
                      THE BULLETS ARE WHAT IT MEASURES.

                      This printed `section3.title` — "What you'll see" — over
                      `section2.bullets`, which are what the assessment measures.
                      One heading sat over another section's content, and the
                      real "What you'll see" (metadata.tile4_content) rendered
                      nowhere. Two authored fields lost to one line.
                    */}
                    What it measures
                  </h3>
                  <div className="flex flex-col lg:flex-row gap-[16px] lg:gap-[18px]">
                    {Array.isArray(section2.bullets) && section2.bullets.slice(0, 3).map((bullet, idx) => {
                      const Icon = measureIcons[idx % 3];
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center p-[12px] gap-[12px] flex-1"
                          style={{ 
                            backgroundColor: 'var(--color-bg-page)', 
                            borderRadius: 'var(--radius-md)',
                            minHeight: '72px' 
                          }}
                        >
                          <div className="size-[40px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                            <Icon />
                          </div>
                          <p 
                            style={{
                              fontFamily: 'var(--font-family-base)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontSize: 'var(--text-sm)',
                              lineHeight: '19.25px',
                              letterSpacing: '-0.15px',
                              color: 'var(--color-text-primary)',
                              margin: 0
                            }}
                          >
                            {typeof bullet === 'string' ? bullet : ((bullet as any)?.text || (bullet as any)?.title || '')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* HOW IT WORKS + WHO IT IS FOR — section1, authored on all seven
                assessments and rendered by nothing until 2026-09-10. The prop
                was destructured and never used. */}
            {(section1.title || (Array.isArray(section1.eligibilityPoints) && section1.eligibilityPoints.length > 0) || section1.whoContent) && (
              <div
                className="p-[24px] lg:p-[32px] order-2 lg:order-none"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: '20px', lineHeight: '30px', letterSpacing: '-0.95px', color: 'var(--color-text-primary)', margin: 0 }}>
                  {section1.title || 'How it works'}
                </h3>

                {Array.isArray(section1.eligibilityPoints) && section1.eligibilityPoints.length > 0 && (
                  <div className="flex flex-col lg:flex-row gap-[12px] lg:gap-[16px] mt-[16px]">
                    {section1.eligibilityPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-[12px] flex-1 p-[12px]"
                        style={{ backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}
                      >
                        <div className="shrink-0"><CheckIcon /></div>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)', lineHeight: '21px', color: 'var(--color-text-primary)', margin: 0 }}>
                          {typeof point === 'string'
                            ? point
                            : ((point as { text?: string; title?: string })?.text
                               ?? (point as { title?: string })?.title ?? '')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {section1.whoContent && (
                  <div className="mt-[20px] pt-[16px]" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', lineHeight: '24px', color: 'var(--color-text-primary)', margin: 0 }}>
                      {section1.whoTitle || 'Who is it for?'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-base)', lineHeight: '26px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                      {section1.whoContent}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* WHAT YOU'LL SEE — `section3.title` finally over its own content.
                `section3_content` is empty on all seven; the text lives in
                `metadata.tile4_content` and had no reader. */}
            {whatYoullSeeHtml && (
              <div
                className="p-[24px] lg:p-[32px] order-2 lg:order-none"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: '20px', lineHeight: '30px', letterSpacing: '-0.95px', color: 'var(--color-text-primary)', margin: '0 0 12px' }}>
                  {section3.title || "What you'll see"}
                </h3>
                {/* Same treatment `Assessments.tsx` already gives these tiles. */}
                <div
                  className="prose max-w-none [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                  style={{ fontFamily: 'var(--font-family-base)', fontSize: 'var(--text-base)', lineHeight: '26px', color: 'var(--color-text-muted)' }}
                  dangerouslySetInnerHTML={{ __html: stripDuplicateHeading(whatYoullSeeHtml, section3.title || "What you'll see") }}
                />
              </div>
            )}

            {/* THINGS TO REMEMBER - Order 3 on Mobile */}
            <div 
              className="p-[24px] lg:p-[32px] order-3"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-default)'
              }}
            >
              <h3 
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontSize: '20px',
                  lineHeight: '30px',
                  letterSpacing: '-0.95px',
                  color: 'var(--color-text-primary)',
                  marginBottom: '16px'
                }}
              >
                {section4.notesTitle || "Things to Remember Before You Start"}
              </h3>
              <div className="flex flex-col lg:flex-row gap-[12px] lg:gap-[9px]">
                {(Array.isArray(section4.notes) ? section4.notes : []).map((note, idx) => (
                  <div key={idx} className="flex items-start gap-[12px] flex-1">
                    <div className="shrink-0 mt-[2px]">
                      <CheckIcon />
                    </div>
                    <p 
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontWeight: 'var(--font-weight-regular)',
                        fontSize: '15px',
                        lineHeight: '24.4px',
                        letterSpacing: '-0.23px',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {typeof note === 'string' ? note : ((note as any)?.title || (note as any)?.text || '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          
          </div>

          {/* RIGHT COLUMN WRAPPER (Desktop) */}
          <div className="contents lg:flex lg:flex-col lg:gap-[20px] lg:col-span-3">

            {/* STATS ROW (Container20) - Order 2 on Mobile */}
            <div className="flex flex-row lg:flex-col gap-[16px] order-2">
              {questionCount !== null && (<>
              {/* Task */}
              <div 
                className="grow basis-0 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-[10px] lg:gap-[12px] p-[16px] lg:p-[20px]"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '0.586px solid var(--color-border-default)',
                  height: 'auto',
                }}
              >
                <div className="size-[48px] lg:size-[47px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <div className="size-[24px]">
                    <ListTodo className="size-full" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', lineHeight: '24px', letterSpacing: '-0.313px', color: 'var(--color-text-primary)' }} className="lg:text-[16px]">Task</p>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)', lineHeight: '24px', letterSpacing: '-0.313px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }} className="lg:text-[16px]">{questionCount} Qs</p>
                </div>
              </div>
              </>)}

              {duration !== null && (<>
              {/* Time */}
              <div 
                className="grow basis-0 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-[10px] lg:gap-[12px] p-[16px] lg:p-[20px]"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '0.586px solid var(--color-border-default)',
                  height: 'auto',
                }}
              >
                <div className="size-[48px] lg:size-[47px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <div className="size-[24px]">
                    <Timer className="size-full" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', lineHeight: '24px', letterSpacing: '-0.313px', color: 'var(--color-text-primary)' }} className="lg:text-[16px]">Time</p>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)', lineHeight: '24px', letterSpacing: '-0.313px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }} className="lg:text-[16px]">{duration} min</p>
                </div>
              </div>
              </>)}

              {difficulty !== null && (<>
              {/* Level */}
              <div 
                className="grow basis-0 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-[10px] lg:gap-[12px] p-[16px] lg:p-[20px]"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '0.586px solid var(--color-border-default)',
                  height: 'auto',
                }}
              >
                <div className="size-[48px] lg:size-[47px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <div className="size-[24px]" style={{ color: 'var(--color-text-primary)' }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', lineHeight: '24px', letterSpacing: '-0.313px', color: 'var(--color-text-primary)' }} className="lg:text-[16px]">Level</p>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)', lineHeight: '24px', letterSpacing: '-0.313px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }} className="lg:text-[16px]">{difficulty}</p>
                </div>
              </div>
              </>)}
            </div>

            {/* IMPORTANT FOOTER - Order 4 on Mobile */}
            {/* IMPORTANT — `metadata.tile5_content` carries four notes, two of
                them the ones that matter most ("consider reaching out to a
                mental health professional", "you may choose to share your
                results"). This printed only the two short `important_note_*`
                fields. The pair remain the fallback for a record with no tile. */}
            {(importantNotesHtml || importantNote1 || importantNote2) && (
              <div 
                className="p-[20px] shadow-sm order-4"
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <ImportantIcon />
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-on)', letterSpacing: '-0.9px' }}>Important</span>
                </div>
                <div className="space-y-4 pl-1">
                  {importantNotesHtml ? (
                    <div
                      className="prose max-w-none [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-medium"
                      style={{ fontSize: '15px', lineHeight: '24px', color: 'var(--color-primary-on)', letterSpacing: '-0.2px', opacity: 0.95 }}
                      dangerouslySetInnerHTML={{ __html: stripDuplicateHeading(importantNotesHtml, 'Important notes') }}
                    />
                  ) : null}
                  {!importantNotesHtml && importantNote1 && (
                    <p style={{ fontSize: '15px', lineHeight: '24px', color: 'var(--color-primary-on)', letterSpacing: '-0.2px', opacity: 0.95 }}>{importantNote1}</p>
                  )}
                  {!importantNotesHtml && importantNote2 && (
                    <p style={{ fontSize: '15px', lineHeight: '24px', color: 'var(--color-primary-on)', letterSpacing: '-0.2px', opacity: 0.95 }}>{importantNote2}</p>
                  )}
                </div>
              </div>
            )}
          
          </div>

        </div>
      </div>
    </section>
  );
}