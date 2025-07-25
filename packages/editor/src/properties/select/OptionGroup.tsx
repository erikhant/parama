import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  FormItem,
  Input,
  Label,
  Switch
} from '@parama-ui/react';
import { FieldGroupItem, FormField } from '@form-builder/types';
import { memo, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * OptionGroup component represents a group of options in a select field.
 * It allows editing the group label, adding new options, and deleting the group.
 */

interface OptionGroupProps {
  field: FormField;
  group: {
    id: string;
    label: string;
    items: FieldGroupItem[];
  };
  groupIndex: number;
  onUpdate: (groupIndex: number, updates: any, defaultValue?: string) => void;
  onDelete: (groupId: string) => void;
  onAddItem: (groupIndex: number) => void;
}

export const OptionGroup = memo<OptionGroupProps>(({ field, group, groupIndex, onUpdate, onDelete, onAddItem }) => {
  const handleGroupLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(groupIndex, { label: e.target.value }, 'defaultValue' in field ? field.defaultValue : undefined);
    },
    [groupIndex, onUpdate]
  );

  const handleDeleteGroup = useCallback(() => {
    onDelete(group.id);
  }, [group.id, onDelete]);

  const handleItemUpdate = useCallback(
    (itemId: string, key: string, value: string) => {
      const newItems = group.items.map((item: any) => (item.id === itemId ? { ...item, [key]: value } : item));
      onUpdate(groupIndex, { items: newItems }, 'defaultValue' in field ? field.defaultValue : undefined);
    },
    [group.items, groupIndex, onUpdate]
  );

  const handleItemDelete = useCallback(
    (itemId: string) => {
      const newItems = group.items.filter((item: any) => item.id !== itemId);
      const deletedItem = group.items.find((item: any) => item.id === itemId);
      // If the deleted item was the default value, we need to update
      // the default value to undefined
      if (deletedItem && 'defaultValue' in field && field.defaultValue === deletedItem.value) {
        onUpdate(groupIndex, { items: newItems }, undefined);
      } else {
        onUpdate(groupIndex, { items: newItems }, 'defaultValue' in field ? field.defaultValue : undefined);
      }
    },
    [group.items, groupIndex, onUpdate]
  );

  const handleAddItem = useCallback(() => {
    onAddItem(groupIndex);
  }, [groupIndex, onAddItem]);

  const handleDefaultValueChange = useCallback(
    (group: OptionGroupProps['group'], value?: string) => {
      onUpdate(groupIndex, group, value);
    },
    [group.items, groupIndex, onUpdate]
  );

  return (
    <Accordion key={group.id} type="multiple" defaultValue={[group.id]} className="!-mt-0">
      <AccordionItem value={group.id}>
        <AccordionTrigger className="text-gray-700 text-sm py-2.5">
          {group.label || 'Group name'}
          <div
            role="button"
            tabIndex={0}
            aria-label="Delete group"
            className="btn btn-secondary btn-secondary-ghost btn-xs ml-auto mr-1"
            onClick={handleDeleteGroup}>
            <Trash2 size={15} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-2">
          <FormItem className="p-0.5 pb-0">
            <Input type="text" value={group.label || ''} onChange={handleGroupLabelChange} />
          </FormItem>
          {group.items.map((item: FieldGroupItem) => (
            <>
              <FormItem
                key={item.id}
                orientation="horizontal"
                className="space-x-0 items-center pl-3 border-l-4 border-gray-200">
                <div className="col-span-4 space-y-2">
                  <Input
                    type="text"
                    placeholder="Option label"
                    value={item.label}
                    onChange={(e) => handleItemUpdate(item.id as string, 'label', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={item.value}
                    placeholder="Option value"
                    onChange={(e) => handleItemUpdate(item.id as string, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-1 shrink-0">
                  <Button
                    className="self-center"
                    variant="ghost"
                    size="xs"
                    color="secondary"
                    onClick={() => handleItemDelete(item.id as string)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </FormItem>
              <div className="flex items-center ml-4 gap-2 mt-2">
                <Label htmlFor={item.id as string} className="text-xs text-gray-600">
                  Set as default
                </Label>
                <Switch
                  id={item.id as string}
                  disabled={item.value === '' || item.label === ''}
                  checked={'defaultValue' in field ? field.defaultValue === item.value : false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleDefaultValueChange(group, item.value);
                    } else if ('defaultValue' in field && field.defaultValue === item.value) {
                      handleDefaultValueChange(group, undefined);
                    }
                  }}
                />
              </div>
            </>
          ))}
          {group.items.length > 0 && (
            <Button onClick={handleAddItem} size="xs" color="secondary" variant="ghost">
              <Plus size={15} /> Add option
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

OptionGroup.displayName = 'OptionGroup';
