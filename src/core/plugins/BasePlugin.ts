import { IPlugin, PluginType, PluginContext } from './types';

export abstract class BasePlugin implements IPlugin {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  abstract type: PluginType;
  
  description?: string;
  author?: string;
  dependencies?: string[];
  config?: Record<string, any>;

  protected context!: PluginContext;

  async install(context: PluginContext): Promise<void> {
    this.context = context;
    await this.onInstall();
  }

  async uninstall(): Promise<void> {
    await this.onUninstall();
  }

  // 子类实现的钩子方法
  protected abstract onInstall(): Promise<void>;
  protected abstract onUninstall(): Promise<void>;

  // 工具方法
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    this.context.utils.logger[level](`[${this.name}] ${message}`);
  }

  protected getConfig<T>(key: string, defaultValue?: T): T | undefined {
    return this.config?.[key] ?? defaultValue;
  }
} 