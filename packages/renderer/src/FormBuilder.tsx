import { FormBuilderProps } from '@form-builder/types';
import { FormProvider } from './FormProvider';
import { FormRenderer } from './FormRenderer';

export const FormBuilder: React.FC<FormBuilderProps> = (props) => {
  return (
    <FormProvider {...props}>
      <FormRenderer />
    </FormProvider>
  );
};
