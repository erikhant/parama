import type { TextField } from '@parama-dev/form-builder-types';
import { memo, useCallback } from 'react';
import { withAdornment, type Adornment, type AdornmentSlot } from '../appearanceMutations';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { SectionPanel } from '../SectionPanel';
import { AdornmentSlotEditor, TEXT_ADORNMENT_SLOTS } from './AdornmentSlotEditor';
import type { SectionProps } from './types';

/**
 * Appearance panel for single-line text inputs.
 *
 * Renders one {@link AdornmentSlotEditor} per decoration slot. The slot list is
 * data, so supporting a new decoration means adding an entry to
 * {@link TEXT_ADORNMENT_SLOTS} rather than another copy of the editor markup.
 */
export const TextAppearance = memo<SectionProps<TextField>>(({ field, onChange }) => {
  const { isReadOnly } = useFieldSettings('appearanceSettings');

  const handleSlotChange = useCallback(
    (slot: AdornmentSlot) => (next: Adornment | undefined) => onChange(withAdornment(field.appearance, slot, next)),
    [field.appearance, onChange]
  );

  return (
    <SectionPanel title="Appearance">
      {TEXT_ADORNMENT_SLOTS.map(({ slot, label, description }) => (
        <AdornmentSlotEditor
          key={slot}
          slot={slot}
          label={label}
          description={description}
          value={field.appearance?.[slot]}
          isReadOnly={isReadOnly}
          onChange={handleSlotChange(slot)}
        />
      ))}
    </SectionPanel>
  );
});

TextAppearance.displayName = 'TextAppearance';
