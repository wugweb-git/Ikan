import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ubuntu', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      },
      colors: {
        // iKan Design System Colors
        'ikan-primary': 'var(--color-primary-default)',
        'ikan-primary-on': 'var(--color-primary-on)',
        'ikan-accent': 'var(--color-accent-default)',
        'ikan-accent-on': 'var(--color-accent-on)',
        'ikan-bg-page': 'var(--color-bg-page)',
        'ikan-bg-card': 'var(--color-bg-card)',
        'ikan-bg-muted': 'var(--color-bg-muted)',
        'ikan-bg-input': 'var(--color-bg-input)',
        'ikan-text-primary': 'var(--color-text-primary)',
        'ikan-text-muted': 'var(--color-text-muted)',
        'ikan-text-inverse': 'var(--color-text-inverse)',
        'ikan-border': 'var(--color-border-default)',
        'ikan-border-light': 'var(--color-border-light)',
        'ikan-success': 'var(--color-status-success)',
        'ikan-success-light': 'var(--color-status-success-light)',
        'ikan-danger': 'var(--color-status-danger)',
        'ikan-danger-light': 'var(--color-status-danger-light)',
        'ikan-warning': 'var(--color-status-warning)',
        'ikan-warning-light': 'var(--color-status-warning-light)',
        'ikan-info': 'var(--color-status-info)',
        'ikan-info-light': 'var(--color-status-info-light)'
      },
      spacing: {
        'ikan-1': 'var(--spacing-1)',
        'ikan-2': 'var(--spacing-2)',
        'ikan-3': 'var(--spacing-3)',
        'ikan-4': 'var(--spacing-4)',
        'ikan-5': 'var(--spacing-5)',
        'ikan-6': 'var(--spacing-6)',
        'ikan-7': 'var(--spacing-7)',
        'ikan-8': 'var(--spacing-8)'
      },
      borderRadius: {
        'ikan-xs': 'var(--radius-xs)',
        'ikan-sm': 'var(--radius-sm)',
        'ikan-md': 'var(--radius-md)',
        'ikan-lg': 'var(--radius-lg)',
        'ikan-pill': 'var(--radius-pill)'
      },
      fontSize: {
        'ikan-xs': 'var(--text-xs)',
        'ikan-sm': 'var(--text-sm)',
        'ikan-base': 'var(--text-base)',
        'ikan-lg': 'var(--text-lg)',
        'ikan-xl': 'var(--text-xl)',
        'ikan-2xl': 'var(--text-2xl)',
        'ikan-3xl': 'var(--text-3xl)',
        'ikan-4xl': 'var(--text-4xl)'
      },
      fontWeight: {
        'ikan-regular': 'var(--font-weight-regular)',
        'ikan-medium': 'var(--font-weight-medium)',
        'ikan-semibold': 'var(--font-weight-semibold)',
        'ikan-bold': 'var(--font-weight-bold)'
      },
      lineHeight: {
        'ikan-xs': 'var(--line-height-xs)',
        'ikan-sm': 'var(--line-height-sm)',
        'ikan-md': 'var(--line-height-md)',
        'ikan-lg': 'var(--line-height-lg)'
      },
      boxShadow: {
        'ikan-xs': 'var(--shadow-xs)',
        'ikan-sm': 'var(--shadow-sm)',
        'ikan-md': 'var(--shadow-md)',
        'ikan-lg': 'var(--shadow-lg)'
      },
      transitionDuration: {
        'ikan-fast': 'var(--motion-duration-fast)',
        'ikan-normal': 'var(--motion-duration-normal)',
        'ikan-slow': 'var(--motion-duration-slow)'
      },
      screens: {
        'ikan-xs': 'var(--breakpoint-xs)',
        'ikan-sm': 'var(--breakpoint-sm)',
        'ikan-md': 'var(--breakpoint-md)',
        'ikan-lg': 'var(--breakpoint-lg)',
        'ikan-xl': 'var(--breakpoint-xl)'
      },
      animation: {
        'fade-in': 'fadeIn var(--motion-duration-fast) var(--motion-easing-out)',
        'fade-out': 'fadeOut var(--motion-duration-fast) var(--motion-easing-in)',
        'slide-up': 'slideUp var(--motion-duration-normal) var(--motion-easing-out)',
        'slide-down': 'slideDown var(--motion-duration-normal) var(--motion-easing-out)',
        'slide-left': 'slideLeft var(--motion-duration-normal) var(--motion-easing-out)',
        'slide-right': 'slideRight var(--motion-duration-normal) var(--motion-easing-out)',
        'scale-in': 'scaleIn var(--motion-duration-normal) var(--motion-easing-out)',
        'ikan-pulse': 'pulse 2s var(--motion-easing-in-out) infinite',
        'ikan-bounce': 'bounce 1s var(--motion-easing-in-out) infinite',
        'ikan-wiggle': 'wiggle 0.5s var(--motion-easing-in-out)',
        'ikan-spin': 'spin 1s var(--motion-easing-linear) infinite',
        'ripple': 'ripple 0.6s var(--motion-easing-out)'
      }
    }
  },
  plugins: [
    require('tailwindcss-animate')
  ]
} satisfies Config

export default config