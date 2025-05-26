/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,css}'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans]
    },
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: {
          light: 'rgba(var(--background-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--background-default), <alpha-value>)',
          dark: 'rgba(var(--background-dark), <alpha-value>)'
        },
        foreground: {
          DEFAULT: 'rgba(var(--foreground-default), <alpha-value>)',
          dark: 'rgba(var(--foreground-dark), <alpha-value>)'
        },
        sidebar: {
          light: 'rgba(var(--sidebar-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--sidebar-default), <alpha-value>)',
          dark: 'rgba(var(--sidebar-dark), <alpha-value>)'
        },
        hover: {
          light: 'rgba(var(--hover-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--hover-default), <alpha-value>)',
          dark: 'rgba(var(--hover-dark), <alpha-value>)'
        },
        active: {
          light: 'rgba(var(--active-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--active-default), <alpha-value>)',
          dark: 'rgba(var(--active-dark), <alpha-value>)'
        },
        primary: {
          light: 'rgba(var(--primary-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--primary-default), <alpha-value>)',
          dark: 'rgba(var(--primary-dark), <alpha-value>)'
        },
        secondary: {
          light: 'rgba(var(--secondary-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--secondary-default), <alpha-value>)',
          dark: 'rgba(var(--secondary-dark), <alpha-value>)'
        },
        success: {
          light: 'rgba(var(--success-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--success-default), <alpha-value>)',
          dark: 'rgba(var(--success-dark), <alpha-value>)'
        },
        danger: {
          light: 'rgba(var(--danger-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--danger-default), <alpha-value>)',
          dark: 'rgba(var(--danger-dark), <alpha-value>)'
        },
        warning: {
          light: 'rgba(var(--warning-light), <alpha-value>)',
          DEFAULT: 'rgba(var(--warning-default), <alpha-value>)',
          dark: 'rgba(var(--warning-dark), <alpha-value>)'
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')]
};
