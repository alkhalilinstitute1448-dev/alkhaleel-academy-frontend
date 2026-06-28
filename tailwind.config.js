/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fdf8ed',
          100: '#f7eccc',
          200: '#efd899',
          300: '#e7c46a',
          400: '#d4a843',
          500: '#c9952c',
          600: '#a07820',
          700: '#7a5b1a',
          800: '#5a4214',
          900: '#3d2c0e',
          950: '#221808',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#a0a0a0',
          400: '#808080',
          500: '#606060',
          600: '#404040',
          700: '#303030',
          800: '#252525',
          850: '#1c1c1c',
          900: '#141414',
          950: '#0a0a0a',
        },
        emerald: {
          400: '#34d399',
          500: '#059669',
          600: '#047857',
        },
      },
      boxShadow: {
        'gold': '0 4px 24px -4px rgba(201, 149, 44, 0.15)',
        'gold-lg': '0 12px 48px -8px rgba(201, 149, 44, 0.2)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(201, 149, 44, 0.06)',
        'card-hover': '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(201, 149, 44, 0.15)',
        'glow': '0 0 40px -8px rgba(201, 149, 44, 0.12)',
        'inner-gold': 'inset 0 1px 0 0 rgba(201, 149, 44, 0.1)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
