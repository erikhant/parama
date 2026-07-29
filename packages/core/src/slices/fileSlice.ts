import type { FileField, FormField } from '@parama-dev/form-builder-types';
import { logger } from '../logger';
import { readFiles } from '../services/fileData';
import type { FormBuilderActions, SliceContext } from '../state/types';

type FileActions = Pick<
  FormBuilderActions,
  'getFieldFiles' | 'getExistingFiles' | 'addFileField' | 'removeFileField' | 'removeExistingFileMeta'
>;

function isFileField(field: FormField | undefined): field is FileField {
  return field?.type === 'file';
}

/** The `fileData` / `existingFiles` key for a file field. */
function storageKey(field: FileField): string {
  return field.name || field.id;
}

/**
 * File field state.
 *
 * Two collections back a file field: `fileData` holds newly selected `File`
 * objects awaiting upload, and `existingFiles` holds metadata for files the
 * server already has. Validation counts both; submission only sends the former.
 */
export function createFileSlice({ set, get }: SliceContext): FileActions {
  /** Resolves a field id to a file field, or `undefined` if it is not one. */
  const fileFieldById = (fieldId: string): FileField | undefined => {
    const field = get().actions.getField(fieldId);
    return isFileField(field) ? field : undefined;
  };

  return {
    /** Newly selected files for a field. Empty for non-file fields. */
    getFieldFiles: (fieldId) => {
      const field = fileFieldById(fieldId);
      return field ? readFiles(get().fileData, storageKey(field)) : [];
    },

    /** Metadata for already-uploaded files. Empty for non-file fields. */
    getExistingFiles: (fieldId) => {
      const field = fileFieldById(fieldId);
      return field ? (get().existingFiles[storageKey(field)] ?? []) : [];
    },

    /**
     * Adds one file, honouring the field's `multiple` and `maxFiles` options.
     * @returns `false` when the field is not a file field or the cap is hit.
     */
    addFileField: (fieldId, file) => {
      const field = fileFieldById(fieldId);
      if (!field) return false;

      const currentFiles = get().actions.getFieldFiles(fieldId);
      const isMultiple = field.options?.multiple ?? false;

      if (!isMultiple) {
        // Single-file fields replace rather than accumulate.
        get().actions.updateFieldValue(fieldId, [file]);
        return true;
      }

      const nextFiles = [...currentFiles, file];
      const maxFiles = field.options?.maxFiles;

      if (maxFiles && nextFiles.length > maxFiles) {
        logger.warn(`Maximum files limit (${maxFiles}) exceeded for field ${fieldId}`);
        return false;
      }

      get().actions.updateFieldValue(fieldId, nextFiles);
      return true;
    },

    /**
     * Removes a newly selected file by index.
     * @returns `false` when the field is not a file field or the index is out of range.
     */
    removeFileField: (fieldId, fileIndex) => {
      const field = fileFieldById(fieldId);
      if (!field) return false;

      const currentFiles = get().actions.getFieldFiles(fieldId);
      if (fileIndex < 0 || fileIndex >= currentFiles.length) {
        logger.warn(`Invalid file index ${fileIndex} for field ${fieldId}`);
        return false;
      }

      get().actions.updateFieldValue(
        fieldId,
        currentFiles.filter((_, index) => index !== fileIndex)
      );
      return true;
    },

    /**
     * Drops one already-uploaded file's metadata by index.
     * @returns `false` when the field is not a file field or the index is out of range.
     */
    removeExistingFileMeta: (fieldId, fileIndex) => {
      const field = fileFieldById(fieldId);
      if (!field) return false;

      const key = storageKey(field);
      const current = get().existingFiles[key] ?? [];
      if (fileIndex < 0 || fileIndex >= current.length) return false;

      set((state) => ({
        existingFiles: {
          ...state.existingFiles,
          [key]: current.filter((_, index) => index !== fileIndex)
        }
      }));
      return true;
    }
  };
}
