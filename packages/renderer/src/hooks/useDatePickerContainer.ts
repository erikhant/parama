import { useEffect, useState } from 'react';

/**
 * Resolves the DOM node a date picker popover should portal into.
 *
 * The picker must anchor inside its own `FormItem` wrapper, but that element is
 * created by the same render pass that mounts the picker, so it may not exist
 * on the first effect run. The element is looked up immediately and, failing
 * that, watched for with a `MutationObserver` that disconnects as soon as it
 * appears.
 *
 * @param fieldId - Field whose `item__<id>` wrapper should host the popover
 * @param enabled - Skip the lookup entirely for non-date fields
 * @returns The container element, or `null` until it is found
 */
export function useDatePickerContainer(fieldId: string, enabled: boolean): HTMLElement | null {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const elementId = `item__${fieldId}`;

    const findElement = (): boolean => {
      const element = document.getElementById(elementId);
      if (!element) return false;
      setContainer(element);
      return true;
    };

    if (findElement()) return;

    const observer = new MutationObserver(() => {
      if (findElement()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [fieldId, enabled]);

  return container;
}
