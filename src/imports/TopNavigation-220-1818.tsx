import svgPaths from "./svg-w8190qjxac";

function Logo() {
  return (
    <div className="h-[40px] relative shrink-0 w-[80px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 40">
        <g id="Logo">
          <g id="Vector">
            <path d={svgPaths.p3570d00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p39886280} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2ef40b00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p36847a70} fill="var(--fill-0, black)" />
            <path d={svgPaths.p24eeb700} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link:margin">
      <Logo />
    </div>
  );
}

function Component24() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Component 24">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Component 24">
          <path clipRule="evenodd" d={svgPaths.paf0c900} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Buttons() {
  return (
    <div className="bg-[#e9ebef] box-border content-stretch flex gap-[8px] items-center p-[10px] relative rounded-[4px] shrink-0" data-name="Buttons">
      <Component24 />
    </div>
  );
}

function Frame1171277368() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Buttons />
    </div>
  );
}

function MenuList() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Menu List">
      <div aria-hidden="true" className="absolute border border-[#d6d6d6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between p-[16px] relative w-full">
          <LinkMargin />
          <Frame1171277368 />
        </div>
      </div>
    </div>
  );
}

export default function TopNavigation() {
  return (
    <div className="relative size-full" data-name="Top Navigation">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[16px] relative size-full">
          <MenuList />
        </div>
      </div>
    </div>
  );
}