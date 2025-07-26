import './index.css';
import '@parama-ui/react/styles';
import { createRoot } from 'react-dom/client';
import { FormEditor } from '@parama-dev/form-builder-editor';
import { FormSchema } from '@parama-dev/form-builder-types';

// Test FormData handling directly here
function testFormDataHandling() {
  console.log('=== Testing FormData Handling ===');

  // Create test FormData
  const testData = new FormData();
  testData.append('username', 'john_doe');
  testData.append('email', 'john@example.com');

  // Create a mock file
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  testData.append('avatar', mockFile);

  // Test the FIXED approach
  const formEntries = Array.from(testData);
  const totalSize = formEntries.reduce((acc, [, value]) => {
    return acc + (value instanceof File ? value.size : new Blob([String(value)]).size);
  }, 0);

  console.log('Total size (bytes):', totalSize);
  console.log('Number of entries:', formEntries.length);

  formEntries.forEach(([key, value], index) => {
    if (value instanceof File) {
      console.log(`📁 ${key}: ${value.name} (${value.size} bytes)`);
    } else {
      console.log(`📝 ${key}: ${String(value)}`);
    }
  });

  return formEntries;
}

// Test button component
function TestFormDataButton() {
  const handleTest = () => {
    console.log('Running FormData handling test...');
    testFormDataHandling();
  };

  return (
    <button
      onClick={handleTest}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 1000
      }}>
      Test FormData
    </button>
  );
}

// Test Dynamic Select functionality
function testDynamicSelectMapping() {
  console.log('=== Testing Dynamic Select Mapping ===');

  // Test cases
  const testCases = [
    {
      name: 'Simple String Array',
      data: ['Product A', 'Product B', 'Product C'],
      mapper: null
    },
    {
      name: 'Object Array',
      data: [
        { id: '123', name: 'Product A', price: '2.5' },
        { id: '223', name: 'Product B', price: '3.0' }
      ],
      mapper: null
    },
    {
      name: 'Nested Object',
      data: {
        products: [
          { id: '123', name: 'Product A', price: '2.5' },
          { id: '223', name: 'Product B', price: '3.0' }
        ]
      },
      mapper: {
        dataSource: 'products',
        dataMapper: {
          id: 'id',
          label: 'name',
          value: 'id'
        }
      }
    }
  ];

  // Simple mapping function to test (mimics the actual implementation)
  const mapResponseToOptions = (data: any, mapper: any) => {
    let sourceData = data;

    if (mapper?.dataSource) {
      // Simple nested property access
      sourceData = data[mapper.dataSource] || data;
    }

    if (!Array.isArray(sourceData)) {
      sourceData = [sourceData];
    }

    return sourceData.map((item: any, index: number) => {
      if (typeof item === 'string') {
        return {
          id: `option-${index}`,
          label: item,
          value: item
        };
      } else if (typeof item === 'object' && item !== null) {
        if (mapper?.dataMapper) {
          return {
            id: item[mapper.dataMapper.id] || `option-${index}`,
            label: item[mapper.dataMapper.label] || `Option ${index + 1}`,
            value: item[mapper.dataMapper.value] || `option-${index}`
          };
        } else {
          // Auto-detect
          const id = item.id || item.key || item.value || index;
          const label = item.label || item.name || item.title || item.text || item.id || `Option ${index + 1}`;
          const value = item.value || item.id || item.key || item.name || index;

          return {
            id: String(id),
            label: String(label),
            value: String(value)
          };
        }
      } else {
        return {
          id: `option-${index}`,
          label: String(item),
          value: String(item)
        };
      }
    });
  };

  // Run tests
  testCases.forEach(({ name, data, mapper }) => {
    console.log(`\n--- Testing: ${name} ---`);
    console.log('Input:', data);
    console.log('Mapper:', mapper);
    const result = mapResponseToOptions(data, mapper);
    console.log('Result:', result);
  });
}

// Demo schema with file field to test the validation editor
const initialSchema: FormSchema = {
  id: 'demo-file-upload-form',
  version: '1.0.0',
  title: 'File Upload Demo Form',
  description: 'Demo form to test file validation editor functionality',
  layout: {
    colSize: 12,
    gap: 6
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
      type: 'submit',
      label: 'Submit Form',
      action: 'submit',
      disabled: false,
      width: 12,
      appearance: {
        color: 'primary',
        variant: 'fill',
        size: 'sm'
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
      <TestFormDataButton />
      <FormEditor schema={initialSchema} onSaveSchema={handleSaveSchema} />
    </div>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <>
      <App />
      <TestFormDataButton />
    </>
  );
}

// Run the dynamic select mapping test
testDynamicSelectMapping();
