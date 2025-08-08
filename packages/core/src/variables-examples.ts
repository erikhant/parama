import { FormBuilderProps, FormEditorProps, FormSchema, StandardVariableContext } from '@parama-dev/form-builder-types';
import {
  DefaultVariableResolver,
  STANDARD_VARIABLES,
  createStandardVariableContext,
  createVariableSuggestions
} from './variables';

/**
 * Example: Using variables in Form Editor
 */
export function ExampleFormEditorWithVariables() {
  // 1. Create your variable context with user-specific data
  const userVariables: StandardVariableContext = createStandardVariableContext({
    [STANDARD_VARIABLES.USER_EMAIL]: 'john.doe@example.com',
    [STANDARD_VARIABLES.USER_NAME]: 'John Doe',
    [STANDARD_VARIABLES.USER_ID]: '12345',
    [STANDARD_VARIABLES.USER_ROLE]: 'admin',
    // Custom variables
    tenantId: 'acme-corp',
    apiBaseUrl: 'https://api.example.com',
    organizationName: 'ACME Corporation'
  });

  // 2. Configure variable suggestions for the editor
  const variableSuggestions = createVariableSuggestions(userVariables);

  // 3. Form Editor Props with variable support
  const formEditorProps: FormEditorProps = {
    variables: userVariables,
    options: {
      variableConfig: {
        showVariableSuggestions: true,
        availableVariables: variableSuggestions.map((v: any) => ({
          name: v.name,
          description: v.description,
          example: v.example
        }))
      }
    },
    onSaveSchema: (schema: FormSchema) => {
      console.log('Saved schema with variables:', schema);
    }
  };

  return formEditorProps;
}

/**
 * Example: Using variables in Form Builder (runtime)
 */
export function ExampleFormBuilderWithVariables() {
  // Sample schema with variable references
  const schemaWithVariables: FormSchema = {
    id: 'user-profile-form',
    version: '1.0.0',
    title: 'User Profile Form',
    description: 'Edit profile for {{$userName}}',
    layout: {
      colSize: 2,
      gap: 16
    },
    fields: [
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter email (current: {{$userEmail}})',
        helpText: 'Your current email is {{$userEmail}}',
        value: '',
        defaultValue: '{{$userEmail}}',
        width: 100,
        validations: []
      },
      {
        id: 'full-name',
        name: 'fullName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        value: '',
        defaultValue: '{{$userName}}',
        width: 100,
        validations: []
      },
      {
        id: 'department',
        name: 'department',
        type: 'select',
        label: 'Department',
        placeholder: 'Select your department',
        multiple: false,
        value: '',
        width: 100,
        options: [],
        // External data source with variables
        external: {
          url: '{{$apiBaseUrl}}/departments?userId={{$userId}}&tenantId={{$tenantId}}',
          headers: {
            Authorization: 'Bearer {{$authToken}}',
            'X-User-Email': '{{$userEmail}}'
          },
          params: {
            organizationId: '{{$organizationId}}'
          }
        },
        validations: []
      },
      {
        id: 'avatar',
        name: 'avatar',
        type: 'file',
        label: 'Profile Picture',
        value: null,
        width: 100,
        options: {
          accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
          },
          maxSize: 5 * 1024 * 1024, // 5MB
          maxFiles: 1,
          multiple: false,
          server: '{{$apiBaseUrl}}/upload/avatar?userId={{$userId}}',
          instantUpload: true
        },
        validations: []
      }
    ]
  };

  // Runtime variable context
  const runtimeVariables: StandardVariableContext = createStandardVariableContext({
    [STANDARD_VARIABLES.USER_EMAIL]: 'jane.smith@example.com',
    [STANDARD_VARIABLES.USER_NAME]: 'Jane Smith',
    [STANDARD_VARIABLES.USER_ID]: '67890',
    [STANDARD_VARIABLES.USER_ROLE]: 'user',
    authToken: 'jwt-token-here',
    apiBaseUrl: 'https://api.production.com',
    tenantId: 'tenant-123',
    organizationId: 'org-456'
  });

  // Form Builder Props with variables
  const formBuilderProps: FormBuilderProps = {
    schema: schemaWithVariables,
    variables: runtimeVariables,
    data: {},
    onSubmit: (data: Record<string, any> | FormData, contentType: 'application/json' | 'multipart/form-data') => {
      console.log('Form submitted:', data);
      console.log('Content type:', contentType);
    },
    onChange: (data: Record<string, any>) => {
      console.log('Form data changed:', data);
    }
  };

  return formBuilderProps;
}

/**
 * Example: Resolving variables at runtime
 */
export function ExampleVariableResolution() {
  const variables = {
    userEmail: 'user@example.com',
    userName: 'John Doe',
    apiBaseUrl: 'https://api.example.com',
    userId: '12345'
  };

  // Example templates
  const examples = [
    'Hello {{$userName}}, your email is {{$userEmail}}',
    '{{$apiBaseUrl}}/users/{{$userId}}/profile',
    'Welcome {{$userName}}!',
    'API endpoint: {{$apiBaseUrl}}/data?user={{$userEmail}}'
  ];

  examples.forEach((template) => {
    const resolved = DefaultVariableResolver.resolveTemplate(template, variables);
    console.log(`Template: ${template}`);
    console.log(`Resolved: ${resolved}`);
    console.log(`Variables used: ${DefaultVariableResolver.extractVariables(template).join(', ')}`);
    console.log('---');
  });

  // Example with validation
  const availableVars = Object.keys(variables);
  const validationResult = DefaultVariableResolver.validateTemplate(
    'Hello {{$userName}}, your role is {{$userRole}}', // userRole is not available
    availableVars
  );

  console.log('Validation result:', validationResult);
  // Output: { isValid: false, errors: ['Unknown variable: userRole'] }
}

/**
 * Example: Dynamic external data source configuration
 */
export function ExampleDynamicDataSource() {
  const variables = {
    userEmail: 'admin@company.com',
    userRole: 'admin',
    tenantId: 'company-123',
    apiKey: 'secret-api-key'
  };

  // Field with dynamic external data source
  const dynamicSelectField = {
    id: 'projects',
    name: 'projects',
    type: 'multiselect' as const,
    label: 'Available Projects',
    placeholder: 'Select projects for {{$userEmail}}',
    multiple: true,
    value: [],
    width: 100,
    options: [],
    external: {
      url: 'https://api.company.com/projects',
      headers: {
        Authorization: 'Bearer {{$apiKey}}',
        'X-User-Email': '{{$userEmail}}',
        'X-Tenant-ID': '{{$tenantId}}'
      },
      params: {
        userRole: '{{$userRole}}',
        includeArchived: 'false'
      },
      dataPath: 'data.projects'
    },
    validations: []
  };

  // Resolve the external data source
  const resolvedField = DefaultVariableResolver.interpolateValue(dynamicSelectField, variables);

  console.log('Original field:', dynamicSelectField);
  console.log('Resolved field:', resolvedField);

  return resolvedField;
}

/**
 * Example: Conditional logic with variables
 */
export function ExampleConditionalLogic() {
  const variables = {
    userRole: 'admin',
    isLoggedIn: true,
    subscriptionTier: 'premium'
  };

  const fieldWithConditions = {
    id: 'admin-settings',
    name: 'adminSettings',
    type: 'text' as const,
    label: 'Admin Settings',
    value: '',
    width: 100,
    conditions: {
      hidden: {
        expression: '{{$userRole}} !== "admin"',
        fallback: true
      },
      disabled: {
        expression: '{{$subscriptionTier}} !== "premium"',
        fallback: false
      }
    },
    validations: []
  };

  // In your form renderer, you would resolve these conditions
  const resolvedConditions = DefaultVariableResolver.interpolateValue(fieldWithConditions.conditions, variables);

  console.log('Resolved conditions:', resolvedConditions);
  return resolvedConditions;
}
