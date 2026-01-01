function Paragraph() {
  return <div className="absolute h-[24px] left-[31.5px] top-[31.8px] w-[747.328px]" data-name="Paragraph" />;
}

function BoldText() {
  return <div className="absolute h-[18px] left-0 top-[3px] w-[136.195px]" data-name="Bold Text" />;
}

function Paragraph1() {
  return (
    <div className="absolute h-[48px] left-[31.5px] top-[67.8px] w-[747.328px]" data-name="Paragraph">
      <BoldText />
    </div>
  );
}

function TileLabel() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[745.2px] rounded-[4px] top-[12px] w-[54.133px]" data-name="TileLabel2">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 1</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[359px] left-[39px] rounded-[16px] top-0 w-[814px]" data-name="Container">
      <Paragraph />
      <Paragraph1 />
      <p className="absolute font-['Ubuntu:Bold',sans-serif] h-[96px] leading-[24px] left-[43px] not-italic text-[#151515] text-[0px] text-[18px] top-[203px] w-[145px]">
        <span>{`Is this for you? `}</span>
        <span className="font-['Ubuntu:Regular',sans-serif]">
          <br aria-hidden="true" />
          Sleep Tight may be helpful if:
        </span>
      </p>
      <div className="absolute font-['Ubuntu:Regular',sans-serif] leading-[0] left-[31.5px] not-italic text-[#151515] text-[0px] top-[34.8px] w-[719px]">
        <p className="leading-[24px] mb-0">
          <span className="font-['Ubuntu:Bold',sans-serif] not-italic text-[20px]">What is this program about?</span>
          <span className="text-[16px]">
            <br aria-hidden="true" />
            Sleep Tight is a guided, self-help program designed to help you understand and improve your sleep.
          </span>
        </p>
        <p className="leading-[24px] text-[16px]">
          <span>{`Over the next `}</span>
          <span className="font-['Ubuntu:Bold',sans-serif] not-italic">{`18 days `}</span>, you’ll identify factors that disrupt your sleep and gradually build healthier sleep patterns that support your well-being.
        </p>
      </div>
      <TileLabel />
    </div>
  );
}

function BoldText1() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-start left-[20px] top-0 w-[164.578px]" data-name="Bold Text">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[20px] text-nowrap">The program includes:</p>
    </div>
  );
}

function List() {
  return (
    <div className="absolute h-[267px] left-[22.5px] top-[46.8px] w-[346px]" data-name="List">
      <BoldText1 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[53px] leading-[24px] left-[60px] not-italic text-[#151515] text-[16px] top-[39px] w-[251px]">A structured 18-day journey designed to fit into daily life</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[60px] not-italic text-[#151515] text-[16px] top-[127px] w-[251px]">Sleep, mood, and habit trackers to notice patterns and disruptions</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[57px] leading-[24px] left-[60px] not-italic text-[#151515] text-[16px] top-[210px] w-[239px]">Science-backed techniques, including CBT</p>
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[20px] top-[45px] w-[25px]" />
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[20px] top-[134px] w-[25px]" />
      <div className="absolute bg-[#d9d9d9] h-[24px] left-[20px] top-[210px] w-[25px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[1140px] left-0 top-0 w-[394.664px]" data-name="Container">
      <List />
    </div>
  );
}

function TileLabel1() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[328.53px] rounded-[4px] top-[12px] w-[54.133px]" data-name="TileLabel2">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 2</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-[#fafafa] h-[359px] left-[839.5px] overflow-clip rounded-[16px] top-[0.2px] w-[394px]" data-name="Container">
      <Container1 />
      <TileLabel1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[24px] left-[32px] top-[50px] w-[395px]" data-name="Paragraph">
      <p className="absolute font-['Ubuntu:Bold',sans-serif] leading-[24px] left-0 not-italic text-[#151515] text-[20px] text-nowrap top-0">How it works</p>
    </div>
  );
}

function TileLabel2() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[309px] rounded-[4px] top-[14px] w-[54.133px]" data-name="TileLabel2">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 3</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[313px] left-0 rounded-[16px] top-[380px] w-[375px]" data-name="Container">
      <Paragraph2 />
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[32px] not-italic text-[#151515] text-[16px] text-nowrap top-[86px]">The program focuses on sleep in two stages.</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[32px] not-italic text-[#151515] text-[16px] top-[122px] w-[331px]">First, you’ll learn practical techniques to calm your mind and improve sleep hygiene.</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] leading-[24px] left-[32px] not-italic text-[#151515] text-[16px] top-[182px] w-[342px]">Then, you’ll build a personalized bedtime routine and practice these skills consistently.</p>
      <p className="absolute font-['Ubuntu:Italic',sans-serif] italic leading-[24px] left-[32px] text-[#151515] text-[16px] top-[242px] w-[263px]">The focus is on habit-building — without medication or pressure — to support better rest over time.</p>
      <TileLabel2 />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute bg-white content-stretch flex h-[22.5px] items-start left-[32px] top-[34.5px] w-[149.305px]" data-name="Heading 2">
      <p className="font-['Ubuntu:Bold',sans-serif] leading-[28px] not-italic relative shrink-0 text-[#151515] text-[20px] text-nowrap">What you’ll gain</p>
    </div>
  );
}

function TileLabel3() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.8)] border border-[#f5f5f5] border-solid h-[21px] left-[692px] rounded-[4px] top-[12px] w-[54.133px]" data-name="TileLabel2">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#4a4a4a] text-[10px] top-[2.5px] w-[37px]">TILE 4</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[296px] left-[391px] rounded-[16px] top-[397px] w-[842px]" data-name="Container">
      <Heading />
      <p className="absolute font-['Ubuntu:Bold',sans-serif] h-[65px] leading-[24px] left-[71px] not-italic text-[#151515] text-[16px] top-[77px] w-[132px]">Understand your sleep better</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[129px] leading-[24px] left-[40px] not-italic text-[#151515] text-[16px] top-[134px] w-[173px]">Notice patterns and identify factors affecting your sleep</p>
      <p className="absolute font-['Ubuntu:Bold',sans-serif] h-[70px] leading-[24px] left-[257px] not-italic text-[#151515] text-[16px] top-[77px] w-[145px]">Manage sleep-related thoughts</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[97px] leading-[24px] left-[224px] not-italic text-[#151515] text-[16px] top-[136px] w-[152px]">Learn ways to respond to worries that keep you awake</p>
      <p className="absolute font-['Ubuntu:Bold',sans-serif] h-[56px] leading-[24px] left-[446px] not-italic text-[#151515] text-[16px] top-[77px] w-[134px]">Build sleep-friendly habits</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[104px] leading-[24px] left-[406px] not-italic text-[#151515] text-[16px] top-[136px] w-[151px]">Create routines that support better rest</p>
      <p className="absolute font-['Ubuntu:Bold',sans-serif] h-[42px] leading-[24px] left-[624px] not-italic text-[#151515] text-[16px] top-[77px] w-[150px]">Develop reusable tools</p>
      <p className="absolute font-['Ubuntu:Regular',sans-serif] h-[132px] leading-[24px] left-[585px] not-italic text-[#151515] text-[16px] top-[134px] w-[172px]">Practice skills you can return to when sleep feels difficult</p>
      <TileLabel3 />
      <div className="absolute bg-[#d9d9d9] h-[29px] left-[36px] top-[77px] w-[30px]" />
      <div className="absolute bg-[#d9d9d9] h-[29px] left-[217px] top-[77px] w-[30px]" />
      <div className="absolute bg-[#d9d9d9] h-[29px] left-[406px] top-[77px] w-[30px]" />
      <div className="absolute bg-[#d9d9d9] h-[29px] left-[584px] top-[77px] w-[30px]" />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <Container />
      <Container2 />
      <Container3 />
      <Container4 />
    </div>
  );
}