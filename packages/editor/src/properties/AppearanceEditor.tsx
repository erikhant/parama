import type { FormField } from '@form-builder/types';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormItem,
  Input,
  Label,
  Switch
} from '@parama-ui/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { IconPicker } from './IconPicker';
import { ManageOptions } from './select/ManageOptions';

type AppearanceEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export const AppearanceEditor = ({ field, onChange }: AppearanceEditorProps) => {
  const renderAppearanceOptions = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
        return (
          <>
            <FormItem orientation="horizontal">
              {/* PREFIX PROPERTIES */}
              <div className="form-captions !col-span-4">
                <Label>Prefix</Label>
                <p className="form-description">Add text or icon on the left side</p>
              </div>
              <div className="flex justify-end col-span-1">
                {field.appearance?.prefix ? (
                  <Button
                    variant="ghost"
                    color="secondary"
                    size="xs"
                    className="text-xs text-gray-500"
                    onClick={() =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          prefix: undefined
                        }
                      })
                    }>
                    Remove
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" color="secondary" size="xs">
                        <PlusIcon size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32" align="end">
                      <DropdownMenuItem
                        onSelect={() =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              prefix: { type: 'text', content: '' }
                            }
                          })
                        }>
                        Text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              prefix: { type: 'icon', content: '' }
                            }
                          })
                        }>
                        Icon
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {field.appearance?.prefix &&
                (field.appearance?.prefix.type === 'icon' ? (
                  <IconPicker
                    className={`${field.appearance.prefix.content !== '' ? 'col-span-1' : 'col-span-2 justify-start'}`}
                    value={field.appearance.prefix.content}
                    onChange={(value) =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          prefix: { type: 'icon', content: value }
                        }
                      })
                    }
                  />
                ) : (
                  <Input
                    type="text"
                    value={field.appearance?.prefix?.content || ''}
                    className="!col-span-5"
                    onChange={(e) =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          prefix: { type: 'text', content: e.target.value }
                        }
                      })
                    }
                  />
                ))}
            </FormItem>

            {/* SUFFIX PROPERTIES */}
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label>Suffix</Label>
                <p className="form-description">Add text or icon on the right side</p>
              </div>
              <div className="flex justify-end col-span-1">
                {field.appearance?.suffix ? (
                  <Button
                    variant="ghost"
                    color="secondary"
                    size="xs"
                    className="text-xs text-gray-500"
                    onClick={() =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          suffix: undefined
                        }
                      })
                    }>
                    Remove
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" color="secondary" size="xs">
                        <PlusIcon size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32" align="end">
                      <DropdownMenuItem
                        onSelect={() =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              suffix: { type: 'text', content: '' }
                            }
                          })
                        }>
                        Text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              suffix: { type: 'icon', content: '' }
                            }
                          })
                        }>
                        Icon
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {field.appearance?.suffix &&
                (field.appearance?.suffix.type === 'icon' ? (
                  <IconPicker
                    className={`${field.appearance.suffix.content !== '' ? 'col-span-1' : 'col-span-2 justify-start'}`}
                    value={field.appearance.suffix.content}
                    onChange={(value) =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          suffix: { type: 'icon', content: value }
                        }
                      })
                    }
                  />
                ) : (
                  <Input
                    type="text"
                    value={field.appearance?.suffix?.content || ''}
                    className="!col-span-5"
                    onChange={(e) =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          suffix: { type: 'text', content: e.target.value }
                        }
                      })
                    }
                  />
                ))}
            </FormItem>

            {/* ADD-ON START PROPERTIES */}
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label>Add-on start</Label>
                <p className="form-description">Prepend an element before input</p>
              </div>

              <div className="flex justify-end col-span-1">
                {field.appearance?.addOnStart ? (
                  <Button
                    variant="ghost"
                    color="secondary"
                    size="xs"
                    className="text-xs text-gray-500"
                    onClick={() =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          addOnStart: undefined
                        }
                      })
                    }>
                    Remove
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" color="secondary" size="xs">
                        <PlusIcon size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32" align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnStart: {
                                type: 'button',
                                label: 'Button'
                              }
                            }
                          });
                        }}>
                        Button
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnStart: {
                                type: 'select',
                                label: 'Select'
                              }
                            }
                          });
                        }}>
                        Select
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {field.appearance?.addOnStart && (
                <div className="col-span-5 flex items-center justify-between gap-2">
                  {field.appearance.addOnStart.type === 'button' && (
                    <>
                      <Button variant="outline" color="secondary">
                        {field.appearance.addOnStart.label}
                      </Button>
                      <Input
                        type="text"
                        value={field.appearance.addOnStart.label || ''}
                        placeholder="Label"
                        onChange={(e) =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnStart: {
                                ...field.appearance?.addOnStart,
                                label: e.target.value || 'Button'
                              }
                            }
                          })
                        }
                      />
                    </>
                  )}
                  {field.appearance.addOnStart.type === 'select' && (
                    <>
                      <Button variant="outline" color="secondary">
                        {field.appearance.addOnStart.label}
                        {field.appearance.addOnStart.options?.length ? (
                          <Badge>{field.appearance.addOnStart.options.length}</Badge>
                        ) : (
                          ''
                        )}
                      </Button>
                      <ManageOptions
                        values={field.appearance.addOnStart.options}
                        onChange={(values) =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnStart: {
                                ...field.appearance?.addOnStart,
                                options: values
                              }
                            }
                          })
                        }>
                        <Button variant="ghost" color="secondary" className="text-xs" size="xs">
                          <PlusIcon size={16} />
                          Manage option
                        </Button>
                      </ManageOptions>
                    </>
                  )}
                </div>
              )}
            </FormItem>

            {/* ADD-ON END PROPERTIES */}
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label>Add-on end</Label>
                <p className="form-description">Append an element after input</p>
              </div>

              <div className="flex justify-end col-span-1">
                {field.appearance?.addOnEnd ? (
                  <Button
                    variant="ghost"
                    color="secondary"
                    size="xs"
                    className="text-xs text-gray-500"
                    onClick={() =>
                      onChange({
                        appearance: {
                          ...field.appearance,
                          addOnEnd: undefined
                        }
                      })
                    }>
                    Remove
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" color="secondary" size="xs">
                        <PlusIcon size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32" align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnEnd: {
                                type: 'button',
                                label: 'Button'
                              }
                            }
                          });
                        }}>
                        Button
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnEnd: {
                                type: 'select',
                                label: 'Select'
                              }
                            }
                          });
                        }}>
                        Select
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {field.appearance?.addOnEnd && (
                <div className="col-span-5 flex items-center justify-between gap-2">
                  {field.appearance.addOnEnd.type === 'button' && (
                    <>
                      <Button variant="outline" color="secondary" className="max-w-20 truncate">
                        {field.appearance.addOnEnd.label}
                      </Button>
                      <Input
                        type="text"
                        placeholder="Label"
                        onChange={(e) =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnEnd: {
                                ...field.appearance?.addOnEnd,
                                label: e.target.value
                              }
                            }
                          })
                        }
                      />
                    </>
                  )}
                  {field.appearance.addOnEnd.type === 'select' && (
                    <>
                      <Button variant="outline" color="secondary">
                        {field.appearance.addOnEnd.label}
                        {field.appearance.addOnEnd.options?.length ? (
                          <Badge>{field.appearance.addOnEnd.options.length}</Badge>
                        ) : (
                          ''
                        )}
                      </Button>
                      <ManageOptions
                        values={field.appearance.addOnEnd.options}
                        onChange={(values) =>
                          onChange({
                            appearance: {
                              ...field.appearance,
                              addOnEnd: {
                                ...field.appearance?.addOnEnd,
                                options: values
                              }
                            }
                          })
                        }>
                        <Button variant="ghost" color="secondary" className="text-xs" size="xs">
                          <PlusIcon size={16} />
                          Manage option
                        </Button>
                      </ManageOptions>
                    </>
                  )}
                </div>
              )}
            </FormItem>
          </>
        );
      case 'date':
        const [enableSelectionMonth, setEnableSelectionMonth] = useState(
          field.options?.dropdownType !== undefined &&
            field.options?.dropdownType !== 'dropdown-years'
        );
        const [enableSelectionYear, setEnableSelectionYear] = useState(
          field.options?.dropdownType !== undefined &&
            field.options?.dropdownType !== 'dropdown-months'
        );

        return (
          <>
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label htmlFor="enable-selection-month">Selection month</Label>
                <p className="form-description">Enable month selection</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <Switch
                  id="enable-selection-month"
                  checked={
                    field.options?.dropdownType !== undefined &&
                    field.options?.dropdownType !== 'dropdown-years'
                  }
                  onCheckedChange={(checked) => {
                    setEnableSelectionMonth(checked);
                    onChange({
                      options: {
                        ...field.options,
                        dropdownType:
                          enableSelectionYear && checked
                            ? 'dropdown'
                            : checked
                              ? 'dropdown-months'
                              : enableSelectionYear
                                ? 'dropdown-years'
                                : undefined
                      }
                    });
                  }}
                />
              </div>
            </FormItem>
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-4">
                <Label htmlFor="enable-selection-year">Selection year</Label>
                <p className="form-description">Enable year selection</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <Switch
                  id="enable-selection-year"
                  checked={
                    field.options?.dropdownType !== undefined &&
                    field.options?.dropdownType !== 'dropdown-months'
                  }
                  onCheckedChange={(checked) => {
                    setEnableSelectionYear(checked);
                    onChange({
                      options: {
                        ...field.options,
                        dropdownType:
                          enableSelectionMonth && checked
                            ? 'dropdown'
                            : checked
                              ? 'dropdown-years'
                              : enableSelectionMonth
                                ? 'dropdown-months'
                                : undefined
                      }
                    });
                  }}
                />
              </div>
            </FormItem>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <h6 className="font-semibold uppercase text-xs text-gray-400">Appearance</h6>
      {renderAppearanceOptions()}
    </div>
  );
};
