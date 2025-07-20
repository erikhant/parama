import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FormEditor } from '@form-builder/editor';
import { FormSchema } from '@form-builder/types';

// Demo schema with file field to test the validation editor
const initialSchema: FormSchema = {
  title: 'File Upload Demo Form',
  description: 'Demo form to test file validation editor functionality',
  layout: {
    colSize: 12,
    gap: 16
  },
  fields: [
    {
      id: 'file-upload-1',
      name: 'avatar',
      type: 'file',
      label: 'Profile Avatar',
      helpText: 'Upload your profile picture',
      disabled: false,
      defaultValue: null,
      value: null,
      readOnly: false,
      width: 12,
      validations: [
        {
          trigger: 'change',
          type: 'required',
          message: 'Profile picture is required'
        }
      ],
      options: {
        accept: {
          'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 1,
        multiple: false,
        server: '',
        instantUpload: false,
        bulkUpload: false
      },
      appearance: {
        droppable: true
      }
    },
    {
      id: 'file-upload-2',
      name: 'documents',
      type: 'file',
      label: 'Supporting Documents',
      helpText: 'Upload supporting documents (PDF, Word, etc.)',
      disabled: false,
      defaultValue: null,
      value: null,
      readOnly: false,
      width: 12,
      validations: [],
      options: {
        accept: {
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'text/plain': ['.txt']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        multiple: true,
        server: '',
        instantUpload: false,
        bulkUpload: true
      },
      appearance: {
        droppable: true
      }
    },
    {
      id: 'submit',
      name: 'submit',
      type: 'submit',
      label: 'Submit Form',
      disabled: false,
      defaultValue: null,
      value: null,
      readOnly: false,
      width: 12,
      appearance: {
        color: 'primary',
        variant: 'solid',
        size: 'md'
      }
    }
  ]
};

function App() {
  const handleSaveSchema = (schema: FormSchema) => {
    console.log('Schema saved:', schema);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <FormEditor
        schema={initialSchema}
        onSaveSchema={handleSaveSchema}
        options={{
          showJsonCode: true,
          generalSettings: 'on',
          propertiesSettings: 'on',
          appearanceSettings: 'on',
          validationSettings: 'on',
          conditionsSettings: 'on',
          eventsSettings: 'on'
        }}
      />
    </div>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
