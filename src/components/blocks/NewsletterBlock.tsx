import React from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

interface NewsletterBlockProps {
  onSubscribe?: (email: string) => void;
  className?: string;
}

export function NewsletterBlock({ onSubscribe, className }: NewsletterBlockProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle subscription
    onSubscribe?.('jamie@example.com');
  };

  return (
    <div className={cn("w-full px-4 py-8", className)}>
      <div className="bg-[#0a0a0a] rounded-[24px] lg:rounded-[40px] relative w-full overflow-hidden max-w-7xl mx-auto">
        <div aria-hidden="true" className="absolute border border-[#2e2a2f] border-solid inset-0 pointer-events-none rounded-[24px] lg:rounded-[40px]" />
        
        <div className="p-[32px] lg:p-[60px] flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-[32px] lg:gap-[60px]">
            
            {/* Header (Left on Desktop) */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-[12px] lg:flex-1 lg:max-w-[500px]">
              <div className="flex flex-col font-['Ubuntu',sans-serif] font-bold leading-[1.2] text-[32px] lg:text-[48px] text-white">
                <p className="mb-0">Sign up for</p>
                <p>our newsletter</p>
              </div>
              <p className="font-['Ubuntu',sans-serif] font-normal leading-[24px] text-[16px] lg:text-[18px] text-white opacity-80">
                Stay Informed About Mental Health
              </p>
              
              {/* Privacy Policy (Desktop Location) */}
              <div className="hidden lg:block mt-4">
                 <p className="font-['Ubuntu',sans-serif] font-normal text-[14px] leading-[21px] text-white/60">
                   We store and process your personal data based on our privacy policy.
                 </p>
              </div>
            </div>

            {/* Input & Button Group (Right on Desktop) */}
            <div className="flex flex-col items-center lg:items-end w-full lg:w-auto lg:flex-1 lg:max-w-[500px]">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-[12px] items-center justify-center w-full">
                {/* Email Input */}
                <div className="h-[50px] lg:h-[59px] w-full relative">
                  <div className="bg-[#efefef] w-full h-full rounded-[8px] flex items-center px-[16px]">
                    <input 
                      type="email" 
                      placeholder="jamie@example.com" 
                      className="bg-transparent border-none outline-none w-full font-['Ubuntu',sans-serif] text-[16px] text-[#000000dd]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  className="bg-[#ffbe1a] h-[50px] lg:h-[59px] px-[24px] w-full sm:w-auto rounded-[8px] flex items-center justify-center gap-[8px] hover:brightness-105 transition-all shrink-0"
                >
                  {/* Dashboard Icon from Figma (Component 24) */}
                  <div className="size-[18px] relative">
                     <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                        <rect x="10" y="2" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                        <rect x="2" y="10" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                        <rect x="10" y="10" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                     </svg>
                  </div>
                  <span className="font-['Ubuntu',sans-serif] font-medium text-[14px] text-[#2e2a2f] leading-[28px] whitespace-nowrap">
                    Subscribe
                  </span>
                </button>
              </form>
              
              {/* Privacy Policy (Mobile Location) */}
              <div className="lg:hidden mt-4 text-center">
                 <p className="font-['Ubuntu',sans-serif] font-normal text-[14px] leading-[21px] text-white/60">
                   We store and process your personal data based on our privacy policy.
                 </p>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}
