import { BlockField } from '@parama-dev/form-builder-types';
import { CodeEditor } from '../../components/CodeEditor';
import { useEditor } from '../../store/useEditor';
import { SectionPanel } from '../SectionPanel';

type BlockContentEditorProps = {
  field: BlockField;
  onChange: (updates: Partial<BlockField>) => void;
};

export const BlockContentEditor = ({ field, onChange }: BlockContentEditorProps) => {
  const { editor } = useEditor();

  if (field.type === 'spacer') {
    return null; // Spacers don't need content editor
  }

  return (
    <SectionPanel title="Content">
      <CodeEditor
        label="HTML Content"
        defaultLang="html"
        languages={['html', 'plaintext']}
        value={typeof field.content === 'string' ? field.content : ''}
        onChange={(value) => onChange({ content: value })}
        readOnly={editor.options?.propertiesSettings === 'readonly'}
        placeholder="Enter your HTML content here..."
        description="You can use HTML tags and inline styles. Content will be rendered as-is in the form."
        height="120px"
        expandedHeight="400px"
        showExpand={true}
        showLanguageToggle={true}
      />
    </SectionPanel>
  );
};
