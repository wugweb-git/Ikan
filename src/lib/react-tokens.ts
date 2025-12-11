// react-tokens.ts - inject iKan tokens + keyframes as CSS vars for React/Storybook
import tokens from './design-tokens';
import { useEffect } from 'react';

type TokenValue = string | number | boolean | object | any[];

export function injectTokens(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // flatten tokens into CSS vars
  function setVars(prefix: string, obj: Record<string, any>): void {
    for (const [key, val] of Object.entries(obj)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        setVars(`${prefix}-${key}`, val);
      } else {
        const varName = `--ikan-${prefix}-${key}`.toLowerCase().replace(/\./g, '-');
        root.style.setProperty(varName, String(val));
      }
    }
  }

  // inject colors, typography, spacing, radius, etc.
  if (tokens.colors) setVars('color', tokens.colors);
  if (tokens.typography) setVars('type', tokens.typography);
  if (tokens.spacing) setVars('space', tokens.spacing);
  if (tokens.radius) setVars('radius', tokens.radius);
  if (tokens.shadow) setVars('shadow', tokens.shadow);
  if (tokens.motion?.duration) setVars('motion', tokens.motion.duration);
  if (tokens.zIndex) setVars('z', tokens.zIndex);

  // add motion keyframes into a <style> tag
  const styleId = 'ikan-keyframes';
  let style = document.getElementById(styleId) as HTMLStyleElement;
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }
  
  let css = '';
  if (tokens.motion?.keyframes) {
    for (const [name, frames] of Object.entries(tokens.motion.keyframes)) {
      css += `@keyframes ikan-${name} { ${frames} }\n`;
    }
  }
  style.innerHTML = css;
}

// helper hook for React components
export function useToken(varName: string, fallback?: string): string {
  if (typeof window === 'undefined') return fallback || '';
  const val = getComputedStyle(document.documentElement).getPropertyValue(`--ikan-${varName}`);
  return val || fallback || '';
}

export function useTokens(): void {
  useEffect(() => {
    injectTokens();
  }, []);
}

// Legacy function names for backward compatibility
export const injectTokensToRoot = injectTokens;

// Helper functions to access token values programmatically
function flattenTokens(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k in obj) {
    const val = obj[k];
    const name = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === "object" && !Array.isArray(val) && !(val.hasOwnProperty && val.hasOwnProperty('char') && val.hasOwnProperty('label'))) {
      Object.assign(out, flattenTokens(val, name));
    } else {
      out[name] = typeof val === "string" ? val : JSON.stringify(val);
    }
  }
  return out;
}

function toCssVarName(key: string): string {
  return '--ikan-' + key.replace(/[A-Z]/g, m => "-" + m.toLowerCase()).replace(/\s+/g, "-").replace(/\.+/g, '-').replace(/[^a-z0-9\-_]/gi, '-');
}

export function getToken(path: string): string {
  const flat = flattenTokens(tokens);
  return flat[path] || '';
}

export function getTokenVar(path: string): string {
  return `var(${toCssVarName(path)})`;
}

// Type-safe token access helpers
export const tokenHelpers = {
  // Colors
  colors: {
    primary: (variant: 'default' | 'on' = 'default') => getTokenVar(`colors.primary.${variant}`),
    accent: (variant: 'default' | 'on' = 'default') => getTokenVar(`colors.accent.${variant}`),
    background: (variant: 'page' | 'card' | 'muted' | 'input' = 'page') => getTokenVar(`colors.background.${variant}`),
    text: (variant: 'primary' | 'muted' | 'inverse' = 'primary') => getTokenVar(`colors.text.${variant}`),
    border: (variant: 'default' | 'light' = 'default') => getTokenVar(`colors.border.${variant}`),
    status: (variant: 'success' | 'danger' | 'warning' | 'info', light: boolean = false) => 
      getTokenVar(`colors.status.${variant}${light ? '-light' : ''}`),
    neutral: (shade: 100 | 200 | 300 | 400 | 500 | 600 | 700) => getTokenVar(`colors.neutral.${shade}`),
    chart: (index: 1 | 2 | 3 | 4 | 5) => getTokenVar(`colors.charts.${index - 1}`)
  },
  
  // Typography
  typography: {
    fontFamily: (variant: 'base' | 'mono' = 'base') => getTokenVar(`typography.fontFamily.${variant}`),
    size: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl') => getTokenVar(`typography.size.${size}`),
    weight: (weight: 'regular' | 'medium' | 'semibold' | 'bold') => getTokenVar(`typography.weight.${weight}`),
    lineHeight: (height: 'xs' | 'sm' | 'md' | 'lg') => getTokenVar(`typography.lineHeight.${height}`),
    letterSpacing: (spacing: 'tight' | 'normal' | 'wide') => getTokenVar(`typography.letterSpacing.${spacing}`)
  },
  
  // Spacing
  spacing: (size: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => getTokenVar(`spacing.${size}`),
  
  // Radius
  radius: (size: 'xs' | 'sm' | 'md' | 'lg' | 'pill') => getTokenVar(`radius.${size}`),
  
  // Shadows
  shadow: (size: 'xs' | 'sm' | 'md' | 'lg') => getTokenVar(`shadow.${size}`),
  
  // Motion
  motion: {
    duration: (speed: 'fast' | 'normal' | 'slow') => getTokenVar(`motion.duration.${speed}`),
    easing: (type: 'inOut' | 'linear' | 'easeIn' | 'easeOut') => getTokenVar(`motion.easing.${type}`)
  },
  
  // Breakpoints
  breakpoint: (size: 'sm' | 'md' | 'lg' | 'xl') => getTokenVar(`breakpoints.${size}`),
  
  // Z-Index
  zIndex: (layer: 'nav' | 'sticky' | 'modal' | 'tooltip' | 'toast' | 'overlay') => getTokenVar(`zIndex.${layer}`)
};

export default tokens;