import React from 'react';

interface BlogAuthorProps {
  name: string;
  avatar?: string;
  date: string;
  readTime: string;
  className?: string;
}

export function BlogAuthor({ 
  name, 
  avatar, 
  date, 
  readTime,
  className = '' 
}: BlogAuthorProps) {
  return (
    <div className={`content-stretch flex gap-[12px] items-end relative shrink-0 ${className}`}>
      {avatar && (
        <div className="relative shrink-0 size-[47px]">
          <img 
            alt={name} 
            className="block max-w-none size-full rounded-full object-cover" 
            height="47" 
            src={avatar} 
            width="47" 
          />
        </div>
      )}
      <div className="content-stretch flex flex-col items-start justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-nowrap">
        <div 
          className="flex flex-col justify-center relative shrink-0"
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: '24px',
            color: 'var(--color-text-default)'
          }}
        >
          <p className="leading-[24px] not-italic text-nowrap whitespace-pre">{name}</p>
        </div>
        <div 
          className="flex flex-col justify-center relative shrink-0"
          style={{
            fontFamily: 'var(--font-family-base)',
            fontSize: '10px',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: '15px',
            color: 'var(--color-text-muted)'
          }}
        >
          <p className="leading-[15px] not-italic text-nowrap whitespace-pre">{date} ⋅ {readTime}</p>
        </div>
      </div>
    </div>
  );
}
