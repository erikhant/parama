import { FormField } from '@form-builder/renderer';
import { FormField as FormFieldType } from '@form-builder/types';
import { SortableItem } from '../components';
import { FieldHighligter } from './FieldHighligter';
import { useFormBuilder } from '@form-builder/core';

type EditableFieldProps = {
  field: FormFieldType;
  index: number;
};

export const EditableField: React.FC<EditableFieldProps> = ({
  field,
  index
}) => {
  const { actions } = useFormBuilder();
  return (
    <SortableItem
      id={field.id}
      data={{ fromCanvas: true }}
      index={index}
      useHandle
      removable
      onRemove={(id) => actions.removeField(id as string)}
      className={`column-span-${field.width} h-min`}
      classNameIndicator={`column-span-${field.width} h-14 ml-6`}>
      <FieldHighligter id={field.id}>
        <FormField field={field} />
      </FieldHighligter>
    </SortableItem>
  );
};
