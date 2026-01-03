import svgPaths from "./svg-e753vxm7go";
import imgScreenshot20260101At105051Pm1 from "figma:asset/32f4d62367772d2cb42d7e6675716d1cc1f67a33.png";

function Paragraph() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[741px]">This assessment helps you understand how stressed or overwhelmed you’ve been feeling lately, and whether life has felt manageable or out of control.</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[697px]">It focuses on how you’ve been responding to everyday pressures—at work, at home, or in your personal life—and how often stress has affected your thoughts and emotions.</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Paragraph />
      <Paragraph1 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <p className="font-['Ubuntu:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[26px] w-full">What is this assessment?</p>
      <Frame10 />
    </div>
  );
}

function BoldText() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex h-[18px] items-start ml-0 mt-0 relative w-[129.172px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">What it measures</p>
    </div>
  );
}

function Group12() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <BoldText />
    </div>
  );
}

function Group() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[19px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
        <g id="Group">
          <path d={svgPaths.p31268600} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p583c600} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.p3563c800} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p24119b70} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p35ab3500} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.p94b2f00} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.pf65c400} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.p24d72900} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.pad16900} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p31cac000} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p23f2b080} fill="var(--fill-0, black)" id="Vector_11" />
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
    <div className="bg-white relative rounded-[100px] shrink-0 size-[40px]" data-name="calendar (2)">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[24px] relative size-full">
          <Group2 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Calendar />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] w-[138px]">
        <p className="leading-[21px]">Perceived stress and overwhelm</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="basis-0 bg-[#f5f5f5] grow min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Item">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex items-start p-[12px] relative w-full">
          <Frame7 />
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[18px] items-center relative shrink-0 w-full">
      {[...Array(3).keys()].map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] items-start relative shrink-0 w-[747px]">
      <Group12 />
      <Frame8 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame11 />
      <Frame9 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[747px]" data-name="Container">
      <Frame12 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[33px] py-[32px] relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function BoldText1() {
  return <div className="absolute h-[18px] left-[33px] top-[36px] w-[38.516px]" data-name="Bold Text" />;
}

function Container2() {
  return (
    <div className="absolute bg-white h-[150px] left-0 rounded-[16px] top-0 w-[821px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <BoldText1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[6px] items-start relative shrink-0">
      <div className="h-[26.877px] relative shrink-0 w-[27.712px]" data-name="Screenshot 2026-01-01 at 10.50.51 PM 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgScreenshot20260101At105051Pm1} />
      </div>
      <p className="font-['Ubuntu:Regular',sans-serif] h-[45px] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[14px] w-[151.367px]">There are no right or wrong answers</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[9px] items-center relative shrink-0 w-full">
      {[...Array(4).keys()].map((_, i) => (
        <Frame key={i} />
      ))}
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-start relative shrink-0 w-[767.319px]">
      <p className="font-['Ubuntu:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[18px] w-full">Things to Remember Before You Start</p>
      <Frame5 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="h-[150px] relative shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[10px] items-start px-[27px] py-[32px] relative size-full">
          <Container2 />
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-end relative shrink-0 w-[821px]">
      <Container1 />
      <Frame14 />
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

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[47px] justify-center leading-[24px] not-italic relative shrink-0 text-[#171717] text-[0px] text-[16px] w-[138px]">
        <p className="font-['Ubuntu:Medium',sans-serif] mb-0">{`Task `}</p>
        <p>10 Quesitons</p>
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
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Group6() {
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
    <div className="bg-[#f5f5f5] relative rounded-[100px] shrink-0 size-[47px]" data-name="calendar (2)">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[24px] relative size-full">
          <Group8 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[47px] justify-center leading-[24px] not-italic relative shrink-0 text-[#171717] text-[0px] text-[16px] w-[138px]">
        <p className="font-['Ubuntu:Medium',sans-serif] mb-0">Time</p>
        <p>Time taken</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Item">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="size-full">
        <div className="content-stretch flex gap-[12px] items-start p-[20px] relative w-full">
          <Calendar2 />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0 w-full">
      <Item1 />
      {[...Array(2).keys()].map((_, i) => (
        <Item2 key={i} />
      ))}
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame4 />
    </div>
  );
}

function Group9() {
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

function Group10() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group9 />
    </div>
  );
}

function Group11() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group10 />
    </div>
  );
}

function Calendar3() {
  return (
    <div className="bg-[#f5f5f5] relative rounded-[100px] shrink-0 size-[40px]" data-name="calendar (2)">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[24px] relative size-full">
          <Group11 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[12px] h-[53px] items-center relative shrink-0">
      <Calendar3 />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-nowrap text-white">
        <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] text-[16px]">{`Important `}</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-[222px]">
      <Frame2 />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[112px] justify-center leading-[21px] not-italic relative shrink-0 text-[14px] text-white w-full">
        <p className="mb-0">This is a self-help and awareness tool, not a medical diagnosis</p>
        <p className="mb-0">&nbsp;</p>
        <p>Not intended for emergency or crisis situations</p>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="bg-[#4c4c4c] relative rounded-[16px] shrink-0 w-full" data-name="Item">
      <div className="size-full">
        <div className="content-stretch flex items-start p-[20px] relative w-full">
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-[257px]">
      <Frame1 />
      <Item3 />
    </div>
  );
}

export default function Frame16() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative size-full">
      <Frame15 />
      <Frame13 />
    </div>
  );
}