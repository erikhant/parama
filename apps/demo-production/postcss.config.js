/*
 * Tailwind v4, which is what the current shadcn/ui CLI targets — its
 * `shadcn/tailwind.css` uses `@theme`, `@custom-variant` and `@utility`, none
 * of which exist in v3.
 *
 * The version difference is the point of this app. It consumes the *built*
 * parama packages, whose CSS is compiled with Tailwind v3, so a v4 host loading
 * v3 library CSS is the realistic modern integration and the one worth testing.
 *
 * v4 handles vendor prefixing itself, so autoprefixer is gone.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
