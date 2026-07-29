import type { FormBuilderActions, SliceContext } from '../state/types';

type UiActions = Pick<
  FormBuilderActions,
  'selectField' | 'changeMode' | 'changeScreenSize' | 'setSubmissionState'
>;

/**
 * Presentation-only state: which field is selected, whether the form is being
 * edited or rendered, the responsive preview size, and submission progress.
 *
 * Nothing here affects form values or validity.
 */
export function createUiSlice({ set }: SliceContext): UiActions {
  return {
    /** Selects a field for editing, or clears the selection with `null`. */
    selectField: (id) => set({ selectedFieldId: id }),

    /** Switches between editor and render mode, clearing selection on render. */
    changeMode: (mode) => set(mode === 'render' ? { mode, selectedFieldId: null } : { mode }),

    /** Sets the responsive preview breakpoint. */
    changeScreenSize: (screenSize) => set({ screenSize }),

    /** Merges a patch into the submission state. */
    setSubmissionState: (patch) => set((state) => ({ formState: { ...state.formState, ...patch } }))
  };
}
