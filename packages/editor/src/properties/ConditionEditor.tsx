import { FormField } from '@form-builder/types';
import { SectionPanel } from './SectionPanel';
import { FormGroup, FormItem, Input, Label } from '@parama-ui/react';
import { useEditor } from '../store/useEditor';
import { HelperTooltip } from '../components/HelperTooltip';

type ConditionEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const ConditionEditor = ({ field, onChange }: ConditionEditorProps) => {
  const { editor } = useEditor();

  const ConditionTooltip = () => (
    <HelperTooltip className="max-w-xs">
      You can use any field's value in the expression. <br />
      Examples: <br />• <code>{`{{name_text}} === "john"`}</code> <br />• <code>{`{{age_number}} > 18`}</code> <br />•{' '}
      <code>{`{{email_text}}.includes("@gmail.com")`}</code> <br />• <code>{`{{isActive}} === true`}</code> <br />
      The <b>fieldName</b> in {`{{fieldName}}`} refers to the name of the field you want to check.
    </HelperTooltip>
  );

  return (
    <SectionPanel title="Conditions">
      <FormItem>
        <Label className="block text-sm font-medium">Hidden</Label>
        <FormGroup prefix="If">
          <Input
            type="text"
            disabled={editor.options?.conditionsSettings === 'readonly'}
            value={field.conditions?.hidden?.expression || ''}
            onChange={(e) =>
              onChange({
                conditions: {
                  ...field.conditions,
                  hidden: e.target.value ? { expression: e.target.value } : undefined
                }
              })
            }
          />
        </FormGroup>
        <div className="flex items-center gap-1">
          <p className="form-description">Use expression.</p>
          <ConditionTooltip />
        </div>
      </FormItem>
      {field.type !== 'block' && field.type !== 'spacer' && (
        <FormItem>
          <Label className="block text-sm font-medium">Disabled</Label>
          <FormGroup prefix="If">
            <Input
              type="text"
              disabled={editor.options?.conditionsSettings === 'readonly'}
              value={field.conditions?.disabled?.expression || ''}
              onChange={(e) =>
                onChange({
                  conditions: {
                    ...field.conditions,
                    disabled: e.target.value ? { expression: e.target.value } : undefined
                  }
                })
              }
            />
          </FormGroup>
          <div className="flex items-center gap-1">
            <p className="form-description">Use expression.</p>
            <ConditionTooltip />
          </div>
        </FormItem>
      )}
    </SectionPanel>
  );
};
