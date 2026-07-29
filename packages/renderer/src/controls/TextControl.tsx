import type { TextField } from '@parama-dev/form-builder-types';
import { cn, FormGroup, Input, Textarea } from '@parama-ui/react';
import { memo, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { useDebouncedTextValue } from '../hooks/useDebouncedTextValue';
import { useFormMode } from '../hooks/useFieldFlags';
import type { ControlProps } from './types';

type Adornment = NonNullable<NonNullable<TextField['appearance']>['prefix']>;

/**
 * Renders one decoration slot of a text field.
 *
 * A slot holds either literal text or the name of a Lucide icon. An empty slot
 * renders nothing rather than an empty wrapper, so it takes no layout space.
 */
function renderAdornment({ type, content }: Adornment): React.ReactNode {
  if (!content) return null;
  return type === 'icon' ? <Icon name={content} /> : content;
}

/** Builds the `FormGroup` slots from a text field's appearance config. */
function useAdornments(field: TextField) {
  return useMemo(() => {
    const appearance = field.appearance;
    if (!appearance) return null;

    return {
      prefix: appearance.prefix ? renderAdornment(appearance.prefix) : undefined,
      suffix: appearance.suffix ? renderAdornment(appearance.suffix) : undefined
    };
  }, [field.appearance]);
}

/**
 * Single-line inputs: text, email, password, number, tel and url.
 *
 * Wrapped in a `FormGroup` only when the field declares prefix or suffix
 * decoration, matching the un-decorated markup exactly otherwise.
 */
export const TextControl = memo<ControlProps<TextField>>(({ field, value, onChange, isReadOnly, commonProps }) => {
  const [text, setText] = useDebouncedTextValue(value, onChange);
  const adornments = useAdornments(field);

  const input = (
    <Input
      {...commonProps}
      className={cn(commonProps.className)}
      type={field.type}
      value={text}
      readOnly={isReadOnly}
      onChange={(event) => setText(event.target.value || '')}
    />
  );

  return field.appearance ? <FormGroup {...adornments}>{input}</FormGroup> : input;
});
TextControl.displayName = 'TextControl';

/** Multi-line text input. */
export const TextareaControl = memo<ControlProps<TextField>>(
  ({ field, value, onChange, isReadOnly, isDisabled, commonProps }) => {
    const [text, setText] = useDebouncedTextValue(value, onChange);

    return (
      <Textarea
        {...commonProps}
        value={text}
        readOnly={isReadOnly}
        disabled={isDisabled}
        rows={field.rows || 3}
        onChange={(event) => setText(event.target.value || '')}
      />
    );
  }
);
TextareaControl.displayName = 'TextareaControl';

/**
 * Hidden input.
 *
 * Renders as a real `<input type="hidden">` when the form is live, and as a
 * read-only visible box in the editor so authors can see it exists.
 */
export const HiddenControl = memo<ControlProps<TextField>>(({ value, commonProps }) => {
  const mode = useFormMode();

  if (mode === 'editor') {
    return <Input {...commonProps} className={cn(commonProps.className, 'bg-void')} type="text" readOnly />;
  }

  return <input type="hidden" value={(value as string) ?? ''} />;
});
HiddenControl.displayName = 'HiddenControl';
