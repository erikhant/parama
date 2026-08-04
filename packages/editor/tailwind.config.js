/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const paramaPreset = require('../parama-ui/tailwind.preset.cjs');

export default {
  // Shares parama-ui's token scale and class-based dark mode. Without the
  // preset the editor's build would not know `bg-surface` or `text-content`,
  // and its `dark:` variants would compile against `prefers-color-scheme`
  // instead of the class the theme toggle sets.
  presets: [paramaPreset],

  /*
   * Scopes every generated utility to the library's own subtrees, so the
   * bundled CSS is safe to drop into an application that already uses Tailwind.
   *
   * Without this the editor's `.rounded-lg` (token-driven) and a host's
   * `.rounded-lg` (its own scale) are the same selector at the same
   * specificity, and whichever stylesheet loads last wins — for the host and
   * the editor at once, with no ordering that leaves both correct. Prefixing
   * raises the editor's utilities to (0,2,0) so they win inside the editor and
   * are inert everywhere else.
   *
   * `data-parama-scope`, not `data-parama-theme`: the theme attribute answers
   * "which colour scheme applies here", and a host is expected to wrap its
   * entire application in `ThemeProvider`, so it encloses the host's own
   * markup. Anchoring here made the library restyle its host. The scope marker
   * sits only on roots the library draws — the editor shell, a rendered form,
   * and the portal host that carries overlays.
   */
  important: '[data-parama-scope]',

  /*
   * Preflight is a *global* reset — it restyles `html`, `body` and every
   * element in the document, including a host's own UI. `preflight-scoped.css`
   * replaces it with the same rules confined to the theme wrapper.
   */
  corePlugins: {
    preflight: false
  },

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
