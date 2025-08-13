import { useFormBuilder } from '@parama-dev/form-builder-core';
import { BlockField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label, Slider } from '@parama-ui/react';
import { useEffect, useState } from 'react';
import { useEditor } from '../../store/useEditor';
import { SectionPanel } from '../SectionPanel';

type GeneralBlockEditorProps = {
  field: BlockField;
  onChange: (updates: Partial<BlockField>) => void;
};

export const GeneralBlockEditor = ({ field, onChange }: GeneralBlockEditorProps) => {
  const { editor } = useEditor();
  const { selectedFieldId, actions } = useFormBuilder();
  const [widthValue, setWidthValue] = useState<number>(1);
  const [heightValue, setHeightValue] = useState<number>(1);
  const [widthTabletValue, setWidthTabletValue] = useState<number | undefined>(undefined);
  const [widthMobileValue, setWidthMobileValue] = useState<number | undefined>(undefined);

  const handleWidthChange = (width: number) => {
    setWidthValue(width);
    onChange({ width });
  };

  const handleHeightChange = (height: number) => {
    setHeightValue(height);
    onChange({ height });
  };

  const handleWidthTabletChange = (width: number | undefined) => {
    setWidthTabletValue(width);
    onChange({ widthTablet: width });
  };

  const handleWidthMobileChange = (width: number | undefined) => {
    setWidthMobileValue(width);
    onChange({ widthMobile: width });
  };

  useEffect(() => {
    if (selectedFieldId) {
      const selectedField = actions.getField(selectedFieldId) || null;
      setWidthValue(selectedField?.width || 1);
      // Type assertion is safe here since this component only renders for BlockField types
      setHeightValue((selectedField as BlockField)?.height || 1);
      setWidthTabletValue((selectedField as any)?.widthTablet);
      setWidthMobileValue((selectedField as any)?.widthMobile);
    }
  }, [selectedFieldId]);

  return (
    <SectionPanel title="General">
      <FormItem>
        <Label className="block text-sm font-medium">Width</Label>
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
        <Label className="block text-sm font-medium">Width (Tablet)</Label>
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
        <p className="form-description">Leave blank to inherit Desktop width.</p>
      </FormItem>

      <FormItem>
        <Label className="block text-sm font-medium">Width (Mobile)</Label>
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
        <p className="form-description">Leave blank to inherit Tablet/Desktop width.</p>
      </FormItem>
      <FormItem>
        <Label className="block text-sm font-medium">Height</Label>
        <div className="grid grid-cols-4 gap-x-3">
          <Slider
            value={[heightValue]}
            disabled={editor.options?.generalSettings === 'readonly'}
            onValueChange={(value) => handleHeightChange(value[0])}
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
            value={heightValue}
            disabled={editor.options?.generalSettings === 'readonly'}
            onChange={(e) => {
              const height = parseInt(e.target.value, 10);
              if (!isNaN(height) && height >= 1 && height <= 12) {
                handleHeightChange(height);
              }
            }}
            className="col-span-1 pr-0"
          />
        </div>
      </FormItem>
    </SectionPanel>
  );
};
