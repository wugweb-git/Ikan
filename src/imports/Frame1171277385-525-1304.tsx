function Paragraph() {
  return (
    <div className="absolute h-[48px] left-0 top-[36px] w-[747.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[741px]">This assessment helps you understand how stressed or overwhelmed you’ve been feeling lately, and whether life has felt manageable or out of control.</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[48px] left-0 top-[96px] w-[747.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[697px]">It focuses on how you’ve been responding to everyday pressures—at work, at home, or in your personal life—and how often stress has affected your thoughts and emotions.</p>
    </div>
  );
}

function BoldText() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-start left-0 top-[178px] w-[129.172px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">What it measures</p>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[248.5px] top-[211px]">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[284px] not-italic text-[#151515] text-[16px] top-[211px] w-[144px]">Sense of control vs pressure</p>
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[248.5px] top-[211.2px] w-[25px]" />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[465px] top-[211px]">
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[465px] top-[214.2px] w-[25px]" />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[501.5px] not-italic text-[#151515] text-[16px] top-[211px] w-[232px]">How unpredictable or demanding life has felt</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[9px] top-[211px]">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[46.5px] not-italic text-[#151515] text-[16px] top-[211px] w-[165px]">Perceived stress and overwhelm</p>
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[9px] top-[211.2px] w-[25px]" />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[9px] top-[211px]">
      <Group4 />
      <Group5 />
      <Group3 />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-0 top-[178px]">
      <BoldText />
      <Group6 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[307px] left-[32px] top-[32px] w-[747px]" data-name="Container">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[38.52px] not-italic text-[#151515] text-[26px] text-nowrap top-0">What is this assessment?</p>
      <Paragraph />
      <Paragraph1 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-124.5px] not-italic text-[#151515] text-[16px] top-[-750.2px] w-0">&nbsp;</p>
      <Group7 />
    </div>
  );
}

function TileLabel() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[745.2px] rounded-[4px] top-[12px] w-[54.133px]" data-name="TileLabel">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 1</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[340px] left-px rounded-[16px] top-0 w-[812px]" data-name="Container">
      <Container />
      <TileLabel />
    </div>
  );
}

function BoldText1() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-start left-[59px] top-[35px] w-[156.211px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">Number of questions</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[727.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] text-nowrap top-0">10 questions</p>
    </div>
  );
}

function ListItem() {
  return (
    <div className="absolute h-[24px] left-[59px] top-[53px] w-[144px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
      <Paragraph2 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[58px] top-[34px]">
      <BoldText1 />
      <ListItem />
    </div>
  );
}

function BoldText2() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-start left-[59px] top-[103px] w-[156.211px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">Time</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[727.328px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] text-nowrap top-0">5 min</p>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="absolute h-[24px] left-[59px] top-[121px] w-[144px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
      <Paragraph3 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1086.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[58px] top-[102px]">
      <BoldText2 />
      <ListItem1 />
    </div>
  );
}

function BoldText3() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-start left-[61px] top-[189px] w-[156.211px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-nowrap">Level</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[60px] top-[188px]">
      <BoldText3 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[61px] not-italic text-[#151515] text-[16px] text-nowrap top-[207px]">5 min</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[335px] left-[0.66px] top-[-1px] w-[394px]" data-name="Container">
      <Group2 />
      <Group1 />
      <Group />
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[17px] top-[40px] w-[25px]" />
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[17px] top-[108px] w-[25px]" />
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[17px] top-[194px] w-[25px]" />
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
    <div className="absolute h-[271px] left-[837px] overflow-clip rounded-[16px] top-0 w-[395px]" data-name="Container">
      <Container2 />
      <TileLabel1 />
    </div>
  );
}

function BoldText4() {
  return <div className="absolute h-[18px] left-0 top-[3px] w-[38.516px]" data-name="Bold Text" />;
}

function Paragraph4() {
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

function Paragraph5() {
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
    <div className="h-[117px] relative shrink-0 w-[178px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1332.2px] w-0">&nbsp;</p>
      <Paragraph5 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1332.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[308.664px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-0.5px] not-italic text-[#151515] text-[16px] top-[-0.2px] w-[142px]">Choose the option that best reflects your experience</p>
    </div>
  );
}

function ListItem3() {
  return (
    <div className="h-[117px] relative shrink-0 w-[176px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1392.2px] w-0">&nbsp;</p>
      <Paragraph6 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1392.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[173px] left-[-0.5px] top-[-0.2px] w-[125px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[139px] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[125px]">There are no right or wrong answers</p>
    </div>
  );
}

function ListItem4() {
  return (
    <div className="h-[117px] relative shrink-0 w-[177px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1452.2px] w-0">&nbsp;</p>
      <Paragraph7 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1452.2px] w-0">&nbsp;</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[48px] left-[-0.5px] top-[-0.2px] w-[155px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[16px] top-0 w-[179px]">Results are shown immediately after completion</p>
    </div>
  );
}

function ListItem5() {
  return (
    <div className="h-[117px] relative shrink-0 w-[177px]" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-144.5px] not-italic text-[#151515] text-[16px] top-[-1524.2px] w-0">&nbsp;</p>
      <Paragraph8 />
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
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[276px] items-start left-[32px] top-[32px] w-[328.664px]" data-name="Container">
      <Paragraph4 />
      <List />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[240px] left-0 rounded-[16px] top-[355px] w-[804px]" data-name="Container">
      <Container4 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[38px] not-italic text-[#151515] text-[24px] text-nowrap top-[5px]">{`Important `}</p>
      <div className="absolute bg-[#d9d9d9] h-[24px] left-0 top-[5px] w-[25px]" />
    </div>
  );
}

function Paragraph10() {
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

function ListItem6() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-981.83px] not-italic text-[#151515] text-[16px] top-[-1368.2px] w-0">&nbsp;</p>
      <Paragraph10 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[-981.83px] not-italic text-[#151515] text-[16px] top-[-1368.2px] w-0">&nbsp;</p>
    </div>
  );
}

function List1() {
  return (
    <div className="h-[141px] relative shrink-0 w-full" data-name="List">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pl-[20px] pr-0 py-0 relative size-full">
          <ListItem6 />
        </div>
      </div>
    </div>
  );
}

function Paragraph11() {
  return <div className="h-[24px] shrink-0 w-full" data-name="Paragraph" />;
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[158px] items-start left-[32px] top-[32px] w-[329px]" data-name="Container">
      <Paragraph9 />
      <List1 />
      <Paragraph11 />
    </div>
  );
}

function TileLabel2() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[326.53px] rounded-[4px] top-[12px] w-[54.133px]" data-name="TileLabel">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 4</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-[#ededed] border border-[rgba(0,0,0,0.1)] border-solid h-[240px] left-[841px] rounded-[16px] top-[289px] w-[391px]" data-name="Container">
      <Container6 />
      <TileLabel2 />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <Container1 />
      <Container3 />
      <Container5 />
      <Container7 />
    </div>
  );
}