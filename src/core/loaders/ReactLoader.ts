import { BaseComponentLoader } from './BaseLoader';
import { IComponent } from '../types';
import { loadScript, loadStyle } from '../utils/resourceLoader';

export class ReactComponentLoader extends BaseComponentLoader {
  type = 'react' as const;
  private loadedDependencies: Set<string> = new Set();

  async render(component: IComponent, props: any) {
    const { implementation } = component;
    
    // 处理 React 特定的属性
    const reactProps = {
      ...props,
      key: props.key || component.id,
      ref: props.ref,
    };

    return implementation.render(reactProps);
  }

  async unload(componentId: string): Promise<void> {
    // 清理组件资源
    // 可能需要清理事件监听器、定时器等
  }

  protected async loadDependencies(component: IComponent): Promise<void> {
    const { dependencies = [] } = component.meta;
    
    for (const dep of dependencies) {
      if (this.loadedDependencies.has(dep)) continue;

      if (dep.endsWith('.css')) {
        await loadStyle(dep);
      } else if (dep.endsWith('.js')) {
        await loadScript(dep);
      }
      
      this.loadedDependencies.add(dep);
    }
  }

  validate(component: IComponent): boolean {
    return super.validate(component) 
      && typeof component.implementation.render === 'function'
      && (!component.implementation.onMounted || typeof component.implementation.onMounted === 'function')
      && (!component.implementation.onUnmount || typeof component.implementation.onUnmount === 'function');
  }
} 