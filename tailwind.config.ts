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
        serif: ['var(--font-noto-serif)', 'Georgia', 'Cambria', 'serif'],
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
        card: '16px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(90,30,10,0.12), 0 1px 1px rgba(90,30,10,0.08)',
        card: '0 10px 28px -16px rgba(90,30,10,0.35)',
        lg: '0 20px 40px -18px rgba(90,30,10,0.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'called-glow': {
          '0%': { transform: 'scale(1.14)', textShadow: '0 0 46px rgba(242,198,109,0.95)' },
          '55%': { transform: 'scale(1.03)', textShadow: '0 0 26px rgba(242,198,109,0.6)' },
          '100%': {
            transform: 'scale(1)',
            textShadow: '0 4px 0 rgba(0,0,0,0.25), 0 0 50px rgba(242,198,109,0.35)',
          },
        },
        pulseRing: {
          '50%': { boxShadow: '0 0 0 7px rgba(255,227,161,0.25)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease',
        popIn: 'popIn 0.35s cubic-bezier(.2,.9,.3,1.2)',
        'called-glow': 'called-glow 900ms ease-out',
        pulseRing: 'pulseRing 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
