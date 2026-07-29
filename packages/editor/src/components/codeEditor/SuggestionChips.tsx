import { memo } from 'react';
import type { EditorSuggestion } from './languages';

interface SuggestionChipsProps {
  suggestions: EditorSuggestion[];
  onInsert: (insertText: string) => void;
}

/**
 * Clickable palette of the completions available in the expanded editor.
 *
 * Duplicates what typing a trigger character offers, deliberately: in the
 * expanded dialog the author is often looking at an empty buffer and has no way
 * to discover which variables exist.
 */
export const SuggestionChips = memo<SuggestionChipsProps>(({ suggestions, onInsert }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="text-sm text-gray-600">
      <p>
        <strong>Available Suggestions:</strong>
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs cursor-pointer hover:bg-blue-200"
            onClick={() => onInsert(suggestion.insertText)}>
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
});

SuggestionChips.displayName = 'SuggestionChips';
