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

export interface TemplateEffect {
  id: string;
  name: string;
  css: string;
  preview?: string;
}

export interface TemplateStyle {
  id: string;
  name: string;
  colors: string[];
  fonts?: string[];
} 