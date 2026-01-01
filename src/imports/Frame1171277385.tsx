function Paragraph() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[747.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[38.52px] not-italic text-[#151515] text-[26px] text-nowrap top-0">What is this assessment?</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[48px] left-0 top-[36px] w-[747.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[741px]">This assessment helps you understand how stressed or overwhelmed you’ve been feeling lately, and whether life has felt manageable or out of control.</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[48px] left-0 top-[96px] w-[747.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[697px]">It focuses on how you’ve been responding to everyday pressures—at work, at home, or in your personal life—and how often stress has affected your thoughts and emotions.</p>
    </div>
  );
}

function BoldText() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-start left-0 top-[159px] w-[129.172px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">What it measures</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[307px] left-[33px] top-[33px] w-[747px]" data-name="Container">
      <Paragraph />
      <Paragraph1 />
      <Paragraph2 />
      <BoldText />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[46.5px] not-italic text-[#151515] text-[16px] top-[215.8px] w-[165px]">Perceived stress and overwhelm</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[284.5px] not-italic text-[#151515] text-[16px] top-[215.8px] w-[144px]">Sense of control vs pressure</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[501.5px] not-italic text-[#151515] text-[16px] top-[215.8px] w-[232px]">How unpredictable or demanding life has felt</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
    </div>
  );
}

function TileLabel() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[746.2px] rounded-[4px] top-[13px] w-[54.133px]" data-name="TileLabel">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 1</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="basis-0 bg-white grow h-[340px] min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container />
      <TileLabel />
    </div>
  );
}

function BoldText1() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-[156.211px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">Number of questions</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[727.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] text-nowrap top-0">10 questions</p>
    </div>
  );
}

function ListItem() {
  return (
    <div className="h-[24px] relative shrink-0 w-[144px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
      <Paragraph3 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
    </div>
  );
}

function BoldText2() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-[156.211px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">Time</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[727.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] text-nowrap top-0">5 min</p>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[144px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
      <Paragraph4 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
    </div>
  );
}

function BoldText3() {
  return (
    <div className="content-stretch flex h-[18px] items-start relative shrink-0 w-[156.211px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">Level</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[335px] items-start left-[0.66px] pb-px pt-[33px] px-[33px] top-[-1px] w-[394px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <BoldText1 />
      <ListItem />
      <BoldText2 />
      <ListItem1 />
      <BoldText3 />
      <ListItem1 />
    </div>
  );
}

function TileLabel1() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[328.53px] rounded-[4px] top-[12px] w-[54.133px]" data-name="TileLabel">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 2</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[522px] overflow-clip relative rounded-[16px] shrink-0 w-[394.664px]" data-name="Container">
      <Container2 />
      <TileLabel1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[24px] h-[355px] items-start left-px top-0 w-[1231px]">
      <Container1 />
      <Container3 />
    </div>
  );
}

function BoldText4() {
  return <div className="absolute h-[18px] left-0 top-[3px] w-[38.516px]" data-name="Bold Text" />;
}

function Paragraph5() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <BoldText4 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[11.5px] not-italic text-[#151515] text-[24px] text-nowrap top-0">Things to Remember Before You Start</p>
    </div>
  );
}

function BoldText5() {
  return <div className="absolute h-[18px] left-[28.87px] top-[27px] w-[84.578px]" data-name="Bold Text" />;
}

function Paragraph6() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[308.664px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[126px] leading-[24px] left-[-0.5px] not-italic text-[#151515] text-[16px] top-[-0.2px] w-[134px]">
        <span>{`Answer based on how you’ve felt over the `}</span>
        <span className="font-['Ubuntu:Bold',sans-serif]">past month</span>
      </p>
      <BoldText5 />
    </div>
  );
}

function ListItem2() {
  return (
    <div className="h-full relative shrink-0 w-[136px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1332.2px] w-0">&nbsp;</p>
      <Paragraph6 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1332.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[308.664px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-0.5px] not-italic text-[#151515] text-[16px] top-[-0.2px] w-[142px]">Choose the option that best reflects your experience</p>
    </div>
  );
}

function ListItem3() {
  return (
    <div className="h-full relative shrink-0 w-[135px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1392.2px] w-0">&nbsp;</p>
      <Paragraph7 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1392.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[173px] left-[-0.5px] top-[-0.2px] w-[125px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[139px] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[125px]">There are no right or wrong answers</p>
    </div>
  );
}

function ListItem4() {
  return (
    <div className="h-full relative shrink-0 w-[135px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1452.2px] w-0">&nbsp;</p>
      <Paragraph8 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1452.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[308.664px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[76px] leading-[24px] left-[-0.5px] not-italic text-[#151515] text-[16px] top-[-0.2px] w-[134px]">Progress is saved automatically</p>
    </div>
  );
}

function ListItem5() {
  return (
    <div className="h-full relative shrink-0 w-[135px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1488.2px] w-0">&nbsp;</p>
      <Paragraph9 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1488.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="absolute h-[48px] left-[-0.5px] top-[-0.2px] w-[155px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[179px]">Results are shown immediately after completion</p>
    </div>
  );
}

function ListItem6() {
  return (
    <div className="h-full relative shrink-0 w-[135px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1524.2px] w-0">&nbsp;</p>
      <Paragraph10 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex gap-[12px] h-[240px] items-start pl-[20px] pr-0 py-0 relative shrink-0 w-[757px]" data-name="List">
      <ListItem2 />
      <ListItem3 />
      <ListItem4 />
      <ListItem5 />
      <ListItem6 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[276px] items-start left-[33px] top-[33px] w-[328.664px]" data-name="Container">
      <Paragraph5 />
      <List />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white h-[240px] relative rounded-[16px] shrink-0 w-[804px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container4 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-0.5px] not-italic text-[#151515] text-[24px] text-nowrap top-0">{`Important `}</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[308.664px]" data-name="Paragraph">
      <ul className="absolute block font-['Ubuntu:Regular',sans-serif] leading-[0] left-0 not-italic text-[#151515] text-[16px] top-0 w-[297px]">
        <li className="mb-0 ms-[24px]">
          <span className="leading-[24px]">This is a self-help and awareness tool, not a medical diagnosis</span>
        </li>
        <li className="ms-[24px]">
          <span className="leading-[24px]">Not intended for emergency or crisis situations</span>
        </li>
      </ul>
    </div>
  );
}

function ListItem7() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-981.83px] not-italic text-[#151515] text-[16px] top-[-1368.2px] w-0">&nbsp;</p>
      <Paragraph12 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-981.83px] not-italic text-[#151515] text-[16px] top-[-1368.2px] w-0">&nbsp;</p>
    </div>
  );
}

function List1() {
  return (
    <div className="h-[141px] relative shrink-0 w-full" data-name="List">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pl-[20px] pr-0 py-0 relative size-full">
          <ListItem7 />
        </div>
      </div>
    </div>
  );
}

function Paragraph13() {
  return <div className="h-[24px] shrink-0 w-full" data-name="Paragraph" />;
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[158px] items-start left-[33px] top-[33px] w-[329px]" data-name="Container">
      <Paragraph11 />
      <List1 />
      <Paragraph13 />
    </div>
  );
}

function TileLabel2() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[327.53px] rounded-[4px] top-[13px] w-[54.133px]" data-name="TileLabel">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 4</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-white h-[240px] relative rounded-[16px] shrink-0 w-[391px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container6 />
      <TileLabel2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex gap-[24px] h-[246px] items-start left-0 top-[355px] w-[1232px]">
      <Container5 />
      <Container7 />
    </div>
  );
}

export default function Frame2() {
  return (
    <div className="relative size-full">
      <Frame />
      <Frame1 />
    </div>
  );
}