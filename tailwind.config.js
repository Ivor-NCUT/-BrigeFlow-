/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Typography ── */
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'SimHei', 'Arial', 'Helvetica', 'sans-serif'],
      },

      /* ── Colors: Bonjour iOS Design System ── */
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          light:   '#E5F1FF',
          hover:   '#005BB5',
          50:  '#E5F1FF',
          100: '#CCE4FF',
          200: '#99C9FF',
          300: '#66ADFF',
          400: '#3392FF',
          500: '#007AFF',
          600: '#0062CC',
          700: '#005BB5',
          800: '#003D7A',
          900: '#001F3D',
          950: '#000F1F',
        },
        grey: {
          25:  '#FCFCFD',
          50:  '#F2F2F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          300: '#C7C7CC',
          400: '#AEAEB2',
          500: '#8A8A8E',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1C1C1E',
          950: '#0C0C0D',
        },
        surface: {
          DEFAULT:   '#FFFFFF',
          bg:        '#F2F2F7',
          dark:      '#1C1C1E',
          'bg-dark': '#000000',
        },
        border: {
          DEFAULT: '#E5E5EA',
          hover:   '#C7C7CC',
          dark:    '#3A3A3C',
        },
        text: {
          primary:        '#000000',
          secondary:      '#8A8A8E',
          tertiary:       '#C4C4C7',
          'primary-dark': '#FFFFFF',
          'secondary-dark':'#8A8A8E',
        },
        fill: {
          quaternary: 'rgba(120, 120, 128, 0.08)',
          secondary:  'rgba(120, 120, 128, 0.16)',
        },
        glass: {
          light: {
            'ultra-thick': '#f6f6f6d6',
            'thick':       '#f6f6f6b8',
            'medium':      '#f6f6f699',
            'thin':        '#f6f6f67a',
            'ultra-thin':  '#f6f6f65c',
          },
          dark: {
            'ultra-thick': '#00000080',
            'thick':       '#00000066',
            'medium':      '#0000004a',
            'thin':        '#00000033',
            'ultra-thin':  '#0000001a',
          },
        },
        /* Semantic accents */
        accent: {
          red:    '#FF3B30',
          green:  '#34C759',
          amber:  '#FF9500',
          purple: '#AF52DE',
          cyan:   '#5AC8FA',
          mint:   '#00C7BE',
        },
      },

      /* ── Border Radius: Bonjour 4px-base system ── */
      borderRadius: {
        'sm':   '6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '24px',
        'card': '20px',
        'card-inner': '12px',
        'pill': '100px',
      },

      /* ── Shadows: Subtle, iOS-inspired ── */
      boxShadow: {
        'card':       '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.10)',
        'float':      '0 8px 30px rgba(0, 122, 255, 0.18)',
        'glass':      '0 2px 20px rgba(0, 0, 0, 0.04)',
        'subtle':     '0 1px 3px rgba(0, 0, 0, 0.04)',
      },

      backdropBlur: {
        'glass': '15px',
      },

      /* ── Spacing: 4px base unit ── */
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
      },
    },
  },
  plugins: [],
}
