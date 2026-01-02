import svgPaths from "./svg-w4enjbypu8";

function Icon() {
  return (
    <div className="h-[14px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16667 4.66667">
            <path d={svgPaths.p1d8d0700} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[285px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">Account</p>
      <Container />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[18px] left-[20px] top-[8px] w-[64.484px]" data-name="Heading 3">
      <Frame2 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[2.92%_3.64%_2.91%_3.64%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9077 16.0073">
        <g id="Group">
          <path d={svgPaths.p1366f300} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.pab3de00} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconProfile() {
  return (
    <div className="h-[17px] relative shrink-0 w-[15px]" data-name="IconProfile">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Group />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[17px] relative shrink-0 w-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconProfile />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[28px] relative shrink-0 w-[42.625px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[21px] not-italic text-[14px] text-black text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Profile</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container1 />
          <Paragraph />
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[54px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p5eca500} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M1.5 7.5H16.5" id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[64.813px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[32px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Payments</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container3 />
          <Paragraph1 />
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[0.99%_0_0.98%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17.6449">
        <g id="Group">
          <path d={svgPaths.p6656b80} fill="var(--fill-0, #151515)" id="Vector" />
          <path d={svgPaths.p10da980} fill="var(--fill-0, #151515)" id="Vector_2" />
          <path d={svgPaths.p29f7df80} fill="var(--fill-0, #151515)" id="Vector_3" />
          <path d={svgPaths.p2d44f700} fill="var(--fill-0, #151515)" id="Vector_4" />
          <path d={svgPaths.pf7d2800} fill="var(--fill-0, #151515)" id="Vector_5" />
          <path d={svgPaths.p39b09d00} fill="var(--fill-0, #151515)" id="Vector_6" />
          <path d={svgPaths.p22900400} fill="var(--fill-0, #151515)" id="Vector_7" />
          <path d={svgPaths.p3f3f7080} fill="var(--fill-0, #151515)" id="Vector_8" />
          <path d={svgPaths.p39f74900} fill="var(--fill-0, #151515)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

function IconCorporate() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="IconCorporate">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Group1 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconCorporate />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[28px] relative shrink-0 w-[66.828px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[33.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Corporate</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container5 />
          <Paragraph2 />
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[38px] w-[349px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[204px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading1 />
        <Container7 />
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[0.99%_0_0.98%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17.6449">
        <g id="Group">
          <path d={svgPaths.p6656b80} fill="var(--fill-0, #151515)" id="Vector" />
          <path d={svgPaths.p10da980} fill="var(--fill-0, #151515)" id="Vector_2" />
          <path d={svgPaths.p29f7df80} fill="var(--fill-0, #151515)" id="Vector_3" />
          <path d={svgPaths.p2d44f700} fill="var(--fill-0, #151515)" id="Vector_4" />
          <path d={svgPaths.pf7d2800} fill="var(--fill-0, #151515)" id="Vector_5" />
          <path d={svgPaths.p39b09d00} fill="var(--fill-0, #151515)" id="Vector_6" />
          <path d={svgPaths.p22900400} fill="var(--fill-0, #151515)" id="Vector_7" />
          <path d={svgPaths.p3f3f7080} fill="var(--fill-0, #151515)" id="Vector_8" />
          <path d={svgPaths.p39f74900} fill="var(--fill-0, #151515)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

function IconPreferences() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="IconPreferences">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Group2 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconPreferences />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[28px] relative shrink-0 w-[79.602px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[40px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Preferences</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container9 />
          <Paragraph3 />
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-0 w-[350px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container10 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[1.7%_0_1.69%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 14.4901">
        <g id="Group">
          <path d={svgPaths.p1a326d80} fill="var(--fill-0, #151515)" id="Vector" />
          <path d={svgPaths.p3d903400} fill="var(--fill-0, #151515)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconNotifications() {
  return (
    <div className="h-[15px] relative shrink-0 w-[13px]" data-name="IconNotifications">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Group3 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[15px] relative shrink-0 w-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconNotifications />
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[28px] relative shrink-0 w-[84px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[42px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Notifications</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container11 />
          <Paragraph4 />
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[58px] w-[350px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[108px] left-0 top-[38px] w-[198px]" data-name="Container">
      <Button3 />
      <Button4 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[18px] relative shrink-0 w-[91.867px]" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-0 not-italic text-[#717182] text-[12px] text-nowrap top-px tracking-[0.6px] uppercase">Preferences</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[14px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16667 4.66667">
            <path d={svgPaths.p1d8d0700} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[20px] top-[8px] w-[157px]">
      <Heading2 />
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[146px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container13 />
        <Frame3 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[14px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16667 4.66667">
            <path d={svgPaths.p1d8d0700} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-[14px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[325px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">SETTINGS</p>
      <div className="flex items-center justify-center relative shrink-0 size-[14px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute h-[18px] left-[17px] top-0 w-[91.867px]" data-name="Heading 3">
      <Frame1 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[50px] relative shrink-0 w-[348px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading3 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[14px] overflow-clip relative w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16667 4.66667">
            <path d={svgPaths.p1d8d0700} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <div className="flex h-[14px] items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg] w-full">
          <Icon4 />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[327px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">Support</p>
      <Container18 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute h-[18px] left-[16px] top-0 w-[61.523px]" data-name="Heading 3">
      <Frame />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[53px] relative shrink-0 w-[341px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading4 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[18px] relative shrink-0 w-[41.242px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-0 not-italic text-[#717182] text-[12px] text-nowrap top-px tracking-[0.6px] uppercase">Legal</p>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[14px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.16667 4.66667">
            <path d={svgPaths.p1d8d0700} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative size-[14px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[34px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-0 relative size-full">
          <Heading5 />
          <div className="flex items-center justify-center relative shrink-0 size-[14px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
            <div className="flex-none rotate-[270deg]">
              <Container20 />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-[341px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Container21 />
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[0_33.22%_0.33%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.0199 17.9402">
        <g id="Group">
          <path d={svgPaths.p3317b780} fill="var(--fill-0, #151515)" id="Vector" />
          <path d={svgPaths.ped6b480} fill="var(--fill-0, #151515)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconLogOut() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="IconLogOut">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Group4 />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconLogOut />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[28px] relative shrink-0 w-[49.719px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[25px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Log out</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[48px] items-center left-px pl-[20px] pr-0 py-0 top-px w-[196px]" data-name="Container">
      <Container23 />
      <Paragraph5 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 w-[355px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[17px] px-0 relative w-full">
        <Button5 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[16px] top-[89px] w-[367px]" data-name="Container">
      <Container8 />
      <Container15 />
      <Container17 />
      <Container19 />
      <Container22 />
      <Container25 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute inset-[4.17%_8.33%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 22">
        <g id="Group">
          <path clipRule="evenodd" d={svgPaths.p20c90f30} fill="var(--fill-0, #2E2A2F)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p2b587fb0} fill="var(--fill-0, #2E2A2F)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Svg() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="SVG">
      <Group5 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[24px] z-[2]" data-name="Container">
      <Svg />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col isolate items-center opacity-40 relative shrink-0" data-name="Container">
      <Container27 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[11.6px] text-center text-nowrap z-[1]">
        <p className="leading-[18px]">Home</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center min-h-[48px] px-[17.58px] py-[6px] relative shrink-0" data-name="Button">
      <Container28 />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute inset-[0.91%_3.35%_3.35%_0.91%]" data-name="Group">
      <div className="absolute inset-[-0.95%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.9454 20.9454">
          <g id="Group">
            <path d={svgPaths.p1040e190} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.390364" />
            <g id="Group_2">
              <path d={svgPaths.p1e411f40} fill="var(--fill-0, black)" id="Vector_2" />
              <path d={svgPaths.p93a4300} id="Vector_3" stroke="var(--stroke-0, black)" strokeWidth="0.390364" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="absolute inset-[-0.2px_-0.21px_-0.2px_-0.19px]" data-name="SVG">
      <Group6 />
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute inset-[5.53%_7.29%_6.67%_4.92%]" data-name="Container">
      <Svg1 />
    </div>
  );
}

function Container30() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px] z-[2]" data-name="Container">
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col isolate items-center opacity-40 relative shrink-0" data-name="Container">
      <Container30 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[11.1px] text-center text-nowrap z-[1]">
        <p className="leading-[18px]">Explore</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#d4183d] content-stretch flex h-[16px] items-center justify-center min-w-[16px] pl-[5.31px] pr-[5.29px] py-[2px] right-[-4px] rounded-[2.23696e+07px] top-[-4px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-nowrap text-white">
        <p className="leading-[15px]">1</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center min-h-[48px] pl-[14.16px] pr-[14.15px] py-[6px] relative shrink-0" data-name="Button">
      <Container31 />
      <Background />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute inset-[1.2%_3.57%_3.56%_1.19%]" data-name="Group">
      <div className="absolute inset-[-1.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0322 20.0322">
          <g id="Group">
            <path d={svgPaths.p93b5e80} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.488571" />
            <path d={svgPaths.p2e983080} fill="var(--fill-0, black)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.488571" />
            <path d={svgPaths.p2a3b0bb0} fill="var(--fill-0, black)" id="Vector_3" stroke="var(--stroke-0, black)" strokeWidth="0.488571" />
            <path d={svgPaths.pfbf580} fill="var(--fill-0, black)" id="Vector_4" stroke="var(--stroke-0, black)" strokeWidth="0.488571" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="absolute inset-[-0.25px]" data-name="SVG">
      <Group7 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute inset-[8.28%_8.29%_8.3%_8.29%]" data-name="Container">
      <Svg2 />
    </div>
  );
}

function Container33() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px] z-[2]" data-name="Container">
      <Container32 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col isolate items-center opacity-40 relative shrink-0" data-name="Container">
      <Container33 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[11.8px] text-center text-nowrap z-[1]">
        <p className="leading-[18px]">Mood</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#d4183d] content-stretch flex h-[16px] items-center justify-center min-w-[16px] px-[5.3px] py-[2px] right-[-5.61px] rounded-[2.23696e+07px] top-[-4px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-nowrap text-white">
        <p className="leading-[15px]">2</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center min-h-[48px] px-[17.71px] py-[6px] relative shrink-0" data-name="Button">
      <Container34 />
      <Background1 />
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute inset-[9.38%_3.13%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.4993 19.4995">
        <g id="Group">
          <path clipRule="evenodd" d={svgPaths.pe179fc0} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Svg3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="SVG">
      <Group8 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[24px] z-[2]" data-name="Container">
      <Svg3 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col isolate items-center opacity-40 relative shrink-0" data-name="Container">
      <Container35 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[10.9px] text-center text-nowrap z-[1]">
        <p className="leading-[18px]">Library</p>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center min-h-[48px] pl-[15.73px] pr-[15.72px] py-[6px] relative shrink-0" data-name="Button">
      <Container36 />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute inset-[0.45%_1.16%_1.82%_0.53%]" data-name="Group">
      <div className="absolute inset-[-0.47%_-0.53%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.7599 21.3998">
          <g id="Group">
            <path d={svgPaths.p3d176300} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.197973" />
            <path d={svgPaths.p1e3f7880} fill="var(--fill-0, black)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.197973" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="absolute inset-[-0.1px_-0.1px_-0.09px_-0.09px]" data-name="SVG">
      <Group9 />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute inset-[5.21%_11.08%_5.21%_11.04%]" data-name="Container">
      <Svg4 />
    </div>
  );
}

function Container38() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px] z-[2]" data-name="Container">
      <Container37 />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col isolate items-center opacity-40 relative shrink-0" data-name="Container">
      <Container38 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[11.1px] text-center text-nowrap z-[1]">
        <p className="leading-[18px]">Account</p>
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center min-h-[48px] px-[11.91px] py-[6px] relative shrink-0" data-name="Button">
      <Container39 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0" data-name="Container">
      <Button6 />
      <Button7 />
      <Button8 />
      <Button9 />
      <Button10 />
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative">
        <Container40 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start justify-center left-[16px] p-[10.667px] rounded-[12px] top-[754px] w-[358px]" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#d6d6d6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]" />
      <Container41 />
    </div>
  );
}

function Home() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[16px] pb-[7px] pt-[12px] px-[10px] top-[839.33px] w-[358px]" data-name="Home">
      <div className="bg-[rgba(0,0,0,0.15)] h-[4px] rounded-[100px] shrink-0 w-[134px]" data-name="Home Indicator" />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[15.999px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9992 15.9992">
        <g id="Icon">
          <path d={svgPaths.p10339e00} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33327" />
          <path d="M12.6661 7.99962H3.33317" id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33327" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="relative rounded-[12px] shrink-0 size-[47.998px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="basis-0 grow h-[27.001px] min-h-px min-w-px relative shrink-0" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[27px] left-0 not-italic text-[#151515] text-[18px] text-nowrap top-[0.93px] tracking-[-0.4395px]">Title Here</p>
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="absolute content-stretch flex gap-[11.999px] h-[73px] items-center left-0 pb-[0.586px] pt-0 px-[15.999px] top-0 w-[390px]" data-name="MobileHeader">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.586px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <Button11 />
      <Heading />
    </div>
  );
}

export default function IPhone() {
  return (
    <div className="bg-[#f5f5f5] relative size-full" data-name="iPhone 13 & 14 - 2">
      <Container26 />
      <BackgroundBorderShadow />
      <Home />
      <MobileHeader />
    </div>
  );
}