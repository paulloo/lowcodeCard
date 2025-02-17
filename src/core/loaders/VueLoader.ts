import { BaseComponentLoader } from './BaseLoader';
import { IComponent } from '../types';
import { createApp, h } from 'vue';

export class VueComponentLoader extends BaseComponentLoader {
  type = 'vue' as const;
  private vueApps: Map<string, any> = new Map();

  async render(component: IComponent, props: any) {
    const { implementation } = component;
    
    // 创建 Vue 应用实例
    const app = createApp({
      render() {
        return h(implementation.render, props);
      }
    });

    // 保存应用实例以便后续清理
    this.vueApps.set(component.id, app);
    
    // 返回挂载函数
    return (el: HTMLElement) => {
      app.mount(el);
      return () => app.unmount();
    };
  }

  async unload(componentId: string): Promise<void> {
    const app = this.vueApps.get(componentId);
    if (app) {
      app.unmount();
      this.vueApps.delete(componentId);
    }
  }

  protected async loadDependencies(component: IComponent): Promise<void> {
    // Vue 特定的依赖加载逻辑
  }

  validate(component: IComponent): boolean {
    return super.validate(component)
      && typeof component.implementation.render === 'function'
      && (!component.implementation.setup || typeof component.implementation.setup === 'function');
  }
} 