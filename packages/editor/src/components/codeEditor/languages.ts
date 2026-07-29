import { Braces, Code2, FileText, TextIcon, type LucideIcon } from 'lucide-react';

/** Languages the code editor can highlight. */
export type SupportedLanguage = 'html' | 'javascript' | 'json' | 'plaintext' | 'css' | 'typescript';

/** One completion entry offered inside the editor. */
export interface EditorSuggestion {
  label: string;
  insertText: string;
  documentation?: string;
  detail?: string;
}

/** Icon shown on each language's toggle button. */
export const LANGUAGE_ICONS: Record<SupportedLanguage, LucideIcon> = {
  html: FileText,
  javascript: Code2,
  typescript: Code2,
  json: Braces,
  plaintext: TextIcon,
  css: FileText
};

/** Display name shown in each toggle's tooltip. */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  html: 'HTML',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  plaintext: 'Plain Text',
  css: 'CSS'
};

/**
 * Picks the language an editor should open in.
 *
 * Falls back to the first offered language, then to plain text, so a
 * `defaultLang` that is not in the offered list cannot leave the editor in a
 * mode its toggle cannot switch away from.
 */
export function resolveInitialLanguage(
  defaultLang: SupportedLanguage,
  languages: SupportedLanguage[]
): SupportedLanguage {
  if (languages.includes(defaultLang)) return defaultLang;
  return languages[0] ?? 'plaintext';
}
