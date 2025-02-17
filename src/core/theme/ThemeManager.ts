interface ThemeVariable {
  name: string;
  value: string;
  type: 'color' | 'size' | 'font' | 'other';
  description?: string;
}

interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  variables: Record<string, ThemeVariable>;
  parentTheme?: string;
  rules?: Record<string, string>;
}

export class ThemeManager {
  private themes: Map<string, ThemeConfig>;
  private activeTheme: string | null = null;
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.themes = new Map();
    this.initializeStyleElement();
  }

  // 注册主题
  registerTheme(config: ThemeConfig): void {
    // 处理主题继承
    if (config.parentTheme) {
      const parent = this.themes.get(config.parentTheme);
      if (parent) {
        config.variables = {
          ...parent.variables,
          ...config.variables
        };
        config.rules = {
          ...parent.rules,
          ...config.rules
        };
      }
    }

    this.themes.set(config.id, config);
  }

  // 应用主题
  applyTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) return;

    this.activeTheme = themeId;
    this.updateStyles(theme);
  }

  // 获取主题变量
  getThemeVariable(name: string): ThemeVariable | undefined {
    const theme = this.getActiveTheme();
    return theme?.variables[name];
  }

  // 更新主题变量
  updateThemeVariable(name: string, value: string): void {
    const theme = this.getActiveTheme();
    if (!theme) return;

    theme.variables[name].value = value;
    this.updateStyles(theme);
  }

  // 获取当前主题
  getActiveTheme(): ThemeConfig | null {
    return this.activeTheme ? this.themes.get(this.activeTheme) || null : null;
  }

  private initializeStyleElement(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'theme-manager-styles';
    document.head.appendChild(this.styleElement);
  }

  private updateStyles(theme: ThemeConfig): void {
    if (!this.styleElement) return;

    // 生成CSS变量
    const variables = Object.entries(theme.variables)
      .map(([name, variable]) => `--${name}: ${variable.value};`)
      .join('\n');

    // 生成主题规则
    const rules = theme.rules 
      ? Object.entries(theme.rules)
          .map(([selector, styles]) => `${selector} { ${styles} }`)
          .join('\n')
      : '';

    this.styleElement.textContent = `
      :root {
        ${variables}
      }
      ${rules}
    `;
  }
} 