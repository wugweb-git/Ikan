import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/useIsMobile';

interface MobileHeaderProps {
  title: string;
  onBack: () => void;
  onShare?: () => void;
  showShare?: boolean;
  transparent?: boolean;
}

export function MobileHeader({ title, onBack, onShare, showShare = false, transparent = false }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div style={{
      position: transparent ? 'absolute' : 'sticky',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 10,
      backgroundColor: transparent ? 'transparent' : 'var(--color-bg-card)',
      borderBottom: transparent ? 'none' : '1px solid var(--color-border-default)',
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
          borderRadius: 'var(--radius-md)',
          backgroundColor: transparent ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
          color: transparent ? 'white' : 'inherit',
          backdropFilter: transparent ? 'blur(4px)' : 'none'
        }}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      {!transparent && (
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
      )}
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
