import { IComponent, ComponentInstance } from '../types';

export enum ComponentState {
  CREATED = 'created',
  INITIALIZING = 'initializing',
  READY = 'ready',
  MOUNTED = 'mounted',
  UPDATING = 'updating',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

export interface LifecycleHooks {
  onCreated?: () => void | Promise<void>;
  onInitialized?: () => void | Promise<void>;
  onMounted?: (el: HTMLElement) => void | Promise<void>;
  onBeforeUpdate?: () => boolean | Promise<boolean>;
  onUpdated?: () => void | Promise<void>;
  onBeforeDestroy?: () => void | Promise<void>;
  onDestroyed?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

export class ComponentLifecycleManager {
  private states: Map<string, ComponentState>;
  private hooks: Map<string, LifecycleHooks>;

  constructor() {
    this.states = new Map();
    this.hooks = new Map();
  }

  // 注册生命周期钩子
  registerHooks(componentId: string, hooks: LifecycleHooks) {
    this.hooks.set(componentId, hooks);
  }

  // 获取组件状态
  getState(componentId: string): ComponentState {
    return this.states.get(componentId) || ComponentState.CREATED;
  }

  // 状态转换
  async transition(instance: ComponentInstance, toState: ComponentState) {
    const hooks = this.hooks.get(instance.componentId);
    const currentState = this.getState(instance.componentId);

    try {
      switch (toState) {
        case ComponentState.INITIALIZING:
          await hooks?.onCreated?.();
          break;

        case ComponentState.READY:
          await hooks?.onInitialized?.();
          break;

        case ComponentState.MOUNTED:
          await hooks?.onMounted?.(instance.el as HTMLElement);
          break;

        case ComponentState.UPDATING:
          if (await hooks?.onBeforeUpdate?.()) {
            await hooks?.onUpdated?.();
          }
          break;

        case ComponentState.DESTROYED:
          await hooks?.onBeforeDestroy?.();
          await hooks?.onDestroyed?.();
          break;
      }

      this.states.set(instance.componentId, toState);
    } catch (error) {
      this.states.set(instance.componentId, ComponentState.ERROR);
      await hooks?.onError?.(error as Error);
      throw error;
    }
  }
} 