import { cn } from '../ui/utils';
import { 
  ListTodo,
  Calendar as CalendarIcon,
  Brain,
  Zap,
  Wrench,
  Clock,
  FlaskConical,
  Smile
} from 'lucide-react';

interface EquipBentoGridProps {
  section1?: {
    title: string;
    description: string[];
    isThisForYou?: {
      title: string;
      subtitle: string;
      points: string[];
    };
  };
  section2?: {
    title: string;
    points: string[];
  };
  section3?: {
    title: string;
    description: string[];
  };
  section4?: {
    title: string;
    points: Array<{
      title: string;
      description?: string;
    }>;
  };
  // Add direct props for flexibility
  tile1Content?: string[];
  tile2Content?: string[];
  tile3Content?: string[];
  tile4Content?: any[];
  eligibilityIntro?: string;
  eligibilityPoint1?: string;
  eligibilityPoint2?: string;
  eligibilityPoint3?: string;
  eligibilityPoint4?: string;
  rightColumnItems?: Array<{ icon?: string; text: string }>;
  howItWorksSubtitle?: string;
  howItWorksFooter?: string;
  className?: string;
}

const CheckIcon = () => (
  <div className="relative shrink-0 size-[20px]" style={{ color: 'var(--color-text-muted)' }}>
    <svg className="block size-full" fill="none" viewBox="0 0 18 18">
      <path d="M8.9579 17.2908C13.5601 17.2908 17.2908 13.5601 17.2908 8.9579C17.2908 4.35575 13.5601 0.62497 8.9579 0.62497C4.35575 0.62497 0.62497 4.35575 0.62497 8.9579C0.62497 13.5601 4.35575 17.2908 8.9579 17.2908Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
      <path d="M5.62497 8.9583L7.29156 10.6249L12.2916 5.62497" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    </svg>
  </div>
);

export function EquipBentoGrid({
  section1,
  section2,
  section3,
  section4,
  tile1Content,
  tile2Content,
  tile3Content,
  tile4Content,
  eligibilityIntro,
  eligibilityPoint1,
  eligibilityPoint2,
  eligibilityPoint3,
  eligibilityPoint4,
  rightColumnItems,
  howItWorksSubtitle,
  howItWorksFooter,
  className
}: EquipBentoGridProps) {

  // Resolve content
  const whatIsTitle = section1?.title || "What is this program about?";
  let whatIsDescription = tile1Content || section1?.description || [];
  
  // Safety check if description comes as string or non-array
  if (typeof whatIsDescription === 'string') {
    whatIsDescription = [whatIsDescription];
  } else if (!Array.isArray(whatIsDescription)) {
    whatIsDescription = [];
  }

  // Eligibility points
  const eligibilityPoints = [
    eligibilityPoint1 || section1?.isThisForYou?.points?.[0],
    eligibilityPoint2 || section1?.isThisForYou?.points?.[1],
    eligibilityPoint3 || section1?.isThisForYou?.points?.[2],
    eligibilityPoint4 || section1?.isThisForYou?.points?.[3]
  ].filter(Boolean) as string[];

  // 4 Tiles Data — generic defaults, overridden by section4 or tile4Content
  const defaultTiles = [
    { title: "Gain deeper understanding", subtitle: "Identify patterns and triggers", icon: CalendarIcon },
    { title: "Learn practical techniques", subtitle: "Evidence-based strategies you can use", icon: Brain },
    { title: "Build lasting habits", subtitle: "Create routines that support well-being", icon: Zap },
    { title: "Develop your toolkit", subtitle: "Skills you can return to anytime", icon: Wrench }
  ];

  const tilesData = [...defaultTiles];

  // Override from tile4Content (array of objects with title/description)
  if (tile4Content && Array.isArray(tile4Content) && tile4Content.length > 0) {
    tile4Content.slice(0, 4).forEach((p: any, i: number) => {
      if (i < tilesData.length) {
        if (typeof p === 'string') {
          tilesData[i].title = p;
        } else if (p && typeof p === 'object') {
          if (p.title) tilesData[i].title = p.title;
          if (p.description || p.subtitle) tilesData[i].subtitle = p.description || p.subtitle;
        }
      }
    });
  }

  // Override from section4 (structured props)
  if (section4?.points && Array.isArray(section4.points) && section4.points.length >= 4) {
    section4.points.slice(0, 4).forEach((p, i) => {
      tilesData[i].title = p.title;
      if (p.description) tilesData[i].subtitle = p.description;
    });
  }

  // Right Column Items (3 Items) — generic defaults
  const defaultRightItems = [
    { icon: Clock, text: "A structured journey designed to fit into daily life" },
    { icon: Smile, text: "Mood and progress trackers included" },
    { icon: FlaskConical, text: "Evidence-based techniques and exercises" }
  ];

  const resolvedRightItems = Array.isArray(rightColumnItems) && rightColumnItems.length > 0
    ? rightColumnItems.map((item: any) => ({ icon: Clock, text: typeof item === 'string' ? item : (item?.text ?? '') }))
    : defaultRightItems;

  // How it works steps
  let howItWorksSteps = section3?.description || tile3Content || [
    "You'll start with foundational concepts and guided exercises.",
    "Then you'll build on those skills with daily practice and reflection."
  ];

  // Safety check for howItWorksSteps
  if (typeof howItWorksSteps === 'string') {
    howItWorksSteps = [howItWorksSteps];
  } else if (!Array.isArray(howItWorksSteps)) {
    howItWorksSteps = [];
  }

  // Coerce any block value to a safe string so a stray object never renders as
  // "[object Object]" or crashes React with "Objects are not valid as a child".
  const asText = (v: any): string =>
    typeof v === 'string' ? v : (v?.text ?? v?.title ?? v?.description ?? '');

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
        
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-[20px]">
          
          {/* LEFT COLUMN WRAPPER */}
          <div className="contents lg:flex lg:flex-col lg:gap-[20px] lg:col-span-2">
            
            {/* MAIN CARD - Order 1 */}
            <div 
              className="p-[24px] lg:p-[32px] relative order-1"
              style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}
            >
              <div className="flex flex-col gap-[32px]">
                
                {/* Description */}
                <div className="flex flex-col gap-[24px]">
                  <h2 
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-regular)',
                      fontSize: '26px',
                      lineHeight: '24px',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}
                  >
                    {whatIsTitle}
                  </h2>
                  <div className="flex flex-col gap-[16px]">
                    {whatIsDescription.map((p, i) => (
                      <p 
                        key={i} 
                        style={{
                          fontFamily: 'var(--font-family-base)',
                          fontWeight: 'var(--font-weight-regular)',
                          fontSize: 'var(--text-base)',
                          lineHeight: '24px',
                          color: 'var(--color-text-primary)',
                          margin: 0
                        }}
                      >
                        {asText(p)}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Is This For You Section */}
                <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[49px] items-start">
                  <div className="flex flex-col gap-[14px]">
                    <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', lineHeight: '24px', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                      IS THIS FOR YOU?
                    </p>
                    <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: '18px', lineHeight: '24px', color: 'var(--color-text-primary)', maxWidth: '167px' }}>
                      {eligibilityIntro || "This program may be helpful if:"}
                    </p>
                  </div>
                  
                  {/* Checklist Grid */}
                  <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
                    {eligibilityPoints.map((point, idx) => (
                      <div key={idx} className="p-[12px] flex items-center gap-[12px] w-full" style={{ backgroundColor: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                        <div className="rounded-full size-[40px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                          <CheckIcon />
                        </div>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)', lineHeight: '21px', color: 'var(--color-text-primary)' }}>
                          {asText(point)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* TILES GROUP - Order 2 */}
            <div className="order-2 flex flex-col lg:flex-row w-full">
              {/* Mobile: 2x2 Grid, Desktop: 1x4 Row */}
              <div className="grid grid-cols-2 lg:flex lg:flex-row w-full">
                {tilesData.map((tile, idx) => {
                  const Icon = tile.icon;
                  const isFirst = idx === 0;
                  const isLast = idx === tilesData.length - 1;

                  let roundedClass = "";
                  if (idx === 0) roundedClass = "rounded-tl-[16px]";
                  else if (idx === 1) roundedClass = "rounded-tr-[16px]";
                  else if (idx === 2) roundedClass = "rounded-bl-[16px]";
                  else if (idx === 3) roundedClass = "rounded-br-[16px]";

                  const desktopRounded = isFirst ? "lg:rounded-l-[16px] lg:rounded-r-none" : 
                                       isLast ? "lg:rounded-r-[16px] lg:rounded-l-none" : 
                                       "lg:rounded-none";

                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "p-[16px] lg:px-[24px] lg:py-[20px] flex flex-col justify-center gap-[20px] lg:gap-[30px] border lg:flex-1 relative",
                        roundedClass,
                        desktopRounded,
                        idx === 1 ? "border-l-0 lg:border-l-0" : "",
                        idx === 2 ? "border-t-0 lg:border-t-[1px] lg:border-l-0" : "",
                        idx === 3 ? "border-t-0 border-l-0 lg:border-t-[1px] lg:border-l-0" : ""
                      )}
                      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-default)', minHeight: '200px' }}
                    >
                      <div className="size-[72px] rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                        <div className="size-[32px]">
                          <Icon className="size-full" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center h-[100px]">
                        <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-base)', lineHeight: '24px', color: 'var(--color-text-muted)', marginBottom: 0 }}>
                          {asText(tile.title)}
                        </p>
                        <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-base)', lineHeight: '24px', color: 'var(--color-text-muted)' }}>
                          {asText(tile.subtitle)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN WRAPPER */}
          <div className="contents lg:flex lg:flex-col lg:gap-[20px] lg:col-span-1">
            
            {/* 3 ITEMS GROUP - Order 4 (Mobile), Order 1 (Desktop) */}
            <div className="order-4 lg:order-1 flex flex-col gap-[20px]">
              {resolvedRightItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-[20px] flex items-start gap-[12px] w-full" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
                    <div className="size-[48px] shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                      <Icon className="size-[24px]" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col justify-center min-h-[48px]">
                      <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-sm)', lineHeight: '21px', color: 'var(--color-text-primary)' }}>
                        {asText(item.text)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HOW IT WORKS - Order 3 (Mobile), Order 2 (Desktop) */}
            <div 
              className="order-3 lg:order-2 p-[24px] w-full"
              style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)' }}
            >
              <div className="flex flex-col gap-[12px]">
                {/* Header */}
                <div className="flex items-center gap-[12px]">
                  <div className="size-[40px] rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                    <ListTodo className="size-[20px]" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', fontSize: '18px', lineHeight: '25px', color: 'var(--color-text-primary)' }}>
                    How it works
                  </p>
                </div>
                
                {/* Subtitle */}
                <p style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-xs)', lineHeight: '14px', color: 'var(--color-text-muted)' }}>
                  {howItWorksSubtitle || "This program works in progressive stages."}
                </p>

                {/* Steps */}
                <div className="flex flex-col gap-[13px] items-center text-center py-2">
                  {howItWorksSteps.map((step, i) => (
                    <p key={i} style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-xs)', lineHeight: '18px', color: 'var(--color-text-primary)', width: '100%' }}>
                      {asText(step)}
                    </p>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-[6px] py-[10px] flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontFamily: 'var(--font-family-base)', fontStyle: 'italic', fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-xs)', lineHeight: '18px', color: 'var(--color-text-primary)', textAlign: 'center' }}>
                    {howItWorksFooter || "The focus is on building sustainable habits and developing practical skills you can use every day."}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}