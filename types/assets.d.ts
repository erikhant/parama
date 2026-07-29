/**
 * Asset module declarations for the test type-check program.
 *
 * Package builds get these from `vite/client` via each package's own
 * `vite-env.d.ts`. The root test config compiles across package boundaries
 * without a Vite environment, so it needs its own declarations for the static
 * assets `parama-ui` imports.
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
