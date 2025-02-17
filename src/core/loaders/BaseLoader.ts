import { IComponent, ComponentType } from '../types';

export interface IComponentLoader {
  type: ComponentType;
  load(component: IComponent): Promise<void>;
  unload(componentId: string): Promise<void>;
  render(component: IComponent, props: any): Promise<any>;
  validate(component: IComponent): boolean;
}

export abstract class BaseComponentLoader implements IComponentLoader {
  abstract type: ComponentType;

  async load(component: IComponent): Promise<void> {
    if (!this.validate(component)) {
      throw new Error(`Invalid ${this.type} component: ${component.id}`);
    }
    await this.loadDependencies(component);
  }

  abstract unload(componentId: string): Promise<void>;
  abstract render(component: IComponent, props: any): Promise<any>;
  
  protected abstract loadDependencies(component: IComponent): Promise<void>;
  
  validate(component: IComponent): boolean {
    return component.type === this.type 
      && typeof component.implementation.render === 'function';
  }
} 