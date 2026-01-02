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
      <div className="bg-[#0a0a0a] rounded-[40px] relative w-full overflow-hidden max-w-4xl mx-auto">
        <div aria-hidden="true" className="absolute border border-[#2e2a2f] border-solid inset-0 pointer-events-none rounded-[40px]" />
        
        <div className="p-[40px] flex flex-col items-center gap-[32px]">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-[12px]">
              <div className="flex flex-col font-['Ubuntu',sans-serif] font-bold leading-[50px] text-[40px] text-white">
                <p className="mb-0">Sign up for</p>
                <p>our newsletter</p>
              </div>
              <p className="font-['Ubuntu',sans-serif] font-normal leading-[24px] text-[16px] text-white">
                Stay Informed About Mental Health
              </p>
            </div>

            {/* Input & Button Group */}
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-[6px] items-center justify-center w-full max-w-[482px]">
              {/* Email Input */}
              <div className="h-[59px] grow basis-0 min-w-[200px] relative">
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
                className="bg-[#ffbe1a] h-[59px] px-[20px] rounded-[8px] flex items-center gap-[8px] hover:brightness-105 transition-all"
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
                <span className="font-['Ubuntu',sans-serif] font-medium text-[14px] text-[#2e2a2f] leading-[28px]">
                  Subscribe
                </span>
              </button>
            </form>

            {/* Privacy Policy */}
            <div className="text-center">
               <p className="font-['Ubuntu',sans-serif] font-normal text-[14px] leading-[21px] text-white">
                 We store and process your personal data based on our privacy policy.
               </p>
            </div>

        </div>
      </div>
    </div>
  );
}
