import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FormEditor } from './index';
import { v4 as uuid } from 'uuid';
import { Package } from 'lucide-react';
import './index.css';
import '../../parama-ui/dist/parama-ui.min.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FormEditor
      loadPreset={() => [
        {
          id: uuid(),
          label: 'Contact Form',
          type: 'preset',
          group: 'presets',
          description: 'Basic contact form with name, email, and message',
          icon: Package,
          fields: [
            {
              id: uuid(),
              name: 'full_name',
              type: 'text',
              label: 'Full Name',
              width: 12,
              value: ''
            },
            {
              id: uuid(),
              name: 'email',
              type: 'text',
              label: 'Email Address',
              width: 6,
              value: '',
              validations: [
                {
                  type: 'pattern',
                  name: 'email',
                  message: 'Invalid email address',
                  trigger: 'change'
                }
              ]
            },
            {
              id: uuid(),
              name: 'phone',
              type: 'text',
              label: 'Phone Number',
              width: 6,
              value: '',
              validations: [
                {
                  type: 'pattern',
                  name: 'phone',
                  message: 'Invalid phone number',
                  trigger: 'change'
                }
              ]
            },
            {
              id: uuid(),
              name: 'message',
              type: 'textarea',
              label: 'Message',
              width: 12,
              rows: 4,
              value: ''
            }
          ]
        },
        {
          id: uuid(),
          label: 'User Registration',
          type: 'preset',
          group: 'presets',
          description: 'User registration form with all essential fields',
          icon: Package,
          fields: [
            {
              id: uuid(),
              name: 'username',
              type: 'text',
              label: 'Username',
              width: 6,
              value: ''
            },
            {
              id: uuid(),
              name: 'email',
              type: 'text',
              label: 'Email Address',
              width: 6,
              value: '',
              validations: [
                {
                  type: 'pattern',
                  name: 'email',
                  message: 'Invalid email address',
                  trigger: 'change'
                }
              ]
            },
            {
              id: uuid(),
              name: 'password',
              type: 'password',
              label: 'Password',
              width: 6,
              value: '',
              validations: [
                {
                  type: 'pattern',
                  name: 'passwordStrength',
                  message:
                    'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
                  trigger: 'change'
                }
              ]
            },
            {
              id: uuid(),
              name: 'confirm_password',
              type: 'password',
              label: 'Confirm Password',
              width: 6,
              value: ''
            },
            {
              id: uuid(),
              name: 'birth_date',
              type: 'date',
              label: 'Date of Birth',
              width: 6,
              mode: 'single',
              options: {
                dateFormat: 'dd/MM/yyyy'
              },
              value: ''
            },
            {
              id: uuid(),
              name: 'gender',
              type: 'radio',
              label: 'Gender',
              width: 6,
              items: [
                { id: 'male', label: 'Male', value: 'male' },
                { id: 'female', label: 'Female', value: 'female' },
                { id: 'other', label: 'Other', value: 'other' }
              ],
              value: ''
            },
            {
              id: uuid(),
              name: 'terms',
              type: 'checkbox',
              label: 'Terms & Conditions',
              width: 12,
              items: [{ id: 'agree_terms', label: 'I agree to the terms and conditions', value: 'agree' }],
              value: []
            }
          ]
        }
      ]}
      //       schema={JSON.parse(`{
      //   "title": "",
      //   "description": "",
      //   "layout": {
      //     "colSize": 12,
      //     "gap": 4
      //   },
      //   "fields": [
      //     {
      //       "id": "field-1752913277997",
      //       "name": "name_text",
      //       "type": "text",
      //       "label": "Text label",
      //       "width": 12
      //     },
      //     {
      //       "id": "field-1752913282773",
      //       "name": "name_number",
      //       "type": "number",
      //       "label": "Text label",
      //       "width": 12
      //     }
      //   ]
      // }`)}
      // options={{
      //   propertiesSettings: 'readonly'
      // }}
    />
  </StrictMode>
);
