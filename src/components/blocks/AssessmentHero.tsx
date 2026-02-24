import React from "react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface AssessmentHeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  backgroundImage?: string;
  backgroundAlt?: string;
  className?: string;
}

export function AssessmentHero({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
  backgroundImage,
  backgroundAlt = "Hero background",
  className = ""
}: AssessmentHeroProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section 
      className={cn(
        "relative w-full overflow-hidden flex flex-col justify-center min-h-[500px] lg:min-h-[600px] bg-[#F5F5F5]",
        className
      )}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            alt={backgroundAlt}
            className="w-full h-full object-cover object-center"
            src={backgroundImage}
          />
          {/* Subtle gradient overlay to ensure text readability if image is dark */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F5] via-[#F5F5F5]/80 to-transparent z-10 lg:w-2/3" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-0">
        <div className="max-w-[500px] flex flex-col gap-6 items-start">
          {/* Title */}
          <h1 
            className="font-medium text-[32px] md:text-[40px] leading-[1.2] text-[#151515]"
          >
            {title}
          </h1>

          {/* Description */}
          <p 
            className="font-normal text-[16px] md:text-[18px] leading-[1.5] text-[#151515] opacity-90"
          >
            {description}
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            className="bg-[#2a2a2a] text-white hover:bg-black h-12 px-8 rounded-md font-medium text-base transition-colors"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}