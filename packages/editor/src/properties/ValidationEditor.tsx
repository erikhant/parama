import {
  Button,
  FormItem,
  Input,
  Label,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from '@parama-ui/react';
import type { FormField, ValidationRule, FileField, FileOptions } from '@parama-dev/form-builder-types';
import { SectionPanel } from './SectionPanel';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { builtInValidatorTemplate, useFormBuilder } from '@parama-dev/form-builder-core';
import { useEditor } from '../store/useEditor';

type ValidationEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

type SizeUnit = 'B' | 'KB' | 'MB' | 'GB';

const SIZE_UNITS: { label: string; value: SizeUnit; multiplier: number }[] = [
  { label: 'Bytes', value: 'B', multiplier: 1 },
  { label: 'KB', value: 'KB', multiplier: 1024 },
  { label: 'MB', value: 'MB', multiplier: 1024 * 1024 },
  { label: 'GB', value: 'GB', multiplier: 1024 * 1024 * 1024 }
];

interface FileTypeOption {
  value: string;
  label: string;
  extensions?: readonly string[];
}

export default function ValidationEditor({ field, onChange }: ValidationEditorProps) {
  const { editor } = useEditor();
  const { getFieldValue } = useFormBuilder().actions;
  const validations = useMemo(
    () => ('validations' in field ? field.validations : []) || [],
    ['validations' in field ? field.validations : []]
  );
  const builtInTextValidatorTemplate = useMemo(
    () => builtInValidatorTemplate.filter((r) => r.name !== 'passwordStrength'),
    []
  );
  const builtInPasswordValidatorTemplate = useMemo(
    () => builtInValidatorTemplate.filter((r) => r.name === 'passwordStrength')[0],
    []
  );

  const getValidationByType = useCallback(
    (type: ValidationRule['type']) => validations.find((v: ValidationRule) => v.type === type),
    [validations]
  );

  const handleValidationChange = useCallback(
    (rule: ValidationRule) => {
      const idx = validations.findIndex((v: ValidationRule) => v.type === rule.type);
      if (idx !== -1) {
        const updated = [...validations];
        updated[idx] = { ...updated[idx], ...rule };
        onChange({ validations: updated });
      } else {
        if (rule.type === 'required') {
          onChange({ validations: [{ ...rule }, ...validations] });
        } else {
          onChange({ validations: [...validations, { ...rule }] });
        }
      }
    },
    [onChange, validations]
  );

  const removeValidation = useCallback(
    (type: string) => {
      const filtered = validations.filter((v: ValidationRule) => v.type !== type);
      if (filtered.length !== validations.length) {
        onChange({ validations: filtered });
      }
    },
    [onChange, validations]
  );

  const fileField = field as FileField;
  const fileOptions = fileField.options || ({} as FileOptions);

  // Convert bytes to a specific unit
  const convertBytesToSpecificUnit = (bytes: number, unit: SizeUnit): number => {
    const unitConfig = SIZE_UNITS.find((u) => u.value === unit);
    if (!unitConfig) return bytes;
    return Math.round((bytes / unitConfig.multiplier) * 1000) / 1000; // Round to 3 decimal places
  };

  // Convert unit to bytes
  const convertUnitToBytes = (value: number, unit: SizeUnit): number => {
    const unitConfig = SIZE_UNITS.find((u) => u.value === unit);
    return Math.round(value * (unitConfig?.multiplier || 1));
  };

  // Get the best unit for display (auto-select the most appropriate unit)
  const getBestUnit = (bytes: number): SizeUnit => {
    if (bytes >= SIZE_UNITS[3].multiplier) return 'GB';
    if (bytes >= SIZE_UNITS[2].multiplier) return 'MB';
    if (bytes >= SIZE_UNITS[1].multiplier) return 'KB';
    return 'B';
  };

  const currentMaxSize = fileOptions.maxSize || 5 * 1024 * 1024; // Default 5MB

  // Use a preferred unit stored in options, or auto-select the best unit
  const preferredUnit = (fileOptions as any).preferredUnit || getBestUnit(currentMaxSize);
  const displayValue = convertBytesToSpecificUnit(currentMaxSize, preferredUnit);

  const handleFileSizeChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const bytesValue = convertUnitToBytes(numValue, preferredUnit);
      onChange({
        options: {
          ...fileOptions,
          maxSize: bytesValue,
          preferredUnit // Store the user's preferred unit
        } as FileOptions
      });
    }
  };

  const handleUnitChange = (newUnit: SizeUnit) => {
    // When changing units, keep the same byte value but update the preferred unit
    onChange({
      options: {
        ...fileOptions,
        maxSize: currentMaxSize, // Keep the same bytes
        preferredUnit: newUnit // Update preferred unit
      } as FileOptions
    });
  };

  const handleMaxFilesChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      onChange({
        options: {
          ...fileOptions,
          maxFiles: numValue
        }
      });
    }
  };

  const handleMultipleChange = (multiple: boolean) => {
    const updatedOptions = {
      ...fileOptions,
      multiple
    };

    // If multiple is disabled, reset maxFiles to 1
    if (!multiple) {
      updatedOptions.maxFiles = 1;
    }

    onChange({
      options: updatedOptions
    });
  };

  // State to manage selected file types for controlled component behavior
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>(() => {
    if (field.type === 'file' && field.options?.accept) {
      return Object.keys(field.options.accept).flat();
    }
    return [];
  });

  // Sync selected file types when field changes
  useEffect(() => {
    if (field.type === 'file' && field.options?.accept) {
      const currentFileTypes = Object.keys(field.options.accept).flat() as string[];
      setSelectedFileTypes(currentFileTypes);
    } else if (field.type === 'file') {
      setSelectedFileTypes([]);
    }
  }, [field.id, field.type, (field as FileField).options]);

  const fileTypeOptions = useMemo<FileTypeOption[]>(
    () => [
      // Images
      {
        value: 'image/*',
        label: 'All Images',
        extensions: ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif']
      },
      { value: 'image/jpeg', label: 'JPEG Images (.jpg, .jpeg)', extensions: ['.jpeg', '.jpg'] },
      { value: 'image/png', label: 'PNG Images (.png)', extensions: ['.png'] },
      { value: 'image/gif', label: 'GIF Images (.gif)', extensions: ['.gif'] },
      { value: 'image/webp', label: 'WebP Images (.webp)', extensions: ['.webp'] },
      { value: 'image/svg+xml', label: 'SVG Images (.svg)', extensions: ['.svg'] },
      { value: 'image/bmp', label: 'BMP Images (.bmp)', extensions: ['.bmp'] },
      { value: 'image/tiff', label: 'TIFF Images (.tiff, .tif)', extensions: ['.tiff', '.tif'] },

      // Documents
      { value: 'application/pdf', label: 'PDF Documents (.pdf)', extensions: ['.pdf'] },
      { value: 'application/msword', label: 'Word Documents (.doc)', extensions: ['.doc'] },
      {
        value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        label: 'Word Documents (.docx)',
        extensions: ['.docx']
      },
      { value: 'application/vnd.ms-excel', label: 'Excel Spreadsheets (.xls)', extensions: ['.xls'] },
      {
        value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        label: 'Excel Spreadsheets (.xlsx)',
        extensions: ['.xlsx']
      },
      { value: 'application/vnd.ms-powerpoint', label: 'PowerPoint Presentations (.ppt)', extensions: ['.ppt'] },
      {
        value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        label: 'PowerPoint Presentations (.pptx)',
        extensions: ['.pptx']
      },
      { value: 'application/rtf', label: 'Rich Text Format (.rtf)', extensions: ['.rtf'] },
      { value: 'application/vnd.oasis.opendocument.text', label: 'OpenDocument Text (.odt)', extensions: ['.odt'] },
      {
        value: 'application/vnd.oasis.opendocument.spreadsheet',
        label: 'OpenDocument Spreadsheet (.ods)',
        extensions: ['.ods']
      },
      {
        value: 'application/vnd.oasis.opendocument.presentation',
        label: 'OpenDocument Presentation (.odp)',
        extensions: ['.odp']
      },

      // Text
      { value: 'text/plain', label: 'Text Files (.txt)', extensions: ['.txt'] },
      { value: 'text/html', label: 'HTML Files (.html, .htm)', extensions: ['.html', '.htm'] },
      { value: 'text/css', label: 'CSS Files (.css)', extensions: ['.css'] },
      { value: 'text/javascript', label: 'JavaScript Files (.js)', extensions: ['.js'] },
      { value: 'text/csv', label: 'CSV Files (.csv)', extensions: ['.csv'] },
      { value: 'text/xml', label: 'XML Files (.xml)', extensions: ['.xml'] },
      { value: 'application/json', label: 'JSON Files (.json)', extensions: ['.json'] },
      { value: 'application/xml', label: 'XML Documents (.xml)', extensions: ['.xml'] },

      // Audio
      { value: 'audio/*', label: 'All Audio Files', extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'] },
      { value: 'audio/mpeg', label: 'MP3 Audio (.mp3)', extensions: ['.mp3'] },
      { value: 'audio/wav', label: 'WAV Audio (.wav)', extensions: ['.wav'] },
      { value: 'audio/ogg', label: 'OGG Audio (.ogg)', extensions: ['.ogg'] },
      { value: 'audio/mp4', label: 'MP4 Audio (.m4a)', extensions: ['.m4a'] },
      { value: 'audio/aac', label: 'AAC Audio (.aac)', extensions: ['.aac'] },
      { value: 'audio/flac', label: 'FLAC Audio (.flac)', extensions: ['.flac'] },

      // Video
      { value: 'video/*', label: 'All Video Files', extensions: ['.mp4', '.avi', '.mov', '.webm', '.flv', '.3gp'] },
      { value: 'video/mp4', label: 'MP4 Video (.mp4)', extensions: ['.mp4'] },
      { value: 'video/avi', label: 'AVI Video (.avi)', extensions: ['.avi'] },
      { value: 'video/quicktime', label: 'QuickTime Video (.mov)', extensions: ['.mov'] },
      { value: 'video/x-msvideo', label: 'AVI Video (.avi)', extensions: ['.avi'] },
      { value: 'video/webm', label: 'WebM Video (.webm)', extensions: ['.webm'] },
      { value: 'video/x-flv', label: 'Flash Video (.flv)', extensions: ['.flv'] },
      { value: 'video/3gpp', label: '3GP Video (.3gp)', extensions: ['.3gp'] },

      // Archives
      { value: 'application/zip', label: 'ZIP Archives (.zip)', extensions: ['.zip'] },
      { value: 'application/x-rar-compressed', label: 'RAR Archives (.rar)', extensions: ['.rar'] },
      { value: 'application/x-7z-compressed', label: '7-Zip Archives (.7z)', extensions: ['.7z'] },
      { value: 'application/x-tar', label: 'TAR Archives (.tar)', extensions: ['.tar'] },
      { value: 'application/gzip', label: 'GZIP Archives (.gz)', extensions: ['.gz'] },

      // Programming Files
      { value: 'application/x-python', label: 'Python Files (.py)', extensions: ['.py'] },
      { value: 'application/x-java-source', label: 'Java Files (.java)', extensions: ['.java'] },
      { value: 'application/x-csharp', label: 'C# Files (.cs)', extensions: ['.cs'] },
      { value: 'text/x-c', label: 'C Files (.c)', extensions: ['.c'] },
      { value: 'text/x-c++', label: 'C++ Files (.cpp, .cxx)', extensions: ['.cpp', '.cxx'] },
      { value: 'application/typescript', label: 'TypeScript Files (.ts)', extensions: ['.ts'] },

      // Other
      { value: 'font/woff', label: 'WOFF Fonts (.woff)', extensions: ['.woff'] },
      { value: 'font/woff2', label: 'WOFF2 Fonts (.woff2)', extensions: ['.woff2'] },
      { value: 'font/ttf', label: 'TrueType Fonts (.ttf)', extensions: ['.ttf'] },
      { value: 'font/otf', label: 'OpenType Fonts (.otf)', extensions: ['.otf'] },
      { value: 'application/x-shockwave-flash', label: 'Flash Files (.swf)', extensions: ['.swf'] }
    ],
    []
  );

  const renderRequiredValidation = useMemo(
    () => (
      <FormItem orientation="horizontal">
        <Label className="!tw-col-span-4">Required field</Label>
        <Switch
          className="!tw-col-span-1"
          checked={!!getValidationByType('required')}
          disabled={editor.options?.validationSettings === 'readonly'}
          onCheckedChange={(checked) => {
            if (checked) {
              handleValidationChange({
                trigger: 'change',
                type: 'required',
                message: 'This field is required'
              });
            } else {
              removeValidation('required');
            }
          }}
        />
      </FormItem>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );
  const renderPasswordValidation = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-4">Enable strength password</Label>
          <Switch
            className="!tw-col-span-1"
            checked={!!getValidationByType('pattern')}
            disabled={editor.options?.validationSettings === 'readonly'}
            onCheckedChange={(checked) => {
              if (checked) {
                handleValidationChange({
                  ...builtInPasswordValidatorTemplate,
                  value: getFieldValue(field.id)
                });
              } else {
                removeValidation('pattern');
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation, validations]
  );

  const renderTextValidatorTemplate = useMemo(
    () => (
      <FormItem className="tw-py-2">
        <div className="tw-flex tw-items-center tw-justify-between tw-h-7">
          <Label>Validation template</Label>
          {getValidationByType('pattern') && (
            <Button
              color="secondary"
              variant="ghost"
              size="xs"
              className="tw-text-xs tw-text-gray-500"
              disabled={editor.options?.validationSettings === 'readonly'}
              onClick={() => removeValidation('pattern')}>
              Remove
            </Button>
          )}
        </div>
        <Select
          value={getValidationByType('pattern')?.name || ''}
          disabled={editor.options?.validationSettings === 'readonly'}
          onValueChange={(value) => {
            const rule = builtInTextValidatorTemplate.find((rule) => rule.name === value);
            if (!rule) return;
            handleValidationChange({ ...rule, value: getFieldValue(field.id) });
          }}>
          <SelectTrigger className="tw-whitespace-nowrap tw-capitalize">
            <SelectValue placeholder="No selected" />
          </SelectTrigger>
          <SelectContent>
            {builtInTextValidatorTemplate.map((option) => (
              <SelectItem key={option.name} value={option.name as string} className="tw-capitalize">
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="form-description">Choose validation template </p>
      </FormItem>
    ),
    [getValidationByType, handleValidationChange, removeValidation, validations]
  );

  const renderTextValidations = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        {renderTextValidatorTemplate}
        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-3">Min length</Label>
          <Input
            type="number"
            min={0}
            title="Minimum character length"
            value={getValidationByType('minLength')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Minimum character length"
            className="!tw-col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('minLength');
                return;
              }
              const minLength = Number(val);
              if (!isNaN(minLength) && minLength >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'minLength',
                  value: minLength,
                  message: `Minimum length is ${minLength}`
                });
              }
            }}
          />
        </FormItem>
        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-3">Max length</Label>
          <Input
            type="number"
            min={0}
            title="Maximum character length"
            value={getValidationByType('maxLength')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Maximum character length"
            className="!tw-col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('maxLength');
                return;
              }
              const maxLength = Number(val);
              if (!isNaN(maxLength) && maxLength >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'maxLength',
                  value: maxLength,
                  message: `Maximum length is ${maxLength}`
                });
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );

  const renderTextareaValidations = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-3">Max length</Label>
          <Input
            type="number"
            min={0}
            title="Maximum character length"
            value={getValidationByType('maxLength')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Maximum character length"
            className="!tw-col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('maxLength');
                return;
              }
              const maxLength = Number(val);
              if (!isNaN(maxLength) && maxLength >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'maxLength',
                  value: maxLength,
                  message: `Maximum length is ${maxLength}`
                });
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );

  const renderNumberValidations = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-3">Min</Label>
          <Input
            type="number"
            min={0}
            title="Minimum value"
            value={getValidationByType('min')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Minimum value"
            className="!tw-col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('min');
                return;
              }
              const min = Number(val);
              if (!isNaN(min) && min >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'min',
                  value: min,
                  message: `Minimum value is ${min}`
                });
              }
            }}
          />
        </FormItem>
        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-3">Max</Label>
          <Input
            type="number"
            min={0}
            title="Maximum value"
            value={getValidationByType('max')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Maximum value"
            className="!tw-col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('max');
                return;
              }
              const max = Number(val);
              if (!isNaN(max) && max >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'max',
                  value: max,
                  message: `Maximum value is ${max}`
                });
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );

  const renderFileValidation = useMemo(() => {
    return (
      <SectionPanel title="Validation">
        <FormItem>
          <Label>Accepted file types</Label>
          <MultiSelect
            options={fileTypeOptions}
            defaultValue={selectedFileTypes}
            disabled={editor.options?.propertiesSettings === 'readonly'}
            placeholder="Select file types..."
            onValueChange={(values: string[]) => {
              setSelectedFileTypes(values);
              const acceptObject: { [key: string]: readonly string[] } = {};

              values.forEach((mimeType: string) => {
                const fileTypeOption = fileTypeOptions.find((option) => option.value === mimeType);
                if (fileTypeOption && fileTypeOption.extensions) {
                  acceptObject[mimeType] = fileTypeOption.extensions;
                }
              });

              onChange({
                options: {
                  ...(field as FileField).options,
                  accept: acceptObject
                }
              });
            }}
          />
          <p className="form-description">Leave empty to allow all file types.</p>
        </FormItem>

        <FormItem orientation="horizontal">
          <div className="tw-col-span-4 tw-space-y-1">
            <Label htmlFor="multiple-files">Multiple files</Label>
            <p className="form-description">Upload multiple files at once</p>
          </div>
          <div className="tw-flex tw-items-center tw-justify-end">
            <Switch
              id="multiple-files"
              disabled={editor.options?.validationSettings === 'readonly'}
              checked={fileOptions.multiple || false}
              onCheckedChange={handleMultipleChange}
            />
          </div>
        </FormItem>

        <FormItem orientation="horizontal">
          <Label className="!tw-col-span-3">Max files</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={fileOptions.maxFiles?.toString() || '5'}
            disabled={editor.options?.validationSettings === 'readonly' || !fileOptions.multiple}
            placeholder="Max files"
            className="!tw-col-span-2"
            onChange={(e) => handleMaxFilesChange(e.target.value)}
          />
        </FormItem>

        <FormItem>
          <Label>Maximum File Size</Label>
          <div className="tw-grid tw-grid-cols-5 tw-gap-2">
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={displayValue.toString()}
              disabled={editor.options?.validationSettings === 'readonly'}
              placeholder="Size"
              className="tw-col-span-3"
              onChange={(e) => handleFileSizeChange(e.target.value)}
            />
            <Select
              value={preferredUnit}
              disabled={editor.options?.validationSettings === 'readonly'}
              onValueChange={handleUnitChange}>
              <SelectTrigger className="tw-col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="form-description">Current limit: {(currentMaxSize / 1024 / 1024).toFixed(2)} MB</p>
        </FormItem>
      </SectionPanel>
    );
  }, [field, onChange, editor.options?.validationSettings, renderRequiredValidation]);

  switch (field.type) {
    case 'text':
    case 'email':
      return renderTextValidations;
    case 'textarea':
      return renderTextareaValidations;
    case 'number':
      return renderNumberValidations;
    case 'password':
      return renderPasswordValidation;
    case 'file':
      return renderFileValidation;
    default:
      return null;
  }
}
