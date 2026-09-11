import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241F3D',
        paper: '#F6F3FB',
        card: '#FFFFFF',
        line: '#E7E1F4',
        muted: '#7A7495',
        violet: {
          DEFAULT: '#6C4FE0',
          dark: '#4E36AD',
          light: '#EFEAFD',
          soft: '#F4F1FC',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          dark: '#D6472A',
          light: '#FFEEE9',
        },
        teal: {
          DEFAULT: '#12B76A',
          dark: '#0C8A52',
          light: '#E3F9EE',
        },
        amber: {
          DEFAULT: '#F5A623',
          dark: '#B5760E',
          light: '#FDF0D9',
        },
        pink: {
          DEFAULT: '#EC4899',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'Cambria', 'serif'],
        sans: [
          'var(--font-manrope)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '18px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(36,31,61,0.05), 0 1px 1px rgba(36,31,61,0.04)',
        card: '0 4px 14px rgba(76,54,173,0.08), 0 1px 3px rgba(36,31,61,0.06)',
        lg: '0 14px 34px rgba(76,54,173,0.16), 0 4px 10px rgba(36,31,61,0.08)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'called-glow': {
          '0%': { transform: 'scale(1.14)', textShadow: '0 0 46px rgba(245,166,35,0.95)' },
          '55%': { transform: 'scale(1.03)', textShadow: '0 0 26px rgba(245,166,35,0.6)' },
          '100%': {
            transform: 'scale(1)',
            textShadow: '0 8px 28px rgba(245,166,35,0.35)',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease',
        popIn: 'popIn 0.35s cubic-bezier(.2,.9,.3,1.2)',
        'called-glow': 'called-glow 900ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
