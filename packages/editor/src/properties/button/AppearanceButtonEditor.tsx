import { ButtonField, FormField } from '@form-builder/types';
import { Button, FormItem, Label } from '@parama-ui/react';
import { SectionPanel } from '../SectionPanel';
import { CheckCircleIcon } from 'lucide-react';

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
        <div className="flex flex-wrap items-center gap-2">
          <Button color="primary" size="sm" onClick={() => handleColorChange('primary')}>
            Primary
            {(field as ButtonField).appearance?.color === 'primary' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="secondary" size="sm" onClick={() => handleColorChange('secondary')}>
            Secondary
            {(field as ButtonField).appearance?.color === 'secondary' && <CheckCircleIcon className="size-4" />}
          </Button>
        </div>
      </FormItem>
      <FormItem>
        <Label className="block text-sm font-medium">Button variant</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button color="primary" size="sm" variant="fill" onClick={() => handleVariantChange('fill')}>
            Fill
            {(field as ButtonField).appearance?.variant === 'fill' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="primary" size="sm" variant="outline" onClick={() => handleVariantChange('outline')}>
            Outline
            {(field as ButtonField).appearance?.variant === 'outline' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="primary" size="sm" variant="ghost" onClick={() => handleVariantChange('ghost')}>
            Ghost
            {(field as ButtonField).appearance?.variant === 'ghost' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="primary" size="sm" variant="shadow" onClick={() => handleVariantChange('shadow')}>
            Shadow
            {(field as ButtonField).appearance?.variant === 'shadow' && <CheckCircleIcon className="size-4" />}
          </Button>
        </div>
      </FormItem>
      <FormItem>
        <Label className="block text-sm font-medium">Button size</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button color="secondary" size="xs" onClick={() => handleSizeChange('xs')}>
            XS
            {(field as ButtonField).appearance?.size === 'xs' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="secondary" size="sm" onClick={() => handleSizeChange('sm')}>
            SM
            {(field as ButtonField).appearance?.size === 'sm' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="secondary" size="default" onClick={() => handleSizeChange('default')}>
            Default
            {(field as ButtonField).appearance?.size === 'default' && <CheckCircleIcon className="size-4" />}
          </Button>
          <Button color="secondary" size="lg" onClick={() => handleSizeChange('lg')}>
            LG
            {(field as ButtonField).appearance?.size === 'lg' && <CheckCircleIcon className="size-4" />}
          </Button>
        </div>
      </FormItem>
    </SectionPanel>
  );
};
