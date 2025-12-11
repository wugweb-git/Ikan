import svgPaths from "./svg-x6fbdzvw3c";

function WugwebLogo() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Wugweb Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Wugweb Logo">
          <rect fill="var(--fill-0, #101010)" height="40" rx="10" width="40" />
          <g id="Vector">
            <path d={svgPaths.p24492600} fill="white" />
            <path d={svgPaths.p20410d00} fill="white" />
            <path d={svgPaths.p11c52300} fill="var(--fill-0, #FFBE1A)" />
            <path d={svgPaths.p137142f2} fill="var(--fill-0, #FFBE1A)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function Embed() {
  return (
    <div className="bg-black relative rounded-[10px] size-full" data-name="Embed">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center px-[16px] py-[4px] relative size-full">
          <div className="flex flex-col font-['Inter_Tight:SemiBold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-white">
            <p className="leading-[24px] whitespace-pre">{`Designed  by`}</p>
          </div>
          <WugwebLogo />
        </div>
      </div>
    </div>
  );
}