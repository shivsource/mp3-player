/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#030712',
          900: '#070d1d',
          800: '#0f172a',
          700: '#1e293b',
        },
        cinematic: {
          gold: '#f59e0b',
          amber: '#d97706',
          cyan: '#06b6d4',
          neon: '#38bdf8',
          purple: '#a855f7',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.8))' },
        }
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '24px',
        '3xl': '32px',
      }
    },
  },
  plugins: [],
}
