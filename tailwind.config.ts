import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a5c3a', // primary green
          light:   '#2d7a4f',
          soft:    '#e8f5ee',
          muted:   '#c8e6d4',
          hero:    '#1a3d2b',
          accent:  '#4caf50',
        },
        page: {
          bg: '#f7f8f6',
        },
        ui: {
          cardBorder: '#e8ebe8',
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#6b7280',
          muted: '#9ca3af',
        },
        status: {
          completed: '#1a5c3a',
          inProgressBg: '#dbeafe',
          inProgressText: '#1d4ed8',
          pendingBg: '#f3f4f6',
          pendingText: '#6b7280',
          failedBg: '#fee2e2',
          failedText: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        card: '0 0 0 1px #e8ebe8',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out forwards',
        'bounce-once': 'bounceOnce 0.6s ease-in-out 1',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
