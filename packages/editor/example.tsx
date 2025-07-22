import React from 'react';
import { FormEditor } from '@form-builder/editor';
import type { FormSchema } from '@form-builder/types';
// Import the required styles
import '@form-builder/editor/styles';

// Example usage of the FormEditor component
export function App() {
  const handleSave = (schema: FormSchema) => {
    console.log('Form schema saved:', schema);
  };

  const initialSchema: FormSchema = {
    id: 'example-form',
    version: '1.0',
    title: 'Example Form',
    description: 'A simple example form',
    layout: {
      colSize: 12,
      gap: 4
    },
    fields: [
      {
        id: 'field-1',
        name: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        value: '',
        width: 100,
        validations: [
          {
            type: 'required',
            message: 'Name is required'
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FormEditor schema={initialSchema} onSaveSchema={handleSave} />
    </div>
  );
}
