import React, { useState, useCallback, useMemo, memo } from 'react';
import Dropzone from 'react-dropzone';
import { useFormBuilder } from '@form-builder/core';
import {
  Button,
  Checkbox,
  DatePicker,
  DatePickerProps,
  DateRange,
  FormGroup,
  FormItem,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@parama-ui/react';
import * as LucideIcons from 'lucide-react';
import type {
  DateField,
  FieldConditions,
  FieldGroupItem,
  FormField as FormFieldType
} from '@form-builder/types';
import '../../parama-ui/dist/parama-ui.min.css';

// Memoized components for better performance
const MemoizedIcon = memo(({ iconName, size = 15 }: { iconName: string; size?: number }) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon ? <Icon size={size} /> : null;
});

const MemoizedSelectOptions = memo(({ options }: { options: FieldGroupItem[] }) => (
  <>
    {options
      .filter((opt) => opt.id && opt.value && opt.label)
      .map((opt) => (
        <SelectItem key={opt.id} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
  </>
));

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
          {group.label && ( // Check if group has a label
            <SelectLabel>{group.label}</SelectLabel>
          )}
          {group.items
            .filter((opt) => opt.id && opt.value && opt.label) // Ensure valid options
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

const MemoizedRadioItems = memo(({ items, fieldName }: { items: any[]; fieldName: string }) => (
  <>
    {items.map((item) => (
      <div key={item.id} className="flex items-center space-x-2">
        <RadioGroupItem value={item.value} id={item.id as string} />
        <Label htmlFor={item.id as string}>{item.label}</Label>
      </div>
    ))}
  </>
));

const MemoizedCheckboxItems = memo(
  ({
    items,
    fieldName,
    value,
    required,
    onCheckedChange
  }: {
    items: any[];
    fieldName: string;
    value: any;
    required: boolean;
    onCheckedChange: (item: any) => (checked: boolean) => void;
  }) => (
    <>
      {items.map((item) => (
        <div className="flex items-center space-x-2" key={item.id}>
          <Checkbox
            id={item.id as string}
            name={fieldName}
            required={required}
            disabled={item.disabled}
            value={item.value}
            defaultChecked={value?.includes(item.value)}
            onCheckedChange={onCheckedChange(item)}
            className="mr-2"
          />
          <Label htmlFor={item.id as string}>{item.label}</Label>
        </div>
      ))}
    </>
  )
);

export const FormField: React.FC<{ field: FormFieldType }> = memo(({ field }) => {
  const { formData, actions } = useFormBuilder();
  const value = formData[field.id] ?? field.defaultValue;

  // Memoized handlers
  const handleChange = useCallback(
    (value: any) => {
      actions.updateFieldValue(field.id, value);
      actions.validateField(field.id);
    },
    [actions, field.id]
  );

  const handleFocus = useCallback(() => {
    actions.selectField(field.id);
  }, [actions, field.id]);

  // Memoized validation value getter
  const getValidationValue = useCallback(
    (validationName: string) => {
      if (field.type === 'submit') return false;
      if (!field.validation) return false;
      if (typeof (field.validation as Record<string, unknown>)?.[validationName] === 'boolean') {
        return (field.validation as Record<string, unknown>)[validationName] === true;
      } else {
        return (field.validation as Record<string, { value: unknown; message: string }>)[
          validationName
        ]?.value;
      }
    },
    [field]
  );

  // Memoized conditions evaluator
  const evaluateConditions = useCallback(
    (field: FormFieldType, type: keyof FieldConditions) => {
      if (!field.conditions?.[type]) return type === 'visibility' ? true : false;

      const { dependsOn, operator, value } = field.conditions[type];
      if (!dependsOn || !operator || value === undefined) return false;

      const dependentValue = formData[dependsOn];
      if (!dependentValue) return false;

      switch (operator) {
        case 'Equals':
          return dependentValue === value;
        case 'NotEqual':
          return dependentValue !== value;
        case 'GreaterThan':
          return dependentValue > value;
        case 'LessThan':
          return dependentValue < value;
        case 'LessOrEqual':
          return dependentValue <= value;
        case 'GreaterOrEqual':
          return dependentValue >= value;
        default:
          return true;
      }
    },
    [formData]
  );

  // Memoized appearance renderer
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

  // Memoized computed values
  const isDisabled = useMemo(
    () => evaluateConditions(field, 'disabled'),
    [evaluateConditions, field]
  );
  const isReadOnly = useMemo(
    () => evaluateConditions(field, 'readOnly'),
    [evaluateConditions, field]
  );
  const isRequired = useMemo(() => getValidationValue('required') as boolean, [getValidationValue]);
  const isVisible = useMemo(
    () => evaluateConditions(field, 'visibility'),
    [evaluateConditions, field]
  );

  // Memoized input change handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(e.target.value);
    },
    [handleChange]
  );

  const handleSelectChange = useCallback(
    (selectedValue: string) => {
      handleChange(selectedValue);
    },
    [handleChange]
  );

  const handleRadioChange = useCallback(
    (value: string) => {
      handleChange(value);
    },
    [handleChange]
  );

  // Memoized checkbox change handler factory
  const createCheckboxHandler = useCallback(
    (item: any) => (checked: boolean) => {
      const newValue = checked
        ? [...(value || []), item.value]
        : (value || []).filter((v: any) => v !== item.value);
      handleChange(newValue);
    },
    [value, handleChange]
  );

  // Memoized date states and handlers
  const [singleDate, setSingleDate] = useState<Date | undefined>(() =>
    value && (field as DateField).mode === 'single' ? new Date(value) : undefined
  );
  const [multipleDates, setMultipleDates] = useState<Date[]>(() =>
    value && (field as DateField).mode === 'multiple'
      ? value.map((d: string) => new Date(d))
      : undefined
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    value && (field as DateField).mode === 'range'
      ? {
          from: value.from ? new Date(value.from) : undefined,
          to: value.to ? new Date(value.to) : undefined
        }
      : undefined
  );

  const handleSingleDateChange = useCallback(
    (date: Date | undefined) => {
      setSingleDate(date);
      actions.updateFieldValue(field.id, date ? date.toLocaleDateString() : undefined);
      actions.validateField(field.id);
    },
    [actions, field.id]
  );

  const handleMultipleDateChange = useCallback(
    (dates: Date[]) => {
      setMultipleDates(dates);
      actions.updateFieldValue(field.id, dates);
      actions.validateField(field.id);
    },
    [actions, field.id]
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      setDateRange(range);
      actions.updateFieldValue(field.id, range);
      actions.validateField(field.id);
    },
    [actions, field.id]
  );

  // Memoized disabled dates
  const disabledDates = useMemo(() => {
    const disabled: any = {};

    if ((field as DateField).options?.disabledPast) {
      disabled.before = new Date(new Date().setDate(new Date().getDate() - 1));
    }

    if ((field as DateField).options?.disabledFuture) {
      disabled.after = new Date(new Date().setDate(new Date().getDate() + 1));
    }

    if ((field as DateField).options?.disabledWeekdays) {
      disabled.dayOfWeek = (field as DateField).options?.disabledWeekdays;
    }

    return Object.keys(disabled).length > 0 ? disabled : undefined;
  }, [
    (field as DateField).options?.disabledPast,
    (field as DateField).options?.disabledFuture,
    (field as DateField).options?.disabledWeekdays
  ]);

  // Memoized common input props
  const commonInputProps = useMemo(
    () => ({
      id: field.id,
      name: field.name,
      disabled: isDisabled,
      readOnly: isReadOnly,
      placeholder: field.placeholder,
      required: isRequired,
      onFocus: handleFocus,
      className: field.error ? 'border-red-500' : ''
    }),
    [
      field.id,
      field.name,
      field.placeholder,
      field.error,
      isDisabled,
      isReadOnly,
      isRequired,
      handleFocus
    ]
  );

  // Memoized appearance props
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

  const renderInput = useMemo(() => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        const inputElement = (
          <Input
            {...commonInputProps}
            type={field.type}
            defaultValue={value || ''}
            onChange={handleInputChange}
          />
        );

        return field.appearance ? (
          <FormGroup {...appearanceProps}>{inputElement}</FormGroup>
        ) : (
          inputElement
        );

      case 'textarea':
        return (
          <Textarea
            {...commonInputProps}
            defaultValue={value || ''}
            rows={field.rows || 3}
            onChange={handleInputChange}
          />
        );

      case 'date':
        const commonDateProps = {
          name: field.name,
          disabledInput: isDisabled,
          placeholder: field.placeholder,
          dateFormat: field.options?.dateFormat,
          disabled: disabledDates,
          startMonth: field.options?.restrictedMonths?.[0]
            ? new Date(field.options.restrictedMonths[0])
            : undefined,
          endMonth: field.options?.restrictedMonths?.[1]
            ? new Date(field.options.restrictedMonths[1])
            : undefined,
          captionLayout: field.options?.dropdownType as DatePickerProps['captionLayout'],
          container: document.getElementById(`item__${field.id}`),
          className: field.error ? 'border-red-500' : 'border-gray-300'
        };

        if (field.mode === 'single') {
          return (
            <DatePicker
              mode="single"
              required={isRequired}
              selected={singleDate}
              onSelect={handleSingleDateChange}
              {...commonDateProps}
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
            />
          );
        } else {
          return (
            <DatePicker
              mode="range"
              required
              selected={dateRange}
              onSelect={handleDateRangeChange}
              {...commonDateProps}
            />
          );
        }

      case 'radio':
        return (
          <RadioGroup
            name={field.name}
            defaultValue={field.defaultValue}
            disabled={field.disabled}
            required={isRequired}
            onValueChange={handleRadioChange}
            orientation={field.appearance?.position}>
            <MemoizedRadioItems items={field.items || []} fieldName={field.name} />
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <MemoizedCheckboxItems
            items={field.items || []}
            fieldName={field.name}
            value={value}
            required={isRequired}
            onCheckedChange={createCheckboxHandler}
          />
        );

      case 'select':
        return (
          <Select
            name={field.name}
            defaultValue={value}
            disabled={field.disabled}
            required={isRequired}
            onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full" onFocus={handleFocus}>
              <SelectValue
                className="text-slate-400"
                placeholder={field.placeholder || 'Select an option'}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options.length > 0 && (
                <MemoizedSelectOptions options={field.options || []} />
              )}
              {field.optionGroups && field.optionGroups.length > 0 && (
                <MemoizedSelectGroupsOptions optionGroups={field.optionGroups} />
              )}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <Dropzone
            accept={field.validation?.accept}
            disabled={field.disabled}
            maxFiles={field.validation?.maxFiles}
            maxSize={field.validation?.maxSize}
            multiple={field.multiple}>
            {({ getRootProps, getInputProps, acceptedFiles }) => (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-4 ${field.error ? 'border-red-500' : 'border-gray-300'}`}>
                <input {...getInputProps()} name={field.name} />
                <p className="text-center">
                  {field.label ?? 'Drag & drop files here, or click to browse'}
                </p>
                <ul>
                  {acceptedFiles.map((file, index) => (
                    <li key={`${file.name}_${index}`}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </Dropzone>
        );

      case 'submit':
        return <Button type="submit">{field.label}</Button>;

      default:
        return <div>Unsupported field type</div>;
    }
  }, [
    field,
    value,
    commonInputProps,
    appearanceProps,
    handleInputChange,
    isRequired,
    isDisabled,
    singleDate,
    multipleDates,
    dateRange,
    disabledDates,
    handleSingleDateChange,
    handleMultipleDateChange,
    handleDateRangeChange,
    handleRadioChange,
    handleSelectChange,
    createCheckboxHandler,
    handleFocus
  ]);

  if (!isVisible) return null;

  return (
    <FormItem
      id={`item__${field.id}`}
      className={`column-span-${field.width}`}
      orientation={
        field.type === 'checkbox' || field.type === 'radio'
          ? field.appearance?.position
          : 'vertical'
      }>
      {field.type !== 'submit' && <Label>{field.label}</Label>}
      {renderInput}
      {field.type !== 'submit' && field.error && (
        <span className="text-red-500 text-sm mt-1">{field.error}</span>
      )}
      {field.type !== 'submit' && field.helpText && (
        <span className="form-description">{field.helpText}</span>
      )}
    </FormItem>
  );
});

FormField.displayName = 'FormField';
