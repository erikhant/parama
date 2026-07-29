import type { SupportedLanguage } from './languages';

export interface EditorOptionsQuery {
  /** The inline editor is compact; the expanded dialog editor is not. */
  compact: boolean;
  language: SupportedLanguage;
  readOnly: boolean;
}

/** Languages with functions, classes and constructors worth suggesting. */
const SCRIPTING_LANGUAGES = new Set<SupportedLanguage>(['javascript', 'typescript']);

/** Font sizes, in px, for the two editor presentations. */
const FONT_SIZE = { compact: 13, expanded: 14 };

const EDITOR_FONT_STACK = "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace";

/**
 * Builds the Monaco configuration for one editor instance.
 *
 * The compact and expanded editors previously each spelled out their own copy
 * of this object, differing only in font size and line numbers — so a setting
 * changed in one silently did not apply in the other.
 *
 * Suggestion categories are gated by language: offering interfaces and enums in
 * a plaintext or JSON buffer just adds noise to the completion list.
 */
export function buildEditorOptions({ compact, language, readOnly }: EditorOptionsQuery) {
  const isScripting = SCRIPTING_LANGUAGES.has(language);
  const isTypeScript = language === 'typescript';

  return {
    readOnly,
    fontSize: compact ? FONT_SIZE.compact : FONT_SIZE.expanded,
    fontFamily: EDITOR_FONT_STACK,
    lineNumbers: (compact ? 'off' : 'on') as 'off' | 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    suggest: {
      showFields: true,
      showVariables: true,
      showFunctions: isScripting,
      showConstructors: isScripting,
      showModules: isScripting,
      showClasses: isScripting,
      showTypeParameters: isTypeScript,
      showInterfaces: isTypeScript,
      showEnums: isTypeScript
    }
  };
}
