import { IComponent, ComponentInstance } from '../types';
import { ComponentLifecycleManager, ComponentState } from '../lifecycle/ComponentLifecycle';
import { ComponentDependencyManager } from '../dependencies/DependencyManager';

export interface UpdateStrategy {
  shouldUpdate: (oldComponent: IComponent, newComponent: IComponent) => boolean;
  migrate?: (oldInstance: ComponentInstance, newComponent: IComponent) => Promise<void>;
}

export class HotUpdateManager {
  private lifecycleManager: ComponentLifecycleManager;
  private dependencyManager: ComponentDependencyManager;
  private updateStrategies: Map<string, UpdateStrategy>;

  constructor(
    lifecycleManager: ComponentLifecycleManager,
    dependencyManager: ComponentDependencyManager
  ) {
    this.lifecycleManager = lifecycleManager;
    this.dependencyManager = dependencyManager;
    this.updateStrategies = new Map();
  }

  // 注册更新策略
  registerStrategy(componentType: string, strategy: UpdateStrategy) {
    this.updateStrategies.set(componentType, strategy);
  }

  // 执行热更新
  async hotUpdate(componentId: string, newComponent: IComponent) {
    const strategy = this.updateStrategies.get(newComponent.type);
    if (!strategy) {
      throw new Error(`No update strategy registered for component type: ${newComponent.type}`);
    }

    // 获取受影响的组件
    const affectedComponents = this.getAffectedComponents(componentId);

    // 按依赖顺序更新组件
    for (const instance of affectedComponents) {
      await this.updateComponent(instance, newComponent, strategy);
    }
  }

  private async updateComponent(
    instance: ComponentInstance,
    newComponent: IComponent,
    strategy: UpdateStrategy
  ) {
    try {
      // 转换到更新状态
      await this.lifecycleManager.transition(instance, ComponentState.UPDATING);

      // 执行迁移
      if (strategy.migrate) {
        await strategy.migrate(instance, newComponent);
      }

      // 更新完成
      await this.lifecycleManager.transition(instance, ComponentState.MOUNTED);
    } catch (error) {
      console.error(`Failed to update component ${instance.id}:`, error);
      await this.lifecycleManager.transition(instance, ComponentState.ERROR);
    }
  }

  private getAffectedComponents(componentId: string): ComponentInstance[] {
    const tree = this.dependencyManager.getDependencyTree(componentId);
    // 这里需要实现获取受影响组件实例的逻辑
    return [];
  }
} 