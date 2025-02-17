import type {
  ComponentType,
  ComponentStyle,
  ComponentOptions,
  BaseField,
  Template as EditorTemplate
} from './editor';

export type FieldType = 
  | 'text'
  | 'image'
  | 'color'
  | 'select'
  | 'slider'
  | 'switch'
  | 'group'
  | 'layout';

export interface FieldStyle {
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

export interface SelectOption {
  label: string;
  value: string;
}

export interface TemplateFieldOptions {
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  allowAIGenerate?: boolean;
  accept?: string;
  maxSize?: number;
  presetColors?: string[];
  showAlpha?: boolean;
  items?: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  defaultValue?: string | string[];
}

export interface TemplateField {
  id: string;
  type: 'text' | 'image' | 'select' | 'color' | 'slider' | 'switch' | 'number' | 'boolean';
  label: string;
  required?: boolean;
  defaultValue?: any;
  options?: {
    items?: Array<{
      label: string;
      value: string | number;
    }>;
    min?: number;
    max?: number;
    step?: number;
  };
  style?: Record<string, any>;
}

export interface TemplateFieldGroup {
  id: string;
  label: string;
  description?: string;
  fields: TemplateField[];
  collapsed?: boolean;
}

export interface Template {
  id: string;
  name: string;
  type: 'system' | 'custom';
  thumb?: string;
  fields: TemplateField[];
  styles?: Record<string, any>;
  content?: string;
  updatedAt?: number;
}

export type TemplateValues = Record<string, any>; 