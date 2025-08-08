import './index.css';
import '@parama-ui/react/dist/parama-ui.min.css';
import '@parama-dev/form-builder-editor/dist/editor.css'; // Ensure editor styles are included
import { createRoot } from 'react-dom/client';
import { FormEditor } from '@parama-dev/form-builder-editor';
import type { FormSchema, PresetTypeDef } from '@parama-dev/form-builder-types';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { useState } from 'react';

// Test schema using file upload field to verify all functionality
const testSchema: FormSchema = {
  id: 'production-test-form',
  version: '1.0.0',
  title: 'Production Test Form',
  description: 'Testing the published packages with FormEditor functionality',
  layout: {
    colSize: 12,
    gap: 5
  },
  fields: [
    {
      id: 'test-name',
      name: 'fullName',
      type: 'text',
      label: 'Full Name',
      helpText: 'Enter your full name',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 12,
      validations: [
        {
          trigger: 'change',
          type: 'required',
          message: 'Name is required'
        }
      ],
      appearance: {}
    },
    {
      id: 'test-email',
      name: 'email',
      type: 'email',
      label: 'Email Address',
      helpText: 'Enter your email address',
      disabled: false,
      defaultValue: '',
      value: '',
      readOnly: false,
      width: 12,
      validations: [
        {
          trigger: 'change',
          type: 'required',
          message: 'Email is required'
        }
      ],
      appearance: {}
    },
    {
      id: 'field-1754314295037',
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

const presets: PresetTypeDef[] = [
  {
    id: Date.now().toString(),
    type: 'preset',
    label: 'Profile',
    group: 'presets',
    description: 'A preset for user profile forms',
    fields: [
      {
        id: 'first-name',
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        helpText: 'Enter your first name',
        disabled: false,
        defaultValue: '',
        value: '',
        readOnly: false,
        width: 6,
        validations: [
          {
            trigger: 'change',
            type: 'required',
            message: 'First name is required'
          }
        ],
        appearance: {}
      },
      {
        id: 'last-name',
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        helpText: 'Enter your last name',
        disabled: false,
        defaultValue: '',
        value: '',
        readOnly: false,
        width: 6,
        validations: [
          {
            trigger: 'change',
            type: 'required',
            message: 'Last name is required'
          }
        ],
        appearance: {}
      }
    ]
  }
];

function ProductionDemo() {
  const [schema, setSchema] = useState<FormSchema>(testSchema);
  const handleSaveSchema = (schema: FormSchema) => {
    console.log('Schema saved in production demo:', schema);
    setSchema(schema);
  };

  const handleSubmitSchema = async (data: Record<string, any>) => {
    try {
      console.log('Submitting form data:', data);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create submission object with metadata
      const submission = {
        id: Date.now().toString(),
        formId: testSchema.id,
        formTitle: testSchema.title,
        submittedAt: new Date().toISOString(),
        data: data
      };

      // Submit to JSON Server
      const response = await fetch('http://localhost:3000/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
      });

      if (response.ok) {
        const savedSubmission = await response.json();
        console.log('Form submitted successfully:', savedSubmission);
        alert('Form submitted successfully! Check the console and db.json file.');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Make sure JSON Server is running on port 3000.');
    }
  };

  return (
    <div>
      <h1>🚀 Parama Form Builder - Production Test</h1>
      <p>
        This demo tests the <strong>built packages</strong> as if they were installed from npm. It uses the compiled
        JavaScript/TypeScript from the dist folders instead of source files.
      </p>
      <div className="demo-container">
        <FormEditor schema={testSchema} onSaveSchema={handleSaveSchema} loadPreset={presets} />
      </div>
      <div className="demo-container">
        <FormRenderer schema={schema} onSubmit={handleSubmitSchema} />
      </div>
    </div>
  );
}

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ProductionDemo />);
} else {
  console.error('Root container not found');
}
