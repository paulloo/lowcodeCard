export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, IComponent>;
  private loaders: Map<ComponentType, ComponentLoader>;

  private constructor() {
    this.components = new Map();
    this.loaders = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ComponentRegistry();
    }
    return this.instance;
  }

  // 注册组件加载器
  registerLoader(type: ComponentType, loader: ComponentLoader) {
    this.loaders.set(type, loader);
  }

  // 注册组件
  async registerComponent(component: IComponent) {
    const loader = this.loaders.get(component.type);
    if (!loader) {
      throw new Error(`No loader registered for component type: ${component.type}`);
    }

    // 验证并加载组件
    await loader.load(component);
    this.components.set(component.id, component);
  }

  // 获取组件
  getComponent(id: string): IComponent | undefined {
    return this.components.get(id);
  }

  // 按类型获取组件
  getComponentsByType(type: ComponentType): IComponent[] {
    return Array.from(this.components.values())
      .filter(c => c.type === type);
  }
} 