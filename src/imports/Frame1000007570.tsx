import svgPaths from "./svg-55emdlatj0";
import imgFrame1000007497 from "figma:asset/979cc1419b3348d67eec508265b8b79532e682a0.png";
import imgRectangle9 from "figma:asset/e14b378ba443955238f6e52a608bb6cfa341e5d8.png";
import imgRectangle10 from "figma:asset/33be9701c78a44f54392cf1bfcc20d8f8f00cd9d.png";
import imgRectangle11 from "figma:asset/2576c36c768010586aefac2ca3b21e8a5e123bd0.png";
import imgRectangle12 from "figma:asset/7668a3f1aed73fe6b7f00cdfdff2bb0eeddb5186.png";
import imgRectangle13 from "figma:asset/2538bf9854b969adcd4c598d1477955b454f6b1a.png";

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div 
        className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#251b4e] text-[48px] text-nowrap"
        style={{
          fontFamily: 'var(--font-family-base)',
          fontWeight: 'var(--font-weight-bold)'
        }}
      >
        <p className="leading-[60px] whitespace-pre">Health Assessments</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div 
      className="box-border content-stretch flex flex-col items-start pb-0 px-0 relative shrink-0 w-full" 
      data-name="Margin"
      style={{ paddingTop: 'var(--spacing-1)' }} // 4px (closest to 5px)
    >
      <div 
        className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] w-full"
        style={{
          fontFamily: 'var(--font-family-base)',
          fontWeight: 'var(--font-weight-regular)'
        }}
      >
        <p className="leading-[24px]">Gain insight into your mental and emotional health and find ways to support yourself</p>
      </div>
    </div>
  );
}

function Frame1000007496() {
  return (
    <div 
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      style={{ gap: 'var(--spacing-2)' }} // 8px (closest to 6px)
    >
      <Heading2 />
      <Margin />
    </div>
  );
}

function Frame1000007493() {
  return (
    <div 
      className="content-stretch flex flex-col items-start relative shrink-0 w-[500px]"
      style={{ gap: 'var(--spacing-6)' }} // 24px
    >
      <Frame1000007496 />
    </div>
  );
}

function Frame1000007497() {
  return (
    <div className="relative rounded-[16px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[16px]">
        <div className="absolute bg-[#e5e2f1] inset-0 rounded-[16px]" />
        <div className="absolute inset-0 overflow-hidden rounded-[16px]">
          <img alt="" className="absolute h-[221.48%] left-[33.62%] max-w-none top-[-25.86%] w-[67.25%]" src={imgFrame1000007497} />
        </div>
        <div className="absolute bg-gradient-to-r from-[#ffffff] from-[37.016%] inset-0 rounded-[16px] to-[73.226%] to-[rgba(255,255,255,0)]" />
      </div>
      <div className="size-full">
        <div 
          className="box-border content-stretch flex flex-col items-start relative w-full"
          style={{
            gap: 'var(--spacing-3)', // 12px (closest to 10px)
            paddingLeft: 'calc(var(--spacing-8) + var(--spacing-2))', // 40px (32px + 8px)
            paddingRight: 'calc(var(--spacing-8) + var(--spacing-2))', // 40px (32px + 8px)
            paddingTop: 'calc(var(--spacing-6) * 2.5)', // 60px
            paddingBottom: 'calc(var(--spacing-6) * 2.5)' // 60px
          }}
        >
          <Frame1000007493 />
        </div>
      </div>
    </div>
  );
}

function Buttons() {
  return (
    <div 
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-end left-0 top-0 w-[512px]" 
      data-name="Buttons"
      style={{
        gap: 'var(--spacing-2)', // 8px
        paddingLeft: 'calc(var(--spacing-6) * 2.5)', // 60px
        paddingRight: 'calc(var(--spacing-6) * 2.5)', // 60px
        paddingTop: 'var(--spacing-3)', // 12px (closest to 10px)
        paddingBottom: 'var(--spacing-3)', // 12px (closest to 10px)
        borderRadius: 'var(--radius-lg)' // 16px
      }}
    >
      <div 
        aria-hidden="true" 
        className="absolute border-[5px] border-neutral-100 border-solid inset-[-5px] pointer-events-none"
        style={{ borderRadius: 'calc(var(--radius-lg) + var(--spacing-1))' }} // 21px (16px + 5px)
      />
      <div 
        className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)' }}
      >
        <p className="leading-[21px] whitespace-pre">Assessment Catalogue</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div 
      className="absolute bg-[#2e2a2f] box-border content-stretch flex items-center left-0 top-0" 
      data-name="Buttons"
      style={{
        gap: 'var(--spacing-2)', // 8px
        paddingLeft: 'calc(var(--spacing-6) * 2.5)', // 60px
        paddingRight: 'calc(var(--spacing-6) * 2.5)', // 60px
        paddingTop: 'var(--spacing-3)', // 12px (closest to 10px)
        paddingBottom: 'var(--spacing-3)', // 12px (closest to 10px)
        borderRadius: 'var(--radius-lg)' // 16px
      }}
    >
      <div 
        className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)' }}
      >
        <p className="leading-[21px] whitespace-pre">My Assessment History</p>
      </div>
    </div>
  );
}

function Frame1000007411() {
  return (
    <div className="h-[41px] relative shrink-0 w-[512px]">
      <Buttons />
      <Buttons1 />
    </div>
  );
}

function Frame1000007569() {
  return (
    <div 
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      style={{ gap: 'calc(var(--spacing-8) + var(--spacing-1))' }} // 36px (closest to 35px)
    >
      <Frame1000007497 />
      <Frame1000007411 />
    </div>
  );
}

function Frame28() {
  return (
    <div 
      className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full"
      style={{ gap: 'var(--spacing-2)' }} // 8px
    >
      <div 
        className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap w-full"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)' }}
      >
        <p className="[white-space-collapse:collapse] leading-[21px] overflow-ellipsis overflow-hidden">TITLE</p>
      </div>
      <div 
        className="flex flex-col justify-center relative shrink-0 text-[#151515] text-[28px] w-full"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-bold)' }}
      >
        <p className="leading-[42px]">Adult Therapy</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div 
      className="content-stretch flex items-center justify-center relative shrink-0 w-full"
      style={{ gap: 'var(--spacing-3)' }} // 12px (closest to 10px)
    >
      <div 
        className="basis-0 flex flex-col grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#757575] text-[16px]"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)' }}
      >
        <p className="leading-[24px]">Talk to a trained therapist who helps you make sense of things and feel more in control, one session at a time.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame29 />
    </div>
  );
}

function Frame1000007571() {
  return (
    <div 
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      style={{ gap: 'var(--spacing-3)' }} // 12px
    >
      <Frame28 />
      <Container />
    </div>
  );
}

function Approval1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="approval 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="approval 1">
          <path d={svgPaths.p2cdeb7c0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Info() {
  return (
    <div 
      className="content-stretch flex items-center justify-center relative shrink-0" 
      data-name="Info"
      style={{ gap: 'var(--spacing-2)' }} // 8px (closest to 6px)
    >
      <Approval1 />
      <div 
        className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)' }}
      >
        <p className="leading-[18px] whitespace-pre">5 min Quiz</p>
      </div>
    </div>
  );
}

function Buttons2() {
  return (
    <div 
      className="bg-[#ecebf0] box-border content-stretch flex items-center relative shrink-0" 
      data-name="Buttons"
      style={{
        gap: 'var(--spacing-2)', // 8px
        paddingLeft: 'var(--spacing-5)', // 20px
        paddingRight: 'var(--spacing-5)', // 20px
        paddingTop: 'var(--spacing-3)', // 12px (closest to 10px)
        paddingBottom: 'var(--spacing-3)', // 12px (closest to 10px)
        borderRadius: 'var(--radius-sm)' // 8px
      }}
    >
      <div 
        className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap"
        style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)' }}
      >
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div 
      className="content-stretch flex flex-col items-end relative shrink-0"
      style={{ gap: 'var(--spacing-6)' }} // 24px
    >
      <Info />
      <Buttons2 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <div className="relative rounded-[10px] shrink-0 size-[148px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle9} />
      </div>
      <Frame26 />
    </div>
  );
}

function AssessmentCard() {
  return (
    <div 
      className="[grid-area:1_/_1] bg-white relative shrink-0" 
      data-name="Assessment Card"
      style={{ borderRadius: 'var(--radius-md)' }} // 12px (closest to 10px)
    >
      <div className="size-full">
        <div 
          className="box-border content-stretch flex flex-col items-start justify-between relative size-full"
          style={{ padding: 'var(--spacing-6)' }} // 24px
        >
          <Frame1000007571 />
          <Frame27 />
        </div>
      </div>
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap w-full">
        <p className="[white-space-collapse:collapse] leading-[21px] overflow-ellipsis overflow-hidden">TITLE</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[#151515] text-[28px] w-full">
        <p className="leading-[42px]">Adult Psychiatry</p>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-['Ubuntu:Regular',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#757575] text-[16px]">
        <p className="leading-[24px]">Meet with a psychiatrist who helps with sleep, focus, energy, or mood and finds the right medication, if needed.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame31 />
    </div>
  );
}

function Frame1000007572() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame30 />
      <Container1 />
    </div>
  );
}

function Approval2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="approval 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="approval 1">
          <path d={svgPaths.p2cdeb7c0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Info1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Approval2 />
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap">
        <p className="leading-[18px] whitespace-pre">5 min Quiz</p>
      </div>
    </div>
  );
}

function Buttons3() {
  return (
    <div className="bg-[#ecebf0] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-end relative shrink-0">
      <Info1 />
      <Buttons3 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <div className="relative rounded-[10px] shrink-0 size-[148px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle10} />
      </div>
      <Frame32 />
    </div>
  );
}

function AssessmentCard1() {
  return (
    <div className="[grid-area:1_/_2] bg-white h-[401px] relative rounded-[10px] shrink-0" data-name="Assessment Card">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[401px] items-start justify-between p-[24px] relative w-full">
          <Frame1000007572 />
          <Frame33 />
        </div>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap w-full">
        <p className="[white-space-collapse:collapse] leading-[21px] overflow-ellipsis overflow-hidden">TITLE</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[42px] relative shrink-0 text-[#151515] text-[28px] w-full">
        <p className="mb-0">Hospital Care</p>
        <p>&nbsp;</p>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-['Ubuntu:Regular',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#757575] text-[16px]">
        <p className="leading-[24px]">Designed for acute mental health needs, with 24/7 support and a multi-disciplinary team that supports you.</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame35 />
    </div>
  );
}

function Frame1000007573() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame34 />
      <Container2 />
    </div>
  );
}

function Approval3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="approval 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="approval 1">
          <path d={svgPaths.p2cdeb7c0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Info2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Approval3 />
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap">
        <p className="leading-[18px] whitespace-pre">5 min Quiz</p>
      </div>
    </div>
  );
}

function Buttons4() {
  return (
    <div className="bg-[#ecebf0] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-end relative shrink-0">
      <Info2 />
      <Buttons4 />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <div className="relative rounded-[10px] shrink-0 size-[148px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle11} />
      </div>
      <Frame36 />
    </div>
  );
}

function AssessmentCard2() {
  return (
    <div className="[grid-area:1_/_3] bg-white h-[401px] relative rounded-[10px] shrink-0" data-name="Assessment Card">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[401px] items-start justify-between p-[24px] relative w-full">
          <Frame1000007573 />
          <Frame37 />
        </div>
      </div>
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap w-full">
        <p className="[white-space-collapse:collapse] leading-[21px] overflow-ellipsis overflow-hidden">TITLE</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[#151515] text-[28px] w-full">
        <p className="leading-[42px]">{`Child & Youth Mental Health`}</p>
      </div>
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-['Ubuntu:Regular',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#757575] text-[16px]">
        <p className="leading-[24px]">{`A highly-curated selection of only the healthiest snacks, pantry staples, and state-of-the-art supplements.pantry staples, `}</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame39 />
    </div>
  );
}

function Frame1000007574() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame38 />
      <Container3 />
    </div>
  );
}

function Approval4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="approval 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="approval 1">
          <path d={svgPaths.p2cdeb7c0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Info3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Approval4 />
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap">
        <p className="leading-[18px] whitespace-pre">5 min Quiz</p>
      </div>
    </div>
  );
}

function Buttons5() {
  return (
    <div className="bg-[#ecebf0] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-end relative shrink-0">
      <Info3 />
      <Buttons5 />
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <div className="relative rounded-[10px] shrink-0 size-[148px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[10px]">
          <img alt="" className="absolute h-[114.86%] left-[-39.94%] max-w-none top-[-7.43%] w-[179.88%]" src={imgRectangle12} />
        </div>
      </div>
      <Frame40 />
    </div>
  );
}

function AssessmentCard3() {
  return (
    <div className="[grid-area:2_/_1] bg-white h-[401px] relative rounded-[10px] shrink-0" data-name="Assessment Card">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[401px] items-start justify-between p-[24px] relative w-full">
          <Frame1000007574 />
          <Frame41 />
        </div>
      </div>
    </div>
  );
}

function Frame42() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap w-full">
        <p className="[white-space-collapse:collapse] leading-[21px] overflow-ellipsis overflow-hidden">TITLE</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[#151515] text-[28px] w-full">
        <p className="leading-[42px]">Supportive Community</p>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="basis-0 flex flex-col font-['Ubuntu:Regular',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#757575] text-[16px]">
        <p className="leading-[24px]">Join a safe, moderated space where people share what they’re going through and support each other with kindness.</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Frame43 />
    </div>
  );
}

function Frame1000007575() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame42 />
      <Container4 />
    </div>
  );
}

function Approval5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="approval 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="approval 1">
          <path d={svgPaths.p2cdeb7c0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Info4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Info">
      <Approval5 />
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[12px] text-center text-nowrap">
        <p className="leading-[18px] whitespace-pre">5 min Quiz</p>
      </div>
    </div>
  );
}

function Buttons6() {
  return (
    <div className="bg-[#ecebf0] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Take Assesment</p>
      </div>
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-end relative shrink-0">
      <Info4 />
      <Buttons6 />
    </div>
  );
}

function Frame45() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <div className="relative rounded-[10px] shrink-0 size-[148px]">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgRectangle13} />
      </div>
      <Frame44 />
    </div>
  );
}

function AssessmentCard4() {
  return (
    <div className="[grid-area:2_/_2] bg-white h-[401px] relative rounded-[10px] shrink-0" data-name="Assessment Card">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[401px] items-start justify-between p-[24px] relative w-full">
          <Frame1000007575 />
          <Frame45 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007412() {
  return (
    <div 
      className="grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[826px] relative shrink-0 w-full"
      style={{ gap: 'var(--spacing-6)' }} // 24px
    >
      <AssessmentCard />
      <AssessmentCard1 />
      <AssessmentCard2 />
      <AssessmentCard3 />
      <AssessmentCard4 />
    </div>
  );
}

export default function Frame1000007570() {
  return (
    <div className="relative size-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[39px] items-start p-[100px] relative size-full">
          <Frame1000007569 />
          <Frame1000007412 />
        </div>
      </div>
    </div>
  );
}