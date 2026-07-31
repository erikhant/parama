import { Editor } from '@monaco-editor/react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, FormItem, Label } from '@parama-ui/react';
import { ExpandIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildEditorOptions } from './codeEditor/editorOptions';
import { LanguageSwitch } from './codeEditor/LanguageSwitch';
import { resolveInitialLanguage, type EditorSuggestion, type SupportedLanguage } from './codeEditor/languages';
import { SuggestionChips } from './codeEditor/SuggestionChips';
import { useMonacoCompletions } from './codeEditor/useMonacoCompletions';
import { useMonacoTheme } from './codeEditor/useMonacoTheme';

export type { EditorSuggestion, SupportedLanguage };

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onMount?: (editor: any) => void;
  defaultLang?: SupportedLanguage;
  languages?: SupportedLanguage[];
  height?: string;
  expandedHeight?: string;
  modalWidth?: string;
  readOnly?: boolean;
  label?: string;
  description?: string;
  showExpand?: boolean;
  showLanguageToggle?: boolean;
  autocompleteSuggestions?: EditorSuggestion[];
  className?: string;
}

/** Stable default so the completions effect is not re-keyed every render. */
const NO_SUGGESTIONS: EditorSuggestion[] = [];
const DEFAULT_LANGUAGES: SupportedLanguage[] = ['plaintext'];

/**
 * Monaco-backed code editor with an optional expand-to-dialog view.
 *
 * The same buffer is presented twice — inline and, when expanded, in a dialog —
 * so both editors read from one piece of state and share one options builder.
 * Only the presentation differs.
 */
export const CodeEditor = ({
  value = '',
  onChange,
  onMount,
  defaultLang = 'plaintext',
  languages = DEFAULT_LANGUAGES,
  height = '120px',
  expandedHeight = '400px',
  modalWidth = '1024px',
  readOnly = false,
  label,
  description,
  showExpand = true,
  showLanguageToggle = true,
  autocompleteSuggestions = NO_SUGGESTIONS,
  className = ''
}: CodeEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  const [language, setLanguage] = useState<SupportedLanguage>(() =>
    resolveInitialLanguage(defaultLang, languages)
  );

  const monacoEditorRef = useRef<any>(null);
  const { onEditorMount } = useMonacoCompletions(language, autocompleteSuggestions);
  const monaco = useMonacoTheme();

  // Follow the value prop when the caller drives it, e.g. switching fields.
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = useCallback(
    (next: string | undefined) => {
      const settled = next ?? '';
      setEditorValue(settled);
      onChange?.(settled);
    },
    [onChange]
  );

  const handleMount = useCallback(
    (instance: any) => {
      monacoEditorRef.current = instance;
      onEditorMount();
      onMount?.(instance);
    },
    [onEditorMount, onMount]
  );

  /** Appends a suggestion at the end of the buffer, from the chip palette. */
  const handleInsertSuggestion = useCallback(
    (insertText: string) => {
      const next = (monacoEditorRef.current?.getValue() || '') + insertText;
      monacoEditorRef.current?.setValue(next);
      handleChange(next);
    },
    [handleChange]
  );

  const languageSwitch = showLanguageToggle ? (
    <LanguageSwitch languages={languages} current={language} disabled={readOnly} onChange={setLanguage} />
  ) : null;

  const editors = (
    <>
      <div className={`relative ${className}`}>
        <Editor
          height={height}
          language={language}
          theme={monaco.theme}
          beforeMount={monaco.beforeMount}
          value={editorValue}
          onChange={handleChange}
          onMount={handleMount}
          options={buildEditorOptions({ compact: true, language, readOnly })}
        />
        {showExpand && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Button
              size="xs"
              variant="ghost"
              color="secondary"
              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
              disabled={readOnly}
              aria-label="Expand editor"
              onClick={() => setIsExpanded(true)}>
              <ExpandIcon size={12} />
            </Button>
          </div>
        )}
      </div>

      {showExpand && (
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent style={{ width: '100%', maxWidth: modalWidth }}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">{label ? `${label} Editor` : 'Code Editor'}</div>
                <div className="ml-auto flex items-center gap-1 mr-4">{languageSwitch}</div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              <SuggestionChips suggestions={autocompleteSuggestions} onInsert={handleInsertSuggestion} />
              <Editor
                height={expandedHeight}
                language={language}
                theme={monaco.theme}
          beforeMount={monaco.beforeMount}
                value={editorValue}
                onChange={handleChange}
                onMount={handleMount}
                options={buildEditorOptions({ compact: false, language, readOnly })}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  if (!label && !description) return editors;

  return (
    <FormItem>
      {label && (
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          {languageSwitch && <div className="ml-auto flex items-center gap-1 mr-2">{languageSwitch}</div>}
        </div>
      )}
      {editors}
      {description && <p className="form-description">{description}</p>}
    </FormItem>
  );
};
