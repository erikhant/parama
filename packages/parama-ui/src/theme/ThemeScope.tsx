import { paramaScope } from './scope';
import { useTheme } from './useTheme';

export interface ThemeScopeProps {
  /** Spread onto the portalled element: marks it as library-drawn. */
  scopeProps: Readonly<Record<string, string>>;
  /** Merge into its `className`: resolves the design tokens to the dark scale. */
  themeClass: string | undefined;
}

/**
 * Carries the theme into portalled content without moving where it renders.
 *
 * Portals escape the provider's subtree, so CSS never reaches them: React
 * context still works, but the `.dark` class has no path to the content and
 * every custom property falls back to its light value.
 *
 * The obvious fix — portalling into one shared host on the body — was the
 * original design, and it breaks the moment the form sits inside a host
 * application's modal. That host is created when the provider mounts, so it
 * precedes any dialog opened later; with equal z-index, DOM order decides and
 * the overlay paints behind. A modal also sets `pointer-events: none` on the
 * body and re-enables it per layer, and a layer rendered into a foreign
 * container is outside that bookkeeping — leaving content visible but
 * unclickable. Letting Radix portal to its own default fixes both, because the
 * content is appended at open time and joins the host's layer stack.
 *
 * Returned as props rather than a wrapper component on purpose. Radix's
 * `Presence` clones the child it is given and attaches a ref to watch for
 * animation end; a wrapper that is not a DOM element swallows that ref, and the
 * overlay then never mounts at all.
 *
 * Applying both to the content element itself is enough. The element is styled
 * by its own component class — `.sheet-content` and friends live unscoped in
 * `parama-ui.min.css` — while everything *inside* it, including a rendered
 * form's utilities, matches as a descendant of the marker.
 */
export function useThemeScope(): ThemeScopeProps {
  const { resolvedTheme } = useTheme();

  return {
    scopeProps: paramaScope,
    themeClass: resolvedTheme === 'dark' ? 'dark' : undefined
  };
}
