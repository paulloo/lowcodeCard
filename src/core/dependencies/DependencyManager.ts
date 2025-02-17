interface DependencyNode {
  id: string;
  dependencies: Set<string>;
  dependents: Set<string>;
}

export class ComponentDependencyManager {
  private dependencies: Map<string, DependencyNode>;

  constructor() {
    this.dependencies = new Map();
  }

  // 添加依赖关系
  addDependency(componentId: string, dependencyId: string) {
    this.ensureNode(componentId);
    this.ensureNode(dependencyId);

    const component = this.dependencies.get(componentId)!;
    const dependency = this.dependencies.get(dependencyId)!;

    component.dependencies.add(dependencyId);
    dependency.dependents.add(componentId);

    // 检查循环依赖
    if (this.hasCircularDependency(componentId)) {
      component.dependencies.delete(dependencyId);
      dependency.dependents.delete(componentId);
      throw new Error(`Adding dependency would create circular reference: ${componentId} -> ${dependencyId}`);
    }
  }

  // 获取所有依赖
  getDependencies(componentId: string): string[] {
    return Array.from(this.dependencies.get(componentId)?.dependencies || []);
  }

  // 获取依赖树
  getDependencyTree(componentId: string): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = this.getDependencies(id);
      result[id] = deps;
      deps.forEach(traverse);
    };

    traverse(componentId);
    return result;
  }

  private ensureNode(id: string) {
    if (!this.dependencies.has(id)) {
      this.dependencies.set(id, {
        id,
        dependencies: new Set(),
        dependents: new Set()
      });
    }
  }

  private hasCircularDependency(startId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (id: string): boolean => {
      if (recursionStack.has(id)) return true;
      if (visited.has(id)) return false;

      visited.add(id);
      recursionStack.add(id);

      const node = this.dependencies.get(id);
      if (node) {
        for (const depId of node.dependencies) {
          if (dfs(depId)) return true;
        }
      }

      recursionStack.delete(id);
      return false;
    };

    return dfs(startId);
  }
} 