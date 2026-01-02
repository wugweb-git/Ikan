function Container() {
  return (
    <div className="bg-gradient-to-b from-[rgba(255,255,255,0)] h-[606px] min-h-[500px] relative shrink-0 to-[#f5f5f5] w-full" data-name="Container">
      <div className="flex flex-row items-end min-h-[inherit] size-full">
        <div className="min-h-[inherit] size-full" />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[89.588px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Ubuntu:Medium',sans-serif] h-[90px] leading-[44.8px] left-0 not-italic text-[#151515] text-[32px] top-[0.1px] w-[296px]">Feeling worried and stressed</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[338px]" data-name="Paragraph">
      <p className="basis-0 font-['Ubuntu:Regular',sans-serif] grow leading-[24px] min-h-px min-w-px not-italic relative shrink-0 text-[#151515] text-[16px]">Gauge how overwhelmed or in control you’ve felt over the last month to understand your stress levels.</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#2a2a2a] h-[47.998px] relative rounded-[6px] shrink-0 w-[168.761px]" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[84.5px] not-italic text-[16px] text-center text-nowrap text-white top-[11.34px] tracking-[-0.3125px] translate-x-[-50%]">Take Assessment</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] items-start justify-center left-0 p-[20px] top-[319px] w-[394px]" data-name="Container">
      <Heading />
      <Paragraph />
      <Button />
    </div>
  );
}

export default function AssessmentHero() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-between relative size-full" data-name="AssessmentHero">
      <Container />
      <Container1 />
    </div>
  );
}