import React from 'react';
import { Badge } from '../ui/badge';
import { Share2 } from 'lucide-react';
import { BlogAuthor } from './BlogAuthor';

interface BlogAuthorData {
  name: string;
  avatar?: string;
  date: string;
  readTime: string;
}

interface BlogContentProps {
  content: React.ReactNode;
  author: BlogAuthorData;
  tags?: string[];
  onTagClick?: (tag: string) => void;
  onShare?: () => void;
  className?: string;
}

export function BlogContent({ 
  content, 
  author, 
  tags = [], 
  onTagClick,
  onShare,
  className = '' 
}: BlogContentProps) {
  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag);
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  const handleShare = () => {
    console.log('Share clicked');
    if (onShare) {
      onShare();
    }
  };

  return (
    <div className={`box-border content-stretch flex flex-col gap-[40px] items-start px-[100px] py-[40px] relative shrink-0 w-full max-w-[1440px] ${className}`}>
      <div className="content-stretch flex flex-col items-start justify-center max-w-[1340px] relative shrink-0 w-full">
        <div className="max-w-[1365px] relative shrink-0 w-full">
          <div className="flex flex-col items-center max-w-inherit size-full">
            <div className="box-border content-stretch flex flex-col gap-[40px] items-center max-w-inherit px-[20px] py-0 relative w-full">
              <div className="box-border content-stretch flex flex-col gap-[16px] items-start pl-[85px] pr-[25px] py-0 relative shrink-0 w-full max-w-[870px]">
                <div className="relative shrink-0 w-full">
                  <div className="size-full">
                    <div className="box-border content-stretch flex flex-col gap-[25px] items-start p-[16px] relative w-full">
                      
                      {/* Main Content Section */}
                      <div className="content-stretch flex flex-col gap-[25px] items-end justify-center relative shrink-0">
                        <div className="box-border content-stretch flex flex-col gap-[24px] items-start pb-[32px] pt-0 px-0 relative shrink-0">
                          <div aria-hidden="true" className="absolute border-[#cfcfcf] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
                          <div className="relative z-10">
                            {content}
                          </div>
                        </div>
                        
                        {/* Share Button */}
                        <div className="content-stretch flex gap-[6px] items-center relative shrink-0 cursor-pointer" onClick={handleShare}>
                          <Share2 size={20} style={{ color: 'var(--color-text-muted)' }} />
                          <div 
                            className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-nowrap"
                            style={{
                              fontFamily: 'var(--font-family-base)',
                              fontSize: '14px',
                              fontWeight: 'var(--font-weight-regular)',
                              lineHeight: '21px',
                              color: 'var(--color-text-muted)'
                            }}
                          >
                            <p className="leading-[21px] whitespace-pre">Share Article</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Author Info Section */}
                      <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
                        <BlogAuthor
                          name={author.name}
                          avatar={author.avatar}
                          date={author.date}
                          readTime={author.readTime}
                        />
                      </div>
                      
                      {/* Tags Section */}
                      {tags.length > 0 && (
                        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
                          <div className="content-stretch flex flex-col gap-[8px] items-start justify-end relative shrink-0">
                            <div 
                              className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 w-full max-w-[721.04px]"
                              style={{
                                fontFamily: 'var(--font-family-base)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--font-weight-medium)',
                                lineHeight: '24px',
                                color: 'var(--color-text-default)'
                              }}
                            >
                              <p className="leading-[24px]">Tags</p>
                            </div>
                            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 flex-wrap">
                              {tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-[20px] py-[10px] rounded-[16px] border-[#c1c1c1]"
                                  onClick={() => handleTagClick(tag)}
                                  style={{
                                    fontFamily: 'var(--font-family-base)',
                                    fontSize: '12px',
                                    fontWeight: 'var(--font-weight-regular)',
                                    lineHeight: '18px',
                                    color: 'var(--color-text-muted)'
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
