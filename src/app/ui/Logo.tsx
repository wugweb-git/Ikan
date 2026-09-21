import React from 'react';
import { motion } from 'framer-motion';
import { BrandMark } from './BrandMark';
import svgPathsFull from "../../imports/svg-epzl744ze1";
import { usePublicSettings } from '../../hooks/usePublicSettings';

// Icon-only logo component
export function LogoIcon({ 
  size = 32, 
  className = "", 
  style = {}, 
  loading = false, 
  interactive = false 
}: { 
  size?: number; 
  className?: string; 
  style?: React.CSSProperties; 
  loading?: boolean;
  interactive?: boolean;
}) {
  const { settings } = usePublicSettings();
  const customIcon = settings.logoIconUrl;

  // If admin uploaded a custom icon, render it as an image
  if (customIcon) {
    return (
      <motion.div
        className={`relative ${className}`}
        style={{ width: size, height: size, ...style }}
        data-name="LogoIcon"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: loading ? [0, 360] : 0 }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.3, type: "spring", stiffness: 300 },
          rotate: { duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }
        }}
        whileHover={interactive ? { scale: 1.1, rotate: 5, transition: { duration: 0.2 } } : {}}
        whileTap={interactive ? { scale: 0.95, transition: { duration: 0.1 } } : {}}
      >
        <img src={customIcon} alt={settings.siteName || 'iKan'} className="block w-full h-full object-contain" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`relative ${className}`} 
      style={{ width: size, height: size, color: 'var(--color-primary-default)', ...style }}
      data-name="LogoIcon"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: loading ? [0, 360] : 0
      }}
      transition={{ 
        opacity: { duration: 0.3 },
        scale: { duration: 0.3, type: "spring", stiffness: 300 },
        rotate: { 
          duration: 2, 
          repeat: loading ? Infinity : 0, 
          ease: "linear" 
        }
      }}
      whileHover={interactive ? { 
        scale: 1.1, 
        rotate: 5,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={interactive ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
    >
      <BrandMark size="100%" animation={loading ? 'pulse' : 'draw'} />
      {/* geometry lives in BrandMark — the single source of truth for the icon */}
    </motion.div>
  );
}

// Full logo component with icon and text
export function LogoFull({ height = 32, className = "", style = {} }: { 
  height?: number; 
  className?: string; 
  style?: React.CSSProperties; 
}) {
  const { settings } = usePublicSettings();
  const customLogo = settings.logoUrl || settings.logoFullDarkUrl;

  // If admin uploaded a custom full logo, render it as an image
  if (customLogo) {
    return (
      <div
        className={`relative ${className}`}
        style={{ height, width: 'auto', ...style }}
        data-name="LogoFull"
      >
        <img src={customLogo} alt={settings.siteName || 'iKan'} className="block h-full w-auto object-contain" />
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`} 
      style={{ height, width: 'auto', color: 'var(--color-primary-default)', ...style }}
      data-name="LogoFull"
    >
      <svg 
        className="block h-full w-auto" 
        fill="none" 
        preserveAspectRatio="xMidYMid meet" 
        viewBox="0 0 100 50"
        style={{ color: 'currentColor' }}
      >
        <g id="Logo">
          <g id="Vector">
            <path d={svgPathsFull.p28d7740} fill="currentColor" />
            <path d={svgPathsFull.p201d5680} fill="currentColor" />
            <path d={svgPathsFull.p2febba00} fill="currentColor" />
            <path d={svgPathsFull.p2be28440} fill="currentColor" />
            <path d={svgPathsFull.p1c12f8f0} fill="currentColor" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// Combined logo component that shows icon + text using flex layout
export function Logo({ 
  showText = true, 
  iconSize = 32, 
  className = "", 
  style = {},
  loading = false,
  interactive = false
}: { 
  showText?: boolean; 
  iconSize?: number; 
  className?: string; 
  style?: React.CSSProperties; 
  loading?: boolean;
  interactive?: boolean;
}) {
  const { settings } = usePublicSettings();
  const siteName = settings.siteName || 'iKan';

  if (!showText) {
    return <LogoIcon size={iconSize} className={className} style={style} loading={loading} interactive={interactive} />;
  }

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`} 
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut",
        staggerChildren: 0.1
      }}
      whileHover={interactive ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
    >
      <LogoIcon size={iconSize} loading={loading} interactive={interactive} />
      <motion.span 
        style={{
          fontSize: iconSize >= 32 ? 'var(--text-xl)' : 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-base)'
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: 0.2,
          ease: "easeOut"
        }}
      >
        {siteName}
      </motion.span>
    </motion.div>
  );
}

// Default export for convenience
export default Logo;