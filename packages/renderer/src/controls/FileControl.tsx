import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FileField } from '@parama-dev/form-builder-types';
import { cn, FileUpload } from '@parama-ui/react';
import { memo, useCallback } from 'react';
import { useFormActions } from '../hooks/useFieldFlags';
import type { ControlProps } from './types';

/**
 * File upload input.
 *
 * Two collections feed it: files already on the server (`existingFiles`,
 * rendered as removable chips) and files the user just picked. Selecting files
 * clears any prior upload error so a retry starts from a clean slate.
 */
export const FileControl = memo<ControlProps<FileField>>(({ field, onChange, isDisabled, isRequired, validation }) => {
  const actions = useFormActions();

  // Subscribed rather than read once, so the chips update when the store's
  // file metadata changes.
  const existingFiles = useFormBuilder((state) => state.existingFiles[field.name || field.id]);

  const handleFilesChange = useCallback(
    (files: File[]) => {
      actions.clearFieldError(field.id);
      onChange(files);
    },
    [actions, field.id, onChange]
  );

  const handleExistingRemove = useCallback(
    (index: number) => actions.removeExistingFileMeta(field.id, index),
    [actions, field.id]
  );

  const handleError = useCallback(
    (error: unknown) => {
      actions.setFieldError(field.id, (error as Error)?.message || 'File upload failed');
    },
    [actions, field.id]
  );

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
      onFilesChange={handleFilesChange}
      initialFiles={existingFiles ?? []}
      onExistingFileRemove={handleExistingRemove}
      onError={handleError}
      className={cn(!validation.isValid || field.error ? 'border-red-500 bg-red-50' : '')}
    />
  );
});

FileControl.displayName = 'FileControl';
