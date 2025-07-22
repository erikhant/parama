import { useFormBuilder } from '@form-builder/core';
import { FormRenderer } from '@form-builder/renderer';
import { FormSchema } from '@form-builder/types';
import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@parama-ui/react';
import { PlayIcon } from 'lucide-react';

interface PreviewProps {
  disabled: boolean;
  schema: FormSchema;
  onOpenChange?: (open: boolean) => void;
}

export const Preview: React.FC<PreviewProps> = ({ disabled, schema, onOpenChange }) => {
  const { actions, screenSize } = useFormBuilder();

  // Get responsive sheet width based on screen size
  const getSheetWidth = () => {
    switch (screenSize) {
      case 'mobile':
        return 'max-w-sm'; // 384px
      case 'tablet':
        return 'max-w-2xl'; // 672px
      case 'desktop':
      default:
        return 'max-w-4xl'; // 896px
    }
  };

  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button color="secondary" size="sm" variant="ghost" disabled={disabled} className="rounded-md">
          <PlayIcon size={16} />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent className={getSheetWidth()}>
        <SheetHeader>
          <SheetTitle>{schema.title || 'Preview'}</SheetTitle>
          <SheetDescription>{schema.description || ''}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-1 py-4 min-h-[calc(100vh-150px)] overflow-y-auto">
          <div>
            <FormRenderer schema={schema} />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild onClick={actions.resetForm}>
            <Button type="button">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
