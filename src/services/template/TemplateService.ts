import { TemplateManager } from './TemplateManager';
import { TemplateParser } from './TemplateParser';
import type { Template, TemplateVariables, TemplateEffect, TemplateStyle } from '../../types/template';
import { TemplateEffectManager } from './TemplateEffectManager';
import { TemplateStyleManager } from './TemplateStyleManager';

export class TemplateService {
  private static instance: TemplateService;
  private manager: TemplateManager;
  private parser: TemplateParser;
  private effectManager = TemplateEffectManager.getInstance();
  private styleManager = TemplateStyleManager.getInstance();

  private constructor() {
    this.manager = new TemplateManager();
    this.parser = TemplateParser.getInstance();
  }

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  public async initialize(): Promise<void> {
    await this.manager.initialize();
  }

  public getTemplates(): Template[] {
    return this.manager.getTemplateList();
  }

  public getTemplate(id: string): Template | null {
    return this.manager.getTemplate(id);
  }

  public async addTemplate(template: Omit<Template, 'id' | 'type'>): Promise<string> {
    return this.manager.addCustomTemplate(template);
  }

  public async updateTemplate(id: string, updates: Partial<Template>): Promise<boolean> {
    return this.manager.updateTemplate(id, updates);
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    return this.manager.removeTemplate(id);
  }

  public getEffects(): TemplateEffect[] {
    return this.effectManager.getAllEffects();
  }

  public getStyles(): TemplateStyle[] {
    return this.styleManager.getAllStyles();
  }

  public renderTemplate(
    template: Template, 
    variables: TemplateVariables, 
    isPreview = false
  ): string {
    if (variables.styles?.effects?.length) {
      const effectStyles = this.effectManager.generateEffectStyles(variables.styles.effects);
      template = {
        ...template,
        css: `${template.css}\n${effectStyles}`
      };
    }

    if (variables.styles?.colors?.length) {
      const styleVars = this.styleManager.generateStyleVariables({
        id: 'custom',
        name: 'custom',
        colors: variables.styles.colors
      });
      
      const styleVarsCSS = Object.entries(styleVars)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n');

      template = {
        ...template,
        css: `:root {\n${styleVarsCSS}\n}\n${template.css}`
      };
    }

    return this.parser.parseTemplate(template, variables, isPreview);
  }

  public validateTemplate(template: Template, variables: TemplateVariables): boolean {
    try {
      this.parser.parseTemplate(template, variables);
      return true;
    } catch (error) {
      return false;
    }
  }

  public exportTemplate(id: string): string {
    return this.manager.exportTemplate(id);
  }

  public async importTemplate(templateData: any): Promise<string> {
    return this.manager.importTemplate(templateData);
  }
} 