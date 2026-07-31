/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const paramaPreset = require('./tailwind.preset.cjs');

export default {
  // darkMode, the colour scale and the accordion animations come from the
  // shared preset so the editor's build stays in step with this one.
  presets: [paramaPreset],
  content: [
    process.env.NODE_ENV !== 'production' ? './src/**/*.{ts,tsx,css}' : './src/components/**/*.{ts,tsx,css}'
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans]
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')]
};
