import './index.css';
import '@parama-ui/dist/styles.css';
import '../../../packages/editor/dist/styles.css'; // Ensure editor styles are included
import { createRoot } from 'react-dom/client';
import { FormEditor } from '@form-builder/editor';
import { FormSchema } from '@form-builder/types';

// Test schema using file upload field to verify all functionality
const testSchema: FormSchema = {
  id: 'production-test-form',
  version: '1.0.0',
  title: 'Production Test Form',
  description: 'Testing the published packages with FormEditor functionality',
  layout: {
    colSize: 12,
    gap: 16
  },
  fields: [
    {
      id: 'profile-avatar',
      name: 'avatar',
      type: 'file',
      label: 'Profile Avatar',
      helpText: 'Upload your profile picture (testing file field)',
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
};

function ProductionDemo() {
  const handleSaveSchema = (schema: FormSchema) => {
    console.log('Schema saved in production demo:', schema);
  };

  return (
    <div>
      <h1>🚀 Parama Form Builder - Production Test</h1>
      <p>
        This demo tests the <strong>built packages</strong> as if they were installed from npm. It uses the compiled
        JavaScript/TypeScript from the dist folders instead of source files.
      </p>
      <div className="demo-container">
        <FormEditor schema={testSchema} onSaveSchema={handleSaveSchema} />
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
