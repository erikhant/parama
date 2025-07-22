/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Demo app source files
    '../../packages/editor/src/**/*.{js,ts,jsx,tsx}', // Editor package source
    '../../packages/parama-ui/src/**/*.{js,ts,jsx,tsx}', // UI package source
    '../../packages/renderer/src/**/*.{js,ts,jsx,tsx}' // Renderer package source
  ],
  theme: {
    extend: {
      spacing: {
        'form-gap': 'var(--form-gap, 1rem)'
      },
      gridTemplateColumns: {
        'form-grid': 'repeat(var(--form-columns, 12), minmax(0, 1fr))'
      }
    }
  },
  plugins: []
};
