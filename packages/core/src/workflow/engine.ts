import type {
  Condition,
  Events,
  FieldConditions,
  FieldGroupItem,
  FormField,
  ValidationRule
} from '@parama-dev/form-builder-types';
import _, { debounce } from 'lodash';
import { FormBuilderState } from '../store';
import {
  interceptExpressionTemplate,
  interpolate,
  resolveInterpolatableValue,
  resolveExpressionVariables
} from '../utils';
import { DependencyGraph } from './graph';

interface WorkflowEngineOptions {
  getState: () => FormBuilderState;
  setState: (updater: (state: FormBuilderState) => FormBuilderState) => void;
  debounceWait?: number;
}

export class WorkflowEngine {
  public graph: DependencyGraph;
  private getState: () => FormBuilderState;
  private setState: (updater: (state: FormBuilderState) => FormBuilderState) => void;

  constructor(options: WorkflowEngineOptions) {
    this.graph = new DependencyGraph();
    this.getState = options.getState;
    this.setState = options.setState;
  }

  /**
   * Registers a field and its dependencies
   * @param field Form field to register
   */
  public registerDependencies(field: FormField): void {
    // Clear existing dependencies first
    this.graph.removeField(field.id);

    // Register condition dependencies
    if (field.conditions) {
      const conditionDeps = this.extractConditionDependencies(field.conditions);

      conditionDeps.forEach((fieldName) => {
        // Find field by name and get its ID
        const state = this.getState();
        const dependencyField = state.actions.getField(fieldName);
        if (dependencyField) {
          this.graph.addDependency(dependencyField.id, field.id);
        } else {
          // Also try to find by ID in case the expression uses ID instead of name
          const fieldById = state.schema.fields.find((f) => f.id === fieldName);
          if (fieldById) {
            this.graph.addDependency(fieldById.id, field.id);
          }
        }
      });
    }

    // Register validation dependencies
    if ('validations' in field && field.validations) {
      const validationDeps = this.extractValidationDependencies(field.validations);

      validationDeps.forEach((fieldName) => {
        // Find field by name and get its ID
        const state = this.getState();
        const dependencyField = state.actions.getField(fieldName);
        if (dependencyField) {
          this.graph.addDependency(dependencyField.id, field.id);
        } else {
          // Also try to find by ID in case the expression uses ID instead of name
          const fieldById = state.schema.fields.find((f) => f.id === fieldName);
          if (fieldById) {
            this.graph.addDependency(fieldById.id, field.id);
          }
        }
      });
    }

    // Register event dependencies
    if ('events' in field && field.events) {
      const eventDeps = this.extractEventDependencies(field.events);

      eventDeps.forEach((fieldDependentId) => {
        this.graph.addDependency(fieldDependentId, field.id);
      });
    }
  }

  /**
   * Processes changes to a field and updates dependents
   * @param fieldId Field ID that changed
   */
  async processFieldChange(fieldId: string) {
    // 1. Get current state
    const state = this.getState();
    const field = state.actions.getField(fieldId);
    if (!field) return;

    // 2. Evaluate conditions FIRST
    const dependents = this.graph.getDependents(fieldId);

    dependents.forEach((depId) => {
      const depField = state.actions.getField(depId);
      if (depField?.conditions) {
        this.evaluateDependentConditions(depField);
      }

      if (depField && 'validations' in depField && depField.validations) {
        state.actions.validateField(depId, 'change');
      }
    });

    // 3. Run validations SECOND
    if ('validations' in field && field.validations && field.validations.length > 0) {
      const isValid = await state.actions.validateField(fieldId, 'change');

      // 4a. Execute onValueChange actions LAST
      if (isValid && 'events' in field && field.events && field.events.length > 0) {
        this.executeEvents(field.events);
      }
    }

    // 4b. Execute onValueChange actions LAST
    else if ('events' in field && field.events && field.events.length > 0) {
      this.executeEvents(field.events);
    }
  }

  private executeEvents(events: Events[]) {
    const formData = this.getState().formData;
    const state = this.getState();

    for (const event of events) {
      const targetField = state.actions.getField(event.target);
      if (!targetField) {
        continue;
      }
      switch (event.type) {
        case 'fetch':
          // Trigger dynamic options refresh by updating a refresh timestamp
          // This will cause the useEffect in FormField to re-run
          if (
            (targetField.type === 'select' ||
              targetField.type === 'multiselect' ||
              targetField.type === 'autocomplete') &&
            'external' in targetField &&
            targetField.external
          ) {
            this.getState().actions.updateField(targetField.id, {
              external: {
                ...targetField.external,
                _refreshTimestamp: Date.now() // Use current timestamp to trigger refresh
              }
            } as any);
          } else {
            console.log(
              '[WORKFLOW ENGINE] Field does not qualify for fetch event:',
              targetField.type,
              'external' in targetField ? !!(targetField as any).external : false
            );
          }
          break;

        case 'reset':
          this.getState().actions.updateFieldValue(
            targetField.id,
            ('defaultValue' in targetField ? targetField.defaultValue : '') || ''
          );
          break;

        case 'setValue':
          const resolvedValue = resolveInterpolatableValue(event.params?.value, state.variables);
          const interceptedExpression = interceptExpressionTemplate(resolvedValue, this.getState());
          const value = interpolate(interceptedExpression, formData);
          this.getState().actions.updateFieldValue(targetField.id, JSON.parse(value));
          break;

        default:
          break;
      }
    }
  }

  /**
   * Refreshes dynamic options for a field
   * @param field Form field to refresh
   */
  public async refreshDynamicOptions(field: FormField): Promise<void> {
    return;
  }

  /**
   * Evaluates all pending conditions
   */
  public evaluateConditions(): void {
    const state = this.getState();
    const fields = state.schema.fields;

    fields.forEach((field) => {
      this.evaluateDependentConditions(field);
    });
  }

  /**
   * Evaluates and updates the visibility, read-only, and disabled states of a form field based on its conditions.
   *
   * This method processes the conditional logic for a given field and updates the engine state to reflect
   * the field's current status. It evaluates hidden, readOnly, and disabled conditions against
   * the current form data and updates the corresponding field sets in the state.
   *
   * @param field - The form field whose dependent conditions need to be evaluated
   * @returns void
   * @remarks
   * - Fields are visible by default unless explicitly hidden by conditions
   * - The hidden condition controls field visibility - if true, the field is removed from visible fields
   * - Read-only and disabled conditions are only evaluated if they exist on the field
   * - State updates are performed immutably using the setState method
   *
   */
  public evaluateDependentConditions(field: FormField): void {
    this.setState((s) => {
      const newVisibleFields = new Set(s.visibleFields);
      const newReadOnlyFields = new Set(s.readOnlyFields);
      const newDisabledFields = new Set(s.disabledFields);

      // Evaluate conditions
      const shouldBeHidden = field.conditions?.hidden
        ? this.evaluateCondition(field.conditions.hidden, s.formData)
        : false;

      const shouldBeReadOnly = field.conditions?.readOnly
        ? this.evaluateCondition(field.conditions.readOnly, s.formData)
        : false;

      const shouldBeDisabled = field.conditions?.disabled
        ? this.evaluateCondition(field.conditions.disabled, s.formData)
        : false;

      // Handle field visibility based on hidden condition
      // Fields are visible by default unless explicitly hidden
      if (shouldBeHidden) {
        newVisibleFields.delete(field.id);
        // When field is hidden, also remove it from read-only and disabled states
        newReadOnlyFields.delete(field.id);
        newDisabledFields.delete(field.id);
      } else {
        // Field is visible, add it to visible fields
        newVisibleFields.add(field.id);

        // Handle read-only and disabled states for visible fields
        if (shouldBeReadOnly) {
          newReadOnlyFields.add(field.id);
        } else {
          newReadOnlyFields.delete(field.id);
        }

        if (shouldBeDisabled) {
          newDisabledFields.add(field.id);
        } else {
          newDisabledFields.delete(field.id);
        }
      }

      return {
        ...s,
        visibleFields: newVisibleFields,
        readOnlyFields: newReadOnlyFields,
        disabledFields: newDisabledFields
      };
    });
  }

  /**
   * Removes a field from the workflow engine and its dependencies.
   *
   * @param fieldId - The unique identifier of the field to be removed
   * @returns void
   */
  public removeField(fieldId: string): void {
    this.graph.removeField(fieldId);
  }

  private evaluateCondition(condition: Condition | undefined, formData: Record<string, any>): boolean {
    console.log('Evaluating condition:', condition);

    if (!condition?.expression) return true;

    const state = this.getState();

    // First resolve any variables in the expression (with proper quoting for JavaScript)
    const resolvedExpression = resolveExpressionVariables(condition.expression, state.variables);
    console.log('resolved variables:', resolvedExpression);
    // Intercept the expression to replace field names with IDs
    const interceptExpression = interceptExpressionTemplate(resolvedExpression, state);
    console.log('Intercepted expression:', interceptExpression);
    try {
      // Replace formData references with actual values
      const expr = interpolate(interceptExpression, formData);
      console.log('Condition expression:', expr);
      // Create safe evaluation
      const result = new Function(`return ${expr}`)();
      return result;
    } catch (error) {
      return condition.fallback ?? false;
    }
  }

  private extractConditionDependencies(conditions: FieldConditions): string[] {
    const deps = new Set<string>();
    const conditionStr = JSON.stringify(conditions);
    const matches = conditionStr.matchAll(/\{\{(.*?)\}\}/g);

    for (const match of matches) {
      const trimmedKey = match[1].trim();
      // Skip variable patterns ({{$variableName}})
      if (!trimmedKey.startsWith('$')) {
        deps.add(trimmedKey);
      }
    }

    return Array.from(deps).filter((dep) => dep.length > 0);
  }

  private extractEventDependencies(event: Events[]): string[] {
    const deps = new Set<string>();
    event.forEach((e) => {
      if (e.target) {
        deps.add(e.target);
      }
    });

    return Array.from(deps);
  }

  private extractValidationDependencies(rules: ValidationRule[]): string[] {
    const deps = new Set<string>();

    rules.forEach((rule) => {
      if (rule.type === 'cross-field' && rule.expression) {
        const matches = rule.expression.matchAll(/\{\{(.*?)\}\}/g);
        for (const match of matches) {
          const trimmedKey = match[1].trim();
          // Skip variable patterns ({{$variableName}})
          if (!trimmedKey.startsWith('$')) {
            deps.add(trimmedKey);
          }
        }
      }
    });

    return Array.from(deps);
  }
}
