import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormField } from '@parama-dev/form-builder-types';
import { FormItem } from '@parama-ui/react';
import { useMemo } from 'react';
import { CodeEditor } from '../../components/CodeEditor';
import { HelperTooltip } from '../../components/HelperTooltip';
import { useEditor } from '../../store/useEditor';
import { SectionPanel } from '../SectionPanel';

interface CustomizationProps {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
}

export const Customization = ({ field, onChange }: CustomizationProps) => {
  const { editor } = useEditor();
  const { schema } = useFormBuilder();

  const handleChange = (value: string) => {
    onChange({ transformer: value });
  };

  // Generate autocomplete suggestions from form field names
  const autocompleteSuggestions = useMemo(() => {
    return schema.fields
      .filter((field) => 'name' in field && field.name)
      .map((field) => ({
        label: 'name' in field ? `{{${field.name}}}` : '',
        insertText: 'name' in field ? `{{${field.name}}}` : '',
        documentation: 'name' in field ? `Reference to field: ${field.name}` : '',
        detail: 'Form Field Reference'
      }));
  }, [schema.fields]);

  return (
    <SectionPanel title="Customization" className="relative">
      <FormItem>
        <div className="absolute top-4 right-2 z-[2]">
          <HelperTooltip>
            <div className="space-y-2 pb-1">
              <p className="text-[13px] font-medium text-gray-700">
                <strong>Transform field data before submission</strong>
              </p>
              <p>Use placeholders with double curly braces to reference other form fields:</p>
              <div className="bg-gray-100 text-gray-600 p-2 rounded text-xs font-mono">
                <div>JSON object:</div>
                <div>{`{"id": "{{user_id}}", "name": "{{username}}"}`}</div>
              </div>
              <div className="bg-gray-100 text-gray-600 p-2 rounded text-xs font-mono">
                <div>String template:</div>
                <div>{`prefix_{{field_name}}_{{other_field}}`}</div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Switch between <strong>JSON</strong> and <strong>Text</strong> modes using the language toggle
                button.
              </p>
            </div>
          </HelperTooltip>
        </div>
        <CodeEditor
          defaultLang="plaintext"
          label="Data transformation"
          languages={['json', 'plaintext']}
          modalWidth="768px"
          value={'transformer' in field ? field.transformer : ''}
          onChange={handleChange}
          readOnly={editor.options?.dataSettings === 'readonly'}
          height="120px"
          expandedHeight="400px"
          showExpand={true}
          showLanguageToggle={true}
          autocompleteSuggestions={autocompleteSuggestions}
        />
        <p className="form-description">
          Define how this field&apos;s data should be transformed before form submission.
        </p>
      </FormItem>
    </SectionPanel>
  );
};
