import imgFrame1000007576 from "figma:asset/ec350e2018bda2d47f0402ba62630ee1c724131f.png";

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

export default function Frame1000007576() {
  return (
    <div className="relative rounded-bl-[80px] rounded-br-[80px] size-full">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-bl-[80px] rounded-br-[80px] size-full" src={imgFrame1000007576} />
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center px-[100px] py-[296px] relative size-full">
          <Frame1000007575 />
        </div>
      </div>
    </div>
  );
}