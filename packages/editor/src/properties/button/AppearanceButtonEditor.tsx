import { ButtonField, FormField } from '@parama-dev/form-builder-types';
import { Button, FormItem, Label, Switch } from '@parama-ui/react';
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
  const handleStickyChange = (sticky: boolean) => {
    onChange({ appearance: { ...(field as ButtonField).appearance, stickyAtBottom: sticky } });
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
      <FormItem className="!mt-5">
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
      <FormItem className="!mt-5">
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
      <FormItem orientation="horizontal" className="!mt-5">
        <div className="col-span-4 space-y-1.5">
          <Label htmlFor="sticky-at-bottom" className="block text-sm font-medium">
            Sticky to the bottom
          </Label>
          <p className="form-description">Make it stick to the bottom when scrolling form.</p>
        </div>
        <div className="col-span-1 flex justify-end">
          <Switch
            id="sticky-at-bottom"
            checked={(field as ButtonField).appearance?.stickyAtBottom || false}
            onCheckedChange={handleStickyChange}
          />
        </div>
      </FormItem>
    </SectionPanel>
  );
};
