/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const paramaPreset = require('../parama-ui/tailwind.preset.cjs');

export default {
  // Shares parama-ui's token scale and class-based dark mode. Without the
  // preset the editor's build would not know `bg-surface` or `text-content`,
  // and its `dark:` variants would compile against `prefers-color-scheme`
  // instead of the class the theme toggle sets.
  presets: [paramaPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Recursive: the renderer's controls, fields and hooks live in
    // subdirectories, and a single-level glob silently dropped their classes
    // from the editor's bundled CSS.
    '../../packages/renderer/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans]
    }
  },
  plugins: [require('tailwindcss-animate')]
};
