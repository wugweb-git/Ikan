import React from 'react';
import { cn } from '../ui/utils';
import { Check, BookOpen, TrendingUp, Calendar, Target, Brain, Heart, Zap, Award } from 'lucide-react';

// Simplified interfaces for the 4-tile layout
interface EquipBentoGridProps {
  tile1Content?: string; // What is this program about?
  tile2Content?: string; // The program includes:
  tile3Content?: string; // How it works
  tile4Content?: string; // What you'll gain
  eligibilityIntro?: string; // Is this for you? intro
  eligibilityPoint1?: string;
  eligibilityPoint2?: string;
  eligibilityPoint3?: string;
  eligibilityPoint4?: string;
  className?: string;
}

const TileLabel = ({ number }: { number: number }) => (
  <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/80 border border-gray-200 rounded text-[10px] text-gray-600 z-20 pointer-events-none select-none" style={{ fontFamily: 'Inter, sans-serif' }}>
    TILE {number}
  </div>
);

/**
 * EquipBentoGrid - New 4-Tile Layout (2x2)
 * Matches the Figma design with static headings and dynamic content
 */
export function EquipBentoGrid({
  tile1Content = '',
  tile2Content = '',
  tile3Content = '',
  tile4Content = '',
  eligibilityIntro = '',
  eligibilityPoint1 = '',
  eligibilityPoint2 = '',
  eligibilityPoint3 = '',
  eligibilityPoint4 = '',
  className
}: EquipBentoGridProps) {
  
  // Helper to parse content with line breaks and format
  const parseContent = (content: string) => {
    if (!content) return [];
    return content.split('\n').filter(line => line.trim());
  };

  // Parse tile 2 and 4 for bullet lists
  const tile2Lines = parseContent(tile2Content);
  const tile4Lines = parseContent(tile4Content);
  
  // Parse tile 4 for items with dash separator (title - description)
  const tile4Items = tile4Lines.map(line => {
    const dashIndex = line.indexOf(' - ');
    if (dashIndex > 0) {
      return {
        title: line.substring(0, dashIndex).trim(),
        description: line.substring(dashIndex + 3).trim()
      };
    }
    return { title: line, description: '' };
  });

  // Icon mapping for Tile 2 (The program includes)
  const tile2Icons = [Calendar, BookOpen, TrendingUp, Brain];
  
  // Icon mapping for Tile 4 (What you'll gain)
  const tile4Icons = [Target, Brain, Heart, Zap];
  
  // Collect eligibility points
  const eligibilityPoints = [
    eligibilityPoint1,
    eligibilityPoint2,
    eligibilityPoint3,
    eligibilityPoint4
  ].filter(point => point && point.trim());
  
  return (
    <section 
      className={cn("w-full py-12 md:py-16", className)}
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Mobile: Stacked */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          
          {/* Tile 1: What is this program about? */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              What is this program about?
            </h2>
            <div className="space-y-4 mb-8" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
              {parseContent(tile1Content).map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            
            {/* Is this for you? - Inside Tile 1 */}
            {eligibilityPoints.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Is this for you?
                </h3>
                {eligibilityIntro && (
                  <p className="mb-4" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                    {eligibilityIntro}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {eligibilityPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#2A2A2A] shrink-0 mt-0.5" strokeWidth={2} />
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tile 2: The program includes */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 overflow-hidden">
            <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              The program includes:
            </h2>
            <div className="space-y-5">
              {tile2Lines.map((line, idx) => {
                const Icon = tile2Icons[idx % tile2Icons.length];
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <Icon className="w-6 h-6 text-[#2A2A2A] shrink-0 mt-1" strokeWidth={2} />
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                      {line}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tile 3: How it works */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              How it works
            </h2>
            <div className="space-y-4" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
              {parseContent(tile3Content).map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          {/* Tile 4: What you'll gain */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              What you'll gain
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {tile4Items.map((item, idx) => {
                const Icon = tile4Icons[idx % tile4Icons.length];
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <Icon className="w-7 h-7 text-[#2A2A2A] shrink-0 mt-1" strokeWidth={2} />
                    <div className="flex-1">
                      <h3 className="mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Custom Bento Grid matching Figma proportions */}
        <div className="hidden md:block space-y-6">
          
          {/* TOP ROW: 2.2fr (Tile 1) + 1fr (Tile 2) */}
          <div className="grid gap-6" style={{ gridTemplateColumns: '2.2fr 1fr' }}>
            
            {/* Tile 1: What is this program about? + Is this for you? (Wider - 2.2x width) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    What is this program about?
                  </h2>
                  <div className="space-y-4" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                    {parseContent(tile1Content).map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
                
                {/* Is this for you? - Inside Tile 1 */}
                {eligibilityPoints.length > 0 && (
                  <div className="pt-6">
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'auto 1fr 1fr' }}>
                      {/* Column 1: Title + Intro */}
                      <div className="pr-6 border-r border-gray-200">
                        <h3 className="mb-2" style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          Is this for you?
                        </h3>
                        {eligibilityIntro && (
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                            {eligibilityIntro}
                          </p>
                        )}
                      </div>
                      
                      {/* Column 2: Points 1 & 2 */}
                      <div className="space-y-3">
                        {eligibilityPoints.slice(0, 2).map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#2A2A2A] shrink-0 mt-0.5" strokeWidth={2} />
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Column 3: Points 3 & 4 */}
                      <div className="space-y-3">
                        {eligibilityPoints.slice(2, 4).map((point, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#2A2A2A] shrink-0 mt-0.5" strokeWidth={2} />
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tile 2: The program includes */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 overflow-hidden">
              <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                The program includes:
              </h2>
              <div className="space-y-5">
                {tile2Lines.map((line, idx) => {
                  const Icon = tile2Icons[idx % tile2Icons.length];
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <Icon className="w-6 h-6 text-[#2A2A2A] shrink-0 mt-1" strokeWidth={2} />
                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                        {line}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: 1fr (Tile 3) + 2.2fr (Tile 4) - REVERSED RATIO */}
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 2.2fr' }}>
            
            {/* Tile 3: How it works */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                How it works
              </h2>
              <div className="space-y-4" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                {parseContent(tile3Content).map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>

            {/* Tile 4: What you'll gain (Wider - 2.2x width) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="mb-6" style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                What you'll gain
              </h2>
              <div className="grid grid-cols-4 gap-6">
                {tile4Items.map((item, idx) => {
                  const Icon = tile4Icons[idx % tile4Icons.length];
                  return (
                    <div key={idx}>
                      <Icon className="w-7 h-7 text-[#2A2A2A] shrink-0 mb-3" strokeWidth={2} />
                      <h3 className="mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: '1.4' }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}