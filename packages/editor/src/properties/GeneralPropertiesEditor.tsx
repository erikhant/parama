import { FieldGroupItem, FormField } from '@form-builder/types';
import { FormItem, Label, Input, FormGroup, Button } from '@parama-ui/react';
import { Plus, Trash2 } from 'lucide-react';

type GeneralPropertiesEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const GeneralPropertiesEditor: React.FC<
  GeneralPropertiesEditorProps
> = ({ field, onChange }) => {
  const renderTypeSpecificProperties = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'password':
      case 'email':
      case 'textarea':
        return (
          <FormItem>
            <Label>Placeholder</Label>
            <Input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onChange({ placeholder: e.target.value })}
            />
          </FormItem>
        );
      case 'select':
        return (
          <>
            <FormItem>
              <Label>Placeholder</Label>
              <Input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </FormItem>
            <div className="flex justify-between items-center">
              <Label>Options</Label>
              <Button
                onClick={() => {
                  const newOption = {
                    label: `Option label ${(field.options?.length || 0) + 1}`,
                    value: `option-${(field.options?.length || 0) + 1}`
                  };
                  onChange({
                    options: [
                      ...(field.options || []),
                      newOption
                    ] as FieldGroupItem[]
                  });
                }}
                size="xs"
                color="secondary"
                variant="ghost">
                <Plus size={15} />
              </Button>
            </div>
            {field.options?.map((option, index) => (
              <FormItem
                key={option.value}
                orientation="horizontal"
                className="space-x-0 items-center pl-3 border-l-4 border-gray-200">
                <div className="col-span-4 space-y-2">
                  <Input
                    type="text"
                    placeholder="Option label"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[index].label = e.target.value;
                      onChange({ options: newOptions });
                    }}
                  />
                  <Input
                    type="text"
                    value={option.value}
                    placeholder="Option value"
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[index].value = e.target.value;
                      onChange({ options: newOptions });
                    }}
                  />
                </div>
                <div className="col-span-1 shrink-0">
                  <Button
                    className="self-center"
                    variant="ghost"
                    size="xs"
                    color="secondary"
                    onClick={() => {
                      const newOptions = field.options!.filter(
                        (_, i) => i !== index
                      );
                      onChange({ options: newOptions });
                    }}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </FormItem>
            ))}
          </>
        );

      // Add more field type cases as needed
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <h6 className="font-semibold uppercase text-xs text-gray-400">General</h6>
      {renderTypeSpecificProperties()}
    </div>
  );
};
