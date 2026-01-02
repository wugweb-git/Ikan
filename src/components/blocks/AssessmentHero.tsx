import React from "react";
import { Button } from "../ui/button";

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
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height: '606px',
        minHeight: '500px',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Background Container from Figma */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #f5f5f5 100%)',
          zIndex: 1
        }}
      />
      
      {/* Background Image (Underlay) */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            zIndex: 0
          }}
        >
          <img
            alt={backgroundAlt}
            className="w-full h-full object-cover object-center"
            src={backgroundImage}
          />
        </div>
      )}

      {/* Content Container positioned absolutely as per Figma */}
      <div 
        className="absolute left-0 p-[20px] flex flex-col gap-[20px] items-start justify-center"
        style={{ 
          top: '319px', // Exact top position from Figma
          width: '100%',
          maxWidth: '394px', // From Figma
          zIndex: 2
        }}
      >
        {/* Title */}
        <h1 
          style={{
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 500,
            fontSize: '32px',
            lineHeight: '44.8px',
            color: '#151515',
            margin: 0
          }}
        >
          {title}
        </h1>

        {/* Description */}
        <p 
          style={{
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#151515',
            margin: 0
          }}
        >
          {description}
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleClick}
          className="touch-target"
          style={{
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            height: '48px',
            width: '169px', // 168.761px from Figma
            borderRadius: '6px',
            fontFamily: 'Inter, sans-serif', // Figma used Inter for button
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
}