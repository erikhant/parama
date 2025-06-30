export class DependencyGraph {
  private dependencies: Map<string, Set<string>> = new Map();
  private reverseDependencies: Map<string, Set<string>> = new Map();

  /**
   * Adds a dependency between two fields
   * @param source Field ID that is depended upon
   * @param target Field ID that has the dependency
   */
  public addDependency(source: string, target: string): void {
    if (!this.dependencies.has(source)) {
      this.dependencies.set(source, new Set());
    }
    this.dependencies.get(source)!.add(target);

    if (!this.reverseDependencies.has(target)) {
      this.reverseDependencies.set(target, new Set());
    }
    this.reverseDependencies.get(target)!.add(source);
  }

  /**
   * Gets all fields that depend on the specified field (transitive closure)
   * @param fieldId Field ID to get dependents for
   * @returns Array of dependent field IDs
   */
  public getDependents(fieldId: string): string[] {
    const visited = new Set<string>();
    const stack = [fieldId];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = this.dependencies.get(current) || new Set();
        neighbors.forEach((neighbor) => stack.push(neighbor));
      }
    }

    visited.delete(fieldId); // Exclude the original field
    return Array.from(visited);
  }

  /**
   * Gets all fields that the specified field depends on
   * @param fieldId Field ID to get dependencies for
   * @returns Array of dependency field IDs
   */
  public getDependencies(fieldId: string): string[] {
    return Array.from(this.reverseDependencies.get(fieldId) || []);
  }

  /**
   * Removes all dependencies for a field
   * @param fieldId Field ID to remove
   */
  public removeField(fieldId: string): void {
    // Remove as dependency
    this.dependencies.delete(fieldId);

    // Remove from reverse dependencies
    this.reverseDependencies.forEach((deps, key) => {
      deps.delete(fieldId);
      if (deps.size === 0) {
        this.reverseDependencies.delete(key);
      }
    });
  }

  /**
   * Checks for circular dependencies
   * @returns True if circular dependency exists
   */
  public hasCircularDependency(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const neighbors = this.dependencies.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of this.dependencies.keys()) {
      if (hasCycle(node)) return true;
    }

    return false;
  }

  /**
   * Generates a visual representation of the dependency graph as a string.
   *
   * Each line in the output shows a source node followed by an arrow (→) and
   * a comma-separated list of its dependent nodes.
   *
   * @returns A string representation of the dependency graph where each line
   *          follows the format "source → dependent1, dependent2, ..."
   *
   * @example
   * ```
   * // For a graph where A depends on B and C, and B depends on D:
   * // Output would be:
   * // A → B, C
   * // B → D
   * ```
   */
  public visualizeGraph(): string {
    let output = '';
    this.dependencies.forEach((dependents, source) => {
      output += `${source} → ${Array.from(dependents).join(', ')}\n`;
    });
    return output;
  }
}
