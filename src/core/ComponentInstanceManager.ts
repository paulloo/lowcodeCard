import { IComponent } from './types';

export interface ComponentInstance {
  id: string;
  componentId: string;
  props: Record<string, any>;
  parent?: string;
  children: string[];
  state: 'mounted' | 'unmounted' | 'error';
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

export class ComponentInstanceManager {
  private instances: Map<string, ComponentInstance>;
  private componentRegistry: ComponentRegistry;

  constructor(registry: ComponentRegistry) {
    this.instances = new Map();
    this.componentRegistry = registry;
  }

  createInstance(component: IComponent, props: Record<string, any>): ComponentInstance {
    const instance: ComponentInstance = {
      id: generateUniqueId(),
      componentId: component.id,
      props,
      children: [],
      state: 'unmounted'
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  updateInstance(instanceId: string, updates: Partial<ComponentInstance>) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    Object.assign(instance, updates);
    this.instances.set(instanceId, instance);
  }

  removeInstance(instanceId: string) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    // 移除子组件
    instance.children.forEach(childId => {
      this.removeInstance(childId);
    });

    // 从父组件中移除
    if (instance.parent) {
      const parent = this.instances.get(instance.parent);
      if (parent) {
        parent.children = parent.children.filter(id => id !== instanceId);
      }
    }

    this.instances.delete(instanceId);
  }

  getInstanceTree(rootId: string): ComponentInstance & { children: any[] } {
    const instance = this.instances.get(rootId);
    if (!instance) {
      throw new Error(`Instance not found: ${rootId}`);
    }

    return {
      ...instance,
      children: instance.children.map(childId => this.getInstanceTree(childId))
    };
  }
} 