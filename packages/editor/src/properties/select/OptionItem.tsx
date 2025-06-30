import { FieldGroupItem } from '@form-builder/types';
import { Button, FormItem, Input } from '@parama-ui/react';
import { Trash2 } from 'lucide-react';
import { memo, useCallback } from 'react';

/**
 * OptionItem component represents a single option in a select field.
 * It allows editing the label and value of the option, and provides a delete button.
 */

interface OptionItemProps {
  option: FieldGroupItem;
  index: number;
  onUpdate: (index: number, field: keyof FieldGroupItem, value: string) => void;
  onDelete: (index: number) => void;
}

export const OptionItem = memo<OptionItemProps>(({ option, index, onUpdate, onDelete }) => {
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(index, 'label', e.target.value);
    },
    [index, onUpdate]
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(index, 'value', e.target.value);
    },
    [index, onUpdate]
  );

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [index, onDelete]);

  return (
    <FormItem
      key={option.id || option.value}
      orientation="horizontal"
      className="space-x-0 items-center pl-3 border-l-4 border-gray-200">
      <div className="col-span-4 space-y-2">
        <Input
          type="text"
          placeholder="Option label"
          value={option.label}
          onChange={handleLabelChange}
        />
        <Input
          type="text"
          value={option.value}
          placeholder="Option value"
          onChange={handleValueChange}
        />
      </div>
      <div className="col-span-1 shrink-0">
        <Button
          className="self-center"
          variant="ghost"
          size="xs"
          color="secondary"
          onClick={handleDelete}>
          <Trash2 size={15} />
        </Button>
      </div>
    </FormItem>
  );
});

OptionItem.displayName = 'OptionItem';
