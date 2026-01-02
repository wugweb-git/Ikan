import imgDtsFitnessAllieLehmanPhotosId1797CopyWebp from "figma:asset/091bde3ca3df1576f3a7dde8590aee20d6858d69.png";

function DtsFitnessAllieLehmanPhotosId1797CopyWebp() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-[80px]" data-name="DTS_Fitness_Allie_Lehman_Photos_ID1797_copy.webp">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[12px] size-full" src={imgDtsFitnessAllieLehmanPhotosId1797CopyWebp} />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative self-stretch shrink-0" data-name="Component 13">
      <DtsFitnessAllieLehmanPhotosId1797CopyWebp />
    </div>
  );
}

function Aside() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-full" data-name="Aside">
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[10px] w-full">
        <p className="leading-[15px]">February 26 2025</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[226px]" data-name="Heading">
      <div className="flex flex-col font-['Ubuntu:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[16px] w-[226px]">
        <p className="leading-[24px]">Do I Need to Supplement with B12?</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-start min-h-px min-w-px relative shrink-0">
      <Aside />
      <Heading />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Component />
      <Frame />
    </div>
  );
}

export default function BlogCard() {
  return (
    <div className="bg-white relative rounded-[8px] size-full" data-name="Blog Card">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
          <Container />
        </div>
      </div>
    </div>
  );
}