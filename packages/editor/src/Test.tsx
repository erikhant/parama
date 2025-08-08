import '@parama-ui/react/dist/parama-ui.min.css';
import './styles/index.css';
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
    fields: []
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
        // variables={{
        //   userName: 'john_doe',
        //   userEmail: 'john.doe@example.com'
        // }}
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
