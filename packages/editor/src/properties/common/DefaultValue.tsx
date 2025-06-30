import { FormItem, Input, Label } from '@parama-ui/react';

interface DefaultValueProps {
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
}

export const DefaultValue = ({ type, value, onChange }: DefaultValueProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormItem>
      <Label>Default value</Label>
      <Input type={type} value={value} onChange={handleChange} />
      <p className="form-description">Used as the initial value when the form is loaded.</p>
    </FormItem>
  );
};
