// Clean version without debug logs for production
import type {
  Condition,
  Events,
  FieldConditions,
  FieldGroupItem,
  FormField,
  ValidationRule
} from '@form-builder/types';
import _, { debounce } from 'lodash';
import { FormBuilderState } from '../store';
import { interpolate, objectToQueryString } from '../utils';
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
  private debounceWait: number;
  private pendingActions: Map<string, Function> = new Map();
  private actionQueue: Set<string> = new Set();
  private isProcessingQueue = false;

  constructor(options: WorkflowEngineOptions) {
    this.graph = new DependencyGraph();
    this.getState = options.getState;
    this.setState = options.setState;
    this.debounceWait = options.debounceWait || 100;
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
    if (field.validations) {
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

      if (depField?.validations) {
        state.actions.validateField(depId, 'change');
      }
    });

    // 3. Run validations SECOND
    if (field.validations && field.validations.length > 0) {
      const isValid = await state.actions.validateField(fieldId, 'change');

      // 4. Execute onValueChange actions LAST
      if (isValid && field.events && field.events.length > 0) {
        this.executeActions(fieldId, field.events);
      }
    }
  }

  private async executeActions(fieldId: string, actions: Events[]) {
    const formData = this.getState().formData;
    const field = this.getState().actions.getField(fieldId);

    if (!field) {
      console.error(`Execute Actions Failed: Field with ID ${fieldId} not found`);
      return;
    }

    for (const action of actions) {
      switch (action.type) {
        case 'fetch':
          this.refreshDynamicOptions(field);
          break;

        case 'reset':
          this.getState().actions.updateFieldValue(fieldId, field.defaultValue || '');
          break;

        case 'setValue':
          const value = interpolate(action.params?.value, formData);
          this.getState().actions.updateFieldValue(fieldId, value);
          break;

        default:
          console.warn(`Unknown action type: ${action.type} for field ${fieldId}`);
          break;
      }
    }
  }

  /**
   * Refreshes dynamic options for a field
   * @param field Form field to refresh
   */
  public async refreshDynamicOptions(field: FormField): Promise<void> {
    const formData = this.getState().formData;

    if (field.type !== 'select' || !field.external) {
      return;
    }
    const { url, headers, params, mapper } = field.external;

    if (!mapper || !mapper.dataSource || !mapper.dataMapper) {
      console.error(`Field ${field.id} is missing external mapper configuration`);
      return;
    }

    const queryExpr = interpolate(JSON.stringify(params || {}), formData);
    const queryParams = objectToQueryString(JSON.parse(queryExpr) || {});

    const response = await fetch(`${url}?${queryParams}`, {
      headers: { ...headers }
    });
    if (!response.ok) {
      this.getState().actions.updateField(field.id, {
        error: 'Failed to load options'
      });
      return;
    }
    const data = await response.json();
    const options = _.get(data, mapper.dataSource, []);
    const mappedOptions: FieldGroupItem[] = options.map((item: any) => {
      return {
        id: _.get(item, mapper.dataMapper.id),
        label: _.get(item, mapper.dataMapper.label),
        value: _.get(item, mapper.dataMapper.value)
      };
    });
    // Update field options in state
    this.getState().actions.updateField(field.id, {
      options: mappedOptions
    });
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

  // Private helper methods
  private scheduleAction(fieldId: string, actionType: string, action: Function): void {
    const actionKey = `${fieldId}-${actionType}`;

    // Cancel pending action if exists
    if (this.pendingActions.has(actionKey)) {
      this.pendingActions.get(actionKey)!();
      this.pendingActions.delete(actionKey);
    }

    // Create debounced action
    const debouncedAction = debounce(() => {
      action();
      this.pendingActions.delete(actionKey);
    }, this.debounceWait);

    this.pendingActions.set(actionKey, debouncedAction.cancel);
    this.actionQueue.add(actionKey);
    debouncedAction();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.actionQueue.size === 0) return;

    this.isProcessingQueue = true;
    try {
      while (this.actionQueue.size > 0) {
        const [actionKey] = this.actionQueue;
        this.actionQueue.delete(actionKey);

        // Action already executed via debounce
        if (!this.pendingActions.has(actionKey)) continue;

        // Force execute pending action
        this.pendingActions.get(actionKey)!();
        this.pendingActions.delete(actionKey);
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private evaluateCondition(condition: Condition | undefined, formData: Record<string, any>): boolean {
    if (!condition?.expression) return true;

    try {
      // Replace formData references with actual values
      const expr = interpolate(condition.expression, formData);
      // Create safe evaluation
      return new Function(`return ${expr}`)();
    } catch (error) {
      console.error('Condition evaluation failed:', error);
      console.error('Original expression:', condition.expression);
      console.error('Interpolated expression:', interpolate(condition.expression, formData));
      console.error('Available form data:', Object.keys(formData));
      return condition.fallback ?? false;
    }
  }

  private extractConditionDependencies(conditions: FieldConditions): string[] {
    const deps = new Set<string>();
    const conditionStr = JSON.stringify(conditions);
    const matches = conditionStr.matchAll(/\{\{(.*?)\}\}/g);

    for (const match of matches) {
      deps.add(match[1].trim());
    }

    return Array.from(deps);
  }

  private extractValidationDependencies(rules: ValidationRule[]): string[] {
    const deps = new Set<string>();

    rules.forEach((rule) => {
      if (rule.type === 'cross-field' && rule.expression) {
        const matches = rule.expression.matchAll(/\{\{(.*?)\}\}/g);
        for (const match of matches) {
          deps.add(match[1].trim());
        }
      }
    });

    return Array.from(deps);
  }
}
