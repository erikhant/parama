import { memo, useCallback } from 'react';
import { FormItem, Input, Label } from '@parama-ui/react';
import { HelperTooltip } from '../../components/HelperTooltip';

/**
 * NameField component allows users to input a unique name for a form field.
 * It provides validation to ensure the name is in a valid format.
 * The name will be used as the key in the form data object.
 */

interface NameFieldProps {
  value: string;
  onChange: (name: string) => void;
  hasValidation?: boolean;
}

export const NameField = memo<NameFieldProps>(({ value, onChange, hasValidation = true }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      if (hasValidation) {
        newValue = newValue.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      }
      onChange(newValue);
    },
    [onChange, hasValidation]
  );

  return (
    <FormItem>
      <div className="flex items-center justify-between">
        <Label>Name</Label>
        <HelperTooltip>
          <b>How it works?</b>
          <br />
          This name will be used as the key in the form data object and should be{' '}
          <strong>unique</strong> across the form. It depends on your backend how you handle this
          data. <br /> If you are using a REST API, it will be sent as a JSON object with this name
          as the key.
        </HelperTooltip>
      </div>
      <Input type="text" value={value} onChange={handleChange} />
      {hasValidation && (
        <p className="form-description">
          Only camelCase or snake_case characters are allowed. Spaces will be replaced with
          underscores.
        </p>
      )}
    </FormItem>
  );
});

NameField.displayName = 'NameField';
