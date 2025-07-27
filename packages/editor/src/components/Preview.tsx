import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { FormSchema } from '@parama-dev/form-builder-types';
import { PlayIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@parama-ui/react';

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
        <Button color="secondary" size="sm" variant="ghost" disabled={disabled} className="tw-rounded-md">
          <PlayIcon size={16} />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent
        className={`tw-w-full !tw-px-0 ${screenSize === 'mobile' ? '!tw-max-w-sm' : screenSize === 'tablet' ? '!tw-max-w-2xl' : '!tw-max-w-4xl'}`}>
        <SheetHeader className="tw-px-8">
          <SheetTitle>{schema.title || 'Preview'}</SheetTitle>
          <SheetDescription>{schema.description || ''}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="tw-p-8 tw-h-[90vh] tw-relative">
          <FormRenderer
            schema={schema}
            className="tw-px-1"
            onSubmit={(data, contentType) => {
              if (contentType === 'application/json') {
                toast.success('Form submitted successfully!', {
                  description: () => {
                    return (
                      <>
                        <p className="tw-text-xs">Content type : {contentType}</p>
                        <pre className="tw-whitespace-pre-wrap tw-break-words tw-text-xs">
                          {JSON.stringify(data, null, 2)}
                        </pre>
                      </>
                    );
                  },
                  duration: 5000
                });
              } else {
                toast.success('Form submitted successfully!', {
                  description: () => {
                    const formEntries = Array.from((data as FormData).entries());
                    return (
                      <div className="tw-space-y-1">
                        <p className="tw-text-xs">Content type : {contentType}</p>
                        <p className="tw-text-xs">Entries : {formEntries.length}</p>
                        {formEntries.map(([key, value], index) => {
                          if (value instanceof File) {
                            return (
                              <p key={`${key}_${index}`} className="tw-text-xs">
                                📁 {key}: {value.name} ({value.size} bytes)
                              </p>
                            );
                          } else {
                            return (
                              <p key={`${key}_${index}`} className="tw-text-xs">
                                📝 {key}: {String(value)}
                              </p>
                            );
                          }
                        })}
                      </div>
                    );
                  },
                  duration: 5000
                });
              }
            }}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
