import { useFormBuilder } from '@parama-dev/form-builder-core';
import type {
  BlockField,
  DateField,
  FieldGroupItem,
  FormField as FormFieldType,
  MultiSelectField,
  AutoCompleteField,
  TextField,
  FileField,
  RadioField,
  CheckboxField,
  SelectField,
  ButtonField as ButtonFieldType,
  FormBuilderProps
} from '@parama-dev/form-builder-types';
import {
  Button,
  Checkbox,
  cn,
  DatePicker,
  DatePickerProps,
  DateRange,
  FormGroup,
  FormItem,
  Input,
  Label,
  MultiSelect,
  AutoComplete,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Skeleton,
  FileUpload,
  Textarea
} from '@parama-ui/react';
import * as LucideIcons from 'lucide-react';
import { Loader2Icon } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

// Memoized components remain the same
const MemoizedIcon = memo(({ iconName, size = 15 }: { iconName: string; size?: number }) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon ? <Icon size={size} /> : null;
});

const MemoizedSelectOptions = memo(({ field, options }: { field: FormFieldType; options: FieldGroupItem[] }) => {
  return (
    <>
      {options
        .filter((opt) => opt.id && opt.value && opt.label)
        .map((opt) => (
          <SelectItem key={opt.id} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
    </>
  );
});

const MemoizedSelectGroupsOptions = memo(
  ({
    optionGroups
  }: {
    optionGroups: {
      id: string;
      label: string;
      items: FieldGroupItem[];
    }[];
  }) => (
    <>
      {optionGroups.map((group) => (
        <SelectGroup key={group.id}>
          {group.label && <SelectLabel>{group.label}</SelectLabel>}
          {group.items
            .filter((opt) => opt.id && opt.value && opt.label)
            .map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
        </SelectGroup>
      ))}
    </>
  )
);

const MemoizedRadioItems = memo(({ items, defaultValue }: { items: FieldGroupItem[]; defaultValue?: string }) => (
  <>
    {items
      .filter((item) => item.id && item.value && item.label)
      .map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <RadioGroupItem value={item.value} id={item.id as string} checked={item.value === defaultValue} />
          <Label htmlFor={item.id as string}>{item.label}</Label>
        </div>
      ))}
  </>
));

const MemoizedCheckboxItems = memo(
  ({
    items,
    fieldName,
    defaultValue,
    required,
    disabled,
    onCheckedChange
  }: {
    items: FieldGroupItem[];
    fieldName: string;
    defaultValue: string[] | undefined;
    required: boolean;
    disabled?: boolean;
    onCheckedChange: (item: any) => (checked: boolean | 'indeterminate') => void;
  }) => (
    <>
      {items
        .filter((item) => item.id && item.value && item.label)
        .map((item) => (
          <div className="flex items-center space-x-2" key={item.id}>
            <Checkbox
              id={item.id as string}
              name={fieldName}
              disabled={disabled || item.disabled}
              value={item.value}
              checked={(defaultValue || []).includes(item.value)}
              onCheckedChange={onCheckedChange(item)}
              className="mr-2"
            />
            <Label htmlFor={item.id as string}>{item.label}</Label>
          </div>
        ))}
    </>
  )
);

// Type for input fields that have all the common properties
type InputFieldType =
  | TextField
  | FileField
  | RadioField
  | CheckboxField
  | SelectField
  | MultiSelectField
  | AutoCompleteField
  | DateField;

// Separate component for block fields
const BlockField: React.FC<{ field: BlockField }> = memo(({ field }) => {
  const { mode } = useFormBuilder();
  const isEditor = mode === 'editor';

  if (field.type === 'spacer') {
    const height = field.height || 2;
    const spacerHeight = height * 24; // 24px per height unit

    return (
      <div
        className={cn(
          `column-span-${field.width}`,
          (field as any).widthTablet ? `md:column-span-${(field as any).widthTablet}` : '',
          (field as any).widthMobile ? `sm:column-span-${(field as any).widthMobile}` : ''
        )}
        style={{ height: `${spacerHeight}px` }}>
        {isEditor && (
          <div className="h-full bg-void border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">Spacer ({height} units)</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        `column-span-${field.width}`,
        (field as any).widthTablet ? `md:column-span-${(field as any).widthTablet}` : '',
        (field as any).widthMobile ? `sm:column-span-${(field as any).widthMobile}` : ''
      )}
      style={{ minHeight: field.height ? `${field.height * 24}px` : 'auto' }}>
      {typeof field.content === 'string' ? (
        <div className="min-h-full" dangerouslySetInnerHTML={{ __html: field.content }} />
      ) : (
        field.content
      )}
    </div>
  );
});

BlockField.displayName = 'BlockField';

// Separate component for button fields
const ButtonField: React.FC<{ field: ButtonFieldType; onCancel: FormBuilderProps['onCancel']; disabled?: boolean }> =
  memo(({ field, onCancel, disabled }) => {
    const { actions, mode, formState } = useFormBuilder();

    const handleReset = () => {
      actions.resetForm();
    };

    // For submit buttons, also check the internal submission state
    const isButtonDisabled = disabled || (field.action === 'submit' && formState.isSubmitting);

    return (
      <>
        {mode === 'render' && field.appearance?.stickyAtBottom && <div className="bg-fade column-span-12" />}
        <div
          className={cn(
            `column-span-${field.width}`,
            (field as any).widthTablet ? `md:column-span-${(field as any).widthTablet}` : '',
            (field as any).widthMobile ? `sm:column-span-${(field as any).widthMobile}` : '',
            mode === 'render' && field.appearance?.stickyAtBottom ? 'sticky-btn' : ''
          )}>
          <Button
            type={field.type}
            color={field.appearance?.color}
            size={field.appearance?.size}
            variant={field.appearance?.variant}
            className="w-full"
            disabled={isButtonDisabled}
            onClick={field.action === 'cancel' ? onCancel : field.action === 'reset' ? handleReset : undefined}>
            {field.action === 'submit' && formState.isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {field.loadingText || null}
              </>
            ) : (
              field.label
            )}
          </Button>
        </div>
      </>
    );
  });

ButtonField.displayName = 'ButtonField';

// Main component for form input fields (excluding block and button types)
const InputField: React.FC<{ field: InputFieldType }> = memo(({ field }) => {
  const { formData, actions, visibleFields, disabledFields, readOnlyFields, mode } = useFormBuilder();

  // Use getFieldValue for intelligent value retrieval (handles both regular and file fields)
  const value = actions.getFieldValue(field.id) ?? field.defaultValue;
  const existingFiles = useMemo(() => (field.type === 'file' ? actions.getExistingFiles(field.id) : []), [actions, field.id, field.type]);
  const validationState = actions.getFieldValidation(field.id);
  const [firstRender, setFirstRender] = useState(true);

  const [hiddenValue, setHiddenValue] = useState<string>(value || '');
  const [textValue, setTextValue] = useState<string>(value || '');
  const [debouncedTextValue] = useDebounce(textValue, 150);
  const [selectValue, setSelectValue] = useState<string>(value || '');
  const [multiselectValue, setMultiselectValue] = useState<string[]>(value || []);
  const [autocompleteValue, setAutocompleteValue] = useState<string>(value || '');
  const [radioValue, setRadioValue] = useState<string>(value || '');
  const [checkboxValue, setCheckboxValue] = useState<string[]>(value || []);

  const [singleDate, setSingleDate] = useState<Date | undefined>(() => {
    if ((field as DateField).mode === 'single' && value) {
      return value instanceof Date ? value : typeof value === 'string' ? new Date(value) : undefined;
    }
    return undefined;
  });

  const [multipleDates, setMultipleDates] = useState<Date[] | undefined>(() => {
    if ((field as DateField).mode === 'multiple' && Array.isArray(value)) {
      return value
        .filter((d) => d instanceof Date || (typeof d === 'string' && !isNaN(Date.parse(d))))
        .map((d) => (d instanceof Date ? d : new Date(d)));
    }
    return undefined;
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (
      (field as DateField).mode === 'range' &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('from' in value || 'to' in value)
    ) {
      const isValidDateValue = (val: any) => {
        if (!val) return false;
        if (val instanceof Date) return !isNaN(val.getTime());
        if (typeof val === 'string') return !isNaN(Date.parse(val));
        return false;
      };

      return {
        from: isValidDateValue(value.from)
          ? value.from instanceof Date
            ? value.from
            : new Date(value.from)
          : undefined,
        to: isValidDateValue(value.to) ? (value.to instanceof Date ? value.to : new Date(value.to)) : undefined
      };
    }
    return undefined;
  });

  const handleChange = useCallback(
    (value: any) => {
      actions.updateFieldValue(field.id, value);
    },
    [actions, field.id]
  );

  // Handle text input changes
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    handleChange(debouncedTextValue);
  }, [debouncedTextValue]);

  // Sync state when store value changes (e.g., when `data` prop updates)
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    // Sync text state when store value changes
    setTextValue((prev) => (prev !== (value || '') ? (value || '') : prev));
    setHiddenValue((prev) => (prev !== (value || '') ? (value || '') : prev));
    // Sync date state when store value changes
    if (field.type === 'date') {
      setSingleDate(value ? (value instanceof Date ? value : new Date(value)) : undefined);
      setMultipleDates(value ? (Array.isArray(value) ? value.map((v) => (v instanceof Date ? v : new Date(v))) : []) : undefined);
      setDateRange(value ? (typeof value === 'object' && !Array.isArray(value) && ('from' in value || 'to' in value) ? {
        from: value.from instanceof Date ? value.from : new Date(value.from),
        to: value.to instanceof Date ? value.to : new Date(value.to)
      } : undefined) : undefined);
    }
    // Sync select state when store value changes
    if (field.type === 'select') {
      setSelectValue(value || '');
    }
    // Sync multiselect state when store value changes
    if (field.type === 'multiselect') {
      setMultiselectValue(value || []);
    }
    // Sync autocomplete state when store value changes
    if (field.type === 'autocomplete') {
      setAutocompleteValue(value || '');
    }
    // Sync radio state when store value changes
    if (field.type === 'radio') {
      setRadioValue(value || '');
    }
    // Sync checkbox state when store value changes
    if (field.type === 'checkbox') {
      setCheckboxValue(value || []);
    }

  }, [value, field.id]);

  const renderAppearance = useCallback(
    ({
      type,
      content,
      options
    }: {
      type: 'text' | 'icon' | 'select' | 'button';
      content: React.ReactNode;
      options?: FieldGroupItem[];
    }) => {
      if (!content) return null;
      if (type === 'text') return content;
      if (type === 'icon') {
        return <MemoizedIcon iconName={content as string} />;
      }
      if (type === 'button') {
        return (
          <button type="button" onClick={() => {}}>
            {content}
          </button>
        );
      }
      if (type === 'select') {
        return (
          <select>
            {options?.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }
    },
    []
  );

  // Determine field state from workflow engine
  const isVisible = useMemo(
    () => (mode === 'editor' ? true : visibleFields.has(field.id)),
    [visibleFields, field.id, mode]
  );

  const isDisabled = useMemo(
    () => (mode === 'editor' ? false : disabledFields.has(field.id)),
    [disabledFields, field.id, mode]
  );

  const isReadOnly = useMemo(
    () => (mode === 'editor' ? false : readOnlyFields.has(field.id)),
    [readOnlyFields, field.id, mode]
  );

  const isRequired = useMemo(() => {
    const requiredRules = field.validations?.filter((rule: any) => rule.type === 'required')[0];
    return requiredRules ? true : false;
  }, [field.validations]);

  const handleSelectChange = useCallback(
    (selectedValue: string) => {
      handleChange(selectedValue);
    },
    [handleChange]
  );

  const handleMultiSelectChange = useCallback(
    (selectedValues: string[]) => {
      handleChange(selectedValues);
    },
    [handleChange]
  );

  const handleAutocompleteChange = useCallback(
    (selectedOption: { id: string; value: string; label: string }) => {
      handleChange(selectedOption.value);
    },
    [handleChange]
  );

  const handleRadioChange = useCallback(
    (value: string) => {
      handleChange(value);
    },
    [handleChange]
  );

  const createCheckboxHandler = useCallback(
    (item: any) => (checked: boolean | 'indeterminate') => {
      const isChecked = checked === true;
      const current = Array.isArray(value) ? value : [];
      const newValue = isChecked ? [...current.filter((v: any) => v !== item.value), item.value] : current.filter((v: any) => v !== item.value);
      handleChange(newValue);
    },
    [value, handleChange]
  );

  // State to track the parent element for date picker
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  // Effect to find and set the parent element for date picker
  useEffect(() => {
    if (field.type === 'date') {
      const findParentElement = () => {
        const element = document.getElementById(`item__${field.id}`);
        if (element && !parentElement) {
          setParentElement(element);
          return true; // Element found
        }
        return false; // Element not found
      };

      // Try to find the element immediately
      if (findParentElement()) {
        return; // Element found immediately, no need for observer
      }

      // If not found, set up a mutation observer to watch for it
      const observer = new MutationObserver(() => {
        if (findParentElement()) {
          observer.disconnect(); // Stop observing once found
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Cleanup observer when component unmounts
      return () => observer.disconnect();
    }
  }, [field.type, field.id]); // Removed parentElement from dependencies

  const handleSingleDateChange = useCallback(
    (date: Date | undefined) => {
      setSingleDate(date);
      handleChange(date ? date : undefined);
    },
    [handleChange]
  );

  const handleMultipleDateChange = useCallback(
    (dates: Date[]) => {
      setMultipleDates(dates);
      handleChange(dates);
    },
    [handleChange]
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      setDateRange(range);
      handleChange(range);
    },
    [handleChange]
  );

  const handleFileChange = useCallback(
    (files: File[]) => {
      actions.clearFieldError(field.id);
      handleChange(files);
    },
    [handleChange, actions, field.id, field.name]
  );

  // Memoized disabled dates (same as before)
  const disabledDates = useMemo(() => {
    const disabled: any = {};

    if ((field as DateField).options?.disabledPast) {
      disabled.before = new Date();
    } else {
      disabled.before = undefined;
    }

    if ((field as DateField).options?.disabledFuture) {
      disabled.after = new Date();
    } else {
      disabled.after = undefined;
    }

    if ((field as DateField).options?.disabledWeekdays) {
      disabled.dayOfWeek = (field as DateField).options?.disabledWeekdays;
    } else {
      delete disabled.dayOfWeek;
    }

    return Object.keys(disabled).length > 0 ? disabled : undefined;
  }, [
    (field as DateField).options?.disabledPast,
    (field as DateField).options?.disabledFuture,
    (field as DateField).options?.disabledWeekdays
  ]);

  // Memoized common input props (updated with new validation state)
  const commonInputProps = useMemo(
    () => ({
      id: field.id,
      name: field.name,
      disabled: isDisabled,
      placeholder: field.placeholder,
      required: isRequired,
      className: !validationState.isValid || field.error ? 'border-red-500' : ''
    }),
    [field.id, field.name, field.placeholder, field.error, isDisabled, isRequired, validationState.isValid]
  );

  // Memoized appearance props (same as before)
  const appearanceProps = useMemo(() => {
    if (!field.appearance) return null;
    if (
      field.type === 'text' ||
      field.type === 'email' ||
      field.type === 'textarea' ||
      field.type === 'password' ||
      field.type === 'number'
    ) {
      return {
        prefix: field.appearance.prefix ? renderAppearance(field.appearance.prefix) : undefined,
        suffix: field.appearance.suffix ? renderAppearance(field.appearance.suffix) : undefined,
        addOnStart: field.appearance.addOnStart
          ? renderAppearance({
              ...field.appearance.addOnStart,
              content: field.appearance.addOnStart.label
            })
          : undefined,
        addOnEnd: field.appearance.addOnEnd
          ? renderAppearance({
              ...field.appearance.addOnEnd,
              content: field.appearance.addOnEnd.label
            })
          : undefined
      };
    }
    return null;
  }, [field.appearance, renderAppearance]);

  const [multiSelectOptions, setMultiselectOptions] = useState((field as MultiSelectField).options ?? []);
  const [selectOptions, setSelectOptions] = useState((field as SelectField).options ?? []);
  const [autocompleteOptions, setAutocompleteOptions] = useState((field as AutoCompleteField).options ?? []);

  // Effect to handle dynamic options loading for select
  useEffect(() => {
    if (field.type === 'select') {
      if (field.external) {
        // Always fetch options when external is configured
        const getOptions = async () => {
          const options = await actions.refreshDynamicOptions(field);
          setSelectOptions(options);
        };
        actions.clearFieldError(field.id);

        getOptions();
      } else {
        if (field.options && Array.isArray(field.options)) {
          setSelectOptions(field.options);
        }
      }
    }
  }, [
    actions,
    field.type === 'select' ? field.options : null,
    field.type === 'select' ? field.external : null,
    // Watch for refresh trigger changes
    field.type === 'select' ? field.external?._refreshTimestamp : null
  ]);

  // Effect to handle dynamic options loading for multiselect
  useEffect(() => {
    if (field.type === 'multiselect') {
      if (field.external) {
        // Always fetch options when external is configured
        const getOptions = async () => {
          const options = await actions.refreshDynamicOptions(field);
          setMultiselectOptions(options);
        };
        actions.clearFieldError(field.id);

        getOptions();
      } else {
        if (field.options && Array.isArray(field.options)) {
          setMultiselectOptions(field.options);
        }
      }
    }
  }, [
    actions,
    field.type === 'multiselect' ? field.options : null,
    field.type === 'multiselect' ? field.external : null,
    // Watch for refresh trigger changes
    field.type === 'multiselect' ? field.external?._refreshTimestamp : null
  ]);

  // Effect to handle dynamic options loading for autocomplete
  useEffect(() => {
    if (field.type === 'autocomplete') {
      if (field.external) {
        // Always fetch options when external is configured
        const getOptions = async () => {
          const options = await actions.refreshDynamicOptions(field);
          setAutocompleteOptions(options);
        };
        actions.clearFieldError(field.id);

        getOptions();
      } else {
        if (field.options && Array.isArray(field.options)) {
          setAutocompleteOptions(field.options);
        }
      }
    }
  }, [
    actions,
    field.type === 'autocomplete' ? field.options : null,
    field.type === 'autocomplete' ? field.external : null,
    // Watch for refresh trigger changes
    field.type === 'autocomplete' ? field.external?._refreshTimestamp : null
  ]);

  const renderInput = useMemo(() => {
    switch (field.type) {
      case 'hidden':
        if (mode === 'editor') {
          return (
            <Input {...commonInputProps} className={cn(commonInputProps.className, 'bg-void')} type="text" readOnly />
          );
        } else {
          return <input type="hidden" value={hiddenValue} />;
        }
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        const inputElement = (
          <Input
            {...commonInputProps}
            className={cn(commonInputProps.className)}
            type={field.type}
            value={textValue}
            readOnly={isReadOnly}
            onChange={(e) => setTextValue(e.target.value || '')}
          />
        );

        return field.appearance ? <FormGroup {...appearanceProps}>{inputElement}</FormGroup> : inputElement;
      case 'textarea':
        return (
          <Textarea
            {...commonInputProps}
            value={textValue}
            readOnly={isReadOnly}
            disabled={isDisabled}
            rows={field.rows || 3}
            onChange={(e) => setTextValue(e.target.value || '')}
          />
        );
      case 'date':
        const commonDateProps = {
          name: field.name,
          disabledInput: isDisabled,
          placeholder: field.placeholder,
          dateFormat: field.options?.dateFormat,
          disabled: disabledDates,
          modalPopover: false,
          startMonth: field.options?.restrictedMonths?.[0] ? new Date(field.options.restrictedMonths[0]) : undefined,
          endMonth: field.options?.restrictedMonths?.[1] ? new Date(field.options.restrictedMonths[1]) : undefined,
          captionLayout: field.options?.dropdownType as DatePickerProps['captionLayout'],
          className: !validationState.isValid ? 'border-red-500' : 'border-gray-300'
        };

        // Only render DatePicker if we have a parent element or if we're in editor mode
        if (!parentElement && mode !== 'editor') {
          return <Skeleton className="h-12">Loading date picker...</Skeleton>;
        }

        if (field.mode === 'single') {
          return (
            <DatePicker
              mode="single"
              required={isRequired}
              selected={singleDate}
              onSelect={handleSingleDateChange}
              {...commonDateProps}
              container={parentElement}
            />
          );
        } else if (field.mode === 'multiple') {
          return (
            <DatePicker
              mode="multiple"
              required
              selected={multipleDates}
              onSelect={handleMultipleDateChange}
              min={field.options?.min}
              max={field.options?.max}
              {...commonDateProps}
              container={parentElement}
            />
          );
        } else {
          return (
            <DatePicker
              mode="range"
              required
              defaultMonth={dateRange?.from}
              selected={dateRange}
              min={field.options?.min}
              max={field.options?.max}
              onSelect={handleDateRangeChange}
              {...commonDateProps}
              container={parentElement}
            />
          );
        }

      case 'radio':
        return (
          <RadioGroup
            name={field.name}
            defaultValue={radioValue}
            disabled={isDisabled}
            required={isRequired}
            onValueChange={handleRadioChange}
            orientation={field.appearance?.position}>
            <MemoizedRadioItems defaultValue={radioValue} items={field.items || []} />
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <MemoizedCheckboxItems
            items={field.items || []}
            fieldName={field.name}
            defaultValue={checkboxValue}
            disabled={isDisabled}
            required={isRequired}
            onCheckedChange={createCheckboxHandler}
          />
        );

      case 'select':
        const selectField = field as SelectField;
        const optionsToUse = selectField.external ? selectOptions : selectField.options || [];

        return (
          <Select
            name={field.name}
            value={selectValue}
            disabled={isDisabled}
            required={isRequired}
            onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue className="text-slate-400" placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(optionsToUse) && optionsToUse.length > 0 && (
                <MemoizedSelectOptions field={field} options={optionsToUse} />
              )}
              {selectField.optionGroups && selectField.optionGroups.length > 0 && (
                <MemoizedSelectGroupsOptions optionGroups={selectField.optionGroups} />
              )}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <MultiSelect
            name={field.name}
            defaultValue={multiselectValue}
            disabled={isDisabled}
            placeholder={field.placeholder || 'Select options'}
            modalPopover={true}
            color="primary"
            variant="shadow"
            options={multiSelectOptions?.map((option) => ({
              value: option.value,
              label: option.label
            }))}
            onValueChange={handleMultiSelectChange}
          />
        );

      case 'autocomplete':
        const autocompleteField = field as AutoCompleteField;
        return (
          <AutoComplete
            options={autocompleteOptions?.map((option) => ({
              id: option.id?.toString() || '',
              value: option.value,
              label: option.label,
              description: option.description
            }))}
            value={
              autocompleteOptions?.find((opt) => opt.value === autocompleteValue)
                ? {
                    id: autocompleteOptions.find((opt) => opt.value === autocompleteValue)?.id?.toString() || '',
                    value: autocompleteValue,
                    label: autocompleteOptions.find((opt) => opt.value === autocompleteValue)?.label || '',
                    description: autocompleteOptions.find((opt) => opt.value === autocompleteValue)?.description
                  }
                : undefined
            }
            onValueChange={handleAutocompleteChange}
            disabled={isDisabled}
            placeholder={field.placeholder || 'Search options...'}
            shouldFilter={autocompleteField.shouldFilter !== false}
            emptyMessage="No options found"
          />
        );

      case 'file':
        return (
          <FileUpload
            accept={field.options.accept}
            server={field.options.server}
            name={field.name}
            disabled={isDisabled}
            required={isRequired}
            multiple={field.options.multiple}
            maxFiles={field.options.maxFiles}
            maxSize={field.options.maxSize}
            instantUpload={field.options.instantUpload}
            bulkUpload={field.options.bulkUpload}
            preferredUnit={field.options.preferredUnit}
            onFilesChange={handleFileChange}
            initialFiles={existingFiles}
            onExistingFileRemove={(index) => actions.removeExistingFileMeta(field.id, index)}
            onError={(error) => {
              actions.setFieldError(field.id, (error as Error).message || 'File upload failed');
            }}
            className={cn(!validationState.isValid || field.error ? 'border-red-500 bg-red-50' : '')}
          />
        );

      default:
        return <div>Unsupported field type</div>;
    }
  }, [
    field,
    field.error,
    value,
    mode,
    commonInputProps,
    appearanceProps,
    isRequired,
    isReadOnly,
    isDisabled,
    singleDate,
    multipleDates,
    dateRange,
    disabledDates,
    textValue,
    validationState.isValid,
    handleSingleDateChange,
    handleMultipleDateChange,
    handleDateRangeChange,
    handleRadioChange,
    handleSelectChange,
    handleMultiSelectChange,
    handleAutocompleteChange,
    createCheckboxHandler,
    selectOptions,
    multiSelectOptions,
    autocompleteOptions,
    parentElement
  ]);

  if (!isVisible) return null;

  return (
    <FormItem
      id={`item__${field.id}`}
      className={cn(
        `column-span-${field.width}`,
        (field as any).widthTablet ? `md:column-span-${(field as any).widthTablet}` : '',
        (field as any).widthMobile ? `sm:column-span-${(field as any).widthMobile}` : ''
      )}
      orientation={field.type === 'checkbox' || field.type === 'radio' ? field.appearance?.position : 'vertical'}>
      {mode === 'editor' ? <Label>{field.label}</Label> : field.type !== 'hidden' ? <Label>{field.label}</Label> : null}
      {field.type === 'file' && field.helpText && <p className="form-description">{field.helpText}</p>}
      {field.type === 'file' && (!validationState.isValid || field.error) && (
        <p className="text-red-500 text-xs mt-1">{validationState.messages[0] || field.error}</p>
      )}
      {renderInput}
      {field.type !== 'file' ? (
        !validationState.isValid || field.error ? (
          <span className="text-red-500 text-xs mt-1">{validationState.messages[0] || field.error}</span>
        ) : (
          field.helpText && <span className="form-description">{field.helpText}</span>
        )
      ) : null}
    </FormItem>
  );
});

InputField.displayName = 'InputField';

// Main router component that decides which sub-component to render
export const FormFieldRenderer: React.FC<{
  field: FormFieldType;
  isDisabled?: boolean;
  onChange?: FormBuilderProps['onChange'];
  onCancel?: FormBuilderProps['onCancel'];
}> = ({ field, onChange, onCancel, isDisabled }) => {
  if (field.type === 'block' || field.type === 'spacer') {
    return <BlockField field={field} />;
  }

  if (field.type === 'submit' || field.type === 'reset' || field.type === 'button') {
    return <ButtonField field={field as ButtonFieldType} onCancel={onCancel} disabled={isDisabled} />;
  }

  return <InputField field={field as InputFieldType} />;
};

FormFieldRenderer.displayName = 'FormField';
