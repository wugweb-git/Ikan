import svgPaths from "./svg-c742suoy8w";
import imgEllipse3 from "figma:asset/873dfd80b1b245e5d1095852dbf807eb3e25aa72.png";

function Section() {
  return <div className="absolute h-0 left-0 top-[1844px] w-[1435px]" data-name="Section" />;
}

function Container() {
  return <div className="absolute h-0 left-[20px] top-[21px] w-[240px]" data-name="Container" />;
}

function Heading() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[30px] tracking-[0.3516px] w-[176px]">
        <p className="leading-[36px]">My Profile</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Paragraph">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[27px] not-italic relative shrink-0 text-[#151515] text-[14px] text-nowrap tracking-[-0.4395px]">Track your journey and see how far have you come.</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <Heading />
      <Paragraph />
    </div>
  );
}

function Buttons() {
  return (
    <div className="bg-[#2e2a2f] content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[27.2px]">Save</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Buttons />
    </div>
  );
}

function Buttons1() {
  return (
    <div className="bg-[#2e2a2f] content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0" data-name="Buttons">
      <div className="flex flex-col font-['Ubuntu:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[27.2px]">{`Delete `}</p>
      </div>
    </div>
  );
}

function Actions() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Actions">
      <Frame />
      <Buttons1 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame2 />
      <Actions />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Frame1 />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2026e800} id="Vector" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p32ab0300} id="Vector_2" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function CardTitle() {
  return (
    <div className="h-[20px] relative shrink-0 w-[817px]" data-name="CardTitle">
      <Icon />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[28px] not-italic text-[#151515] text-[16px] text-nowrap top-[1.5px] tracking-[-0.3125px]">Profile Information</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_583_1649)" id="Icon">
          <path d={svgPaths.p3f699600} id="Vector" stroke="var(--stroke-0, #151515)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.28" />
        </g>
        <defs>
          <clipPath id="clip0_583_1649">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Remove() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center left-[calc(50%+30.27px)] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Remove">
      <Icon1 />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[21px]">Remove</p>
      </div>
    </div>
  );
}

function Update() {
  return (
    <div className="absolute content-stretch flex items-start left-[114px] pl-[12px] pr-[13.266px] py-[6px] rounded-[40px] top-[29px]" data-name="Update">
      <div aria-hidden="true" className="absolute border border-[#151515] border-solid inset-0 pointer-events-none rounded-[40px]" />
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-center text-nowrap">
        <p className="leading-[21px]">Update</p>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="absolute bottom-0 left-0 overflow-clip rounded-[45px] top-0 w-[90px]" data-name="Image">
      <div className="absolute left-1/2 size-[80px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <img alt="" className="block max-w-none size-full" height="80" src={imgEllipse3} width="80" />
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="absolute h-[90px] left-0 top-0 w-[423px]" data-name="Avatar">
      <Remove />
      <Update />
      <Image />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="h-[90px] relative shrink-0 w-full" data-name="UserAvatar">
      <Avatar />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Full Name</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Text Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">Alex Johnson</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p399eca00} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pc93b400} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <TextInput />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container3 />
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Email Address</p>
    </div>
  );
}

function EmailInput() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Email Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">demo1@ikan.com</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1db90b80} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <EmailInput />
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Container6 />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Phone Number</p>
    </div>
  );
}

function PhoneInput() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Phone Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">+1 (555) 100-0001</p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_583_1737)" id="Icon">
          <path d={svgPaths.p26187580} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_583_1737">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <PhoneInput />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <Container9 />
    </div>
  );
}

function Label3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Bio</p>
    </div>
  );
}

function Textarea() {
  return (
    <div className="bg-white h-[48px] opacity-50 relative rounded-[12px] shrink-0 w-full" data-name="Textarea">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start px-[12px] py-[8px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">Tell us about yourself...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d1d5db] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[76px] items-start relative shrink-0 w-full" data-name="Container">
      <Label3 />
      <Textarea />
    </div>
  );
}

function AccountDetailsSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[361px] items-start relative shrink-0 w-full" data-name="AccountDetailsSection">
      <Container4 />
      <Container7 />
      <Container10 />
      <Container11 />
    </div>
  );
}

function CardContent() {
  return (
    <div className="relative shrink-0 w-full" data-name="CardContent">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start px-[24px] py-0 relative w-full">
          <UserAvatar />
          <AccountDetailsSection />
        </div>
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[30px] items-center left-0 px-px py-[25px] rounded-[16px] top-0 w-[867px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <CardTitle />
      <CardContent />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_583_1652)" id="Icon">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p35ba4680} id="Vector_2" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3dfd2600} id="Vector_3" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_583_1652">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CardTitle1() {
  return (
    <div className="absolute h-[20px] left-[24px] top-[24px] w-[817px]" data-name="CardTitle">
      <Icon5 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[28px] not-italic text-[#151515] text-[16px] text-nowrap top-[1.5px] tracking-[-0.3125px]">Personal Details</p>
    </div>
  );
}

function Label4() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Date of Birth</p>
    </div>
  );
}

function DatePicker() {
  return <div className="absolute bg-[#f5f5f5] h-[48px] left-px rounded-[12px] top-px w-[398.5px]" data-name="Date Picker" />;
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_583_1717)" id="Icon">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p11f26280} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 11.3333H8.00667" id="Vector_3" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_583_1717">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon6 />
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <DatePicker />
      <Container12 />
    </div>
  );
}

function Container14() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[8px] items-start place-self-stretch relative shrink-0" data-name="Container">
      <Label4 />
      <Container13 />
    </div>
  );
}

function Label5() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Gender</p>
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="h-[22.852px] relative shrink-0 w-[101.172px]" data-name="Primitive.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22.857px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Select gender</p>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon" opacity="0.5">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="bg-white h-[48px] opacity-50 relative rounded-[12px] shrink-0 w-full" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[#d1d5db] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.5px] py-[1.5px] relative size-full">
          <PrimitiveSpan />
          <Icon7 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="[grid-area:1_/_2] content-stretch flex flex-col gap-[8px] items-start place-self-stretch relative shrink-0" data-name="Container">
      <Label5 />
      <PrimitiveButton />
    </div>
  );
}

function AccountDetailsSection1() {
  return (
    <div className="gap-[16px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[78px] relative shrink-0 w-full" data-name="AccountDetailsSection">
      <Container14 />
      <Container15 />
    </div>
  );
}

function Label6() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Location</p>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Text Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">City, Country</p>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p14548f00} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17781bc0} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon8 />
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <TextInput1 />
      <Container16 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label6 />
      <Container17 />
    </div>
  );
}

function CardContent1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[197px] items-start left-0 px-[24px] py-0 top-[74px] w-[865px]" data-name="CardContent">
      <AccountDetailsSection1 />
      <Container18 />
    </div>
  );
}

function Card1() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[273px] left-[2px] rounded-[16px] top-[869px] w-[867px]" data-name="Card">
      <CardTitle1 />
      <CardContent1 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_583_1671)" id="Icon">
          <path d={svgPaths.p28f08480} id="Vector" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_583_1671">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CardTitle2() {
  return (
    <div className="absolute h-[20px] left-[24px] top-[24px] w-[817px]" data-name="CardTitle">
      <Icon9 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[28px] not-italic text-[#151515] text-[16px] text-nowrap top-[1.5px] tracking-[-0.3125px]">Emergency Contact</p>
    </div>
  );
}

function Label7() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Contact Name</p>
    </div>
  );
}

function TextInput2() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Text Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">Full name</p>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p399eca00} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pc93b400} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon10 />
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <TextInput2 />
      <Container19 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label7 />
      <Container20 />
    </div>
  );
}

function Label8() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Contact Phone</p>
    </div>
  );
}

function PhoneInput1() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Phone Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">Phone number</p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_583_1737)" id="Icon">
          <path d={svgPaths.p26187580} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_583_1737">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon11 />
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <PhoneInput1 />
      <Container22 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label8 />
      <Container23 />
    </div>
  );
}

function Label9() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Relationship</p>
    </div>
  );
}

function TextInput3() {
  return (
    <div className="absolute bg-[#f5f5f5] content-stretch flex h-[48px] items-center left-px overflow-clip pl-[40px] pr-[12px] py-[12px] rounded-[12px] top-px w-[815px]" data-name="Text Input">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[16px] text-nowrap tracking-[-0.3125px]">e.g., Spouse, Parent, Sibling</p>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p32887f80} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1a837050} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1f197700} id="Vector_3" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3694d280} id="Vector_4" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-px pl-[12px] pr-0 py-0 top-px w-[28px]" data-name="Container">
      <Icon12 />
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-[#f5f5f5] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <TextInput3 />
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[79px] items-start relative shrink-0 w-full" data-name="Container">
      <Label9 />
      <Container26 />
    </div>
  );
}

function CardContent2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[293px] items-start left-0 px-[24px] py-0 top-[74px] w-[865px]" data-name="CardContent">
      <Container21 />
      <Container24 />
      <Container27 />
    </div>
  );
}

function Card2() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[369px] left-[3px] rounded-[16px] top-[1159px] w-[867px]" data-name="Card">
      <CardTitle2 />
      <CardContent2 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="absolute left-0 size-[20px] top-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_583_1748)" id="Icon">
          <path d={svgPaths.p3e3bd900} id="Vector" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p384cc000} id="Vector_2" stroke="var(--stroke-0, #2A2A2A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_583_1748">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CardTitle3() {
  return (
    <div className="absolute h-[20px] left-[24px] top-[24px] w-[817px]" data-name="CardTitle">
      <Icon13 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[28px] not-italic text-[#151515] text-[16px] text-nowrap top-[1.5px] tracking-[-0.3125px]">Connected Accounts</p>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p30690780} fill="var(--fill-0, #4285F4)" id="Vector" />
          <path d={svgPaths.p9890e00} fill="var(--fill-0, #34A853)" id="Vector_2" />
          <path d={svgPaths.p37f2d600} fill="var(--fill-0, #FBBC05)" id="Vector_3" />
          <path d={svgPaths.p3b476700} fill="var(--fill-0, #EA4335)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-[#f0f0f0] relative rounded-[12px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon14 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Google</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#717182] text-[12px] text-nowrap top-px">Not connected</p>
    </div>
  );
}

function Container29() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[40px] relative shrink-0 w-[135.727px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container28 />
        <Container29 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[24px] relative shrink-0 w-[62.758px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[31px] not-italic text-[#2a2a2a] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Connect</p>
      </div>
    </div>
  );
}

function ButtonSecondary() {
  return (
    <div className="bg-[#e9ebef] h-[48px] relative rounded-[6px] shrink-0 w-[240px]" data-name="ButtonSecondary">
      <div aria-hidden="true" className="absolute border-4 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[4px] pr-[4.008px] py-[4px] relative size-full">
        <Text />
      </div>
    </div>
  );
}

function AccountDetailsSection2() {
  return (
    <div className="content-stretch flex h-[73px] items-center justify-between pb-px pt-0 px-0 relative shrink-0 w-full" data-name="AccountDetailsSection">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <Container30 />
      <ButtonSecondary />
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_583_1767)" id="Icon">
          <path d={svgPaths.p72dbc10} fill="var(--fill-0, #0A66C2)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_583_1767">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-[#f0f0f0] relative rounded-[12px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon15 />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#151515] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">LinkedIn</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#717182] text-[12px] text-nowrap top-px">Not connected</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph3 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[40px] relative shrink-0 w-[135.727px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Container31 />
        <Container32 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[62.758px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[31px] not-italic text-[#2a2a2a] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Connect</p>
      </div>
    </div>
  );
}

function ButtonSecondary1() {
  return (
    <div className="bg-[#e9ebef] h-[48px] relative rounded-[6px] shrink-0 w-[240px]" data-name="ButtonSecondary">
      <div aria-hidden="true" className="absolute border-4 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[4px] pr-[4.008px] py-[4px] relative size-full">
        <Text1 />
      </div>
    </div>
  );
}

function AccountDetailsSection3() {
  return (
    <div className="content-stretch flex h-[72px] items-center justify-between relative shrink-0 w-full" data-name="AccountDetailsSection">
      <Container33 />
      <ButtonSecondary1 />
    </div>
  );
}

function CardContent3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[185px] items-start left-0 px-[24px] py-0 top-[74px] w-[865px]" data-name="CardContent">
      <AccountDetailsSection2 />
      <AccountDetailsSection3 />
    </div>
  );
}

function Card3() {
  return (
    <div className="absolute bg-white border border-[rgba(0,0,0,0.1)] border-solid h-[261px] left-px rounded-[16px] top-[591px] w-[867px]" data-name="Card">
      <CardTitle3 />
      <CardContent3 />
    </div>
  );
}

function AccountDetailsSection4() {
  return (
    <div className="h-[1692px] relative shrink-0 w-[866px]" data-name="AccountDetailsSection">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[1823px] items-start left-[294px] top-[141px] w-[867px]" data-name="Container">
      <Container1 />
      <AccountDetailsSection4 />
    </div>
  );
}

function AppContent() {
  return (
    <div className="bg-[#f5f5f5] h-[1844px] relative shrink-0 w-[1435px]" data-name="AppContent">
      <Section />
      <Container />
      <Container34 />
    </div>
  );
}

function AppContent1() {
  return (
    <div className="absolute bg-white h-px left-0 top-0 w-[1435px]" data-name="AppContent">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Vector() {
  return (
    <div className="absolute contents inset-0" data-name="Vector">
      <div className="absolute inset-[0_49.59%_0_0]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50.4053 50">
          <path d={svgPaths.p28d7740} fill="var(--fill-0, #2A2A2A)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[34.63%_38.37%_35.42%_58.83%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.7933 14.9792">
          <path d={svgPaths.p29523bc0} fill="var(--fill-0, #2A2A2A)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[35%_23.11%_35.42%_64.73%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.1602 14.7917">
          <path d={svgPaths.p3da71600} fill="var(--fill-0, #2A2A2A)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[41.83%_11.43%_34.92%_77.53%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0472 11.625">
          <path d={svgPaths.p2bcf8700} fill="var(--fill-0, #2A2A2A)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[41.83%_0_35.42%_90.32%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.682 11.375">
          <path d={svgPaths.p3de12800} fill="var(--fill-0, #2A2A2A)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute contents inset-0" data-name="Logo">
      <Vector />
    </div>
  );
}

function Icon16() {
  return (
    <div className="h-[50px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Logo />
    </div>
  );
}

function LogoFull() {
  return (
    <div className="absolute content-stretch flex flex-col h-[50px] items-start left-0 top-0 w-[100px]" data-name="LogoFull">
      <Icon16 />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[50px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <LogoFull />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-center left-[190.33px] px-[16px] py-[8px] rounded-[12px] top-0 w-[113.031px]" data-name="Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Dashboard</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-center left-[307.36px] px-[16px] py-[8px] rounded-[12px] top-0 w-[133.477px]" data-name="Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Mood Journal</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-center left-[444.84px] px-[16px] py-[8px] rounded-[12px] top-0 w-[122.375px]" data-name="Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Assessment</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-center left-[571.21px] px-[16px] py-[8px] rounded-[12px] top-0 w-[73.758px]" data-name="Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Equip</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-center left-[648.97px] px-[16px] py-[8px] rounded-[12px] top-0 w-[101.563px]" data-name="Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Resource</p>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-center left-[754.53px] px-[16px] py-[8px] rounded-[12px] top-0 w-[125.992px]" data-name="Button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap tracking-[-0.3125px]">Consultation</p>
    </div>
  );
}

function Navigation() {
  return (
    <div className="basis-0 grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button1 />
        <Button2 />
        <Button3 />
        <Button4 />
        <Button5 />
        <Button6 />
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute bg-[#f0f0f0] content-stretch flex h-[48px] items-center justify-center left-0 px-[20px] py-[10px] rounded-[12px] top-0 w-[110.148px]" data-name="Button">
      <p className="font-['Ubuntu:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#151515] text-[16px] text-center text-nowrap">{`Let's Talk`}</p>
    </div>
  );
}

function ImageUserAvatar() {
  return <div className="h-[46px] shrink-0 w-full" data-name="Image (User Avatar)" />;
}

function Button8() {
  return (
    <div className="absolute left-[126.15px] rounded-[1.67772e+07px] size-[48px] top-0" data-name="Button">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <ImageUserAvatar />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[48px] relative shrink-0 w-[174.148px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button7 />
        <Button8 />
      </div>
    </div>
  );
}

function TopNavBar() {
  return (
    <div className="absolute bg-white content-stretch flex h-[88px] items-center justify-between left-[20px] px-[25px] py-px rounded-[12px] top-[20px] w-[1395px]" data-name="TopNavBar">
      <div aria-hidden="true" className="absolute border border-[#d1d5db] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Button />
      <Navigation />
      <Container35 />
    </div>
  );
}

function Icon17() {
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

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon17 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[168px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">Account</p>
      <Container36 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[18px] left-[20px] top-[8px] w-[64.484px]" data-name="Heading 3">
      <Frame5 />
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

function Container37() {
  return (
    <div className="h-[17px] relative shrink-0 w-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconProfile />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[28px] relative shrink-0 w-[42.625px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[21px] not-italic text-[14px] text-center text-nowrap text-white top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Profile</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container37 />
          <Paragraph5 />
        </div>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[#2a2a2a] h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container38 />
        </div>
      </div>
    </div>
  );
}

function Icon18() {
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

function Container39() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon18 />
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[28px] relative shrink-0 w-[64.813px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[32px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Payments</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container39 />
          <Paragraph6 />
        </div>
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container40 />
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

function Container41() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconCorporate />
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[28px] relative shrink-0 w-[66.828px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[33.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Corporate</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container41 />
          <Paragraph7 />
        </div>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container42 />
        </div>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[38px] w-[198px]" data-name="Container">
      <Button9 />
      <Button10 />
      <Button11 />
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[204px] relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading1 />
        <Container43 />
      </div>
    </div>
  );
}

function Icon19() {
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

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon19 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[177px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">SETTINGS</p>
      <Container45 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[18px] left-[17px] top-0 w-[91.867px]" data-name="Heading 3">
      <Frame4 />
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

function Container46() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconPreferences />
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[28px] relative shrink-0 w-[79.602px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[40px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Preferences</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container46 />
          <Paragraph8 />
        </div>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container47 />
        </div>
      </div>
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

function Container48() {
  return (
    <div className="h-[15px] relative shrink-0 w-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconNotifications />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[28px] relative shrink-0 w-[84px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[42px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Notifications</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container48 />
          <Paragraph9 />
        </div>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container49 />
        </div>
      </div>
    </div>
  );
}

function Icon20() {
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

function Container50() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon20 />
      </div>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[28px] relative shrink-0 w-[48.492px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Privacy</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container50 />
          <Paragraph10 />
        </div>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[50px] items-start p-px relative rounded-[12px] shrink-0 w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container51 />
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

function Container52() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconSecurity />
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[28px] relative shrink-0 w-[54.773px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[27.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Security</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container52 />
          <Paragraph11 />
        </div>
      </div>
    </div>
  );
}

function Button15() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[50px] items-start p-px relative rounded-[12px] shrink-0 w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container53 />
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[30px] w-[198px]" data-name="Container">
      <Button12 />
      <Button13 />
      <Button14 />
      <Button15 />
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[254px] relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading2 />
        <Container54 />
      </div>
    </div>
  );
}

function Icon21() {
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

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[14px]" data-name="Container">
      <Icon21 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 top-px w-[171px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#717182] text-[12px] text-nowrap tracking-[0.6px] uppercase">Support</p>
      <Container56 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute h-[18px] left-[16px] top-0 w-[61.523px]" data-name="Heading 3">
      <Frame3 />
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

function Container57() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconFaQs />
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[28px] relative shrink-0 w-[34.656px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[20px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">About</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container57 />
          <Paragraph12 />
        </div>
      </div>
    </div>
  );
}

function Button16() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container58 />
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

function Container59() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconFaQs1 />
      </div>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[28px] relative shrink-0 w-[34.656px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[17.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">FAQs</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container59 />
          <Paragraph13 />
        </div>
      </div>
    </div>
  );
}

function Button17() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container60 />
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

function Container61() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconHelp />
      </div>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[28px] relative shrink-0 w-[62.555px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[31px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">{`Let's Talk`}</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container61 />
          <Paragraph14 />
        </div>
      </div>
    </div>
  );
}

function Button18() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <Container62 />
        </div>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-[30px] w-[198px]" data-name="Container">
      <Button16 />
      <Button17 />
      <Button18 />
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[196px] relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Heading3 />
        <Container63 />
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

function Icon22() {
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

function Container65() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Icon22 />
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[34px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-0 relative size-full">
          <Heading4 />
          <Container65 />
        </div>
      </div>
    </div>
  );
}

function Icon23() {
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

function Container67() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon23 />
      </div>
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="h-[28px] relative shrink-0 w-[91.742px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[46px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Privacy Policy</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container67 />
          <Paragraph15 />
        </div>
      </div>
    </div>
  );
}

function Button19() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-0 w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container68 />
    </div>
  );
}

function Icon24() {
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

function Container69() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon24 />
      </div>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[28px] relative shrink-0 w-[129.156px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[65px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">{`Terms & Conditions`}</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container69 />
          <Paragraph16 />
        </div>
      </div>
    </div>
  );
}

function Button20() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[58px] w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container70 />
    </div>
  );
}

function Icon25() {
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

function Container71() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon25 />
      </div>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[28px] relative shrink-0 w-[87.375px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[44.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Return Policy</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container71 />
          <Paragraph17 />
        </div>
      </div>
    </div>
  );
}

function Button21() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[116px] w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container72 />
    </div>
  );
}

function Icon26() {
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

function Container73() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon26 />
      </div>
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="h-[28px] relative shrink-0 w-[125.086px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[63.5px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Cancellation Policy</p>
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-0 py-0 relative size-full">
          <Container73 />
          <Paragraph18 />
        </div>
      </div>
    </div>
  );
}

function Button22() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[50px] items-start left-0 p-px rounded-[12px] top-[174px] w-[198px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container74 />
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[224px] relative shrink-0 w-full" data-name="Container">
      <Button19 />
      <Button20 />
      <Button21 />
      <Button22 />
    </div>
  );
}

function Container76() {
  return (
    <div className="relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Container66 />
        <Container75 />
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

function Container77() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <IconLogOut />
      </div>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="h-[28px] relative shrink-0 w-[49.719px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[25px] not-italic text-[#151515] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%]">Log out</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[48px] items-center left-px pl-[20px] pr-0 py-0 top-px w-[196px]" data-name="Container">
      <Container77 />
      <Paragraph19 />
    </div>
  );
}

function Button23() {
  return (
    <div className="bg-white h-[50px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container78 />
    </div>
  );
}

function Container79() {
  return (
    <div className="relative shrink-0 w-[198px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pt-[17px] px-0 relative w-full">
        <Button23 />
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="relative shrink-0 w-[198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative w-full">
        <Container44 />
        <Container55 />
        <Container64 />
        <Container76 />
        <Container79 />
      </div>
    </div>
  );
}

function SideNavAccount() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-[20px] pl-[21px] pr-px py-[21px] rounded-[16px] top-[122px] w-[240px]" data-name="SideNavAccount">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]" />
      <Container80 />
    </div>
  );
}

export default function Ikan() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex gap-[10px] items-center relative size-full" data-name="Ikan">
      <AppContent />
      <AppContent1 />
      <TopNavBar />
      <SideNavAccount />
    </div>
  );
}