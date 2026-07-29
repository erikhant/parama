import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormItem,
  Input,
  Label
} from '@parama-ui/react';
import { PlusIcon } from 'lucide-react';
import { memo, useCallback } from 'react';
import { IconPicker } from '../../components/IconPicker';
import type { Adornment, AdornmentSlot, AdornmentType } from '../appearanceMutations';

/** The two things a slot can hold, in the order the add menu offers them. */
const ADORNMENT_TYPES: { type: AdornmentType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'icon', label: 'Icon' }
];

export interface AdornmentSlotEditorProps {
  label: string;
  description: string;
  slot: AdornmentSlot;
  /** The slot's current contents, or `undefined` when unset. */
  value: Adornment | undefined;
  isReadOnly: boolean;
  /** Reports the slot's new contents, or `undefined` to remove it. */
  onChange: (next: Adornment | undefined) => void;
}

/**
 * Edits one decoration slot of a text input.
 *
 * The prefix and suffix slots behave identically — pick text or icon, edit the
 * content, remove it — and were previously two copies of this markup differing
 * only in which property they wrote. Passing the slot in as a prop makes adding
 * a third decoration a one-line change at the call site.
 *
 * Empty and filled are distinct states: an empty slot offers an add menu, a
 * filled one offers a remove button plus the editor matching its type.
 */
export const AdornmentSlotEditor = memo<AdornmentSlotEditorProps>(
  ({ label, description, slot, value, isReadOnly, onChange }) => {
    const handleAdd = useCallback((type: AdornmentType) => onChange({ type, content: '' }), [onChange]);

    const handleRemove = useCallback(() => onChange(undefined), [onChange]);

    const handleContent = useCallback(
      (content: string) => onChange({ type: value?.type ?? 'text', content }),
      [onChange, value?.type]
    );

    return (
      <FormItem orientation="horizontal">
        <div className="form-captions !col-span-4">
          <Label>{label}</Label>
          <p className="form-description">{description}</p>
        </div>

        <div className="flex justify-end col-span-1">
          {value ? (
            <Button
              variant="ghost"
              color="secondary"
              size="xs"
              disabled={isReadOnly}
              className="text-xs text-gray-500"
              onClick={handleRemove}>
              Remove
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" color="secondary" size="xs" disabled={isReadOnly} aria-label={`Add ${label}`}>
                  <PlusIcon size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32" align="end">
                {ADORNMENT_TYPES.map((option) => (
                  <DropdownMenuItem key={option.type} onSelect={() => handleAdd(option.type)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {value?.type === 'icon' && (
          <IconPicker
            // An unset icon needs room for its prompt; a chosen one shows as a
            // single glyph and yields the space back to the row.
            className={value.content !== '' ? 'col-span-1' : 'col-span-2 justify-start'}
            value={value.content}
            onChange={handleContent}
          />
        )}

        {value?.type === 'text' && (
          <Input
            type="text"
            value={value.content || ''}
            disabled={isReadOnly}
            className="!col-span-5"
            aria-label={`${label} content`}
            onChange={(event) => handleContent(event.target.value)}
          />
        )}
      </FormItem>
    );
  }
);

AdornmentSlotEditor.displayName = 'AdornmentSlotEditor';

/** The decoration slots offered for single-line text inputs. */
export const TEXT_ADORNMENT_SLOTS: { slot: AdornmentSlot; label: string; description: string }[] = [
  { slot: 'prefix', label: 'Prefix', description: 'Add text or icon on the left side' },
  { slot: 'suffix', label: 'Suffix', description: 'Add text or icon on the right side' }
];
