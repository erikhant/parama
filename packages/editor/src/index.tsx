import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FormEditor } from './index';
import './index.css';
import '../../parama-ui/dist/parama-ui.min.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FormEditor
      schema={JSON.parse(`{
  "title": "",
  "description": "",
  "layout": {
    "colSize": 12,
    "gap": 4
  },
  "fields": [
    {
      "id": "field-1752913277997",
      "name": "name_text",
      "type": "text",
      "label": "Text label",
      "width": 12
    },
    {
      "id": "field-1752913282773",
      "name": "name_number",
      "type": "number",
      "label": "Text label",
      "width": 12
    }
  ]
}`)}
      options={{
        generalSettings: 'readonly',
        propertiesSettings: 'off',
        appearanceSettings: 'on',
        validationSettings: 'on'
      }}
    />
  </StrictMode>
);
