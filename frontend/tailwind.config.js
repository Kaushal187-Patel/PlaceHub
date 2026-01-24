/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

const brandPalette = {
  50: '#FAF7F3',
  100: '#F0E4D3',
  200: '#DCC5B2',
  300: '#D9A299',
  400: '#D9A299',
  500: '#D9A299',
  600: '#D9A299',
  700: '#D9A299',
  800: '#D9A299',
  900: '#D9A299'
};

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}', // using JSX only
  ],
  darkMode: 'class', // Enables `dark` class usage
  theme: {
    colors: {
      ...colors,
      brand: {
        50: '#FAF7F3',
        100: '#F0E4D3',
        200: '#DCC5B2',
        300: '#D9A299'
      },
      blue: brandPalette,
      indigo: brandPalette,
      purple: brandPalette,
      green: brandPalette
    },
    extend: {},
  },
  plugins: [],
};
