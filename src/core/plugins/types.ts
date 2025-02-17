export type PluginType = 'component' | 'theme' | 'tool' | 'renderer' | 'validator' | 'transformer';

// 插件接口
export interface IPlugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description?: string;
  author?: string;
  
  // 插件生命周期
  install: (context: PluginContext) => Promise<void>;
  uninstall: () => Promise<void>;
  
  // 插件配置
  config?: Record<string, any>;
  
  // 依赖的其他插件
  dependencies?: string[];
}

// 插件上下文
export interface PluginContext {
  // 核心服务
  services: {
    component: ComponentRegistry;
    event: EventBus;
    theme: ThemeManager;
    i18n: I18nManager;
  };
  
  // 工具方法
  utils: {
    logger: Logger;
    storage: Storage;
    http: HttpClient;
  };
  
  // 扩展点
  extensionPoints: {
    registerComponent: (component: IComponent) => void;
    registerTheme: (theme: Theme) => void;
    registerTool: (tool: Tool) => void;
    // ...其他扩展点
  };
} 