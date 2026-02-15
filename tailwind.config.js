/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: { 
          DEFAULT: '#4F46E5', // Indigo 600
          light: '#EEF2FF',   // Indigo 50
          hover: '#4338CA',   // Indigo 700
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B'
        },
        grey: {
          25: '#FCFCFD',
          50: '#F5F5F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          300: '#C7C7CC',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1C1C1E',
          950: '#0C0C0D'
        },
        surface: { 
          DEFAULT: '#FFFFFF', 
          bg: '#FAFAFA' // Zinc 50
        },
        border: {
          DEFAULT: '#D1D1D6', // Grey 200
          hover: '#C7C7CC',   // Grey 300
        },
        text: {
          primary: '#1C1C1E',   // Grey 900
          secondary: '#8E8E93', // Grey 500
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        'card': '32px',
        'card-inner': '20px',
      },
      boxShadow: {
        'card': '4px 4px 20px 0px rgba(0,0,0,0.05)',
        'card-hover': '4px 4px 40px 0px rgba(0,0,0,0.08)',
        'float': '0 8px 30px rgba(28,139,255,0.25)',
      },
    },
  },
  plugins: [],
}
