import { FormBuilderProps } from '@form-builder/types';
import { FormProvider } from './FormProvider';
import { FormSubmitter } from './FormSubmitter';

export const FormRenderer: React.FC<FormBuilderProps> = (props) => {
  return (
    <FormProvider {...props}>
      <FormSubmitter onSubmit={props.onSubmit} onChange={props.onChange} onCancel={props.onCancel} />
    </FormProvider>
  );
};
