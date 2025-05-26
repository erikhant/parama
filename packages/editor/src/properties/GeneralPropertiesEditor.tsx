import { FieldGroupItem, FormField } from '@form-builder/types';

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
          <div className="space-y-2">
            <label className="block text-sm font-medium">Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        );
      case 'select':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Options</label>
            {field.options?.map((option, index) => (
              <div key={option.value} className="flex space-x-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...field.options!];
                    newOptions[index].label = e.target.value;
                    onChange({ options: newOptions });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={() => {
                    const newOptions = field.options!.filter(
                      (_, i) => i !== index
                    );
                    onChange({ options: newOptions });
                  }}
                  className="px-2 text-red-500">
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOption = { label: '', value: `opt-${Date.now()}` };
                onChange({
                  options: [
                    ...(field.options || []),
                    newOption
                  ] as FieldGroupItem[]
                });
              }}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm">
              + Add Option
            </button>
          </div>
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
