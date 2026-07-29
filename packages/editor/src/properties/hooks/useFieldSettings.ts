import type { FieldSettings, FormEditorOptions } from '@parama-dev/form-builder-types';
import { useEditor } from '../../store/useEditor';

/**
 * Reads whether a properties panel section is editable.
 *
 * Every panel previously repeated `editor.options?.propertiesSettings !==
 * 'readonly'` inline, dozens of times per file, which made the gate easy to
 * forget on a new control.
 *
 * @param section - Which settings group governs the panel; defaults to `propertiesSettings`
 */
export function useFieldSettings(section: keyof FormEditorOptions = 'propertiesSettings') {
  const { editor } = useEditor();
  const setting = editor.options?.[section] as FieldSettings | undefined;

  return {
    /** True when the section is hidden entirely. */
    isHidden: setting === 'off',
    /** True when controls should render but reject input. */
    isReadOnly: setting === 'readonly',
    /** True when controls accept input. */
    isEditable: setting !== 'readonly' && setting !== 'off'
  };
}
