export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        neon: {
          pink:   '#f472b6',
          violet: '#a78bfa',
          cyan:   '#22d3ee',
        },
        dark: {
          700: '#1e2a3a',
          800: '#111827',
          900: '#080d14',
          950: '#040609',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        blob:        'blob 9s infinite ease-in-out',
        'blob-slow': 'blob 14s infinite ease-in-out',
        float:       'float 6s ease-in-out infinite',
        'float-slow':'float 9s ease-in-out infinite',
        'glow-pulse':'glow-pulse 3s ease-in-out infinite',
        shimmer:     'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-up':   'fadeUp 0.6s ease forwards',
        'border-glow':'borderGlow 3s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(40px,-60px) scale(1.15)' },
          '66%':     { transform: 'translate(-30px,30px) scale(0.88)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        borderGlow: {
          '0%,100%': { boxShadow: '0 0 8px 2px rgba(139,92,246,0.3)' },
          '50%':     { boxShadow: '0 0 22px 6px rgba(139,92,246,0.7)' },
        },
      },
      backgroundSize: {
        '200%': '200%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
