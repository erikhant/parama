import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { FormSchema } from '@parama-dev/form-builder-types';
import { PlayIcon } from 'lucide-react';
import { useRef } from 'react';
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
import { useEditor } from '../store/useEditor';

interface PreviewProps {
  disabled: boolean;
  schema: FormSchema;
  onOpenChange?: (open: boolean) => void;
}

export const Preview: React.FC<PreviewProps> = ({ disabled, schema, onOpenChange }) => {
  const { actions, screenSize, selectedFieldId } = useFormBuilder();
  const { editor } = useEditor();

  /*
   * The renderer inside the sheet claims `render` mode on mount — that is what
   * makes this a faithful preview, since conditions only take effect outside
   * editor mode. The claim has to be handed back on close, or the canvas is
   * left behaving like a live form.
   *
   * Switching to render mode also clears the selection, so it is captured here
   * while it is still valid and restored with the mode.
   */
  const selectionBeforePreview = useRef<string | null>(null);

  return (
    <Sheet
      onOpenChange={(open) => {
        onOpenChange?.(open);

        if (open) {
          selectionBeforePreview.current = selectedFieldId;
          return;
        }

        actions.resetForm(); // Reset form when closing preview
        actions.changeMode('editor');
        actions.selectField(selectionBeforePreview.current);
      }}>
      <SheetTrigger asChild>
        <Button color="secondary" size="sm" variant="ghost" disabled={disabled} className="rounded-md">
          <PlayIcon size={16} />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent
        className={`w-full !px-0 ${
          screenSize === 'mobile'
            ? 'screen-mobile !max-w-sm'
            : screenSize === 'tablet'
            ? 'screen-tablet !max-w-2xl'
            : '!max-w-4xl'
        }`}>
        <SheetHeader className="px-8">
          <SheetTitle>{schema.title || 'Preview'}</SheetTitle>
          <SheetDescription>{schema.description || ''}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="p-8 h-[90vh] relative">
          <FormRenderer
            schema={schema}
            variables={editor.variables}
            className="px-1"
            onSubmit={(data, contentType) => {
              if (contentType === 'application/json') {
                toast.success('Form submitted successfully!', {
                  description: () => {
                    return (
                      <>
                        <p className="text-xs">Content type : {contentType}</p>
                        <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(data, null, 2)}</pre>
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
                      <div className="space-y-1">
                        <p className="text-xs">Content type : {contentType}</p>
                        <p className="text-xs">Entries : {formEntries.length}</p>
                        {formEntries.map(([key, value], index) => {
                          if (value instanceof File) {
                            return (
                              <p key={`${key}_${index}`} className="text-xs">
                                📁 {key}: {value.name} ({value.size} bytes)
                              </p>
                            );
                          } else {
                            return (
                              <p key={`${key}_${index}`} className="text-xs">
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
