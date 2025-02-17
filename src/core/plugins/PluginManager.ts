import { IPlugin, PluginContext } from './types';

export class PluginManager {
  private plugins: Map<string, IPlugin>;
  private context: PluginContext;
  private dependencyManager: ComponentDependencyManager;

  constructor(context: PluginContext) {
    this.plugins = new Map();
    this.context = context;
    this.dependencyManager = new ComponentDependencyManager();
  }

  // 注册插件
  async registerPlugin(plugin: IPlugin): Promise<void> {
    // 验证插件
    this.validatePlugin(plugin);
    
    // 检查依赖
    await this.checkDependencies(plugin);
    
    // 安装插件
    await plugin.install(this.context);
    
    // 保存插件
    this.plugins.set(plugin.id, plugin);
    
    // 添加依赖关系
    if (plugin.dependencies) {
      plugin.dependencies.forEach(depId => {
        this.dependencyManager.addDependency(plugin.id, depId);
      });
    }
  }

  // 卸载插件
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // 检查是否有其他插件依赖此插件
    const dependents = this.getDependentPlugins(pluginId);
    if (dependents.length > 0) {
      throw new Error(`Cannot uninstall plugin ${pluginId}, it is required by: ${dependents.join(', ')}`);
    }

    // 卸载插件
    await plugin.uninstall();
    this.plugins.delete(pluginId);
  }

  // 获取插件
  getPlugin(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  // 获取特定类型的插件
  getPluginsByType(type: PluginType): IPlugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.type === type);
  }

  private validatePlugin(plugin: IPlugin) {
    if (!plugin.id || !plugin.name || !plugin.version || !plugin.type) {
      throw new Error('Invalid plugin: missing required fields');
    }
    
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }
  }

  private async checkDependencies(plugin: IPlugin) {
    if (!plugin.dependencies) return;

    for (const depId of plugin.dependencies) {
      const dep = this.plugins.get(depId);
      if (!dep) {
        throw new Error(`Missing dependency: ${depId} for plugin ${plugin.id}`);
      }
    }
  }

  private getDependentPlugins(pluginId: string): string[] {
    return Array.from(this.plugins.values())
      .filter(p => p.dependencies?.includes(pluginId))
      .map(p => p.id);
  }
} 