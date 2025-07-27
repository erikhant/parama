import { FormField } from '@parama-dev/form-builder-renderer';
import { FormField as FormFieldType } from '@parama-dev/form-builder-types';
import { SortableItem } from '../components';
import { FieldHighligter } from './FieldHighligter';
import { useFormBuilder } from '@parama-dev/form-builder-core';

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
      className={`column-span-${field.width} tw-h-min`}
      classNameIndicator={`column-span-${field.width} tw-h-14 tw-ml-6`}>
      <FieldHighligter id={field.id}>
        <FormField field={field} />
      </FieldHighligter>
    </SortableItem>
  );
};
