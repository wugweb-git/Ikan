import imgFrame1000007589 from "figma:asset/cb06db12ebd975528638b96c5da71618d983aac7.png";

function Frame1000007588() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-black w-full">
        <p className="leading-[60px]">Ready to answer the first question?</p>
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

function Frame1000007586() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-[550px]">
      <Frame1000007588 />
      <Buttons />
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

export default function Frame1000007587() {
  return (
    <div className="bg-[#efefef] relative size-full">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center p-[100px] relative size-full">
          <Frame1000007589 />
        </div>
      </div>
    </div>
  );
}