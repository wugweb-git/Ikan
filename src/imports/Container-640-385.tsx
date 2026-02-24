import imgVisualNew768X819Png from "figma:asset/25d8d01a36eaa618a0c4fdd22ae73fb856925905.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111] text-[0px] text-[33.8px] tracking-[-0.95px] w-full whitespace-pre-wrap">
        <p className="leading-[46px] mb-0">No bios. No swiping. No planning.</p>
        <p className="leading-[46px] mb-0">We’ll match you with your group</p>
        <p className="leading-[46px] mb-0">and handle the details. All you</p>
        <p>
          <span className="leading-[46px] text-[#111]">{`need to do is `}</span>
          <span className="bg-clip-text bg-gradient-to-r from-[#f97709] leading-[46px] text-[transparent] to-[#ff83de]" style={{ WebkitTextFillColor: "transparent" }}>
            show up.
          </span>
        </p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[571px] relative shrink-0 w-[515px]" data-name="Container">
      <Container4 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#111] text-[17.4px] text-center tracking-[-0.16px] whitespace-nowrap">
        <p className="leading-[22px]">Sign up now</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center relative">
        <Container8 />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-gradient-to-t content-stretch flex from-[#fdd3f1] from-[0.34%] h-[56px] items-center justify-center px-[34px] py-[2px] relative rounded-[999px] shrink-0 to-[#f97709] via-[#febfdf] via-[34.28%]" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.8)] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <Container7 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Link />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[571px] relative shrink-0" data-name="Container">
      <Container6 />
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="content-stretch flex flex-col gap-[56px] items-start p-[10px] relative size-full">
        <Container3 />
        <Container5 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px py-[110px] relative" data-name="Container">
      <Container2 />
    </div>
  );
}

function VisualNew768X819Png() {
  return (
    <div className="h-[364px] max-w-[342px] relative shrink-0 w-[342px]" data-name="Visual-new-768x819.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgVisualNew768X819Png} />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[50px] relative shrink-0 w-[366px]" data-name="Container">
      <VisualNew768X819Png />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col h-[464px] items-start justify-center pt-[50px] relative shrink-0 w-[555px]" data-name="Container">
      <Container10 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex items-center px-[139px] relative size-full" data-name="Container">
      <Container1 />
      <Container9 />
    </div>
  );
}