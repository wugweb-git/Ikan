import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/useIsMobile';

interface MobileHeaderProps {
  title: string;
  onBack: () => void;
  onShare?: () => void;
  showShare?: boolean;
}

export function MobileHeader({ title, onBack, onShare, showShare = false }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: 'var(--color-bg-card)',
      borderBottom: '1px solid var(--color-border-default)',
      padding: 'var(--spacing-3) var(--spacing-4)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-3)'
    }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <h1 style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1
      }}>
        {title}
      </h1>
      {showShare && onShare && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onShare}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Share2 className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
