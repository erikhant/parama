import { useEffect } from 'react';
import { useFormBuilder } from '@form-builder/core';
import { FormField } from '@form-builder/types';
import { useDebouncedCallback } from 'use-debounce';
import { useEditor } from '../store/useEditor';
import { GeneralPropertiesEditor } from './GeneralPropertiesEditor';

export const PropertiesPanel: React.FC = () => {
  const { selectedFieldId, schema, actions } = useFormBuilder();
  const { editor, properties } = useEditor();

  const handleChange = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    editor.setLocalField({ ...properties.localField, ...updates } as FormField);
    updateField(selectedFieldId, updates);
  };

  const updateField = useDebouncedCallback(
    (fieldId: string, updates: Partial<FormField>) =>
      actions.updateField(fieldId, updates),
    500
  );

  useEffect(() => {
    if (selectedFieldId) {
      const field = actions.getField(selectedFieldId) || null;
      editor.setLocalField(field);
    } else {
      editor.setLocalField(null);
    }
  }, [selectedFieldId, schema.fields]);

  if (!properties.localField) {
    return (
      <div className="w-64 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50/80 border-l border-gray-200 flex items-center justify-center">
        <p className="text-sm font-medium text-gray-400">
          Select a field to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50/80 border-l border-gray-200">
      <div className="p-3 space-y-3">
        <h2 className="text-base font-semibold text-gray-700">Properties</h2>
        <small className="text-gray-500">{properties.localField?.id}</small>
      </div>
      <div className="p-3 space-y-3 border-t border-gray-300">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Label</label>
          <input
            type="text"
            value={properties.localField.label || ''}
            onChange={(e) => handleChange({ label: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Helper text</label>
          <input
            type="text"
            value={properties.localField.helpText || ''}
            onChange={(e) => handleChange({ helpText: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <div className="p-3 space-y-3 border-t border-gray-300">
        <GeneralPropertiesEditor
          field={properties.localField}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
