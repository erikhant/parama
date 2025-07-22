// Test imports of the published packages
// Note: Types package only exports TypeScript types, so we can't import runtime values
import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import { FormEditor } from '@parama-dev/form-builder-editor';

console.log('All imports successful!');
console.log('Core:', typeof useFormBuilder);
console.log('Renderer:', typeof FormRenderer);
console.log('Editor:', typeof FormEditor);
