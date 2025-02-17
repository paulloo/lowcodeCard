import type { Template, TemplateVariables } from './TemplateManager';

export class TemplateParser {
  private static instance: TemplateParser;

  private constructor() {}

  public static getInstance(): TemplateParser {
    if (!TemplateParser.instance) {
      TemplateParser.instance = new TemplateParser();
    }
    return TemplateParser.instance;
  }

  public parseTemplate(template: Template, variables: TemplateVariables, isPreview = false): string {
    try {
      // 在预览模式下跳过变量验证，或者确保变量完整性
      if (!isPreview) {
        // 验证基本变量
        if (!variables.images || typeof variables.message !== 'string') {
          throw new Error('缺少必要的模板变量');
        }

        // 自定义验证
        if (template.validate && !template.validate(variables)) {
          throw new Error('模板变量验证失败');
        }
      }

      // 生成样式
      const styleElement = this.generateStyles(template, variables);
      
      // 解析HTML
      const htmlContent = this.parseHTML(template.html, variables);
      
      // 生成脚本
      const scriptElement = template.script 
        ? this.generateScript(template.script, variables)
        : '';

      return `
        ${styleElement}
        ${htmlContent}
        ${scriptElement}
      `;
    } catch (error) {
      console.error('模板解析错误:', error);
      throw error;
    }
  }

  private parseHTML(html: string, variables: TemplateVariables): string {
    return html.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      try {
        const value = this.getValueByPath(variables, key.trim());
        // 允许空字符串，但不允许 undefined
        if (value === undefined) {
          console.warn(`变量 ${key} 未定义，使用空字符串代替`);
          return '';
        }
        return String(value);
      } catch (error) {
        console.warn(`解析变量 ${key} 失败:`, error);
        return '';
      }
    });
  }

  private generateStyles(template: Template, variables: TemplateVariables): string {
    const { styles } = variables;
    let css = template.css;

    try {
      // 替换颜色变量
      if (styles?.colors) {
        styles.colors.forEach((color, index) => {
          css = css.replace(
            new RegExp(`var\\(--color-${index + 1}\\)`, 'g'),
            color || '#000000' // 提供默认颜色
          );
        });
      }

      return `<style>${css}</style>`;
    } catch (error) {
      console.error('生成样式失败:', error);
      return `<style>${template.css}</style>`;
    }
  }

  private generateScript(script: string, variables: TemplateVariables): string {
    try {
      const safeVariables = JSON.stringify(variables);
      return `
        <script>
          (function() {
            const variables = ${safeVariables};
            ${script}
          })();
        </script>
      `;
    } catch (error) {
      console.error('生成脚本失败:', error);
      return '';
    }
  }

  private getValueByPath(obj: any, path: string): any {
    try {
      return path.split('.').reduce((acc, part) => {
        if (acc === undefined) return undefined;
        return acc[part];
      }, obj);
    } catch (error) {
      console.error(`获取路径 ${path} 的值失败:`, error);
      return undefined;
    }
  }
} 