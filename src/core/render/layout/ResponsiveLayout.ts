export interface LayoutOptions {
  container: HTMLElement;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  padding?: number;
  columns?: number;
  autoResize?: boolean;
}

export class ResponsiveLayout {
  private options: LayoutOptions;
  private resizeObserver: ResizeObserver | null = null;
  private items: HTMLElement[] = [];

  constructor(options: LayoutOptions) {
    this.options = {
      breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      },
      gap: 16,
      padding: 16,
      columns: 12,
      autoResize: true,
      ...options
    };

    if (this.options.autoResize) {
      this.initResizeObserver();
    }
  }

  // 添加项目
  addItem(element: HTMLElement, config: {
    colSpan?: number;
    rowSpan?: number;
    breakpoints?: {
      [key: string]: { colSpan?: number; rowSpan?: number }
    }
  } = {}): void {
    element.style.gridColumn = `span ${config.colSpan || 1}`;
    if (config.rowSpan) {
      element.style.gridRow = `span ${config.rowSpan}`;
    }

    // 添加响应式类
    if (config.breakpoints) {
      Object.entries(config.breakpoints).forEach(([breakpoint, value]) => {
        const mediaQuery = this.getMediaQuery(breakpoint as keyof typeof this.options.breakpoints);
        if (mediaQuery) {
          const style = document.createElement('style');
          style.textContent = `
            @media ${mediaQuery} {
              #${element.id} {
                grid-column: span ${value.colSpan || config.colSpan || 1};
                ${value.rowSpan ? `grid-row: span ${value.rowSpan};` : ''}
              }
            }
          `;
          document.head.appendChild(style);
        }
      });
    }

    this.items.push(element);
    this.options.container.appendChild(element);
    this.updateLayout();
  }

  // 移除项目
  removeItem(element: HTMLElement): void {
    const index = this.items.indexOf(element);
    if (index > -1) {
      this.items.splice(index, 1);
      this.options.container.removeChild(element);
      this.updateLayout();
    }
  }

  // 更新布局
  private updateLayout(): void {
    const { container, gap, padding, columns } = this.options;

    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    container.style.gap = `${gap}px`;
    container.style.padding = `${padding}px`;
  }

  // 初始化响应式监听
  private initResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout();
    });
    this.resizeObserver.observe(this.options.container);
  }

  // 获取媒体查询
  private getMediaQuery(breakpoint: keyof typeof this.options.breakpoints): string {
    const width = this.options.breakpoints?.[breakpoint];
    if (!width) return '';
    return `(min-width: ${width}px)`;
  }

  // 清理资源
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.items.forEach(item => {
      if (item.parentNode === this.options.container) {
        this.options.container.removeChild(item);
      }
    });
    this.items = [];
  }
} 