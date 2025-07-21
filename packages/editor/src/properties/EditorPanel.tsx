import { useFormBuilder } from '@form-builder/core';
import { FormField, FormSchema } from '@form-builder/types';
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
      // setWidthValue(field?.width || 1);
    } else {
      editor.setLocalField(null);
      setCollapsed(true);
    }
  }, [selectedFieldId, schema.fields]);

  if (schema.fields.length > 0 && !properties.localField) {
    return (
      <div className="w-72 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50 border-l-2 border-gray-100/60">
        <LayoutEditor schema={schema} onChange={handleLayoutChange} />
        <FormMetadata schema={schema} />
      </div>
    );
  }

  if (!properties.localField) {
    return (
      <div className="w-72 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50 border-l-2 border-gray-100/60">
        <p className="text-sm text-center text-gray-500 my-52">No field provided</p>
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 relative max-h-screen pb-8 overflow-y-auto overflow-x-hidden bg-gray-50 border-l-2 border-gray-100/60 transition-all duration-200 ${!collapsed ? 'w-72' : 'w-10'}`}>
      <Button
        className={`absolute right-1.5 top-4 z-10 transition-all`}
        color="secondary"
        variant="ghost"
        size="xs"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand properties panel' : 'Collapse properties panel'}>
        {collapsed ? <ArrowLeftToLine size={18} /> : <ArrowRightToLine size={18} />}
      </Button>
      {!collapsed && (
        <>
          <div className="p-3 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 line-clamp-1">{properties.localField.label}</h2>
            <small className="text-gray-500">{properties.localField?.id}</small>
          </div>
          {editor.options?.generalSettings !== 'off' && properties.localField.type !== 'hidden' && (
            <GeneralEditor field={properties.localField} onChange={handleFieldChange} />
          )}
          {editor.options?.propertiesSettings !== 'off' && (
            <PropertiesEditor field={properties.localField} onChange={handleFieldChange} />
          )}
          {editor.options?.appearanceSettings !== 'off' && (
            <AppearanceEditor field={properties.localField} onChange={handleFieldChange} />
          )}
          {editor.options?.validationSettings !== 'off' && (
            <ValidationEditor field={properties.localField} onChange={handleFieldChange} />
          )}
          {editor.options?.conditionsSettings !== 'off' && properties.localField.type !== 'hidden' && (
            <ConditionEditor field={properties.localField} onChange={handleFieldChange} />
          )}
          {editor.options?.eventsSettings !== 'off' && (
            <EventsEditor field={properties.localField} onChange={handleFieldChange} />
          )}
        </>
      )}
    </div>
  );
};
