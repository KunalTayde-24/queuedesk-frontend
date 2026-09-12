import type { Config } from 'tailwindcss';

function withOpacity(varName: string) {
  return `rgb(var(${varName}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: withOpacity('--color-ink'),
        paper: withOpacity('--color-paper'),
        card: withOpacity('--color-card'),
        input: withOpacity('--color-input'),
        line: withOpacity('--color-line'),
        muted: withOpacity('--color-muted'),
        violet: {
          DEFAULT: withOpacity('--color-violet'),
          dark: withOpacity('--color-violet-dark'),
          light: withOpacity('--color-violet-light'),
          soft: withOpacity('--color-violet-soft'),
        },
        coral: {
          DEFAULT: withOpacity('--color-coral'),
          dark: withOpacity('--color-coral-dark'),
          light: withOpacity('--color-coral-light'),
        },
        teal: {
          DEFAULT: withOpacity('--color-teal'),
          dark: withOpacity('--color-teal-dark'),
          light: withOpacity('--color-teal-light'),
        },
        amber: {
          DEFAULT: withOpacity('--color-amber'),
          dark: withOpacity('--color-amber-dark'),
          light: withOpacity('--color-amber-light'),
        },
        pink: {
          DEFAULT: withOpacity('--color-pink'),
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
        sm: '0 1px 2px rgba(0,0,0,0.16), 0 1px 1px rgba(0,0,0,0.1)',
        card: '0 4px 14px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.14)',
        lg: '0 14px 34px rgba(0,0,0,0.32), 0 4px 10px rgba(0,0,0,0.18)',
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
