import { Checkbox, FormItem, Input, Label, Slider } from '@parama-ui/react';
import { FormSchema } from '@parama-dev/form-builder-types';
import { useState } from 'react';

type LayoutEditorProps = {
  schema: FormSchema;
  onChange: (updates: Partial<FormSchema['layout']>) => void;
};

export const LayoutEditor: React.FC<LayoutEditorProps> = ({ schema, onChange }) => {
  const [colValue, setColValue] = useState<number>(schema.layout.colSize);
  const [gapValue, setGapValue] = useState<number>(schema.layout.gap);

  const handleColChange = (value: number) => {
    setColValue(value);
    onChange({ ...schema.layout, colSize: value });
  };
  const handleGapChange = (value: number) => {
    setGapValue(value);
    onChange({ ...schema.layout, gap: value });
  };

  return (
    <div className="">
      <h3 className="tw-font-semibold tw-uppercase tw-text-xs tw-text-gray-400 tw-border-b tw-border-gray-200 tw-p-4">
        Layout settings
      </h3>
      <div className="tw-space-y-3 tw-p-4">
        {/* <FormItem>
          <Label>Grid size</Label>
          <div className="tw-grid tw-grid-cols-4 tw-gap-x-3">
            <Slider
              value={[colValue]}
              onValueChange={(value) => handleColChange(value[0])}
              min={1}
              max={12}
              step={1}
              className="tw-col-span-3"
            />
            <Input
              type="number"
              value={colValue}
              max={12}
              min={1}
              className="tw-pr-0"
              onChange={(e) => handleColChange(Number(e.target.value))}
            />
          </div>
        </FormItem> */}
        <FormItem>
          <Label>Gap size</Label>
          <div className="tw-grid tw-grid-cols-4 tw-gap-x-3">
            <Slider
              value={[gapValue]}
              onValueChange={(value) => handleGapChange(value[0])}
              min={1}
              max={12}
              step={1}
              className="tw-col-span-3"
            />
            <Input
              type="number"
              value={gapValue}
              max={12}
              min={1}
              className="tw-pr-0"
              onChange={(e) => handleGapChange(Number(e.target.value))}
            />
          </div>
        </FormItem>
        {/* <FormItem className="tw-flex tw-items-center tw-space-y-0 tw-space-x-2">
          <Checkbox id="show-grid-lines" />
          <Label htmlFor="show-grid-lines" className="tw-text-gray-700">
            Show grid lines
          </Label>
        </FormItem> */}
      </div>
    </div>
  );
};
