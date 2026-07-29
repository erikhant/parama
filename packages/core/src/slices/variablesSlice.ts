import { resolveInterpolatableValue } from '../utils';
import type { FormBuilderActions, SliceContext } from '../state/types';

type VariableActions = Pick<
  FormBuilderActions,
  'updateVariables' | 'updateVariable' | 'getVariable' | 'getVariables' | 'resolveFieldValue'
>;

/**
 * The `{{$name}}` variable context supplied by the host application.
 *
 * Variables are resolved before field references, so a template may combine
 * both: `/api/users/{{$tenantId}}?role={{roleField}}`.
 */
export function createVariablesSlice({ set, get }: SliceContext): VariableActions {
  return {
    /** Replaces the whole variable context. Nullish input becomes `{}`. */
    updateVariables: (variables) => set({ variables: variables ?? {} }),

    /** Sets a single variable. */
    updateVariable: (key, value) => set((state) => ({ variables: { ...state.variables, [key]: value } })),

    getVariable: (key) => get().variables[key],

    getVariables: () => get().variables,

    /**
     * Resolves variable references inside one of a field's properties.
     * Strings, arrays and nested objects are all walked.
     */
    resolveFieldValue: (field, property) => resolveInterpolatableValue(field[property], get().variables)
  };
}
