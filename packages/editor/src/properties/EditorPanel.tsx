import { useFormBuilder } from '@parama-dev/form-builder-core';
import {
  FormField,
  FormSchema,
  TextField,
  RadioField,
  CheckboxField,
  DateField,
  SelectField,
  MultiSelectField
} from '@parama-dev/form-builder-types';
import { Button } from '@parama-ui/react';
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useEditor } from '../store/useEditor';
import { AppearanceEditor } from './AppearanceEditor';
import { ConditionEditor } from './ConditionEditor';
import { GeneralEditor } from './GeneralEditor';
import { PropertiesEditor } from './PropertiesEditor';
import ValidationEditor from './ValidationEditor';
import { LayoutEditor } from './LayoutEditor';
import { FormMetadata } from './FormMetadata';
import { EventsEditor } from './EventsEditor';
import { GeneralButtonEditor } from './button/GeneralButtonEditor';
import { AppearanceButtonEditor } from './button/AppearanceButtonEditor';
import { GeneralBlockEditor } from './block/GeneralBlockEditor';
import { BlockContentEditor } from './block/BlockContentEditor';
import { Customization } from './common/Customization';

// Type guard to check if a field supports data customization
type FieldWithDataCustomization = TextField | RadioField | CheckboxField | DateField | SelectField | MultiSelectField;

// Types for editor configuration
interface EditorConfig {
  showGeneral: boolean;
  showProperties: boolean;
  showAppearance: boolean;
  showValidation: boolean;
  showConditions: boolean;
  showEvents: boolean;
  showDataCustomization: boolean;
  useButtonEditor: boolean;
  useBlockEditor: boolean;
}

// Helper function to determine which editors should be rendered
const getEditorConfig = (field: FormField, editorOptions: any): EditorConfig => {
  const isButtonType = field.type === 'button' || field.type === 'submit' || field.type === 'reset';
  const isHiddenType = field.type === 'hidden';
  const isBlockType = field.type === 'block' || field.type === 'spacer';

  return {
    showGeneral: editorOptions?.generalSettings !== 'off' && !isHiddenType,
    showProperties: editorOptions?.propertiesSettings !== 'off' && !isBlockType && !isButtonType,
    showAppearance: editorOptions?.appearanceSettings !== 'off' && !isBlockType,
    showValidation: editorOptions?.validationSettings !== 'off' && !isButtonType && !isBlockType,
    showConditions: editorOptions?.conditionsSettings !== 'off' && !isHiddenType,
    showEvents: editorOptions?.eventsSettings !== 'off' && !isHiddenType && !isButtonType && !isBlockType,
    showDataCustomization: editorOptions?.dataSettings !== 'off' && supportsDataCustomization(field),
    useButtonEditor: isButtonType,
    useBlockEditor: isBlockType
  };
};

const supportsDataCustomization = (field: FormField): field is FieldWithDataCustomization => {
  return [
    'text',
    'email',
    'textarea',
    'password',
    'number',
    'tel',
    'url',
    'hidden',
    'radio',
    'checkbox',
    'date',
    'select',
    'multiselect'
  ].includes(field.type);
};

// Component for rendering field editors based on configuration
interface FieldEditorsProps {
  field: FormField;
  editorConfig: EditorConfig;
  onChange: (updates: Partial<FormField>) => void;
}

const FieldEditors: React.FC<FieldEditorsProps> = ({ field, editorConfig, onChange }) => {
  return (
    <>
      {editorConfig.showGeneral &&
        (editorConfig.useButtonEditor ? (
          <GeneralButtonEditor field={field} onChange={onChange} />
        ) : editorConfig.useBlockEditor ? (
          <GeneralBlockEditor field={field as any} onChange={onChange} />
        ) : (
          <GeneralEditor field={field} onChange={onChange} />
        ))}
      {editorConfig.useBlockEditor && <BlockContentEditor field={field as any} onChange={onChange} />}
      {editorConfig.showProperties && <PropertiesEditor field={field} onChange={onChange} />}
      {editorConfig.showAppearance &&
        (editorConfig.useButtonEditor ? (
          <AppearanceButtonEditor field={field} onChange={onChange} />
        ) : (
          <AppearanceEditor field={field} onChange={onChange} />
        ))}
      {editorConfig.showValidation && <ValidationEditor field={field} onChange={onChange} />}
      {editorConfig.showConditions && <ConditionEditor field={field} onChange={onChange} />}
      {editorConfig.showEvents && <EventsEditor field={field} onChange={onChange} />}
      {editorConfig.showDataCustomization && supportsDataCustomization(field) && (
        <Customization field={field} onChange={onChange} />
      )}
    </>
  );
};

export const EditorPanel: React.FC = () => {
  const { selectedFieldId, schema, actions } = useFormBuilder();
  const { editor, properties } = useEditor();
  const [collapsed, setCollapsed] = useState(false);

  const handleFieldChange = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    editor.setLocalField({ ...properties.localField, ...updates } as FormField);
    updateField(selectedFieldId, updates);
  };

  const handleLayoutChange = (updates: Partial<FormSchema['layout']>) => {
    updateLayout(updates);
  };

  const updateField = useDebouncedCallback(
    (fieldId: string, updates: Partial<FormField>) => actions.updateField(fieldId, updates),
    500
  );

  const updateLayout = useDebouncedCallback(
    (updates: Partial<FormSchema['layout']>) => actions.updateLayout({ ...schema.layout, ...updates }),
    500
  );

  useEffect(() => {
    if (selectedFieldId) {
      const field = actions.getField(selectedFieldId) || null;
      editor.setLocalField(field);
      setCollapsed(false);
    } else {
      editor.setLocalField(null);
      setCollapsed(true);
    }
  }, [selectedFieldId, schema.fields]);

  // Show layout editor when no field is selected but form has fields
  if (schema.fields.length > 0 && !properties.localField) {
    return (
      <div className="tw-w-72 tw-shrink-0 tw-max-h-screen tw-overflow-y-auto tw-overflow-x-hidden tw-bg-gray-50 tw-border-l-2 tw-border-gray-100/60">
        <LayoutEditor schema={schema} onChange={handleLayoutChange} />
        <FormMetadata schema={schema} />
      </div>
    );
  }

  // Show empty state when no field is provided
  if (!properties.localField) {
    return (
      <div className="tw-w-72 tw-shrink-0 tw-max-h-screen tw-overflow-y-auto tw-overflow-x-hidden tw-bg-gray-50 tw-border-l-2 tw-border-gray-100/60">
        <p className="tw-text-sm tw-text-center tw-text-gray-500 tw-my-52">No field provided</p>
      </div>
    );
  }

  // Get editor configuration based on field type and editor options
  const editorConfig = getEditorConfig(properties.localField, editor.options);

  return (
    <div
      className={`tw-shrink-0 tw-relative tw-max-h-screen tw-pb-8 tw-overflow-y-auto tw-overflow-x-hidden tw-bg-gray-50 tw-border-l-2 tw-border-gray-100/60 tw-transition-all tw-duration-200 ${!collapsed ? 'tw-w-72' : 'tw-w-10'}`}>
      <Button
        className={`tw-absolute tw-right-1.5 tw-top-4 tw-z-10 tw-transition-all`}
        color="secondary"
        variant="ghost"
        size="xs"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand properties panel' : 'Collapse properties panel'}>
        {collapsed ? <ArrowLeftToLine size={18} /> : <ArrowRightToLine size={18} />}
      </Button>
      {!collapsed && (
        <>
          <div className="tw-p-3 tw-space-y-3">
            <h2 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-line-clamp-1">
              {'label' in properties.localField ? properties.localField.label : properties.localField.id}
            </h2>
            <small className="tw-text-gray-500">{properties.localField?.id}</small>
          </div>
          <FieldEditors field={properties.localField} editorConfig={editorConfig} onChange={handleFieldChange} />
        </>
      )}
    </div>
  );
};
