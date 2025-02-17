// 核心类型定义
export type ComponentType = 'html' | 'react' | 'vue' | 'native';

export interface IComponent {
  id: string;
  type: ComponentType;
  name: string;
  version: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  author?: string;
  
  // 组件配置
  props: {
    [key: string]: PropConfig;
  };
  
  // 组件实现
  implementation: {
    render: (props: any) => any; // 渲染函数
    preview?: (props: any) => any; // 预览函数
    validate?: (props: any) => boolean; // 属性验证
  };
  
  // 组件元数据
  meta: {
    draggable?: boolean;
    resizable?: boolean;
    container?: boolean; // 是否可以包含其他组件
    dependencies?: string[]; // 依赖的其他组件
  };
}

// 属性配置
export interface PropConfig {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  label: string;
  required?: boolean;
  defaultValue?: any;
  validator?: (value: any) => boolean;
  options?: {
    min?: number;
    max?: number;
    step?: number;
    items?: any[];
    pattern?: string;
  };
} 