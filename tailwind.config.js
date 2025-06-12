/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0A0F',
          lighter: '#13131A',
          darker: '#050507',
        },
        primary: {
          DEFAULT: '#6366F1',
          50: '#EDEFFD',
          100: '#D3D4FB',
          200: '#A6A9F8',
          300: '#787CF5',
          400: '#6366F1',
          500: '#4144EE',
          600: '#3437CB',
          700: '#292CA8',
          800: '#1F2384',
          900: '#151961',
        },
        accent: {
          DEFAULT: '#10B981',
          50: '#E6FBF5',
          100: '#B8F3E0',
          200: '#74E5C3',
          300: '#31D7A5',
          400: '#10B981',
          500: '#0E9C6C',
          600: '#0B7E57',
          700: '#086042',
          800: '#05422D',
          900: '#032418',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#64748B',
        },
        border: {
          DEFAULT: '#2D2D3A',
          light: '#3F3F50',
          dark: '#222230',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};