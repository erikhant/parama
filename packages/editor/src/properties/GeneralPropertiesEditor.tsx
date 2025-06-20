import { FieldGroupItem, FormField } from '@form-builder/types';
import {
  FormItem,
  Label,
  Input,
  FormGroup,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DateRange,
  DatePicker,
  DatePickerProps,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@parama-ui/react';
import { HelpCircleIcon, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ExternalDataOptions } from './select/ExternalDataOptions';

type GeneralPropertiesEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const GeneralPropertiesEditor: React.FC<GeneralPropertiesEditorProps> = ({
  field,
  onChange
}) => {
  const renderTypeSpecificProperties = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'password':
      case 'email':
      case 'textarea':
        return (
          <>
            <FormItem>
              <Label>Placeholder</Label>
              <Input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </FormItem>
            <FormItem>
              <div className="form-captions">
                <Label>Name</Label>
                <p className="form-description">
                  Used to identify the field in the form data. It should be unique across the form
                </p>
              </div>
              <Input
                type="text"
                value={field.name || ''}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </FormItem>
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
                onChange={(e) => onChange({ placeholder: e.target.value })}
              />
            </FormItem>
            <FormItem>
              <div className="flex items-center justify-between">
                <Label>Name</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-gray-600">
                        <HelpCircleIcon size={15} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-72 mr-2" side="top">
                      <p className="form-description text-gray-700 leading-relaxed">
                        <b>How it works?</b>
                        <br />
                        This name will be used as the key in the form data object and should be{' '}
                        <strong>unique</strong> across the form. It depends on your backend how you
                        handle this data. <br /> If you are using a REST API, it will be sent as a
                        JSON object with this name as the key.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="text"
                value={field.name || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                  onChange({ name: value });
                }}
              />
              <p className="form-description">
                Only camelCase or snake_case characters are allowed. Spaces will be replaced with
                underscores.
              </p>
            </FormItem>
            <div className="flex justify-between items-center">
              <Label>Options</Label>
              {(!field.options || field.options?.length === 0) &&
              (!field.optionGroups || field.optionGroups?.length === 0) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="xs" color="secondary" variant="ghost">
                      <Plus size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32" align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        const newOption = {
                          id: `option-${Date.now()}`,
                          label: '',
                          value: ''
                        };
                        onChange({
                          options: [...(field.options || []), newOption] as FieldGroupItem[]
                        });
                      }}>
                      List
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        const newGroup = {
                          id: `group-${(field.optionGroups?.length || 0) + 1}`,
                          label: `Group ${(field.optionGroups?.length || 0) + 1}`,
                          items: [
                            {
                              id: `item-${Date.now()}`,
                              label: '',
                              value: ''
                            }
                          ]
                        };
                        onChange({
                          optionGroups: [...(field.optionGroups || []), newGroup]
                        });
                      }}>
                      Group list
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <ExternalDataOptions
                        external={field.external}
                        onChange={(value) => {
                          onChange({ external: value });
                        }}>
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
                  onClick={() => {
                    if (field.options) {
                      onChange({ options: undefined });
                    }
                    if (field.optionGroups) {
                      onChange({ optionGroups: undefined });
                    }
                  }}>
                  Remove all
                </Button>
              )}
            </div>

            {/* OPTION LIST */}
            {field.options?.map((option, index) => (
              <FormItem
                key={option.value}
                orientation="horizontal"
                className="space-x-0 items-center pl-3 border-l-4 border-gray-200">
                <div className="col-span-4 space-y-2">
                  <Input
                    type="text"
                    placeholder="Option label"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[index].label = e.target.value;
                      onChange({ options: newOptions });
                    }}
                  />
                  <Input
                    type="text"
                    value={option.value}
                    placeholder="Option value"
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[index].value = e.target.value;
                      onChange({ options: newOptions });
                    }}
                  />
                </div>
                <div className="col-span-1 shrink-0">
                  <Button
                    className="self-center"
                    variant="ghost"
                    size="xs"
                    color="secondary"
                    onClick={() => {
                      const newOptions = field.options!.filter((_, i) => i !== index);
                      onChange({ options: newOptions });
                    }}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </FormItem>
            ))}
            {field.options?.length > 0 && (
              <Button
                onClick={() => {
                  const newOption = {
                    label: '',
                    value: ''
                  };
                  onChange({
                    options: [...(field.options || []), newOption] as FieldGroupItem[]
                  });
                }}
                size="xs"
                color="secondary"
                variant="ghost">
                <Plus size={15} /> Add option
              </Button>
            )}

            {/* OPTION GROUPS */}
            {field.optionGroups?.map((group, groupIndex) => (
              <div key={group.id}>
                <div className="space-y-2">
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <Label>{group.label || 'Group name'}</Label>
                      <Button
                        variant="ghost"
                        size="xs"
                        color="secondary"
                        onClick={() => {
                          const newGroups = field.optionGroups?.filter((g) => g.id !== group.id);
                          onChange({ optionGroups: newGroups });
                        }}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                    <Input
                      type="text"
                      value={group.label || ''}
                      onChange={(e) => {
                        const newGroups = field.optionGroups?.map((g) =>
                          g.id === group.id ? { ...g, label: e.target.value } : g
                        );
                        onChange({ optionGroups: newGroups });
                      }}
                    />
                  </FormItem>
                  {group.items.map((item) => (
                    <FormItem
                      key={item.id}
                      orientation="horizontal"
                      className="space-x-0 items-center pl-3 border-l-4 border-gray-200">
                      <div className="col-span-4 space-y-2">
                        <Input
                          type="text"
                          placeholder="Option label"
                          value={item.label}
                          onChange={(e) => {
                            const newItems = group.items.map((i) =>
                              i.id === item.id ? { ...i, label: e.target.value } : i
                            );
                            const groups = [...(field.optionGroups || [])];
                            groups[groupIndex].items = newItems;
                            onChange({ optionGroups: groups });
                          }}
                        />
                        <Input
                          type="text"
                          value={item.value}
                          placeholder="Option value"
                          onChange={(e) => {
                            const newItems = group.items.map((i) =>
                              i.id === item.id ? { ...i, value: e.target.value } : i
                            );
                            const groups = [...(field.optionGroups || [])];
                            groups[groupIndex].items = newItems;
                            onChange({ optionGroups: groups });
                          }}
                        />
                      </div>
                      <div className="col-span-1 shrink-0">
                        <Button
                          className="self-center"
                          variant="ghost"
                          size="xs"
                          color="secondary"
                          onClick={() => {
                            const newItems = group.items.filter((i) => i.id !== item.id);
                            const groups = [...(field.optionGroups || [])];
                            groups[groupIndex].items = newItems;
                            onChange({ optionGroups: groups });
                          }}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </FormItem>
                  ))}
                  {group.items.length > 0 && (
                    <Button
                      onClick={() => {
                        const newItem = {
                          id: `item-${Date.now()}`,
                          label: '',
                          value: ''
                        };
                        const newGroups = [...(field.optionGroups || [])];
                        newGroups[groupIndex].items = [
                          ...(newGroups[groupIndex].items || []),
                          newItem
                        ];
                        onChange({ optionGroups: newGroups });
                      }}
                      size="xs"
                      color="secondary"
                      variant="ghost">
                      <Plus size={15} /> Add option
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(field.optionGroups?.length ?? 0) > 0 && (
              <Button
                onClick={() => {
                  const position = (field.optionGroups?.length || 0) + 1;
                  const newGroup = {
                    id: `group-${position}`,
                    label: `Group ${position}`,
                    items: [
                      {
                        id: `item-${Date.now()}`,
                        label: '',
                        value: ''
                      }
                    ]
                  };
                  onChange({
                    optionGroups: [...(field.optionGroups || []), newGroup]
                  });
                }}
                size="xs"
                color="secondary"
                variant="ghost">
                <Plus size={15} /> Add group
              </Button>
            )}
          </>
        );

      case 'checkbox':
      case 'radio':
        return (
          <>
            <FormItem>
              <div className="form-captions">
                <Label>Name</Label>
                <p className="form-description">
                  Used to identify the field in the form data. It should be unique across the form
                </p>
              </div>
              <Input
                type="text"
                value={field.name || ''}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </FormItem>
            <div className="flex justify-between items-center">
              <Label>Checkbox items</Label>
              <Button
                onClick={() => {
                  const newItem: FieldGroupItem = {
                    id: `item-${Date.now()}`,
                    label: `Item ${(field.items?.length || 0) + 1}`,
                    value: `item-${(field.items?.length || 0) + 1}`
                  };
                  onChange({
                    items: [...(field.items || []), newItem]
                  });
                }}
                size="xs"
                color="secondary"
                variant="ghost">
                <Plus size={15} />
              </Button>
            </div>
            {field.items?.map((item, index) => (
              <FormItem
                key={item.value}
                orientation="horizontal"
                className="space-x-0 items-center pl-3 border-l-4 border-gray-200">
                <div className="col-span-4 space-y-2">
                  <Input
                    type="text"
                    placeholder="Item label"
                    value={item.label}
                    onChange={(e) => {
                      const newItems = [...field.items!];
                      newItems[index].label = e.target.value;
                      onChange({ items: newItems });
                    }}
                  />
                  <Input
                    type="text"
                    value={item.value}
                    placeholder="Item value"
                    onChange={(e) => {
                      const newItems = [...field.items!];
                      newItems[index].value = e.target.value;
                      onChange({ items: newItems });
                    }}
                  />
                </div>
                <div className="col-span-1 shrink-0">
                  <Button
                    className="self-center"
                    variant="ghost"
                    size="xs"
                    color="secondary"
                    onClick={() => {
                      const newitems = field.items!.filter((_, i) => i !== index);
                      onChange({ items: newitems });
                    }}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </FormItem>
            ))}
          </>
        );
      case 'date':
        const [dates, setDates] = useState<DateRange | undefined>(
          field.options?.restrictedMonths
            ? {
                from: new Date(field.options.restrictedMonths[0]),
                to: new Date(field.options.restrictedMonths[1])
              }
            : undefined
        );
        return (
          <>
            <FormItem>
              <Label>Empty text</Label>
              <Input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onChange({ placeholder: e.target.value })}
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
                  <SelectItem value="dd/MM/yyyy">dd/MM/yyyy - 31/12/2024</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/dd/yyyy - 12/31/2024</SelectItem>
                  <SelectItem value="yyyy-MM-dd">yyyy-MM-dd - 2024-12-31</SelectItem>
                  <SelectItem value="yyyy/MM/dd">yyyy/MM/dd - 2024/12/31</SelectItem>
                  <SelectItem value="dd MMM yyyy">dd MMM yyyy - 31 Dec 2024</SelectItem>
                  <SelectItem value="MMM dd, yyyy">MMM dd, yyyy - Dec 31, 2024</SelectItem>
                  <SelectItem value="dd MMMM yyyy">dd MMMM yyyy - 31 December 2024</SelectItem>
                  <SelectItem value="MMMM dd, yyyy">MMMM dd, yyyy - December 31, 2024</SelectItem>
                  <SelectItem value="dd-MM-yyyy">dd-MM-yyyy - 31-12-2024</SelectItem>
                  <SelectItem value="MM-dd-yyyy">MM-dd-yyyy - 12-31-2024</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            {/* Add more date-specific options as needed */}
            <FormItem>
              <Label>Mode</Label>
              <Select
                value={field.mode}
                onValueChange={(value) => {
                  if (value === 'range') {
                    onChange({
                      mode: value as DatePickerProps['mode']
                    });
                  } else if (value === 'multiple') {
                    onChange({
                      mode: value as DatePickerProps['mode']
                    });
                  } else {
                    onChange({
                      mode: value as DatePickerProps['mode']
                    });
                  }
                }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="multiple">Multiple</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            {field.mode === 'range' || field.mode === 'multiple' ? (
              <div className="flex space-x-4">
                <FormItem>
                  <Label>Min selected</Label>
                  <Input
                    type="number"
                    value={field.options?.min || ''}
                    onChange={(e) =>
                      onChange({
                        options: {
                          ...field.options,
                          min: parseInt(e.target.value, 10)
                        }
                      })
                    }
                  />
                </FormItem>
                <FormItem>
                  <Label>Max selected</Label>
                  <Input
                    type="number"
                    value={field.options?.max || ''}
                    onChange={(e) =>
                      onChange({
                        options: {
                          ...field.options,
                          max: parseInt(e.target.value, 10)
                        }
                      })
                    }
                  />
                </FormItem>
              </div>
            ) : null}
            <FormItem>
              <div className={`flex items-center justify-between ${!dates ? 'py-1.5' : ''}`}>
                <Label>Restricted months</Label>
                {dates ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-xs text-gray-600"
                    color="secondary"
                    onClick={() => {
                      setDates(undefined);
                      onChange({
                        options: {
                          ...field.options,
                          restrictedMonths: undefined
                        }
                      });
                    }}>
                    Reset
                  </Button>
                ) : null}
              </div>
              <DatePicker
                mode="range"
                selected={dates}
                placeholder="Select months"
                onSelect={(dates) => {
                  setDates(dates as DateRange);
                  onChange({
                    options: {
                      ...field.options,
                      restrictedMonths: [dates?.from?.toString(), dates?.to?.toString()].filter(
                        (date): date is string => Boolean(date)
                      )
                    }
                  });
                }}
              />
              <p className="form-description">
                This will restrict the date picker to only allow selection within this range.
              </p>
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

      // Add more field type cases as needed
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <h6 className="font-semibold uppercase text-xs text-gray-400">Properties</h6>
      {renderTypeSpecificProperties()}
    </div>
  );
};
