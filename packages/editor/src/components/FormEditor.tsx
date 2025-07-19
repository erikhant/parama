import type { FormEditorProps } from '@form-builder/types';
import { Editor } from './Editor';
import { EditorProvider } from './EditorProvider';

export const FormEditor: React.FC<FormEditorProps> = (props) => {
  return (
    <EditorProvider {...props}>
      <Editor />
    </EditorProvider>
  );
};
