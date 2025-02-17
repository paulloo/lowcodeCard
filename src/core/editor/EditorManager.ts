import type { EditorComponent, EditorConfig } from '../../types/editor';

export class EditorManager {
  private components: Map<string, EditorComponent>;
  private config: EditorConfig;
  private history: Array<Map<string, EditorComponent>>;
  private historyIndex: number;

  constructor(config: EditorConfig) {
    this.components = new Map();
    this.config = config;
    this.history = [];
    this.historyIndex = -1;

    // 初始化组件
    config.components.forEach(component => {
      this.registerComponent(component);
    });
  }

  // 获取所有组件
  public getComponents(): Map<string, EditorComponent> {
    return new Map(this.components);
  }

  // 注册组件
  private registerComponent(component: EditorComponent) {
    this.components.set(component.id, component);
    if ('children' in component && component.children) {
      component.children.forEach(child => this.registerComponent(child));
    }
  }

  // 获取组件
  public getComponent(id: string): EditorComponent | undefined {
    return this.components.get(id);
  }

  // 更新组件
  public updateComponent(id: string, updates: Partial<EditorComponent>) {
    const component = this.components.get(id);
    if (!component) return;

    // 保存历史记录
    this.saveHistory();

    // 根据组件类型进行更新
    const updatedComponent = this.mergeComponentUpdates(component, updates);
    this.components.set(id, updatedComponent);
  }

  // 合并组件更新
  private mergeComponentUpdates(
    component: EditorComponent,
    updates: Partial<EditorComponent>
  ): EditorComponent {
    // 保持原有的组件类型
    return {
      ...component,
      ...updates,
      type: component.type, // 确保类型不变
      options: {
        ...component.options,
        ...(updates.options || {})
      }
    } as EditorComponent;
  }

  // 添加组件
  public addComponent(component: EditorComponent, parentId?: string) {
    this.saveHistory();

    if (parentId) {
      const parent = this.components.get(parentId);
      if (parent && 'children' in parent) {
        const updatedParent = {
          ...parent,
          children: [...(parent.children || []), component]
        };
        this.components.set(parentId, updatedParent);
      }
    }

    this.registerComponent(component);
  }

  // 删除组件
  public removeComponent(id: string) {
    this.saveHistory();
    
    // 递归删除子组件
    const component = this.components.get(id);
    if (component && 'children' in component) {
      component.children?.forEach(child => {
        this.removeComponent(child.id);
      });
    }
    
    this.components.delete(id);
  }

  // 保存历史记录
  private saveHistory() {
    // 删除当前位置之后的历史记录
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // 添加新的历史记录
    this.history.push(new Map(this.components));
    this.historyIndex++;

    // 限制历史记录数量
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  // 撤销
  public undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.components = new Map(this.history[this.historyIndex]);
    }
  }

  // 重做
  public redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.components = new Map(this.history[this.historyIndex]);
    }
  }

  // 导出配置
  public exportConfig(): EditorConfig {
    return {
      ...this.config,
      components: Array.from(this.components.values())
    };
  }
} 