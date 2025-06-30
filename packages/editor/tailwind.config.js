/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', '../../packages/renderer/src/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans]
    },
    extend: {}
  },
  plugins: [require('tailwindcss-animate')]
  // presets: [require('../../apps/demo/tailwind.config.js')]
};
