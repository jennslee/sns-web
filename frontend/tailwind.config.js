/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        surface: {
          0:  '#07070f',
          1:  '#0d0f1a',
          2:  '#111827',
          3:  '#1a2035',
          4:  '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem', md: '0.5rem', sm: '0.375rem', xl: '1rem', '2xl': '1.25rem',
      },
      boxShadow: {
        'brand-sm': '0 0 0 1px rgba(99,102,241,.3), 0 2px 8px rgba(99,102,241,.15)',
        'brand':    '0 0 0 1px rgba(99,102,241,.4), 0 4px 24px rgba(99,102,241,.2)',
        'brand-lg': '0 0 0 1px rgba(99,102,241,.5), 0 8px 40px rgba(99,102,241,.3)',
        'card':     '0 1px 3px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.3)',
        'card-hover': '0 1px 3px rgba(0,0,0,.5), 0 12px 32px rgba(0,0,0,.4)',
        'glow-emerald': '0 0 20px rgba(16,185,129,.25)',
        'glow-red':     '0 0 20px rgba(239,68,68,.25)',
      },
      animation: {
        'fade-in':     'fadeIn .2s ease',
        'fade-up':     'fadeUp .3s ease',
        'slide-left':  'slideLeft .25s ease',
        'pulse-dot':   'pulseDot 2s cubic-bezier(.4,0,.6,1) infinite',
        'spin-slow':   'spin 3s linear infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'count-up':    'fadeUp .5s ease',
        'bounce-in':   'bounceIn .4s cubic-bezier(.34,1.56,.64,1)',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                        to: { opacity: 1 } },
        fadeUp:    { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        slideLeft: { from: { opacity: 0, transform: 'translateX(12px)' }, to: { opacity: 1, transform: 'none' } },
        pulseDot:  { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .4, transform: 'scale(.85)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        bounceIn:  { from: { opacity: 0, transform: 'scale(.85)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-brand2': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 35%, #ec4899 65%, #f59e0b 100%)',
        'shimmer-base':    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
