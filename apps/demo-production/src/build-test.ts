import { FormSchema, FormEditorProps } from '@parama-dev/form-builder-types';
import { FormEditor } from '@parama-dev/form-builder-editor';
// import { FormBuilder } from '@form-builder/core'; // You can uncomment this to test core package
// import { FormRenderer } from '@form-builder/renderer'; // You can uncomment this to test renderer package

// Simple build test - if this compiles, the packages are working
const testSchema: FormSchema = {
  id: 'build-test',
  version: '1.0.0',
  title: 'Build Test',
  description: 'Testing that all imports work',
  layout: {
    colSize: 12,
    gap: 16
  },
  fields: []
};

const testProps: FormEditorProps = {
  schema: testSchema,
  onSaveSchema: (schema) => console.log('Schema saved:', schema)
};

// This will only be executed if used, but validates the types at build time
export function validateBuildsWork() {
  console.log('✅ All package imports are working correctly!');
  console.log('✅ FormSchema type is available');
  console.log('✅ FormEditor component is available');
  console.log('✅ FormEditorProps interface is available');

  return {
    FormEditor,
    testSchema,
    testProps
  };
}

export default validateBuildsWork;
