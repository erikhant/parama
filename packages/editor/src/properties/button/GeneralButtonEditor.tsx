import { useFormBuilder } from '@parama-dev/form-builder-core';
import { ButtonField, FormField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label, Slider } from '@parama-ui/react';
import { useEffect, useState } from 'react';
import { SectionPanel } from '../SectionPanel';
import { useEditor } from '../../store/useEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@parama-ui/react';

type GeneralButtonEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const GeneralButtonEditor = ({ field, onChange }: GeneralButtonEditorProps) => {
  const { editor } = useEditor();
  const { selectedFieldId, actions } = useFormBuilder();
  const [widthValue, setWidthValue] = useState<number>(1);

  const handleWidthChange = (width: number) => {
    setWidthValue(width);
    onChange({ width });
  };

  const handleActionChange = (action: ButtonField['action']) => {
    onChange({ action, type: action === 'cancel' ? 'button' : action });
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
      <FormItem orientation="horizontal">
        <Label className="!tw-col-span-3 tw-text-sm tw-font-medium">Action</Label>
        <div className="tw-col-span-2">
          <Select
            disabled={editor.options?.generalSettings === 'readonly'}
            defaultValue={(field as ButtonField).action}
            onValueChange={(value) => handleActionChange(value as ButtonField['action'])}>
            <SelectTrigger className="tw-w-full">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submit">Submit</SelectItem>
              <SelectItem value="reset">Reset</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
