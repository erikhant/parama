import type { FormEditorProps } from '@parama-dev/form-builder-types';
import { Editor } from './Editor';
import { EditorProvider } from './EditorProvider';

export const FormEditor: React.FC<FormEditorProps> = (props) => {
  return (
    <EditorProvider {...props}>
      <Editor onSaveSchema={props.onSaveSchema} />
    </EditorProvider>
  );
};
