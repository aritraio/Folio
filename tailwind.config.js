/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        /* ── Terminal surfaces (dark primary) ── */
        base: {
          DEFAULT: '#0A0A0A',
          secondary: '#111111',
          surface: '#141414',
          card: '#141414',
          hover: '#1E1E1E',
        },
        line: {
          DEFAULT: '#262626',
          hover: '#404040',
          subtle: '#262626',
        },
        ink: {
          primary: '#FFFFFF',
          secondary: '#C4C7C8',
          muted: '#8E9192',
        },
        finance: {
          in: '#00b894',
          out: '#ff6b6b',
          'in-light': '#00a383',
          'out-light': '#e84118',
        },

        /* ── Spec-literal tokens (bg-bg-primary, text-text-primary, …) ── */
        'bg-primary': '#0A0A0A',
        'bg-secondary': '#111111',
        'bg-surface': '#141414',
        'bg-card': '#141414',
        'border-color': '#262626',
        'text-primary': '#FFFFFF',
        'text-secondary': '#C4C7C8',
        'text-muted': '#8E9192',
        'finance-in': '#00b894',
        'finance-out': '#ff6b6b',

        /* ── Monochromatic tonal gradient for donut charts ── */
        terminal: {
          50: '#FFFFFF',
          100: '#E4E4E7',
          200: '#A1A1AA',
          300: '#71717A',
          400: '#52525B',
          500: '#3F3F46',
          600: '#27272A',
        },

        /* ── Legacy aliases (mapped to terminal palette — do not use in new code) ── */
        ivory: {
          DEFAULT: '#FAFAFA',
          50: '#FAFAFA',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E5E5E5',
          muted: '#F5F5F5',
          border: '#E5E5E5',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0A0A0A',
          'dark-card': '#141414',
          'dark-elevated': '#1E1E1E',
          'dark-border': '#262626',
        },

        /* ── Brand / accent → monochrome + finance signals ── */
        brand: {
          amber: '#FFFFFF',
          'amber-hover': '#C4C7C8',
          'amber-light': 'rgba(255, 255, 255, 0.08)',
          'amber-muted': '#C4C7C8',
          emerald: '#00b894',
          'emerald-hover': '#00a383',
          'emerald-light': 'rgba(0, 184, 148, 0.12)',
          'emerald-muted': '#00b894',
          red: '#ff6b6b',
          'red-hover': '#e84118',
          'red-light': 'rgba(255, 107, 107, 0.12)',
          'red-muted': '#ff6b6b',
          teal: '#C4C7C8',
          'teal-light': 'rgba(255, 255, 255, 0.08)',
          gold: '#FFFFFF',
          navy: '#FFFFFF',
        },

        /* ── Chart palette → terminal monochrome + two finance signals ── */
        chart: {
          teal: '#00b894',
          gold: '#FFFFFF',
          navy: '#A1A1AA',
          coral: '#ff6b6b',
          plum: '#71717A',
          rose: '#ff6b6b',
          sky: '#C4C7C8',
          lime: '#00b894',
        },

        /* ── Semantic text → terminal ink ── */
        text: {
          primary: '#0A0A0A',
          secondary: '#404040',
          tertiary: '#8E9192',
          inverse: '#FFFFFF',
          'dark-primary': '#FFFFFF',
          'dark-secondary': '#C4C7C8',
          'dark-tertiary': '#8E9192',
        },
      },

      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        '4xl': '6px',
      },

      boxShadow: {
        card: 'none',
        'card-hover': 'none',
        elevated: 'none',
        modal: '0 16px 48px rgba(0, 0, 0, 0.5)',
        'dark-card': 'none',
        'dark-elevated': 'none',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'backdrop-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in-scale': 'fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'backdrop-fade': 'backdrop-fade 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
