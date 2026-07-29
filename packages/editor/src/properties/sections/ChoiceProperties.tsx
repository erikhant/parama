import type { FieldGroupItem, FormField } from '@parama-dev/form-builder-types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Label,
  Switch
} from '@parama-ui/react';
import { Plus } from 'lucide-react';
import { memo, useCallback } from 'react';
import { NameField } from '../common/NameField';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { appendItem, clearAllItems, removeItemAt, toggleDefaultValue, updateEntryAt, type ItemField } from '../optionMutations';
import { OptionItem } from '../select/OptionItem';
import { SectionPanel } from '../SectionPanel';
import type { SectionProps } from './types';

interface ChoicePropertiesProps extends SectionProps<ItemField> {
  /** Mirrors a default-value change into the live form so the canvas updates. */
  onDefaultValueCommit: (value: unknown) => void;
}

/** Whether `defaultValue` currently selects `value`. */
function isSelected(field: ItemField, value: string): boolean {
  if (field.type === 'checkbox') return Array.isArray(field.defaultValue) && field.defaultValue.includes(value);
  return field.defaultValue === value;
}

/**
 * Properties panel for checkbox and radio fields.
 *
 * The two differ only in arity — a radio holds one default, a checkbox holds a
 * list — which `toggleDefaultValue` handles, so the markup is shared.
 */
export const ChoiceProperties = memo<ChoicePropertiesProps>(({ field, onChange, onDefaultValueCommit }) => {
  const { isEditable } = useFieldSettings();
  const items = field.items ?? [];

  const handleName = useCallback((name: string) => onChange({ name } as Partial<FormField>), [onChange]);

  const handleAddItem = useCallback(() => onChange(appendItem(field) as Partial<FormField>), [field, onChange]);

  const handleUpdateItem = useCallback(
    (index: number, key: keyof FieldGroupItem, value: string) =>
      onChange({ items: updateEntryAt(items, index, key, value) } as Partial<FormField>),
    [items, onChange]
  );

  const handleDeleteItem = useCallback(
    (index: number) => {
      const updates = removeItemAt(field, index);
      onChange(updates as Partial<FormField>);
      if ('defaultValue' in updates) onDefaultValueCommit(updates.defaultValue);
    },
    [field, onChange, onDefaultValueCommit]
  );

  const handleRemoveAll = useCallback(() => {
    onChange(clearAllItems(field) as Partial<FormField>);
    onDefaultValueCommit(undefined);
  }, [field, onChange, onDefaultValueCommit]);

  const handleToggleDefault = useCallback(
    (value: string, isDefault: boolean) => {
      const next = toggleDefaultValue(
        field.defaultValue,
        value,
        isDefault,
        field.type === 'checkbox' ? 'multiple' : 'single'
      );
      onChange({ defaultValue: next } as Partial<FormField>);
      onDefaultValueCommit(next);
    },
    [field.defaultValue, field.type, onChange, onDefaultValueCommit]
  );

  return (
    <SectionPanel title="Properties">
      <NameField value={field.name || ''} onChange={handleName} />

      <div className="flex justify-between items-center">
        <Label>{field.type === 'checkbox' ? 'Checkbox' : 'Radio'} items</Label>
        {isEditable &&
          (items.length > 0 ? (
            <Button
              className="text-xs text-gray-500"
              variant="ghost"
              size="xs"
              color="secondary"
              onClick={handleRemoveAll}>
              Remove all
            </Button>
          ) : (
            <Button onClick={handleAddItem} size="xs" color="secondary" variant="ghost">
              <Plus size={15} />
            </Button>
          ))}
      </div>

      <Accordion type="multiple" defaultValue={items.map((item) => String(item.id))} className="w-auto !-mt-0">
        {items.map((item, index) => (
          <AccordionItem key={String(item.id)} value={String(item.id)}>
            <AccordionTrigger className="text-gray-700 text-sm text-start whitespace-nowrap max-w-[15rem] py-3">
              <span className="pr-1.5 text-ellipsis line-clamp-1">{item.label || 'Item name'}</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1">
              <OptionItem option={item} index={index} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} />

              {isEditable && (
                <div className="flex items-center ml-4 gap-2 mt-2">
                  <Label htmlFor={item.id as string} className="text-xs text-gray-600">
                    Set as default
                  </Label>
                  <Switch
                    id={item.id as string}
                    disabled={item.value === '' || item.label === ''}
                    checked={isSelected(field, item.value)}
                    onCheckedChange={(checked) => handleToggleDefault(item.value, checked)}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {isEditable && items.length > 0 && (
        <Button onClick={handleAddItem} size="xs" color="secondary" variant="ghost" className="mt-2">
          <Plus size={15} /> Add item
        </Button>
      )}
    </SectionPanel>
  );
});

ChoiceProperties.displayName = 'ChoiceProperties';
