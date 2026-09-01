/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgba(var(--primary-50), <alpha-value>)',
          100: 'rgba(var(--primary-100), <alpha-value>)',
          200: 'rgba(var(--primary-200), <alpha-value>)',
          300: 'rgba(var(--primary-300), <alpha-value>)',
          400: 'rgba(var(--primary-400), <alpha-value>)',
          500: 'rgba(var(--primary-500), <alpha-value>)',
          600: 'rgba(var(--primary-600), <alpha-value>)',
          700: 'rgba(var(--primary-700), <alpha-value>)',
          800: 'rgba(var(--primary-800), <alpha-value>)',
          900: 'rgba(var(--primary-900), <alpha-value>)',
          950: 'rgba(var(--primary-950), <alpha-value>)',
        },
        accent: {
          50: 'rgba(var(--accent-50), <alpha-value>)',
          100: 'rgba(var(--accent-100), <alpha-value>)',
          200: 'rgba(var(--accent-200), <alpha-value>)',
          300: 'rgba(var(--accent-300), <alpha-value>)',
          400: 'rgba(var(--accent-400), <alpha-value>)',
          500: 'rgba(var(--accent-500), <alpha-value>)',
          600: 'rgba(var(--accent-600), <alpha-value>)',
          700: 'rgba(var(--accent-700), <alpha-value>)',
          800: 'rgba(var(--accent-800), <alpha-value>)',
          900: 'rgba(var(--accent-900), <alpha-value>)',
          950: 'rgba(var(--accent-950), <alpha-value>)',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          50: 'rgba(var(--dark-50), <alpha-value>)',
          100: 'rgba(var(--dark-100), <alpha-value>)',
          200: 'rgba(var(--dark-200), <alpha-value>)',
          300: 'rgba(var(--dark-300), <alpha-value>)',
          400: 'rgba(var(--dark-400), <alpha-value>)',
          500: 'rgba(var(--dark-500), <alpha-value>)',
          600: 'rgba(var(--dark-600), <alpha-value>)',
          700: 'rgba(var(--dark-700), <alpha-value>)',
          800: 'rgba(var(--dark-800), <alpha-value>)',
          850: 'rgba(var(--dark-850), <alpha-value>)',
          900: 'rgba(var(--dark-900), <alpha-value>)',
          950: 'rgba(var(--dark-950), <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(14, 140, 226, 0.45)',
        'glow-accent': '0 0 15px rgba(168, 85, 247, 0.45)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 140, 226, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 140, 226, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
