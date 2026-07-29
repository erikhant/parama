import { useEffect, useState } from 'react';
import type { EditorSuggestion, SupportedLanguage } from './languages';

declare global {
  interface Window {
    monaco: any;
  }
}

/** Characters that open the completion popup. */
const TRIGGER_CHARACTERS = ['{', '.', ' '];

/**
 * Registers the editor's custom completion provider and disposes it again.
 *
 * @remarks
 * This used to live in the `onMount` callback, which returned a disposer —
 * except `@monaco-editor/react` ignores that return value, so the provider was
 * never disposed. Every mount added another one, and because both the inline
 * and expanded editors mount, suggestions accumulated duplicates and the
 * providers leaked for the page's lifetime.
 *
 * Registration is global to the Monaco instance rather than per editor, so it
 * belongs in an effect keyed on what it registers, not in a mount handler.
 *
 * @returns `onEditorMount`, which the editor must call so registration can wait
 *          for Monaco to exist on `window`.
 */
export function useMonacoCompletions(language: SupportedLanguage, suggestions: EditorSuggestion[]) {
  const [isMonacoReady, setMonacoReady] = useState(false);

  // Suggestions usually arrive as an inline array literal, so a new reference
  // every render. Keying on content stops that re-registering the provider.
  const suggestionsKey = JSON.stringify(suggestions);

  useEffect(() => {
    if (!isMonacoReady || suggestions.length === 0) return;

    const monaco = window.monaco;
    if (!monaco) return;

    const provider = monaco.languages.registerCompletionItemProvider([language], {
      triggerCharacters: TRIGGER_CHARACTERS,
      provideCompletionItems: () => ({
        suggestions: suggestions.map((suggestion, index) => ({
          label: suggestion.label,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: suggestion.insertText,
          documentation: suggestion.documentation || '',
          detail: suggestion.detail || '',
          // Zero-padded so the editor keeps the caller's ordering rather than
          // sorting the labels alphabetically.
          sortText: `0${index.toString().padStart(3, '0')}`
        }))
      })
    });

    return () => provider.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonacoReady, language, suggestionsKey]);

  return { onEditorMount: () => setMonacoReady(true) };
}
