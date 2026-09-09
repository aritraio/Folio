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
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        /* ── Light-mode surfaces — Editorial Wealth §4 (§56 tokens) ── */
        ivory: {
          DEFAULT: '#F8F6F1',
          50: '#FFFDF8',
          100: '#F8F6F1',
          200: '#F1ECE1',
          300: '#E7E1D7',
          muted: '#F1ECE1',
          border: '#E7E1D7',
          warm: '#F8F6F1',
          tertiary: '#F1ECE1',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#171717',
          'dark-card': '#171717',
          'dark-elevated': '#1F1F1F',
          'dark-border': '#292929',
          'dark-hover': '#292929',
        },

        /* ── Brand / accent — Ledger burnt orange §4.6 ── */
        brand: {
          amber: '#E87500',
          'amber-hover': '#C56100',
          'amber-light': '#FEF3E2',
          'amber-muted': '#92400E',
          emerald: '#1F9D68',
          'emerald-hover': '#177A52',
          'emerald-light': '#DDF5E9',
          'emerald-muted': '#14532D',
          red: '#D64545',
          'red-hover': '#B23535',
          'red-light': '#FDE8E8',
          'red-muted': '#7F1D1D',
          teal: '#0D9488',
          'teal-light': '#CCFBF1',
          gold: '#D99A00',
          navy: '#1E293B',
        },
        /* ── Semantic roles — stable across themes §60 ── */
        ledger: {
          DEFAULT: '#E87500',
          hover: '#C56100',
        },
        positive: {
          DEFAULT: '#1F9D68',
        },
        negative: {
          DEFAULT: '#D64545',
        },
        cash: {
          DEFAULT: '#3B82F6',
        },
        investment: {
          DEFAULT: '#8B5CF6',
        },

        /* ── Chart palette ── */
        chart: {
          teal: '#0D9488',
          gold: '#D97706',
          navy: '#1E293B',
          coral: '#F97316',
          plum: '#7C3AED',
          rose: '#F43F5E',
          sky: '#0EA5E9',
          lime: '#84CC16',
        },

        /* ── Semantic text — §4.3/4.4 ── */
        text: {
          primary: '#171717',
          secondary: '#747474',
          tertiary: '#A8A29E',
          inverse: '#FAFAFA',
          'dark-primary': '#F5F5F4',
          'dark-secondary': '#A8A29E',
          'dark-tertiary': '#78716C',
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
        '4xl': '2rem',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'modal': '0 24px 48px rgba(0, 0, 0, 0.16), 0 12px 24px rgba(0, 0, 0, 0.08)',
        'dark-card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'dark-elevated': '0 10px 30px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)',
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
