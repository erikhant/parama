import * as React from 'react';

/**
 * Selectors for an element that traps focus. Every mainstream overlay — Radix,
 * Base UI, Headless UI, MUI — marks its modal with one of these roles.
 */
const MODAL_ROLES = '[role="dialog"], [role="alertdialog"]';

/**
 * Finds the modal a node sits inside, if any.
 *
 * Portalled content that renders as a *sibling* of a host application's modal
 * is broken in three separate ways, and this is the one fix for all of them:
 *
 *   - **Focus.** A modal installs a `focusin` listener that pulls focus back
 *     whenever it lands outside its container. Radix pauses that listener when
 *     a nested overlay opens, but it coordinates through a module-level stack —
 *     and a host that ships its own copy of Radix has a *different* stack. The
 *     host's dialog never learns our menu opened, so every attempt to focus an
 *     option is reverted. Keyboard navigation dies, and so does the highlight,
 *     since Radix derives `data-highlighted` from the option holding focus.
 *   - **Stacking.** Equal `z-index` means DOM order decides, and a portal host
 *     created earlier loses to a dialog appended later.
 *   - **Pointer events.** A modal sets `pointer-events: none` on the body and
 *     re-enables it per layer; a foreign layer is skipped.
 *
 * Rendering inside the modal makes `container.contains(target)` true, which is
 * the check every one of those mechanisms performs.
 *
 * Returns `null` when there is no modal, which Radix reads as "use the body" —
 * the correct untethered default, and what page-level usage keeps doing.
 */
export function findModalContainer(node: Element | null | undefined): HTMLElement | null {
  return (node?.closest?.(MODAL_ROLES) as HTMLElement | null) ?? null;
}

/**
 * Shares the trigger's DOM node with the portalled content.
 *
 * The content is portalled, so it cannot look up the tree to find the modal
 * itself — it has to be told where its trigger lives.
 */
export const PortalAnchorContext = React.createContext<React.MutableRefObject<HTMLElement | null> | null>(null);

/** Registers a trigger node as the anchor for its overlay. */
export function usePortalAnchor() {
  return React.useContext(PortalAnchorContext);
}

/** Provides a fresh anchor ref. Wrap the root of a trigger/content pair. */
export function PortalAnchorProvider({ children }: { children: React.ReactNode }) {
  const anchorRef = React.useRef<HTMLElement | null>(null);

  return React.createElement(PortalAnchorContext.Provider, { value: anchorRef }, children);
}

/**
 * The modal enclosing this overlay's trigger, or `null` for none.
 *
 * Resolved in an effect rather than during render, and this is the subtle part:
 * a content component consumes nothing from the primitive's open state, so it
 * renders *once*, on the initial pass — before the trigger's callback ref has
 * attached. Reading the anchor during that render always yields `null`, and
 * nothing would ever recompute it. The effect runs after commit, when the
 * trigger is mounted, and the resulting state change re-renders with the real
 * container.
 */
export function useModalContainer(): HTMLElement | null {
  const anchorRef = usePortalAnchor();
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setContainer(findModalContainer(anchorRef?.current));
  }, [anchorRef]);

  return container;
}

/** Merges a forwarded ref with the anchor registration. */
export function useAnchoredRef<T extends HTMLElement>(forwardedRef: React.Ref<T>) {
  const anchorRef = usePortalAnchor();

  return React.useCallback(
    (node: T | null) => {
      if (anchorRef) anchorRef.current = node;

      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<T | null>).current = node;
    },
    [anchorRef, forwardedRef]
  );
}
