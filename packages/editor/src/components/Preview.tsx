import { useFormBuilder } from '@form-builder/core';
import { FormBuilder } from '@form-builder/renderer';
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
  const { resetForm } = useFormBuilder().actions;
  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          color="secondary"
          size="sm"
          variant="ghost"
          disabled={disabled}
          className="rounded-md">
          <PlayIcon size={16} />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-2xl">
        <SheetHeader>
          <SheetTitle>{schema.title || 'Preview'}</SheetTitle>
          <SheetDescription>{schema.description || ''}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-1 py-4 min-h-[calc(100vh-120px)] overflow-y-auto">
          <FormBuilder schema={schema} />
        </div>
        <SheetFooter>
          <SheetClose asChild onClick={resetForm}>
            <Button type="submit">Save</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
