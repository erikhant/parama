import type { Condition, Events, FieldConditions, FormField, ValidationRule } from '@parama-dev/form-builder-types';
import { logger } from '../logger';
import type { FormBuilderState, GetState, SetState } from '../state/types';
import {
  interceptExpressionTemplate,
  interpolate,
  resolveExpressionVariables,
  resolveInterpolatableValue
} from '../utils';
import { DependencyGraph } from './graph';

interface WorkflowEngineOptions {
  getState: GetState;
  setState: SetState;
}

/** Matches `{{token}}` placeholders. */
const PLACEHOLDER_PATTERN = /\{\{(.*?)\}\}/g;

/**
 * Collects the field references inside any `{{...}}` placeholders of `source`.
 * `{{$variable}}` placeholders are host-supplied values, not fields, so they are
 * skipped.
 */
function extractFieldReferences(source: string): string[] {
  const refs = new Set<string>();

  for (const match of source.matchAll(PLACEHOLDER_PATTERN)) {
    const token = match[1].trim();
    if (token.length > 0 && !token.startsWith('$')) refs.add(token);
  }

  return Array.from(refs);
}

/**
 * Propagates field changes through the form.
 *
 * Owns the dependency graph and the derived condition state (visible /
 * read-only / disabled). It reads and writes the store through the accessors it
 * is constructed with rather than importing it, so it stays independently
 * testable and free of an import cycle with the store.
 */
export class WorkflowEngine {
  public graph: DependencyGraph;
  private getState: GetState;
  private setState: SetState;

  constructor(options: WorkflowEngineOptions) {
    this.graph = new DependencyGraph();
    this.getState = options.getState;
    this.setState = options.setState;
  }

  /**
   * (Re)registers every dependency a field declares — through conditions,
   * cross-field validations, and events — replacing any previous edges.
   *
   * @param field - Field whose dependencies should be indexed
   */
  public registerDependencies(field: FormField): void {
    this.graph.removeField(field.id);

    if (field.conditions) {
      this.linkDependencies(extractFieldReferences(JSON.stringify(field.conditions)), field.id);
    }

    if ('validations' in field && field.validations) {
      this.linkDependencies(this.extractValidationDependencies(field.validations), field.id);
    }

    if ('events' in field && field.events) {
      // Event targets are already field ids, so they need no name resolution.
      field.events.forEach((event) => {
        if (event.target) this.graph.addDependency(event.target, field.id);
      });
    }
  }

  /**
   * Adds a graph edge from each reference to `dependentId`.
   * References may be field names or ids; both are resolved.
   */
  private linkDependencies(references: string[], dependentId: string): void {
    const state = this.getState();

    references.forEach((reference) => {
      const source =
        state.actions.getField(reference) ?? state.schema.fields.find((field) => field.id === reference);

      if (source) this.graph.addDependency(source.id, dependentId);
    });
  }

  /**
   * Cascades a value change: dependants re-evaluate their conditions and
   * validations first, then the field itself validates, and only a valid field
   * fires its events.
   *
   * @param fieldId - Field whose value just changed
   */
  async processFieldChange(fieldId: string): Promise<void> {
    const state = this.getState();
    const field = state.actions.getField(fieldId);
    if (!field) return;

    // 1. Refresh everything that depends on this field.
    this.graph.getDependents(fieldId).forEach((dependentId) => {
      const dependent = state.actions.getField(dependentId);
      if (!dependent) return;

      if (dependent.conditions) this.evaluateDependentConditions(dependent);
      if ('validations' in dependent && dependent.validations) state.actions.validateField(dependentId, 'change');
    });

    // 2. Validate the field itself, and 3. fire its events if it holds up.
    const hasValidations = 'validations' in field && Boolean(field.validations?.length);
    const hasEvents = 'events' in field && Boolean(field.events?.length);
    if (!hasEvents) return;

    if (!hasValidations) {
      this.executeEvents(field.events!);
      return;
    }

    if (await state.actions.validateField(fieldId, 'change')) {
      this.executeEvents(field.events!);
    }
  }

  /**
   * Runs a field's declared events against their target fields.
   * Events naming an unknown target are skipped.
   */
  private executeEvents(events: Events[]): void {
    const state = this.getState();

    for (const event of events) {
      const target = state.actions.getField(event.target);
      if (!target) continue;

      switch (event.type) {
        case 'fetch':
          this.triggerOptionsRefresh(target);
          break;

        case 'reset':
          state.actions.updateFieldValue(target.id, ('defaultValue' in target ? target.defaultValue : '') || '');
          break;

        case 'setValue':
          this.applySetValue(target.id, event);
          break;

        default:
          break;
      }
    }
  }

  /**
   * Signals a select-like field to reload its remote options by bumping a
   * timestamp its subscribers watch.
   */
  private triggerOptionsRefresh(target: FormField): void {
    const isSelectLike =
      target.type === 'select' || target.type === 'multiselect' || target.type === 'autocomplete';

    if (!isSelectLike || !('external' in target) || !target.external) {
      logger.debug('Field does not qualify for fetch event:', target.type);
      return;
    }

    this.getState().actions.updateField(target.id, {
      external: { ...target.external, _refreshTimestamp: Date.now() }
    } as Partial<FormField>);
  }

  /** Resolves a `setValue` event's template and writes it to the target field. */
  private applySetValue(targetId: string, event: Events): void {
    const state = this.getState();
    const resolved = resolveInterpolatableValue(event.params?.value, state.variables);
    const template = interceptExpressionTemplate(resolved, state.actions.getField);
    const serialized = interpolate(template, state.formData);

    try {
      state.actions.updateFieldValue(targetId, JSON.parse(serialized));
    } catch {
      logger.warn(`setValue produced a non-JSON payload for field "${targetId}":`, serialized);
    }
  }

  /** Re-evaluates conditions for every field in the schema. */
  public evaluateConditions(): void {
    this.getState().schema.fields.forEach((field) => this.evaluateDependentConditions(field));
  }

  /**
   * Evaluates a field's `hidden` / `readOnly` / `disabled` conditions and folds
   * the result into the derived state sets.
   *
   * @remarks
   * Fields are visible unless explicitly hidden. A hidden field is also dropped
   * from the read-only and disabled sets, so those flags cannot linger while it
   * is off-screen.
   */
  public evaluateDependentConditions(field: FormField): void {
    this.setState((state: FormBuilderState) => {
      const visibleFields = new Set(state.visibleFields);
      const readOnlyFields = new Set(state.readOnlyFields);
      const disabledFields = new Set(state.disabledFields);

      const check = (condition: Condition | undefined) =>
        condition ? this.evaluateCondition(condition, state.formData) : false;

      if (check(field.conditions?.hidden)) {
        visibleFields.delete(field.id);
        readOnlyFields.delete(field.id);
        disabledFields.delete(field.id);
      } else {
        visibleFields.add(field.id);
        toggle(readOnlyFields, field.id, check(field.conditions?.readOnly));
        toggle(disabledFields, field.id, check(field.conditions?.disabled));
      }

      return { ...state, visibleFields, readOnlyFields, disabledFields };
    });
  }

  /** Drops a field and its graph edges. */
  public removeField(fieldId: string): void {
    this.graph.removeField(fieldId);
  }

  /**
   * Evaluates a single condition expression against current form data.
   *
   * Variables resolve first (quoted for JavaScript), then field names become
   * ids, then ids become values. An expression that throws falls back to the
   * condition's `fallback`, or `false`.
   */
  private evaluateCondition(condition: Condition | undefined, formData: Record<string, any>): boolean {
    if (!condition?.expression) return true;

    const state = this.getState();
    const withVariables = resolveExpressionVariables(condition.expression, state.variables);
    const withFieldIds = interceptExpressionTemplate(withVariables, state.actions.getField);

    try {
      const expression = interpolate(withFieldIds, formData);
      logger.debug('Evaluating condition:', condition.expression, '→', expression);
      return Boolean(new Function(`return ${expression}`)());
    } catch (error) {
      logger.debug('Condition evaluation failed:', condition.expression, error);
      return condition.fallback ?? false;
    }
  }

  /** Collects the fields referenced by cross-field validation rules. */
  private extractValidationDependencies(rules: ValidationRule[]): string[] {
    return rules
      .filter((rule) => rule.type === 'cross-field' && rule.expression)
      .flatMap((rule) => extractFieldReferences(rule.expression!));
  }
}

/** Adds or removes `value` from `set` based on `shouldContain`. */
function toggle(set: Set<string>, value: string, shouldContain: boolean): void {
  if (shouldContain) set.add(value);
  else set.delete(value);
}

export type { FieldConditions };
