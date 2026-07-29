import type { AutoCompleteField, FieldGroupItem, MultiSelectField, SelectField } from '@parama-dev/form-builder-types';
import {
  AutoComplete,
  MultiSelect,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@parama-ui/react';
import { Loader2Icon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { OptionsSpinner } from '../components/OptionsSpinner';
import { useFieldOptions } from '../hooks/useFieldOptions';
import type { ControlProps } from './types';

/** Options missing an id, value or label cannot be rendered by Radix primitives. */
const isRenderable = (option: FieldGroupItem) => Boolean(option.id && option.value && option.label);

const OptionItems = memo<{ options: FieldGroupItem[] }>(({ options }) => (
  <>
    {options.filter(isRenderable).map((option) => (
      <SelectItem key={option.id} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </>
));
OptionItems.displayName = 'OptionItems';

const GroupedOptionItems = memo<{ groups: NonNullable<SelectField['optionGroups']> }>(({ groups }) => (
  <>
    {groups.map((group) => (
      <SelectGroup key={group.id}>
        {group.label && <SelectLabel>{group.label}</SelectLabel>}
        <OptionItems options={group.items} />
      </SelectGroup>
    ))}
  </>
));
GroupedOptionItems.displayName = 'GroupedOptionItems';

/** Single-choice dropdown, with optional grouping and remote options. */
export const SelectControl = memo<ControlProps<SelectField>>(
  ({ field, value, onChange, isDisabled, isRequired }) => {
    const { options, loading } = useFieldOptions(field);
    const selected = (value as string) ?? '';

    const selectedLabel = useMemo(
      () => options.find((option) => String(option.value) === String(selected))?.label ?? '',
      [options, selected]
    );

    return (
      <Select
        name={field.name}
        value={selected}
        disabled={isDisabled}
        required={isRequired}
        onValueChange={onChange}>
        <SelectTrigger className="w-full">
          {loading ? (
            <span className="flex items-center animate-spin">
              <Loader2Icon className="size-4 text-gray-400" />
            </span>
          ) : (
            <SelectValue className="text-slate-400" placeholder={field.placeholder || 'Select an option'}>
              {selectedLabel}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.length > 0 && <OptionItems options={options} />}
          {field.optionGroups && field.optionGroups.length > 0 && <GroupedOptionItems groups={field.optionGroups} />}
        </SelectContent>
      </Select>
    );
  }
);
SelectControl.displayName = 'SelectControl';

/** Multi-choice dropdown. */
export const MultiSelectControl = memo<ControlProps<MultiSelectField>>(({ field, value, onChange, isDisabled }) => {
  const { options, loading } = useFieldOptions(field);

  const items = useMemo(() => options.map(({ value: v, label }) => ({ value: v, label })), [options]);

  if (loading) return <OptionsSpinner />;

  return (
    <MultiSelect
      name={field.name}
      defaultValue={(value as string[]) ?? []}
      disabled={isDisabled}
      placeholder={field.placeholder || 'Select options'}
      modalPopover
      color="primary"
      variant="shadow"
      options={items}
      onValueChange={onChange}
    />
  );
});
MultiSelectControl.displayName = 'MultiSelectControl';

/** Type-ahead single-choice input. */
export const AutoCompleteControl = memo<ControlProps<AutoCompleteField>>(
  ({ field, value, onChange, isDisabled }) => {
    const { options, loading } = useFieldOptions(field);
    const selected = (value as string) ?? '';

    const items = useMemo(
      () =>
        options.map((option) => ({
          id: option.id?.toString() || '',
          value: option.value,
          label: option.label,
          description: option.description
        })),
      [options]
    );

    const selectedItem = useMemo(() => items.find((item) => item.value === selected), [items, selected]);

    if (loading) return <OptionsSpinner />;

    return (
      <AutoComplete
        options={items}
        value={selectedItem}
        onValueChange={(option: { value: string }) => onChange(option.value)}
        disabled={isDisabled}
        placeholder={field.placeholder || 'Search options...'}
        shouldFilter={field.shouldFilter !== false}
        emptyMessage="No options found"
      />
    );
  }
);
AutoCompleteControl.displayName = 'AutoCompleteControl';
