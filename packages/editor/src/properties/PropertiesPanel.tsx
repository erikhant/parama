import { useEffect, useState } from 'react';
import { useFormBuilder } from '@form-builder/core';
import { useDebouncedCallback } from 'use-debounce';
import { useEditor } from '../store/useEditor';
import { FormField, FormSchema } from '@form-builder/types';
import { GeneralPropertiesEditor } from './GeneralPropertiesEditor';
import { Button, FormItem, Input, Label, Slider } from '@parama-ui/react';
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { LayoutPropertiesEditor } from './LayoutPropertiesEditor';
import { AppearanceEditor } from './AppearanceEditor';
import ValidationEditor from './ValidationEditor';

export const PropertiesPanel: React.FC = () => {
  const { selectedFieldId, schema, actions } = useFormBuilder();
  const { editor, properties } = useEditor();
  const [collapsed, setCollapsed] = useState(false);
  const [widthValue, setWidthValue] = useState<number>(1);

  const handleFieldChange = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    editor.setLocalField({ ...properties.localField, ...updates } as FormField);
    updateField(selectedFieldId, updates);
  };

  const handleLayoutChange = (updates: Partial<FormSchema['layout']>) => {
    updateLayout(updates);
  };

  const handleWidthChange = (width: number) => {
    setWidthValue(width);
    handleFieldChange({ width });
  };

  const updateField = useDebouncedCallback(
    (fieldId: string, updates: Partial<FormField>) => actions.updateField(fieldId, updates),
    500
  );

  const updateLayout = useDebouncedCallback(
    (updates: Partial<FormSchema['layout']>) =>
      actions.updateLayout({ ...schema.layout, ...updates }),
    500
  );

  useEffect(() => {
    if (selectedFieldId) {
      const field = actions.getField(selectedFieldId) || null;
      editor.setLocalField(field);
      setCollapsed(false);
      setWidthValue(field?.width || 1);
    } else {
      editor.setLocalField(null);
      setCollapsed(true);
    }
  }, [selectedFieldId, schema.fields]);

  if (schema.fields.length > 0 && !properties.localField) {
    return (
      <div className="w-72 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50 border-l-2 border-gray-100/60">
        <LayoutPropertiesEditor schema={schema} onChange={handleLayoutChange} />
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
            <h2 className="text-sm font-semibold text-gray-700 line-clamp-1">
              {properties.localField.label}
            </h2>
            <small className="text-gray-500">{properties.localField?.id}</small>
          </div>
          <div className="p-4 space-y-3 border-t border-gray-200">
            <h6 className="font-semibold uppercase text-xs text-gray-400">General</h6>
            {properties.localField.type !== 'hidden' && (
              <>
                <FormItem>
                  <Label className="block text-sm font-medium">Label</Label>
                  <Input
                    type="text"
                    placeholder="Field label"
                    value={properties.localField.label || ''}
                    onChange={(e) => handleFieldChange({ label: e.target.value })}
                  />
                </FormItem>
                <FormItem>
                  <Label className="block text-sm font-medium">Description</Label>
                  <Input
                    type="text"
                    placeholder="Describe this field"
                    value={properties.localField.helpText || ''}
                    onChange={(e) => handleFieldChange({ helpText: e.target.value })}
                  />
                </FormItem>
                <FormItem>
                  <Label className="block text-sm font-medium">Width</Label>
                  <div className="grid grid-cols-4 gap-x-3">
                    <Slider
                      value={[widthValue]}
                      onValueChange={(value) => handleWidthChange(value[0])}
                      min={1}
                      max={12}
                      step={1}
                      className="col-span-3"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      step={1}
                      value={widthValue}
                      onChange={(e) => {
                        const width = parseInt(e.target.value, 10);
                        if (!isNaN(width) && width >= 1 && width <= 12) {
                          handleWidthChange(width);
                        }
                      }}
                      className="col-span-1 pr-0"
                    />
                  </div>
                </FormItem>
              </>
            )}
          </div>
          <GeneralPropertiesEditor field={properties.localField} onChange={handleFieldChange} />
          <AppearanceEditor field={properties.localField} onChange={handleFieldChange} />
          <ValidationEditor field={properties.localField} onChange={handleFieldChange} />
        </>
      )}
    </div>
  );
};
