import type { FileField, FileOptions, FormField } from '@parama-dev/form-builder-types';
import {
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
import { memo, useCallback } from 'react';
import { SectionPanel } from '../../SectionPanel';
import { bestUnitFor, SIZE_UNITS, toBytes, toDisplayValue, type SizeUnit } from '../fileSize';
import { buildAcceptMap, FILE_TYPE_OPTIONS, selectedMimeTypes } from '../fileTypes';
import { RequiredRuleRow } from '../rows/RequiredRuleRow';
import type { ValidationRulesApi } from '../useValidationRules';

/** Upload cap applied when the schema does not set one. */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

const BYTES_PER_MB = 1024 * 1024;

interface FileValidationProps {
  field: FileField;
  rules: ValidationRulesApi;
  onChange: (updates: Partial<FormField>) => void;
}

/**
 * Validation panel for file fields.
 *
 * Unlike other field types, most of a file field's constraints live on
 * `options` rather than in the rule list — the file input needs them to filter
 * the picker before a file is ever chosen. Only `required` is a rule here.
 */
export const FileValidation = memo<FileValidationProps>(({ field, rules, onChange }) => {
  const options = field.options ?? ({} as FileOptions);

  const patchOptions = useCallback(
    (patch: Partial<FileOptions>) => onChange({ options: { ...options, ...patch } as FileOptions }),
    [options, onChange]
  );

  const currentMaxSize = options.maxSize || DEFAULT_MAX_SIZE;

  // The author's chosen unit is stored beside the byte value so reopening the
  // panel shows what they typed, not an auto-picked equivalent.
  const preferredUnit = (options.preferredUnit as SizeUnit) || bestUnitFor(currentMaxSize);

  const handleAcceptChange = useCallback(
    (mimeTypes: string[]) => patchOptions({ accept: buildAcceptMap(mimeTypes) }),
    [patchOptions]
  );

  const handleMultipleChange = useCallback(
    (multiple: boolean) => {
      // A single-file field can only ever hold one, so the cap follows the switch.
      patchOptions(multiple ? { multiple } : { multiple, maxFiles: 1 });
    },
    [patchOptions]
  );

  const handleMaxFilesChange = useCallback(
    (raw: string) => {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) patchOptions({ maxFiles: parsed });
    },
    [patchOptions]
  );

  const handleSizeChange = useCallback(
    (raw: string) => {
      const parsed = parseFloat(raw);
      if (isNaN(parsed) || parsed <= 0) return;

      patchOptions({ maxSize: toBytes(parsed, preferredUnit), preferredUnit });
    },
    [patchOptions, preferredUnit]
  );

  const handleUnitChange = useCallback(
    (unit: string) => {
      // Changing the unit re-labels the same byte value rather than rescaling it.
      patchOptions({ maxSize: currentMaxSize, preferredUnit: unit as SizeUnit });
    },
    [patchOptions, currentMaxSize]
  );

  return (
    <SectionPanel title="Validation">
      <RequiredRuleRow rules={rules} />

      <FormItem>
        <Label>Accepted file types</Label>
        <MultiSelect
          options={FILE_TYPE_OPTIONS}
          defaultValue={selectedMimeTypes(options.accept)}
          disabled={rules.isReadOnly}
          placeholder="Select file types..."
          onValueChange={handleAcceptChange}
        />
        <p className="form-description">Leave empty to allow all file types.</p>
      </FormItem>

      <FormItem orientation="horizontal">
        <div className="col-span-4 space-y-1">
          <Label htmlFor="multiple-files">Multiple files</Label>
          <p className="form-description">Upload multiple files at once</p>
        </div>
        <div className="flex items-center justify-end">
          <Switch
            id="multiple-files"
            disabled={rules.isReadOnly}
            checked={options.multiple || false}
            onCheckedChange={handleMultipleChange}
          />
        </div>
      </FormItem>

      <FormItem orientation="horizontal">
        <Label className="!col-span-3">Max files</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={options.maxFiles?.toString() || '5'}
          disabled={rules.isReadOnly || !options.multiple}
          placeholder="Max files"
          className="!col-span-2"
          onChange={(event) => handleMaxFilesChange(event.target.value)}
        />
      </FormItem>

      <FormItem>
        <Label>Maximum File Size</Label>
        <div className="grid grid-cols-5 gap-2">
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={toDisplayValue(currentMaxSize, preferredUnit).toString()}
            disabled={rules.isReadOnly}
            placeholder="Size"
            className="col-span-3"
            onChange={(event) => handleSizeChange(event.target.value)}
          />
          <Select value={preferredUnit} disabled={rules.isReadOnly} onValueChange={handleUnitChange}>
            <SelectTrigger className="col-span-2">
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
        <p className="form-description">Current limit: {(currentMaxSize / BYTES_PER_MB).toFixed(2)} MB</p>
      </FormItem>
    </SectionPanel>
  );
});

FileValidation.displayName = 'FileValidation';
