import { Editor } from '@monaco-editor/react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormItem,
  Label,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@parama-ui/react';
import { Braces, Code2, ExpandIcon, FileText, TextIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    monaco: any;
  }
}

type SupportedLanguage = 'html' | 'javascript' | 'json' | 'plaintext' | 'css' | 'typescript';

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
  placeholder?: string;
  label?: string;
  description?: string;
  showExpand?: boolean;
  showLanguageToggle?: boolean;
  autocompleteSuggestions?: Array<{
    label: string;
    insertText: string;
    documentation?: string;
    detail?: string;
  }>;
  className?: string;
}

const LANGUAGE_ICONS: Record<SupportedLanguage, any> = {
  html: FileText,
  javascript: Code2,
  typescript: Code2,
  json: Braces,
  plaintext: TextIcon,
  css: FileText
};

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  html: 'HTML',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  plaintext: 'Plain Text',
  css: 'CSS'
};

export const CodeEditor = ({
  value = '',
  onChange,
  onMount,
  defaultLang = 'plaintext',
  languages = ['plaintext'],
  height = '120px',
  expandedHeight = '400px',
  modalWidth = '1024px',
  readOnly = false,
  placeholder = 'Enter your code here...',
  label,
  description,
  showExpand = true,
  showLanguageToggle = true,
  autocompleteSuggestions = [],
  className = ''
}: CodeEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    languages.includes(defaultLang) ? defaultLang : languages[0] || 'plaintext'
  );
  const monacoEditorRef = useRef<any>(null);

  // Update editorValue when value prop changes
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      const finalValue = newValue || '';
      setEditorValue(finalValue);
      onChange?.(finalValue);
    },
    [onChange]
  );

  const handleEditorMount = useCallback(
    (editorInstance: any) => {
      monacoEditorRef.current = editorInstance;
      onMount?.(editorInstance);

      // Register custom completion provider if suggestions are provided
      if (autocompleteSuggestions.length > 0 && window.monaco) {
        const completionProvider = window.monaco.languages.registerCompletionItemProvider([currentLanguage], {
          triggerCharacters: ['{', '.', ' '],
          provideCompletionItems: () => {
            const suggestions = autocompleteSuggestions.map((suggestion, index) => ({
              label: suggestion.label,
              kind: window.monaco.languages.CompletionItemKind.Variable,
              insertText: suggestion.insertText,
              documentation: suggestion.documentation || '',
              detail: suggestion.detail || '',
              sortText: `0${index.toString().padStart(3, '0')}`
            }));

            return { suggestions };
          }
        });

        // Cleanup function
        return () => {
          completionProvider.dispose();
        };
      }
    },
    [autocompleteSuggestions, currentLanguage, onMount]
  );

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
  };

  const LanguageSwitchButton = ({ size = 'xs' }: { size?: 'xs' | 'sm' }) => {
    if (!showLanguageToggle || languages.length <= 1) return null;

    return (
      <div className="flex items-center gap-1">
        {languages.map((lang, index) => {
          const Icon = LANGUAGE_ICONS[lang];
          return (
            <div key={lang} className="flex items-center gap-1">
              {index > 0 && <Separator className="bg-gray-400 h-4 w-[1px]" orientation="vertical" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={size}
                      variant={currentLanguage === lang ? 'outline' : 'ghost'}
                      color="secondary"
                      className="flex items-center gap-1"
                      onClick={() => handleLanguageChange(lang)}
                      disabled={readOnly}>
                      <Icon size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="form-description text-gray-700 leading-relaxed">{LANGUAGE_LABELS[lang]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    );
  };

  const getEditorOptions = (isCompact: boolean) => ({
    readOnly,
    fontSize: isCompact ? 13 : 14,
    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    lineNumbers: (isCompact ? 'off' : 'on') as 'off' | 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    suggest: {
      showFields: true,
      showVariables: true,
      showFunctions: currentLanguage === 'javascript' || currentLanguage === 'typescript',
      showConstructors: currentLanguage === 'javascript' || currentLanguage === 'typescript',
      showModules: currentLanguage === 'javascript' || currentLanguage === 'typescript',
      showTypeParameters: currentLanguage === 'typescript',
      showClasses: currentLanguage === 'javascript' || currentLanguage === 'typescript',
      showInterfaces: currentLanguage === 'typescript',
      showEnums: currentLanguage === 'typescript'
    }
  });

  const compactEditor = (
    <div className={`relative ${className}`}>
      <Editor
        height={height}
        language={currentLanguage}
        theme="light"
        value={editorValue}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={getEditorOptions(true)}
      />
      {showExpand && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Button
            size="xs"
            variant="ghost"
            color="secondary"
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
            onClick={() => setIsExpanded(true)}
            disabled={readOnly}>
            <ExpandIcon size={12} />
          </Button>
        </div>
      )}
    </div>
  );

  const expandedEditor = showExpand ? (
    <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
      <DialogContent className="" style={{ width: '100%', maxWidth: modalWidth }}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">{label ? `${label} Editor` : 'Code Editor'}</div>
            <div className="ml-auto flex items-center gap-1 mr-4">
              <LanguageSwitchButton size="xs" />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {autocompleteSuggestions.length > 0 && (
            <div className="text-sm text-gray-600">
              <p>
                <strong>Available Suggestions:</strong>
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {autocompleteSuggestions.map((suggestion, index) => (
                  <code
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs cursor-pointer hover:bg-blue-200"
                    onClick={() => {
                      const currentValue = monacoEditorRef.current?.getValue() || '';
                      const newValue = currentValue + suggestion.insertText;
                      monacoEditorRef.current?.setValue(newValue);
                      handleChange(newValue);
                    }}>
                    {suggestion.label}
                  </code>
                ))}
              </div>
            </div>
          )}
          <Editor
            height={expandedHeight}
            language={currentLanguage}
            theme="light"
            value={editorValue}
            onChange={handleChange}
            onMount={handleEditorMount}
            options={getEditorOptions(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  ) : null;

  const editorComponent = (
    <>
      {compactEditor}
      {expandedEditor}
    </>
  );

  if (label || description) {
    return (
      <FormItem>
        {label && (
          <div className="flex items-center justify-between">
            <Label>{label}</Label>
            {showLanguageToggle && (
              <div className="ml-auto flex items-center gap-1 mr-2">
                <LanguageSwitchButton size="xs" />
              </div>
            )}
          </div>
        )}
        {editorComponent}
        {description && <p className="form-description">{description}</p>}
      </FormItem>
    );
  }

  return editorComponent;
};
