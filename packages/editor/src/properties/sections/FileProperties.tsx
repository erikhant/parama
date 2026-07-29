import type { FileField, FormField } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label, Switch } from '@parama-ui/react';
import { memo, useCallback } from 'react';
import { NameField } from '../common/NameField';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { SectionPanel } from '../SectionPanel';
import type { SectionProps } from './types';

/** The upload-behaviour switches, which differ only in label and option key. */
const UPLOAD_TOGGLES = [
  {
    key: 'instantUpload' as const,
    id: 'instant-upload',
    label: 'Instant upload',
    description: 'Upload file instantly after selection or dropped'
  },
  {
    key: 'bulkUpload' as const,
    id: 'bulk-upload',
    label: 'Bulk upload',
    description: 'Upload files in bulk mode'
  }
];

/** Properties panel for file upload fields. */
export const FileProperties = memo<SectionProps<FileField>>(({ field, onChange }) => {
  const { isReadOnly } = useFieldSettings();

  const patchOptions = useCallback(
    (patch: Partial<FileField['options']>) =>
      onChange({ options: { ...field.options, ...patch } } as Partial<FormField>),
    [field.options, onChange]
  );

  return (
    <SectionPanel title="Properties">
      <NameField value={field.name || ''} onChange={(name) => onChange({ name } as Partial<FormField>)} />

      <FormItem>
        <Label>Server URL</Label>
        <Input
          type="text"
          disabled={isReadOnly}
          value={field.options?.server || ''}
          placeholder="https://api.example.com/upload"
          onChange={(event) => patchOptions({ server: event.target.value })}
        />
        <p className="form-description">Where files will be uploaded</p>
      </FormItem>

      {UPLOAD_TOGGLES.map((toggle) => (
        <FormItem key={toggle.key} orientation="horizontal">
          <div className="col-span-4 space-y-1">
            <Label htmlFor={toggle.id}>{toggle.label}</Label>
            <p className="form-description">{toggle.description}</p>
          </div>
          <div className="col-span-1 flex items-center justify-end">
            <Switch
              id={toggle.id}
              disabled={isReadOnly}
              checked={field.options?.[toggle.key] || false}
              onCheckedChange={(checked) => patchOptions({ [toggle.key]: checked })}
            />
          </div>
        </FormItem>
      ))}
    </SectionPanel>
  );
});

FileProperties.displayName = 'FileProperties';
