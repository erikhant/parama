import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { FormSchema } from '@parama-dev/form-builder-types';
import { PlayIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@parama-ui/react';

interface PreviewProps {
  disabled: boolean;
  schema: FormSchema;
  onOpenChange?: (open: boolean) => void;
}

export const Preview: React.FC<PreviewProps> = ({ disabled, schema, onOpenChange }) => {
  const { actions, screenSize } = useFormBuilder();

  return (
    <Sheet
      onOpenChange={(open) => {
        onOpenChange?.(open);
        if (!open) {
          actions.resetForm(); // Reset form when closing preview
        }
      }}>
      <SheetTrigger asChild>
        <Button color="secondary" size="sm" variant="ghost" disabled={disabled} className="rounded-md">
          <PlayIcon size={16} />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent
        className={`w-full ${screenSize === 'mobile' ? '!max-w-sm' : screenSize === 'tablet' ? '!max-w-2xl' : '!max-w-4xl'}`}>
        <SheetHeader>
          <SheetTitle>{schema.title || 'Preview'}</SheetTitle>
          <SheetDescription>{schema.description || ''}</SheetDescription>
        </SheetHeader>
        <div className="px-1 py-4 min-h-[calc(100vh-150px)] overflow-y-auto">
          <FormRenderer
            schema={schema}
            onSubmit={(data) =>
              toast.success('Form submitted successfully!', {
                description: () => {
                  return <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(data, null, 2)}</pre>;
                },
                duration: 5000
              })
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
