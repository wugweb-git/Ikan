import svgPaths from "./svg-1f0628h1hy";

function Group() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[32px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Group">
          <path d={svgPaths.pf661d80} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p23785400} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.p3f3fe880} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p3e9b6600} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p1840f980} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.p1571b100} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.p29815bf0} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.p3045e600} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p2c749b80} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p24890900} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p225aca40} fill="var(--fill-0, black)" id="Vector_11" />
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
    <div className="bg-[#f5f5f5] content-stretch flex items-center justify-center overflow-clip p-[24px] relative rounded-[100px] shrink-0 size-[72px]" data-name="calendar (2)">
      <Group2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-bl-[16px] rounded-tl-[16px] shrink-0">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[30px] items-start justify-center px-[24px] py-[20px] relative w-full">
          <Calendar />
          <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[100px] justify-center leading-[24px] not-italic relative shrink-0 text-[#757575] text-[0px] text-[16px] w-full">
            <p className="font-['Ubuntu:Bold',sans-serif] mb-0">Understand your sleep better</p>
            <p>Notice patterns and key disruptors</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-tl-[16px]" />
    </div>
  );
}

function Outline() {
  return (
    <div className="absolute inset-[4.17%_4.17%_4.16%_4.17%]" data-name="outline">
      <div className="absolute inset-[-0.68%_-0.69%_-0.69%_-0.69%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.7366 29.7386">
          <g id="outline">
            <path d={svgPaths.p33731c00} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p14622c80} fill="var(--fill-0, black)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p3d589100} fill="var(--fill-0, black)" id="Vector_3" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p32010400} fill="var(--fill-0, black)" id="Vector_4" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p2fb47480} fill="var(--fill-0, black)" id="Vector_5" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p19370f20} fill="var(--fill-0, black)" id="Vector_6" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p28e8ce00} fill="var(--fill-0, black)" id="Vector_7" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p112fe000} fill="var(--fill-0, black)" id="Vector_8" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p38142800} fill="var(--fill-0, black)" id="Vector_9" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p3798e500} fill="var(--fill-0, black)" id="Vector_10" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p21331b00} fill="var(--fill-0, black)" id="Vector_11" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LogicalThinking() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="logical-thinking">
      <Outline />
    </div>
  );
}

function Calendar1() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex items-center justify-center overflow-clip p-[24px] relative rounded-[109.589px] shrink-0 size-[72px]" data-name="calendar (2)">
      <LogicalThinking />
    </div>
  );
}

function Frame1() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[30px] items-start justify-center px-[24px] py-[20px] relative w-full">
          <Calendar1 />
          <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[100px] justify-center leading-[24px] not-italic relative shrink-0 text-[#757575] text-[0px] text-[16px] w-[150px]">
            <p className="font-['Ubuntu:Bold',sans-serif] mb-0">Manage sleep-related thoughts</p>
            <p>Respond to worries that keep you awake</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Outline1() {
  return (
    <div className="absolute inset-[4.17%_4.17%_4.16%_4.17%]" data-name="outline">
      <div className="absolute inset-[-0.68%_-0.69%_-0.69%_-0.69%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.7366 29.7386">
          <g id="outline">
            <path d={svgPaths.p33731c00} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p14622c80} fill="var(--fill-0, black)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p3d589100} fill="var(--fill-0, black)" id="Vector_3" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p32010400} fill="var(--fill-0, black)" id="Vector_4" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p2fb47480} fill="var(--fill-0, black)" id="Vector_5" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p19370f20} fill="var(--fill-0, black)" id="Vector_6" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p28e8ce00} fill="var(--fill-0, black)" id="Vector_7" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p112fe000} fill="var(--fill-0, black)" id="Vector_8" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p38142800} fill="var(--fill-0, black)" id="Vector_9" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p3798e500} fill="var(--fill-0, black)" id="Vector_10" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p21331b00} fill="var(--fill-0, black)" id="Vector_11" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LogicalThinking1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="logical-thinking">
      <Outline1 />
    </div>
  );
}

function Calendar2() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex items-center justify-center overflow-clip p-[26.301px] relative rounded-[109.589px] shrink-0 size-[72px]" data-name="calendar (2)">
      <LogicalThinking1 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative shrink-0">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[30px] items-start justify-center px-[24px] py-[20px] relative w-full">
          <Calendar2 />
          <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[100px] justify-center leading-[24px] not-italic relative shrink-0 text-[#757575] text-[0px] text-[16px] w-full">
            <p className="font-['Ubuntu:Bold',sans-serif] mb-0">Build sleep-friendly habits</p>
            <p>Create routines that support rest</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[4%_14.49%_3.98%_14.5%]" data-name="Group">
      <div className="absolute inset-[-0.68%_-0.88%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.125 29.845">
          <g id="Group">
            <path d={svgPaths.p271b5480} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[77.73%_51.67%_3.98%_41.48%]" data-name="Group">
      <div className="absolute inset-[-3.42%_-9.12%_-3.42%_-9.13%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.59182 6.2503">
          <g id="Group">
            <path d={svgPaths.p3dd60500} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[4%_14.49%_3.98%_14.5%]" data-name="Group">
      <Group3 />
      <Group4 />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute inset-[9.53%_20.54%_52.79%_24.33%]" data-name="Group">
      <div className="absolute inset-[-0.01%_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6413 12.055">
          <g id="Group">
            <path d={svgPaths.p3e034d00} fill="var(--fill-0, black)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents inset-[4%_14.49%_3.98%_14.5%]">
      <Group5 />
      <Group6 />
    </div>
  );
}

function MentalDisorder() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="mental-disorder (1)">
      <Group7 />
    </div>
  );
}

function Calendar3() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex items-center justify-center overflow-clip p-[24px] relative rounded-[109.589px] shrink-0 size-[72px]" data-name="calendar (2)">
      <MentalDisorder />
    </div>
  );
}

function Frame2() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-br-[16px] rounded-tr-[16px] shrink-0">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[30px] items-start px-[24px] py-[20px] relative w-full">
          <Calendar3 />
          <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[100px] justify-center leading-[24px] not-italic relative shrink-0 text-[#757575] text-[0px] text-[16px] w-full">
            <p className="font-['Ubuntu:Bold',sans-serif] mb-0">Develop reusable tools</p>
            <p>Skills you can return to anytime</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-br-[16px] rounded-tr-[16px]" />
    </div>
  );
}

export default function Frame4() {
  return (
    <div className="content-stretch flex items-center relative size-full">
      <Frame />
      <Frame1 />
      <Frame3 />
      <Frame2 />
    </div>
  );
}