import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import scopeTailwindDefaults from './postcss/scopeTailwindDefaults.mjs';

export default {
  plugins: [
    tailwindcss,
    // Must run after Tailwind — it rewrites the global `--tw-*` defaults rule
    // that Tailwind generates, which would otherwise override a v4 host's own
    // utilities. See the plugin for why that breaks host applications.
    scopeTailwindDefaults({ strict: true }),
    autoprefixer
  ]
};
