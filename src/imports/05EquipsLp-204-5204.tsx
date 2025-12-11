import svgPaths from "./svg-9519tywbma";
import imgFrame1000007576 from "figma:asset/efa85e290b69314df59a76024b943a7bf04b3ca7.png";
import img66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp from "figma:asset/7bc6aa20bd99b5e785a9f8afbbacaa7bb10acabd.png";
import imgFrame41 from "figma:asset/06b6061d4beed4d7bbdf642e22f43b571ad366f2.png";
import imgFrame1000007579 from "figma:asset/f6a79a7b44d0d218617bbcc2cdad890a1274ceac.png";
import img65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif from "figma:asset/e4693070aefbfc64b931814df0ba3ff4c468dd6a.png";
import img65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif from "figma:asset/a0e10c2ec6afa0612d5e7c6d81330157a9c1d5e7.png";
import imgFrame1000007589 from "figma:asset/d183615f7c03d3b176392af9d57469c47f8b23e3.png";
import imgDtsFitnessAllieLehmanPhotosId1797CopyWebp from "figma:asset/091bde3ca3df1576f3a7dde8590aee20d6858d69.png";
import imgFireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg from "figma:asset/7ee423e6dc20937088d7d916d0f5ff333a101e26.png";
import imgDtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp from "figma:asset/69630877b2f0ea1979fedcdee430b8d92c705a78.png";
import img653406093Ca73A37601Cc150PeersBloguCc88BersichtNewsletterP800Avif from "figma:asset/d520368580246229986afc39addcd14047393642.png";
import { imgGroup } from "./svg-5gbbm";
import { BlogSectionBlock } from "../components/blocks/BlogSectionBlock";
import { NewsletterBlock } from "../components/blocks/NewsletterBlock";
import { ContextBlock } from "../components/blocks/ContextBlock";
import { getLatestBlogPosts } from "../lib/sample-data/blog-posts";

function Frame1000007577() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[72px] relative shrink-0 text-[58px] text-black w-full">
        <p className="mb-0">{`This is the Heading `}</p>
        <p>for Equips</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center relative shrink-0 text-[#2e2a2f] text-[16px] w-full">
        <p className="leading-[24px]">{`Ready to develop resilience against burnout? Adults aiming for preventing burnout, join us! If you're managing other mental health stuff, just check with your doc first.`}</p>
      </div>
    </div>
  );
}

function Buttons() {
  return (
    <div className="bg-[#2e2a2f] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame1000007575() {
  return (
    <div className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-[546px]">
      <Frame1000007577 />
      <Buttons />
    </div>
  );
}

function Frame1000007576() {
  return (
    <div className="h-[900px] relative rounded-bl-[80px] rounded-br-[80px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-bl-[80px] rounded-br-[80px] size-full" src={imgFrame1000007576} />
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] h-[900px] items-start justify-center px-[100px] py-[296px] relative w-full">
          <Frame1000007575 />
        </div>
      </div>
    </div>
  );
}

function Component66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp() {
  return (
    <div className="basis-0 grow max-w-[426.95px] min-h-px min-w-px relative rounded-[14.49px] shrink-0 w-full" data-name="66292b188d01b0eb2ae89adc_cm-interview_thumbnail-p-500.webp">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[14.49px]">
        <img alt="" className="absolute h-full left-[-13.26%] max-w-none top-0 w-[126.53%]" src={img66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp} />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col inset-0 items-start justify-center overflow-clip rounded-[14.49px]" data-name="Container">
      <Component66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp />
      <div className="absolute bg-gradient-to-b bottom-[-0.3px] from-35% from-[rgba(255,255,255,0)] left-0 rounded-[14.49px] to-[rgba(0,0,0,0.4)] top-0 w-[426.95px]" data-name="Gradient" />
    </div>
  );
}

function Container1() {
  return <div className="absolute size-px translate-x-[-50%] translate-y-[-50%]" data-name="Container" style={{ top: "calc(50% - 24.86px)", left: "calc(50% + 0.499px)" }} />;
}

function Group() {
  return (
    <div className="absolute inset-[9.98%_10.16%_10.34%_10.16%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4.664px] mask-size-[49.745px_49.746px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 41">
        <g id="Group">
          <path d={svgPaths.p163e1ff0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-[0.78%_0.96%_1.14%_0.96%]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function Component2() {
  return (
    <div className="absolute left-1/2 size-[50.72px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Component 2">
      <ClipPathGroup />
    </div>
  );
}

function Container2() {
  return <div className="absolute size-px translate-x-[-50%] translate-y-[-50%]" data-name="Container" style={{ top: "calc(50% + 25.859px)", left: "calc(50% + 0.499px)" }} />;
}

function Container3() {
  return (
    <div className="absolute left-0 size-[50.72px] top-1/2 translate-y-[-50%]" data-name="Container">
      <Container1 />
      <Component2 />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-[61.57px] pb-[0.605px] pl-0 pr-[152.1px] pt-0 translate-y-[-50%]" data-name="Container" style={{ top: "calc(50% - 0.561px)" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[21.74px] not-italic relative shrink-0 text-[18.1px] text-nowrap text-white tracking-[-0.16px] whitespace-pre">
        <p className="mb-0">Jetzt das vollständige</p>
        <p>Interview anschauen</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[50.72px] relative shrink-0 w-[402.75px]" data-name="Container">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-end px-[2px] py-[24px] relative self-stretch shrink-0 z-[2]" data-name="Container">
      <Container />
      <Container5 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[48px] text-nowrap">
        <p className="leading-[60px] whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">{`Having trouble sleeping? I-Kan's Sleep Tight module is here. We know quality sleep is essential for your well-being. Over the next  18 days, we'll work together to address your sleep troubles and help you achieve restful nights, improving your health, focus, and mood.`}</p>
      </div>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <Heading2 />
      <Margin />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame40 />
    </div>
  );
}

function Background() {
  return (
    <div className="basis-0 bg-[#fffdfd] grow min-h-px min-w-px relative rounded-[14.49px] self-stretch shrink-0 z-[1]" data-name="Background">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col items-center p-[50px] relative size-full">
          <Container7 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[23.55px] isolate items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Background />
    </div>
  );
}

function Section() {
  return (
    <div className="box-border content-stretch flex flex-col items-center p-[100px] relative shrink-0 w-[1440px]" data-name="Section">
      <ContextBlock
        title="About"
        content="Having trouble sleeping? I-Kan's Sleep Tight module is here. We know quality sleep is essential for your well-being. Over the next  18 days, we'll work together to address your sleep troubles and help you achieve restful nights, improving your health, focus, and mood."
        image={img66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp}
        imageAlt="Interview thumbnail"
        videoCaption="Jetzt das vollständige\nInterview anschauen"
        showPlayButton={true}
        onVideoClick={() => console.log('Play video')}
      />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] text-nowrap">
        <p className="leading-[50px] whitespace-pre">What to expect</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">{`We're tackling burnout in multiple steps. We are looking into the origin of burnout, internal and external factors that may cause burnout, and how it affects us, and also quick techniques to center you and be more mindful, this way getting a sight of the present and reducing burnout.`}</p>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="basis-0 grow h-[650px] min-h-px min-w-px relative rounded-bl-[40px] rounded-tl-[40px] shrink-0">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-bl-[40px] rounded-tl-[40px]">
        <div className="absolute bg-white inset-0 rounded-bl-[40px] rounded-tl-[40px]" />
        <div className="absolute inset-0 overflow-hidden rounded-bl-[40px] rounded-tl-[40px]">
          <img alt="" className="absolute h-[54.86%] left-[-3.46%] max-w-none top-[46.31%] w-[106.91%]" src={imgFrame41} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#dddddd] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none rounded-bl-[40px] rounded-tl-[40px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] h-[650px] items-start p-[100px] relative w-full">
          <Heading6 />
          <Margin1 />
        </div>
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] text-nowrap">
        <p className="leading-[50px] whitespace-pre">Who can participate</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">{`Ready to develop resilience against burnout? Adults aiming for preventing burnout, join us! If you're managing other mental health stuff, just check with your doc first.`}</p>
      </div>
    </div>
  );
}

function Frame1000007579() {
  return (
    <div className="basis-0 grow h-[650px] min-h-px min-w-px relative rounded-br-[40px] rounded-tr-[40px] shrink-0">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-br-[40px] rounded-tr-[40px]">
        <div className="absolute bg-[#f7f7f7] inset-0 rounded-br-[40px] rounded-tr-[40px]" />
        <div className="absolute inset-0 overflow-hidden rounded-br-[40px] rounded-tr-[40px]">
          <img alt="" className="absolute h-[64.55%] left-[-2.29%] max-w-none top-[37.78%] w-[124.36%]" src={imgFrame1000007579} />
        </div>
      </div>
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] h-[650px] items-start p-[100px] relative w-full">
          <Heading7 />
          <Margin2 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007580() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex items-start p-[100px] relative w-full">
          <Frame41 />
          <Frame1000007579 />
        </div>
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">Weekly Program Strcutre (in accordion</p>
      </div>
    </div>
  );
}

function Frame1000007597() {
  return (
    <div className="bg-[#efefef] box-border content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative shrink-0 w-[468px]">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">{`Week 1-3 `}</p>
      </div>
    </div>
  );
}

function Frame1000007598() {
  return (
    <div className="bg-[#efefef] box-border content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative shrink-0 w-[468px]">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">{`Week 4,5,6 `}</p>
      </div>
    </div>
  );
}

function Frame1000007599() {
  return (
    <div className="bg-[#efefef] box-border content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative shrink-0 w-[468px]">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">Week 7-12</p>
      </div>
    </div>
  );
}

function Frame1000007600() {
  return (
    <div className="bg-[#efefef] box-border content-stretch flex gap-[10px] items-center px-[20px] py-[10px] relative shrink-0 w-[468px]">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">Week 13-15</p>
      </div>
    </div>
  );
}

function Frame42() {
  return (
    <div className="basis-0 bg-white grow h-[650px] min-h-px min-w-px relative rounded-bl-[40px] rounded-tl-[40px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#dbdde0] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none rounded-bl-[40px] rounded-tl-[40px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] h-[650px] items-start p-[50px] relative w-full">
          <Heading8 />
          <Frame1000007597 />
          <Frame1000007598 />
          <Frame1000007599 />
          <Frame1000007600 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007590() {
  return (
    <div className="basis-0 grow h-[650px] min-h-px min-w-px relative rounded-br-[40px] rounded-tr-[40px] shrink-0">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-br-[40px] rounded-tr-[40px]">
        <div className="absolute bg-[#f0f0f0] inset-0 rounded-br-[40px] rounded-tr-[40px]" />
        <div className="absolute inset-0 overflow-hidden rounded-br-[40px] rounded-tr-[40px]">
          <img alt="" className="absolute h-[64.55%] left-[-2.29%] max-w-none top-[37.78%] w-[124.36%]" src={imgFrame1000007579} />
        </div>
      </div>
      <div className="size-full">
        <div className="h-[650px] w-full" />
      </div>
    </div>
  );
}

function Frame1000007591() {
  return (
    <div className="bg-white box-border content-stretch flex items-start p-[100px] relative shrink-0 w-[1440px]">
      <Frame42 />
      <Frame1000007590 />
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col items-center pl-[257.17px] pr-[257.19px] py-0 relative w-full">
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#545457] text-[14px] text-center w-full">
            <p className="leading-[21px]">Warum PEERS. WÄHLEN?</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading9() {
  return (
    <div className="box-border content-stretch flex flex-col items-center pb-[0.81px] pt-0 px-0 relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0f] text-[48px] text-center w-full">
        <p className="leading-[60px]">Features and things to note</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[17.11px] items-start max-w-[695.712px] relative shrink-0 w-[695.7px]" data-name="Container">
      <Container9 />
      <Heading9 />
    </div>
  );
}

function Component65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif() {
  return (
    <div className="h-[72.47px] relative shrink-0 w-[234.61px]" data-name="65311a1293b6f8535f54f4dd_peers-home-psychologen-p-500.avif">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[2.62%] max-w-none top-0 w-[94.75%]" src={img65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif} />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[30px] not-italic relative shrink-0 text-[24px] text-nowrap text-white whitespace-pre">
        <p className="mb-0">Professionell ausgebildete</p>
        <p className="mb-0">{`Psycholog:innen & wissenschaftlich`}</p>
        <p>fundierte Forschung.</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">
        <p className="mb-0">peers. bietet dir professionelle Unterstützung auf Augenhöhe</p>
        <p>und ein Umfeld, das dich versteht und wertschätzt.</p>
      </div>
    </div>
  );
}

function Component1() {
  return (
    <div className="box-border content-stretch flex items-start pb-[11.64px] pt-[11.36px] px-[26.365px] relative rounded-[4.53px] shrink-0" data-name="Component 1">
      <div aria-hidden="true" className="absolute border border-[#d9e1cf] border-solid inset-0 pointer-events-none rounded-[4.53px]" />
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white">
        <p className="leading-[24px] whitespace-pre">Entdecke unsere Kurse</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#2e2a2f] box-border content-stretch flex flex-col gap-[28px] h-[466px] items-start left-[3px] px-[57px] py-[55px] right-[629px] rounded-[14.49px] translate-y-[-50%]" data-name="Background" style={{ top: "calc(50% + 0.078px)" }}>
      <Component65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif />
      <Heading3 />
      <Container11 />
      <Component1 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[34.42px] right-[293.8px] top-[54.4px]" data-name="Heading 4">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[30px] not-italic relative shrink-0 text-[#0a0a0f] text-[24px] text-nowrap whitespace-pre">
        <p className="mb-0">Egal, wo du bist,</p>
        <p className="mb-0">peers. ist 100%</p>
        <p className="mb-0">digital und immer</p>
        <p>für dich da.</p>
      </div>
    </div>
  );
}

function Component65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif() {
  return (
    <div className="absolute h-[210.16px] left-[306.18px] right-[22.04px] top-[11.53px]" data-name="65311a7ca1ba6b4628668b29_peers-home-iphone-screen-mockup-p-500.avif">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[90.04%] left-0 max-w-none top-[13.39%] w-[91.49%]" src={img65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif} />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="absolute bg-[#efefef] bottom-[243.92px] left-[629px] right-0 rounded-[14.49px] top-[0.08px]" data-name="Background">
      <Heading4 />
      <Component65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif />
    </div>
  );
}

function Heading10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[34.94px] right-[36.47px] top-[97.91px]" data-name="Heading 4">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0f] text-[24px] text-nowrap">
        <p className="leading-[30px] whitespace-pre">Safety First</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[34.51px] right-[36.9px] top-[134.02px]" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[#545457] text-[16px] text-nowrap whitespace-pre">
        <p className="mb-0">Datensicherheit und</p>
        <p className="mb-0">Schweigepflicht haben</p>
        <p>für uns höchste Priorität.</p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[20px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group">
          <path d={svgPaths.p9e36b00} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p26b59700} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.p37502200} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.pa96a840} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p31e30b30} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.p39e72880} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.pc7d0100} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.p5e5a2c0} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p1bad0100} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p25291500} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p37e9c4f2} fill="var(--fill-0, black)" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group1 />
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group2 />
    </div>
  );
}

function Calendar2() {
  return (
    <div className="absolute bg-neutral-100 box-border content-stretch flex gap-[6.25px] items-center justify-center left-[32.44px] overflow-clip p-[15px] rounded-[62.5px] top-[29.64px]" data-name="calendar (2)">
      <Group3 />
    </div>
  );
}

function Border() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[14.49px] shrink-0" data-name="Border">
      <div aria-hidden="true" className="absolute border border-[#757575] border-solid inset-0 pointer-events-none rounded-[14.49px]" />
      <Heading10 />
      <Container12 />
      <Calendar2 />
    </div>
  );
}

function ParagraphBackground() {
  return (
    <div className="basis-0 bg-[#2e2a2f] grow h-full min-h-px min-w-px relative rounded-[14.49px] shrink-0" data-name="Paragraph+Background">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col font-['Ubuntu:Bold',_sans-serif] items-start justify-between leading-[0] not-italic pb-[33.91px] pl-[34.423px] pr-[10.87px] pt-[27.98px] relative size-full text-nowrap text-white">
          <div className="flex flex-col justify-center relative shrink-0 text-[48px]">
            <p className="leading-[60px] text-nowrap whitespace-pre">Ab 89€</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[24px]">
            <p className="leading-[30px] text-nowrap whitespace-pre">pro Monat</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bottom-[-0.08px] content-stretch flex gap-[18px] items-start justify-center left-[629px] right-0 top-[240.08px]" data-name="Container">
      <Border />
      <ParagraphBackground />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[466px] relative shrink-0 w-full" data-name="Container">
      <Background1 />
      <Background2 />
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-center flex flex-wrap gap-0 items-center justify-center pl-[467.77px] pr-[467.78px] py-0 w-full" />
      </div>
    </div>
  );
}

function Component4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Component 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Component 2">
          <path d={svgPaths.p1d812c00} fill="var(--fill-0, #545457)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[157.97px] py-[3.695px] top-0 w-[169.97px]" data-name="652014a62693b049344a4fea_peers-checkbox-icon.svg fill">
      <Component4 />
    </div>
  );
}

function Item() {
  return (
    <div className="h-[19.39px] relative shrink-0 w-[169.97px]" data-name="Item">
      <Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill />
      <div className="absolute flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] left-[17.92px] not-italic text-[#545457] text-[12px] text-nowrap top-[9.5px] translate-y-[-50%]">
        <ul>
          <li className="list-disc ms-[18px]">
            <span className="leading-[18px]">1 Monat für nur 9€ testen</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Component5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Component 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Component 2">
          <path d={svgPaths.p1d812c00} fill="var(--fill-0, #545457)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill1() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[185.73px] py-[3.695px] top-0 w-[197.73px]" data-name="652014a62693b049344a4fea_peers-checkbox-icon.svg fill">
      <Component5 />
    </div>
  );
}

function Item1() {
  return (
    <div className="h-[19.39px] relative shrink-0 w-[197.73px]" data-name="Item">
      <Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill1 />
      <div className="absolute flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] left-[17.92px] not-italic text-[#545457] text-[12px] text-nowrap top-[9.5px] translate-y-[-50%]">
        <ul>
          <li className="list-disc ms-[18px]">
            <span className="leading-[18px]">96% Weiterempfehlungsquote</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Component6() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Component 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Component 2">
          <path d={svgPaths.p1d812c00} fill="var(--fill-0, #545457)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill2() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[100.67px] py-[3.695px] top-0 w-[112.67px]" data-name="652014a62693b049344a4fea_peers-checkbox-icon.svg fill">
      <Component6 />
    </div>
  );
}

function Item2() {
  return (
    <div className="h-[19.39px] relative shrink-0 w-[112.67px]" data-name="Item">
      <Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill2 />
      <div className="absolute flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] left-[17.92px] not-italic text-[#545457] text-[12px] text-nowrap top-[9.5px] translate-y-[-50%]">
        <ul>
          <li className="list-disc ms-[18px]">
            <span className="leading-[18px]">Kurze Wartezeit</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="relative shrink-0 w-full" data-name="List">
      <div className="flex flex-row justify-center size-full">
        <div className="box-border content-stretch flex gap-[25.4px] items-start justify-center pl-[314.21px] pr-[314.22px] py-0 relative w-full">
          <Item />
          <Item1 />
          <Item2 />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[27.17px] items-start relative shrink-0 w-full" data-name="Container">
      <Container15 />
      <List />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-center relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container14 />
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container17 />
    </div>
  );
}

function Section1() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Section">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col items-center p-[100px] relative w-full">
          <Container18 />
        </div>
      </div>
    </div>
  );
}

function Heading11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[48px] text-nowrap">
        <p className="leading-[60px] whitespace-pre">Things to note</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">Before we begin, here are some things we would like you to note:</p>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[550px]">
      <Heading11 />
      <Margin3 />
    </div>
  );
}

function Group4() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[32px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Group">
          <path d={svgPaths.pf661d80} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p23785400} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.p3f3fe880} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p3e9b6600} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p1840f980} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.p1571b100} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.p29815bf0} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.p3045e600} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p2c749b80} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p24890900} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p225aca40} fill="var(--fill-0, black)" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group4 />
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group5 />
    </div>
  );
}

function Calendar3() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[24px] relative rounded-[100px] shrink-0" data-name="calendar (2)">
      <Group6 />
    </div>
  );
}

function Frame1000007581() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-bl-[32px] rounded-tl-[32px] shrink-0">
      <div className="flex flex-col justify-center overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-start justify-center p-[24px] relative w-full">
          <Calendar3 />
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#757575] text-[16px]" style={{ width: "min-content" }}>
            <p className="leading-[24px]">This is a 32 day programme. As much as we would have liked to make it self-paced, we would suggest you give some time to the activities daily. Consistency is the key here.</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none rounded-bl-[32px] rounded-tl-[32px]" />
    </div>
  );
}

function Outline() {
  return (
    <div className="absolute inset-[4.17%_4.17%_4.16%_4.17%]" data-name="outline">
      <div className="absolute inset-[-0.68%_-0.69%_-0.69%_-0.69%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <g id="outline">
            <path d={svgPaths.pc287340} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p184334a0} fill="var(--fill-0, black)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p35d60100} fill="var(--fill-0, black)" id="Vector_3" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p38352580} fill="var(--fill-0, black)" id="Vector_4" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.pa6fa000} fill="var(--fill-0, black)" id="Vector_5" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p3f0aeec0} fill="var(--fill-0, black)" id="Vector_6" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p1a191880} fill="var(--fill-0, black)" id="Vector_7" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p30024800} fill="var(--fill-0, black)" id="Vector_8" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p1d913a80} fill="var(--fill-0, black)" id="Vector_9" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p1e0c7a70} fill="var(--fill-0, black)" id="Vector_10" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p5034f00} fill="var(--fill-0, black)" id="Vector_11" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LogicalThinking() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="logical-thinking">
      <Outline />
    </div>
  );
}

function Calendar4() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[10.959px] items-center justify-center overflow-clip p-[26.301px] relative rounded-[109.589px] shrink-0 size-[80px]" data-name="calendar (2)">
      <LogicalThinking />
    </div>
  );
}

function Frame1000007582() {
  return (
    <div className="basis-0 bg-white grow h-full min-h-px min-w-px relative shrink-0">
      <div className="flex flex-col justify-center overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-start justify-center p-[24px] relative size-full">
          <Calendar4 />
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[24px] min-w-full not-italic relative shrink-0 text-[#757575] text-[16px]" style={{ width: "min-content" }}>
            <p className="mb-0">IKan Equip is a self help tool which is all about developing skills to deal with distresses. We do not claim to cure mental health distress.</p>
            <p>&nbsp;</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute inset-[4%_14.49%_3.98%_14.49%]" data-name="Group">
      <div className="absolute inset-[-0.68%_-0.88%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 31">
          <g id="Group">
            <path d={svgPaths.p253c1b00} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute inset-[77.73%_51.68%_3.98%_41.48%]" data-name="Group">
      <div className="absolute inset-[-3.42%_-9.14%_-3.42%_-9.11%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 8">
          <g id="Group">
            <path d={svgPaths.p453ad80} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents inset-[4%_14.49%_3.98%_14.49%]" data-name="Group">
      <Group7 />
      <Group8 />
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute inset-[9.53%_20.54%_52.79%_24.33%]" data-name="Group">
      <div className="absolute bottom-0 left-0 right-0 top-[-0.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 13">
          <g id="Group">
            <path d={svgPaths.p2bfac00} fill="var(--fill-0, black)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group62() {
  return (
    <div className="absolute contents inset-[4%_14.49%_3.98%_14.49%]">
      <Group9 />
      <Group10 />
    </div>
  );
}

function MentalDisorder1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="mental-disorder (1)">
      <Group62 />
    </div>
  );
}

function Calendar5() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[10.959px] items-center justify-center overflow-clip p-[26.301px] relative rounded-[109.589px] shrink-0 size-[80px]" data-name="calendar (2)">
      <MentalDisorder1 />
    </div>
  );
}

function Frame1000007583() {
  return (
    <div className="basis-0 bg-white grow h-full min-h-px min-w-px relative rounded-br-[32px] rounded-tr-[32px] shrink-0">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-start p-[24px] relative size-full">
          <Calendar5 />
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#757575] text-[16px]" style={{ width: "min-content" }}>
            <p className="leading-[24px]">In case you do feel overwhelmed with your distresses, we would strongly suggest you speak with a mental health professional.</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-br-[32px] rounded-tr-[32px]" />
    </div>
  );
}

function Frame1000007584() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame1000007581 />
      <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
        <Frame1000007582 />
      </div>
      <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
        <Frame1000007583 />
      </div>
    </div>
  );
}

function Frame1000007585() {
  return (
    <div className="bg-[#f7f7f7] relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[32px] items-start p-[100px] relative w-full">
          <Frame43 />
          <Frame1000007584 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007588() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[48px] text-black w-full">
        <p className="leading-[60px]">Onboarding Request</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">Before we begin, we would like to know something about you. We promise to keep all your data safe and will ensure your privacy.</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="bg-[#2e2a2f] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame1000007586() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-[550px]">
      <Frame1000007588 />
      <Buttons1 />
    </div>
  );
}

function Frame1000007589() {
  return (
    <div className="h-[450px] relative rounded-[40px] shrink-0 w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[40px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame1000007589} />
      </div>
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] h-[450px] items-start justify-center p-[50px] relative w-full">
          <Frame1000007586 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007587() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[100px] relative w-full">
          <Frame1000007589 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007594() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[80px] items-center justify-center px-[20px] py-[10px] relative rounded-[8px] shrink-0">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">SEE MORE</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-neutral-900 text-nowrap">
        <p className="leading-[60px] whitespace-pre">More Equip Programs</p>
      </div>
      <Frame1000007594 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold gap-[8px] h-[61px] items-start leading-[0] not-italic relative shrink-0 w-[296px]">
      <div className="flex flex-col justify-center relative shrink-0 text-[14.648px] text-black tracking-[1.5px] uppercase w-full">
        <p className="leading-[15px]">Title</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#151515] text-[32.672px] w-full">
        <p className="leading-[37.4px]">Equip Name</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-['Inter:Regular',_sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#151515] text-[15.406px]">
        <p className="leading-[27.2px]">A highly-curated selection of only the healthiest snacks, pantry staples, and state-of-the-art supplements.pantry staples, and state-of-the-art supplements.</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame29 />
    </div>
  );
}

function Component26() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Component 24">
          <path d={svgPaths.p239c0200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.9375 2.25V15.75" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 5.02496H2.66249" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 7.5H2.66249" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 9.9H2.66249" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9125 12.2999H3.9375" id="Vector_6" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Info() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Component26 />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap tracking-[0.06px] uppercase">
        <p className="leading-[24px] whitespace-pre">14 days</p>
      </div>
    </div>
  );
}

function Component27() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Component 24">
          <path d={svgPaths.p239c0200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.9375 2.25V15.75" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 5.02496H2.66249" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 7.5H2.66249" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 9.9H2.66249" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9125 12.2999H3.9375" id="Vector_6" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Info1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Component27 />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap tracking-[0.06px] uppercase">
        <p className="leading-[24px] whitespace-pre">23 Activites</p>
      </div>
    </div>
  );
}

function Component28() {
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

function Buttons2() {
  return (
    <div className="bg-[#2e2a2f] relative rounded-[8px] shrink-0 w-full" data-name="Buttons">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative w-full">
          <Component28 />
          <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
            <p className="leading-[28px] whitespace-pre">KNOW MORE</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-start relative shrink-0 w-[177px]">
      <Info />
      <Info1 />
      <Buttons2 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full">
      <div className="bg-[#d9d9d9] shrink-0 size-[148px]" />
      <Frame26 />
    </div>
  );
}

function EqupCard() {
  return (
    <div className="[grid-area:1_/_1] bg-white box-border content-stretch flex flex-col gap-[24px] h-[437px] items-start p-[24px] relative rounded-[10px] shrink-0 w-[442px]" data-name="Equp Card">
      <Frame28 />
      <Container20 />
      <Frame27 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold gap-[8px] h-[61px] items-start leading-[0] not-italic relative shrink-0 w-[296px]">
      <div className="flex flex-col justify-center relative shrink-0 text-[14.648px] text-black tracking-[1.5px] uppercase w-full">
        <p className="leading-[15px]">Title</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#151515] text-[32.672px] w-full">
        <p className="leading-[37.4px]">Equip Name</p>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-['Inter:Regular',_sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#151515] text-[15.406px]">
        <p className="leading-[27.2px]">A highly-curated selection of only the healthiest snacks, pantry staples, and state-of-the-art supplements.pantry staples, and state-of-the-art supplements.</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame31 />
    </div>
  );
}

function Component29() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Component 24">
          <path d={svgPaths.p239c0200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.9375 2.25V15.75" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 5.02496H2.66249" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 7.5H2.66249" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 9.9H2.66249" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9125 12.2999H3.9375" id="Vector_6" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Info2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Component29 />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap tracking-[0.06px] uppercase">
        <p className="leading-[24px] whitespace-pre">14 days</p>
      </div>
    </div>
  );
}

function Component30() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Component 24">
          <path d={svgPaths.p239c0200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.9375 2.25V15.75" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 5.02496H2.66249" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 7.5H2.66249" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.91249 9.9H2.66249" id="Vector_5" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.9125 12.2999H3.9375" id="Vector_6" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Info3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Component30 />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap tracking-[0.06px] uppercase">
        <p className="leading-[24px] whitespace-pre">23 Activites</p>
      </div>
    </div>
  );
}

function Component31() {
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

function Buttons3() {
  return (
    <div className="bg-[#2e2a2f] relative rounded-[8px] shrink-0 w-full" data-name="Buttons">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative w-full">
          <Component31 />
          <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
            <p className="leading-[28px] whitespace-pre">KNOW MORE</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-start relative shrink-0 w-[177px]">
      <Info2 />
      <Info3 />
      <Buttons3 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex gap-[12px] items-end relative shrink-0 w-full">
      <div className="bg-[#d9d9d9] shrink-0 size-[148px]" />
      <Frame32 />
    </div>
  );
}

function EqupCard1() {
  return (
    <div className="[grid-area:1_/_2] bg-white relative rounded-[10px] shrink-0" data-name="Equp Card">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
          <Frame30 />
          <Container21 />
          <Frame33 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007412() {
  return (
    <div className="gap-[24px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[401px] relative shrink-0 w-full">
      <EqupCard />
      <EqupCard1 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[485px] items-start relative shrink-0 w-[1240px]" data-name="Container">
      <Container19 />
      <Frame1000007412 />
    </div>
  );
}

function Section2() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col items-center p-[100px] relative shrink-0 w-[1440px]" data-name="Section">
      <Container22 />
    </div>
  );
}

function Frame1000007596() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[80px] items-center justify-center px-[20px] py-[10px] relative rounded-[8px] shrink-0">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">READ MORE</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-neutral-900 text-nowrap">
        <p className="leading-[60px] whitespace-pre">Our Recent Thoughts</p>
      </div>
      <Frame1000007596 />
    </div>
  );
}

function DtsFitnessAllieLehmanPhotosId1797CopyWebp() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="DTS_Fitness_Allie_Lehman_Photos_ID1797_copy.webp">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute h-[106.5%] left-0 max-w-none top-[-3.25%] w-full" src={imgDtsFitnessAllieLehmanPhotosId1797CopyWebp} />
      </div>
      <div className="size-full">
        <div className="size-full" />
      </div>
    </div>
  );
}

function Component13() {
  return (
    <div className="absolute content-stretch flex flex-col inset-0 items-start justify-center" data-name="Component 13">
      <DtsFitnessAllieLehmanPhotosId1797CopyWebp />
    </div>
  );
}

function Figure() {
  return (
    <div className="h-[195.31px] overflow-clip relative shrink-0 w-full" data-name="Figure">
      <Component13 />
    </div>
  );
}

function Aside() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-[312.5px]" data-name="Aside">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[11.438px] text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[19.2px] whitespace-pre">February 26 2025</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="box-border content-stretch flex items-start px-0 py-[0.695px] relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[36px] not-italic relative shrink-0 text-[#151515] text-[24px] text-nowrap whitespace-pre">
        <p className="mb-0">Do I Need to Supplement</p>
        <p>with B12?</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[312.5px]" data-name="Heading">
      <Link />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[312.5px]" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[21px] not-italic relative shrink-0 text-[#151515] text-[14px] text-nowrap whitespace-pre">
        <p className="mb-0">It’s one of those nutrients that gets a lot of</p>
        <p>hype, and for good reason</p>
      </div>
    </div>
  );
}

function Component10() {
  return (
    <div className="box-border content-stretch flex items-start pb-0 pt-[36px] px-0 relative shrink-0" data-name="Component 10">
      <div className="absolute bg-[rgba(21,21,21,0.4)] h-px left-0 right-0 top-[19px]" data-name="Horizontal Divider" />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[13.711px] text-nowrap tracking-[0.3px]">
        <p className="leading-[17px] whitespace-pre">Read more</p>
      </div>
    </div>
  );
}

function Frame1000007440() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-between min-h-px min-w-px relative shrink-0">
      <Container24 />
      <Component10 />
    </div>
  );
}

function Container25() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[15px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <Figure />
      <Aside />
      <Heading />
      <Frame1000007440 />
    </div>
  );
}

function Container26() {
  return (
    <div className="[grid-area:1_/_1] bg-white relative rounded-[12px] shrink-0" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[15px] relative size-full">
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function FireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Firefly_a_beautiful_kitchen_counter_shot_from_the_side._The_backsplash_is_light_green_tile._There_i_1.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute h-[124.5%] left-0 max-w-none top-[-12.25%] w-full" src={imgFireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg} />
      </div>
    </div>
  );
}

function Component14() {
  return (
    <div className="content-stretch flex flex-col h-[195.31px] items-start justify-center relative shrink-0 w-[372.667px]" data-name="Component 13">
      <FireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg />
    </div>
  );
}

function Aside1() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-[312.5px]" data-name="Aside">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[11.438px] text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[19.2px] whitespace-pre">February 06 2025</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="box-border content-stretch flex items-start px-0 py-[0.5px] relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[24px] text-nowrap">
        <p className="leading-[36px] whitespace-pre">Recipe: Mint Chip Smoothie</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[312.5px]" data-name="Heading 5">
      <Link1 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[312.5px]" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[21px] not-italic relative shrink-0 text-[#151515] text-[14px] text-nowrap whitespace-pre">
        <p className="mb-0">This Mint Chip Smoothie was a limited edition</p>
        <p className="mb-0">menu item that still lives on in our dreams, and</p>
        <p>now you can enjoy it any time at home.</p>
      </div>
    </div>
  );
}

function Component11() {
  return (
    <div className="box-border content-stretch flex items-start pb-0 pt-[36px] px-0 relative shrink-0" data-name="Component 10">
      <div className="absolute bg-[rgba(21,21,21,0.4)] h-px left-0 right-0 top-[19px]" data-name="Horizontal Divider" />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[13.711px] text-nowrap tracking-[0.3px]">
        <p className="leading-[17px] whitespace-pre">Read more</p>
      </div>
    </div>
  );
}

function Frame1000007438() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-between min-h-px min-w-px relative shrink-0">
      <Container27 />
      <Component11 />
    </div>
  );
}

function Container28() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[15px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <Component14 />
      <Aside1 />
      <Heading5 />
      <Frame1000007438 />
    </div>
  );
}

function Container29() {
  return (
    <div className="[grid-area:1_/_2] bg-white relative rounded-[12px] shrink-0" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[15px] relative size-full">
          <Container28 />
        </div>
      </div>
    </div>
  );
}

function DtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="DTS_Please_Do_Not_Disturb_Fanette_Guilloud_Photos_ID8854.webp">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[120%] left-0 max-w-none top-[-10%] w-full" src={imgDtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp} />
      </div>
    </div>
  );
}

function Component15() {
  return (
    <div className="content-stretch flex flex-col h-[195.31px] items-start justify-center relative rounded-[12px] shrink-0 w-full" data-name="Component 13">
      <DtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp />
    </div>
  );
}

function Aside2() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-[312.5px]" data-name="Aside">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[11.438px] text-nowrap tracking-[1.2px] uppercase">
        <p className="leading-[19.2px] whitespace-pre">February 02 2025</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="box-border content-stretch flex items-start px-0 py-[0.5px] relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[24px] text-nowrap">
        <p className="leading-[36px] whitespace-pre">The Wellness Edit</p>
      </div>
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[312.5px]" data-name="Heading 5">
      <Link2 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[21px] not-italic relative shrink-0 text-[#151515] text-[14px] w-full">
        <p className="mb-0">Welcome to the Wellness Edit, the newest</p>
        <p>editorial project from Earthbar.</p>
      </div>
    </div>
  );
}

function Component12() {
  return (
    <div className="box-border content-stretch flex items-start pb-0 pt-[36px] px-0 relative shrink-0" data-name="Component 10">
      <div className="absolute bg-[rgba(21,21,21,0.4)] h-px left-0 right-0 top-[19px]" data-name="Horizontal Divider" />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[13.711px] text-nowrap tracking-[0.3px]">
        <p className="leading-[17px] whitespace-pre">Read more</p>
      </div>
    </div>
  );
}

function Frame1000007439() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-between min-h-px min-w-px relative shrink-0 w-full">
      <Container30 />
      <Component12 />
    </div>
  );
}

function Container31() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[15px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <Component15 />
      <Aside2 />
      <Heading12 />
      <Frame1000007439 />
    </div>
  );
}

function Container32() {
  return (
    <div className="[grid-area:1_/_3] bg-white relative rounded-[12px] shrink-0" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[15px] relative size-full">
          <Container31 />
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="gap-[24px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[450.47px] relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Container29 />
      <Container32 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[534.47px] items-start relative shrink-0 w-[1240px]" data-name="Container">
      <Container23 />
      <Container33 />
    </div>
  );
}

function Section3({ onBlogClick, onViewAll }: { 
  onBlogClick?: (blogId: string) => void;
  onViewAll?: () => void;
} = {}) {
  const blogPosts = getLatestBlogPosts(3);
  
  const handlePostClick = (post: any) => {
    if (onBlogClick) {
      onBlogClick(post.id);
    }
  };

  return (
    <div className="bg-[#e9ebef] box-border content-stretch flex flex-col items-center p-[100px] relative shrink-0 w-[1440px]" data-name="Section">
      <BlogSectionBlock 
        posts={blogPosts}
        onPostClick={handlePostClick}
        onViewAll={onViewAll}
      />
    </div>
  );
}

function Heading13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0f] text-[34px] w-full">
        <p className="leading-[42px]">Anmeldung zum Newsletter</p>
      </div>
    </div>
  );
}

function Component7() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Component 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Component 2">
          <path d={svgPaths.p1d812c00} fill="var(--fill-0, #545457)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill3() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[150.92px] py-[3.695px] top-0 w-[162.92px]" data-name="652014a62693b049344a4fea_peers-checkbox-icon.svg fill">
      <Component7 />
    </div>
  );
}

function Item3() {
  return (
    <div className="h-[19.39px] relative shrink-0 w-[162.92px]" data-name="Item">
      <Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill3 />
      <div className="absolute flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] left-[17.92px] not-italic text-[#0a0a0f] text-[14px] text-nowrap top-[10px] translate-y-[-50%]">
        <ul>
          <li className="list-disc ms-[21px]">
            <span className="leading-[21px]">{`Neuigkeiten & Angebote`}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Component8() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Component 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Component 2">
          <path d={svgPaths.p1d812c00} fill="var(--fill-0, #545457)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill4() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[190.02px] py-[3.695px] top-0 w-[202.02px]" data-name="652014a62693b049344a4fea_peers-checkbox-icon.svg fill">
      <Component8 />
    </div>
  );
}

function Item4() {
  return (
    <div className="h-[19.39px] relative shrink-0 w-[202.02px]" data-name="Item">
      <Component652014A62693B049344A4FeaPeersCheckboxIconSvgFill4 />
      <div className="absolute flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] left-[17.92px] not-italic text-[#0a0a0f] text-[14px] text-nowrap top-[10px] translate-y-[-50%]">
        <ul>
          <li className="list-disc ms-[21px]">
            <span className="leading-[21px]">Praktische Tipps und Übungen</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex gap-[25.36px] items-start relative shrink-0 w-full" data-name="List">
      <Item3 />
      <Item4 />
    </div>
  );
}

function Frame1000007595() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Heading13 />
      <List1 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0f] text-[14px] w-full">
        <p className="leading-[21px]">Vorname</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="basis-0 bg-white grow h-[41.66px] min-h-px min-w-px relative rounded-[7.25px] shrink-0" data-name="Input">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col h-[41.66px] items-start px-[15.494px] py-[11.87px] relative w-full">
          <Container35 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#cccccc] border-solid inset-0 pointer-events-none rounded-[7.25px]" />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0f] text-[14px] w-full">
        <p className="leading-[21px]">Email-Adresse</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="basis-0 bg-white grow h-[41.66px] min-h-px min-w-px relative rounded-[7.25px] shrink-0" data-name="Input">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col h-[41.66px] items-start px-[15.494px] py-[11.87px] relative w-full">
          <Container36 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#cccccc] border-solid inset-0 pointer-events-none rounded-[7.25px]" />
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row justify-center size-full">
        <div className="box-border content-stretch flex gap-[18.11px] items-start justify-center pl-0 pr-[0.01px] py-0 relative w-full">
          <Input />
          <Input1 />
        </div>
      </div>
    </div>
  );
}

function Buttons4() {
  return (
    <div className="bg-[#2e2a2f] relative rounded-[8px] shrink-0 w-full" data-name="Buttons">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[20px] py-[10px] relative w-full">
          <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
            <p className="leading-[28px] whitespace-pre">Sign up now!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormEmailForm3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Form - Email Form 3">
      <Container37 />
      <Buttons4 />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[33.25px] leading-[0] not-italic relative shrink-0 text-[#545457] w-full" data-name="Container">
      <div className="absolute flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[18px] left-0 text-[12px] text-nowrap top-[16.32px] translate-y-[-50%] whitespace-pre">
        <p className="mb-0">Datenschutz: Die peers. UG (haftungsbeschränkt) speichert und verarbeitet</p>
        <p>{`Deine personenbezogenen Daten auf der Grundlage des `}</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[17px] justify-center left-[368.65px] text-[10.9px] top-[24.63px] translate-y-[-50%] w-[3.4px]">
        <p className="leading-[16.63px]">.</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <FormEmailForm3 />
      <Container38 />
    </div>
  );
}

function Container40() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-start pl-0 pr-[80px] py-0 relative w-full">
          <Frame1000007595 />
          <Container39 />
        </div>
      </div>
    </div>
  );
}

function Component653406093Ca73A37601Cc150PeersBloguCc88BersichtNewsletterP800Avif() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="653406093ca73a37601cc150_peers-blogu%CC%88bersicht-newsletter-p-800.avif">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={img653406093Ca73A37601Cc150PeersBloguCc88BersichtNewsletterP800Avif} />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="size-full" />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex h-[350px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container40 />
      <Component653406093Ca73A37601Cc150PeersBloguCc88BersichtNewsletterP800Avif />
    </div>
  );
}

function Section4() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col items-start justify-center px-[100px] py-0 relative shrink-0 w-[1440px]" data-name="Section">
      <NewsletterBlock
        imageUrl={img653406093Ca73A37601Cc150PeersBloguCc88BersichtNewsletterP800Avif}
        imageAlt="Newsletter subscription"
      />
    </div>
  );
}

export default function Component05EquipsLp() {
  return (
    <div className="bg-[#e9ebef] content-stretch flex flex-col items-start relative size-full" data-name="05_Equips_LP">
      <Frame1000007576 />
      <Section />
      <Frame1000007580 />
      <Frame1000007591 />
      <Section1 />
      <Frame1000007585 />
      <Frame1000007587 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}