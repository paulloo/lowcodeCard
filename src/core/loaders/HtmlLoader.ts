import { BaseComponentLoader } from './BaseLoader';
import { IComponent } from '../types';
import { compileTemplate } from '../utils/templateCompiler';

export class HtmlComponentLoader extends BaseComponentLoader {
  type = 'html' as const;
  private templates: Map<string, Function> = new Map();

  async render(component: IComponent, props: any) {
    let template = this.templates.get(component.id);
    
    if (!template) {
      template = compileTemplate(component.implementation.template);
      this.templates.set(component.id, template);
    }

    const html = template(props);
    
    return (el: HTMLElement) => {
      el.innerHTML = html;
      
      // 执行组件的初始化脚本
      if (component.implementation.script) {
        const script = new Function('el', 'props', component.implementation.script);
        script(el, props);
      }
      
      // 返回清理函数
      return () => {
        el.innerHTML = '';
      };
    };
  }

  async unload(componentId: string): Promise<void> {
    this.templates.delete(componentId);
  }

  protected async loadDependencies(component: IComponent): Promise<void> {
    // HTML 组件的依赖加载逻辑
  }

  validate(component: IComponent): boolean {
    return super.validate(component)
      && typeof component.implementation.template === 'string';
  }
} 