import type { TextField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label } from '@parama-ui/react';
import { memo } from 'react';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { SectionPanel } from '../SectionPanel';
import type { SectionProps } from './types';

/** Appearance panel for textareas: just the visible row count. */
export const TextareaAppearance = memo<SectionProps<TextField>>(({ field, onChange }) => {
  const { isReadOnly } = useFieldSettings('appearanceSettings');

  return (
          <SectionPanel title="Appearance">
            <FormItem>
              <Label>Row size</Label>
              <Input
                type="number"
                min={3}
                value={field.rows || ''}
                disabled={isReadOnly}
                placeholder="Number of rows"
                onChange={(e) => {
                  const rows = parseInt(e.target.value, 10);
                  if (!isNaN(rows) && rows > 0) {
                    onChange({ rows: rows });
                  } else {
                    onChange({ rows: undefined });
                  }
                }}
              />
            </FormItem>
          </SectionPanel>
  );
});

TextareaAppearance.displayName = 'TextareaAppearance';
