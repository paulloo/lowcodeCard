import type { RenderContext, RenderResult, RenderPlugin } from './types';

export abstract class BaseRenderer {
  protected plugins: RenderPlugin[] = [];
  protected cache: Map<string, RenderResult> = new Map();

  constructor(plugins: RenderPlugin[] = []) {
    this.plugins = plugins;
  }

  abstract supports(data: any): boolean;

  async render(context: RenderContext): Promise<RenderResult> {
    // 检查缓存
    if (context.options?.cache) {
      const cacheKey = this.getCacheKey(context);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // 执行渲染前钩子
    await this.executePluginHooks('beforeRender', context);

    // 执行实际渲染
    const result = await this.doRender(context);

    // 执行渲染后钩子
    await this.executePluginHooks('afterRender', result);

    // 缓存结果
    if (context.options?.cache) {
      const cacheKey = this.getCacheKey(context);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  cleanup(): void {
    // 清理缓存
    this.cache.clear();
    
    // 清理插件
    this.plugins.forEach(plugin => {
      if (plugin.onDestroy) {
        plugin.onDestroy();
      }
    });

    // 清理其他资源
    this.cleanupResources();
  }

  protected abstract doRender(context: RenderContext): Promise<RenderResult>;

  protected abstract cleanupResources(): void;

  protected getCacheKey(context: RenderContext): string {
    return JSON.stringify({
      data: context.data,
      options: context.options,
      theme: context.theme
    });
  }

  private async executePluginHooks(
    hook: 'beforeRender' | 'afterRender',
    data: any
  ): Promise<void> {
    for (const plugin of this.plugins) {
      if (hook === 'beforeRender' && plugin.beforeRender) {
        await plugin.beforeRender(data);
      } else if (hook === 'afterRender' && plugin.afterRender) {
        await plugin.afterRender(data);
      }
    }
  }
} 