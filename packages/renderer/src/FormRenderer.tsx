import { FormBuilderProps } from '@parama-dev/form-builder-types';
import { ThemeProvider } from '@parama-ui/react';
import { FormProvider } from './FormProvider';
import { FormSubmitter } from './FormSubmitter';

/**
 * A rendered, submittable form.
 *
 * Mounts its own {@link ThemeProvider} so a standalone form themes correctly on
 * its own. Nested inside the editor's preview the provider detects the outer
 * one and steps aside, so the editor's theme governs both.
 *
 * The provider's wrapper is `display: contents`, so it carries the theme class
 * without becoming a layout box. The `<form>` stays the effective root and a
 * host's flex or grid rules keep applying to it exactly as before.
 */
export const FormRenderer: React.FC<FormBuilderProps & { className?: string }> = (props) => {
  return (
    <ThemeProvider theme={props.theme} className="contents">
      <FormProvider {...props}>
        <FormSubmitter
          onSubmit={props.onSubmit}
          onChange={props.onChange}
          onCancel={props.onCancel}
          className={props.className}
        />
      </FormProvider>
    </ThemeProvider>
  );
};
