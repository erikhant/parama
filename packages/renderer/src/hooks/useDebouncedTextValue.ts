import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

/** Delay before a keystroke is committed to the store, in milliseconds. */
export const TEXT_COMMIT_DELAY = 150;

/**
 * Keeps a text input responsive while throttling writes to the store.
 *
 * The input renders from local state so typing never waits on validation or
 * condition evaluation; the value is pushed to the store once typing pauses.
 * External writes (a `setValue` event, a new `data` prop) flow back into the
 * local value.
 *
 * @param storeValue - Current value held by the store
 * @param onCommit - Called with the settled value
 * @param delay - Debounce window; defaults to {@link TEXT_COMMIT_DELAY}
 * @returns The live input value and its setter
 */
export function useDebouncedTextValue(
  storeValue: unknown,
  onCommit: (value: string) => void,
  delay: number = TEXT_COMMIT_DELAY
): readonly [string, (value: string) => void] {
  const [text, setText] = useState<string>((storeValue as string) ?? '');
  const [debounced] = useDebounce(text, delay);

  // The initial value came from the store, so committing it back on mount would
  // be a redundant write that also fires the workflow engine.
  const isFirstCommit = useRef(true);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => {
    if (isFirstCommit.current) {
      isFirstCommit.current = false;
      return;
    }
    commitRef.current(debounced);
  }, [debounced]);

  useEffect(() => {
    const next = (storeValue as string) ?? '';
    setText((prev) => (prev !== next ? next : prev));
  }, [storeValue]);

  return [text, setText] as const;
}
