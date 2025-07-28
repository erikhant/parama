import '@parama-ui/react/dist/parama-ui.min.css';
import './index.css';
import { FormEditor } from '../src/components/FormEditor';
import { createRoot } from 'react-dom/client';
import type { FormSchema, PresetTypeDef } from '@parama-dev/form-builder-types';

// Example usage of the FormEditor component
export function App() {
  const handleSave = (schema: FormSchema) => {
    console.log('Form schema saved:', schema);
  };

  const initialSchema: FormSchema = {
    id: 'enhanced-file-demo',
    version: '1.0.0',
    title: 'Enhanced File Handling Demo',
    description: 'Demonstrates single and multiple file uploads',
    layout: { colSize: 12, gap: 4 },
    fields: [
      // Regular text field
      {
        id: 'name',
        type: 'text',
        name: 'fullName',
        label: 'Full Name',
        width: 6,
        placeholder: 'Enter your full name',
        value: ''
      },

      // Single file field (Profile Picture)
      {
        id: 'avatar',
        type: 'file',
        name: 'profilePicture',
        label: 'Profile Picture',
        width: 6,
        value: [],
        options: {
          accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] },
          multiple: false, // Single file only
          maxFiles: 1,
          maxSize: 5000000, // 5MB
          server: '/api/upload',
          instantUpload: false
        }
      },

      // Multiple file field (Documents)
      {
        id: 'documents',
        type: 'file',
        name: 'supportingDocs',
        label: 'Supporting Documents',
        width: 12,
        helpText: 'Upload up to 3 PDF or Word documents',
        value: [],
        options: {
          accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
          },
          multiple: true, // Multiple files allowed
          maxFiles: 3,
          maxSize: 10000000, // 10MB per file
          server: '/api/upload',
          instantUpload: false
        }
      },
      {
        id: 'field-1753541773412',
        label: 'Submit',
        type: 'submit',
        width: 2,
        action: 'submit',
        appearance: {
          color: 'primary',
          variant: 'fill',
          size: 'default'
        }
      }
    ]
  };

  const initialPresets: PresetTypeDef[] = [
    {
      id: 'preset-1',
      label: 'Preset 1',
      type: 'preset',
      description: 'This is a preset for demonstration purposes',
      group: 'presets',
      fields: [
        {
          id: Date.now().toString(),
          name: 'name',
          type: 'text',
          label: 'Name',
          placeholder: 'Enter your name',
          value: '',
          width: 6,
          validations: [
            {
              type: 'required',
              message: 'Name is required'
            }
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <FormEditor
        schema={initialSchema}
        loadPreset={initialPresets}
        onSaveSchema={handleSave}
        options={{
          defaultFieldTab: 'presets',
          brand: (
            <img
              src="https://www.pikpng.com/pngl/b/34-345940_download-in-png-format-png-format-clipart.png"
              alt="Brand Logo"
              className="h-6"
            />
          )
        }}
      />
    </div>
  );
}

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}
