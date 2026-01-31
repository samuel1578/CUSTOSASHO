/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFDF7',
          100: '#FFF9E6',
          200: '#FFF0C2',
          300: '#FFE699',
          400: '#EAD76D',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#997A14',
          800: '#735C0F',
          900: '#4D3D0A',
        },
        kente: {
          red: '#DC2626',
          green: '#16A34A',
          blue: '#2563EB',
          yellow: '#EAB308',
          orange: '#EA580C',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};
