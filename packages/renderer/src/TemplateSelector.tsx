import React from 'react';
import { useFormBuilder } from '@form-builder/core';
import { FormTemplate } from '@form-builder/types';

export const TemplateSelector = () => {
  const { templates, actions } = useFormBuilder();

  if (!templates.length) return null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Start with a template</label>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template: FormTemplate) => (
          <div
            key={template.id}
            onClick={() => actions.applyTemplate(template.id)}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
