import svgPaths from "./svg-9uz5q7h5jm";
import imgRectangle13 from "figma:asset/f3776a338dad59604b202772ce848acf009b5d2e.png";

interface Professional {
  professional_id: string;
  name: string;
  title: string;
  specialties: string[];
  location: string;
  phone: string;
  available: boolean;
}

interface ConsultantCardProps {
  professional: Professional;
}

function Frame1000007558({ professional }: ConsultantCardProps) {
  return (
    <div className="h-[230px] relative shrink-0 w-[174px]">
      <div className="absolute h-[230px] left-0 rounded-lg top-0 w-[174px]">
        <img alt={`${professional.name} profile photo`} className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-lg size-full" src={imgRectangle13} />
      </div>
    </div>
  );
}

function Frame44({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[24px] w-full">
        <p className="leading-[36px]">{professional.name}</p>
      </div>
    </div>
  );
}

function Frame1000007431({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex gap-3 items-center justify-center relative shrink-0">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap">
        <p className="leading-[21px] whitespace-pre">{professional.title}</p>
      </div>
    </div>
  );
}

function Frame1000007432({ professional }: ConsultantCardProps) {
  const handlePhoneCall = () => {
    if (confirm(`Call ${professional.name} at ${professional.phone}?`)) {
      window.location.href = `tel:${professional.phone}`;
    }
  };

  return (
    <div className="content-stretch flex gap-3 items-center justify-center relative shrink-0">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[0px] text-nowrap">
        <p className="text-[14px] whitespace-pre">
          <span className="leading-[21px]">{`Contact via: `}</span>
          <span 
            className="leading-[28px] not-italic cursor-pointer hover:underline text-[#2A2A2A] font-medium"
            onClick={handlePhoneCall}
            style={{
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {professional.phone}
          </span>
        </p>
      </div>
    </div>
  );
}

function Tagname({ specialty }: { specialty: string }) {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-3 items-center px-3 py-1 relative rounded-sm shrink-0" data-name="tagname">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[10px] text-nowrap">
        <p className="leading-[15px] whitespace-pre">{specialty}</p>
      </div>
    </div>
  );
}

function Frame1000007556({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex gap-2 items-center relative shrink-0">
      {professional.specialties?.slice(0, 2).map((specialty, index) => (
        <Tagname key={index} specialty={specialty} />
      ))}
    </div>
  );
}

function Frame1000007433({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex gap-4 items-center justify-center relative shrink-0">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap">
        <p className="leading-[21px] whitespace-pre">Expertise:</p>
      </div>
      <Frame1000007556 professional={professional} />
    </div>
  );
}

function Frame1000007434({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex gap-3 items-center justify-center relative shrink-0">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[#2e2a2f] text-[14px] text-nowrap">
        <p className="leading-[21px] whitespace-pre">Location: {professional.location}</p>
      </div>
    </div>
  );
}

function Frame1000007555({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0">
      <Frame1000007431 professional={professional} />
      <Frame1000007432 professional={professional} />
      <Frame1000007433 professional={professional} />
      <Frame1000007434 professional={professional} />
    </div>
  );
}

function Frame1000007430({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame44 professional={professional} />
      <Frame1000007555 professional={professional} />
    </div>
  );
}

function Frame46({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex flex-col gap-[28px] items-start relative shrink-0">
      <Frame1000007430 professional={professional} />
    </div>
  );
}

function Frame1000007557({ professional }: ConsultantCardProps) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[20px] items-center p-[16px] relative w-full">
          <Frame1000007558 professional={professional} />
          <Frame46 professional={professional} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007561() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center relative shrink-0 text-[#757575]">
        <p className="leading-[21px] text-nowrap whitespace-pre">Available via:</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center relative shrink-0 text-[#151515]">
        <p className="leading-[28px] text-nowrap whitespace-pre">Video, Voice</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[11.13%_11.11%_11.12%_11.11%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Group">
          <path d={svgPaths.p2cf1a680} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Calendar11() {
  return (
    <div className="overflow-clip relative shrink-0 size-[18px]" data-name="calendar (1) 1">
      <Group />
    </div>
  );
}

function Frame1000007563() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0">
      <Calendar11 />
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[14px] text-nowrap">
        <p className="leading-[28px] whitespace-pre">Today, 08:00 AM</p>
      </div>
    </div>
  );
}

function Frame1000007564() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[14px] text-nowrap">
        <p className="leading-[21px] whitespace-pre">Next online slot:</p>
      </div>
      <Frame1000007563 />
    </div>
  );
}

function Buttons({ professional }: ConsultantCardProps) {
  const handleBooking = () => {
    if (!professional.available) return;
    
    // Show booking confirmation and simulate booking process
    const confirmBooking = confirm(
      `Book an appointment with ${professional.name} (${professional.title})?\n\n` +
      `Location: ${professional.location}\n` +
      `Specialties: ${professional.specialties.join(', ')}\n` +
      `Contact: ${professional.phone}\n\n` +
      `This is a demo - in production this would open a booking system.`
    );
    
    if (confirmBooking) {
      alert(`Booking request submitted for ${professional.name}!\n\nYou will receive a confirmation call at your registered number within 24 hours.`);
    }
  };

  return (
    <div 
      className={`box-border content-stretch flex gap-[8px] items-center px-[32px] py-[10px] relative rounded-[8px] shrink-0 ${
        professional.available 
          ? 'bg-[#2e2a2f] cursor-pointer hover:bg-[#1a1a1a] transition-colors' 
          : 'bg-[#9ca3af] cursor-not-allowed'
      }`} 
      data-name="Buttons"
      onClick={handleBooking}
      style={{
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">
          {professional.available ? 'Book Now' : 'Not Available'}
        </p>
      </div>
    </div>
  );
}

function Frame1000007562({ professional }: ConsultantCardProps) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame1000007561 />
      <Frame1000007564 />
      <Buttons professional={professional} />
    </div>
  );
}

function Frame1000007560({ professional }: ConsultantCardProps) {
  return (
    <div className="bg-neutral-100 relative rounded-bl-[12px] rounded-br-[12px] shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[30px] items-start p-[16px] relative w-full">
          <Frame1000007562 professional={professional} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007559({ professional }: ConsultantCardProps) {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0">
      <Frame1000007557 professional={professional} />
      <Frame1000007560 professional={professional} />
    </div>
  );
}

export default function ConsultantCard({ professional }: ConsultantCardProps) {
  return (
    <div className="bg-white content-stretch flex gap-[27px] items-center relative rounded-[12px] size-full" data-name="Consultant Card">
      <div aria-hidden="true" className="absolute border border-neutral-100 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame1000007559 professional={professional} />
    </div>
  );
}