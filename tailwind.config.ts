import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          0: 'hsl(225 32% 5%)',
          1: 'hsl(225 28% 7%)',
          2: 'hsl(225 24% 10%)',
        },
        glass: {
          1: 'hsla(220, 24%, 14%, 0.55)',
          2: 'hsla(220, 24%, 14%, 0.35)',
        },
        accent: {
          DEFAULT: 'hsl(196 92% 60%)',
          2: 'hsl(272 88% 70%)',
          3: 'hsl(142 76% 56%)',
          warn: 'hsl(42 96% 58%)',
          danger: 'hsl(0 84% 62%)',
        },
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)',
        glow: '0 0 0 1px rgba(56,189,248,.15), 0 0 30px rgba(56,189,248,.18)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.75' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '-200% 0%' },
        },
      },
      animation: {
        breathe: 'breathe 3.2s ease-in-out infinite',
        shimmer: 'shimmer 1.3s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config

