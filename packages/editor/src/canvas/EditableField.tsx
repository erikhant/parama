import { FormFieldRenderer } from '@parama-dev/form-builder-renderer';
import { FormField as FormFieldType } from '@parama-dev/form-builder-types';
import { SortableItem } from '../components';
import { FieldHighligter } from './FieldHighligter';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import { cn } from '@parama-ui/react';

type EditableFieldProps = {
  field: FormFieldType;
  index: number;
};

export const EditableField: React.FC<EditableFieldProps> = ({ field, index }) => {
  const { actions } = useFormBuilder();
  return (
    <SortableItem
      id={field.id}
      data={{ fromCanvas: true }}
      index={index}
      useHandle
      removable
      onRemove={(id) => actions.removeField(id as string)}
      className={cn(
        `h-min`,
        `column-span-${field.width}`,
        (field as any).widthTablet ? `md:column-span-${(field as any).widthTablet}` : '',
        (field as any).widthMobile ? `sm:column-span-${(field as any).widthMobile}` : ''
      )}
      classNameIndicator={`column-span-${field.width} h-14 ml-6`}>
      <FieldHighligter id={field.id}>
        <FormFieldRenderer field={field} />
      </FieldHighligter>
    </SortableItem>
  );
};
