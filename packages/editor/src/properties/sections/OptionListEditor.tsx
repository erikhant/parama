import type { FieldGroupItem } from '@parama-dev/form-builder-types';
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
import { memo } from 'react';
import { OptionItem } from '../select/OptionItem';
import { useFieldSettings } from '../hooks/useFieldSettings';
import type { SelectionMode } from '../optionMutations';

interface OptionListEditorProps {
  options: FieldGroupItem[];
  /** Whether the field holds one default value or several. */
  selectionMode: SelectionMode;
  /** The field's current `defaultValue`, used to drive each switch. */
  defaultValue: unknown;
  /** Hides the add button when options come from a remote source. */
  canAdd: boolean;
  onAdd: () => void;
  onUpdate: (index: number, key: keyof FieldGroupItem, value: string) => void;
  onDelete: (index: number) => void;
  onToggleDefault: (value: string, isDefault: boolean) => void;
}

/** Whether `defaultValue` currently selects `value`, in either selection mode. */
function isDefaultSelected(defaultValue: unknown, value: string, mode: SelectionMode): boolean {
  if (mode === 'multiple') return Array.isArray(defaultValue) && defaultValue.includes(value);
  return defaultValue === value;
}

/**
 * The accordion of editable options shared by select, multiselect and
 * autocomplete.
 *
 * These three field types previously carried a copy of this markup each,
 * differing only in how the "set as default" switch behaves — which is now the
 * `selectionMode` prop.
 */
export const OptionListEditor = memo<OptionListEditorProps>(
  ({ options, selectionMode, defaultValue, canAdd, onAdd, onUpdate, onDelete, onToggleDefault }) => {
    const { isEditable } = useFieldSettings();

    if (options.length === 0) return null;

    return (
      <>
        <Accordion type="multiple" defaultValue={options.map((option) => String(option.id))} className="w-auto !-mt-0">
          {options.map((option, index) => (
            <AccordionItem key={String(option.id)} value={String(option.id)}>
              <AccordionTrigger className="text-gray-700 text-sm py-2 text-start whitespace-nowrap max-w-[15rem]">
                <span className="pr-1.5 text-ellipsis line-clamp-1">{option.label || 'Option name'}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-1">
                <OptionItem option={option} index={index} onUpdate={onUpdate} onDelete={onDelete} />

                {isEditable && (
                  <div className="flex items-center ml-4 gap-2 mt-2">
                    <Label htmlFor={option.id as string} className="text-xs text-gray-600">
                      Set as default
                    </Label>
                    <Switch
                      id={option.id as string}
                      // A half-filled option cannot be a meaningful default.
                      disabled={option.value === '' || option.label === ''}
                      checked={isDefaultSelected(defaultValue, option.value, selectionMode)}
                      onCheckedChange={(checked) => onToggleDefault(option.value, checked)}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {isEditable && canAdd && (
          <Button onClick={onAdd} size="xs" color="secondary" variant="ghost">
            <Plus size={15} /> Add option
          </Button>
        )}
      </>
    );
  }
);

OptionListEditor.displayName = 'OptionListEditor';
