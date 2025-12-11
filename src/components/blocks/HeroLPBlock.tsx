import React from "react";

interface HeroLPBlockProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  backgroundAlt?: string;
}

export function HeroLPBlock({
  title = "Anxiety and depression test (K10)",
  description = "We're glad you're taking the time to check-in on your mental health. Whatever you're going through, you're not alone – support is available. Completing the K10 test will help you understand what kind of support you might need right now.",
  buttonText = "Take Assessment",
  buttonLink = "#",
  backgroundImage,
  backgroundAlt = "Hero background",
}: HeroLPBlockProps) {
  return (
    <div className="h-[900px] relative rounded-bl-[80px] rounded-br-[80px] shrink-0 w-full">
      {backgroundImage && (
        <img
          alt={backgroundAlt}
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-bl-[80px] rounded-br-[80px] size-full"
          src={backgroundImage}
        />
      )}
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] h-[900px] items-start justify-center px-[100px] py-[296px] relative w-full">
          <div className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-[546px]">
            <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] not-italic relative shrink-0 w-full">
              <div className="flex flex-col justify-center relative shrink-0 w-full" style={{ fontWeight: 500 }}>
                <p className="leading-[72px] text-[58px] text-black">{title}</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0 text-[#2e2a2f] text-[16px] w-full" style={{ fontWeight: 400 }}>
                <p className="leading-[24px]">{description}</p>
              </div>
            </div>
            <a href={buttonLink} className="no-underline">
              <div
                className="bg-[#2e2a2f] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ fontWeight: 500 }}
              >
                <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
                  <p className="leading-[28px] whitespace-pre">{buttonText}</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
