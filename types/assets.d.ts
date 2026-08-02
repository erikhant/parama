/**
 * Asset module declarations for programs that compile across package
 * boundaries.
 *
 * A package building itself gets these from `vite/client` via its own
 * `vite-env.d.ts`. Anything that reaches into another package's *source* —
 * the root test config, and `apps/demo`, which aliases the packages to `src`
 * for hot reloading — never picks that file up, so it needs its own
 * declarations for the static assets `parama-ui` imports.
 */
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: string;
  export default content;
}
