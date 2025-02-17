import { IComponent, ComponentType } from '../types';

export interface IComponentManager {
  // 组件注册
  register(component: IComponent): Promise<void>;
  unregister(componentId: string): Promise<void>;
  
  // 组件获取
  getComponent(id: string): IComponent | undefined;
  getComponents(): IComponent[];
  getComponentsByType(type: ComponentType): IComponent[];
  getComponentsByCategory(category: string): IComponent[];
  
  // 组件验证
  validateComponent(component: IComponent): boolean;
  validateDependencies(component: IComponent): Promise<boolean>;
  
  // 组件生命周期
  initializeComponent(component: IComponent): Promise<void>;
  destroyComponent(componentId: string): Promise<void>;
  
  // 组件状态管理
  enableComponent(componentId: string): void;
  disableComponent(componentId: string): void;
  isComponentEnabled(componentId: string): boolean;
} 