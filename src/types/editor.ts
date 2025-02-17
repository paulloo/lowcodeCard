import type { Template as BaseTemplate, TemplateField } from './template';

// 组件类型定义
export type ComponentType = 'text' | 'image' | 'select' | 'color' | 'slider' | 'switch';

// 组件选项接口
export interface ComponentOptions {
  // 通用选项
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  
  // 文本组件选项
  multiline?: boolean;
  maxLength?: number;
  rows?: number;
  
  // 图片组件选项
  accept?: string;
  maxSize?: number;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  multiple?: boolean; // 是否支持多选
  
  // 颜色组件选项
  presetColors?: string[];
  showAlpha?: boolean;
  format?: string;
  
  // 选择组件选项
  items?: Array<{
    label: string;
    value: string | number;
  }>;
  selectStyle?: 'default' | 'button' | 'tag';
  
  // 滑块组件选项
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  
  // 开关组件选项
  checkedText?: string;
  uncheckedText?: string;
  
  // 样式选项
  width?: string;
  height?: string;
  borderRadius?: string;
  shadow?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // 分组
  group?: string;
}

// 组件样式接口
export interface ComponentStyle {
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  textAlign?: 'left' | 'center' | 'right';
  display?: string;
  alignItems?: string;
  justifyContent?: string;
}

// 编辑器组件接口
export interface EditorComponent extends TemplateField {
  style: {
    margin?: string;
    padding?: string;
    width?: string;
    textAlign?: string;
    [key: string]: any;
  };
  options: {
    items?: Array<{ label: string; value: any }>;
    placeholder?: string;
    [key: string]: any;
  };
}

// 基础字段接口
export interface BaseField {
  id: string;
  type: ComponentType;
  label: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
  hidden?: boolean;
}

// 编辑器模板接口
export interface Template extends Omit<BaseTemplate, 'fields'> {
  fields: EditorComponent[];
  styles?: Record<string, any>;
}

// 组件转换器类型
type ComponentConverter<T extends ComponentType> = {
  toEditor: (field: BaseField) => EditorComponent & { type: T };
  toField: (component: EditorComponent & { type: T }) => BaseField;
};

// 组件转换映射
export const componentConverters = {
  fromField: (field: TemplateField): EditorComponent => ({
    ...field,
    style: {},
    options: field.options || {}
  }),
  
  toField: (component: EditorComponent): TemplateField => {
    const { style, ...rest } = component;
    return rest;
  }
};

// 组件定义接口
interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  group?: string;
  defaultOptions: ComponentOptions;
  validate?: (value: any) => string | undefined;
}

// 编辑器配置类型
interface EditorConfig {
  components: EditorComponent[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
  };
  i18n: {
    locale: string;
    messages: Record<string, string>;
  };
}

// 导出 TemplateField 类型
type TemplateField = BaseField;

interface Props {
  template: Template;
  onChange: (template: Template) => void;
}

// 移除重复的导出
export type {
  BaseField,
  Template,
  ComponentConverter,
  EditorConfig,
  ComponentDefinition,
  TemplateField
}; 