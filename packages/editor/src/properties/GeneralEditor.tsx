import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label, Slider } from '@parama-ui/react';
import { useEffect, useState } from 'react';
import { useEditor } from '../store/useEditor';
import { SectionPanel } from './SectionPanel';

type GeneralEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const GeneralEditor = ({ field, onChange }: GeneralEditorProps) => {
  const { editor } = useEditor();
  const { selectedFieldId, actions } = useFormBuilder();
  const [widthValue, setWidthValue] = useState<number>(1);

  const handleWidthChange = (width: number) => {
    setWidthValue(width);
    onChange({ width });
  };

  useEffect(() => {
    if (selectedFieldId) {
      const field = actions.getField(selectedFieldId) || null;
      setWidthValue(field?.width || 1);
    }
  }, [selectedFieldId]);

  return (
    <SectionPanel title="General">
      <FormItem>
        <Label className="tw-block tw-text-sm tw-font-medium">Label</Label>
        <Input
          type="text"
          placeholder="Field label"
          disabled={editor.options?.generalSettings === 'readonly'}
          value={('label' in field ? field.label : '') || ''}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </FormItem>
      <FormItem>
        <Label className="tw-block tw-text-sm tw-font-medium">Description</Label>
        <Input
          type="text"
          placeholder="e.g. This field is required"
          disabled={editor.options?.generalSettings === 'readonly'}
          value={('helpText' in field ? field.helpText : '') || ''}
          onChange={(e) => onChange({ helpText: e.target.value })}
        />
        <p className="form-description">Give a hint to the user</p>
      </FormItem>
      <FormItem>
        <Label className="tw-block tw-text-sm tw-font-medium">Width</Label>
        <div className="tw-grid tw-grid-cols-4 tw-gap-x-3">
          <Slider
            value={[widthValue]}
            disabled={editor.options?.generalSettings === 'readonly'}
            onValueChange={(value) => handleWidthChange(value[0])}
            min={1}
            max={12}
            step={1}
            className="tw-col-span-3"
          />
          <Input
            type="number"
            min={1}
            max={12}
            step={1}
            value={widthValue}
            disabled={editor.options?.generalSettings === 'readonly'}
            onChange={(e) => {
              const width = parseInt(e.target.value, 10);
              if (!isNaN(width) && width >= 1 && width <= 12) {
                handleWidthChange(width);
              }
            }}
            className="tw-col-span-1 tw-pr-0"
          />
        </div>
      </FormItem>
    </SectionPanel>
  );
};
