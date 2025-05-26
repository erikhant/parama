import { useFormBuilder } from '@form-builder/core';
import { FormField } from '@form-builder/renderer';

type FieldOverlayProps = {
  id: string;
};

export const FieldOverlay: React.FC<FieldOverlayProps> = ({ id }) => {
  const { actions } = useFormBuilder();
  const field = actions.getField(id);
  console.log(field);
  return field ? <FormField field={field} /> : null;
};
