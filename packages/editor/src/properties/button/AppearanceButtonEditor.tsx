import { ButtonField, FormField } from '@form-builder/types';
import { Button, FormItem, Label } from '@parama-ui/react';
import { SectionPanel } from '../SectionPanel';

type AppearanceButtonEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const AppearanceButtonEditor = ({ field, onChange }: AppearanceButtonEditorProps) => {
  const handleColorChange = (color: string) => {
    onChange({ appearance: { ...(field as ButtonField).appearance, color } });
  };
  const handleVariantChange = (variant: string) => {
    onChange({ appearance: { ...(field as ButtonField).appearance, variant } });
  };
  const handleSizeChange = (size: string) => {
    onChange({ appearance: { ...(field as ButtonField).appearance, size } });
  };

  return (
    <SectionPanel title="Appearance">
      <FormItem>
        <Label className="block text-sm font-medium">Button color</Label>
        <div className="flex items-center gap-2">
          <Button color="primary" size="sm" onClick={() => handleColorChange('primary')}>
            Primary
          </Button>
          <Button color="secondary" size="sm" onClick={() => handleColorChange('secondary')}>
            Secondary
          </Button>
        </div>
      </FormItem>
      <FormItem>
        <Label className="block text-sm font-medium">Button variant</Label>
        <div className="flex items-center gap-2">
          <Button color="primary" size="sm" variant="fill" onClick={() => handleVariantChange('fill')}>
            Fill
          </Button>
          <Button color="primary" size="sm" variant="outline" onClick={() => handleVariantChange('outline')}>
            Outline
          </Button>
          <Button color="primary" size="sm" variant="ghost" onClick={() => handleVariantChange('ghost')}>
            Ghost
          </Button>
          <Button color="primary" size="sm" variant="shadow" onClick={() => handleVariantChange('shadow')}>
            Shadow
          </Button>
        </div>
      </FormItem>
      <FormItem>
        <Label className="block text-sm font-medium">Button size</Label>
        <div className="flex items-center gap-2">
          <Button color="secondary" size="xs" onClick={() => handleSizeChange('xs')}>
            XS
          </Button>
          <Button color="secondary" size="sm" onClick={() => handleSizeChange('sm')}>
            SM
          </Button>
          <Button color="secondary" size="default" onClick={() => handleSizeChange('default')}>
            Default
          </Button>
          <Button color="secondary" size="lg" onClick={() => handleSizeChange('lg')}>
            LG
          </Button>
        </div>
      </FormItem>
    </SectionPanel>
  );
};
