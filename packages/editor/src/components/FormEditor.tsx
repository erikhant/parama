import type { FormEditorProps } from '@parama-dev/form-builder-types';
import { ThemeProvider } from '@parama-ui/react';
import { Editor } from './Editor';
import { EditorProvider } from './EditorProvider';

/**
 * The form editor.
 *
 * The theme wraps everything, including the toolbar toggle that changes it, and
 * carries `h-full` so the provider's own element does not collapse the editor's
 * full-height layout.
 */
export const FormEditor: React.FC<FormEditorProps> = (props) => {
  return (
    <ThemeProvider theme={props.theme} onThemeChange={props.onThemeChange} className="h-full">
      <EditorProvider {...props}>
        <Editor onSaveSchema={props.onSaveSchema} />
      </EditorProvider>
    </ThemeProvider>
  );
};
