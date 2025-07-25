/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', '../../packages/renderer/src/*.{js,ts,jsx,tsx}'],
  // prefix: 'tw-',
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans]
    },
    extend: {}
  },
  plugins: [require('tailwindcss-animate')]
};
