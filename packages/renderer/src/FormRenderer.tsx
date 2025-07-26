import { FormBuilderProps } from '@parama-dev/form-builder-types';
import { FormProvider } from './FormProvider';
import { FormSubmitter } from './FormSubmitter';

export const FormRenderer: React.FC<FormBuilderProps & { className?: string }> = (props) => {
  return (
    <FormProvider {...props}>
      <FormSubmitter
        onSubmit={props.onSubmit}
        onChange={props.onChange}
        onCancel={props.onCancel}
        className={props.className}
      />
    </FormProvider>
  );
};
