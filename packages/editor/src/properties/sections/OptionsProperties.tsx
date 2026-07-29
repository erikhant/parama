import type { AutoCompleteField, FieldGroupItem, FormField, SelectField } from '@parama-dev/form-builder-types';
import { Button, FormItem, Input, Label, Switch } from '@parama-ui/react';
import { Plus } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { NameField } from '../common/NameField';
import { useFieldSettings } from '../hooks/useFieldSettings';
import {
  appendGroup,
  appendItemToGroup,
  appendOption,
  clearAllOptions,
  removeGroup,
  removeOptionAt,
  toggleDefaultValue,
  updateEntryAt,
  type OptionField,
  type SelectionMode
} from '../optionMutations';
import { OptionGroup } from '../select/OptionGroup';
import { SectionPanel } from '../SectionPanel';
import { OptionListEditor } from './OptionListEditor';
import { OptionSourceToolbar } from './OptionSourceToolbar';
import type { SectionProps } from './types';

/** Only `select` supports grouped options; the other two are flat lists. */
const supportsGroups = (field: OptionField): field is SelectField => field.type === 'select';

/** `multiselect` keeps an array of defaults; `select` and `autocomplete` keep one. */
const selectionModeOf = (field: OptionField): SelectionMode =>
  field.type === 'multiselect' ? 'multiple' : 'single';

/** True while the field has no inline options, no groups and no API source. */
function isUnconfigured(field: OptionField): boolean {
  const hasOptions = (field.options?.length ?? 0) > 0;
  const hasGroups = supportsGroups(field) && (field.optionGroups?.length ?? 0) > 0;
  return !hasOptions && !hasGroups && !field.external;
}

/**
 * Properties panel for the three option-driven field types: select,
 * multiselect and autocomplete.
 *
 * These shared one implementation copied three times, differing only in group
 * support, default-value arity, and autocomplete's filter toggle. Those are now
 * the two predicates above plus one conditional block, and the mutation logic
 * lives in `optionMutations`.
 */
export const OptionsProperties = memo<SectionProps<OptionField>>(({ field, onChange }) => {
  const { isReadOnly, isEditable } = useFieldSettings();
  const selectionMode = selectionModeOf(field);

  const handlePlaceholder = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange({ placeholder: event.target.value }),
    [onChange]
  );

  const handleName = useCallback((name: string) => onChange({ name }), [onChange]);

  const handleAddOption = useCallback(() => onChange(appendOption(field) as Partial<FormField>), [field, onChange]);

  const handleUpdateOption = useCallback(
    (index: number, key: keyof FieldGroupItem, value: string) =>
      onChange({ options: updateEntryAt(field.options ?? [], index, key, value) } as Partial<FormField>),
    [field.options, onChange]
  );

  const handleDeleteOption = useCallback(
    (index: number) => onChange(removeOptionAt(field, index) as Partial<FormField>),
    [field, onChange]
  );

  const handleToggleDefault = useCallback(
    (value: string, isDefault: boolean) =>
      onChange({
        defaultValue: toggleDefaultValue(field.defaultValue, value, isDefault, selectionMode)
      } as Partial<FormField>),
    [field.defaultValue, selectionMode, onChange]
  );

  const handleRemoveAll = useCallback(
    () => onChange(clearAllOptions(field) as Partial<FormField>),
    [field, onChange]
  );

  const handleAddGroup = useCallback(() => {
    if (supportsGroups(field)) onChange(appendGroup(field) as Partial<FormField>);
  }, [field, onChange]);

  const handleGroupUpdate = useCallback(
    (groupIndex: number, updates: any) => {
      if (!supportsGroups(field)) return;
      const groups = [...(field.optionGroups ?? [])];
      groups[groupIndex] = { ...groups[groupIndex], ...updates };
      onChange({ optionGroups: groups } as Partial<FormField>);
    },
    [field, onChange]
  );

  const handleGroupDelete = useCallback(
    (groupId: string) => {
      if (supportsGroups(field)) onChange(removeGroup(field, groupId) as Partial<FormField>);
    },
    [field, onChange]
  );

  const handleAddItemToGroup = useCallback(
    (groupIndex: number) => {
      if (supportsGroups(field)) onChange(appendItemToGroup(field, groupIndex) as Partial<FormField>);
    },
    [field, onChange]
  );

  const handleExternalChange = useCallback(
    (external: any) => onChange({ external } as Partial<FormField>),
    [onChange]
  );

  const groups = useMemo(() => (supportsGroups(field) ? (field.optionGroups ?? []) : []), [field]);

  return (
    <SectionPanel title="Properties">
      <FormItem>
        <Label>Placeholder</Label>
        <Input type="text" value={field.placeholder || ''} disabled={isReadOnly} onChange={handlePlaceholder} />
      </FormItem>

      <NameField value={field.name || ''} onChange={handleName} hasValidation />

      {field.type === 'autocomplete' && (
        <FormItem orientation="horizontal">
          <div className="form-captions !col-span-4">
            <Label htmlFor="enable-filter">Enable filtering</Label>
            <p className="form-description">Allow filter options by typing</p>
          </div>
          <div className="col-span-1 flex items-center justify-end">
            <Switch
              id="enable-filter"
              disabled={isReadOnly}
              checked={(field as AutoCompleteField).shouldFilter !== false}
              onCheckedChange={(checked) => onChange({ shouldFilter: checked } as Partial<FormField>)}
            />
          </div>
        </FormItem>
      )}

      <OptionSourceToolbar
        isUnconfigured={isUnconfigured(field)}
        supportsGroups={supportsGroups(field)}
        external={field.external}
        onAddOption={handleAddOption}
        onAddGroup={handleAddGroup}
        onExternalChange={handleExternalChange}
        onRemoveAll={handleRemoveAll}
      />

      <OptionListEditor
        options={field.options ?? []}
        selectionMode={selectionMode}
        defaultValue={field.defaultValue}
        // Options fetched from an endpoint are not editable by hand.
        canAdd={!field.external}
        onAdd={handleAddOption}
        onUpdate={handleUpdateOption}
        onDelete={handleDeleteOption}
        onToggleDefault={handleToggleDefault}
      />

      {groups.map((group, groupIndex) => (
        <OptionGroup
          key={group.id}
          group={group}
          groupIndex={groupIndex}
          field={field as SelectField}
          onUpdate={handleGroupUpdate}
          onDelete={handleGroupDelete}
          onAddItem={handleAddItemToGroup}
        />
      ))}

      {isEditable && groups.length > 0 && (
        <Button onClick={handleAddGroup} size="xs" color="secondary" variant="ghost">
          <Plus size={15} /> Add group
        </Button>
      )}
    </SectionPanel>
  );
});

OptionsProperties.displayName = 'OptionsProperties';
