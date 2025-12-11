import svgPaths from "./svg-850apu7kjy";
import imgBgJpeg from "figma:asset/b504b22d1eb3aa6bb5ce49de15b5bbf2d1cbdc97.png";

function Frame1000007473() {
  return (
    <div className="h-[12px] relative shrink-0 w-[100px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 12">
        <g id="Frame 1000007473">
          <circle cx="6" cy="6" fill="var(--fill-0, white)" id="Ellipse 82" r="6" />
          <circle cx="28" cy="6" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.3" id="Ellipse 83" r="6" />
          <circle cx="50" cy="6" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.3" id="Ellipse 84" r="6" />
          <circle cx="72" cy="6" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.3" id="Ellipse 85" r="6" />
          <circle cx="94" cy="6" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.3" id="Ellipse 86" r="6" />
        </g>
      </svg>
    </div>
  );
}

function BgJpeg() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[10px] h-full items-center justify-end overflow-clip px-[10px] py-[16px] relative shrink-0 w-[750px]" data-name="bg.jpeg">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img alt="" className="absolute max-w-none object-50%-50% object-cover size-full" src={imgBgJpeg} />
        <div className="absolute bg-gradient-to-b from-[63.526%] from-[rgba(0,0,0,0)] inset-0 to-[rgba(0,0,0,0.55)]" />
      </div>
      <Frame1000007473 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[10px] h-full items-end justify-center relative shrink-0" data-name="Container">
      <BgJpeg />
    </div>
  );
}

function Container1() {
  return <div className="h-[145.19px] shrink-0 w-full" data-name="Container" />;
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter_Tight:SemiBold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[22px] w-full">
        <p className="leading-[28px]">Log in</p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#757575] text-[12px] uppercase w-full">
        <p className="leading-[12px]">Email</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#d9d9d9] text-[14px] w-full">
        <p className="leading-[normal]">Email or Username</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[48px] relative shrink-0 w-full" data-name="Input">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col h-[48px] items-start pb-[16px] pt-[15px] px-[16px] relative w-full">
          <Container2 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#757575] text-[12px] uppercase w-full">
        <p className="leading-[12px]">Password</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#d9d9d9] text-[14px] w-full">
        <p className="leading-[normal]">Password</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white h-[48px] relative shrink-0 w-full" data-name="Input">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col h-[48px] items-start pb-[16px] pt-[15px] px-[16px] relative w-full">
          <Container4 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Input1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="box-border content-stretch flex items-start pl-[25px] pr-0 py-0 relative shrink-0" data-name="Label">
      <div className="absolute left-0 rounded-[4px] size-[19px] top-0" data-name="Border">
        <div aria-hidden="true" className="absolute border-2 border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[4px]" />
      </div>
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap">
        <p className="leading-[18.2px] whitespace-pre">Keep me logged in</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-[4.81px] pt-[4px] px-0 relative shrink-0 w-full" data-name="Container">
      <Label2 />
    </div>
  );
}

function Component4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Component 4">
      <div className="flex flex-col font-['Inter_Tight:Regular',_sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-center text-nowrap text-white uppercase">
        <p className="leading-[72px] whitespace-pre">Log in now</p>
      </div>
    </div>
  );
}

function Component2() {
  return (
    <div className="bg-[#2e2a2f] h-[60.82px] min-w-[72px] relative rounded-[8px] shrink-0 w-full" data-name="Component 2">
      <div className="flex flex-row items-center justify-center min-w-inherit size-full">
        <div className="box-border content-stretch flex h-[60.82px] items-center justify-center min-w-inherit pl-[199.39px] pr-[199.41px] py-0 relative w-full">
          <Component4 />
        </div>
      </div>
    </div>
  );
}

function StrongLink() {
  return (
    <div className="content-stretch flex items-start justify-end relative shrink-0" data-name="Strong → Link">
      <div className="absolute bg-[#2e2a2f] bottom-[-6.28px] h-px left-0 right-0" data-name="Horizontal Divider" />
      <div className="flex flex-col font-['Inter_Tight:SemiBold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[11.2px] text-nowrap text-right">
        <p className="leading-[11.2px] whitespace-pre">Forgot your password?</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="box-border content-stretch flex flex-col items-end pb-[7.81px] pt-[8px] px-0 relative shrink-0 w-full" data-name="Container">
      <StrongLink />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Container5 />
      <Container6 />
      <Component2 />
      <Container7 />
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[33px] items-start relative shrink-0 w-full" data-name="Form">
      <Heading3 />
      <Container8 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#2e2a2f] text-[14px] w-full">
        <p className="leading-[28px]">Or sign in with</p>
      </div>
    </div>
  );
}

function Google() {
  return (
    <div className="absolute contents inset-[-0.07%_1.01%_0.43%_1.14%]" data-name="google">
      <div className="absolute inset-[-0.07%_1.01%_0.43%_1.14%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <path d={svgPaths.pd237100} fill="var(--fill-0, #2E2A2F)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Component1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[15px]" data-name="Component 1">
      <Google />
    </div>
  );
}

function Svg() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 w-[15px]" data-name="SVG">
      <Component1 />
    </div>
  );
}

function SvgMargin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pl-0 pr-[7px] py-0 relative shrink-0 w-[22px]" data-name="SVG:margin">
      <Svg />
    </div>
  );
}

function Component3() {
  return (
    <div className="basis-0 grow h-[48px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Component 3">
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[48px] items-center justify-center pb-[10.5px] pl-[44.98px] pr-[45px] pt-[9.5px] relative w-full">
          <SvgMargin />
          <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#2e2a2f] text-[14px] text-center text-nowrap">
            <p className="leading-[28px] whitespace-pre">Google</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Twitter() {
  return (
    <div className="absolute bottom-[3%] contents left-0 right-0 top-[3.5%]" data-name="twitter">
      <div className="absolute bottom-[3%] left-0 right-0 top-[3.5%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17">
          <path d={svgPaths.p21744d80} fill="var(--fill-0, #2E2A2F)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Component5() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[18px]" data-name="Component 1">
      <Twitter />
    </div>
  );
}

function Svg1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 w-[18px]" data-name="SVG">
      <Component5 />
    </div>
  );
}

function SvgMargin1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pl-0 pr-[7px] py-0 relative shrink-0 w-[25px] z-[2]" data-name="SVG:margin">
      <Svg1 />
    </div>
  );
}

function Component6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 z-[1]" data-name="Component 4">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#2e2a2f] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Twitter</p>
      </div>
    </div>
  );
}

function Component7() {
  return (
    <div className="basis-0 grow h-[48px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Component 3">
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[48px] isolate items-center justify-center px-[44.28px] py-[10px] relative w-full">
          <SvgMargin1 />
          <Component6 />
        </div>
      </div>
    </div>
  );
}

function Facebook() {
  return (
    <div className="absolute contents inset-[0.72%_27.1%]" data-name="facebook">
      <div className="absolute inset-[0.72%_27.1%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
          <path d={svgPaths.p2b4fae70} fill="var(--fill-0, #2E2A2F)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Component8() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[16px]" data-name="Component 1">
      <Facebook />
    </div>
  );
}

function Svg2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 w-[16px]" data-name="SVG">
      <Component8 />
    </div>
  );
}

function SvgMargin2() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pl-0 pr-[7px] py-0 relative shrink-0 w-[23px] z-[2]" data-name="SVG:margin">
      <Svg2 />
    </div>
  );
}

function Component9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 z-[1]" data-name="Component 4">
      <div className="flex flex-col font-['Inter_Tight:Light',_sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#2e2a2f] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Facebook</p>
      </div>
    </div>
  );
}

function Component10() {
  return (
    <div className="basis-0 grow h-[48px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Component 3">
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[48px] isolate items-center justify-center pl-[36.16px] pr-[36.17px] py-[10px] relative w-full">
          <SvgMargin2 />
          <Component9 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-start flex flex-wrap gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Component3 />
      <Component7 />
      <Component10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container10 />
    </div>
  );
}

function Frame1000007474() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Form />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] h-[629.46px] items-start relative shrink-0 w-full" data-name="Container">
      <Frame1000007474 />
    </div>
  );
}

function Container13() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[29.9px] items-start px-[40px] py-0 relative size-full">
          <Container1 />
          <Container12 />
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center max-w-[700px] min-h-px min-w-px relative shrink-0 w-[580px]" data-name="Container">
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="box-border content-stretch flex flex-col h-full items-center min-w-[700px] px-[60px] py-0 relative shrink-0 w-[700px]" data-name="Container">
      <Container14 />
    </div>
  );
}

function Container16() {
  return (
    <div className="basis-0 content-stretch flex grow items-start min-h-[900px] min-w-px relative shrink-0 w-full" data-name="Container">
      <Container />
      <Container15 />
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col h-[950px] items-start relative shrink-0 w-full" data-name="Section">
      <Container16 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 min-h-[900px] top-0 w-[1440px]" data-name="Container">
      <Section />
    </div>
  );
}

function Logo() {
  return (
    <div className="h-[50px] relative shrink-0 w-[100px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 50">
        <g id="Logo">
          <g id="Vector">
            <path d={svgPaths.p28d7740} fill="var(--fill-0, black)" />
            <path d={svgPaths.p201d5680} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2febba00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2be28440} fill="var(--fill-0, black)" />
            <path d={svgPaths.p1c12f8f0} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="box-border content-stretch flex flex-col h-[90px] items-start px-0 py-[20px] relative shrink-0" data-name="Link:margin">
      <Logo />
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex gap-[6px] h-[20px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Home</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Buttons2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[21px] whitespace-pre">Assessments</p>
      </div>
    </div>
  );
}

function Buttons3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Equips</p>
      </div>
    </div>
  );
}

function Buttons4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Mood Journal</p>
      </div>
    </div>
  );
}

function Buttons5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Consultation</p>
      </div>
    </div>
  );
}

function Buttons6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Library</p>
      </div>
    </div>
  );
}

function Menubar() {
  return (
    <div className="content-stretch flex gap-[32px] h-[21px] items-center relative shrink-0" data-name="Menubar">
      <Buttons />
      <Buttons1 />
      <Buttons2 />
      <Buttons3 />
      <Buttons4 />
      <Buttons5 />
      <Buttons6 />
    </div>
  );
}

function FullMenuMargin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pl-[48px] pr-0 py-0 relative shrink-0" data-name="full-menu:margin">
      <Menubar />
    </div>
  );
}

function Container18() {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <LinkMargin />
      <FullMenuMargin />
    </div>
  );
}

function Buttons7() {
  return (
    <div className="bg-[#ecebf0] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Let’s Talk</p>
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

function Buttons8() {
  return (
    <div className="bg-[#2e2a2f] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <Component25 />
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">Log in/ Sign up</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-start flex flex-wrap gap-[16px] items-start relative shrink-0" data-name="Container">
      <Buttons7 />
      <Buttons8 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex h-[88px] items-center justify-between relative shrink-0 w-[1352px]" data-name="Container">
      <Container18 />
      <Container19 />
    </div>
  );
}

function TopNavigation() {
  return (
    <div className="absolute bg-white box-border content-start flex flex-wrap gap-[24px] items-start justify-center left-1/2 px-[24px] py-0 rounded-[12px] top-[18px] translate-x-[-50%]" data-name="Top Navigation">
      <div aria-hidden="true" className="absolute border border-[#d6d6d6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container20 />
    </div>
  );
}

export default function Component02Dashboard() {
  return (
    <div className="bg-neutral-100 relative size-full" data-name="02_Dashboard">
      <Container17 />
      <TopNavigation />
    </div>
  );
}