import {
  CheckCircle2Icon,
  CloudUploadIcon,
  FileIcon,
  Loader2Icon,
  RotateCw,
  UploadCloudIcon,
  XIcon
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuid } from 'uuid';
import { Button } from '@/components/ui/button';
import { cn, getAssetByType } from '@/lib/utils';

interface FileDescriptor {
  id?: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

interface FileOptions {
  accept: {
    [key: string]: readonly string[];
  };
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  server?: string;
  instantUpload?: boolean;
  bulkUpload?: boolean;
  preferredUnit?: string; // e.g., 'MB', 'KB'
}

type FilePreview = File & {
  preview: string;
  uploaded: boolean;
  uploading?: boolean;
  hasError?: boolean;
  id: string;
};

interface FileUploadProps extends FileOptions {
  name?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  storeAsForm?: boolean;
  formExtension?: Record<string, unknown>;
  onFilesChange?: (files: File[]) => void;
  onFileUploaded?: <T>(response: T) => void;
  onFileRemove?: (id: string, index: number) => void;
  onError?: (error: unknown) => void;
  /** Pre-existing files to display (already uploaded and referenced by URL) */
  initialFiles?: FileDescriptor[];
  /** Callback when an initial file (from initialFiles) is removed */
  onExistingFileRemove?: (index: number) => void;
}

export function FileUpload({
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt']
  },
  instantUpload = false,
  server = '',
  storeAsForm = !server ? true : false,
  name,
  required,
  disabled,
  className,
  bulkUpload,
  formExtension,
  onFilesChange,
  onFileUploaded,
  onFileRemove,
  onError,
  initialFiles,
  onExistingFileRemove
}: FileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const prevFilesRef = useRef<FilePreview[]>([]);
  const [existing, setExisting] = useState<FileDescriptor[]>([]);

  // Sync initial files from props
  useEffect(() => {
    setExisting(initialFiles ?? []);
  }, [initialFiles]);

  // Clean up object URLs for images only
  useEffect(() => {
    const prevFiles = prevFilesRef.current;
    prevFiles.forEach((file) => {
      if (file.type && file.type.startsWith('image/')) {
        URL.revokeObjectURL(file.preview);
      }
    });
    prevFilesRef.current = files;
  }, [files]);

  // Memoize total size
  const totalSize = useMemo(() => files.reduce((acc, file) => acc + file.size, 0), [files]);

  // Memoize accepted extensions
  const acceptedExt = useMemo(() => Object.values(accept).flat().join(', '), [accept]);

  // Upload handler
  const handleUpload = useCallback(
    async (file?: FilePreview) => {
      if (!server) {
        onError?.(new Error('Server URL is required for file upload'));
        return;
      }

      const formData = new FormData();
      if (formExtension) {
        Object.entries(formExtension).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      if (file) {
        formData.append(name ?? 'file', file);
        setFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? Object.assign(f, { uploading: true }) : f)));
      } else {
        files
          .filter((f) => !f.uploaded)
          .forEach((f) => {
            formData.append(name ?? 'files', f);
          });
        setFiles((prevFiles) => prevFiles.map((f) => (!f.uploaded ? Object.assign(f, { uploading: true }) : f)));
      }

      try {
        console.log('Processing files upload');
        const response = await fetch(server, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          onError?.(new Error(errorText || 'File upload failed'));
        }

        if (file) {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id ? Object.assign(f, { uploaded: true, uploading: false, hasError: false }) : f
            )
          );
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              !f.uploaded ? Object.assign(f, { uploaded: true, uploading: false, hasError: false }) : f
            )
          );
        }

        const responseData = await response.json();
        onFileUploaded?.(responseData);
      } catch (error) {
        onError?.(error);
        if (file) {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id ? Object.assign(f, { uploaded: false, uploading: false, hasError: true }) : f
            )
          );
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              !f.uploaded ? Object.assign(f, { uploaded: false, uploading: false, hasError: true }) : f
            )
          );
        }
      }
    },
    [server, files, name, formExtension, onFileUploaded, onError]
  );

  // Memoize drop handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);

      const filesWithPreview: FilePreview[] = acceptedFiles.map((file) =>
        Object.assign(file, {
          uploaded: false,
          uploading: instantUpload,
          hasError: false,
          preview: file.type && file.type.startsWith('image/') ? URL.createObjectURL(file) : getAssetByType(file.type),
          id: uuid()
        })
      );

      let updatedFiles: FilePreview[];
      if (multiple) {
        updatedFiles = [...files, ...filesWithPreview].slice(0, maxFiles);
      } else {
        updatedFiles = filesWithPreview[0] ? [filesWithPreview[0]] : [];
      }

      if (onFilesChange) onFilesChange(updatedFiles);
      setFiles(updatedFiles);

      if (instantUpload) {
        Promise.all(filesWithPreview.map((file) => handleUpload(file)));
      }
    },
    [instantUpload, multiple, maxFiles, onFilesChange, files, handleUpload]
  );

  // Dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropRejected: (rejectedFiles) => {
      if (onError) {
        const errorMessages = rejectedFiles.map((file) => file.errors.map((e) => e.message)).flat();
        const removedDuplicateMessages = Array.from(new Set(errorMessages));
        onError(new Error(removedDuplicateMessages.join(', ')));
      }
    },
    accept,
    multiple,
    maxFiles,
    maxSize,
    disabled,
    noClick: files.length === maxFiles
  });

  // Remove file handler
  const removeFile = useCallback(
    (id: string, index: number) => {
      setFiles((prevFiles) => {
        const newFiles = prevFiles.filter((file) => file.id !== id);
        onFilesChange?.(newFiles);
        onFileRemove?.(id, index);
        return newFiles;
      });
    },
    [onFilesChange, onFileRemove]
  );

  // Remove existing (initial) file handler
  const removeExistingFile = useCallback(
    (index: number) => {
      setExisting((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next;
      });
      onExistingFileRemove?.(index);
    },
    [onExistingFileRemove]
  );

  // Clear all files handler
  const clearAllFiles = useCallback(() => {
    setFiles([]);
    onFilesChange?.([]);
  }, [onFilesChange]);

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={cn(
          'file-upload-dropzone',
          isDragActive || isDragging ? 'file-upload-dropzone-active' : '',
          className
        )}>
        <input {...getInputProps()} name={name} required={required} />
        <div className="file-upload-content">
          <CloudUploadIcon className="file-upload-icon" />
          <div>
            <p className="file-upload-title">
              {isDragActive || isDragging
                ? 'Drop the files here'
                : multiple
                  ? 'Drag & drop files here, or click to select'
                  : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="file-upload-subtitle">
              Supports: {acceptedExt} (Max {(maxSize / 1024 / 1024).toFixed(0)}MB per file)
              {multiple && ` • Max ${maxFiles} files`}
            </p>
          </div>
          {files.length === maxFiles && multiple ? (
            <Button type="button" disabled>
              Maximum of {maxFiles} files reached.
            </Button>
          ) : (
            <Button type="button">Select File{multiple ? 's' : ''}</Button>
          )}
        </div>
      </div>

      {/* File preview section */}
      {(existing.length > 0 || files.length > 0) && (
        <div className="file-upload-preview">
          <div className="file-upload-preview-header">
            <h3 className="file-upload-preview-title">{multiple ? 'Selected Files' : 'Selected File'}</h3>
            {multiple && (
              <span className="file-upload-preview-stats">
                {existing.length + files.length} file{existing.length + files.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <ul className="file-upload-list">
            {/* Render existing files first */}
            {existing.map((file, index) => (
              <li key={`existing-${index}`} className="file-upload-list-item">
                <div className="file-upload-list-item-content">
                  {file.type && file.type.startsWith('image/') ? (
                    <img
                      loading="lazy"
                      src={file.url}
                      alt={file.name}
                      width={40}
                      height={40}
                      className="file-upload-image-preview"
                    />
                  ) : (
                    <div className={cn('file-upload-file-icon-container')}>
                      <FileIcon className="file-upload-file-icon" />
                    </div>
                  )}
                  <div className="file-upload-file-info">
                    <a href={file.url || undefined} target="_blank" rel="noreferrer" className="file-upload-file-name">
                      {file.name}
                    </a>
                    {file.size ? <p className="file-upload-file-size">{(file.size / 1024).toFixed(2)} KB</p> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingFile(index)}
                  className="file-upload-remove-button">
                  <XIcon className="file-upload-action-icon" />
                </button>
              </li>
            ))}
            {/* Render newly selected files */}
            {files.map((file, index) => (
              <li key={file.id} className={cn('file-upload-list-item', file.hasError && 'file-upload-list-item-error')}>
                <div className="file-upload-list-item-content">
                  {file.type && file.type.startsWith('image/') ? (
                    <img
                      loading="lazy"
                      src={file.preview}
                      alt={file.name}
                      width={40}
                      height={40}
                      className="file-upload-image-preview"
                    />
                  ) : (
                    <div
                      className={cn(
                        'file-upload-file-icon-container',
                        file.hasError && 'file-upload-file-icon-container-error'
                      )}>
                      <FileIcon className="file-upload-file-icon" />
                    </div>
                  )}
                  <div className="file-upload-file-info">
                    <p className="file-upload-file-name">{file.name}</p>
                    <p className="file-upload-file-size">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                {!storeAsForm && (
                  <div className="file-upload-actions">
                    {file.hasError && !file.uploading && (
                      <span className="file-upload-error-text">Error during upload</span>
                    )}
                    {!instantUpload && !file.uploaded && (
                      <button
                        type="button"
                        className="file-upload-upload-button"
                        disabled={file.uploading || file.uploaded}
                        onClick={() => handleUpload(file)}>
                        {file.uploading ? (
                          <span className="file-upload-loading-span">
                            <Loader2Icon className="file-upload-loading-icon" />
                          </span>
                        ) : file.hasError ? (
                          <RotateCw className="file-upload-action-icon" />
                        ) : (
                          <UploadCloudIcon className="file-upload-action-icon" />
                        )}
                      </button>
                    )}
                    {instantUpload && file.uploading && (
                      <span className="file-upload-loading-span">
                        <Loader2Icon className="file-upload-loading-icon" />
                      </span>
                    )}
                    {instantUpload && file.hasError && !file.uploading && (
                      <button
                        type="button"
                        className="file-upload-upload-button"
                        disabled={file.uploading || file.uploaded}
                        onClick={() => handleUpload(file)}>
                        <RotateCw className="file-upload-action-icon" />
                      </button>
                    )}
                    {file.uploaded && (
                      <span className="file-upload-success-status">
                        <CheckCircle2Icon className="file-upload-action-icon" />
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={file.uploading}
                      onClick={() => removeFile(file.id, index)}
                      className="file-upload-remove-button">
                      <XIcon className="file-upload-action-icon" />
                    </button>
                  </div>
                )}
                {storeAsForm && (
                  <button
                    type="button"
                    onClick={() => removeFile(file.id, index)}
                    className="file-upload-remove-button">
                    <XIcon className="file-upload-action-icon" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="file-upload-bottom-actions">
            <Button type="button" color="danger" variant="ghost" onClick={clearAllFiles}>
              Clear All
            </Button>
            {bulkUpload && (
              <Button type="button" color="primary" disabled={files.length === 0} onClick={() => handleUpload()}>
                Upload File{multiple ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
