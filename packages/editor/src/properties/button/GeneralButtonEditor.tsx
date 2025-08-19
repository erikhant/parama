import { useFormBuilder } from '@parama-dev/form-builder-core';
import { ButtonField, FormField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label, Slider } from '@parama-ui/react';
import { useEffect, useState } from 'react';
import { SectionPanel } from '../SectionPanel';
import { useEditor } from '../../store/useEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@parama-ui/react';
import { MonitorIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';

type GeneralButtonEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const GeneralButtonEditor = ({ field, onChange }: GeneralButtonEditorProps) => {
  const { editor } = useEditor();
  const { selectedFieldId, actions } = useFormBuilder();
  const [widthValue, setWidthValue] = useState<number>(1);
  const [widthTabletValue, setWidthTabletValue] = useState<number | undefined>(undefined);
  const [widthMobileValue, setWidthMobileValue] = useState<number | undefined>(undefined);

  const handleWidthChange = (width: number) => {
    setWidthValue(width);
    onChange({ width });
  };

  const handleWidthTabletChange = (width: number | undefined) => {
    setWidthTabletValue(width);
    onChange({ widthTablet: width });
  };

  const handleWidthMobileChange = (width: number | undefined) => {
    setWidthMobileValue(width);
    onChange({ widthMobile: width });
  };

  const handleActionChange = (action: ButtonField['action']) => {
    onChange({ action, type: action === 'cancel' ? 'button' : action });
  };

  useEffect(() => {
    if (selectedFieldId) {
      const field = actions.getField(selectedFieldId) || null;
      setWidthValue(field?.width || 1);
      setWidthTabletValue((field as any)?.widthTablet);
      setWidthMobileValue((field as any)?.widthMobile);
    }
  }, [selectedFieldId]);

  return (
    <SectionPanel title="General">
      <FormItem>
        <Label className="block text-sm font-medium">Label</Label>
        <Input
          type="text"
          placeholder="Field label"
          disabled={editor.options?.generalSettings === 'readonly'}
          value={('label' in field ? field.label : '') || ''}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </FormItem>
      <FormItem orientation="horizontal">
        <Label className="!col-span-3 text-sm font-medium">Action</Label>
        <div className="col-span-2">
          <Select
            disabled={editor.options?.generalSettings === 'readonly'}
            defaultValue={(field as ButtonField).action}
            onValueChange={(value) => handleActionChange(value as ButtonField['action'])}>
            <SelectTrigger className="w-full">
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
        <Label className="block text-sm font-medium flex items-center gap-2">
          <MonitorIcon size={16} />
          Width
        </Label>
        <div className="grid grid-cols-4 gap-x-3">
          <Slider
            value={[widthValue]}
            disabled={editor.options?.generalSettings === 'readonly'}
            onValueChange={(value) => handleWidthChange(value[0])}
            min={1}
            max={12}
            step={1}
            className="col-span-3"
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
            className="col-span-1 pr-0"
          />
        </div>
      </FormItem>

      <FormItem>
        <div className="space-y-1">
          <Label className="block text-sm font-medium flex items-center gap-2">
            <TabletIcon size={16} />
            Width in Tablet
          </Label>
          <p className="form-description">Leave blank to inherit Desktop width.</p>
        </div>
        <div className="grid grid-cols-4 gap-x-3 items-center">
          <Slider
            value={[widthTabletValue ?? widthValue]}
            disabled={editor.options?.generalSettings === 'readonly'}
            onValueChange={(value) => handleWidthTabletChange(value[0])}
            min={1}
            max={12}
            step={1}
            className="col-span-3"
          />
          <div className="col-span-1 flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={12}
              step={1}
              value={widthTabletValue ?? ''}
              placeholder={`${widthValue}`}
              disabled={editor.options?.generalSettings === 'readonly'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') return handleWidthTabletChange(undefined);
                const width = parseInt(val, 10);
                if (!isNaN(width) && width >= 1 && width <= 12) {
                  handleWidthTabletChange(width);
                }
              }}
              className="pr-0"
            />
          </div>
        </div>
      </FormItem>

      <FormItem>
        <div className="space-y-1">
          <Label className="block text-sm font-medium flex items-center gap-2">
            <SmartphoneIcon size={16} />
            Width in Mobile
          </Label>
          <p className="form-description">Leave blank to inherit Tablet/Desktop width.</p>
        </div>
        <div className="grid grid-cols-4 gap-x-3 items-center">
          <Slider
            value={[widthMobileValue ?? widthTabletValue ?? widthValue]}
            disabled={editor.options?.generalSettings === 'readonly'}
            onValueChange={(value) => handleWidthMobileChange(value[0])}
            min={1}
            max={12}
            step={1}
            className="col-span-3"
          />
          <div className="col-span-1 flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={12}
              step={1}
              value={widthMobileValue ?? ''}
              placeholder={`${widthTabletValue ?? widthValue}`}
              disabled={editor.options?.generalSettings === 'readonly'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') return handleWidthMobileChange(undefined);
                const width = parseInt(val, 10);
                if (!isNaN(width) && width >= 1 && width <= 12) {
                  handleWidthMobileChange(width);
                }
              }}
              className="pr-0"
            />
          </div>
        </div>
      </FormItem>
      {(field as ButtonField).action === 'submit' && (
        <FormItem orientation="horizontal">
          <Label className="!col-span-3 text-sm font-medium">Loading Text</Label>
          <div className="col-span-2">
            <Input
              disabled={editor.options?.generalSettings === 'readonly'}
              placeholder="Submitting..."
              value={(field as ButtonField).loadingText || ''}
              onChange={(e) => onChange({ loadingText: e.target.value })}
            />
          </div>
        </FormItem>
      )}
    </SectionPanel>
  );
};
