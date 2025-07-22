import { BlockField } from '@parama-dev/form-builder-types';
import { FormItem, Label, Textarea } from '@parama-ui/react';
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
      <FormItem>
        <Label className="block text-sm font-medium">HTML Content</Label>
        <Textarea
          rows={8}
          placeholder="Enter your HTML content here..."
          disabled={editor.options?.propertiesSettings === 'readonly'}
          value={typeof field.content === 'string' ? field.content : ''}
          onChange={(e) => onChange({ content: e.target.value })}
          className="font-mono text-sm"
        />
        <p className="form-description">
          You can use HTML tags and inline styles. Content will be rendered as-is in the form.
        </p>
      </FormItem>
    </SectionPanel>
  );
};
