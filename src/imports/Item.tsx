import imgVxvx9L3Fmbld8Gwt8Brt from "figma:asset/1c1de544ef45145153d2ac29de38ba04bdd25ec0.png";

function Vxvx9L3Fmbld8Gwt8Brt() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="vxvx9l3fmbld8gwt8brt">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgVxvx9L3Fmbld8Gwt8Brt} />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',sans-serif] h-[47px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[138px]">
        <p className="leading-[24px]">Perceived stress and overwhelm</p>
      </div>
    </div>
  );
}

export default function Item() {
  return (
    <div className="bg-[#eff1f4] relative rounded-[16px] size-full" data-name="Item">
      <div className="size-full">
        <div className="content-stretch flex gap-[12px] items-start p-[20px] relative size-full">
          <Vxvx9L3Fmbld8Gwt8Brt />
          <Container />
        </div>
      </div>
    </div>
  );
}