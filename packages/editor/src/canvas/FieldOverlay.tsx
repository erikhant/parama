import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormFieldRenderer } from '@parama-dev/form-builder-renderer';

type FieldOverlayProps = {
  id: string;
};

export const FieldOverlay: React.FC<FieldOverlayProps> = ({ id }) => {
  const { actions } = useFormBuilder();
  const field = actions.getField(id);
  return field ? <FormFieldRenderer field={field} /> : null;
};
