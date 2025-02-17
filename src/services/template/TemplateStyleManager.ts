import type { TemplateStyle } from '../../types/template';

export class TemplateStyleManager {
  private static instance: TemplateStyleManager;
  private styles: Map<string, TemplateStyle>;

  private constructor() {
    this.styles = new Map();
    this.initializeStyles();
  }

  public static getInstance(): TemplateStyleManager {
    if (!TemplateStyleManager.instance) {
      TemplateStyleManager.instance = new TemplateStyleManager();
    }
    return TemplateStyleManager.instance;
  }

  private initializeStyles() {
    const defaultStyles: TemplateStyle[] = [
      {
        id: 'romantic',
        name: '浪漫粉',
        colors: ['#ff69b4', '#ff1493'],
        fonts: ['Dancing Script', 'serif']
      },
      {
        id: 'elegant',
        name: '优雅紫',
        colors: ['#845EC2', '#D65DB1'],
        fonts: ['Playfair Display', 'serif']
      },
      {
        id: 'modern',
        name: '现代简约',
        colors: ['#4B4453', '#B0A8B9'],
        fonts: ['Roboto', 'sans-serif']
      }
    ];

    defaultStyles.forEach(style => {
      this.styles.set(style.id, style);
    });
  }

  public getStyle(id: string): TemplateStyle | undefined {
    return this.styles.get(id);
  }

  public getAllStyles(): TemplateStyle[] {
    return Array.from(this.styles.values());
  }

  public addStyle(style: TemplateStyle): void {
    this.styles.set(style.id, style);
  }

  public removeStyle(id: string): boolean {
    return this.styles.delete(id);
  }

  public generateStyleVariables(style: TemplateStyle): Record<string, string> {
    const variables: Record<string, string> = {};
    
    style.colors.forEach((color, index) => {
      variables[`--color-${index + 1}`] = color;
    });

    if (style.fonts?.length) {
      variables['--font-primary'] = style.fonts[0];
      if (style.fonts.length > 1) {
        variables['--font-secondary'] = style.fonts[1];
      }
    }

    return variables;
  }
} 