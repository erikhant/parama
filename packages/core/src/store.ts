import { create } from 'zustand';
import { createDataSlice } from './slices/dataSlice';
import { createFileSlice } from './slices/fileSlice';
import { createLifecycleSlice } from './slices/lifecycleSlice';
import { createSchemaSlice } from './slices/schemaSlice';
import { createUiSlice } from './slices/uiSlice';
import { createValidationSlice } from './slices/validationSlice';
import { createVariablesSlice } from './slices/variablesSlice';
import { defaultSchema } from './state/defaultSchema';
import type { FormBuilderActions, FormBuilderState, SliceContext } from './state/types';
import { WorkflowEngine } from './workflow/engine';

export { defaultSchema };
export type {
  FormBuilderActions,
  FormBuilderState,
  FormMode,
  ScreenSize,
  SubmissionContentType,
  SubmitResult
} from './state/types';

/**
 * The form builder store.
 *
 * Composition root only: state shape lives in `state/`, behaviour lives in
 * `slices/`, and the reusable logic those slices call lives in `services/`.
 * Each slice owns a disjoint part of {@link FormBuilderActions}; the union is
 * the package's public contract and must stay stable.
 *
 * @remarks
 * This is a module-level singleton, so one page hosts one form. Rendering two
 * `FormRenderer`s at once makes them share values — a known constraint of the
 * current design.
 *
 * Prefer subscribing with a selector (`useFormBuilder((s) => s.formData)`) over
 * destructuring the whole store, which re-renders on every unrelated change.
 */
export const useFormBuilder = create<FormBuilderState>((set, get) => {
  const workflow = new WorkflowEngine({ getState: get, setState: set });
  const context: SliceContext = { set, get, workflow };

  const actions: FormBuilderActions = {
    ...createLifecycleSlice(context),
    ...createSchemaSlice(context),
    ...createDataSlice(context),
    ...createFileSlice(context),
    ...createValidationSlice(context),
    ...createVariablesSlice(context),
    ...createUiSlice(context)
  };

  return {
    // Core form state
    schema: defaultSchema,
    formData: {},
    fileData: new FormData(),
    existingFiles: {},
    validators: {},
    variables: {},
    selectedFieldId: null,
    mode: 'render',
    screenSize: 'desktop',
    initRevision: 0,

    // Derived / evaluated state
    validation: {},
    visibleFields: new Set<string>(),
    readOnlyFields: new Set<string>(),
    disabledFields: new Set<string>(),
    formState: { isSubmitting: false },
    workflowEngine: workflow,

    actions
  };
});
