import svgPaths from "./svg-r8hlu7qgnc";
import imgAvatar from "figma:asset/f8bfdc3dfe2a754ded4c44d82d1518e16a087140.png";
import imgFrame1000007576 from "figma:asset/ec350e2018bda2d47f0402ba62630ee1c724131f.png";
import imgRectangle6552 from "figma:asset/33ab82a4b2f27e9bfed344f5fb487a8cc4269c24.png";
import imgFrame1000007589 from "figma:asset/cb06db12ebd975528638b96c5da71618d983aac7.png";

function Logo() {
  return (
    <div className="h-[50px] relative shrink-0 w-[100px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 50">
        <g id="Logo">
          <g id="Vector">
            <path d={svgPaths.p28d7740} fill="var(--fill-0, black)" />
            <path d={svgPaths.p201d5680} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2febba00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2be28440} fill="var(--fill-0, black)" />
            <path d={svgPaths.p1c12f8f0} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="box-border content-stretch flex flex-col h-[90px] items-start px-0 py-[20px] relative shrink-0" data-name="Link:margin">
      <Logo />
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex gap-[6px] h-[20px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Home</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Buttons2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Assessments</p>
      </div>
    </div>
  );
}

function Buttons3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Equips</p>
      </div>
    </div>
  );
}

function Buttons4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Mood Journal</p>
      </div>
    </div>
  );
}

function Buttons5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Consultation</p>
      </div>
    </div>
  );
}

function Buttons6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[28px] whitespace-pre">Library</p>
      </div>
    </div>
  );
}

function Menubar() {
  return (
    <div className="content-stretch flex gap-[32px] h-[21px] items-center relative shrink-0" data-name="Menubar">
      <Buttons />
      <Buttons1 />
      <Buttons2 />
      <Buttons3 />
      <Buttons4 />
      <Buttons5 />
      <Buttons6 />
    </div>
  );
}

function FullMenuMargin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pl-[48px] pr-0 py-0 relative shrink-0" data-name="full-menu:margin">
      <Menubar />
    </div>
  );
}

function Container() {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <LinkMargin />
      <FullMenuMargin />
    </div>
  );
}

function Buttons7() {
  return (
    <div className="bg-[#ecebf0] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#222222] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Let’s Talk</p>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="AVATAR">
      <img alt="" className="block max-w-none size-full" height="48" src={imgAvatar} width="48" />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex gap-[8.889px] items-center relative shrink-0 size-[48px]">
      <Avatar />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-start flex flex-wrap gap-[16px] items-start relative shrink-0" data-name="Container">
      <Buttons7 />
      <Frame23 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex h-[88px] items-center justify-between relative shrink-0 w-[1352px]" data-name="Container">
      <Container />
      <Container1 />
    </div>
  );
}

function TopNavigation() {
  return (
    <div className="absolute bg-white box-border content-start flex flex-wrap gap-[24px] items-start justify-center left-1/2 px-[24px] py-0 rounded-[12px] top-[18px] translate-x-[-50%]" data-name="Top Navigation">
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container2 />
    </div>
  );
}

function Frame1000007577() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[58px] text-black w-full">
        <p className="leading-[72px]">{`Anxiety and depression test (K10) `}</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center relative shrink-0 text-[#2e2a2f] text-[16px] w-full">
        <p className="leading-[24px]">We’re glad you’re taking the time to check-in on your mental health. Whatever you’re going through, you’re not alone – support is available. Completing the K10 test will help you understand what kind of support you might need right now.</p>
      </div>
    </div>
  );
}

function Buttons8() {
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
      <Buttons8 />
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

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[48px] text-nowrap">
        <p className="leading-[60px] whitespace-pre">Acknowledgements</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">Professor Ronald C Kessler of the Department of Health Care Policy, Harvard Medical School is thanked for the use of research on the K10 funded by US Public Health Service Grants RO1 MH46376, R01 MH52861, RO1 MH49098, and K05 MH00507 and by the John D and Catherine T MacArthur Foundation Network on Successful Midlife Development (Gilbert Brim, Director). There may be a wait before a counsellor is available.</p>
      </div>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[400px]">
      <Heading2 />
      <Margin />
    </div>
  );
}

function Frame1000007579() {
  return (
    <div className="content-stretch flex gap-[80px] items-center relative shrink-0 w-full">
      <Frame40 />
      <div className="basis-0 grow h-[450px] min-h-px min-w-px relative shrink-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-6.42%] max-w-none top-0 w-[106.29%]" src={imgRectangle6552} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007578() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[100px] relative w-full">
          <Frame1000007579 />
        </div>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">What is the anxiety and depression test (K10)?</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px] mb-0">It’s a short test that asks 10 questions about how you’ve been feeling over the past 4 weeks.</p>
        <ul className="css-ed5n1g list-disc mb-0">
          <li className="mb-0 ms-[24px]">
            <span className="leading-[24px]">measure your level of distress</span>
          </li>
          <li className="ms-[24px] whitespace-pre-wrap">
            <span className="leading-[24px]">{`help you find the support that’s right for you.  `}</span>
          </li>
        </ul>
        <p className="leading-[24px] mb-0">Your answers and your result are anonymous. You can decide what you want to do with your result. We’ll give you some recommendations to get you started.</p>
        <p className="leading-[24px]">{`The check-in is an evidence-based assessment known as the K10. It’s commonly used by Australian GPs (doctors) and mental health professionals to understand the level of support you may need. `}</p>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-bl-[40px] rounded-tl-[40px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#d5d5d5] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none rounded-bl-[40px] rounded-tl-[40px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start justify-center px-[100px] py-0 relative w-full">
          <Heading3 />
          <Margin1 />
        </div>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">What will happen after the check-in?</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <ul className="css-ed5n1g list-disc mb-0">
          <li className="mb-0 ms-[24px]">
            <span className="leading-[24px]">Find out what range of distress you fall into, ranging from low to very high</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[24px]">Learn what that means</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[24px]">Get recommendations about what steps to take next</span>
          </li>
          <li className="ms-[24px]">
            <span className="leading-[24px]">Get help to find the support that’s right for you.</span>
          </li>
        </ul>
        <p className="leading-[24px]">We won’t diagnose you with a mental health condition. Only a mental health professional can give you a diagnosis.</p>
      </div>
    </div>
  );
}

function Frame1000007581() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-br-[40px] rounded-tr-[40px] self-stretch shrink-0">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start px-[100px] py-0 relative size-full">
          <Heading4 />
          <Margin2 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007580() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex items-start p-[100px] relative w-full">
          <Frame41 />
          <Frame1000007581 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007588() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-black w-full">
        <p className="leading-[60px]">Ready to answer the first question?</p>
      </div>
    </div>
  );
}

function Buttons9() {
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
      <Buttons9 />
    </div>
  );
}

function Frame1000007589() {
  return (
    <div className="h-[450px] relative rounded-[40px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[40px] size-full" src={imgFrame1000007589} />
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

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">Supporting someone else</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[0px] w-full">
        <p className="leading-[24px] text-[16px]">
          <span>
            {`The Anxiety and Depression Test (K10) is for people to assess their levels of distress. `}
            <br aria-hidden="true" />
            <br aria-hidden="true" />
            {`If you're worried about someone else’s mental health, visit our guide on `}
          </span>
          <a className="[text-underline-position:from-font] cursor-pointer decoration-solid font-['Ubuntu:Regular',_sans-serif] not-italic underline" href="https://www.beyondblue.org.au/get-support/support-someone">
            <span className="[text-underline-position:from-font] decoration-solid leading-[24px]" href="https://www.beyondblue.org.au/get-support/support-someone">
              supporting someone
            </span>
          </a>
          . This page has tips on how you can help them feel supported and seek mental health support and services.
        </p>
      </div>
    </div>
  );
}

function Frame42() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-bl-[40px] rounded-tl-[40px] shrink-0">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start justify-center pl-0 pr-[40px] py-0 relative w-full">
          <Heading5 />
          <Margin3 />
        </div>
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">Your privacy is important to us</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[0px] w-full">
        <p className="leading-[24px] text-[16px] whitespace-pre-wrap">
          <span>
            {`The Anxiety and Depression Test (K10) is anonymous. We don’t ask for your contact details and we don’t use any cookies that remember the answers you provided.  `}
            <br aria-hidden="true" />
            <br aria-hidden="true" />
            We record how many people take the test. We also record the responses for each question and the results pages we displayed. This helps us review its accuracy and improve it over time.
            <br aria-hidden="true" />
            <br aria-hidden="true" />
            {`For more information read our `}
          </span>
          <a className="[text-underline-position:from-font] cursor-pointer decoration-solid font-['Ubuntu:Regular',_sans-serif] not-italic underline" href="https://www.beyondblue.org.au/general/privacy-policy">
            <span className="[text-underline-position:from-font] decoration-solid leading-[24px]" href="https://www.beyondblue.org.au/general/privacy-policy">
              privacy policy
            </span>
          </a>
          <span>{`. `}</span>
        </p>
      </div>
    </div>
  );
}

function Frame1000007582() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-br-[40px] rounded-tr-[40px] self-stretch shrink-0">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start pl-[40px] pr-0 py-0 relative size-full">
          <Heading6 />
          <Margin4 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007591() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex items-start p-[100px] relative w-full">
          <Frame42 />
          <Frame1000007582 />
        </div>
      </div>
    </div>
  );
}

function Frame1000007590() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[1440px]">
      <Frame1000007576 />
      <Frame1000007578 />
      <Frame1000007580 />
      <Frame1000007587 />
      <Frame1000007591 />
    </div>
  );
}

export default function AssesmentLp() {
  return (
    <div className="bg-neutral-100 relative size-full" data-name="Assesment_LP">
      <TopNavigation />
      <Frame1000007590 />
      <TopNavigation />
      <div className="absolute bg-[#3d3d3d] bottom-0 h-[50px] left-1/2 translate-x-[-50%] w-[1440px]" />
    </div>
  );
}