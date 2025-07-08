import { useCallback, useState, useMemo, useEffect } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import {
  CloudUploadIcon,
  XIcon,
  CheckCircle2Icon,
  FileIcon,
  UploadCloudIcon,
  Loader2Icon
} from 'lucide-react';
import { Button, cn } from '@parama-ui/react';
import { FileOptions } from '@form-builder/types';

type FilePreview = File & {
  preview: string;
  uploaded: boolean;
  uploading?: boolean;
  id: string;
};

interface FancyFileUploadProps extends FileOptions {
  name?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  formExtension?: Record<string, any>;
  onFilesChange?: (files: File[]) => void;
  onFileUploaded?: (response: any) => void;
  onError?: (error: any) => void;
}

function fileToJson(file: File): Promise<Record<string, any> | null> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = function (e) {
      if (!e.target) {
        reject(null);
        return;
      }
      const content = e.target.result;
      try {
        const jsonObject = JSON.parse(content as string);
        resolve(jsonObject);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        reject(null);
      }
    };

    reader.readAsText(file);
  });
}

export function FileUpload({
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt']
  },
  instantUpload = false,
  server = '',
  name,
  required,
  disabled,
  className,
  bulkUpload,
  formExtension,
  onFilesChange,
  onFileUploaded,
  onError
}: FancyFileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);

      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          uploaded: false,
          uploading: instantUpload ? true : false,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2, 9)
        })
      );

      if (multiple) {
        setFiles((prevFiles) => {
          const updatedFiles = [...prevFiles, ...filesWithPreview].slice(0, maxFiles);
          if (onFilesChange) onFilesChange(updatedFiles);
          return updatedFiles;
        });

        // Handle instant upload for all files
        if (instantUpload) {
          setTimeout(() => {
            files.forEach((file) => {
              handleUpload(file.id);
            });
          }, 100);
        }
      } else {
        // For single file upload, replace existing file
        const newFile = filesWithPreview[0];
        setFiles(newFile ? [newFile] : []);
        if (onFilesChange) onFilesChange(newFile ? [newFile] : []);

        // Handle instant upload for single files
        if (instantUpload && newFile) {
          handleUpload(newFile.id);
        }
      }
    },
    [multiple, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropRejected: (rejectedFiles) => {
      if (onError) {
        const errorMessages = rejectedFiles.map((file) => file.errors.map((e) => e.message)).flat();
        onError(new Error(errorMessages.join(', ')));
      }
    },
    accept,
    multiple,
    maxFiles,
    maxSize,
    disabled,
    noClick: files.length === maxFiles
  });

  const removeFile = (id: string) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
    if (onFilesChange) onFilesChange(newFiles);
  };

  const clearAllFiles = () => {
    setFiles([]);
    if (onFilesChange) onFilesChange([]);
  };

  const handleUpload = async (id?: string) => {
    if (files.length === 0) return;
    if (!server) {
      if (onError) onError(new Error('Server URL is required for file upload'));
      return;
    }

    const formData = new FormData();
    if (formExtension) {
      Object.keys(formExtension).forEach((key) => {
        formData.append(key, formExtension[key]);
      });
    }

    if (id) {
      const fileToUpload = files.find((file) => file.id === id);
      if (!fileToUpload) {
        if (onError) onError(new Error('File not found for upload'));
        return;
      }
      formData.append(name ?? 'file', fileToUpload);
      setFiles((prevFiles) =>
        prevFiles.map((file) => (file.id === id ? { ...file, uploading: true } : file))
      );
    } else {
      // Upload all files
      files
        .filter((file) => !file.uploaded)
        .forEach((file) => {
          formData.append(name ?? 'files', file);
          setFiles((prevFiles) =>
            prevFiles.map((f) => (f.id === file.id ? { ...f, uploading: true } : f))
          );
        });
    }

    try {
      const response = await fetch(server, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      if (id) {
        const fileToUpdate = files.find((file) => file.id === id);
        if (fileToUpdate) {
          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.id === id ? { ...file, uploaded: true, uploading: false } : file
            )
          );
        }
      } else {
        setFiles((prevFiles) =>
          prevFiles.map((file) => ({ ...file, uploaded: true, uploading: false }))
        );
      }

      // Handle successful upload response
      const responseData = await response.json();
      if (onFileUploaded) onFileUploaded(responseData);
    } catch (error) {
      if (onError) onError(error);
    }
  };

  // Clean up object URLs to avoid memory leaks
  const cleanUp = useCallback(() => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  // Calculate total size of uploaded files
  const totalSize = useMemo(() => {
    return files.reduce((acc, file) => acc + file.size, 0);
  }, [files]);

  useEffect(() => {
    return () => {
      cleanUp();
    };
  }, [cleanUp]);

  return (
    <div className="mx-auto pt-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
          isDragActive || isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50',
          className
        )}>
        <input {...getInputProps()} required={required} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <CloudUploadIcon className="w-12 h-12 text-indigo-500" />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive || isDragging
                ? 'Drop the files here'
                : multiple
                  ? 'Drag & drop files here, or click to select'
                  : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports: {Object.values(accept).flat().join(', ')} (Max{' '}
              {(maxSize / 1024 / 1024).toFixed(0)}MB per file)
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
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {multiple ? 'Selected Files' : 'Selected File'}
            </h3>
            {multiple && (
              <span className="text-sm text-gray-500">
                {files.length} file{files.length !== 1 ? 's' : ''} •{' '}
                {(totalSize / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>

          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                      <FileIcon className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!instantUpload && !file.uploaded && (
                    <button
                      type="button"
                      className="text-indigo-400 hover:text-indigo-500 focus:outline-none"
                      onClick={() => handleUpload(file.id)}>
                      {file.uploading ? (
                        <span className="text-xs inline-flex items-center gap-2">
                          <Loader2Icon className="w-5 h-5 animate-spin" /> Uploading..
                        </span>
                      ) : (
                        <UploadCloudIcon className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  {file.uploaded && (
                    <span className="text-green-500">
                      <CheckCircle2Icon className="w-5 h-5" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 justify-end">
            <Button type="button" color="danger" variant="ghost" onClick={clearAllFiles}>
              Clear All
            </Button>
            {bulkUpload && (
              <Button
                type="button"
                color="primary"
                disabled={files.length === 0}
                onClick={() => handleUpload()}>
                Upload File{multiple ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
