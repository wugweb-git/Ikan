import svgPaths from "./svg-szh2usiii6";

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
    <div className="bg-white relative rounded-[100px] shrink-0 size-[47px]" data-name="calendar (2)">
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
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[47px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[138px]">
        <p className="leading-[24px]">Perceived stress and overwhelm</p>
      </div>
    </div>
  );
}

export default function Item() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[16px] size-full" data-name="Item">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="content-stretch flex gap-[12px] items-start p-[20px] relative size-full">
          <Calendar />
          <Container />
        </div>
      </div>
    </div>
  );
}