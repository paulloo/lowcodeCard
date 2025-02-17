import type { Theme } from '../theme/types';

export interface RenderContext {
  container: HTMLElement;
  data: any;
  options?: RenderOptions;
  theme?: Theme;
  plugins?: RenderPlugin[];
}

export interface RenderOptions {
  mode?: 'preview' | 'edit' | 'view';
  scale?: number;
  width?: number | string;
  height?: number | string;
  background?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  animations?: boolean;
  cache?: boolean;
}

export interface RenderResult {
  element: HTMLElement;
  destroy: () => void;
  update: (data: any) => void;
  getSize: () => { width: number; height: number };
}

export interface Renderer {
  render(context: RenderContext): Promise<RenderResult>;
  supports(data: any): boolean;
  cleanup(): void;
}

// 渲染器插件接口
export interface RenderPlugin {
  id: string;
  name: string;
  beforeRender?: (context: RenderContext) => Promise<void>;
  afterRender?: (result: RenderResult) => Promise<void>;
  onDestroy?: () => void;
} 