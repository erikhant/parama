import type { FormField, TextField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label } from '@parama-ui/react';
import { memo, useCallback } from 'react';
import { DefaultValue } from '../common/DefaultValue';
import { NameField } from '../common/NameField';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { SectionPanel } from '../SectionPanel';
import type { SectionProps } from './types';

/** Field types that expose a default-value control. */
const SUPPORTS_DEFAULT_VALUE = new Set<TextField['type']>(['hidden', 'text', 'number', 'email', 'textarea']);

/** Field types that expose a placeholder control. A hidden input has nowhere to show one. */
const SUPPORTS_PLACEHOLDER = new Set<TextField['type']>(['text', 'number', 'email', 'textarea', 'password']);

interface TextPropertiesProps extends SectionProps<TextField> {
  /** Commits the default value to the live form so the canvas preview updates. */
  onDefaultValueCommit: (value: string) => void;
}

/**
 * Properties panel for the text-like inputs: text, number, email, textarea,
 * password and hidden.
 *
 * Which controls appear is data-driven rather than a per-type branch, because
 * the six types differ only in whether they offer a placeholder and a default
 * value. Password deliberately offers no default — a pre-filled password field
 * would put a credential in the schema.
 */
export const TextProperties = memo<TextPropertiesProps>(({ field, onChange, onDefaultValueCommit }) => {
  const { isReadOnly } = useFieldSettings();

  const handlePlaceholder = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange({ placeholder: event.target.value }),
    [onChange]
  );

  const handleName = useCallback((name: string) => onChange({ name } as Partial<FormField>), [onChange]);

  return (
    <SectionPanel title="Properties">
      {SUPPORTS_PLACEHOLDER.has(field.type) && (
        <FormItem>
          <Label>Placeholder</Label>
          <Input type="text" value={field.placeholder || ''} disabled={isReadOnly} onChange={handlePlaceholder} />
        </FormItem>
      )}

      {SUPPORTS_DEFAULT_VALUE.has(field.type) && (
        <DefaultValue
          type={field.type === 'number' ? 'number' : 'text'}
          value={field.defaultValue || ''}
          onChange={onDefaultValueCommit}
        />
      )}

      <NameField value={field.name || ''} onChange={handleName} />
    </SectionPanel>
  );
});

TextProperties.displayName = 'TextProperties';
