import { FormItem, Input, Label } from '@parama-ui/react';
import { useEditor } from '../../store/useEditor';

interface DefaultValueProps {
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
}

export const DefaultValue = ({ type, value, onChange }: DefaultValueProps) => {
  const { editor } = useEditor();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormItem>
      <Label>Default value</Label>
      <Input
        type={type}
        value={value}
        disabled={editor.options?.propertiesSettings === 'readonly'}
        onChange={handleChange}
      />
      <p className="form-description">Used as the initial value when the form is loaded.</p>
    </FormItem>
  );
};
