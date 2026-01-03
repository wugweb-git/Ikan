import svgPaths from "./svg-30ujse8sz4";

function Group() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[23px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Group">
          <path d={svgPaths.p3d656500} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.pb1a1610} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.pec95f90} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p2cb9ce80} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p2fa14600} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.pd3bf300} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.p277a2300} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.pbe3ca00} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p2e33f480} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p3dbb7100} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p1dfc0880} fill="var(--fill-0, black)" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group />
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group1 />
    </div>
  );
}

function Calendar() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[100px] shrink-0 size-[47px]" data-name="calendar (2)">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[24px] relative size-full">
          <Group2 />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[47px] justify-center leading-[24px] not-italic relative shrink-0 text-[#171717] text-[0px] text-[16px] w-[138px]">
        <p className="font-['Ubuntu:Medium',sans-serif] mb-0">{`Task `}</p>
        <p>10 Quesitons</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Item">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="content-stretch flex gap-[12px] items-start p-[20px] relative w-full">
          <Calendar />
          <Container />
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[23px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 23">
        <g id="Group">
          <path d={svgPaths.p3d656500} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.pb1a1610} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.pec95f90} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p2cb9ce80} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p2fa14600} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.pd3bf300} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.p277a2300} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.pbe3ca00} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p2e33f480} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p3dbb7100} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p1dfc0880} fill="var(--fill-0, black)" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group3 />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group4 />
    </div>
  );
}

function Calendar1() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[100px] shrink-0 size-[47px]" data-name="calendar (2)">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[24px] relative size-full">
          <Group5 />
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[47px] justify-center leading-[24px] not-italic relative shrink-0 text-[#171717] text-[0px] text-[16px] w-[138px]">
        <p className="font-['Ubuntu:Medium',sans-serif] mb-0">Time</p>
        <p>Time taken</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Item">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="content-stretch flex gap-[12px] items-start p-[20px] relative w-full">
          <Calendar1 />
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-full">
      <Item />
      {[...Array(2).keys()].map((_, i) => (
        <Item1 key={i} />
      ))}
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame3 />
    </div>
  );
}

function Group6() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[18px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Group">
          <path d={svgPaths.p39917700} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p395f8500} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.pd11d600} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p2a275000} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p622200} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.p2e94b080} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.p2fa39e00} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.p12874680} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p35e4000} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p20f9ab00} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p1787300} fill="var(--fill-0, black)" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

function Group7() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group6 />
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group7 />
    </div>
  );
}

function Calendar2() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[100px] shrink-0 size-[40px]" data-name="calendar (2)">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[24px] relative size-full">
          <Group8 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[12px] h-[53px] items-center relative shrink-0">
      <Calendar2 />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-nowrap text-white">
        <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] text-[16px]">{`Important `}</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-[222px]">
      <Frame1 />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[112px] justify-center leading-[21px] not-italic relative shrink-0 text-[14px] text-white w-full">
        <p className="mb-0">This is a self-help and awareness tool, not a medical diagnosis</p>
        <p className="mb-0">&nbsp;</p>
        <p>Not intended for emergency or crisis situations</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="bg-[#4c4c4c] relative rounded-[16px] shrink-0 w-full" data-name="Item">
      <div className="size-full">
        <div className="content-stretch flex items-start p-[20px] relative w-full">
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

export default function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative size-full">
      <Frame />
      <Item2 />
    </div>
  );
}