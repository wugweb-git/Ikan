import svgPaths from "./svg-tfxlcr50sc";

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
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[168px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">{`Profile `}</p>
      <Container />
    </div>
  );
}

function Heading() {
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
          <path d={svgPaths.p1366f300} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.pab3de00} fill="var(--fill-0, white)" id="Vector_2" />
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
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[21px] not-italic text-[14px] text-center text-nowrap text-white top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Profile</p>
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
    <div className="bg-[#2a2a2a] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
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
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[40px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-0 tracking-[-0.1504px] translate-x-[-50%]">Organization</p>
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
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[38px] w-[198px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[204px] relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading />
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
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-0 w-[198px]" data-name="Button">
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
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[58px] w-[198px]" data-name="Button">
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

function Heading1() {
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
      <Heading1 />
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[146px] relative shrink-0 w-[198px]" data-name="Container">
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
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[177px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">SETTINGS</p>
      <Container16 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[18px] left-[17px] top-0 w-[91.867px]" data-name="Heading 3">
      <Frame1 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_583_1758)" id="Icon">
          <path d={svgPaths.p1e0a7a40} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1ba86b40} id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1ed557a0} id="Vector_3" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M1.5 1.5L16.5 16.5" id="Vector_4" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_583_1758">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[28px] relative shrink-0 w-[48.492px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Privacy</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container17 />
          <Paragraph5 />
        </div>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[50px] items-start p-px relative rounded-[12px] shrink-0 w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container18 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[0.41%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 17.8515">
        <g id="Group">
          <path d={svgPaths.p3de0e900} fill="var(--fill-0, #151515)" id="Vector" />
          <path d={svgPaths.p29a2ee70} fill="var(--fill-0, #151515)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconSecurity() {
  return (
    <div className="h-[18px] relative shrink-0 w-[15px]" data-name="IconSecurity">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Group4 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconSecurity />
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[28px] relative shrink-0 w-[54.773px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[27.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Security</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container19 />
          <Paragraph6 />
        </div>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[50px] items-start p-px relative rounded-[12px] shrink-0 w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[30px] w-[198px]" data-name="Container">
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[145px] relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading2 />
        <Container21 />
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

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon5 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[171px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">Support</p>
      <Container23 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute h-[18px] left-[16px] top-0 w-[61.523px]" data-name="Heading 3">
      <Frame />
    </div>
  );
}

function IconFaQs() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="IconFAQs">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <g id="Group">
            <path d={svgPaths.p132bc00} fill="var(--fill-0, #151515)" id="Vector" />
            <path d={svgPaths.p36b21200} fill="var(--fill-0, #151515)" id="Vector_2" />
            <path d={svgPaths.p26bfc271} fill="var(--fill-0, #151515)" id="Vector_3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconFaQs />
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[28px] relative shrink-0 w-[34.656px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[20px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">About</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container24 />
          <Paragraph7 />
        </div>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function IconFaQs1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="IconFAQs">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <g id="Group">
            <path d={svgPaths.p132bc00} fill="var(--fill-0, #151515)" id="Vector" />
            <path d={svgPaths.p36b21200} fill="var(--fill-0, #151515)" id="Vector_2" />
            <path d={svgPaths.p26bfc271} fill="var(--fill-0, #151515)" id="Vector_3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconFaQs1 />
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[28px] relative shrink-0 w-[34.656px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[17.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">FAQs</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container26 />
          <Paragraph8 />
        </div>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container27 />
        </div>
      </div>
    </div>
  );
}

function IconHelp() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="IconHelp">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_583_1674)" id="IconHelp">
          <path clipRule="evenodd" d={svgPaths.p19332900} fill="var(--fill-0, #151515)" fillRule="evenodd" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_583_1674">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconHelp />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[28px] relative shrink-0 w-[62.555px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[31px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">{`Let's Talk`}</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container28 />
          <Paragraph9 />
        </div>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[30px] w-[198px]" data-name="Container">
      <Button7 />
      <Button8 />
      <Button9 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[196px] relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading3 />
        <Container30 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[18px] relative shrink-0 w-[41.242px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-0 not-italic text-[#717182] text-[12px] text-nowrap top-px tracking-[0.6px] uppercase">Legal</p>
      </div>
    </div>
  );
}

function Icon6() {
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

function Container32() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[34px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-0 relative size-full">
          <Heading4 />
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p3a382d00} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p678c080} id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M7.5 6.75H6" id="Vector_3" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 9.75H6" id="Vector_4" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 12.75H6" id="Vector_5" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[28px] relative shrink-0 w-[91.742px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[46px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Privacy Policy</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container34 />
          <Paragraph10 />
        </div>
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-0 w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container35 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p3a382d00} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p678c080} id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M7.5 6.75H6" id="Vector_3" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 9.75H6" id="Vector_4" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 12.75H6" id="Vector_5" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[28px] relative shrink-0 w-[129.156px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[65px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">{`Terms & Conditions`}</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container36 />
          <Paragraph11 />
        </div>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[58px] w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container37 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p3a382d00} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p678c080} id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M7.5 6.75H6" id="Vector_3" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 9.75H6" id="Vector_4" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 12.75H6" id="Vector_5" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[28px] relative shrink-0 w-[87.375px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[44.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Return Policy</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container38 />
          <Paragraph12 />
        </div>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[116px] w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container39 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p3a382d00} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p678c080} id="Vector_2" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M7.5 6.75H6" id="Vector_3" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 9.75H6" id="Vector_4" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 12.75H6" id="Vector_5" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon10 />
      </div>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[28px] relative shrink-0 w-[125.086px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[63.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Cancellation Policy</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container40 />
          <Paragraph13 />
        </div>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[174px] w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container41 />
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[224px] relative shrink-0 w-full" data-name="Container">
      <Button10 />
      <Button11 />
      <Button12 />
      <Button13 />
    </div>
  );
}

function Container43() {
  return (
    <div className="relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Container33 />
        <Container42 />
      </div>
    </div>
  );
}

function Group5() {
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
        <Group5 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconLogOut />
      </div>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[28px] relative shrink-0 w-[49.719px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[25px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Log out</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[48px] items-center left-px pl-[20px] pr-0 py-0 top-px w-[196px]" data-name="Container">
      <Container44 />
      <Paragraph14 />
    </div>
  );
}

function Button14() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container45 />
    </div>
  );
}

function Container46() {
  return (
    <div className="relative shrink-0 w-[198px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[17px] px-0 relative w-full">
        <Button14 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative w-full">
        <Container8 />
        <Container15 />
        <Container22 />
        <Container31 />
        <Container43 />
        <Container46 />
      </div>
    </div>
  );
}

export default function SideNavAccount() {
  return (
    <div className="bg-white relative rounded-[16px] size-full" data-name="SideNavAccount">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pl-[21px] pr-px py-[21px] relative size-full">
          <Container47 />
        </div>
      </div>
    </div>
  );
}