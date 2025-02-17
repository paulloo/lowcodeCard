import type { Template } from '../../types/template';
import { defaultTemplates } from './defaultTemplates';

export interface TemplateVariables {
  images: {
    self?: string;
    partner?: string;
    background?: string;
  };
  message: string;
  styles?: {
    colors?: string[];
    fonts?: string[];
    effects?: string[];
  };
  customData?: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  type: 'builtin' | 'custom';
  thumbnail?: string;
  variables: TemplateVariables;
  html: string;
  css: string;
  script?: string;
  validate?: (variables: TemplateVariables) => boolean;
}

export class TemplateManager {
  private static instance: TemplateManager;

  // 添加静态 getInstance 方法
  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  private templates: Template[] = [];
  private readonly STORAGE_KEY = 'valentine-card-templates';
  private initialized: boolean = false;

  constructor() {
    if (TemplateManager.instance) {
      return TemplateManager.instance;
    }
    TemplateManager.instance = this;
    this.initializeSync();
  }

  // 同步初始化，从本地存储加载模板
  private initializeSync(): void {
    try {
      if (typeof window !== 'undefined') {
        // 尝试从本地存储加载模板
        const storedTemplates = localStorage.getItem(this.STORAGE_KEY);
        
        if (storedTemplates) {
          // 如果有存储的模板，使用它们
          this.templates = JSON.parse(storedTemplates);
        } else {
          // 如果没有存储的模板，使用默认模板并保存到本地存储
          this.templates = defaultTemplates.map(template => ({
            ...template,
            type: 'custom', // 将所有模板标记为可编辑
            createdAt: Date.now(),
            updatedAt: Date.now()
          }));
          this.saveToStorage();
        }
        this.initialized = true;
      }
    } catch (error) {
      console.error('初始化模板失败:', error);
      // 如果出错，至少加载默认模板
      this.templates = [...defaultTemplates];
      this.initialized = true;
    }
  }

  // 获取模板列表
  public getTemplateList(): Template[] {
    return this.templates;
  }

  // 获取单个模板
  public getTemplate(id: string): Template | undefined {
    return this.templates.find(template => template.id === id);
  }

  // 添加模板
  public async addTemplate(templateData: Omit<Template, 'id'>): Promise<Template> {
    const template = this.normalizeTemplate({
      ...templateData,
      id: `template_${Date.now()}`,
      type: 'custom',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    this.templates.push(template);
    await this.saveToStorage();

    return template;
  }

  // 更新模板
  public async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    const existingTemplate = this.templates.find(t => t.id === id);
    if (!existingTemplate) {
      throw new Error('模板不存在');
    }

    const updatedTemplate = this.normalizeTemplate({
      ...existingTemplate,
      ...data,
      id,
      updatedAt: Date.now()
    });

    this.templates = this.templates.map(t => t.id === id ? updatedTemplate : t);
    await this.saveToStorage();

    return updatedTemplate;
  }

  // 删除模板
  public async deleteTemplate(id: string): Promise<void> {
    this.templates = this.templates.filter(t => t.id !== id);
    await this.saveToStorage();
  }

  // 重置为默认模板
  public async resetToDefault(): Promise<void> {
    this.templates = defaultTemplates.map(template => ({
      ...template,
      type: 'custom',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    await this.saveToStorage();
  }

  private async saveToStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templates));
    } catch (error) {
      console.error('保存模板失败:', error);
      throw new Error('保存模板失败');
    }
  }

  private normalizeTemplate(template: Partial<Template>): Template {
    return {
      id: template.id || `template_${Date.now()}`,
      name: template.name || '未命名模板',
      type: 'custom',
      description: template.description || '',
      fields: template.fields || [],
      variables: template.variables || {
        images: {},
        message: '',
        styles: {}
      },
      html: template.html || '',
      css: template.css || '',
      script: template.script || '',
      version: template.version || '1.0.0',
      createdAt: template.createdAt || Date.now(),
      updatedAt: template.updatedAt || Date.now()
    };
  }
} 