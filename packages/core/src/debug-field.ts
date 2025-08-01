import { useFormBuilder } from './store';
import { FormSchema, VariableContext } from '@parama-dev/form-builder-types';
import { interceptExpressionTemplate, interpolate } from './utils';

// Debug field lookup
function debugFieldLookup() {
  console.log('=== Debugging Field Lookup ===');

  const testSchema: FormSchema = {
    id: 'test-form',
    version: '1.0.0',
    title: 'Test Form',
    description: 'Testing field lookup',
    layout: { colSize: 12, gap: 4 },
    fields: [
      {
        id: 'age',
        name: 'age',
        type: 'number',
        label: 'Age',
        value: 25,
        width: 6
      }
    ]
  };

  console.log('Field in schema:', testSchema.fields[0]);
  console.log('Has value property:', 'value' in testSchema.fields[0]);
  if ('value' in testSchema.fields[0]) {
    console.log('Value is:', (testSchema.fields[0] as any).value);
  }

  // Reset store first
  const store = useFormBuilder.getState();

  // Debug the initialization with explicit data
  console.log('\n--- Testing with explicit data ---');
  store.actions.initialize({
    schema: testSchema,
    data: { age: 25 },
    variables: {}
  });

  // Get fresh state after initialization
  const freshState1 = useFormBuilder.getState();
  console.log('Form data with explicit data:', freshState1.formData);

  // Reset and test without explicit data
  console.log('\n--- Testing without explicit data ---');
  store.actions.initialize({
    schema: testSchema,
    variables: {}
  });

  // Get fresh state after initialization
  const freshState2 = useFormBuilder.getState();
  console.log('Form data without explicit data:', freshState2.formData);

  // Test expression interpolation
  const expression = '{{age}} > 18';
  console.log('\nOriginal expression:', expression);

  // Get current state for testing
  const currentState = useFormBuilder.getState();
  console.log('Current formData:', currentState.formData);
  console.log(
    'Fields available:',
    currentState.actions.getFields().map((f) => ({ id: f.id, name: 'name' in f ? f.name : 'N/A' }))
  );
  console.log('Field lookup test for "age":', currentState.actions.getField('age'));

  const intercepted = interceptExpressionTemplate(expression, currentState);
  console.log('After interceptExpressionTemplate:', intercepted);

  const interpolated = interpolate(intercepted, currentState.formData);
  console.log('After interpolate with formData:', interpolated);
  console.log('Form data used for interpolation:', currentState.formData);
}

debugFieldLookup();
