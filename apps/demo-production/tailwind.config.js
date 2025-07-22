/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
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
