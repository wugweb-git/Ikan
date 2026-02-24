import imgAvatarsPng from "figma:asset/eb82c2e0551347969076a69adce5c4765c496bfc.png";
import imgFrame3Png from "figma:asset/30ce65b28541c411418bec040034cbb2531a9649.png";
import imgFrame31Png from "figma:asset/6dd087f1f779b98ede54e60ca4dad77bf5a9aeb4.png";

function AvatarsPng() {
  return (
    <div className="h-[64.66px] max-w-[156px] relative shrink-0 w-[156px]" data-name="avatars.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-[-0.01%] w-full" src={imgAvatarsPng} />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <AvatarsPng />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container4 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111] text-[34.6px] text-center tracking-[-0.95px] whitespace-nowrap">
        <p className="leading-[46px]">80,000+</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] max-h-[26.999998092651367px] not-italic overflow-hidden relative shrink-0 text-[#666362] text-[17.4px] text-ellipsis tracking-[-0.18px] whitespace-nowrap">
        <p className="leading-[27px]">Dinners attended</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container8 />
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-center justify-center pb-[21.17px] pt-[21.18px] relative w-full">
        <Container3 />
        <Container5 />
        <Container7 />
      </div>
    </div>
  );
}

function Frame3Png() {
  return (
    <div className="max-w-[64px] relative shrink-0 size-[64px]" data-name="Frame-3.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame3Png} />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Frame3Png />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container11 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111] text-[31px] text-center tracking-[-0.95px] whitespace-nowrap">
        <p className="leading-[46px]">3M+</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading1 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] max-h-[26.999998092651367px] not-italic overflow-hidden relative shrink-0 text-[#666362] text-[17.3px] text-ellipsis tracking-[-0.18px] whitespace-nowrap">
        <p className="leading-[27px]">Timeleft members</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container15 />
    </div>
  );
}

function Container9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-center justify-center py-[21.5px] relative w-full">
        <Container10 />
        <Container12 />
        <Container14 />
      </div>
    </div>
  );
}

function Frame31Png() {
  return (
    <div className="max-w-[64px] relative shrink-0 size-[64px]" data-name="Frame-3-1.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame31Png} />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Frame31Png />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container18 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111] text-[33.1px] text-center tracking-[-0.95px] whitespace-nowrap">
        <p className="leading-[46px]">720</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading2 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container20 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] max-h-[26.999998092651367px] not-italic overflow-hidden relative shrink-0 text-[#666362] text-[17.3px] text-ellipsis tracking-[-0.18px] whitespace-nowrap">
        <p className="leading-[27px]">Bookings a day</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[248px] relative shrink-0" data-name="Container">
      <Container22 />
    </div>
  );
}

function Container16() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-center justify-center py-[21.5px] relative w-full">
        <Container17 />
        <Container19 />
        <Container21 />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-white min-h-[280px] relative rounded-[40px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-[#efe8de] border-solid inset-0 pointer-events-none rounded-[40px]" />
      <div className="content-stretch flex items-start min-h-[inherit] px-[209px] py-[34px] relative w-full">
        <Container2 />
        <Container9 />
        <Container16 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start py-[64px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[139px] relative size-full" data-name="Container">
      <Container1 />
    </div>
  );
}