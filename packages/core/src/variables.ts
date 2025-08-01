import {
  VariableContext,
  VariableReference,
  Interpolatable,
  StandardVariableContext
} from '@parama-dev/form-builder-types';

// Variable constants and patterns
export const VARIABLE_PATTERNS = {
  DEFAULT: /\{\{\$([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g,
  EXTRACT: /\{\{\$([a-zA-Z_][a-zA-Z0-9_]*)\}\}/
} as const;

export const VARIABLE_PREFIX = '{{$';
export const VARIABLE_SUFFIX = '}}';

// Common variable names for standardization
export const STANDARD_VARIABLES = {
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  USER_ID: 'userId',
  USER_ROLE: 'userRole',
  CURRENT_DATE: 'currentDate',
  CURRENT_TIME: 'currentTime',
  CURRENT_TIMESTAMP: 'currentTimestamp',
  SESSION_ID: 'sessionId',
  TENANT_ID: 'tenantId',
  ORGANIZATION_ID: 'organizationId'
} as const;

/**
 * Default variable resolver implementation
 */
export class DefaultVariableResolver {
  /**
   * Resolves variables in a template string using the pattern {{$variableName}}
   */
  static resolveTemplate(template: string, variables: VariableContext): string {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(VARIABLE_PATTERNS.DEFAULT, (match, variableName) => {
      const value = variables[variableName];
      if (value !== undefined && value !== null) {
        return String(value);
      }
      // Return the original pattern if variable is not found
      return match;
    });
  }

  /**
   * Checks if a string contains variable references
   */
  static hasVariables(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return VARIABLE_PATTERNS.EXTRACT.test(value);
  }

  /**
   * Extracts variable names from a template string
   */
  static extractVariables(template: string): string[] {
    if (typeof template !== 'string') {
      return [];
    }

    const matches = template.match(VARIABLE_PATTERNS.DEFAULT);
    if (!matches) {
      return [];
    }

    return matches
      .map((match) => {
        const result = VARIABLE_PATTERNS.EXTRACT.exec(match);
        return result ? result[1] : '';
      })
      .filter(Boolean);
  }

  /**
   * Interpolates variables in any value (string, object, array)
   */
  static interpolateValue(value: any, variables: VariableContext): any {
    if (typeof value === 'string') {
      return this.resolveTemplate(value, variables);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.interpolateValue(item, variables));
    }

    if (value && typeof value === 'object') {
      if (this.isVariableReference(value)) {
        return this.resolveVariableReference(value, variables);
      }

      const result: any = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.interpolateValue(val, variables);
      }
      return result;
    }

    return value;
  }

  /**
   * Resolves an Interpolatable value
   */
  static resolveInterpolatable<T>(value: Interpolatable<T>, variables: VariableContext): T {
    if (this.isVariableReference(value)) {
      return this.resolveVariableReference(value, variables);
    }
    return this.interpolateValue(value, variables);
  }

  /**
   * Checks if a value is a VariableReference
   */
  static isVariableReference(value: any): value is VariableReference {
    return value && typeof value === 'object' && 'template' in value;
  }

  /**
   * Resolves a VariableReference
   */
  static resolveVariableReference(ref: VariableReference, variables: VariableContext): any {
    if (ref.resolvedValue !== undefined) {
      return ref.resolvedValue;
    }
    return this.resolveTemplate(ref.template, variables);
  }

  /**
   * Creates a VariableReference from a template string
   */
  static createVariableReference(template: string): VariableReference {
    return {
      template
    };
  }

  /**
   * Validates variable names in a template
   */
  static validateTemplate(template: string, availableVariables?: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const usedVariables = this.extractVariables(template);

    if (availableVariables) {
      for (const variable of usedVariables) {
        if (!availableVariables.includes(variable)) {
          errors.push(`Unknown variable: ${variable}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Creates a standard variable context with current date/time
 */
export function createStandardVariableContext(
  userContext: Partial<StandardVariableContext> = {}
): StandardVariableContext {
  const now = new Date();

  return {
    currentDate: now.toISOString().split('T')[0],
    currentTime: now.toTimeString().split(' ')[0],
    currentTimestamp: now.toISOString(),
    ...userContext
  };
}

/**
 * Helper function to merge variable contexts
 */
export function mergeVariableContexts(...contexts: (VariableContext | undefined)[]): VariableContext {
  return Object.assign({}, ...contexts.filter(Boolean));
}

/**
 * Creates a variable suggestion list for editor UI
 */
export function createVariableSuggestions(variables: VariableContext): Array<{
  name: string;
  value: string;
  description?: string;
  example?: string;
}> {
  return Object.entries(variables).map(([key, value]) => ({
    name: key,
    value: `${VARIABLE_PREFIX}${key}${VARIABLE_SUFFIX}`,
    description: `Current value: ${String(value)}`,
    example: typeof value === 'string' ? value : JSON.stringify(value)
  }));
}

/**
 * Hook-like implementation for React components
 */
export function createVariableContext(initialVariables: VariableContext = {}) {
  let variables = { ...initialVariables };

  const updateVariable = (key: string, value: any) => {
    variables[key] = value;
  };

  const resolveValue = (value: Interpolatable<any>) => {
    return DefaultVariableResolver.resolveInterpolatable(value, variables);
  };

  const hasVariable = (template: string) => {
    return DefaultVariableResolver.hasVariables(template);
  };

  const getVariableNames = (template: string) => {
    return DefaultVariableResolver.extractVariables(template);
  };

  return {
    variables,
    updateVariable,
    resolveValue,
    hasVariable,
    getVariableNames
  };
}
