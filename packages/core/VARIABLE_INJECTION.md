# Variable Injection Feature

The Parama Form Builder now supports external variable injection, allowing you to dynamically resolve values from external context at runtime. This is particularly useful for scenarios where form fields need access to user-specific data, API endpoints, or other dynamic content that cannot be determined at design time.

## Overview

Variables are injected using the pattern `{{$variableName}}` and can be used in:

- Field labels, placeholders, and help text
- External data source URLs and parameters
- Conditional expressions
- File upload endpoints
- Any string-based configuration

## Basic Usage

### 1. Form Editor with Variables

```typescript
import { FormEditorProps, createStandardVariableContext, STANDARD_VARIABLES } from '@parama/types';

// Create variable context
const variables = createStandardVariableContext({
  [STANDARD_VARIABLES.USER_EMAIL]: 'john.doe@example.com',
  [STANDARD_VARIABLES.USER_NAME]: 'John Doe',
  [STANDARD_VARIABLES.USER_ID]: '12345',
  // Custom variables
  tenantId: 'acme-corp',
  apiBaseUrl: 'https://api.example.com'
});

// Form Editor Props
const editorProps: FormEditorProps = {
  variables: variables,
  options: {
    variableConfig: {
      showVariableSuggestions: true,
      availableVariables: [
        { name: 'userEmail', description: 'Current user email' },
        { name: 'userName', description: 'Current user name' },
        { name: 'apiBaseUrl', description: 'API base URL' }
      ]
    }
  },
  onSaveSchema: (schema) => {
    console.log('Schema saved with variables:', schema);
  }
};
```

### 2. Form Builder with Variables

```typescript
import { FormBuilderProps, createStandardVariableContext } from '@parama/types';

// Runtime variable context
const variables = createStandardVariableContext({
  userEmail: 'user@example.com',
  userName: 'John Doe',
  apiBaseUrl: 'https://api.production.com',
  authToken: 'jwt-token-here'
});

const builderProps: FormBuilderProps = {
  schema: schemaWithVariables,
  variables: variables,
  data: {},
  onSubmit: (data, contentType) => {
    // Handle form submission
  }
};
```

## Variable Patterns

### Basic Text Interpolation

```typescript
// Field with variable interpolation
{
  id: 'welcome',
  type: 'text',
  label: 'Welcome {{$userName}}!',
  placeholder: 'Enter data for {{$userEmail}}',
  helpText: 'Your current role is {{$userRole}}',
}
```

### External Data Sources

```typescript
// Select field with dynamic API endpoint
{
  id: 'departments',
  type: 'select',
  label: 'Department',
  external: {
    url: '{{$apiBaseUrl}}/departments?userId={{$userId}}',
    headers: {
      'Authorization': 'Bearer {{$authToken}}',
      'X-User-Email': '{{$userEmail}}',
    },
    params: {
      tenantId: '{{$tenantId}}',
    },
  },
}
```

### File Upload with Dynamic Server

```typescript
// File field with variable server endpoint
{
  id: 'avatar',
  type: 'file',
  label: 'Profile Picture',
  options: {
    server: '{{$apiBaseUrl}}/upload/avatar?userId={{$userId}}',
    maxSize: 5 * 1024 * 1024,
  },
}
```

### Conditional Logic

```typescript
// Field with conditional visibility
{
  id: 'admin-panel',
  type: 'text',
  label: 'Admin Settings',
  conditions: {
    hidden: {
      expression: '{{$userRole}} !== "admin"',
      fallback: true,
    },
  },
}
```

## Standard Variables

The system provides predefined standard variables for common use cases:

```typescript
import { STANDARD_VARIABLES } from '@parama/types';

// Available standard variables
STANDARD_VARIABLES.USER_EMAIL; // userEmail
STANDARD_VARIABLES.USER_NAME; // userName
STANDARD_VARIABLES.USER_ID; // userId
STANDARD_VARIABLES.USER_ROLE; // userRole
STANDARD_VARIABLES.CURRENT_DATE; // currentDate
STANDARD_VARIABLES.CURRENT_TIME; // currentTime
STANDARD_VARIABLES.CURRENT_TIMESTAMP; // currentTimestamp
STANDARD_VARIABLES.SESSION_ID; // sessionId
STANDARD_VARIABLES.TENANT_ID; // tenantId
STANDARD_VARIABLES.ORGANIZATION_ID; // organizationId
```

## Variable Resolution

### Manual Resolution

```typescript
import { DefaultVariableResolver } from '@parama/types';

const variables = {
  userEmail: 'user@example.com',
  userName: 'John Doe'
};

// Resolve a template string
const template = 'Hello {{$userName}}, your email is {{$userEmail}}';
const resolved = DefaultVariableResolver.resolveTemplate(template, variables);
// Result: "Hello John Doe, your email is user@example.com"

// Check if string has variables
const hasVars = DefaultVariableResolver.hasVariables('Hello {{$userName}}');
// Result: true

// Extract variable names
const varNames = DefaultVariableResolver.extractVariables(template);
// Result: ['userName', 'userEmail']
```

### Validation

```typescript
// Validate template against available variables
const availableVars = ['userName', 'userEmail'];
const validation = DefaultVariableResolver.validateTemplate(
  'Hello {{$userName}}, your role is {{$userRole}}',
  availableVars
);
// Result: { isValid: false, errors: ['Unknown variable: userRole'] }
```

## Advanced Usage

### Dynamic Variable Context

```typescript
// Create a context that updates based on user state
function createDynamicVariableContext(user: User, session: Session) {
  return createStandardVariableContext({
    [STANDARD_VARIABLES.USER_EMAIL]: user.email,
    [STANDARD_VARIABLES.USER_NAME]: user.fullName,
    [STANDARD_VARIABLES.USER_ROLE]: user.role,
    [STANDARD_VARIABLES.SESSION_ID]: session.id,
    // Custom business logic variables
    organizationName: user.organization?.name,
    subscriptionTier: user.subscription?.tier,
    apiBaseUrl: getApiUrlForTier(user.subscription?.tier),
    maxFileSize: getMaxFileSizeForUser(user)
  });
}
```

### Variable Suggestions for Editor

```typescript
import { createVariableSuggestions } from '@parama/types';

const variables = {
  userEmail: 'john@example.com',
  userName: 'John Doe',
  apiUrl: 'https://api.example.com'
};

const suggestions = createVariableSuggestions(variables);
// Result: Array of suggestion objects with name, value, description, example
```

### Custom Variable Resolver

```typescript
class CustomVariableResolver extends DefaultVariableResolver {
  static resolveTemplate(template: string, variables: VariableContext): string {
    // Add custom logic for special variable types
    let resolved = super.resolveTemplate(template, variables);

    // Example: Add support for date formatting
    resolved = resolved.replace(/\{\{date:(.+?)\}\}/g, (match, format) => {
      return new Date().toLocaleDateString('en-US', {
        // Parse format string and apply
      });
    });

    return resolved;
  }
}
```

## Editor Integration

### Variable Suggestions UI

When `showVariableSuggestions` is enabled in `FormEditorOptions.variableConfig`, the editor should:

1. Show available variables in a dropdown/autocomplete
2. Display variable descriptions and current values
3. Insert variable patterns when selected
4. Validate variable usage in real-time

### Variable Configuration

```typescript
const editorOptions: FormEditorOptions = {
  variableConfig: {
    showVariableSuggestions: true,
    availableVariables: [
      {
        name: 'userEmail',
        description: 'Current logged-in user email',
        example: 'john.doe@company.com'
      },
      {
        name: 'organizationId',
        description: 'Current user organization ID',
        example: 'org_123456'
      }
    ],
    // Optionally customize the variable pattern
    variablePrefix: '{{$',
    variableSuffix: '}}'
  }
};
```

## Best Practices

### 1. Variable Naming

- Use descriptive, lowercase names with camelCase
- Follow standard variable names when possible
- Avoid spaces and special characters

```typescript
// Good
userEmail, organizationId, currentDate

// Bad
user email, org-id, date&time
```

### 2. Security Considerations

- Never expose sensitive data in variable context
- Validate and sanitize variable values
- Use environment-specific variables for different deployment stages

```typescript
// Good - Environment-specific
const variables = {
  apiBaseUrl: process.env.API_BASE_URL,
  authDomain: process.env.AUTH_DOMAIN
};

// Bad - Hardcoded sensitive data
const variables = {
  apiKey: 'secret-key-123',
  databaseUrl: 'postgres://user:pass@server'
};
```

### 3. Fallback Values

- Always provide fallback values for optional variables
- Handle missing variables gracefully

```typescript
// In your form renderer
const resolvedValue = variables[variableName] ?? 'default-value';
```

### 4. Performance

- Cache resolved templates when possible
- Avoid excessive variable resolution in render loops
- Use memoization for expensive variable calculations

## Error Handling

```typescript
try {
  const resolved = DefaultVariableResolver.resolveTemplate(template, variables);
} catch (error) {
  console.error('Variable resolution failed:', error);
  // Use fallback or show error to user
}
```

## Migration Guide

If you're upgrading from a previous version:

1. Update your form schemas to use `Interpolatable<string>` types where needed
2. Add `variables` prop to your FormEditor and FormBuilder components
3. Update any external data source configurations to support variable interpolation
4. Test variable resolution in your existing forms

## Examples

See `examples.ts` for complete working examples of all features described above.
