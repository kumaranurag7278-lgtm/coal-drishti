/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Coal: the dark surfaces (panels, top bar)
        coal: {
          950: '#0F1418',
          900: '#151B20',
          800: '#1E262C',
          700: '#2A343B',
          600: '#3A4650',
        },
        // Steel: neutral greys with a cool cast
        steel: {
          50: '#F3F5F7',
          100: '#E8ECEF',
          200: '#D5DBE0',
          300: '#B7C0C7',
          400: '#8B98A2',
          500: '#66747F',
          600: '#4B5963',
          700: '#37434C',
        },
        // Primary: information / normal system state
        primary: {
          50: '#EAF2FB',
          100: '#D3E4F6',
          300: '#8DB8E6',
          500: '#2F72B8',
          600: '#245E9C',
          700: '#1C4C80',
        },
        // Meaning colours: green = verified/safe, amber = pending, red = critical
        ok: { DEFAULT: '#1F7A4D', soft: '#E3F2E9', line: '#B7DDC5' },
        warn: { DEFAULT: '#8A5100', soft: '#FCF0D6', line: '#F0D08A', bar: '#D99A1B', on: '#F5C15D' },
        danger: { DEFAULT: '#B3261E', soft: '#FBE5E3', line: '#EFB5B0' },
      },
    },
  },
  plugins: [],
};
