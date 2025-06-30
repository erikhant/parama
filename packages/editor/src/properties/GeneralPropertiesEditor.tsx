import {
  CheckboxField,
  DateField,
  FieldGroupItem,
  FormField,
  RadioField,
  SelectField
} from '@form-builder/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  DatePicker,
  DatePickerProps,
  DateRange,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from '@parama-ui/react';
import {
  Calendar1Icon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  PencilLineIcon,
  Plus,
  XIcon
} from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { NameField } from './common/NameField';
import { ExternalDataOptions } from './select/ExternalDataOptions';
import { OptionGroup } from './select/OptionGroup';
import { OptionItem } from './select/OptionItem';
import { DefaultValue } from './common/DefaultValue';
import { useFormBuilder } from '@form-builder/core';

type GeneralPropertiesEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const GeneralPropertiesEditor = memo<GeneralPropertiesEditorProps>(({ field, onChange }) => {
  const { updateFieldValue } = useFormBuilder().actions;
  const handleNameChange = useCallback(
    (name: string) => {
      onChange({ name });
    },
    [onChange]
  );

  const handleDefaultValueChange = useCallback(
    (value: string) => {
      onChange({ defaultValue: value });
      updateFieldValue(field.id, value);
    },
    [onChange]
  );

  const handlePlaceholderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ placeholder: e.target.value });
    },
    [onChange]
  );

  const handleAddOption = useCallback(() => {
    const newOption: FieldGroupItem = {
      id: `option-${Date.now()}`,
      label: '',
      value: ''
    };
    onChange({
      options: [...((field as SelectField).options || []), newOption]
    });
  }, [(field as SelectField).options, onChange]);

  const handleAddGroup = useCallback(() => {
    const newGroup = {
      id: `group-${Date.now()}`,
      label: `Group ${((field as SelectField).optionGroups?.length || 0) + 1}`,
      items: [
        {
          id: `item-${Date.now()}`,
          label: '',
          value: ''
        }
      ]
    };
    onChange({
      optionGroups: [...((field as SelectField).optionGroups || []), newGroup]
    });
  }, [(field as SelectField).optionGroups, onChange]);

  const handleOptionUpdate = useCallback(
    (index: number, fieldName: keyof FieldGroupItem, value: string) => {
      const newOptions = [...((field as SelectField).options || [])];
      newOptions[index] = { ...newOptions[index], [fieldName]: value };
      onChange({ options: newOptions });
    },
    [(field as SelectField).options, onChange]
  );

  const handleOptionDelete = useCallback(
    (index: number) => {
      const newOptions = (field as SelectField).options?.filter((_, i) => i !== index) || [];
      onChange({ options: newOptions });
    },
    [(field as SelectField).options, onChange]
  );

  const handleGroupUpdate = useCallback(
    (groupIndex: number, updates: any, defaultValue?: string) => {
      const newGroups = [...((field as SelectField).optionGroups || [])];
      newGroups[groupIndex] = { ...newGroups[groupIndex], ...updates };
      onChange({ optionGroups: newGroups, defaultValue });
      // If the deleted option was the default value, clear it
      if (Array.isArray(field.defaultValue)) {
        const newDefaultValue = field.defaultValue.filter(
          (value: string) => value !== defaultValue
        );
        onChange({ defaultValue: newDefaultValue.length > 0 ? newDefaultValue : undefined });
      } else if (field.defaultValue === defaultValue) {
        onChange({ defaultValue: undefined });
      }
    },
    [(field as SelectField).optionGroups, onChange]
  );

  const handleGroupDelete = useCallback(
    (groupId: string) => {
      const newGroups = (field as SelectField).optionGroups?.filter((g) => g.id !== groupId) || [];
      onChange({ optionGroups: newGroups });
    },
    [(field as SelectField).optionGroups, onChange]
  );

  const handleAddItemToGroup = useCallback(
    (groupIndex: number) => {
      const newItem = {
        id: `item-${Date.now()}`,
        label: '',
        value: ''
      };
      const newGroups = [...((field as SelectField).optionGroups || [])];
      newGroups[groupIndex].items = [...(newGroups[groupIndex].items || []), newItem];
      onChange({ optionGroups: newGroups });
    },
    [(field as SelectField).optionGroups, onChange]
  );

  const handleRemoveAllOptions = useCallback(() => {
    const updates: Partial<SelectField> = {};
    if ((field as SelectField).options) updates.options = undefined;
    if ((field as SelectField).optionGroups) updates.optionGroups = undefined;
    if ((field as SelectField).external) updates.external = undefined;
    onChange(updates);
  }, [
    (field as SelectField).options,
    (field as SelectField).optionGroups,
    (field as SelectField).external,
    onChange
  ]);

  const handleAddItem = useCallback(() => {
    const newItem: FieldGroupItem = {
      id: `item-${Date.now()}`,
      label: `Item ${((field as CheckboxField | RadioField).items?.length || 0) + 1}`,
      value: `item-${((field as CheckboxField | RadioField).items?.length || 0) + 1}`
    };
    onChange({
      items: [...((field as CheckboxField | RadioField).items || []), newItem]
    });
  }, [(field as CheckboxField | RadioField).items, onChange]);

  const handleItemUpdate = useCallback(
    (index: number, fieldName: keyof FieldGroupItem, value: string) => {
      const newItems = [...((field as CheckboxField | RadioField).items || [])];
      newItems[index] = { ...newItems[index], [fieldName]: value };
      onChange({ items: newItems });
    },
    [(field as CheckboxField | RadioField).items, onChange]
  );

  const handleItemDelete = useCallback(
    (index: number) => {
      const newItems =
        (field as CheckboxField | RadioField).items?.filter((_, i) => i !== index) || [];
      const deletedItem = (field as CheckboxField | RadioField).items?.[index];

      if (field.defaultValue?.includes(deletedItem.value)) {
        if (field.type === 'radio') {
          onChange({ defaultValue: undefined, items: newItems });
          updateFieldValue(field.id, undefined);
        } else if (field.type === 'checkbox') {
          const newValue = field.defaultValue?.filter((v: string) => v !== deletedItem.value);
          onChange({
            defaultValue: newValue.length > 0 ? newValue : undefined,
            items: newItems
          });
          updateFieldValue(field.id, newValue.length > 0 ? newValue : undefined);
        }
      }
    },
    [(field as CheckboxField | RadioField).items, field.defaultValue, onChange]
  );

  const handleDeleteAllItems = useCallback(() => {
    const updates: Partial<CheckboxField | RadioField> = {};
    if ((field as CheckboxField | RadioField).items) updates.items = undefined;
    onChange({ ...updates, defaultValue: undefined });
    updateFieldValue(field.id, undefined);
  }, [(field as CheckboxField | RadioField).items, field.defaultValue, onChange]);

  const [restrictedDates, setRestrictedDates] = useState<DateRange | undefined>(() =>
    (field as DateField).options?.restrictedMonths &&
    (field as DateField).options!.restrictedMonths!.length >= 2
      ? {
          from: new Date((field as DateField).options!.restrictedMonths![0]),
          to: new Date((field as DateField).options!.restrictedMonths![1])
        }
      : undefined
  );

  const dateFormatOptions = useMemo(
    () => [
      { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy - 31/12/2024' },
      { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy - 12/31/2024' },
      { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd - 2024-12-31' },
      { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd - 2024/12/31' },
      { value: 'dd MMM yyyy', label: 'dd MMM yyyy - 31 Dec 2024' },
      { value: 'MMM dd, yyyy', label: 'MMM dd, yyyy - Dec 31, 2024' },
      { value: 'dd MMMM yyyy', label: 'dd MMMM yyyy - 31 December 2024' },
      { value: 'MMMM dd, yyyy', label: 'MMMM dd, yyyy - December 31, 2024' },
      { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy - 31-12-2024' },
      { value: 'MM-dd-yyyy', label: 'MM-dd-yyyy - 12-31-2024' }
    ],
    []
  );

  const weekdays = useMemo(
    () => [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ],
    []
  );

  // Memoized conditions
  const hasNoOptionsConfigured = useMemo(
    () =>
      (!(field as SelectField).options || (field as SelectField).options.length === 0) &&
      (!(field as SelectField).optionGroups || (field as SelectField).optionGroups!.length === 0) &&
      !(field as SelectField).external,
    [
      (field as SelectField).options,
      (field as SelectField).optionGroups,
      (field as SelectField).external
    ]
  );

  const renderTypeSpecificProperties = useMemo(() => {
    switch (field.type) {
      case 'hidden':
        return <NameField value={field.name || ''} onChange={handleNameChange} />;
      case 'text':
      case 'number':
      case 'email':
      case 'textarea':
        return (
          <>
            <FormItem>
              <Label>Placeholder</Label>
              <Input
                type="text"
                value={field.placeholder || ''}
                onChange={handlePlaceholderChange}
              />
            </FormItem>
            <DefaultValue
              type={field.type === 'number' ? 'number' : 'text'}
              value={field.defaultValue || ''}
              onChange={handleDefaultValueChange}
            />
            <NameField value={field.name || ''} onChange={handleNameChange} />
          </>
        );
      case 'password':
        return (
          <>
            <FormItem>
              <Label>Placeholder</Label>
              <Input
                type="text"
                value={field.placeholder || ''}
                onChange={handlePlaceholderChange}
              />
            </FormItem>
            <NameField value={field.name || ''} onChange={handleNameChange} />
          </>
        );
      case 'select':
        return (
          <>
            <FormItem>
              <Label>Placeholder</Label>
              <Input
                type="text"
                value={field.placeholder || ''}
                onChange={handlePlaceholderChange}
              />
            </FormItem>
            <NameField value={field.name || ''} onChange={handleNameChange} hasValidation />
            <div className="flex justify-between items-center">
              <Label>Options</Label>
              {hasNoOptionsConfigured ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="xs" color="secondary" variant="ghost">
                      <Plus size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32" align="end">
                    <DropdownMenuItem onSelect={handleAddOption}>List</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleAddGroup}>Group list</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <ExternalDataOptions
                        external={field.external}
                        onChange={(value) => onChange({ external: value })}>
                        <button className="dropdown-item w-full hover:bg-slate-100">
                          API source
                        </button>
                      </ExternalDataOptions>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="text-xs text-gray-500"
                  variant="ghost"
                  size="xs"
                  color="secondary"
                  onClick={handleRemoveAllOptions}>
                  Remove all
                </Button>
              )}
            </div>

            {/* OPTION LIST */}
            {(field.options?.length || 0) > 0 && (
              <>
                <Accordion
                  type="multiple"
                  defaultValue={field.options?.map((option) => String(option.id))}
                  className="w-auto !-mt-0">
                  {field.options?.map((option, index) => (
                    <AccordionItem key={String(option.id)} value={String(option.id)}>
                      <AccordionTrigger className="text-gray-700 text-sm">
                        {option.label || 'Option name'}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1">
                        <OptionItem
                          key={option.id}
                          option={option}
                          index={index}
                          onUpdate={handleOptionUpdate}
                          onDelete={handleOptionDelete}
                        />
                        <div className="flex items-center ml-4 gap-2 mt-2">
                          <Label htmlFor={option.id as string} className="text-xs text-gray-600">
                            Set as default
                          </Label>
                          <Switch
                            id={option.id as string}
                            disabled={option.value === '' || option.label === ''}
                            checked={field.defaultValue === option.value}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                onChange({ defaultValue: option.value });
                              } else if (field.defaultValue === option.value) {
                                onChange({ defaultValue: undefined });
                              }
                            }}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Button onClick={handleAddOption} size="xs" color="secondary" variant="ghost">
                  <Plus size={15} /> Add option
                </Button>
              </>
            )}

            {/* OPTION GROUPS */}
            {field.optionGroups?.map((group, groupIndex) => (
              <OptionGroup
                key={group.id}
                group={group}
                groupIndex={groupIndex}
                field={field}
                onUpdate={handleGroupUpdate}
                onDelete={handleGroupDelete}
                onAddItem={handleAddItemToGroup}
              />
            ))}
            {(field.optionGroups?.length ?? 0) > 0 && (
              <Button onClick={handleAddGroup} size="xs" color="secondary" variant="ghost">
                <Plus size={15} /> Add group
              </Button>
            )}

            {field.external?.url && (
              <div>
                <Label className="text-xs text-gray-600">API Source</Label>
                <div className="flex items-center space-x-2">
                  <Badge size="sm">
                    <p className="max-w-52 truncate">{field.external.url}</p>
                  </Badge>
                  <ExternalDataOptions
                    external={field.external}
                    onChange={(value) => onChange({ external: value })}>
                    <Button variant="ghost" size="xs" color="secondary" className="text-gray-600">
                      <span className="sr-only">Edit API source</span>
                      <PencilLineIcon size={15} />
                    </Button>
                  </ExternalDataOptions>
                </div>
              </div>
            )}
          </>
        );
      case 'checkbox':
      case 'radio':
        return (
          <>
            <NameField value={field.name || ''} onChange={handleNameChange} />
            <div className="flex justify-between items-center">
              <Label>{field.type === 'checkbox' ? 'Checkbox' : 'Radio'} items</Label>
              {(field.items?.length || 0) > 0 ? (
                <Button
                  className="text-xs text-gray-500"
                  variant="ghost"
                  size="xs"
                  color="secondary"
                  onClick={handleDeleteAllItems}>
                  Remove all
                </Button>
              ) : (
                <Button onClick={handleAddItem} size="xs" color="secondary" variant="ghost">
                  <Plus size={15} />
                </Button>
              )}
            </div>
            <Accordion
              type="multiple"
              defaultValue={field.items?.map((item) => String(item.id))}
              className="w-auto !-mt-0">
              {field.items?.map((item, index) => (
                <AccordionItem key={String(item.id)} value={String(item.id)}>
                  <AccordionTrigger className="text-gray-700 text-sm py-3">
                    {item.label || 'Item name'}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1">
                    <OptionItem
                      key={item.id || item.value}
                      option={item}
                      index={index}
                      onUpdate={handleItemUpdate}
                      onDelete={handleItemDelete}
                    />
                    <div className="flex items-center ml-4 gap-2 mt-2">
                      <Label htmlFor={item.id as string} className="text-xs text-gray-600">
                        Set as default
                      </Label>
                      <Switch
                        id={item.id as string}
                        disabled={item.value === '' || item.label === ''}
                        checked={field.defaultValue?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (field.type === 'radio') {
                              onChange({ defaultValue: item.value });
                              updateFieldValue(field.id, item.value);
                            } else if (field.type === 'checkbox') {
                              const newValue = [...(field.defaultValue || []), item.value];
                              onChange({ defaultValue: newValue });
                              updateFieldValue(field.id, newValue);
                            }
                          } else if (field.defaultValue?.includes(item.value)) {
                            if (field.type === 'radio') {
                              onChange({ defaultValue: undefined });
                              updateFieldValue(field.id, undefined);
                            } else if (field.type === 'checkbox') {
                              const newValue = field.defaultValue?.filter(
                                (v: string) => v !== item.value
                              );
                              onChange({
                                defaultValue: newValue.length > 0 ? newValue : undefined
                              });
                              updateFieldValue(
                                field.id,
                                newValue.length > 0 ? newValue : undefined
                              );
                            }
                          }
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              {field.items?.length > 0 && (
                <Button
                  onClick={handleAddItem}
                  size="xs"
                  color="secondary"
                  variant="ghost"
                  className="mt-2.5">
                  <Plus size={15} /> Add item
                </Button>
              )}
            </Accordion>
          </>
        );
      case 'date':
        return (
          <>
            <FormItem>
              <Label>Mode</Label>
              <Select
                value={field.mode}
                onValueChange={(value) => {
                  onChange({
                    mode: value as DatePickerProps['mode'],
                    value: undefined, // Reset value when mode changes
                    options: {
                      ...field.options,
                      min: value === 'single' ? undefined : field.options?.min,
                      max: value === 'single' ? undefined : field.options?.max,
                      restrictedMonths:
                        value !== field.mode ? undefined : field.options?.restrictedMonths
                    }
                  });
                }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">
                    <Calendar1Icon className="inline mr-2 size-4" />
                    Single
                  </SelectItem>
                  <SelectItem value="multiple">
                    <CalendarDaysIcon className="inline mr-2 size-4" />
                    Multiple
                  </SelectItem>
                  <SelectItem value="range">
                    <CalendarRangeIcon className="inline mr-2 size-4" />
                    Range
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <Label>Placeholder</Label>
              <Input
                type="text"
                placeholder="e.g. Select date"
                value={field.placeholder || ''}
                onChange={handlePlaceholderChange}
              />
            </FormItem>
            <FormItem>
              <Label>Date format</Label>
              <Select
                value={field.options?.dateFormat}
                onValueChange={(value) => {
                  onChange({
                    options: {
                      ...field.options,
                      dateFormat: value
                    }
                  });
                }}>
                <SelectTrigger defaultValue={field.options?.dateFormat}>
                  <SelectValue placeholder="Choose format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            {(field.mode === 'range' || field.mode === 'multiple') && (
              <div className="flex space-x-4">
                <FormItem className="flex-1">
                  <Label>Min selected</Label>
                  <Input
                    type="number"
                    min={0}
                    max={field.options?.max}
                    value={field.options?.min || ''}
                    onChange={({ target }) => {
                      const minValue = target.value ? parseInt(target.value, 10) : undefined;
                      if (minValue && field.options?.max && minValue > field.options.max) {
                        onChange({
                          options: {
                            ...field.options,
                            min: undefined
                          }
                        });
                      } else {
                        onChange({
                          options: {
                            ...field.options,
                            min: minValue
                          }
                        });
                      }
                    }}
                  />
                </FormItem>
                <FormItem className="flex-1">
                  <Label>Max selected</Label>
                  <Input
                    type="number"
                    min={field.options?.min || 0}
                    value={field.options?.max || ''}
                    onChange={({ target }) => {
                      const maxValue = target.value ? parseInt(target.value, 10) : undefined;
                      if (maxValue && field.options?.min && maxValue < field.options.min) {
                        onChange({
                          options: {
                            ...field.options,
                            max: undefined
                          }
                        });
                      } else {
                        onChange({
                          options: {
                            ...field.options,
                            max: maxValue
                          }
                        });
                      }
                    }}
                  />
                </FormItem>
              </div>
            )}
            <FormItem>
              <div
                className={`flex items-center justify-between ${!restrictedDates ? 'py-1.5' : ''}`}>
                <Label>Restricted months</Label>
                {restrictedDates && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-xs text-gray-600"
                    color="secondary"
                    onClick={() => {
                      setRestrictedDates(undefined);
                      onChange({
                        options: {
                          ...field.options,
                          restrictedMonths: undefined
                        }
                      });
                    }}>
                    Reset
                  </Button>
                )}
              </div>
              <DatePicker
                mode="range"
                selected={restrictedDates}
                placeholder="Select months"
                onSelect={(dates) => {
                  const dateRange = dates as DateRange;
                  setRestrictedDates(dateRange);
                  onChange({
                    options: {
                      ...field.options,
                      restrictedMonths: [
                        dateRange?.from?.toString(),
                        dateRange?.to?.toString()
                      ].filter((date): date is string => Boolean(date))
                    }
                  });
                }}
              />
              <p className="form-description">
                This will restrict the date picker to only allow selection within this range.
              </p>
            </FormItem>
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label htmlFor="past-dates">Disable past</Label>
                <p className="form-description">Prevent selection of past dates</p>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Switch
                  id="past-dates"
                  checked={field.options?.disabledPast || false}
                  onCheckedChange={(checked) => {
                    onChange({
                      options: {
                        ...field.options,
                        disabledPast: checked
                      }
                    });
                  }}
                />
              </div>
            </FormItem>
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label htmlFor="future-dates">Disable future</Label>
                <p className="form-description">Prevent selection of future dates</p>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Switch
                  id="future-dates"
                  checked={field.options?.disabledFuture || false}
                  onCheckedChange={(checked) => {
                    onChange({
                      options: {
                        ...field.options,
                        disabledFuture: checked
                      }
                    });
                  }}
                />
              </div>
            </FormItem>
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label htmlFor="future-dates">Disable weekdays</Label>
                <p className="form-description">Prevent selection of weekdays</p>
                {field.options?.disabledWeekdays?.length ? (
                  <div className="flex items-center gap-0.5 mt-2">
                    {weekdays.map((day) =>
                      field.options?.disabledWeekdays?.includes(day.value) ? (
                        <Badge key={day.value} size="xs" className="pr-0.5">
                          {day.label.substring(0, 3)}
                          <button
                            className="ml-1"
                            onClick={() => {
                              const newDisabledWeekdays = (
                                field.options?.disabledWeekdays || []
                              ).filter((d) => d !== day.value);
                              onChange({
                                options: {
                                  ...field.options,
                                  disabledWeekdays:
                                    newDisabledWeekdays.length > 0 ? newDisabledWeekdays : undefined
                                }
                              });
                            }}>
                            <XIcon className="size-3" />
                          </button>
                        </Badge>
                      ) : null
                    )}
                  </div>
                ) : null}
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="xs" color="secondary" variant="ghost">
                      <Plus size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {weekdays.map((day) => (
                      <DropdownMenuCheckboxItem
                        key={day.value}
                        checked={field.options?.disabledWeekdays?.includes(day.value)}
                        onCheckedChange={(checked) => {
                          const newDisabledWeekdays = checked
                            ? [...(field.options?.disabledWeekdays || []), day.value]
                            : (field.options?.disabledWeekdays || []).filter(
                                (d) => d !== day.value
                              );
                          onChange({
                            options: {
                              ...field.options,
                              disabledFuture: false,
                              disabledPast: false,
                              disabledWeekdays: newDisabledWeekdays
                            }
                          });
                        }}>
                        {day.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </FormItem>
          </>
        );

      case 'file':
        return (
          <>
            <FormItem>
              <Label>Multiple Files</Label>
              <Input
                type="checkbox"
                checked={field.multiple || false}
                onChange={(e) => onChange({ multiple: e.target.checked })}
              />
            </FormItem>
            <FormItem>
              <Label>Server URL</Label>
              <Input
                type="text"
                value={field.options?.server || ''}
                onChange={(e) =>
                  onChange({
                    options: {
                      ...field.options,
                      server: e.target.value
                    } as typeof field.options
                  })
                }
              />
            </FormItem>
            <FormItem>
              <Label>Instant Upload</Label>
              <Input
                type="checkbox"
                checked={field.options?.instantUpload || false}
                onChange={(e) =>
                  onChange({
                    options: {
                      ...field.options,
                      instantUpload: e.target.checked
                    } as typeof field.options
                  })
                }
              />
            </FormItem>
            <FormItem>
              <Label>Appearance</Label>
              <Input
                type="checkbox"
                checked={field.appearance?.droppable || false}
                onChange={(e) =>
                  onChange({
                    appearance: {
                      ...field.appearance,
                      droppable: e.target.checked
                    }
                  })
                }
              />
              <span className="ml-2">Droppable</span>
            </FormItem>
          </>
        );

      default:
        return null;
    }
  }, [
    field,
    handleNameChange,
    handlePlaceholderChange,
    hasNoOptionsConfigured,
    handleAddOption,
    handleAddGroup,
    handleRemoveAllOptions,
    handleOptionUpdate,
    handleOptionDelete,
    handleGroupUpdate,
    handleGroupDelete,
    handleAddItemToGroup,
    handleAddItem,
    handleItemUpdate,
    handleItemDelete,
    restrictedDates,
    dateFormatOptions,
    onChange
  ]);

  return (
    <div className="w-full space-y-4">
      <h6 className="font-semibold uppercase text-xs text-gray-400">Properties</h6>
      {renderTypeSpecificProperties}
    </div>
  );
});

GeneralPropertiesEditor.displayName = 'GeneralPropertiesEditor';
