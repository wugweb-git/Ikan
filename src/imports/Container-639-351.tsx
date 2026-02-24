import imgEye from "figma:asset/19139d5bd69b26bf98edeffa337d4072de7c034a.png";
import imgImgParty1536X572Png from "figma:asset/a3a56078c542334f762a64cf6b7f64204fe1943a.png";
import imgFrame42560Png from "figma:asset/9ca63d9441aac1a95b340b2df6a4e5997722d9f7.png";
import imgIllustration11Png from "figma:asset/791bde9f71cc5f4622c5a5698736f4f04849f4c0.png";
import imgIllustration12Png from "figma:asset/f54eda6c05d58066b7adac21e5e9347ffc0952d0.png";
import imgIllustration13Png from "figma:asset/9e292007fae782246824270ef47513e416ca8ab3.png";

function Eye() {
  return (
    <div className="h-[60px] max-w-[90px] relative shrink-0 w-[90px]" data-name="eye">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgEye} />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex h-[53px] items-center pt-[7px] relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111] text-[35.8px] text-center tracking-[-0.95px] whitespace-nowrap">
        <p className="leading-[46px]">{`Reasons to keep showing up `}</p>
      </div>
      <Eye />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] relative shrink-0" data-name="Container">
      <Heading />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[1162px] relative shrink-0" data-name="Container">
      <Container3 />
    </div>
  );
}

function ImgParty1536X572Png() {
  return (
    <div className="h-[432.72px] max-w-[1162px] relative shrink-0 w-[1162px]" data-name="img-party-1536x572.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgImgParty1536X572Png} />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <ImgParty1536X572Png />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container5 />
    </div>
  );
}

function Frame42560Png() {
  return (
    <div className="h-[24.5px] max-w-[136px] relative shrink-0 w-[136px]" data-name="Frame-42560.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame42560Png} />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[0.6px] relative shrink-0 w-full" data-name="Container">
      <Frame42560Png />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container9 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[27px] not-italic relative shrink-0 text-[#111] text-[17.6px] tracking-[-0.18px] w-full whitespace-pre-wrap">
        <p className="mb-0">I was at a birthday dinner and</p>
        <p className="mb-0">asked a girl how she met my friend.</p>
        <p className="mb-0">She said at a Timeleft dinner! I had</p>
        <p className="mb-0">never heard of the app, but I</p>
        <p className="mb-0">decided to give it a go. I have been</p>
        <p className="mb-0">to two dinners so far and plan to go</p>
        <p>to more…</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container11 />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16.01px] items-start relative w-full">
        <Container8 />
        <Container10 />
      </div>
    </div>
  );
}

function Illustration11Png() {
  return (
    <div className="h-[40.33px] max-w-[40px] relative shrink-0 w-[40px]" data-name="Illustration11.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-0 w-full" src={imgIllustration11Png} />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Illustration11Png />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[40px]" data-name="Container">
      <Container15 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#666362] text-[17.2px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Anna B.</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container18 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[240px]" data-name="Container">
      <Container17 />
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative w-full">
        <Container14 />
        <Container16 />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-[360px] min-w-px relative rounded-[32px] self-stretch" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-[#efe8de] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="content-stretch flex flex-col items-start justify-between min-h-[inherit] pb-[33.99px] pt-[34px] px-[34px] relative size-full">
        <Container7 />
        <Container13 />
      </div>
    </div>
  );
}

function Frame42560Png1() {
  return (
    <div className="h-[24.5px] max-w-[136px] relative shrink-0 w-[136px]" data-name="Frame-42560.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame42560Png} />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[0.6px] relative shrink-0 w-full" data-name="Container">
      <Frame42560Png1 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container21 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[27px] not-italic relative shrink-0 text-[#111] text-[18px] tracking-[-0.18px] w-full whitespace-pre-wrap">
        <p className="mb-0">I am so happy to have found</p>
        <p className="mb-0">Timeleft. It has got me out of the</p>
        <p className="mb-0">house and meeting new people</p>
        <p className="mb-0">every week. I have made some</p>
        <p className="mb-0">wonderful connections with some</p>
        <p>{`new friends. `}</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container24 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container23 />
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16.01px] items-start relative w-full">
        <Container20 />
        <Container22 />
      </div>
    </div>
  );
}

function Illustration12Png() {
  return (
    <div className="h-[40.33px] max-w-[40px] relative shrink-0 w-[40px]" data-name="Illustration12.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-0 w-full" src={imgIllustration12Png} />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Illustration12Png />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[40px]" data-name="Container">
      <Container27 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#666362] text-[17.3px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Rob W.</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container30 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[240px]" data-name="Container">
      <Container29 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative w-full">
        <Container26 />
        <Container28 />
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-[360px] min-w-px relative rounded-[32px] self-stretch" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-[#efe8de] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="content-stretch flex flex-col items-start justify-between min-h-[inherit] pb-[33.99px] pt-[34px] px-[34px] relative size-full">
        <Container19 />
        <Container25 />
      </div>
    </div>
  );
}

function Frame42560Png2() {
  return (
    <div className="h-[24.5px] max-w-[136px] relative shrink-0 w-[136px]" data-name="Frame-42560.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame42560Png} />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[0.6px] relative shrink-0 w-full" data-name="Container">
      <Frame42560Png2 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container33 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[27px] not-italic relative shrink-0 text-[#111] text-[18px] tracking-[-0.18px] w-full whitespace-pre-wrap">
        <p className="mb-0">I’m glad I found it, and glad for the</p>
        <p className="mb-0">friends and acquaintances I have</p>
        <p className="mb-0">made. Now I have people to go and</p>
        <p className="mb-0">hike with, play poker, go to New</p>
        <p className="mb-0">Year’s parties, and game with,</p>
        <p>thanks to Timeleft.</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container36 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container35 />
    </div>
  );
}

function Container31() {
  return (
    <div className="relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16.01px] items-start relative w-full">
        <Container32 />
        <Container34 />
      </div>
    </div>
  );
}

function Illustration13Png() {
  return (
    <div className="h-[40.33px] max-w-[40px] relative shrink-0 w-[40px]" data-name="Illustration13.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-0 w-full" src={imgIllustration13Png} />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Illustration13Png />
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[40px]" data-name="Container">
      <Container39 />
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#666362] text-[16.7px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Taylor W.</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container42 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[240px]" data-name="Container">
      <Container41 />
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative w-full">
        <Container38 />
        <Container40 />
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-[360px] min-w-px relative rounded-[32px] self-stretch" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-2 border-[#efe8de] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="content-stretch flex flex-col items-start justify-between min-h-[inherit] pb-[33.99px] pt-[34px] px-[34px] relative size-full">
        <Container31 />
        <Container37 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[24px] items-start left-0 px-[17px] right-0 top-[-185px]" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder1 />
      <BackgroundBorder2 />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[175px] relative shrink-0 w-full" data-name="Margin">
      <Container6 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-center py-[100px] relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Container4 />
      <Margin />
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