import { hydrateInitialData } from '../services/hydration';
import { pristineValidationMap } from '../services/validationState';
import type { FormBuilderActions, SliceContext } from '../state/types';
import { defaultSchema } from '../state/defaultSchema';

type LifecycleActions = Pick<FormBuilderActions, 'initialize'>;

/**
 * Store bootstrap.
 *
 * `initialize` is idempotent and is re-run by the providers whenever the schema,
 * data or variables props change, so it must fully define the reachable state
 * rather than patching it.
 */
export function createLifecycleSlice({ set, get, workflow }: SliceContext): LifecycleActions {
  return {
    /**
     * Seeds the store from the caller's props, registers every field's
     * dependencies with the workflow engine, and evaluates initial conditions.
     *
     * @param props - Schema plus optional validators, data, and variables
     */
    initialize: ({ schema, validators = {}, data = {}, variables = {} }) => {
      const resolvedSchema = schema ?? defaultSchema;
      const { formData, existingFiles } = hydrateInitialData(resolvedSchema, data ?? {});

      set({
        schema: resolvedSchema,
        formData,
        existingFiles,
        validators,
        variables: variables ?? {},
        visibleFields: new Set(resolvedSchema.fields.map((field) => field.id)),
        validation: pristineValidationMap(resolvedSchema.fields),
        // Marks this as a reseed rather than a value change, so subscribers
        // such as the renderer's `onChange` notifier can hold their fire.
        initRevision: get().initRevision + 1
      });

      // Dependencies must all be registered before conditions run, otherwise a
      // field referencing a later sibling evaluates against an empty graph.
      resolvedSchema.fields.forEach((field) => workflow.registerDependencies(field));
      workflow.evaluateConditions();
    }
  };
}
