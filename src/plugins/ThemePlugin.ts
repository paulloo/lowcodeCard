import { BasePlugin } from '../core/plugins/BasePlugin';
import { Theme } from '../core/types';

export class DarkThemePlugin extends BasePlugin {
  id = 'dark-theme';
  name = 'Dark Theme';
  version = '1.0.0';
  type = 'theme' as const;
  
  private theme: Theme = {
    id: 'dark',
    name: '深色主题',
    variables: {
      '--bg-color': '#1a1a1a',
      '--text-color': '#ffffff',
      '--primary-color': '#4a9eff',
      '--secondary-color': '#6c757d'
    },
    rules: {
      // 主题样式规则
    }
  };

  protected async onInstall(): Promise<void> {
    // 注册主题
    this.context.extensionPoints.registerTheme(this.theme);
    
    this.log('Dark theme installed');
  }

  protected async onUninstall(): Promise<void> {
    // 清理主题
    this.log('Dark theme uninstalled');
  }
} 