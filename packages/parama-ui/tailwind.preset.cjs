/**
 * Shared Tailwind theme for the form builder.
 *
 * Both `parama-ui` and `editor` compile their own stylesheets, so the token
 * scale has to live in one place or the two builds drift. Anything that must
 * mean the same thing in both belongs here.
 *
 * Colours are RGB triplets in CSS variables rather than literal values, so the
 * `.dark` scope in `variables.css` can swap them without regenerating classes.
 *
 * @type {import('tailwindcss').Config}
 */

/** Builds the light/DEFAULT/dark shade ramp for a brand colour. */
const ramp = (name) => ({
  light: `rgba(var(--${name}-light), <alpha-value>)`,
  DEFAULT: `rgba(var(--${name}-default), <alpha-value>)`,
  dark: `rgba(var(--${name}-dark), <alpha-value>)`
});

const token = (name) => `rgba(var(--${name}), <alpha-value>)`;

module.exports = {
  // The theme is switched by an in-app control, so it cannot be driven by
  // `prefers-color-scheme` alone.
  darkMode: ['class'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      borderColor: {
        /*
         * Tailwind's preflight paints every element's border with
         * `borderColor.DEFAULT`, which ships as gray-200. Any width-only
         * utility — `border`, `border-l`, `border-t` — therefore draws a
         * near-white line, invisible in light mode and glaring in dark. There
         * are ~35 such utilities across the component stylesheets, so pointing
         * the default at the stroke token fixes them all at once, including
         * any added later.
         *
         * Light mode is unaffected: `--stroke` is 229,231,235 there, which is
         * gray-200 exactly.
         */
        DEFAULT: token('stroke')
      },
      colors: {
        // Brand ramps. `light` and `dark` here are *shades*, not modes: they
        // exist in both themes and must not be confused with dark mode.
        background: ramp('background'),
        foreground: {
          DEFAULT: 'rgba(var(--foreground-default), <alpha-value>)',
          dark: 'rgba(var(--foreground-dark), <alpha-value>)'
        },
        sidebar: ramp('sidebar'),
        hover: ramp('hover'),
        active: ramp('active'),
        primary: ramp('primary'),
        secondary: ramp('secondary'),
        success: ramp('success'),
        danger: ramp('danger'),
        warning: ramp('warning'),

        // Semantic chrome tokens. These DO flip between light and dark mode,
        // and are what application surfaces should be built from.
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
          muted: token('surface-muted'),
          sunken: token('surface-sunken')
        },
        stroke: {
          DEFAULT: token('stroke'),
          subtle: token('stroke-subtle'),
          strong: token('stroke-strong')
        },
        content: {
          DEFAULT: token('content'),
          muted: token('content-muted'),
          subtle: token('content-subtle'),
          faint: token('content-faint')
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  }
};
