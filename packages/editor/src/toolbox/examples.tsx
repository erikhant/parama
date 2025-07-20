import React from 'react';
import { ToolboxPanel, ToolboxSearch } from './index';
import { FieldTypeDef } from '@form-builder/types';

/**
 * Example usage of the enhanced ToolboxPanel with search functionality
 */
export const FormBuilderExample: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Toolbox with search functionality */}
      <ToolboxPanel />

      {/* Main form editor area */}
      <div className="flex-1 p-4">
        <h1>Form Editor with Enhanced Toolbox Search</h1>
        <p>The toolbox now includes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Debounced search input for fields and presets</li>
          <li>Advanced preset management with category filtering</li>
          <li>Keyboard shortcuts (ESC to clear search)</li>
          <li>Enhanced empty states and user feedback</li>
          <li>Search through multiple field properties</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example of using individual search components
 */
export const CustomToolboxExample: React.FC = () => {
  const [filteredFields, setFilteredFields] = React.useState<FieldTypeDef[]>([]);

  // Mock field data - replace with actual data from your store
  const mockFields: FieldTypeDef[] = [
    {
      id: '1',
      type: 'text',
      label: 'Text Input',
      description: 'A single-line text input field',
      group: 'fields',
      icon: 'text-icon' // or a LucideIcon
    }
    // ... more fields
  ];

  return (
    <div>
      {/* Custom search implementation */}
      <ToolboxSearch items={mockFields} onFilteredItems={setFilteredFields} placeholder="Search form fields..." />

      {/* Display filtered results */}
      <div className="mt-4">
        {filteredFields.map((field) => (
          <div key={field.id} className="p-2 border rounded mb-2">
            <h3 className="font-medium">{field.label}</h3>
            <p className="text-sm text-gray-600">{field.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
