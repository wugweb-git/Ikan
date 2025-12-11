import svgPaths from "./svg-p4xm67qhqy";

function Frame28() {
  return (
    <div className="content-stretch flex flex-col font-semibold gap-2 h-[61px] items-start leading-[0] not-italic relative shrink-0 w-[296px]">
      <div className="flex flex-col justify-center relative shrink-0 text-[14.648px] text-black tracking-[1.5px] uppercase w-full">
        <p className="leading-[15px]">Title</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#151515] text-[32.672px] w-full">
        <p className="leading-[37.4px]">Assessment Name</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#151515] text-[15.406px]">
        <p className="leading-[27.2px]">A highly-curated selection of only the healthiest snacks, pantry staples, and state-of-the-art supplements.pantry staples, and state-of-the-art supplements.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame29 />
    </div>
  );
}

function Component24() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Component 24">
          <path d={svgPaths.p239c0200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.9375 2.25V15.75" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 5.02496H2.66249" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 7.5H2.66249" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 9.9H2.66249" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9125 12.2999H3.9375" id="Vector_6" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Info() {
  return (
    <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0" data-name="Info">
      <Component24 />
      <div className="flex flex-col font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap tracking-[0.06px] uppercase">
        <p className="leading-[24px] whitespace-pre">5 min Quiz</p>
      </div>
    </div>
  );
}

function Component25() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Component 24">
          <path d={svgPaths.p239c0200} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.9375 2.25V15.75" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 5.02496H2.66249" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 7.5H2.66249" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 9.9H2.66249" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9125 12.2999H3.9375" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Buttons() {
  return (
    <div className="bg-[#2e2a2f] relative rounded-md shrink-0 w-full" data-name="Buttons">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-2 items-center px-5 py-3 relative w-full">
          <Component25 />
          <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
            <p className="leading-[28px] whitespace-pre">Take Assassment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col gap-5 items-start relative shrink-0 w-[177px]">
      <Info />
      <Buttons />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex gap-3 items-end relative shrink-0 w-full">
      <div className="bg-[#d9d9d9] shrink-0 size-[148px]" />
      <Frame26 />
    </div>
  );
}

export default function AssessmentCard() {
  return (
    <div className="bg-white relative rounded-lg size-full" data-name="Assessment Card">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start p-6 relative size-full">
          <Frame28 />
          <Container />
          <Frame27 />
        </div>
      </div>
    </div>
  );
}