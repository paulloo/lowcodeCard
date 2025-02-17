import { Renderer, RenderContext, RenderResult, RenderPlugin } from './types';

export class RenderManager {
  private renderers: Map<string, Renderer>;
  private globalPlugins: RenderPlugin[];

  constructor() {
    this.renderers = new Map();
    this.globalPlugins = [];
  }

  // 注册渲染器
  registerRenderer(type: string, renderer: Renderer): void {
    this.renderers.set(type, renderer);
  }

  // 注册全局插件
  registerPlugin(plugin: RenderPlugin): void {
    this.globalPlugins.push(plugin);
  }

  // 渲染内容
  async render(type: string, context: RenderContext): Promise<RenderResult> {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`No renderer found for type: ${type}`);
    }

    // 合并全局插件和上下文插件
    const plugins = [
      ...this.globalPlugins,
      ...(context.plugins || [])
    ];

    // 创建新的上下文
    const newContext = {
      ...context,
      plugins
    };

    return renderer.render(newContext);
  }

  // 清理资源
  cleanup(): void {
    this.renderers.forEach(renderer => renderer.cleanup());
    this.globalPlugins.forEach(plugin => plugin.onDestroy?.());
  }

  // 获取支持的渲染器
  getSupportedRenderers(data: any): string[] {
    const supported: string[] = [];
    this.renderers.forEach((renderer, type) => {
      if (renderer.supports(data)) {
        supported.push(type);
      }
    });
    return supported;
  }
} 