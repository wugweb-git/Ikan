import React from 'react';
import { cn } from '../ui/utils';
import { 
  Check, 
  AlertCircle, 
  Timer, 
  Activity, 
  ListTodo,
  Brain,
  Target,
  ClipboardList,
  CheckCircle2
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
  questionCount?: number;
  duration?: number;
  difficulty?: string;
  importantNote1?: string;
  importantNote2?: string;
  className?: string;
}

// Custom Icons matching Figma paths exactly
const MeasureIcon1 = () => (
  <div className="relative shrink-0 size-[20px]">
    <svg className="block size-full" fill="none" viewBox="0 0 20 20">
      <path d="M5.00226 4.27063C5.01874 4.67372 5.13253 5.06684 5.33391 5.41641" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M16.6384 14.5693C16.1382 14.8514 15.5736 14.9996 14.9993 14.9993" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M9.99952 4.16651C9.99854 3.83322 10.0642 3.50309 10.1927 3.19556C10.3212 2.88802 10.5098 2.60927 10.7476 2.37572C10.9854 2.14216 11.2674 1.95851 11.5772 1.83556C11.887 1.71262 12.2183 1.65286 12.5515 1.65981C12.8847 1.66675 13.2132 1.74026 13.5176 1.87601C13.822 2.01175 14.0961 2.207 14.324 2.45026C14.5518 2.69352 14.7287 2.97989 14.8442 3.29251C14.9598 3.60514 15.0116 3.93771 14.9968 4.27067C15.4866 4.39661 15.9413 4.63236 16.3265 4.96006C16.7117 5.28777 17.0173 5.69883 17.2201 6.16212C17.423 6.62541 17.5177 7.12878 17.4972 7.6341C17.4766 8.13943 17.3414 8.63346 17.1017 9.07878C17.5232 9.4212 17.8546 9.86143 18.0672 10.3612C18.2797 10.8609 18.367 11.405 18.3213 11.9461C18.2756 12.4873 18.0985 13.009 17.8051 13.4661C17.5118 13.9231 17.1113 14.3016 16.6384 14.5685C16.6968 15.0204 16.6619 15.4794 16.536 15.9172C16.41 16.3551 16.1956 16.7624 15.9061 17.1142C15.6165 17.4659 15.2579 17.7546 14.8524 17.9623C14.4469 18.17 14.0032 18.2924 13.5485 18.3219C13.0939 18.3514 12.638 18.2874 12.2091 18.1339C11.7802 17.9803 11.3873 17.7404 11.0547 17.429C10.7221 17.1176 10.4569 16.7414 10.2754 16.3235C10.0939 15.9056 10 15.4549 9.99952 14.9993V4.16651Z" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
    </svg>
  </div>
);

const MeasureIcon2 = () => (
  <div className="relative shrink-0 size-[20px]">
    <svg className="block size-full" fill="none" viewBox="0 0 20 20">
      <path d="M12.4994 1.66659H7.49964C7.03943 1.66659 6.66635 2.03967 6.66635 2.49988V4.16647C6.66635 4.62668 7.03943 4.99976 7.49964 4.99976H12.4994C12.9596 4.99976 13.3327 4.62668 13.3327 4.16647V2.49988C13.3327 2.03967 12.9596 1.66659 12.4994 1.66659Z" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M13.3327 3.33317H14.9993C15.4413 3.33317 15.8652 3.50876 16.1777 3.82131C16.4903 4.13385 16.6659 4.55775 16.6659 4.99976V16.6659C16.6659 17.1079 16.4903 17.5318 16.1777 17.8443C15.8652 18.1569 15.4413 18.3325 14.9993 18.3325H4.99976C4.55775 18.3325 4.13385 18.1569 3.82131 17.8443C3.50876 17.5318 3.33317 17.1079 3.33317 16.6659V4.99976C3.33317 4.55775 3.50876 4.13385 3.82131 3.82131C4.13385 3.50876 4.55775 3.33317 4.99976 3.33317H6.66635" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M9.99952 9.16623H13.3327" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M9.99952 13.3327H13.3327" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M6.66635 9.16623H6.67468" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
      <path d="M6.66635 13.3327H6.67468" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
    </svg>
  </div>
);

const MeasureIcon3 = () => (
  <div className="relative shrink-0 size-[24px]">
    <svg className="block size-full" fill="none" viewBox="0 0 24 24">
      <path d="M9.99952 1.9999H13.9995" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M16.8995 3.8999C18.3995 4.8999 19.5995 6.2999 20.2995 7.8999" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M7.09952 3.8999C5.59952 4.8999 4.39952 6.2999 3.69952 7.8999" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  </div>
);

const CheckIcon = () => (
  <div className="relative shrink-0 size-[20px]">
    <svg className="block size-full" fill="none" viewBox="0 0 18 18">
      <path d="M8.9579 17.2908C13.5601 17.2908 17.2908 13.5601 17.2908 8.9579C17.2908 4.35575 13.5601 0.62497 8.9579 0.62497C4.35575 0.62497 0.62497 4.35575 0.62497 8.9579C0.62497 13.5601 4.35575 17.2908 8.9579 17.2908Z" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
      <path d="M5.62497 8.9583L7.29156 10.6249L12.2916 5.62497" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    </svg>
  </div>
);

const ImportantIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
    <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
  
  // Prepare What it measures icons
  const measureIcons = [MeasureIcon1, MeasureIcon2, MeasureIcon3];

  return (
    <section 
      className={cn("w-full bg-[#f5f5f5]", className)}
      style={{
        paddingTop: '20px',
        paddingBottom: '20px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col gap-[20px]">
          
          {/* TOP ROW (Container10 in Figma) */}
          <div 
            className="bg-white rounded-[16px] p-[16px] relative"
            style={{
              border: '0.586px solid rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex flex-col gap-[16px]">
              
              {/* What is this assessment? (Container1) */}
              <div className="flex flex-col gap-[24px]">
                <h2 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '24px',
                    lineHeight: '35px',
                    letterSpacing: '-0.317px',
                    color: '#151515',
                    margin: 0
                  }}
                >
                  {section2.title || "What is this assessment?"}
                </h2>
                <div className="flex flex-col gap-[16px]">
                  {section2.content ? section2.content.split('\n').map((p, i) => (
                    <p 
                      key={i} 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '26px',
                        letterSpacing: '-0.313px',
                        color: '#2a2a2a',
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
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    letterSpacing: '-0.89px',
                    color: '#151515',
                    margin: 0
                  }}
                >
                  {section3.title || "What it measures"}
                </h3>
                <div className="flex flex-col gap-[16px]">
                  {section2.bullets && section2.bullets.slice(0, 3).map((bullet, idx) => {
                    const Icon = measureIcons[idx % 3];
                    return (
                      <div 
                        key={idx} 
                        className="bg-[#f0f0f0] rounded-[16px] flex items-center pl-[16px] gap-[16px]"
                        style={{ height: '72px' }}
                      >
                        <div className="size-[40px] rounded-full bg-white flex items-center justify-center shrink-0">
                          <Icon />
                        </div>
                        <p 
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '19.25px',
                            letterSpacing: '-0.15px',
                            color: '#151515',
                            margin: 0
                          }}
                        >
                          {bullet}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* STATS ROW (Container20) */}
          <div className="flex flex-row gap-[16px]">
            {/* Task */}
            <div 
              className="bg-white rounded-[16px] grow basis-0 flex flex-col items-center justify-center gap-[10px]"
              style={{
                border: '0.586px solid rgba(0,0,0,0.1)',
                padding: '10.6px',
                height: 'auto',
                aspectRatio: '1/1.2' // Approximate based on Figma
              }}
            >
              <div className="size-[48px] rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <div className="size-[24px]">
                  <ListTodo className="size-full text-[#151515]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '24px', letterSpacing: '-0.313px', color: '#151515' }}>Task</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', letterSpacing: '-0.313px', color: '#717182', whiteSpace: 'nowrap' }}>{questionCount} Qs</p>
              </div>
            </div>

            {/* Time */}
            <div 
              className="bg-white rounded-[16px] grow basis-0 flex flex-col items-center justify-center gap-[10px]"
              style={{
                border: '0.586px solid rgba(0,0,0,0.1)',
                padding: '10.6px',
                height: 'auto',
                aspectRatio: '1/1.2'
              }}
            >
              <div className="size-[48px] rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <div className="size-[24px]">
                  <Timer className="size-full text-[#151515]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '24px', letterSpacing: '-0.313px', color: '#151515' }}>Time</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', letterSpacing: '-0.313px', color: '#717182', whiteSpace: 'nowrap' }}>{duration} min</p>
              </div>
            </div>

            {/* Level */}
            <div 
              className="bg-white rounded-[16px] grow basis-0 flex flex-col items-center justify-center gap-[10px]"
              style={{
                border: '0.586px solid rgba(0,0,0,0.1)',
                padding: '10.6px',
                height: 'auto',
                aspectRatio: '1/1.2'
              }}
            >
              <div className="size-[48px] rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <div className="size-[24px]">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#151515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '24px', letterSpacing: '-0.313px', color: '#151515' }}>Level</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '24px', letterSpacing: '-0.313px', color: '#717182', whiteSpace: 'nowrap' }}>{difficulty}</p>
              </div>
            </div>
          </div>

          {/* THINGS TO REMEMBER */}
          <div className="bg-white rounded-[16px] p-[16px] border border-[rgba(0,0,0,0.1)]">
            <h3 
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: '30px',
                letterSpacing: '-0.95px',
                color: '#151515',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              {section4.notesTitle || "Things to Remember Before You Start"}
            </h3>
            <div className="flex flex-col gap-[12px]">
              {(section4.notes || []).map((note, idx) => (
                <div key={idx} className="flex items-start gap-[12px]">
                  <div className="shrink-0 mt-[2px]">
                    <CheckIcon />
                  </div>
                  <p 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '15px',
                      lineHeight: '24.4px',
                      letterSpacing: '-0.23px',
                      color: '#151515'
                    }}
                  >
                    {note.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* IMPORTANT FOOTER */}
          {(importantNote1 || importantNote2) && (
            <div className="bg-[#2a2a2a] rounded-[16px] p-[20px] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ImportantIcon />
                </div>
                <span className="text-[20px] font-medium text-white tracking-[-0.9px]">Important</span>
              </div>
              <div className="space-y-4 pl-1">
                {importantNote1 && (
                  <p className="text-[15px] leading-[24px] text-[#f5f5f5] tracking-[-0.2px]">{importantNote1}</p>
                )}
                {importantNote2 && (
                  <p className="text-[15px] leading-[24px] text-[#f5f5f5] tracking-[-0.2px]">{importantNote2}</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
