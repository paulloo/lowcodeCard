export class Editor {
  private registry: ComponentRegistry;
  private canvas: Canvas;
  private designer: Designer;
  
  constructor() {
    this.registry = ComponentRegistry.getInstance();
    this.canvas = new Canvas();
    this.designer = new Designer();
    
    // 初始化基础设施
    this.initializeInfrastructure();
  }

  // 注册组件
  async registerComponent(component: IComponent) {
    await this.registry.registerComponent(component);
    this.designer.addComponentToToolbox(component);
  }

  // 导入组件包
  async importComponentPackage(url: string) {
    const package = await this.loadPackage(url);
    for (const component of package.components) {
      await this.registerComponent(component);
    }
  }

  // 导出页面
  async exportPage(format: 'json' | 'html' | 'react') {
    return this.canvas.export(format);
  }
} 