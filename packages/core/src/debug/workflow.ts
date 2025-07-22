// workflowDebugger.ts
import type { FormField, ValidationTrigger } from '@parama-dev/form-builder-types';
import { useFormBuilder } from '../store';
import { DependencyGraph } from '../workflow/graph';
import { WorkflowEngine } from '../workflow/engine';

type DebugOptions = {
  logDependencies?: boolean;
  logFieldChanges?: boolean;
  logValidation?: boolean;
  logConditions?: boolean;
  logOptionsLoading?: boolean;
  visualizeGraph?: boolean;
};

export function setupWorkflowDebugger(options: DebugOptions = {}) {
  const {
    logDependencies = true,
    logFieldChanges = true,
    logValidation = true,
    logConditions = true,
    logOptionsLoading = true,
    visualizeGraph = true
  } = options;

  const workflowEngine = useFormBuilder.getState().workflowEngine;
  if (!workflowEngine) {
    console.warn('Workflow engine not initialized');
    return;
  }
  const graph = (workflowEngine as WorkflowEngine).graph as DependencyGraph;

  // 1. Dependency Tracking Debugging
  if (logDependencies) {
    const originalAddDependency = graph.addDependency.bind(graph);
    graph.addDependency = (source: string, target: string) => {
      console.log(`%c[DEPENDENCY]%c ${source} → ${target}`, 'color: #4CAF50; font-weight: bold', 'color: inherit');
      return originalAddDependency(source, target);
    };
  }

  // 2. Field Change Debugging
  if (logFieldChanges) {
    const originalProcessFieldChange = workflowEngine.processFieldChange.bind(workflowEngine);
    workflowEngine.processFieldChange = async (fieldId: string) => {
      const store = useFormBuilder.getState();
      console.groupCollapsed(
        `%c[FIELD CHANGE]%c ${fieldId} = ${JSON.stringify(store.formData[fieldId])}`,
        'color: #2196F3; font-weight: bold',
        'color: inherit'
      );
      console.log('Previous value:', store.formData[fieldId]);
      await originalProcessFieldChange(fieldId);
      const dependents = graph.getDependents(fieldId);
      console.log('Affected dependents:', dependents);
      console.groupEnd();
      return;
    };
  }

  // 3. Validation Debugging
  if (logValidation) {
    const store = useFormBuilder.getState();
    const originalValidateField = store.actions.validateField.bind(store.actions);
    store.actions.validateField = async (fieldId: string, trigger?: string) => {
      console.groupCollapsed(
        `%c[VALIDATION]%c ${fieldId} (trigger: ${trigger})`,
        'color: #FF9800; font-weight: bold',
        'color: inherit'
      );
      const field = store.actions.getField(fieldId);
      console.log('Field rules:', field && 'validations' in field ? field.validations : 'No validations');
      const result = await originalValidateField(fieldId, trigger as ValidationTrigger);
      console.log('Validation result:', result);
      console.log('Validation messages:', store.validation[fieldId]?.messages);
      console.groupEnd();
      return result;
    };
  }

  // 4. Condition Evaluation Debugging
  if (logConditions) {
    const originalEvaluateConditions = workflowEngine.evaluateConditions.bind(workflowEngine);
    const store = useFormBuilder.getState();
    workflowEngine.evaluateConditions = () => {
      console.groupCollapsed(
        `%c[CONDITIONS]%c Evaluating all conditions`,
        'color: #9C27B0; font-weight: bold',
        'color: inherit'
      );
      originalEvaluateConditions();
      console.log('Visible fields:', Array.from(store.visibleFields));
      console.log('Disabled fields:', Array.from(store.disabledFields));
      console.groupEnd();
      return;
    };
  }

  // 5. Options Loading Debugging
  if (logOptionsLoading) {
    const originalRefreshOptions = workflowEngine.refreshDynamicOptions.bind(workflowEngine);
    const store = useFormBuilder.getState();
    workflowEngine.refreshDynamicOptions = async (field: FormField) => {
      if (!field || (field.type !== 'select' && field.type !== 'multiselect') || !field.external) {
        console.warn(`Field ${field.id} is not a select or multiselect with dynamic options`);
        return;
      }
      console.groupCollapsed(`%c[OPTIONS LOAD]%c ${field.id}`, 'color: #00BCD4; font-weight: bold', 'color: inherit');
      console.log('Dynamic options config:', field?.external);
      await originalRefreshOptions(field);
      console.log('Loaded options:', field.options);
      console.log('Options cache:', store.optionsCache);
      console.groupEnd();
      return;
    };
  }

  // 6. Dependency Graph Visualization
  if (visualizeGraph) {
    const store = useFormBuilder.getState();
    const graphData = {
      nodes: store.schema.fields.map((field) => ({
        id: field.id,
        label: `${field.id} (${field.type})`
      })),
      edges: [] as { from: string; to: string }[]
    };
    store.schema.fields.forEach((field) => {
      const deps = graph.getDependencies(field.id);
      deps.forEach((depId) => {
        graphData.edges.push({ from: depId, to: field.id });
      });
    });
    console.log(
      '%c[DEPENDENCY GRAPH]%c Visualizing field dependencies',
      'color: #3F51B5; font-weight: bold',
      'color: inherit',
      graphData
    );
    // Optional: Visualize using ASCII art
    console.log('\n%cASCII Dependency Graph:', 'font-weight: bold');
    store.schema.fields.forEach((field) => {
      const deps = graph.getDependencies(field.id);
      if (deps.length > 0) {
        console.log(`${field.id} depends on: ${deps.join(', ')}`);
      }
    });
  }

  // Return cleanup function (no subscription to unsubscribe)
  return () => {
    console.log('%c[DEBUGGER]%c Workflow debugger disabled', 'color: #F44336; font-weight: bold', 'color: inherit');
  };
}
