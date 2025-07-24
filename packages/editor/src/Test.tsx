import './index.css';
import '../../parama-ui/dist/parama-ui.min.css';
import { FormEditor } from '../src/components/FormEditor';
import { createRoot } from 'react-dom/client';
import type { FormSchema } from '@parama-dev/form-builder-types';

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
        width: 6,
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
      <FormEditor
        schema={initialSchema}
        onSaveSchema={handleSave}
        options={{
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
